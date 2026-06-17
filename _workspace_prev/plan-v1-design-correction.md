# Dobbit v1 Design Correction Plan

## Goal

The previous implementation only approximated a dark dashboard. Correct it so `dobbit-v2` visually matches the existing Dobbit homepage much more closely.

## User Feedback

The user compared:

- current local v2 screenshot: mostly white page background, button-like nav, small centered dashboard card, placeholder chart
- existing v1 homepage screenshot: full dark app, green logo icon + white Dobbit text, plain centered nav links, dark workspace, left market table, large chart panel, order section below

The current implementation is not acceptable as a design match.

## Reference Screenshots

- Current incorrect v2: `/var/folders/3k/_dbl279s51nglbg_f27wbd900000gn/T/TemporaryItems/NSIRD_screencaptureui_foCAGH/스크린샷 2026-06-15 오전 11.06.56.png`
- Target v1: `/var/folders/3k/_dbl279s51nglbg_f27wbd900000gn/T/TemporaryItems/NSIRD_screencaptureui_w1UWtU/스크린샷 2026-06-15 오전 11.07.02.png`

## v1 Source References

- `/Users/gimgangmin/Desktop/Dev/sidePJ/dobbit/src/app/page.tsx`
- `/Users/gimgangmin/Desktop/Dev/sidePJ/dobbit/src/app/globals.css`
- `/Users/gimgangmin/Desktop/Dev/sidePJ/dobbit/src/widgets/layout/AppLayout.tsx`
- `/Users/gimgangmin/Desktop/Dev/sidePJ/dobbit/src/widgets/header/ui/Header.tsx`
- `/Users/gimgangmin/Desktop/Dev/sidePJ/dobbit/src/widgets/header/components/LogoButton.tsx`
- `/Users/gimgangmin/Desktop/Dev/sidePJ/dobbit/src/widgets/header/components/NavButton.tsx`
- `/Users/gimgangmin/Desktop/Dev/sidePJ/dobbit/src/widgets/header/components/UserMenuButton.tsx`
- `/Users/gimgangmin/Desktop/Dev/sidePJ/dobbit/src/features/home/ui/CoinInfoSection.tsx`
- `/Users/gimgangmin/Desktop/Dev/sidePJ/dobbit/src/features/home/ui/ChartSection.tsx`
- `/Users/gimgangmin/Desktop/Dev/sidePJ/dobbit/src/features/home/ui/OrderSection.tsx`
- `/Users/gimgangmin/Desktop/Dev/sidePJ/dobbit/src/features/home/components/features/coin-chart/CoinChartDisplay.tsx`
- `/Users/gimgangmin/Desktop/Dev/sidePJ/dobbit/src/features/home/components/features/coin-chart/ChartControls.tsx`
- `/Users/gimgangmin/Desktop/Dev/sidePJ/dobbit/src/features/home/components/features/order/OrderForm.tsx`

## Required Visual Corrections

1. Page background
   - Remove the white page background around the dashboard.
   - `html`, `body`, and root app area must be dark (`#121212`-like) and fill the viewport.
   - The dashboard should not appear as a small rounded card floating on white.

2. Header
   - Match v1 header: height around `80px`, full-width dark header, subtle bottom border.
   - Logo must be green stepped icon plus white `Dobbit` text. Use CSS if importing the v1 webp asset is inconvenient, but it must resemble the v1 mark, not just text.
   - Main nav should be plain centered links with gap, not shadcn button pills.
   - Active `Dashboard` should be white text, inactive links muted gray.
   - Right side should show plain `Login` when logged out. When logged in, keep Wallet/Setting/Logout but style them closer to v1 and avoid white pill dominance.

3. Workspace layout
   - Match v1 structure:
     - full dark workspace below header,
     - centered max-width content,
     - left market list about 28% width,
     - right content about 72% width,
     - left/right separated by thin border,
     - no outer rounded card.
   - Desktop should fill more vertical/horizontal space like v1.
   - Mobile may stack, but desktop screenshot is priority.

4. Market list
   - Search input should match v1:
     - Korean placeholder `코인명 / 심볼 검색`
     - dark rounded input
   - Table header should be `마켓`, `현재가`, `변동률`, not `Market`/`Status`.
   - Rows should show Korean name, symbol pair, price, change rate colors.
   - If no backend ticker data exists, use available market/current price fields; do not show a bare `Status` column.

5. Chart panel
   - Replace the generic bar placeholder with a v1-like chart panel.
   - If real candle data is unavailable, draw a deterministic SVG/CSS mock candlestick chart in the v1 visual style:
     - dark chart surface,
     - y-axis price labels,
     - grid lines,
     - red/blue candle bars,
     - lower volume/brush area.
   - Top title should use Korean:
     - `비트코인`
     - `BTC/KRW`
   - Price should align right and use blue when down, similar to target.
   - Controls should use v1 labels: `1초`, `1분`, `5분`, `30분`, `1시간`, `주`, `달`, `년`, `차트설정`, `지표`.

6. Order panel
   - In v1 screenshot, order area is below chart, not a narrow right sidebar.
   - Move order section below chart area for desktop.
   - Use Korean tabs: `매수`, `매도`, `거래내역`.
   - Use v1 labels: `주문가능`, `가격`, `수량`, `총액`, `초기화`, `주문하기`.
   - Keep trade action disabled/login-gated if needed, but the visual layout must resemble v1.

## Files to Own

- `apps/web/app/globals.css`
- `apps/web/src/views/home/HomePage.tsx`
- `apps/web/src/features/market/ui/MarketListPanel.tsx`
- `apps/web/src/features/market/ui/MarketChartPanel.tsx`
- `apps/web/src/features/market/ui/MarketOrderPanel.tsx`
- `apps/web/src/widgets/header/ui/Header.tsx`
- `apps/web/src/widgets/header/ui/LogoButton.tsx`
- `apps/web/src/widgets/header/ui/NavButton.tsx`
- `apps/web/src/widgets/header/ui/UserMenuButton.tsx`
- Add tiny helper components/files only if they reduce complexity and follow FSD barrel rules.

## Constraints

- Do not reintroduce login wall for `/`.
- Do not copy Supabase implementation.
- Do not implement actual Auto Trade.
- Do not call protected trade APIs from public dashboard.
- Keep TypeScript strict.
- Follow `AGENTS.md` FSD barrel/export rules.
- Do not revert unrelated changes.

## Verification

- `pnpm --filter web typecheck`
- `pnpm --filter web lint`
- Browser verify `http://localhost:3000/`:
  - no white page background around workspace,
  - logo resembles v1,
  - nav is plain links,
  - left table header is Korean and has price/change columns,
  - chart looks like v1 candlestick/volume area, not generic bars,
  - order panel is below chart with Korean labels,
  - console errors are absent.
- Browser verify protected routes still redirect:
  - `/wallet` -> `/login?from=%2Fwallet`
  - `/setting` -> `/login?from=%2Fsetting`

## Result File

Write final implementation result to:

- `/Users/gimgangmin/Desktop/Dev/project/dobbit-v2/_workspace/impl_result-v1-design-correction.md`

