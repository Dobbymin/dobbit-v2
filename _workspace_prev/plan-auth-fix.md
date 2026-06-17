# dobbit-v2 긴급 수정 — 인증 흐름 구현

## 배경 (현재 버그 상태)

1. **API 경로 불일치**: 프론트(`apps/web`)는 `/api/auth/login`을 호출하지만 백엔드(`apps/api`)에 글로벌 prefix가 없어 `/auth/login`만 존재 → 404
2. **서버 인증 스텁**: `auth.service.ts`의 login/signup이 더미이며, DB 검증 없이 모든 입력을 통과시킴. `users` 테이블 비어 있음
3. **쿠키 미설정**: 로그인 성공해도 zustand store(메모리)에만 저장하고 쿠키를 설정하지 않음. `middleware.ts`는 `access_token` **쿠키**로 인증 판정 → 쿠키가 없어 항상 `/login?from=%2F`로 리다이렉트

## 시스템 현황

- **프론트**: `apps/web` (Next.js, localhost:3000)
- **백엔드**: `apps/api` (NestJS, localhost:8080)
- **DB**: PostgreSQL (dobbit_dev, role: dobbit)
- **프론트 base URL**: `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api`

## 작업 1: API 경로 통일 (글로벌 prefix 금지, 각 컨트롤러 경로에 `/api` 직접 추가)

목표: `setGlobalPrefix('api')`를 쓰지 말고, 각 컨트롤러의 `@Controller()` 데코레이터 경로 앞에 `api/`를 직접 붙인다.

작업 위치:
- `apps/api/src/auth/auth.controller.ts`
- `apps/api/src/trade/trade.controller.ts`
- `apps/api/src/alert/alert.controller.ts`
- `apps/api/src/news/news.controller.ts`
- `apps/api/src/market/market.controller.ts`
- `apps/api/src/wallet/wallet.controller.ts`
- `apps/api/src/app.controller.ts`

입력 조건:
- 각 컨트롤러가 `@Controller('auth')` 등의 형태로 경로를 지정하고 있다.
- `main.ts`에 글로벌 prefix 설정이 없거나 제거되어 있어야 한다.

변경 명세:
- `apps/api/src/auth/auth.controller.ts`: `@Controller('auth')` → `@Controller('api/auth')`
- `apps/api/src/trade/trade.controller.ts`: `@Controller('trade')` → `@Controller('api/trade')`
- `apps/api/src/alert/alert.controller.ts`: `@Controller('alert')` → `@Controller('api/alert')`
- `apps/api/src/news/news.controller.ts`: `@Controller('news')` → `@Controller('api/news')`
- `apps/api/src/market/market.controller.ts`: `@Controller('market')` → `@Controller('api/market')`
- `apps/api/src/wallet/wallet.controller.ts`: `@Controller('wallet')` → `@Controller('api/wallet')`
- `apps/api/src/app.controller.ts`: `@Controller()` → `@Controller('api')` (기존 핸들러가 루트 `/`를 기대하면 영향 검토 후 합리적으로 처리)

완료 기준:
- [ ] 모든 컨트롤러의 `@Controller()` 경로에 `api/` prefix가 붙었다
- [ ] `curl -i -X GET http://localhost:8080/api/auth/login -H "Content-Type: application/json"` 등 경로가 404가 아니라 응답(예: 405 Method Not Allowed)을 반환한다
- [ ] `pnpm --filter api typecheck` 통과

참고 문서:
- `CLAUDE.md` NestJS API 경로 설정
- 각 컨트롤러 파일의 기존 `@Controller()` 데코레이터

## 작업 2: 쿠키 인증 일원화 (Set-Cookie 추가)

목표: 백엔드 login/signup 응답 시 발급한 access_token을 **httpOnly 쿠키 `access_token`으로 Set-Cookie** 한다.

작업 위치:
- `apps/api/src/auth/auth.controller.ts` (login, signup, logout 메서드)
- `apps/api/src/auth/auth.service.ts` (필요시 응답 타입 조정)

입력 조건:
- `auth.controller.ts`에서 `@Res({ passthrough: true })` response 객체를 받을 수 있다
- Express `res.cookie()`, `res.clearCookie()` 메서드를 사용할 수 있다
- 의존성: `cookie-parser` 없이 Express 내장 기능만으로 충분하다

변경 명세:
- `login` 메서드:
  - accessToken 발급 후 `res.cookie('access_token', token, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 3600000 })` 설정
  - 응답 바디에 `{ accessToken, user: { id, email, nickname } }`를 반환한다
  - 상태: 200
- `signup` 메서드:
  - login과 동일하게 쿠키 설정
  - 응답 바디: `{ accessToken, user: { id, email, nickname } }`
  - 상태: 201 또는 200
- `logout` 메서드:
  - `res.clearCookie('access_token', { path: '/' })`로 쿠키 제거
  - 응답 바디: `{ message: "Logged out" }`
  - 상태: 200
- CORS: 이미 `credentials: true` 설정이 있는지 확인하고, 없으면 `main.ts`에 추가 (프론트 fetch가 `credentials: 'include'`를 사용하므로)

완료 기준:
- [ ] `curl -i -X POST http://localhost:8080/api/auth/login -H "Content-Type: application/json" -d '{"email":"test@dobbit.dev","password":"Test1234!"}'` → 200, 응답에 accessToken + user 정보, **Set-Cookie: access_token=...** 헤더 포함
- [ ] 잘못된 비밀번호로 로그인 시 401 (Unauthorized)
- [ ] logout 후 `Set-Cookie: access_token=; Max-Age=0` 또는 유사 헤더로 쿠키 삭제
- [ ] 프론트 `middleware.ts`의 `request.cookies.get('access_token')`이 쿠키를 읽을 수 있도록 동작 확인 (curl 실행 후 수동 테스트 또는 프론트 app 실행)
- [ ] `pnpm --filter api typecheck` 통과

참고 문서:
- Express.Response.cookie() 문서
- CORS credentials 설정

## 작업 3: auth.service 실제 구현 + 테스트 계정 시드

목표: `auth.service.ts`의 login/signup/refresh를 실제 구현하고, DB에 테스트 계정을 시드한다.

작업 위치:
- `apps/api/src/auth/auth.service.ts`
- `apps/api/prisma/seed.ts` (생성)
- `apps/api/package.json` (prisma seed 설정)

입력 조건:
- `User` 모델이 `prisma/schema.prisma`에 정의되어 있다: `id(cuid)`, `email(unique)`, `passwordHash`, `nickname`, 등
- `bcrypt` 및 `@types/bcrypt`가 이미 의존성에 있다
- Prisma ORM이 `@prisma/client`로 설정되어 있다

변경 명세:

### `auth.service.ts`
- `signup(email, password, nickname?)` 메서드:
  - 이메일 중복 검사: `prisma.user.findUnique({ where: { email } })`
  - 중복이면 `ConflictException` 발생 (409)
  - `bcrypt.hash(password, 10)`으로 passwordHash 생성
  - `prisma.user.create({ data: { email, passwordHash, nickname: nickname || '사용자' } })`로 저장
  - JWT 발급: `{ userId: user.id }`
  - 응답: `{ accessToken: jwt, user: { id, email, nickname } }`

- `login(email, password)` 메서드:
  - `prisma.user.findUnique({ where: { email } })`로 사용자 조회
  - 없으면 `UnauthorizedException` 발생 (401)
  - `bcrypt.compare(password, user.passwordHash)`로 비밀번호 검증
  - 실패면 `UnauthorizedException` 발생 (401)
  - JWT 발급: `{ userId: user.id }`
  - 응답: `{ accessToken: jwt, user: { id, email, nickname } }`

- `refresh(request)` 메서드:
  - request body에 있는 `accessToken` 또는 쿠키에서 토큰 추출
  - JWT 디코딩하여 `userId` 추출
  - `prisma.user.findUnique({ where: { id: userId } })`로 실제 user 조회
  - 없으면 예외 발생
  - 새 JWT 발급
  - 응답: `{ accessToken: jwt }`

- 기존 더미 구현 제거, 실제 DB 호출로 교체

### `prisma/seed.ts` (생성)
```typescript
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'test@dobbit.dev';
  const password = 'Test1234!';
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      nickname: '테스트 계정',
    },
  });

  console.log('Seeded user:', user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### `package.json` (prisma 설정 추가)
```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

완료 기준:
- [ ] `apps/api/src/auth/auth.service.ts`에서 더미 코드가 제거되고 bcrypt, prisma를 사용한 실제 로직으로 변경됨
- [ ] `login`: 정상 입력 → 200, 잘못된 비밀번호 → 401
- [ ] `signup`: 새 이메일 → 201/200, 중복 이메일 → 409
- [ ] `refresh`: userId 추출 후 실제 user 조회 로직 포함
- [ ] `prisma/seed.ts` 파일 생성, bcrypt 해시 저장, `upsert`로 멱등성 보장
- [ ] `apps/api/package.json`에 `"prisma": { "seed": "ts-node prisma/seed.ts" }` 설정
- [ ] `pnpm prisma db seed` 실행 후 DB `users` 테이블에 test@dobbit.dev 계정이 존재 (password hash 저장 확인)
- [ ] `pnpm --filter api typecheck` 통과

참고 문서:
- `CLAUDE.md` Auth Service 구현
- Prisma ORM 문서
- bcrypt 문서

## 통합 완료 기준

다음 모든 조건을 만족해야 작업이 완료되었다고 판정한다:

- [ ] **작업 1 완료**: 모든 컨트롤러 경로에 `api/` prefix 추가
  - 검증: `curl -i -X POST http://localhost:8080/api/auth/login ...` → 404 아님
- [ ] **작업 2 완료**: login/signup 시 Set-Cookie 헤더 포함, logout 시 clearCookie
  - 검증: `curl -i -X POST ...` → Set-Cookie 헤더 존재
- [ ] **작업 3 완료**: auth.service 실제 구현 + 시드 적용
  - 검증: `pnpm prisma db seed` 후 DB users 테이블에 test@dobbit.dev 존재
  - 검증: `curl -X POST http://localhost:8080/api/auth/login -d '{"email":"test@dobbit.dev","password":"Test1234!"}'` → 200, user 정보 반환
  - 검증: 잘못된 비밀번호 → 401
- [ ] **전체 검증**:
  - `pnpm typecheck` (api, web) 통과
  - `pnpm --filter api lint` 통과 (가능한 경우)
  - DB 쿠키 전송 → 프론트 middleware 쿠키 읽기 → 로그인 상태 유지 (end-to-end 동작 확인)

## 실행 순서

1. 작업 1 (API 경로): 파일 변경 완료 후 npm run dev로 서버 재시작, curl 테스트
2. 작업 2 (쿠키): 작업 1 위에서 cookie/clearCookie 추가, curl 테스트
3. 작업 3 (auth.service + seed): auth.service 구현 후 seed 실행, DB 확인, 다시 curl 테스트

작업 1과 2는 순차적 의존성 있음 (같은 컨트롤러 파일). 작업 3은 독립적 (같은 auth 모듈이지만 분리 가능).

---

## Codex 호출 형식

각 작업은 다음 형식으로 Codex(`codex:codex-rescue`)에 위임:

```
목표: [제목]
작업 위치: [파일 경로]
입력 조건: [전제 조건]
완료 기준:
  - [ ] [검증 가능한 조건 1]
  - [ ] [검증 가능한 조건 2]
...
참고 문서: [경로]
```

exec_ready
