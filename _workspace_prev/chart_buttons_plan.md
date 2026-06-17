# Dobbit v2 Dashboard Chart Buttons — 구현 계획

**목표**: 차트 상단의 시간단위 버튼(1초~년) + 지표(MA/Volume) + 차트설정(캔들/라인) 모두 동작하게 구현

**범위**: Client(apps/web) + Server(apps/api) 양쪽 작업

---

## A. 캔들 시간 단위 8종 구현

### A-1. 서버: `apps/api/src/market/external/upbit-api.client.ts`

**목표**: `getCandles` 메서드를 시간 단위 일반화

**변경**:
```typescript
interface CandleInterval {
  type: 'seconds' | 'minutes' | 'weeks' | 'months' | 'years';
  unit?: number;
}

async getCandles(
  marketCode: string,
  interval: CandleInterval = { type: 'minutes', unit: 1 },
  count: number = 200
): Promise<UpbitCandle[]> {
  try {
    let url = `${this.baseUrl}/candles`;
    
    if (interval.type === 'minutes') {
      url += `/minutes/${interval.unit ?? 1}`;
    } else {
      url += `/${interval.type}`;
    }
    
    const response = await firstValueFrom(
      this.http.get<UpbitCandle[]>(url, {
        params: { market: marketCode, count },
      }),
    );
    return response.data || [];
  } catch (error) {
    console.error(`Failed to fetch ${interval.type} candles:`, error);
    return [];
  }
}
```

**완료 기준**:
- [ ] CandleInterval 인터페이스 정의
- [ ] minutes: `/candles/minutes/{unit}`, 나머지: `/candles/{type}` 분기
- [ ] typecheck 통과

---

### A-2. 서버: `apps/api/src/market/market.service.ts`

**목표**: `getCandles` 시그니처 확장, interval 전달

**변경**:
```typescript
async getCandles(
  code: string,
  interval: CandleInterval = { type: 'minutes', unit: 1 },
  count: number = 200
): Promise<CandleResponse[]> {
  try {
    const candles = await this.upbitApiClient.getCandles(code, interval, count);
    // ... 나머지 reverse/map 로직 유지
    return candles.reverse().map(c => ({ ... }));
  } catch (error) {
    this.logger.error(`Failed to get candles for ${code}:`, error);
    return [];
  }
}
```

**완료 기준**:
- [ ] interval 파라미터 추가
- [ ] upbitApiClient.getCandles 호출 수정
- [ ] reverse/map 로직 유지

---

### A-3. 서버: `apps/api/src/market/market.controller.ts`

**목표**: `getCandles` query 확장, type/unit 화이트리스트 검증

**변경**:
```typescript
@Get('markets/:code/candles')
async getCandles(
  @Param('code') code: string,
  @Query('type') type: string = 'minutes',
  @Query('unit') unit: string = '1',
  @Query('count') count: string = '200',
): Promise<CandleResponse[]> {
  // 화이트리스트 검증
  const validTypes = ['seconds', 'minutes', 'weeks', 'months', 'years'];
  const validMinutesUnits = [1, 5, 30, 60];
  
  const candleType = validTypes.includes(type) ? type : 'minutes';
  let candleUnit = parseInt(unit, 10) || 1;
  
  if (candleType === 'minutes') {
    candleUnit = validMinutesUnits.includes(candleUnit) ? candleUnit : 1;
  }
  
  const candleCount = Math.min(parseInt(count, 10) || 200, 500);
  
  return this.marketService.getCandles(code, 
    { type: candleType as any, unit: candleUnit },
    candleCount
  );
}
```

**완료 기준**:
- [ ] type query 추가 (기본 'minutes')
- [ ] unit query 확장 (기본 '1')
- [ ] 화이트리스트 검증 (type, minutes unit)
- [ ] 잘못된 값 폴백
- [ ] 기존 호환성 유지 (type 미지정 → 'minutes')

---

### A-4. 클라: `apps/web/src/features/market/model/libs/` 신규 파일

**파일**: `candle-intervals.ts`

**내용**:
```typescript
export type CandleInterval = {
  label: string;
  type: 'seconds' | 'minutes' | 'weeks' | 'months' | 'years';
  unit?: number;
};

export const CANDLE_INTERVALS: CandleInterval[] = [
  { label: '1초', type: 'seconds' },
  { label: '1분', type: 'minutes', unit: 1 },
  { label: '5분', type: 'minutes', unit: 5 },
  { label: '30분', type: 'minutes', unit: 30 },
  { label: '1시간', type: 'minutes', unit: 60 },
  { label: '주', type: 'weeks' },
  { label: '달', type: 'months' },
  { label: '년', type: 'years' },
];

// 기본값: 1시간 (현재 차트가 '1시간'으로 표시되므로 통일)
export const DEFAULT_CANDLE_INTERVAL: CandleInterval = {
  label: '1시간',
  type: 'minutes',
  unit: 60,
};
```

**배럴**: `apps/web/src/features/market/model/index.ts`에 export 추가

**완료 기준**:
- [ ] CandleInterval 타입 정의
- [ ] CANDLE_INTERVALS 배열 8개 모두 정의
- [ ] DEFAULT_CANDLE_INTERVAL = 1시간(minutes/60)

---

### A-5. 클라: `apps/web/src/features/market/api/market.api.ts`

**변경**:
```typescript
export const getCandlesApi = (
  marketCode: string,
  interval: CandleInterval = DEFAULT_CANDLE_INTERVAL,
  count: number = 200
): Promise<CandleResponse[]> => {
  const params = new URLSearchParams();
  params.set('type', interval.type);
  params.set('count', String(count));
  
  if (interval.unit !== undefined) {
    params.set('unit', String(interval.unit));
  }
  
  return apiClient<CandleResponse[]>(
    `/market/markets/${encodeURIComponent(marketCode)}/candles?${params.toString()}`
  );
};
```

**완료 기준**:
- [ ] interval 파라미터 추가
- [ ] query: type, unit(minutes만), count 구성
- [ ] URLSearchParams 사용

---

### A-6. 클라: `apps/web/src/features/market/model/market-query-keys.ts`

**변경**:
```typescript
const candles = (code: string, interval: CandleInterval) =>
  [market, 'candles', code, interval.type, interval.unit ?? 'none'] as const;
```

**완료 기준**:
- [ ] queryKey에 type + unit 포함
- [ ] unit undefined 시 'none' 사용

---

### A-7. 클라: `apps/web/src/features/market/model/useCandles.ts`

**변경**:
```typescript
export const useCandles = (marketCode?: string, interval: CandleInterval = DEFAULT_CANDLE_INTERVAL) => {
  return useQuery({
    queryKey: marketKeys.candles(marketCode ?? "", interval),
    queryFn: () => getCandlesApi(marketCode ?? "", interval),
    enabled: Boolean(marketCode),
    staleTime: 10_000,
  });
};
```

**완료 기준**:
- [ ] interval 파라미터 추가
- [ ] getCandlesApi에 interval 전달
- [ ] queryKey 수정
- [ ] enabled/staleTime 유지

---

### A-8. 클라: `apps/web/src/features/market/ui/MarketChartPanel.tsx`

**변경**:
```typescript
const MarketChartPanel = ({ ... }) => {
  const [selectedInterval, setSelectedInterval] = useState<CandleInterval>(DEFAULT_CANDLE_INTERVAL);
  
  // 캔들 데이터 로드
  const candlesQuery = useCandles(selectedMarketCode, selectedInterval);
  
  // ... 나머지 시리즈/옵션 로직 유지
  
  return (
    <section>
      <header>...</header>
      
      <div className='flex flex-wrap items-center gap-2 border-b border-white/10 px-5 py-2'>
        {CANDLE_INTERVALS.map((interval) => (
          <button
            key={`${interval.type}-${interval.unit ?? 'none'}`}
            onClick={() => setSelectedInterval(interval)}
            data-active={
              selectedInterval.type === interval.type &&
              (selectedInterval.unit ?? 0) === (interval.unit ?? 0)
            }
            className='h-7 rounded px-2 text-xs font-medium ... data-[active=true]:bg-white/10 ...'
          >
            {interval.label}
          </button>
        ))}
      </div>
      
      <div className='min-h-0 flex-1 px-5 py-4'>
        <ApexCharts
          key={`${selectedMarketCode}-${selectedInterval.type}-${selectedInterval.unit ?? 'none'}`}
          options={chartOptions}
          series={chartSeries}
          type='candlestick'
          height='100%'
        />
      </div>
    </section>
  );
};
```

**완료 기준**:
- [ ] selectedInterval state (기본 DEFAULT_CANDLE_INTERVAL)
- [ ] useCandles(selectedMarketCode, selectedInterval)
- [ ] CANDLE_INTERVALS.map으로 버튼 렌더
- [ ] data-active 비교로직 (type + unit 모두 일치)
- [ ] ApexCharts key = `${code}-${type}-${unit}`
- [ ] 기존 실시간 ticker 갱신·깜빡임 수정 유지

---

## B. 지표(MA + Volume) 구현

### B-1. 클라: `apps/web/src/features/market/model/libs/` 신규 파일

**파일**: `sma-calculator.ts` (Simple Moving Average)

**내용**:
```typescript
export const calculateSMA = (prices: number[], period: number): (number | null)[] => {
  const sma = Array(prices.length).fill(null);
  
  for (let i = period - 1; i < prices.length; i++) {
    const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    sma[i] = sum / period;
  }
  
  return sma;
};
```

**완료 기준**:
- [ ] 기간 7/20/60 계산 가능 (파라미터)
- [ ] 초기 null 값 처리
- [ ] 테스트 용이한 순수 함수

---

### B-2. 클라: `apps/web/src/features/market/ui/MarketChartPanel.tsx` (수정)

**state 추가**:
```typescript
const [indicators, setIndicators] = useState({ ma: false, volume: false });
```

**ApexCharts 로직 수정**:
```typescript
const chartSeries = useMemo(() => {
  let series = [{ name: 'Candles', data: candlestickData }];
  
  // MA 추가
  if (indicators.ma && candlesQuery.data) {
    const closes = candlesQuery.data.map(c => c.tradePrice);
    
    series.push({
      name: 'MA7',
      type: 'line',
      data: calculateSMA(closes, 7).map((v, i) => v ? [dates[i], v] : null),
    });
    series.push({
      name: 'MA20',
      type: 'line',
      data: calculateSMA(closes, 20).map((v, i) => v ? [dates[i], v] : null),
    });
    series.push({
      name: 'MA60',
      type: 'line',
      data: calculateSMA(closes, 60).map((v, i) => v ? [dates[i], v] : null),
    });
  }
  
  return series;
}, [candlesQuery.data, indicators.ma, ...]);
```

**지표 Popover 렌더**:
```tsx
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui";

<Popover>
  <PopoverTrigger asChild>
    <button>지표</button>
  </PopoverTrigger>
  <PopoverContent>
    <label className='flex items-center gap-2'>
      <input
        type='checkbox'
        checked={indicators.ma}
        onChange={(e) => setIndicators({...indicators, ma: e.target.checked})}
      />
      이동평균선
    </label>
    <label className='flex items-center gap-2'>
      <input
        type='checkbox'
        checked={indicators.volume}
        onChange={(e) => setIndicators({...indicators, volume: e.target.checked})}
      />
      거래량
    </label>
  </PopoverContent>
</Popover>
```

**완료 기준**:
- [ ] indicators state 추가
- [ ] MA 계산/렌더 (7/20/60)
- [ ] Popover 토글 UI
- [ ] MA 토글 시 line series 추가/제거

---

## C. 차트설정(캔들/라인) 구현

### C-1. 클라: `apps/web/src/features/market/ui/MarketChartPanel.tsx` (수정)

**state 추가**:
```typescript
const [chartType, setChartType] = useState<'candlestick' | 'line'>('candlestick');
```

**chartOptions 수정**:
```typescript
const chartOptions = useMemo(() => ({
  chart: {
    type: chartType as const,
    // ... 나머지
  },
  // ...
}), [chartType]);
```

**차트설정 Popover 렌더**:
```tsx
<Popover>
  <PopoverTrigger asChild>
    <button>차트설정</button>
  </PopoverTrigger>
  <PopoverContent>
    <label className='flex items-center gap-2'>
      <input
        type='radio'
        name='chartType'
        value='candlestick'
        checked={chartType === 'candlestick'}
        onChange={(e) => setChartType(e.target.value as any)}
      />
      캔들
    </label>
    <label className='flex items-center gap-2'>
      <input
        type='radio'
        name='chartType'
        value='line'
        checked={chartType === 'line'}
        onChange={(e) => setChartType(e.target.value as any)}
      />
      라인
    </label>
  </PopoverContent>
</Popover>
```

**완료 기준**:
- [ ] chartType state
- [ ] Popover 라디오 버튼
- [ ] ApexCharts type 전환

---

## D. UI 컴포넌트 확인/추가

**확인 사항**:
- [ ] `shared/components/ui/popover.tsx` 존재 확인
  - 없으면: `pnpm dlx shadcn@latest add popover --cwd apps/web`
  - 배럴(`shared/components/ui/index.ts`)에 export 추가

**완료 기준**:
- [ ] Popover/PopoverContent/PopoverTrigger 모두 사용 가능

---

## E. 배럴 export 규칙

**파일들**:
- `apps/web/src/features/market/model/index.ts`: libs 파일들 export 추가
- `apps/web/src/features/market/ui/index.ts`: MarketChartPanel export 확인

**완료 기준**:
- [ ] `export * from './libs'`
- [ ] `export * from './candle-intervals'` (또는 상위에서 처리)

---

## 최종 검증

```bash
pnpm --filter api typecheck (또는 build)
pnpm --filter web typecheck
pnpm --filter web lint
```

**체크리스트**:
- [ ] 시간단위 8개 버튼 클릭 시 캔들 로드
- [ ] 지표 Popover: MA/Volume 토글 (MA는 7/20/60 라인 오버레이, Volume은 하단 막대)
- [ ] 차트설정 Popover: 캔들/라인 전환
- [ ] 기존 기능 회귀 없음 (실시간 ticker, 깜빡임 수정)
- [ ] typecheck/lint 무경고

---

**완료 후**: 변경 파일 목록 + 검증 결과 보고

plan_ready
