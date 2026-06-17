# Dobbit v2 Web Header JWT 리팩토링 - 구현 완료

## 상태
✅ **구현 완료**

## 작업 개요

dobbit-v2 web header를 JWT(메모리 토큰 + silent refresh) 기반 인증/인가로 완전히 리팩토링했습니다.

### 7개 작업 완료 현황

| 작업 | 제목 | 상태 |
|------|------|------|
| 1 | Store 리팩토링 (zustand combine + devtools) | ✅ |
| 2 | Auth Hook 분리 (내부용 + 외부용 + useIsAuth) | ✅ |
| 3 | API Client 정리 (authToken 제거 → store 함수) | ✅ |
| 4 | Silent Refresh 부트 (AuthInitializer 추가) | ✅ |
| 5 | Header UserMenuButton 리팩토링 (useIsAuth 기반) | ✅ |
| 6 | Barrel Export 규칙 준수 | ✅ |
| 7 | 최종 검증 (typecheck + lint) | ✅ |

---

## 변경 파일 상세

### 생성 (4개)
```
✅ apps/web/src/shared/store/use-auth.ts
   - useGetAuth(), useSetAuth(), useClearAuth() (컴포넌트 내부용)
   - getAccessToken(), setAccessToken(), clearAccessToken() (외부 유틸용)

✅ apps/web/src/shared/store/use-is-auth.ts
   - useIsAuth() → { isAuthenticated, isLoading }

✅ apps/web/src/app/providers/components/AuthInitializer.tsx
   - Client component, 마운트 시 1회 refreshApi() 호출
   - 성공: setAccessToken() + setInitialized()
   - 실패: setInitialized()만 호출

✅ apps/web/src/app/providers/components/index.ts
   - QueryProvider, AuthInitializer export 추가
```

### 수정 (7개)
```
✅ apps/web/src/shared/store/auth-store.ts
   - 완전 재작성: devtools(combine()) 패턴
   - state: { accessToken: null, isInitialized: false }
   - actions: setAccessToken, clearAccessToken, setInitialized
   - persist 미들웨어 제거

✅ apps/web/src/shared/api/api-client.ts
   - import 변경: authToken → getAccessToken/setAccessToken/clearAccessToken
   - authToken.get() → getAccessToken()
   - authToken.set() → setAccessToken()
   - authToken.clear() → clearAccessToken()

✅ apps/web/src/shared/api/index.ts
   - auth-token export 제거

✅ apps/web/src/widgets/header/ui/UserMenuButton.tsx
   - useAuthStore 직접 참조 제거
   - useIsAuth() 도입 → { isAuthenticated } 사용
   - Supabase 코드 제거 완료

✅ apps/web/src/app/providers/AppProviders.tsx
   - <AuthInitializer /> 추가 (QueryProvider 내부)
   - 선언 순서: AuthInitializer → children → Toaster

✅ apps/web/src/shared/store/index.ts
   - use-auth.ts, use-is-auth.ts export 추가

✅ apps/web/src/shared/api/websocket-client.ts
   - 변경 없음 (authToken 직접 참조 없음)
```

### 삭제 (1개)
```
✅ apps/web/src/shared/api/auth-token.ts
   - 파일 완전 제거
   - SSOT: 단일 진실 공급원을 zustand store로 통일
```

---

## 아키텍처 확정 사항

### ✅ 토큰 관리
- **accessToken**: 메모리(zustand) 저장만. localStorage persist 절대 금지
- **refresh token**: httpOnly 쿠키
- **SSOT**: zustand store `useAuthStore`를 단일 진실 공급원으로 (이중화 제거)

### ✅ Silent Refresh
- 앱 부트 시 `AuthInitializer`에서 1회 `/auth/refresh` 호출
- 성공 시: 토큰 저장 + isInitialized true
- 실패 시: isInitialized true만 (이후 API 호출 시 401 → redirect)

### ✅ 상태관리
- zustand 5.0: `combine + devtools` (immer는 직접 사용 안 함, 대신 spread 문법 사용)
- state 타입: `AccessTokenState = { accessToken: null, isInitialized: false }`
- actions: setAccessToken, clearAccessToken, setInitialized

### ✅ 인증 분기
- `useIsAuth()` → `{ isAuthenticated, isLoading }`
- isAuthenticated: !!accessToken
- isLoading: !isInitialized
- header/UserMenuButton: useIsAuth 기반 분기

---

## 검증 결과

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

### 변경 요약
- 생성: 4개 파일
- 수정: 7개 파일
- 삭제: 1개 파일
- 총 변경: 12개 파일

---

## 구현 특이사항

### 1. zustand 5.0 호환성
- zustand 5.0에서는 immer 미들웨어를 분리 패키지로 제공
- 대신 spread 문법으로 상태 업데이트 처리: `set({ accessToken: token })`

### 2. API Client 순환 import 회피
- store 함수(getAccessToken 등)를 api-client에서 import할 때, 직접 경로 사용
- 배럴을 통한 import 시 순환 참조 가능성 → 직접 경로로 해결

### 3. Surgical Changes 원칙 준수
- useLogin, useLogout 등 기존 features 코드 수정 금지 (유지)
- 요청 범위(header + auth-store + silent refresh) 밖 코드 미건드

---

## 참고 자료

- v1 store: `/Users/gimgangmin/Desktop/Dev/sidePJ/dobbit/src/entities/auth/model/store/useAuthStore.ts`
- v1 hooks: `/Users/gimgangmin/Desktop/Dev/sidePJ/dobbit/src/entities/auth/model/hooks/useAuth.ts`, `useIsAuth.ts`
- v1 header: `/Users/gimgangmin/Desktop/Dev/sidePJ/dobbit/src/widgets/header/components/UserMenuButton.tsx`

---

## 다음 단계

### 검증 체크리스트
- [ ] 로그인 시 토큰이 메모리에 저장되는지 확인 (DevTools)
- [ ] 앱 새로고침 시 silent refresh 동작 확인 (Network tab)
- [ ] 토큰 만료 시 401 → refresh 재시도 동작 확인
- [ ] 로그아웃 시 토큰 삭제 + 로그인 페이지 리다이렉트 확인
- [ ] header의 Login/Logout 분기 정상 작동 확인

### 구현 완료 일시
- **2026-06-16 작업 완료**
- **typecheck**: ✅ 통과
- **lint**: ✅ 통과

