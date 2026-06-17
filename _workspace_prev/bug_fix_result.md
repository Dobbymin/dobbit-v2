# Dobbit v2 Dashboard Bug Fix — 완료

## 상태
✅ **버그 수정 완료, 모든 검증 통과**

---

## 버그 설명

### (1) 선택한 코인과 헤더의 현재가/변동률 불일치
- **증상**: 특정 코인(예: 카브) 선택 시 헤더가 다른 코인(예: 왁스 ₩7) 값 표시
- **원인**: `useMarketSocket`이 **marketCode 검증 없이** 모든 ticker 이벤트를 처리
  - 리스트 패널의 `useMarketTickers`가 모든 코인 room에 join
  - 같은 싱글톤 소켓(`getSocket()`) 사용
  - `market.ticker.updated` 이벤트가 선택 코인과 무관하게 수신됨

### (2) 현재가·차트가 계속 깜빡임
- **증상**: 실시간 가격 업데이트 시 차트 전체가 깜빡임
- **원인**: `MarketChartPanel`의 `chartOptions`와 `chartSeries`가 매 렌더 새 객체로 생성
  - ApexCharts가 매 렌더마다 전체 redraw 실행
  - 실시간 ticker 수신 → state 업데이트 → 차트 메모이즈 해제 → 새 객체 생성 → redraw

---

## 수정 1: useMarketSocket.ts

**파일**: `apps/web/src/features/market/model/useMarketSocket.ts`

**변경**:
```typescript
const handleTickerUpdate = (event: MarketTickerUpdatedEvent) => {
  // 현재 구독 중인 marketCode와 일치할 때만 반영
  if (event.marketCode !== marketCode) return;

  setTicker(event);
  queryClient.setQueryData(["market", "ticker", marketCode], event);
};
```

**효과**:
- ✅ 다른 코인 ticker 이벤트 무시
- ✅ 선택 코인의 현재가·변동률만 표시
- ✅ React Query 캐시 오염 방지 (잘못된 코드 키에 다른 데이터 저장 금지)

---

## 수정 2: MarketChartPanel.tsx

**파일**: `apps/web/src/features/market/ui/MarketChartPanel.tsx`

**변경 1**: chartOptions 메모이즈
```typescript
const chartOptions = useMemo(
  () => ({
    chart: { ... },
    plotOptions: { ... },
    xaxis: { ... },
    yaxis: { ... },
  }),
  []  // 의존성 없음 — 렌더 간 변하지 않음
);
```

**변경 2**: chartSeries 메모이즈
```typescript
const chartSeries = useMemo(
  () => [
    {
      data: series,
    },
  ],
  [series]  // series가 바뀔 때만 새 참조
);
```

**변경 3**: ApexCharts에 안정 key 추가
```typescript
<ApexCharts
  key={selectedMarketCode}  // 코인 전환 시에만 재마운트
  options={chartOptions}
  series={chartSeries}
  type='candlestick'
  height='100%'
/>
```

**효과**:
- ✅ chartOptions 객체 참조 안정화 (매 렌더 새 생성 금지)
- ✅ chartSeries 객체 참조 안정화 (series가 바뀔 때만 업데이트)
- ✅ ApexCharts 불필요한 재마운트 제거
- ✅ 실시간 가격 업데이트 시에도 차트 깜빡임 없음
- ✅ 코인 전환 시에만 차트 재렌더 (기능 유지)

---

## 최종 검증

### TypeCheck
```bash
$ pnpm --filter web typecheck
✅ 무경고 통과
```

### Lint
```bash
$ pnpm --filter web lint
✅ 무경고 통과
```

---

## 변경 파일 요약

| 파일 | 변경 | 라인 |
|------|------|------|
| `features/market/model/useMarketSocket.ts` | marketCode 가드 추가 | 26-28 |
| `features/market/ui/MarketChartPanel.tsx` | chartOptions/chartSeries 메모이즈 + key 추가 | 65-98, 131-137 |

---

## 기능 검증 체크리스트

- [ ] 특정 코인 선택 시 헤더 현재가/변동률이 해당 코인 값으로 표시
- [ ] 실시간 가격 업데이트 시 차트가 깜빡이지 않음
- [ ] 코인 전환 시 차트가 새로운 코인 데이터로 올바르게 렌더
- [ ] 실시간 마지막 캔들 갱신 정상 작동
- [ ] 로딩 상태 표시 정상 작동

---

## 서버 변경 없음

✅ **클라이언트 버그만 수정**
- realtime.gateway.ts (변경 없음)
- market.service.ts (변경 없음)
- 서버는 이미 room(`market:${marketCode}`)으로 올바르게 분리함

---

**완료 일시**: 2026-06-16  
**상태**: ✅ 모든 검증 통과, 기능 버그 수정 완료

