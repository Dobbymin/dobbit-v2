# Dobbit v2 백엔드 Phase 1: Upbit 실시간 Ticker 및 Candle 구현

목표: Dobbit 백엔드(apps/api)에 Upbit 연동 + 실시간 ticker 발행 + 캔들 엔드포인트를 구현해 프론트 chart가 실데이터를 받을 수 있게 한다.

작업 위치: /Users/gimgangmin/Desktop/Dev/project/dobbit-v2/apps/api (필요 시 packages/shared)

## 현재 상태 (모두 스텁)
- apps/api/src/market/external/upbit-api.client.ts: getMarkets/getTicker/getCandles/getOrderbook 전부 TODO, 빈값 반환. baseUrl='https://api.upbit.com/v1', HttpService(@nestjs/axios) 주입돼 있음.
- apps/api/src/market/market.service.ts: getMarkets()→[], getCurrentPrice()→null (HttpService, PrismaService 주입). UpbitApiClient는 주입 안 돼 있고 market.module providers에도 없음.
- apps/api/src/market/market.controller.ts: @Controller('api/market'), GET markets, GET markets/:code/price 만 존재.
- apps/api/src/realtime/realtime.service.ts: emitToMarket(marketCode, event) 정의돼 있으나 호출처 0건.
- apps/api/src/realtime/realtime.gateway.ts: market:join / market:leave 핸들러가 socket room `market:${code}`에 join/leave. 구독 추적 없음.
- @nestjs/schedule 미설치. axios/HttpService는 사용 가능.
- 공유 타입(@dobbit/shared)에 이미 정의됨: Market, CurrentPrice, CandleResponse, MarketTickerUpdatedEvent(type:"market.ticker.updated", marketCode, tradePrice, signedChangeRate, accTradeVolume24h, timestamp), WsChannels.market(code)=`market:${code}`.

## 구현 내용

### 1) UpbitApiClient (apps/api/src/market/external/upbit-api.client.ts) — 실제 호출 구현 (rxjs firstValueFrom + this.http):
   - getMarkets(): GET `${baseUrl}/market/all?isDetails=false` → Upbit 원형 배열 반환 (각 `{market, korean_name, english_name}`).
   - getTickers(marketCodes: string[]): GET `${baseUrl}/ticker?markets=${codes.join(',')}` → 배열. (배치 1회 호출)
   - getCandles(marketCode, unit=1, count=200): GET `${baseUrl}/candles/minutes/${unit}?market=${marketCode}&count=${count}` → 배열.
   - 기존 getTicker(단일)·getOrderbook은 둘 중: getTicker는 getTickers로 대체하거나 남겨도 됨(빌드만 깨지지 않게). 사용 안 하면 제거 가능.

### 2) MarketService (market.service.ts) — UpbitApiClient 주입해서 변환 로직 구현:
   - getMarkets(): Promise<Market[]> — upbit market/all 중 code가 "KRW-"로 시작하는 것만 매핑. Market = { id: market코드, code: market, symbol: code에서 "KRW-" 제거, koreanName: korean_name, englishName: english_name, isActive: true }.
   - getCurrentPrice(code): Promise<CurrentPrice|null> — upbit ticker(getTickers([code])[0]) → { marketCode, tradePrice: trade_price, signedChangeRate: signed_change_rate, timestamp: ISO }. 없으면 null.
   - getCandles(code, unit=1, count=200): Promise<CandleResponse[]> — upbit candles 매핑 → { marketCode, openingPrice: opening_price, highPrice: high_price, lowPrice: low_price, tradePrice: trade_price, candleAccTradeVolume: candle_acc_trade_volume, candleDateTime: candle_date_time_kst(또는 utc) }. 시간 오름차순 정렬(upbit는 최신순이므로 reverse).
   - getTickerEvents(codes: string[]): Promise<MarketTickerUpdatedEvent[]> — getTickers 결과를 MarketTickerUpdatedEvent[]로 매핑 (type:"market.ticker.updated", marketCode, tradePrice, signedChangeRate, accTradeVolume24h: acc_trade_volume_24h, timestamp: ISO). 폴러가 사용.
   - market.module.ts providers에 UpbitApiClient 추가, MarketService에 주입.

### 3) MarketController: GET `markets/:code/candles` 추가 — query `unit`(기본 1), `count`(기본 200) 받아 marketService.getCandles(code, unit, count) 반환. 반환 타입 CandleResponse[].

### 4) 실시간 ticker 폴러:
   - RealtimeGateway에 구독 마켓 추적 추가: private 멤버(Map<string, number> 레퍼런스 카운트). market:join 시 +1, market:leave 시 -1(0이면 제거). public 메서드 getActiveMarkets(): string[] 노출.
   - 새 프로바이더 MarketTickerPoller (apps/api/src/realtime/market-ticker.poller.ts) 작성: OnModuleInit에서 setInterval(2000ms) 시작, OnModuleDestroy에서 clearInterval. 매 tick마다 gateway.getActiveMarkets()가 비어있지 않으면 marketService.getTickerEvents(codes) 호출 후 각 event를 realtimeService.emitToMarket(event.marketCode, event)로 발행. 예외는 logger.warn로 잡고 폴링 지속.
   - 모듈 와이어링: RealtimeModule이 MarketModule을 import(순환 없음: MarketModule은 RealtimeModule을 import하지 않음), providers에 MarketTickerPoller 추가. MarketModule은 MarketService를 이미 export함. RealtimeService/RealtimeGateway는 RealtimeModule 내부에 있으니 폴러에 주입 가능.

## 제약/원칙:
- @nestjs/schedule 새로 설치하지 말 것 — setInterval 기반으로 구현.
- 변환 외 불필요한 리팩터링 금지. Upbit 응답 타입은 필요한 필드만 안전하게 접근(any/unknown 최소화, 적절한 인터페이스 정의 권장).
- 새 의존성 추가 금지(axios/rxjs/nest 기존 것만 사용).

## 완료 기준:
  - [ ] `pnpm --filter api build` (nest build) 통과 — 타입 에러 0
  - [ ] `pnpm --filter api lint` (eslint src) 통과
  - [ ] emitToMarket가 MarketTickerPoller에서 실제 호출됨 (grep로 확인 가능)
  - [ ] GET /api/market/markets/:code/candles 라우트 추가됨
  - [ ] UpbitApiClient가 market.module providers에 등록되고 MarketService에 주입됨

## 작업 후 보고:
- build/lint 결과와 변경 파일 목록을 보고할 것. (프론트엔드는 Phase 2에서 별도 진행하니 apps/web은 건드리지 말 것.)
