# Dobbit v2 Backend Phase 1: Upbit 실시간 Ticker 및 Candle 구현 결과

## 작업 완료 상태

**전체 상태: ✅ 성공**

모든 완료 기준을 충족하고 build/lint 검증 완료.

---

## 완료 기준 검증

| 기준 | 상태 | 확인 |
|------|------|------|
| `pnpm --filter api build` 통과 | ✅ | 타입 에러 0 |
| `pnpm --filter api lint` 통과 | ✅ | 에러 0 (기존 warning 5개는 turbo.json 설정) |
| emitToMarket 호출 구현 | ✅ | `market-ticker.poller.ts:44` 확인 |
| GET /api/market/markets/:code/candles 추가 | ✅ | `market.controller.ts:19` 라우트 존재 |
| UpbitApiClient 등록/주입 | ✅ | `market.module.ts` providers 등록, MarketService에 주입 |

---

## 변경 파일 목록 (8개)

### 신규 파일 (1개)
```
apps/api/src/realtime/market-ticker.poller.ts (1.5KB)
```

### 수정 파일 (7개)
```
apps/api/src/auth/auth.controller.ts             (prettier 포맷팅)
apps/api/src/market/external/upbit-api.client.ts (구현)
apps/api/src/market/market.controller.ts         (candles 라우트)
apps/api/src/market/market.module.ts             (UpbitApiClient 등록)
apps/api/src/market/market.service.ts            (변환 로직)
apps/api/src/realtime/realtime.gateway.ts        (구독 추적)
apps/api/src/realtime/realtime.module.ts         (MarketModule import)
```

---

## 구현 상세

### 1. UpbitApiClient (apps/api/src/market/external/upbit-api.client.ts)

**목적**: Upbit Open API 직접 호출 계층

```typescript
// 주요 메서드
async getMarkets(): Promise<UpbitMarket[]>
// GET https://api.upbit.com/v1/market/all?isDetails=false
// 반환: [{ market: "KRW-BTC", korean_name: "비트코인", english_name: "Bitcoin" }, ...]

async getTickers(marketCodes: string[]): Promise<UpbitTicker[]>
// GET https://api.upbit.com/v1/ticker?markets=KRW-BTC,KRW-ETH
// 반환: [{ market, trade_price, signed_change_rate, acc_trade_volume_24h, trade_timestamp }, ...]

async getCandles(marketCode: string, unit = 1, count = 200): Promise<UpbitCandle[]>
// GET https://api.upbit.com/v1/candles/minutes/{unit}?market=KRW-BTC&count=200
// 반환: [{ market, opening_price, high_price, low_price, trade_price, candle_acc_trade_volume, candle_date_time_kst }, ...]

async getOrderbook(marketCode: string): Promise<any>
// GET https://api.upbit.com/v1/orderbook?markets=KRW-BTC
```

**기술:**
- HttpService (@nestjs/axios) 주입
- rxjs firstValueFrom로 Promise 변환
- 에러 처리: try-catch, console.error, 기본값 반환

---

### 2. MarketService (apps/api/src/market/market.service.ts)

**목적**: Upbit 응답 → DTO 변환 및 비즈니스 로직

```typescript
async getMarkets(): Promise<Market[]>
// Upbit market/all 중 "KRW-" 마켓만 필터링
// 변환: { id, code, symbol (KRW- 제거), koreanName, englishName, isActive: true }

async getCurrentPrice(code: string): Promise<CurrentPrice | null>
// getTickers([code])[0]를 CurrentPrice로 변환
// trade_timestamp → ISO 문자열

async getCandles(code: string, unit = 1, count = 200): Promise<CandleResponse[]>
// getCandles() 결과를 CandleResponse[]로 변환
// 시간 오름차순 정렬 (Upbit은 최신순이므로 reverse())

async getTickerEvents(codes: string[]): Promise<MarketTickerUpdatedEvent[]>
// getTickers(codes) → MarketTickerUpdatedEvent[]로 매핑
// type: "market.ticker.updated"
// MarketTickerPoller에서 사용
```

**의존성:**
- UpbitApiClient 주입 (constructor)
- PrismaService 주입 (향후 캐싱용)
- Logger 사용

---

### 3. MarketController (apps/api/src/market/market.controller.ts)

**목적**: HTTP 엔드포인트 노출

```typescript
@Get('markets')
async getMarkets(): Promise<Market[]>
// 응답: 마켓 목록

@Get('markets/:code/price')
async getCurrentPrice(@Param('code') code: string): Promise<CurrentPrice | null>
// 응답: 단일 마켓 현재가

@Get('markets/:code/candles')  // [신규]
async getCandles(
  @Param('code') code: string,
  @Query('unit') unit: string = '1',     // 분봉 단위 (1, 5, 15, 30, 60, 240)
  @Query('count') count: string = '200',  // 캔들 개수
): Promise<CandleResponse[]>
// 응답: 캔들 배열 (시간 오름차순)
```

---

### 4. RealtimeGateway (apps/api/src/realtime/realtime.gateway.ts)

**목적**: WebSocket 구독/구독해제 + 마켓 레퍼런스 카운팅

```typescript
private readonly activeMarkets = new Map<string, number>();
// market → 구독자 수 추적

@SubscribeMessage('market:join')
handleMarketJoin(@ConnectedSocket() client: Socket, @MessageBody() data: MarketJoinDto)
// 마켓 룸 join (이미 있음)
// activeMarkets[marketCode]++ (신규)

@SubscribeMessage('market:leave')
handleMarketLeave(@ConnectedSocket() client: Socket, @MessageBody() data: MarketJoinDto)
// 마켓 룸 leave (이미 있음)
// activeMarkets[marketCode]-- / 0이면 삭제 (신규)

getActiveMarkets(): string[]  // [신규]
// 구독 중인 마켓 코드 배열
// MarketTickerPoller가 호출
```

---

### 5. MarketTickerPoller (apps/api/src/realtime/market-ticker.poller.ts)

**목적**: 2초마다 Upbit ticker 폴링 → WebSocket 브로드캐스트

```typescript
@Injectable()
export class MarketTickerPoller implements OnModuleInit, OnModuleDestroy {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly pollingIntervalMs = 2000;

  onModuleInit() {
    // setInterval(poll, 2000) 시작
    // NestJS 모듈 초기화 시 자동 시작
  }

  onModuleDestroy() {
    // clearInterval(intervalId)
    // NestJS 모듈 종료 시 정리
  }

  private async poll() {
    // 1. getActiveMarkets() 확인 (구독자 있는 마켓만)
    // 2. getTickerEvents(codes) 호출
    // 3. 각 event를 emitToMarket(code, event)로 발행
    // 4. 예외 처리: logger.warn, 폴링 계속
  }
}
```

**특징:**
- Promise 반환 메서드를 setInterval 콜백에서 `void` 처리
- 활성 마켓이 없으면 아무것도 하지 않음 (리소스 절약)
- 에러 발생해도 폴링 중단 안 함 (resilient)

---

### 6. MarketModule (apps/api/src/market/market.module.ts)

**변경:**
```typescript
// providers에 UpbitApiClient 추가
providers: [UpbitApiClient, MarketService, PrismaService]
```

**결과:**
- MarketService에서 `constructor(private readonly upbitApiClient: UpbitApiClient)` 자동 주입

---

### 7. RealtimeModule (apps/api/src/realtime/realtime.module.ts)

**변경:**
```typescript
imports: [
  JwtModule.registerAsync(...),
  MarketModule,  // [신규] MarketModule import
]
providers: [RealtimeGateway, RealtimeService, WsJwtGuard, MarketTickerPoller]  // [신규] MarketTickerPoller
```

**의존성 흐름:**
```
RealtimeModule
  ├─ imports MarketModule
  │   └─ provides MarketService
  │
  └─ provides MarketTickerPoller
      ├─ injects MarketService (MarketModule export)
      ├─ injects RealtimeService (local)
      └─ injects RealtimeGateway (local)
```

---

## 검증 결과

### 1. Build 검증
```bash
$ pnpm --filter api build
$ nest build

✅ 결과: 성공 (0 error, 0 warning)
```

### 2. Lint 검증
```bash
$ pnpm --filter api lint
$ eslint src

✅ 결과: 0 errors (5 warnings는 기존 turbo.json 설정 이슈)
```

### 3. 코드 검증 (grep)
```bash
✅ emitToMarket 호출: market-ticker.poller.ts:44
   this.realtimeService.emitToMarket(event.marketCode, event);

✅ candles 라우트: market.controller.ts:19
   @Get('markets/:code/candles')

✅ UpbitApiClient 등록: market.module.ts:10
   providers: [UpbitApiClient, MarketService, PrismaService]

✅ MarketTickerPoller 파일: 1.5KB, 60줄
   apps/api/src/realtime/market-ticker.poller.ts
```

---

## 기술 스택 & 원칙 준수

| 항목 | 상태 | 확인 |
|------|------|------|
| @nestjs/schedule 미사용 | ✅ | setInterval 기반 |
| 새 의존성 미추가 | ✅ | axios/rxjs/nest 기존만 사용 |
| Upbit 응답 타입 안전 | ✅ | interface 정의 (UpbitMarket, UpbitTicker, UpbitCandle) |
| 변환 로직 정확 | ✅ | CandleResponse 시간 오름차순, CurrentPrice ISO 타입변환 |
| apps/web 미수정 | ✅ | 백엔드만 변경 |

---

## 데이터 흐름 (End-to-End)

### 시나리오: 프론트엔드가 BTC chart 요청

```
1. 프론트엔드: WebSocket market:join { marketCode: "KRW-BTC" }
   → RealtimeGateway.handleMarketJoin()
   → activeMarkets["KRW-BTC"] = 1

2. MarketTickerPoller: 2초마다 poll()
   → getActiveMarkets() = ["KRW-BTC"]
   → getTickerEvents(["KRW-BTC"])
   → UpbitApiClient.getTickers(["KRW-BTC"])
   → 응답: [{ market: "KRW-BTC", trade_price: 99500000, ... }]
   → 변환: MarketTickerUpdatedEvent

3. emitToMarket("KRW-BTC", event)
   → gateway.server.to("market:KRW-BTC").emit("market.ticker.updated", event)
   → 프론트엔드가 리스닝 중인 클라이언트에게 전송

4. 프론트엔드: GET /api/market/markets/KRW-BTC/candles?unit=1&count=200
   → MarketController.getCandles("KRW-BTC", 1, 200)
   → MarketService.getCandles()
   → UpbitApiClient.getCandles()
   → 반환: CandleResponse[] (시간 오름차순)
   → Chart 렌더링
```

---

## 다음 단계 (Phase 2: Frontend)

프론트엔드(`apps/web`)에서 다음을 구현:

1. **Candle Chart 요청**
   ```typescript
   GET /api/market/markets/KRW-BTC/candles?unit=1&count=200
   // CandleResponse[] 수신
   ```

2. **WebSocket Subscribe**
   ```typescript
   socket.emit('market:join', { marketCode: 'KRW-BTC' });
   socket.on('market.ticker.updated', (event) => {
     // 실시간 ticker 업데이트
   });
   ```

3. **Chart 업데이트**
   - 초기 로드: REST API candle 데이터
   - 실시간: WebSocket ticker 이벤트로 last candle/가격 갱신

---

## 요약

| 항목 | 결과 |
|------|------|
| 구현 파일 | 8개 (신규 1, 수정 7) |
| Build 결과 | ✅ 성공 |
| Lint 결과 | ✅ 0 errors |
| 완료 기준 | ✅ 5/5 충족 |
| 제약/원칙 | ✅ 100% 준수 |
| 테스트 준비 | ✅ Phase 2 프론트엔드와 통합 가능 |

**Phase 1 백엔드 구현 완료.** 프론트엔드는 Phase 2에서 REST API + WebSocket을 통합하여 실시간 chart 구현 가능.

---

**구현 시작**: 2026-06-15 20:00
**구현 완료**: 2026-06-15 20:15
**구현자**: Claude Code (Implementer)
