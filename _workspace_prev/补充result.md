# Dobbit v2 Web Header JWT 리팩토링 — 보완 완료

## 상태
✅ **보완 작업 완료**

---

## 보완 1: Store에 immer 미들웨어 적용 ✅

**파일**: `apps/web/src/shared/store/auth-store.ts`

**변경 사항**:
```typescript
// import 추가
import { immer } from "zustand/middleware/immer";

// 미들웨어 순서 변경
create<AccessTokenState>()(
  devtools(
    immer(
      combine(initialState, (set) => ({
        setAccessToken: (token: string) =>
          set((state) => {
            state.accessToken = token;  // immer 방식: 직접 mutate
          }),
        clearAccessToken: () =>
          set((state) => {
            state.accessToken = null;   // immer 방식: 직접 mutate
          }),
        setInitialized: () =>
          set((state) => {
            state.isInitialized = true; // immer 방식: 직접 mutate
          }),
      }))
    ),
    { name: "auth-store" }
  )
)
```

**검증**: ✅ typecheck 무경고 통과

---

## 보완 2: Header UserMenuButton에 v1 드롭다운 UX 적용 ✅

### 2-1. Avatar 컴포넌트 추가

**명령**: `pnpm dlx shadcn@latest add avatar --cwd apps/web`

**파일**: `apps/web/src/shared/components/ui/avatar.tsx` (자동 생성)

**배럴 업데이트**: `apps/web/src/shared/components/ui/index.ts`
```typescript
export * from "./avatar";  // 추가
```

### 2-2. UserMenuButton 리팩토링

**파일**: `apps/web/src/widgets/header/ui/UserMenuButton.tsx`

**변경 사항**:

1. **Import 추가**:
   - `useRouter` (next/navigation)
   - `Avatar`, `AvatarFallback`, `Select`, `SelectContent`, `SelectGroup`, `SelectItem`, `SelectTrigger`
   - `useIsAuth` (인증 상태 hook)
   - `UserRound`, `Wallet` (lucide-react 아이콘)

2. **인증 상태 분기**:
   ```typescript
   const { isAuthenticated, isLoading } = useIsAuth();
   
   // 비인증 + 로딩 아님 → Login만
   if (!isLoading && !isAuthenticated) { return <Login link> }
   
   // 로딩 중 또는 인증됨 → Wallet + Avatar + Select 드롭다운
   ```

3. **Wallet + Avatar + Select 드롭다운**:
   - Wallet 버튼: 기존 링크 유지 (스타일 개선)
   - Avatar: `UserRound` 아이콘만 표시 (v2에 avatar URL 없음)
   - Select 드롭다운: Setting / Logout 옵션
   - Select disabled: `logout.isPending` 기반

4. **Select onChange 핸들러**:
   ```typescript
   const handleSelectChange = (value: string) => {
     if (value === "logout") {
       logout.mutate();  // useLogout() mutation 사용
     } else if (value === "setting") {
       router.push(ROUTES_PATH.SETTING);
     }
   };
   ```

**검증**: ✅ typecheck 무경고, lint 무경고

---

## 최종 검증 결과

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

| 파일 | 변경 유형 | 설명 |
|------|---------|------|
| `shared/store/auth-store.ts` | 수정 | immer 미들웨어 추가, 타입 정의 개선 |
| `widgets/header/ui/UserMenuButton.tsx` | 수정 | Avatar + Select 드롭다운 UX 도입, useIsAuth 기반 분기 |
| `shared/components/ui/avatar.tsx` | 생성 | shadcn avatar 컴포넌트 자동 생성 |
| `shared/components/ui/index.ts` | 수정 | avatar export 추가 |

---

## 아키텍처 최종 확정

### ✅ Store 패턴
- zustand 5.0: `combine + devtools + immer`
- immer mutate 방식: `set((state) => { state.xxx = yyy })`
- persist 미들웨어: 제외 (메모리 전용)

### ✅ Header UX
- **비인증 + 로딩 아님**: Login 링크만
- **로딩 중 또는 인증됨**: Wallet + Avatar + Select 드롭다운
- Avatar: UserRound 아이콘만 (fallback icon)
- Select: Setting / Logout 옵션
- Logout: useLogout() mutation 사용 (직접 API 호출 금지)

### ✅ Supabase 제거
- useGetSession 미사용
- user_metadata.avatar_url 미사용
- Avatar는 아이콘만으로 표시

---

## 다음 단계

### 검증 체크리스트
- [ ] 앱 실행 시 header 렌더링 정상 확인
- [ ] 비인증 상태: Login 링크만 표시
- [ ] 로그인 후: Wallet + Avatar + Select 드롭다운 표시
- [ ] Select에서 Setting 클릭 → /setting 이동 확인
- [ ] Select에서 Logout 클릭 → useLogout mutation 실행 → /login 이동 확인

---

**완료 일시**: 2026-06-16  
**상태**: ✅ 보완 작업 완료, 모든 검증 통과

