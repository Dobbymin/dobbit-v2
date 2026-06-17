# Phase 2 작업 계획: 프론트 차트 실시간 렌더링 + 로고 + 폰트 + vitest

**마일스톤**: Phase 2 (풀스택 작업의 두 번째 단계 - 프론트엔드 + 테스트)
**상태**: 백엔드(api)는 Phase 1에서 완료됨. 프론트엔드(web) 미완성.
**목표**: 캔들 차트를 실시간 WebSocket과 연동한 ApexCharts 캔들스틱으로 교체, 로고 적용, 폰트 확인, vitest 단위테스트 추가

---

## 1. 현재 상태

### 백엔드 (apps/api) — Phase 1 완료
- REST API 구현: 
  - GET /api/market/markets/:code/candles?unit=1&count=200 → CandleResponse[]
  - GET /api/market/markets/:code/price → CurrentPrice
- WebSocket 구현:
  - 클라 emit("market:join", { marketCode })
  - 서버 emit("market.ticker.updated", MarketTickerUpdatedEvent)
- 백엔드는 변경 금지. 이 계약이 확정됨.

### 프론트엔드 (apps/web) — Phase 2 진행 중
- 구조: FSD (Feature-Sliced Design)
  - src/features/market/ — 마켓 기능
  - src/widgets/header/ — 헤더 위젯
  - src/views/home/ — HomePage
  - src/shared/ — 공유 타입, API, 유틸

**현재 미완성 항목:**
1. ❌ 캔들 API 미추가 (getCandlesApi)
2. ❌ 캔들 쿼리 미추가 (useCandles hook)
3. ❌ 차트 목업 상태 (SVG 정적 차트, 실시간 아님)
4. ❌ 로고 목업 상태 (CSS grid)
5. ❌ 테스트 환경 미구성 (vitest)

---

## 2. 작업 분해

### A. 캔들 API + 쿼리 (apps/web/src/features/market)

#### A1. getCandlesApi 추가
**파일**: `src/features/market/api/market.api.ts`
**입력**: 기존 market.api.ts (getMarketsApi, getTickerApi 있음)
**작업**:
1. getCandleResponse import from @dobbit/shared
2. getCandlesApi(marketCode: string, unit = 1, count = 200): Promise<CandleResponse[]> 함수 추가
3. 경로: `/market/markets/${encodeURIComponent(marketCode)}/candles?unit=${unit}&count=${count}`
4. export 추가

**검증 기준**:
- [ ] getCandlesApi 함수 존재 및 호출 가능
- [ ] CandleResponse 타입 import 확인
- [ ] apiClient 사용 패턴 유지
- [ ] 기존 함수(getMarketsApi, getTickerApi) 영향 없음

#### A2. 쿼리 키 추가
**파일**: `src/features/market/model/market-query-keys.ts`
**입력**: 기존 market-query-keys.ts (marketKeys.all, list, ticker 있음)
**작업**:
1. marketKeys.candles(code: string, unit: number = 1): QueryKey 추가
2. 형식: ["market", "candles", code, unit]

**검증 기준**:
- [ ] marketKeys.candles 함수 정의
- [ ] 기존 패턴(all, list, ticker) 유지

#### A3. useCandles 훅 신규
**파일**: `src/features/market/model/useCandles.ts` (신규)
**입력**: 없음
**작업**:
1. useCandles(marketCode?: string, unit = 1): useQuery<CandleResponse[]>
2. enabled: Boolean(marketCode)
3. staleTime: 10_000 (10초)
4. queryKey: marketKeys.candles(marketCode!, unit)
5. queryFn: () => getCandlesApi(marketCode!, unit)
6. model/index.ts에 export 추가

**검증 기준**:
- [ ] useCandles 훅 동작 가능 (마켓코드 입력 시)
- [ ] model/index.ts에서 import 가능
- [ ] 타입: CandleResponse[] 정확

---

### B. 차트 실시간 렌더 (apps/web/src/features/market)

#### B1. 순수 함수 분리 (lib)
**파일**: `src/features/market/model/libs/candle-series.ts` (신규)
**입력**: 없음
**작업**:
1. toCandleSeries(candles: CandleResponse[]): ApexCharts series format
   - 입력: CandleResponse[]
   - 출력: { x: Date, y: [open, high, low, close] }[]
   - candleDateTime → Date 변환, 가격들을 y 배열로

2. updateLastCandleWithTicker(series: any[], tradePrice: number): any[]
   - 마지막 candle의 close = tradePrice
   - high = max(현재 high, tradePrice)
   - low = min(현재 low, tradePrice)
   - 반환: 수정된 series

3. export 모두 추가 (테스트 대상)

**검증 기준**:
- [ ] toCandleSeries 함수 순수 (외부 상태 변경 없음)
- [ ] updateLastCandleWithTicker 함수 순수
- [ ] 두 함수 모두 export
- [ ] candleDateTime 파싱 정확

#### B2. MarketChartPanel 교체
**파일**: `src/features/market/ui/MarketChartPanel.tsx`
**입력**: 기존 MarketChartPanel (SVG 목업 차트)
**작업**:
1. "use client" 유지
2. react-apexcharts import
   - dynamic(() => import("react-apexcharts"), { ssr: false }) 사용 (SSR 회피)
3. useCandles(selectedMarketCode) 호출 → 초기 캔들 로드
4. useMarketSocket(selectedMarketCode) 호출 → 실시간 ticker 구독
5. toCandleSeries(candles) + updateLastCandleWithTicker(series, ticker.tradePrice) 조합
6. ApexCharts candlestick 차트 렌더
   - series 데이터
   - type: "candlestick"
   - options: 기본 설정 (자세함 최소화)
7. 헤더 가격/변동률: socket ticker 우선, 없으면 prop ticker, 없으면 fallback
8. 색상: text-increase (상승 빨강), text-decrease (하락 파랑) 유지
9. 로딩 상태: isLoading prop 반영
10. 기존 레이아웃 유지 (min-h-[560px], border-b, px-5 py-4 등)

**검증 기준**:
- [ ] 차트 렌더링 (캔들 보임)
- [ ] 실시간 업데이트 (socket ticker로 마지막 캔들 갱신)
- [ ] 색상 표기 (증감 톤 정확)
- [ ] 빌드 에러 없음

#### B3. HomePage 최소 변경
**파일**: `src/views/home/HomePage.tsx`
**입력**: 기존 HomePage (MarketChartPanel 호출)
**작업**:
1. MarketChartPanel props 그대로 유지 (selectedMarketCode, market, ticker, isLoading)
2. 필요시 불필요한 prop 제거 (선택)
3. 빌드/타입 깨지지 않도록 호출부 조정

**검증 기준**:
- [ ] HomePage 빌드 가능
- [ ] 타입 일치
- [ ] MarketChartPanel 정상 호출

---

### C. 로고 교체 (apps/web/src/widgets/header)

#### C1. LogoButton 이미지 로고 적용
**파일**: `src/widgets/header/ui/LogoButton.tsx`
**입력**: 기존 LogoButton (CSS grid 목업 아이콘)
**작업**:
1. grid 목움 아이콘 제거 (5개 span 요소 삭제)
2. next/image Image 컴포넌트 import
3. <Image src="/logo.svg" alt="Dobbit" width={24} height={24} priority />
4. "Dobbit" 텍스트 라벨 유지
5. 링크(ROUTES_PATH.HOME) 유지
6. 레이아웃(flex, gap, items-center) 유지

**검증 기준**:
- [ ] 로고 이미지 렌더 (public/logo.svg 참조)
- [ ] "Dobbit" 라벨 보임
- [ ] 링크 동작 (ROUTES_PATH.HOME)
- [ ] 레이아웃 정렬 (gap, items-center)

---

### D. 폰트 확인 (apps/web/app)

#### D1. 폰트 상태 점검
**파일**: `app/layout.tsx`, `app/globals.css`
**입력**: 기존 폰트 설정
**작업**:
1. layout.tsx에서 Roboto, Noto_Sans 선언 확인
   - CSS 변수: --font-roboto, --font-noto-sans
2. globals.css @theme inline에서 --font-sans: var(--font-noto-sans) 확인
3. Tailwind v4에서 body가 기본 sans(noto-sans) 사용하는지 확인
4. 정상이면 변경 없음
5. 비정상이면 최소한으로만 보정 (예: body { @apply font-sans; })

**검증 기준**:
- [ ] 폰트 변수 정의 확인 (layout.tsx에서)
- [ ] globals.css에서 --font-sans 매핑 확인
- [ ] body 렌더링 시 noto-sans 적용 확인 (DevTools)
- [ ] 정상이면 변경 불필요, 비정상이면 body { @apply font-sans; } 추가

---

### E. 테스트 환경 구축 및 단위테스트

#### E1. apps/web vitest 도입
**파일**: `apps/web/package.json`, `apps/web/vitest.config.ts` (신규)
**입력**: 기존 package.json
**작업**:
1. devDependencies 추가:
   - vitest
   - vite-tsconfig-paths (또는 @vitejs/plugin-react)
2. vitest.config.ts 신규:
   ```typescript
   import { defineConfig } from 'vitest/config';
   import tsconfigPaths from 'vite-tsconfig-paths';

   export default defineConfig({
     plugins: [tsconfigPaths()],
     test: {
       environment: 'node',  // jsdom 불필요 (순수 함수)
       globals: true,
     },
     resolve: {
       alias: {
         '@': '/src',
         '@dobbit/shared': '/packages/shared/src',
       },
     },
   });
   ```
3. package.json scripts 추가: `"test": "vitest run"`

**검증 기준**:
- [ ] vitest 설치 완료
- [ ] vitest.config.ts 생성
- [ ] pnpm --filter web test 실행 가능
- [ ] 테스트 발견 가능

#### E2. apps/web 단위테스트 (candle-series)
**파일**: `apps/web/__tests__/candle-series.test.ts` (신규)
**입력**: model/libs/candle-series.ts
**작업**:
1. describe("toCandleSeries", () => {
   - 테스트 1: CandleResponse[] → series 변환 (3개 샘플 캔들)
   - 테스트 2: candleDateTime 문자열 → Date 변환
   - 테스트 3: y 배열 [open, high, low, close] 정확

2. describe("updateLastCandleWithTicker", () => {
   - 테스트 1: 마지막 candle의 close 갱신
   - 테스트 2: tradePrice > high → high 갱신
   - 테스트 3: tradePrice < low → low 갱신
   - 테스트 4: series 길이 변경 없음

3. 픽스처: CandleResponse[] 샘플 (최소 3개)

**검증 기준**:
- [ ] 모든 테스트 PASS
- [ ] pnpm --filter web test 통과

#### E3. apps/api vitest 도입
**파일**: `apps/api/package.json`, `apps/api/vitest.config.ts` (신규)
**입력**: 기존 package.json
**작업**:
1. devDependencies 추가:
   - vitest
2. vitest.config.ts 신규:
   ```typescript
   import { defineConfig } from 'vitest/config';
   import tsconfigPaths from 'vite-tsconfig-paths';

   export default defineConfig({
     plugins: [tsconfigPaths()],
     test: {
       environment: 'node',
       globals: true,
     },
     resolve: {
       alias: {
         '@dobbit/shared': '/packages/shared/src',
       },
     },
   });
   ```
3. package.json scripts 추가: `"test": "vitest run"`

**검증 기준**:
- [ ] vitest 설치 완료
- [ ] vitest.config.ts 생성
- [ ] pnpm --filter api test 실행 가능

#### E4. apps/api 단위테스트 (MarketService)
**파일**: `apps/api/__tests__/market.service.test.ts` (신규)
**입력**: src/market/market.service.ts
**작업**:
1. describe("MarketService", () => {
   - setup: new MarketService(fakeUpbitClient, fakePrisma) (Nest DI 불필요)
   - 테스트 1: getMarkets(quote='KRW') → Market[] 필터+매핑
   - 테스트 2: getCandles(marketCode, unit) → CandleResponse[] (reverse, 필드 매핑)
   - 테스트 3: getTickerEvents(tickerData) → MarketTickerUpdatedEvent
   - 테스트 4: getCurrentPrice(priceData) → CurrentPrice

2. 픽스처: fakeUpbitClient, fakePrisma stub

**검증 기준**:
- [ ] 모든 테스트 PASS
- [ ] pnpm --filter api test 통과

#### E5. turbo.json test 태스크 추가 (선택)
**파일**: `turbo.json`
**입력**: 기존 turbo.json (build, lint, check-types, dev 있음)
**작업**:
1. test 태스크가 없으면 추가:
   ```json
   "test": {
     "dependsOn": ["^build"]
   }
   ```
2. 있으면 그대로 유지

**검증 기준**:
- [ ] pnpm --filter web test 동작
- [ ] pnpm --filter api test 동작

---

## 3. 작업 의존성 및 순서

### 순차 실행 (의존성 있음)
```
1. A1 (getCandlesApi) → 독립
2. A2 (쿼리 키) → A1 완료 후
3. A3 (useCandles 훅) → A2 완료 후
4. B1 (순수 함수) → 독립
5. B2 (MarketChartPanel) → A3 + B1 완료 후
6. B3 (HomePage 최소 변경) → B2 완료 후
7. C1 (LogoButton) → 독립
8. D1 (폰트 확인) → 독립
9. E1 (web vitest) → 독립
10. E2 (web 테스트) → E1 + B1 완료 후
11. E3 (api vitest) → 독립
12. E4 (api 테스트) → E3 완료 후
13. E5 (turbo.json) → 선택
```

### 병렬 가능 (독립)
- A1, B1, C1, D1, E1, E3 동시 시작 가능
- 각 그룹의 의존성 종료 후 다음 단계

---

## 4. 최종 검증 (모두 PASS 필수)

**작업 완료 후 반드시 실행:**
```bash
pnpm --filter web typecheck      # tsc --noEmit
pnpm --filter web lint            # eslint
pnpm --filter web test            # vitest
pnpm --filter api test            # vitest
pnpm --filter api build           # nest build
pnpm --filter web format          # prettier --write
pnpm --filter web format:check    # prettier --check
```

**검증 기준**:
- [ ] 타입 체크: 0 에러
- [ ] 린트: 0 에러
- [ ] web 테스트: 모든 테스트 PASS
- [ ] api 테스트: 모든 테스트 PASS
- [ ] api 빌드: 성공
- [ ] format: 통과

---

## 5. 참고 문서 경로

- Dobbit CLAUDE.md: `/Users/gimgangmin/Desktop/Dev/project/dobbit-v2/CLAUDE.md`
- FSD Barrel Export 규칙: CLAUDE.md § "FSD Barrel Export 규칙"
- 기술 스택: CLAUDE.md § "기술 스택"
- Monorepo 구조: CLAUDE.md § "Monorepo 구조"

---

## 6. 제약 및 원칙

1. **기존 백엔드 계약 변경 금지**: api 폴더 수정 금지
2. **기존 디자인 임의 개선 금지**: 요청 외 화면 수정 금지
3. **Surgical Changes**: 요청 외 파일 건드리지 말 것
4. **FSD 준수**: barrel export 규칙 정확히 따르기
5. **테스트 대상 분리**: 순수 함수만 테스트, 컴포넌트 테스트는 E2E로 별도

---

## 7. 산출물

- A1 완료: getCandlesApi 함수 추가됨
- A2 완료: marketKeys.candles 추가됨
- A3 완료: useCandles 훅 + model/index.ts export
- B1 완료: candle-series.ts 순수 함수 2개 (toCandleSeries, updateLastCandleWithTicker)
- B2 완료: MarketChartPanel ApexCharts 캔들스틱 차트로 교체
- B3 완료: HomePage 빌드 가능
- C1 완료: LogoButton 로고 이미지 적용
- D1 완료: 폰트 확인 (정상이면 변경 없음, 비정상이면 보정)
- E1 완료: web vitest 환경 (vitest.config.ts, package.json test script)
- E2 완료: candle-series 단위테스트 (모든 테스트 PASS)
- E3 완료: api vitest 환경 (vitest.config.ts, package.json test script)
- E4 완료: MarketService 단위테스트 (모든 테스트 PASS)
- E5 완료 (선택): turbo.json test 태스크 추가

---

**플래너 상태**: plan-phase2.md 작성 완료 ✅
