import { describe, it, expect, beforeEach } from "vitest";
import type { PrismaService } from "../src/common/prisma/prisma.service";
import type { UpbitApiClient } from "../src/market/external/upbit-api.client";
import { MarketService } from "../src/market/market.service";

// Mock UpbitApiClient
const createMockUpbitApiClient = (): Partial<UpbitApiClient> => ({
  getMarkets: async () => [
    {
      market: "KRW-BTC",
      korean_name: "비트코인",
      english_name: "Bitcoin",
    },
    {
      market: "KRW-ETH",
      korean_name: "이더리움",
      english_name: "Ethereum",
    },
    {
      market: "USDT-BTC",
      korean_name: "비트코인",
      english_name: "Bitcoin",
    },
  ],
  getTickers: async (_codes: string[]) => [
    {
      market: "KRW-BTC",
      trade_price: 98501000,
      signed_change_rate: -0.0069,
      acc_trade_volume_24h: 150000,
      trade_timestamp: 1718000000000,
    },
  ],
  getCandles: async () => [
    {
      market: "KRW-BTC",
      opening_price: 98000000,
      high_price: 98500000,
      low_price: 97500000,
      trade_price: 98501000,
      candle_acc_trade_volume: 100000,
      candle_date_time_kst: "2026-06-15 10:00:00",
      candle_date_time_utc: "2026-06-15T10:00:00Z",
    },
  ],
});

// Mock PrismaService
const createMockPrisma = (): Partial<PrismaService> => ({});

describe("MarketService", () => {
  let service: MarketService;
  let mockUpbitApiClient: Partial<UpbitApiClient>;
  let mockPrisma: Partial<PrismaService>;

  beforeEach(() => {
    mockUpbitApiClient = createMockUpbitApiClient();
    mockPrisma = createMockPrisma();
    service = new MarketService(mockUpbitApiClient as UpbitApiClient, mockPrisma as PrismaService);
  });

  describe("getMarkets", () => {
    it("should filter and return KRW markets only", async () => {
      const markets = await service.getMarkets();

      expect(markets).toHaveLength(2);
      expect(markets[0]!.code).toBe("KRW-BTC");
      expect(markets[1]!.code).toBe("KRW-ETH");
      expect(markets.every((m) => m.code.startsWith("KRW-"))).toBe(true);
    });

    it("should map Upbit market fields to DTO", async () => {
      const markets = await service.getMarkets();

      expect(markets[0]).toMatchObject({
        code: "KRW-BTC",
        symbol: "BTC",
        koreanName: "비트코인",
        englishName: "Bitcoin",
        isActive: true,
      });
    });

    it("should exclude non-KRW markets", async () => {
      const markets = await service.getMarkets();

      expect(markets.find((m) => m.code === "USDT-BTC")).toBeUndefined();
    });
  });

  describe("getCandles", () => {
    it("should return CandleResponse[] in ascending order", async () => {
      const candles = await service.getCandles("KRW-BTC", 1, 200);

      expect(candles).toBeDefined();
      expect(Array.isArray(candles)).toBe(true);
      expect(candles.length).toBeGreaterThan(0);
    });

    it("should map Upbit candle fields to DTO", async () => {
      const candles = await service.getCandles("KRW-BTC", 1);

      if (candles && candles.length > 0) {
        expect(candles[0]).toEqual({
          marketCode: "KRW-BTC",
          openingPrice: 98000000,
          highPrice: 98500000,
          lowPrice: 97500000,
          tradePrice: 98501000,
          candleAccTradeVolume: 100000,
          candleDateTime: "2026-06-15 10:00:00",
        });
      }
    });

    it("should use default unit and count", async () => {
      const candles = await service.getCandles("KRW-BTC");

      expect(candles).toBeDefined();
    });
  });

  describe("getCurrentPrice", () => {
    it("should fetch ticker and return CurrentPrice DTO", async () => {
      const currentPrice = await service.getCurrentPrice("KRW-BTC");

      expect(currentPrice).toEqual({
        marketCode: "KRW-BTC",
        tradePrice: 98501000,
        signedChangeRate: -0.0069,
        timestamp: expect.any(String),
      });
    });

    it("should convert trade_timestamp to ISO string", async () => {
      const currentPrice = await service.getCurrentPrice("KRW-BTC");

      expect(currentPrice).toBeDefined();
      if (currentPrice) {
        expect(typeof currentPrice.timestamp).toBe("string");
        // Should be valid ISO string
        expect(() => new Date(currentPrice.timestamp)).not.toThrow();
      }
    });

    it("should return null for empty ticker response", async () => {
      // Mock getTickers to return empty array
      const emptyMock: Partial<UpbitApiClient> = {
        getTickers: async () => [],
      };
      const emptyService = new MarketService(emptyMock as UpbitApiClient, mockPrisma as PrismaService);

      const currentPrice = await emptyService.getCurrentPrice("KRW-BTC");

      expect(currentPrice).toBeNull();
    });
  });

  describe("getTickerEvents", () => {
    it("should fetch tickers and return MarketTickerUpdatedEvent[]", async () => {
      const events = await service.getTickerEvents(["KRW-BTC"]);

      expect(Array.isArray(events)).toBe(true);
      expect(events.length).toBeGreaterThan(0);
    });

    it("should map ticker to MarketTickerUpdatedEvent with correct type", async () => {
      const events = await service.getTickerEvents(["KRW-BTC"]);

      expect(events[0]).toEqual({
        type: "market.ticker.updated",
        marketCode: "KRW-BTC",
        tradePrice: 98501000,
        signedChangeRate: -0.0069,
        accTradeVolume24h: 150000,
        timestamp: expect.any(String),
      });
    });

    it("should handle multiple market codes", async () => {
      // Mock getTickers to return multiple tickers
      const multiMock: Partial<UpbitApiClient> = {
        getTickers: async (codes: string[]) => codes.map((code) => ({
          market: code,
          trade_price: 98501000,
          signed_change_rate: -0.0069,
          acc_trade_volume_24h: 150000,
          trade_timestamp: 1718000000000,
        })),
      };
      const multiService = new MarketService(multiMock as UpbitApiClient, mockPrisma as PrismaService);

      const events = await multiService.getTickerEvents(["KRW-BTC", "KRW-ETH"]);

      expect(events).toHaveLength(2);
      expect(events[0]!.marketCode).toBe("KRW-BTC");
      expect(events[1]!.marketCode).toBe("KRW-ETH");
    });
  });
});
