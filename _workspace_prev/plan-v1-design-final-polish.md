# Dobbit v1 Design Final Polish Plan

## Goal

The corrected layout is closer to v1, but the browser screenshot still differs from the target because the market list is empty and the selected price reads `불러오는 중`. Polish the visual fallback so the public homepage remains visually close to v1 even when the backend market data is unavailable or empty.

## Current Screenshot After Correction

Observed in browser:

- dark app background: correct
- 80px header, stepped logo, plain nav: correct
- chart SVG style: close enough
- left market list: empty, displays `검색 결과가 없습니다.`
- chart price: `불러오는 중`
- target v1 has populated market rows and a visible right-aligned price/change area

## Required Changes

1. Market list visual fallback
   - When `markets` is empty and not actively loading, render deterministic v1-like display rows instead of an empty blank panel.
   - Rows should mimic target shape:
     - Korean name
     - symbol pair like `WAXP/KRW`
     - current price
     - signed change percent
     - red/blue change color
   - Use obvious static constants inside `MarketListPanel.tsx` or a tiny local helper. Do not touch backend.
   - Clicking a fallback row should update selected market code so title/code can change.

2. Chart title/price visual fallback
   - When ticker is missing and selected market is unavailable, show v1-like default:
     - title `비트코인`
     - code `BTC/KRW`
     - price `98,501,000 KRW` or similar formatted visible price
     - change `-0.69% ▼ 689,000` in blue tone
   - This is a display fallback only; do not call trade APIs.

3. Preserve prior fixes
   - No white background.
   - No pill nav.
   - Order remains below chart.
   - Protected redirects remain.

## Files to Own

- `apps/web/src/features/market/ui/MarketListPanel.tsx`
- `apps/web/src/features/market/ui/MarketChartPanel.tsx`
- `apps/web/src/views/home/HomePage.tsx` only if needed to pass fallback selected market metadata

## Verification

- `pnpm --filter web typecheck`
- `pnpm --filter web lint`
- Browser verify `/`:
  - left list has multiple visible rows like target even if API data is empty
  - chart title/price area is populated, not `불러오는 중`
  - console errors absent

## Result File

Append or update:

- `/Users/gimgangmin/Desktop/Dev/project/dobbit-v2/_workspace/impl_result-v1-design-correction.md`

