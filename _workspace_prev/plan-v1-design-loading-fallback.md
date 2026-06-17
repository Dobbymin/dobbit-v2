# Dobbit v1 Design Loading Fallback Plan

## Problem

Final browser verification still shows `마켓을 불러오는 중입니다.` in the left market panel because the market query remains loading when the backend is unavailable or slow. The chart price fallback is visible, but the left panel still does not match the v1 target screenshot.

## Goal

Render v1-like fallback market rows while API data is loading or empty, so the homepage remains visually close to v1 immediately.

## File to Own

- `apps/web/src/features/market/ui/MarketListPanel.tsx`

## Required Change

- Use fallback display rows when `markets.length === 0`, regardless of `isLoading`.
- Do not show `마켓을 불러오는 중입니다.` on the public dashboard.
- It is acceptable to keep a subtle loading indicator in the search/header area only if it does not replace the row list.
- Preserve existing click behavior and selected market highlighting.

## Verification

- `pnpm --filter web typecheck`
- `pnpm --filter web lint`
- Browser `/` should show fallback rows in left market panel immediately.

