# Dobbit v1 Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Follow the Dobbit v2 implementer role. Source changes must be made by the implementer path, not by the orchestrator. Track steps with checkbox syntax.

**Goal:** Restore the original Dobbit public trading-dashboard experience in `dobbit-v2` while keeping v2's NestJS/PostgreSQL/Prisma/FSD structure.

**Architecture:** Make public market/news/dashboard routes accessible without login, keep private pages and personal actions protected, and rebuild the home screen as a dark trading dashboard. Use existing v2 feature/entity/shared layers and reference v1 for layout and visual behavior, not for direct Supabase/API code copying.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS v4, shadcn/ui primitives, TanStack Query, TypeScript strict.

---

## Approved Decisions

- `/` is the public Dashboard, matching the original Dobbit first screen.
- `Auto Trade` is represented in navigation/design only. Do not build a new auto-trade feature in this task.
- `Wallet` stays as a right-side header action. If clicked while logged out, route to login with `from=/wallet`.
- Public routes: `/`, `/market` if present, `/news`, `/login`, `/signup`.
- Protected routes: `/wallet`, `/setting`.
- Protected actions: buy, sell, order cancel, private notifications, private WebSocket channels.

## Reference Sources

- v1 public site: `https://dobbit.vercel.app/`
- v1 local source: `/Users/gimgangmin/Desktop/Dev/sidePJ/dobbit`
- v2 source: `/Users/gimgangmin/Desktop/Dev/project/dobbit-v2`
- Obsidian plan: `/Users/gimgangmin/Desktop/Dev/wiki/workspace/project/portfolio-renewal/Dobbit/docs/작업로그/2026-06-15-dobbit-v1-alignment-plan.md`
- AGENTS rules: `/Users/gimgangmin/Desktop/Dev/project/dobbit-v2/AGENTS.md`

## Current Evidence

- v1 `src/app/page.tsx` renders `CoinInfoSection`, `ChartSection`, `OrderSection`.
- v1 dashboard layout is roughly 28% market list and 72% chart/order area.
- v1 `src/widgets/header/config/nav-items.config.ts` uses `Dashboard`, `Auto Trade`, `News`, `Setting`.
- v1 has no route-level middleware blocking anonymous access.
- v2 `apps/web/middleware.ts` currently allows only `/login` and `/signup`.
- v2 `apps/web/src/views/home/HomePage.tsx` is notification/private socket focused.
- v2 market API currently calls `/markets`, but backend controller is mounted at `/api/market/markets`, so client paths should use `/market/markets` with the existing `API_BASE_URL` ending in `/api`.
- v2 backend ticker route is `GET /api/market/markets/:code/price`, not `GET /api/markets/:marketCode`.

## Non-Goals

- Do not copy Supabase code from v1.
- Do not add real Auto Trade behavior.
- Do not change server domain architecture.
- Do not make wallet balances, settings, order submission, or private sockets public.
- Do not add new UI libraries.

## Task 1: Public/Protected Route Policy

**Files:**

- Modify: `apps/web/middleware.ts`
- Modify if needed: `apps/web/src/shared/constants/routes-path.ts`
- Inspect: `apps/web/src/shared/api/api-client.ts`

**Steps:**

- [ ] Change middleware public route policy so anonymous users can access `/`, `/news`, `/login`, `/signup`, and `/market` if that route is introduced.
- [ ] Keep `/wallet` and `/setting` protected.
- [ ] Preserve the existing `from` query behavior when redirecting protected routes to login.
- [ ] Fix any incorrect login redirects found during this work. In particular, `apps/web/src/shared/api/api-client.ts` currently redirects to `/(auth)/login`, which is not a browser route; it should point to `/login`.

**Completion Criteria:**

- [ ] Anonymous request to `/` is not redirected.
- [ ] Anonymous request to `/news` is not redirected.
- [ ] Anonymous request to `/wallet` redirects to `/login?from=/wallet`.
- [ ] Anonymous request to `/setting` redirects to `/login?from=/setting`.
- [ ] No route constants use the App Router group name `/(auth)` as a browser URL.

## Task 2: Header and Navigation Alignment

**Files:**

- Modify: `apps/web/src/widgets/header/ui/Header.tsx`
- Modify: `apps/web/src/widgets/header/ui/NavButton.tsx`
- Modify: `apps/web/src/widgets/header/ui/UserMenuButton.tsx`
- Modify if needed: `apps/web/src/widgets/header/ui/LogoButton.tsx`
- Modify: `apps/web/src/shared/constants/routes-path.ts`

**Steps:**

- [ ] Align main nav labels with v1: `Dashboard`, `Auto Trade`, `News`, `Setting`.
- [ ] Route `Dashboard` to `/`.
- [ ] For `Auto Trade`, do not create feature behavior. Prefer a disabled-looking item or a link that safely points to `/` only if the existing NavButton API cannot represent disabled state cleanly. Keep this minimal.
- [ ] Route `News` to `/news`.
- [ ] Route `Setting` to `/setting`; anonymous access should still be protected by middleware.
- [ ] Keep `Wallet` as a right-side action in `UserMenuButton`.
- [ ] When logged out, show `Login` and keep `Wallet` reachable as an action that routes to `/wallet`; middleware will redirect to login.
- [ ] When logged in, show `Wallet`, `Setting` if already present, and `Logout` without duplicating too many controls.
- [ ] Match v1 dark header feel: dark surface, subtle border, compact trading-tool layout.

**Completion Criteria:**

- [ ] Header is visible for anonymous users on public routes.
- [ ] Header no longer uses Korean labels for the main v1-aligned nav.
- [ ] `Wallet` is visible as a right-side action.
- [ ] Anonymous wallet click results in login redirect through route policy.
- [ ] No nested-card visual structure is introduced.

## Task 3: Home Dashboard Structure

**Files:**

- Replace/modify: `apps/web/src/views/home/HomePage.tsx`
- Create as needed under: `apps/web/src/features/market/ui/`
- Create as needed under: `apps/web/src/features/trade/`
- Modify barrels:
  - `apps/web/src/features/market/index.ts`
  - `apps/web/src/features/market/ui/index.ts` if created
  - `apps/web/src/features/index.ts`
  - `apps/web/src/views/home/index.ts` only if exports change

**Steps:**

- [ ] Remove notification/private socket responsibility from the public home page.
- [ ] Build the public dashboard layout with:
  - left market search/list panel,
  - main selected coin title and price summary,
  - chart/control placeholder panel,
  - order panel with `매수`, `매도`, `거래내역` tabs or equivalent compact controls.
- [ ] Use v2 market hooks and types where possible.
- [ ] If backend data is unavailable or shape differs, render explicit loading/empty/disabled states. Do not invent fake market/order data.
- [ ] Default selected market should be `KRW-BTC` or the first returned KRW market.
- [ ] Order submit buttons must be disabled or route to login when no token exists. Do not call protected trade APIs from anonymous state.
- [ ] Keep non-page components as named exports.
- [ ] Keep `HomePage` as `export default function HomePage()`.
- [ ] Maintain responsive behavior:
  - desktop: market list left, chart/order right,
  - mobile: panels stack without overlap.

**Completion Criteria:**

- [ ] `/` visually resembles the v1 trading dashboard instead of the notification center.
- [ ] Anonymous users can see market list, selected coin area, chart placeholder, and order panel.
- [ ] Private notification socket is not opened by the home page.
- [ ] No text overflows or obvious panel overlap on narrow layout.
- [ ] FSD barrel export rules from `AGENTS.md` are followed.

## Task 4: Market Client Path Correction

**Files:**

- Modify: `apps/web/src/features/market/api/market.api.ts`
- Modify if needed: `apps/web/src/features/market/model/useMarkets.ts`
- Inspect: `apps/api/src/market/market.controller.ts`
- Inspect: `packages/shared/src/index.ts`

**Steps:**

- [ ] Align market list endpoint with backend: use `/market/markets`.
- [ ] Align ticker/current price endpoint with backend: use `/market/markets/${code}/price`.
- [ ] Keep query string construction structured with `URLSearchParams`.
- [ ] If frontend `MarketTicker` and backend `Market`/`CurrentPrice` types are incompatible, map backend response into the minimum dashboard view model locally in the market UI layer. Do not change backend in this task.

**Completion Criteria:**

- [ ] Market list client no longer calls `/markets`.
- [ ] Ticker client no longer calls `/markets/:code`.
- [ ] TypeScript types remain strict without `any`.

## Task 5: Dark Trading Theme Tokens

**Files:**

- Modify: `apps/web/app/globals.css`
- Modify if needed: `apps/web/src/widgets/layout/ui/AppLayout.tsx`
- Inspect: v1 `src/app/globals.css`

**Steps:**

- [ ] Shift global default theme toward v1 dark trading terminal:
  - background near `#121212`,
  - surface near `#1e1e1e`,
  - muted text near `#a0a0a0`,
  - primary accent near `#32cd32`,
  - increase/decrease colors compatible with v1.
- [ ] Ensure shadcn primitives still have readable foreground/background tokens.
- [ ] Avoid decorative gradients/orbs and landing-page styling.
- [ ] Keep page sections tool-like and dense; do not add marketing hero layout.

**Completion Criteria:**

- [ ] `/`, `/news`, `/wallet`, `/setting`, `/login` remain readable.
- [ ] Dashboard reads as a dark trading application.
- [ ] Cards/panels have 8px radius or less unless existing primitive dictates otherwise.

## Task 6: Verification and Result Report

**Files:**

- Create/modify: `_workspace/impl_result-v1-alignment.md`

**Steps:**

- [ ] Run `pnpm --filter web typecheck`.
- [ ] Run `pnpm --filter web lint` if feasible.
- [ ] If a command fails, record the exact failing command and key error lines.
- [ ] Write implementation summary to `_workspace/impl_result-v1-alignment.md`.
- [ ] Include changed file list, verification result, and any known follow-up.

**Completion Criteria:**

- [ ] `_workspace/impl_result-v1-alignment.md` exists.
- [ ] Verification commands and outcomes are documented.
- [ ] No unrelated user changes are reverted.

