# Dashboard Chart Buttons — 실제 코드 구현

**핵심**: 계획 문서가 아니라 **실제 파일을 편집**한다.

참고: `/Users/gimgangmin/Desktop/Dev/project/dobbit-v2/_workspace/chart_buttons_plan.md`

---

## 실제 구현 지시

### 단계 1: 서버 (apps/api) 파일 편집

#### 1-1. `apps/api/src/market/external/upbit-api.client.ts` 편집

현재:
```typescript
async getCandles(marketCode: string, unit = 1, count = 200): Promise<UpbitCandle[]> {
  const response = await firstValueFrom(
    this.http.get<UpbitCandle[]>(`${this.baseUrl}/candles/minutes/${unit}`, {
      params: { market: marketCode, count },
    }),
  );
  return response.data || [];
}
```

변경:
1. interface CandleInterval 추가 (위에)
2. getCandles 시그니처 변경: (marketCode, interval = { type: 'minutes', unit: 1 }, count = 200)
3. URL 분기: minutes는 `/candles/minutes/{unit}`, 나머지는 `/candles/{type}`
4. params 유지: { market, count }

#### 1-2. `apps/api/src/market/market.service.ts` 편집

현재:
```typescript
async getCandles(code: string, unit = 1, count = 200): Promise<CandleResponse[]> {
  const candles = await this.upbitApiClient.getCandles(code, unit, count);
  // ... reverse + map
}
```

변경:
1. 함수 시그니처: (code, interval = { type: 'minutes', unit: 1 }, count = 200)
2. upbitApiClient.getCandles 호출: (code, interval, count)
3. reverse/map 로직 유지

#### 1-3. `apps/api/src/market/market.controller.ts` 편집

현재:
```typescript
@Get('markets/:code/candles')
async getCandles(
  @Param('code') code: string,
  @Query('unit') unit: string = '1',
  @Query('count') count: string = '200',
): Promise<CandleResponse[]> {
  return this.marketService.getCandles(code, parseInt(unit, 10), parseInt(count, 10));
}
```

변경:
1. Query 파라미터 추가: type, unit, count
2. 화이트리스트 검증:
   - validTypes = ['seconds', 'minutes', 'weeks', 'months', 'years']
   - validMinutesUnits = [1, 5, 30, 60]
   - 잘못된 type → 'minutes' 폴백
   - minutes일 때만 unit 검증
3. marketService.getCandles 호출: (code, { type, unit }, count)

---

### 단계 2: 클라이언트 (apps/web) 파일 생성

#### 2-1. `apps/web/src/features/market/model/libs/candle-intervals.ts` 신규 생성

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

export const DEFAULT_CANDLE_INTERVAL: CandleInterval = {
  label: '1시간',
  type: 'minutes',
  unit: 60,
};
```

#### 2-2. `apps/web/src/features/market/model/libs/sma-calculator.ts` 신규 생성

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

#### 2-3. `apps/web/src/features/market/model/libs/index.ts` 신규 생성

```typescript
export * from './candle-intervals';
export * from './sma-calculator';
```

---

### 단계 3: 클라이언트 파일 편집

#### 3-1. `apps/web/src/features/market/api/market.api.ts` 편집

현재:
```typescript
export const getCandlesApi = (marketCode: string, unit: number = 1, count: number = 200): Promise<CandleResponse[]> =>
  apiClient<CandleResponse[]>(`/market/markets/${encodeURIComponent(marketCode)}/candles?unit=${unit}&count=${count}`);
```

변경:
1. import CandleInterval, DEFAULT_CANDLE_INTERVAL 추가
2. getCandlesApi 시그니처: (marketCode, interval = DEFAULT_CANDLE_INTERVAL, count = 200)
3. URLSearchParams로 query 구성:
   - type: interval.type
   - unit: interval.unit (undefined면 추가하지 않음)
   - count
4. URL: `/market/markets/${...}/candles?${params.toString()}`

#### 3-2. `apps/web/src/features/market/model/market-query-keys.ts` 편집

현재:
```typescript
const candles = (code: string, unit: number) =>
  [market, 'candles', code, unit] as const;
```

변경:
```typescript
const candles = (code: string, interval: CandleInterval) =>
  [market, 'candles', code, interval.type, interval.unit ?? 'none'] as const;
```

#### 3-3. `apps/web/src/features/market/model/useCandles.ts` 편집

현재:
```typescript
export const useCandles = (marketCode?: string, unit: number = 1) => {
  return useQuery({
    queryKey: marketKeys.candles(marketCode ?? "", unit),
    queryFn: () => getCandlesApi(marketCode ?? "", unit),
    enabled: Boolean(marketCode),
    staleTime: 10_000,
  });
};
```

변경:
1. import CandleInterval, DEFAULT_CANDLE_INTERVAL 추가
2. useCandles 시그니처: (marketCode?, interval = DEFAULT_CANDLE_INTERVAL)
3. queryKey, queryFn 수정

#### 3-4. `apps/web/src/features/market/ui/MarketChartPanel.tsx` 편집 (큰 변경)

1. import 추가:
   - `{ useState } from 'react'`
   - `CandleInterval, CANDLE_INTERVALS, DEFAULT_CANDLE_INTERVAL` (candle-intervals 파일에서)
   - `calculateSMA` (sma-calculator에서)
   - `Popover, PopoverContent, PopoverTrigger` (shared/components/ui)

2. 컴포넌트 내부:
   - state 추가: `selectedInterval`, `chartType`, `indicators`
   - useCandles 호출 수정: (selectedMarketCode, selectedInterval)
   - ApexCharts key 수정: `${selectedMarketCode}-${selectedInterval.type}-${selectedInterval.unit}`

3. 시간 단위 버튼 섹션 변경:
   ```tsx
   {CANDLE_INTERVALS.map((interval) => (
     <button
       key={`${interval.type}-${interval.unit ?? 'none'}`}
       onClick={() => setSelectedInterval(interval)}
       data-active={
         selectedInterval.type === interval.type &&
         (selectedInterval.unit ?? 0) === (interval.unit ?? 0)
       }
       className='...'
     >
       {interval.label}
     </button>
   ))}
   ```

4. 지표/차트설정 버튼 추가:
   - "지표" Popover: MA/Volume 체크박스
   - "차트설정" Popover: 캔들/라인 라디오

5. chartOptions 메모이즈 수정: chartType 의존성 추가
6. 차트 series 로직:
   - MA 활성화 시 calculateSMA(7/20/60) → line series 추가
   - Volume 활성화 시 candleAccTradeVolume 막대 추가 (범위 한정: 구현 여부 판단)

---

### 단계 4: 배럴 export 규칙

`apps/web/src/features/market/model/index.ts` 편집:
```typescript
export * from './libs';
// 기존 export 유지
```

---

## 검증

```bash
pnpm --filter web typecheck
pnpm --filter web lint
pnpm --filter api typecheck (또는 build)
```

---

## 완료 기준 (코드로 확인)

- [ ] 시간 단위 8개 버튼 클릭 시 캔들 로드 (network tab에서 ?type=&unit= query 확인)
- [ ] 지표 Popover 토글 (MA line series 시각적 확인)
- [ ] 차트설정 Popover 전환 (candlestick ↔ line 타입 변경)
- [ ] typecheck/lint 무경고
- [ ] 기존 기능 회귀 없음

---

**Codex: 위 지시에 따라 실제 파일을 편집한다. 계획이 아니라 코드다.**

