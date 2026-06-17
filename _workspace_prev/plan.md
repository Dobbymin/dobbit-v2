# Dobbit v2 Web Header JWT 리팩토링 계획

**작업 목표**: dobbit-v2 web의 header 인증/인가를 JWT(메모리 토큰 + silent refresh) 기반으로 리팩토링

**확정된 아키텍처**:
- accessToken은 **메모리(zustand store)에만** 저장. persist(localStorage) 절대 금지.
- refresh token은 httpOnly 쿠키. 앱 부트 시 `/auth/refresh` 1회 호출(silent refresh) → 세션 복구.
- 상태관리: zustand `combine + devtools + immer` (persist 제외).
- zustand store = **단일 진실 공급원(SSOT)** → 현재 `shared/api/auth-token.ts` 이중화 제거.
- v1 패턴 적극 참고, Supabase 코드 전부 제거.

**신뢰할 수 있는 참고 문서**:
- v1 store: `/Users/gimgangmin/Desktop/Dev/sidePJ/dobbit/src/entities/auth/model/store/useAuthStore.ts`
- v1 hooks: `/Users/gimgangmin/Desktop/Dev/sidePJ/dobbit/src/entities/auth/model/hooks/useAuth.ts`, `useIsAuth.ts`
- v1 header: `/Users/gimgangmin/Desktop/Dev/sidePJ/dobbit/src/widgets/header/components/UserMenuButton.tsx`

---

## 작업 1: Store 리팩토링 (zustand devtools + immer + combine 패턴)

**위치**: `apps/web/src/shared/store/auth-store.ts`

**작업 내용**:
1. store를 v1 패턴으로 완전 재작성:
   ```
   create(devtools(immer(combine(
     { accessToken: null, isInitialized: false },
     (set) => ({
       setAccessToken: (token) => set((s) => { s.accessToken = token }),
       clearAccessToken: () => set((s) => { s.accessToken = null }),
       setInitialized: () => set((s) => { s.isInitialized = true }),
     })
   ))))
   ```
2. authToken 모듈과 동기화 제거 (import 금지).
3. devtools name = "auth-store", persist 미사용.

**완료 기준**:
- [ ] typecheck 통과
- [ ] immer 기반 state 업데이트 정상 작동
- [ ] persist 미들웨어 미사용 확인

---

## 작업 2: Auth Hook 분리 (컴포넌트 내부용 + 외부 유틸용)

**위치**: `apps/web/src/shared/store/` (새 파일 추가)

**작업 내용**:
1. **컴포넌트 내부용 hook** 작성:
   - `useGetAuth()` = `useAuthStore((s) => s.accessToken)`
   - `useSetAuth()` = `useAuthStore((s) => s.setAccessToken)`
   - `useClearAuth()` = `useAuthStore((s) => s.clearAccessToken)`

2. **컴포넌트 외부용 함수** (getState 활용):
   - `getAccessToken()` = `useAuthStore.getState().accessToken`
   - `setAccessToken(token)` = `useAuthStore.getState().setAccessToken(token)`
   - `clearAccessToken()` = `useAuthStore.getState().clearAccessToken()`

3. **인증 상태 hook**:
   - `useIsAuth()` 반환: `{ isAuthenticated: !!accessToken, isLoading: !isInitialized }`

4. FSD 규칙 준수: `shared/store/index.ts`에서 `export *` 추가.

**완료 기준**:
- [ ] typecheck 통과
- [ ] `useGetAuth()` 등 hook 정상 작동
- [ ] `getAccessToken()` 등 외부 함수 정상 작동

---

## 작업 3: API Client 정리 (authToken 제거)

**위치**: 
- `apps/web/src/shared/api/api-client.ts`
- `apps/web/src/shared/api/websocket-client.ts`
- `apps/web/src/shared/api/auth-token.ts` (삭제)
- `apps/web/src/shared/api/index.ts`

**작업 내용**:
1. **api-client.ts**:
   - import: `authToken` → `getAccessToken, setAccessToken, clearAccessToken` (store 함수)
   - `authToken.get()` → `getAccessToken()`
   - `authToken.set()` → `setAccessToken()`
   - `authToken.clear()` → `clearAccessToken()`

2. **websocket-client.ts**:
   - `authToken` 참조 있으면 `getAccessToken()`으로 교체 (grep으로 전수 확인)

3. **auth-token.ts**: 파일 전체 삭제

4. **shared/api/index.ts**: `auth-token` export 제거

**완료 기준**:
- [ ] typecheck 통과
- [ ] api-client 401 refresh 로직 정상 작동
- [ ] auth-token.ts 삭제 확인

---

## 작업 4: Silent Refresh 부트 (앱 마운트 시 1회 토큰 복구)

**위치**: 
- `apps/web/src/app/providers/components/AuthInitializer.tsx` (신규)
- `apps/web/src/app/providers/AppProviders.tsx`

**작업 내용**:
1. **AuthInitializer.tsx** 신규 작성:
   - Client component (`"use client"`)
   - `useEffect` 마운트 1회만 (의존성: [])
   - `refreshApi()` 호출:
     - 성공: `setAccessToken(res.accessToken)` → `setInitialized()`
     - 실패: `setInitialized()`만
   - 로딩 UI 불필요 (백그라운드 실행)

2. **AppProviders.tsx** 수정:
   - `<QueryProvider>` 내부에 `<AuthInitializer />` 배치

3. providers 배럴: `components/index.ts` 추가, `providers/index.ts` 수정

**완료 기준**:
- [ ] typecheck 통과
- [ ] 앱 마운트 시 1회만 `refreshApi` 호출
- [ ] 토큰 복구 성공/실패 모두 `isInitialized` true

---

## 작업 5: Header UserMenuButton 리팩토링

**위치**: `apps/web/src/widgets/header/ui/UserMenuButton.tsx`

**작업 내용**:
1. **인증 상태 분기** (`useIsAuth()` 사용):
   - 비인증: Login 링크
   - 인증: Wallet, Setting, Logout 버튼

2. **로그아웃 처리**:
   - `useLogout()` mutation 사용
   - `onClick={() => logout.mutate()}`

3. **Supabase 제거**:
   - `useGetSession()`, `user_metadata.avatar_url` 등 전부 제거

**완료 기준**:
- [ ] typecheck 통과
- [ ] 비인증 상태: Login 표시
- [ ] 인증 상태: Wallet, Setting, Logout 표시
- [ ] Supabase 참조 완전 제거

---

## 작업 6: Barrel Export 규칙 준수

**위치**: 
- `apps/web/src/shared/store/index.ts`
- `apps/web/src/app/providers/components/index.ts`
- `apps/web/src/app/providers/index.ts`

**작업 내용**:
- 신규 파일 추가 시 해당 층의 `index.ts`에 `export *` 반영

**완료 기준**:
- [ ] 순환 import 없음

---

## 작업 7: 최종 검증

**위치**: 워크스페이스 루트

**명령**:
```bash
pnpm --filter web typecheck
pnpm --filter web lint
```

**완료 기준**:
- [ ] typecheck 무경고
- [ ] lint 무경고

---

## 변경 파일 요약

**생성**:
- `apps/web/src/shared/store/use-auth.ts` (hooks + functions)
- `apps/web/src/shared/store/use-is-auth.ts` (useIsAuth)
- `apps/web/src/app/providers/components/AuthInitializer.tsx`
- `apps/web/src/app/providers/components/index.ts`

**수정**:
- `apps/web/src/shared/store/auth-store.ts` (완전 재작성)
- `apps/web/src/shared/api/api-client.ts` (authToken → store 함수)
- `apps/web/src/shared/api/websocket-client.ts` (필요시)
- `apps/web/src/shared/api/index.ts` (auth-token export 제거)
- `apps/web/src/widgets/header/ui/UserMenuButton.tsx` (useIsAuth 기반)
- `apps/web/src/app/providers/AppProviders.tsx` (AuthInitializer 추가)
- `apps/web/src/shared/store/index.ts` (새 export 추가)

**삭제**:
- `apps/web/src/shared/api/auth-token.ts`

---

## 주의사항 (Surgical Changes)

- 요청 범위 밖 코드 건드리지 말 것
- 토큰 이중화 제거·silent refresh·header 분기·store 패턴에 직접 연결되는 변경만
- 무관한 리팩토링/포맷팅 금지
- useLogin, useLogout 등 기존 features 코드 수정 금지

plan_ready
