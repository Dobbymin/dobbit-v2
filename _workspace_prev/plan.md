# Milestone 2 — 서버 기반 구축 작업 계획

**마일스톤 목표:** NestJS API 기본 구조를 확립하고, Prisma + PostgreSQL 연동, 도메인 모듈 기본 구조(Auth, Market, Trade, Wallet, Alert, News), Swagger 문서화를 완료한다.

**현재 상태 요약:**
- `apps/api`: NestJS 10 기본 구조 (main.ts, app.module.ts, app.service.ts)
- `packages/shared`: 빈 TypeScript 패키지 (index.ts만 존재)
- `packages/eslint-config`, `packages/typescript-config`: 기본 설정
- PostgreSQL, Redis 로컬 환경 미구성
- Prisma 미설치

**완료 조건:**
1. Prisma 설치, schema.prisma 초기 모델 작성, 마이그레이션 설정
2. Docker Compose로 로컬 PostgreSQL + Redis 구성
3. NestJS 도메인 모듈 기본 구조 (Auth, Market, Trade, Wallet, Alert, News)
4. packages/shared에 공통 타입, DTO, WebSocket 이벤트 타입 정의
5. Swagger 문서 설정
6. `pnpm build`로 전체 워크스페이스 빌드 성공
7. `pnpm dev` 명령어로 api 로컬 개발 서버 실행 가능

---

## 작업 목록 (순서 중요)

### 작업 1: Prisma 설치 및 schema.prisma 초기 작성

**목표:** Prisma를 설치하고 schema.prisma에 핵심 모델(User, Market, CashBalance, Wallet, Trade, BalanceHistory, MarketSnapshot, NewsArticle, NewsMarketTag, NewsAnalysis, NewsAnalysisRun, PredictionReview, LearningSample, AlertRule, Notification, NotificationDelivery, SlackIntegration)을 정의한다.

**작업 위치:** `apps/api/`

**입력 조건:**
- `apps/api/package.json` 이미 존재
- `packages/shared` 이미 존재 (공통 타입 정의는 이후 작업)

**완료 기준:**
- [ ] `apps/api/prisma/schema.prisma` 파일 존재
- [ ] schema.prisma에 17개 모델 정의 (User, Market, CashBalance, Wallet, Trade, BalanceHistory, MarketSnapshot, NewsArticle, NewsMarketTag, NewsAnalysis, NewsAnalysisRun, PredictionReview, LearningSample, AlertRule, Notification, NotificationDelivery, SlackIntegration)
- [ ] 모든 관계(1:N, 1:1) 명시
- [ ] User, CashBalance, Wallet, Trade, AlertRule, Notification 등 주요 모델의 필드 완성
- [ ] `apps/api/.env` (또는 `.env.example`) 예제 존재 (DATABASE_URL 포함)
- [ ] `apps/api/package.json`에 `@prisma/client` 및 `prisma` 종속성 추가됨
- [ ] `pnpm install` 실행 후 `node_modules/.prisma/client` 생성됨
- [ ] `npx prisma generate` 실행 가능

**참고 문서:** `/Users/gimgangmin/Desktop/Dev/wiki/workspace/project/portfolio-renewal/Dobbit/docs/설계/DB 설계.md`

---

### 작업 2: Docker Compose로 로컬 PostgreSQL + Redis 구성

**목표:** 로컬 개발 환경에서 PostgreSQL 15, Redis를 실행할 수 있도록 docker-compose.yml을 작성한다.

**작업 위치:** `docker/docker-compose.yml`

**입력 조건:**
- `docker/` 디렉터리 존재
- Prisma schema.prisma 완성 (작업 1)

**완료 기준:**
- [ ] `docker/docker-compose.yml` 파일 존재
- [ ] PostgreSQL 15 서비스 정의 (포트 5432, 환경 변수: POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB)
- [ ] Redis 7 서비스 정의 (포트 6379)
- [ ] 볼륨 설정으로 로컬 데이터 영구 저장 (postgres-data, redis-data 볼륨)
- [ ] `docker-compose up -d` 실행 후 PostgreSQL, Redis 정상 실행 확인 가능
- [ ] `apps/api/.env`에 DATABASE_URL 설정 가능 (예: `postgresql://user:password@localhost:5432/dobbit_dev`)
- [ ] README 또는 docker/ 디렉터리에 실행 가법 문서 추가 (선택사항이지만 권장)

**참고 문서:** 없음 (표준 docker-compose 구성)

---

### 작업 3: Prisma 마이그레이션 초기 설정

**목표:** `prisma migrate dev` 명령어로 로컬 PostgreSQL에 초기 스키마를 적용할 수 있도록 설정한다.

**작업 위치:** `apps/api/`

**입력 조건:**
- schema.prisma 완성 (작업 1)
- Docker Compose PostgreSQL 실행 중 (작업 2)
- DATABASE_URL 환경 변수 설정

**완료 기준:**
- [ ] `apps/api/prisma/migrations/001_initial/migration.sql` 파일 생성됨
- [ ] `prisma migrate dev --name initial` 실행 후 로컬 PostgreSQL에 테이블 생성됨
- [ ] Prisma Client 생성 (`node_modules/.prisma/client` 업데이트)
- [ ] `npx prisma studio` 실행 가능 (선택사항이지만 권장)

**참고 문서:** `/Users/gimgangmin/Desktop/Dev/wiki/workspace/project/portfolio-renewal/Dobbit/docs/설계/DB 설계.md`

---

### 작업 4: packages/shared에 공통 타입, DTO 정의

**목표:** 서버와 클라이언트 간 공유 타입 정의 (Auth DTO, Market DTO, Trade DTO, Wallet DTO, Alert DTO, Notification DTO, News DTO, WebSocket 이벤트 타입)를 packages/shared에 작성한다.

**작업 위치:** `packages/shared/src/`

**입력 조건:**
- `packages/shared` 디렉터리 존재
- Prisma schema 완성 (작업 1)

**완료 기준:**
- [ ] `packages/shared/src/index.ts` 경로 정의 (export 관리)
- [ ] `packages/shared/src/types/` 디렉터리 존재
- [ ] `packages/shared/src/dtos/` 디렉터리 존재
- [ ] 다음 DTO 타입 정의 (최소):
  - AuthDTO: SignupRequest, LoginRequest, AuthResponse, TokenPayload
  - MarketDTO: Market, MarketSnapshot, CurrentPrice
  - TradeDTO: Trade, BuyRequest, SellRequest, TradeResponse
  - WalletDTO: CashBalance, Wallet (자산), AssetSummary
  - AlertDTO: AlertRule, AlertCondition, NotificationResponse
  - NewsDTO: NewsArticle, NewsAnalysis, NewsAnalysisRun
  - WebSocket이벤트: 공개 채널 (market:price-update, market:orderbook-update), 개인 채널 (wallet:balance-change, wallet:trade-executed, alert:triggered)
- [ ] TypeScript strict mode 호환 (tsconfig.json 검증)
- [ ] `packages/shared/package.json`의 exports 필드가 src/index.ts를 가리킴
- [ ] `pnpm build -F @dobbit/shared` 실행 성공

**참고 문서:** `/Users/gimgangmin/Desktop/Dev/wiki/workspace/project/portfolio-renewal/Dobbit/docs/설계/API 설계.md`, `/Users/gimgangmin/Desktop/Dev/wiki/workspace/project/portfolio-renewal/Dobbit/docs/설계/WebSocket 이벤트 설계.md`

---

### 작업 5: NestJS Auth 모듈 기본 구조

**목표:** JWT 기반 인증 모듈의 기본 구조를 만들고, signup, login, refresh, logout 핸들러 스켈레톤을 작성한다.

**작업 위치:** `apps/api/src/auth/`

**입력 조건:**
- NestJS 기본 구조 (main.ts, app.module.ts) 존재
- Prisma User 모델 완성
- @dobbit/shared 공통 타입 정의

**완료 기준:**
- [ ] `apps/api/src/auth/` 디렉터리 구조:
  - `auth.module.ts` — Auth 모듈 정의
  - `auth.service.ts` — 인증 비즈니스 로직 (signup, login, refresh, logout 메서드)
  - `auth.controller.ts` — 라우트 핸들러 (@Post signup, login, refresh 등)
  - `dto/` — Auth DTO (SignupRequest, LoginRequest, AuthResponse)
  - `guards/` — JWT Guard, AuthGuard 스켈레톤
  - `strategies/` — Passport JWT Strategy 스켈레톤
- [ ] `apps/api/package.json`에 `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `bcrypt` 종속성 추가
- [ ] `auth.module.ts`가 JwtModule, PassportModule 임포트
- [ ] `app.module.ts`가 AuthModule 임포트
- [ ] `POST /auth/signup`, `POST /auth/login`, `POST /auth/refresh` 라우트 정의 (구현은 미완성, 200 응답만)
- [ ] TypeScript strict 모드 컴파일 성공

**참고 문서:** `/Users/gimgangmin/Desktop/Dev/wiki/workspace/project/portfolio-renewal/Dobbit/docs/설계/API 설계.md` (Auth API 섹션)

---

### 작업 6: NestJS Market 모듈 기본 구조

**목표:** 시장 정보 조회 모듈의 기본 구조를 만들고, Upbit API 연동 스켈레톤을 작성한다.

**작업 위치:** `apps/api/src/market/`

**입력 조건:**
- NestJS 기본 구조 존재
- Prisma Market, MarketSnapshot 모델 완성

**완료 기준:**
- [ ] `apps/api/src/market/` 디렉터리 구조:
  - `market.module.ts`
  - `market.service.ts` — 시장 데이터 조회 로직 (getMarkets, getCurrentPrice 등)
  - `market.controller.ts` — 라우트 핸들러 (@Get markets, @Get markets/:code/price)
  - `dto/` — Market DTO
  - `external/` — Upbit API 클라이언트 스켈레톤
- [ ] `market.module.ts`가 HttpModule 임포트 (Upbit API 호출용)
- [ ] `app.module.ts`가 MarketModule 임포트
- [ ] `GET /market/markets`, `GET /market/markets/:code/price` 라우트 정의 (구현은 미완성)
- [ ] TypeScript strict 모드 컴파일 성공

**참고 문서:** `/Users/gimgangmin/Desktop/Dev/wiki/workspace/project/portfolio-renewal/Dobbit/docs/설계/API 설계.md` (Market API 섹션)

---

### 작업 7: NestJS Trade 모듈 기본 구조

**목표:** 거래(매수/매도) 모듈의 기본 구조를 만들고, 거래 검증 및 기록 스켈레톤을 작성한다.

**작업 위치:** `apps/api/src/trade/`

**입력 조건:**
- NestJS 기본 구조 존재
- Prisma Trade, Wallet, CashBalance, BalanceHistory 모델 완성
- Auth 모듈 완성 (인증 가드 사용)

**완료 기준:**
- [ ] `apps/api/src/trade/` 디렉터리 구조:
  - `trade.module.ts`
  - `trade.service.ts` — 거래 로직 (buyOrder, sellOrder, cancelOrder, getTradeHistory)
  - `trade.controller.ts` — 라우트 핸들러 (@Post buy, @Post sell, @Get history)
  - `dto/` — Trade DTO (BuyRequest, SellRequest, TradeResponse)
  - `validators/` — 거래 검증 로직 스켈레톤 (잔고 확인, 수량 확인)
- [ ] `trade.module.ts`가 PrismaService 주입 (별도 PrismaService 생성 필요)
- [ ] `app.module.ts`가 TradeModule 임포트
- [ ] `POST /trade/buy`, `POST /trade/sell`, `GET /trade/history` 라우트 정의
- [ ] TypeScript strict 모드 컴파일 성공

**참고 문서:** `/Users/gimgangmin/Desktop/Dev/wiki/workspace/project/portfolio-renewal/Dobbit/docs/설계/DB 설계.md` (Trade 트랜잭션)

---

### 작업 8: NestJS Wallet 모듈 기본 구조

**목표:** 자산 관리 모듈의 기본 구조를 만들고, 잔고 조회 및 평가손익 계산 스켈레톤을 작성한다.

**작업 위치:** `apps/api/src/wallet/`

**입력 조건:**
- NestJS 기본 구조 존재
- Prisma Wallet, CashBalance, MarketSnapshot 모델 완성
- Market 모듈 완성 (현재가 조회)

**완료 기준:**
- [ ] `apps/api/src/wallet/` 디렉터리 구조:
  - `wallet.module.ts`
  - `wallet.service.ts` — 자산 조회 로직 (getCashBalance, getHoldings, getAssetSummary)
  - `wallet.controller.ts` — 라우트 핸들러 (@Get balance, @Get holdings, @Get summary)
  - `dto/` — Wallet DTO (CashBalance, Holding, AssetSummary)
- [ ] `app.module.ts`가 WalletModule 임포트
- [ ] `GET /wallet/balance`, `GET /wallet/holdings`, `GET /wallet/summary` 라우트 정의
- [ ] TypeScript strict 모드 컴파일 성공

**참고 문서:** `/Users/gimgangmin/Desktop/Dev/wiki/workspace/project/portfolio-renewal/Dobbit/docs/설계/API 설계.md` (Wallet API 섹션)

---

### 작업 9: NestJS Alert 모듈 기본 구조

**목표:** 리스크 알림 모듈의 기본 구조를 만들고, 알림 조건 관리 및 평가 로직 스켈레톤을 작성한다.

**작업 위치:** `apps/api/src/alert/`

**입력 조건:**
- NestJS 기본 구조 존재
- Prisma AlertRule, Notification, NotificationDelivery, SlackIntegration 모델 완성

**완료 기준:**
- [ ] `apps/api/src/alert/` 디렉터리 구조:
  - `alert.module.ts`
  - `alert.service.ts` — 알림 조건 관리 로직 (createRule, updateRule, deleteRule, evaluateRules)
  - `alert.controller.ts` — 라우트 핸들러 (@Post rule, @Put rule/:id, @Delete rule/:id, @Get rules)
  - `dto/` — Alert DTO (CreateAlertRuleRequest, AlertRuleResponse)
  - `evaluators/` — 알림 조건 평가 로직 스켈레톤 (PriceChangeEvaluator, ProfitRateEvaluator 등)
  - `notifiers/` — 알림 발송 스켈레톤 (WebSocketNotifier, SlackNotifier)
- [ ] `app.module.ts`가 AlertModule 임포트
- [ ] `POST /alert/rules`, `PUT /alert/rules/:id`, `DELETE /alert/rules/:id`, `GET /alert/rules` 라우트 정의
- [ ] TypeScript strict 모드 컴파일 성공

**참고 문서:** `/Users/gimgangmin/Desktop/Dev/wiki/workspace/project/portfolio-renewal/Dobbit/docs/설계/알림 설계.md`

---

### 작업 10: NestJS News 모듈 기본 구조

**목표:** 뉴스 수집/분석 모듈의 기본 구조를 만들고, Hermes/Gemini 에이전트 연동 스켈레톤을 작성한다.

**작업 위치:** `apps/api/src/news/`

**입력 조건:**
- NestJS 기본 구조 존재
- Prisma NewsArticle, NewsAnalysis, NewsAnalysisRun, PredictionReview, LearningSample 모델 완성

**완료 기준:**
- [ ] `apps/api/src/news/` 디렉터리 구조:
  - `news.module.ts`
  - `news.service.ts` — 뉴스 조회/분석 로직 (getArticles, runAnalysis, getPredictionReview)
  - `news.controller.ts` — 라우트 핸들러 (@Get articles, @Post analyze, @Get reviews)
  - `dto/` — News DTO (NewsArticleResponse, NewsAnalysisResponse)
  - `collectors/` — 뉴스 수집 스켈레톤 (NaverNewsCollector 등)
  - `analyzers/` — AI 분석 스켈레톤 (HermesAnalyzer, GeminiAnalyzer)
- [ ] `app.module.ts`가 NewsModule 임포트
- [ ] `GET /news/articles`, `POST /news/analyze`, `GET /news/reviews` 라우트 정의
- [ ] TypeScript strict 모드 컴파일 성공

**참고 문서:** `/Users/gimgangmin/Desktop/Dev/wiki/workspace/project/portfolio-renewal/Dobbit/docs/설계/API 설계.md` (News API 섹션)

---

### 작업 11: PrismaService 생성 및 모듈 연동

**목표:** NestJS 모듈에서 Prisma를 사용하기 위한 PrismaService를 생성하고, 모든 모듈에서 주입 가능하도록 설정한다.

**작업 위치:** `apps/api/src/common/`

**입력 조건:**
- Prisma 설치 완료
- 모든 도메인 모듈 스켈레톤 완성

**완료 기준:**
- [ ] `apps/api/src/common/prisma/prisma.service.ts` 파일 생성
- [ ] PrismaService가 PrismaClient를 래핑하고 onModuleInit, onModuleDestroy 구현
- [ ] `app.module.ts`가 PrismaService를 providers에 추가
- [ ] 모든 도메인 모듈에서 constructor(private prisma: PrismaService) 패턴으로 주입 가능
- [ ] `pnpm build` 실행 성공

**참고 문서:** 없음 (표준 NestJS Prisma 통합)

---

### 작업 12: Swagger 문서 설정

**목표:** @nestjs/swagger를 설정하고, 모든 API 엔드포인트에 데코레이터를 추가해 자동 문서화를 활성화한다.

**작업 위치:** `apps/api/src/`

**입력 조건:**
- 모든 도메인 모듈 완성
- 모든 DTO 정의 완성

**완료 기준:**
- [ ] `apps/api/package.json`에 `@nestjs/swagger`, `swagger-ui-express` 종속성 추가
- [ ] `main.ts`에서 SwaggerModule.createDocument(), setupModule() 호출
- [ ] 모든 Controller에 @Controller, @Post, @Get 데코레이터 적용
- [ ] 모든 DTO에 @ApiProperty 데코레이터 적용
- [ ] `GET /api-docs` 또는 `/api` 경로에서 Swagger UI 확인 가능
- [ ] `pnpm build` 실행 성공

**참고 문서:** 없음 (표준 NestJS Swagger 통합)

---

### 작업 13: 전체 워크스페이스 빌드 및 개발 서버 검증

**목표:** pnpm workspace 전체를 빌드하고, apps/api의 개발 서버가 정상 실행 가능함을 검증한다.

**작업 위치:** `/`

**입력 조건:**
- 모든 작업 1-12 완성

**완료 기준:**
- [ ] `pnpm install` 실행 성공
- [ ] `pnpm build` 실행 성공 (모든 패키지 및 앱)
- [ ] `pnpm -F api dev` 실행 후 NestJS 개발 서버 시작 (포트 3000 기본)
- [ ] `curl http://localhost:3000/health` 응답 확인 (200 OK)
- [ ] Swagger UI: `curl http://localhost:3000/api-docs` 접근 가능
- [ ] PostgreSQL 마이그레이션 자동 실행 또는 수동 실행 문서 제공
- [ ] 개발 서버 실행 중 파일 변경 감지 및 자동 재시작 정상 작동

**참고 문서:** `/Users/gimgangmin/Desktop/Dev/project/dobbit-v2/CLAUDE.md`

---

## 작업 간 의존 관계

```
작업 1 (Prisma schema 작성)
  ↓
작업 2 (Docker Compose 설정)
  ↓
작업 3 (Prisma 마이그레이션)
  ↓
┌─────────────────────────────────────────┐
│ 병렬 실행 가능                             │
├─────────────────────────────────────────┤
│ 작업 4 (shared 공통 타입)                │
│ 작업 5 (Auth 모듈)                      │
│ 작업 6 (Market 모듈)                    │
│ 작업 7 (Trade 모듈)                     │
│ 작업 8 (Wallet 모듈)                    │
│ 작업 9 (Alert 모듈)                     │
│ 작업 10 (News 모듈)                     │
└─────────────────────────────────────────┘
  ↓
작업 11 (PrismaService 설정)
  ↓
작업 12 (Swagger 문서)
  ↓
작업 13 (전체 빌드 및 검증)
```

---

## 참고 문서

- **실행 계획서:** `/Users/gimgangmin/Desktop/Dev/wiki/workspace/project/portfolio-renewal/Dobbit/docs/Dobbit 실행 계획서.md`
- **DB 설계:** `/Users/gimgangmin/Desktop/Dev/wiki/workspace/project/portfolio-renewal/Dobbit/docs/설계/DB 설계.md`
- **API 설계:** `/Users/gimgangmin/Desktop/Dev/wiki/workspace/project/portfolio-renewal/Dobbit/docs/설계/API 설계.md`
- **WebSocket 이벤트 설계:** `/Users/gimgangmin/Desktop/Dev/wiki/workspace/project/portfolio-renewal/Dobbit/docs/설계/WebSocket 이벤트 설계.md`
- **알림 설계:** `/Users/gimgangmin/Desktop/Dev/wiki/workspace/project/portfolio-renewal/Dobbit/docs/설계/알림 설계.md`
- **CLAUDE.md:** `/Users/gimgangmin/Desktop/Dev/project/dobbit-v2/CLAUDE.md`

---

## 다음 단계

작업 1부터 Codex에게 전달하기 시작한다. 각 작업은 위의 Codex 작업 지시 형식을 따라 명확한 입력 조건, 완료 기준, 참고 문서를 포함한다.

완료된 각 작업은 다음과 같이 기록된다:
- **작업 로그:** `/Users/gimgangmin/Desktop/Dev/wiki/workspace/project/portfolio-renewal/Dobbit/docs/작업로그/` 에 YYYY-MM-DD.md 파일로 저장
- **검증 로그:** 구현 완료 후 테스트 결과, 빌드 성공 여부, 실패 및 수정 내용을 기록

Codex 구현 결과는 Claude Code가 검토 후 작업 로그에 요약한다.
