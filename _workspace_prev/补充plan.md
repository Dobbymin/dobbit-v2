# Dobbit v2 Web Header JWT 리팩토링 — 보완 작업

**상태**: 이전 구현 완료 후 사용자 명시 요구사항 2가지 보완

---

## 보완 1: Store에 immer 미들웨어 적용 (필수)

**위치**: `apps/web/src/shared/store/auth-store.ts`

**현재 상태**: `devtools(combine(...))` 구조 (immer 제외)

**문제**: 사용자가 "combine + devtools + immer를 활용"하라고 명시했으나 immer 빠짐

**작업 내용**:
1. zustand immer 미들웨어 import: `import { immer } from "zustand/middleware/immer";`
2. 미들웨어 순서 변경: `create(devtools(immer(combine(...))))`
3. action을 immer 방식으로 재작성:
   ```typescript
   setAccessToken: (token: string) => set((state) => { state.accessToken = token; })
   clearAccessToken: () => set((state) => { state.accessToken = null; })
   setInitialized: () => set((state) => { state.isInitialized = true; })
   ```
4. v1 패턴과 동일 (persist만 제외): `/Users/gimgangmin/Desktop/Dev/sidePJ/dobbit/src/entities/auth/model/store/useAuthStore.ts` 참고

**완료 기준**:
- [ ] immer 미들웨어 import + 사용 확인
- [ ] action이 immer mutate 방식 (`set((s) => { s.xxx = yyy })`)
- [ ] typecheck 통과
- [ ] lint 통과

---

## 보완 2: Header UserMenuButton에 v1 드롭다운 UX 적용

**위치**: `apps/web/src/widgets/header/ui/UserMenuButton.tsx`

**참고**: v1 `/Users/gimgangmin/Desktop/Dev/sidePJ/dobbit/src/widgets/header/components/UserMenuButton.tsx`, `hooks/useSelectChange.ts`

**현재 상태**: 기존 v2 링크 방식 (Wallet, Setting, Logout 버튼)

**목표**: Avatar + Select 드롭다운 + Wallet 버튼 UX 도입

**단계별 작업**:

### 단계 1: Avatar 컴포넌트 추가
- shadcn avatar 설치: `pnpm dlx shadcn@latest add avatar --cwd apps/web`
- `shared/components/ui/avatar.tsx` 생성 확인
- `shared/components/ui/index.ts`에 `export * from "./avatar"` 추가

### 단계 2: UserMenuButton 리팩토링
- import 추가: `useRouter`, `useIsAuth`, `useLogout`, `Avatar`, `AvatarFallback`, `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`, `Button`, `UserRound` (lucide)
- 분기 조건: `const { isAuthenticated, isLoading } = useIsAuth();`
  - `!isLoading && !isAuthenticated` → **Login 링크만** (기존과 동일)
  - `isLoading || isAuthenticated` → **Wallet 버튼 + Avatar/Select 드롭다운**

### 단계 3: Wallet + Avatar/Select 렌더링
- Wallet: 기존 링크 유지
- Avatar:
  ```tsx
  <Avatar>
    <AvatarFallback>
      <UserRound className="h-4 w-4" />
    </AvatarFallback>
  </Avatar>
  ```
  (v2엔 avatar URL 없으므로 FallbackIcon만)

- Select:
  ```tsx
  <Select onValueChange={handleSelectChange}>
    <SelectTrigger>...</SelectTrigger>
    <SelectContent>
      <SelectItem value="setting">Setting</SelectItem>
      <SelectItem value="logout">Logout</SelectItem>
    </SelectContent>
  </Select>
  ```

### 단계 4: handleSelectChange 핸들러
```typescript
const handleSelectChange = (value: string) => {
  if (value === "logout") {
    logout.mutate();
  } else if (value === "setting") {
    router.push(ROUTES_PATH.SETTING);
  }
};
```
- logout은 v1처럼 `useLogout()` mutation 사용 (logoutAPI 직접 호출 금지)
- setting은 router.push로 페이지 이동
- v1 `hooks/useSelectChange.ts` 패턴 참고하되 useLogout 사용

### 단계 5: 로딩 상태 처리
- `isLoading` 중: Wallet + Avatar/Select 표시 (silent refresh 중 UI 안정성)
- Select disabled는 `logout.isPending` 기반

**CSS**: 기존 스타일 유지, 필요시 gap/flex 조정

**완료 기준**:
- [ ] avatar 컴포넌트 설치 및 배럴 반영
- [ ] UserMenuButton: `!isLoading && !isAuthenticated` → Login만
- [ ] UserMenuButton: `isLoading || isAuthenticated` → Wallet + Avatar + Select
- [ ] Select onChange: logout → useLogout 실행, setting → router.push
- [ ] Supabase 의존 제거 (useGetSession 금지)
- [ ] typecheck 통과
- [ ] lint 통과

---

## 검증 명령

```bash
pnpm --filter web typecheck
pnpm --filter web lint
```

---

## 예상 변경 파일

**수정**:
- `apps/web/src/shared/store/auth-store.ts` (immer 미들웨어 추가)
- `apps/web/src/widgets/header/ui/UserMenuButton.tsx` (Avatar + Select 드롭다운 도입)

**생성**:
- `apps/web/src/shared/components/ui/avatar.tsx` (shadcn 자동 생성)

**수정**:
- `apps/web/src/shared/components/ui/index.ts` (avatar export 추가)

---

## 참고 자료

- v1 store (immer 참고): `/Users/gimgangmin/Desktop/Dev/sidePJ/dobbit/src/entities/auth/model/store/useAuthStore.ts`
- v1 header (UX 참고): `/Users/gimgangmin/Desktop/Dev/sidePJ/dobbit/src/widgets/header/components/UserMenuButton.tsx`
- v1 select handler: `/Users/gimgangmin/Desktop/Dev/sidePJ/dobbit/src/widgets/header/hooks/useSelectChange.ts`

---

plan_ready
