# Dobbit v1 Design Correction Implementation Result

작성 시각: 2026-06-15 11:17:35 KST

## 상태

DONE_WITH_CONCERNS

## 변경 파일

- `apps/web/app/globals.css`
  - `html`, `body`, root app 영역을 dark background로 고정했다.
  - v1에 가까운 dark surface/text/increase/decrease color token을 추가했다.
- `apps/web/src/views/home/HomePage.tsx`
  - public 홈을 v1 스타일 market dashboard로 구성했다.
  - outer rounded card를 제거하고 desktop 기준 좌측 28%, 우측 72% 레이아웃으로 변경했다.
- `apps/web/src/features/market/ui/MarketListPanel.tsx`
  - 검색 placeholder를 `코인명 / 심볼 검색`으로 변경했다.
  - table header를 `마켓`, `현재가`, `변동률`로 변경했다.
  - button/pill 느낌을 줄이고 v1 dark table row 스타일로 변경했다.
- `apps/web/src/features/market/ui/MarketChartPanel.tsx`
  - generic bar placeholder를 제거하고 deterministic SVG candlestick + volume/brush mock chart로 변경했다.
  - chart controls를 `1초`, `1분`, `5분`, `30분`, `1시간`, `주`, `달`, `년`, `차트설정`, `지표`로 변경했다.
  - 기본 title을 `비트코인`, `BTC/KRW`로 표시한다.
- `apps/web/src/features/market/ui/MarketOrderPanel.tsx`
  - 좁은 right sidebar 구조를 제거하고 chart 아래 full-width order section으로 변경했다.
  - tabs/labels를 `매수`, `매도`, `거래내역`, `주문가능`, `가격`, `수량`, `총액`, `초기화`, `주문하기`로 변경했다.
  - protected trade API 호출은 추가하지 않았고 주문 실행은 계속 비활성/로그인 안내 상태로 유지했다.
- `apps/web/src/widgets/header/ui/Header.tsx`
  - header를 v1처럼 80px dark bar, 중앙 plain nav 구조로 변경했다.
- `apps/web/src/widgets/header/ui/LogoButton.tsx`
  - 녹색 stepped logo mark + 흰 `Dobbit` 텍스트로 변경했다.
- `apps/web/src/widgets/header/ui/NavButton.tsx`
  - shadcn button/pill nav를 plain link 스타일로 변경했다.
  - active `Dashboard`는 white, inactive는 muted gray로 표시한다.
- `apps/web/src/widgets/header/ui/UserMenuButton.tsx`
  - 비로그인 우측 컨트롤을 v1처럼 `Login` 중심으로 단순화했다.
  - 로그인 상태에서도 white pill dominance가 생기지 않도록 plain text link/button 스타일로 조정했다.

## 검증 결과

- `pnpm --filter web typecheck`
  - 통과
  - 출력: `tsc --noEmit`
- `pnpm --filter web lint`
  - 통과
  - 출력: `eslint . --cache`
- Browser verify: `http://localhost:3000/`
  - body background: `rgb(18, 18, 18)`
  - main background: `rgb(18, 18, 18)`
  - header height: `80px`
  - candlestick SVG mock 존재 확인
  - `마켓`, `현재가`, `변동률`, `코인명 / 심볼 검색`, `1초`, `1분`, `5분`, `30분`, `1시간`, `주`, `달`, `년`, `차트설정`, `지표`, `매수`, `매도`, `거래내역`, `주문가능`, `가격`, `수량`, `총액`, `초기화`, `주문하기` 노출 확인
  - console error 없음
- Browser verify: protected redirect
  - `/wallet` -> `http://localhost:3000/login?from=%2Fwallet`
  - `/setting` -> `http://localhost:3000/login?from=%2Fsetting`

## 미해결 사항 / 주의

- market list의 `현재가`, `변동률`은 전체 market별 ticker stream/endpoint가 아직 연결되어 있지 않아 `-`, `0.00%` 중심으로 표시한다.
- 현재 워크트리에는 이 작업 범위 밖 기존 변경이 함께 존재한다:
  - `apps/web/middleware.ts`
  - `apps/web/src/features/market/api/market.api.ts`
  - `apps/web/src/features/market/index.ts`
  - `apps/web/src/shared/api/api-client.ts`
- `apps/web/src/features/market/ui/` 디렉터리는 작업 시작 시 이미 생성된 미추적 상태였고, 이번 rescue 작업에서 해당 소유 파일들을 조정했다.

---

## Final Polish Rescue Result

작성 시각: 2026-06-15 11:24:20 KST

### 상태

DONE

### 변경 파일

- `apps/web/src/features/market/ui/MarketListPanel.tsx`
  - market API data가 비어 있고 loading 중이 아닐 때 deterministic v1-like fallback rows를 표시하도록 변경했다.
  - fallback rows는 한국어 이름, `SYMBOL/KRW`, 현재가, signed 변동률을 표시한다.
  - 변동률은 상승 `text-increase`, 하락 `text-decrease` 색상을 사용한다.
  - fallback row 클릭 시 기존 `onSelectMarket(row.code)` 경로를 그대로 사용해 selected market code를 갱신한다.
- `apps/web/src/features/market/ui/MarketChartPanel.tsx`
  - `selectedMarketCode` 기반 chart fallback map을 추가했다.
  - ticker와 market이 모두 없을 때 `불러오는 중` 대신 v1-like title/code/price/change를 표시한다.
  - `KRW-WAXP`, `KRW-XRP`, `KRW-ETH`, `KRW-SOL` fallback row 선택도 chart title/code/price/change에 반영된다.
- `apps/web/src/views/home/HomePage.tsx`
  - chart fallback이 selected market code를 알 수 있도록 `selectedMarketCode` prop만 전달했다.

### 검증 결과

- `pnpm --filter web typecheck`
  - 최초 실행: 실패
  - 실패 원인: `MarketChartPanel.tsx` fallback map 접근을 TypeScript가 `undefined` 가능성으로 판정했다.
  - 수정: `defaultChartFallback` 상수를 별도로 두고 fallback lookup 기본값으로 사용했다.
  - 최종 실행: 통과
  - 출력: `tsc --noEmit`
- `pnpm --filter web lint`
  - 통과
  - 출력: `eslint . --cache`

### 완료 기준 확인

- market API data가 비어 있고 loading이 아닐 때 왼쪽 list에 v1-like fallback rows가 표시된다.
- fallback row는 한국어 이름, `SYMBOL/KRW`, 현재가, 변동률, red/blue 색상을 보여준다.
- fallback row 클릭 시 selected market code가 바뀌며 chart title/code fallback에 반영된다.
- ticker/market이 없을 때 chart price area는 `불러오는 중` 대신 v1-like price/change fallback을 보여준다.
- 기존 dark background/header/nav/order 구조는 변경하지 않았다.

---

## Loading Fallback Rescue Result

작성 시각: 2026-06-15 11:28:11 KST

### 상태

DONE

### 변경 파일

- `apps/web/src/features/market/ui/MarketListPanel.tsx`
  - `isLoading` 상태가 row list를 대체하지 않도록 리스트 영역 조건을 `filteredRows.length` 기준으로 단순화했다.
  - `markets.length === 0`이면 기존 `fallbackRows`가 즉시 표시되며, fallback row click과 selected highlight 경로는 그대로 유지했다.
  - loading 상태는 row list를 가리지 않는 `sr-only` 접근성 상태 표시로만 남겼다.

### 검증 결과

- 수정 전 정적 체크
  - 실패 확인: `FAIL: loading branch still replaces the market row list`
- 수정 후 정적 체크
  - 통과: `PASS: loading no longer replaces market rows`
- `pnpm --filter web typecheck`
  - 통과
  - 출력: `tsc --noEmit`
- `pnpm --filter web lint`
  - 통과
  - 출력: `eslint . --cache`
