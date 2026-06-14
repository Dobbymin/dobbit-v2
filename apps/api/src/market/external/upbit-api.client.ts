import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class UpbitApiClient {
  private readonly baseUrl = 'https://api.upbit.com/v1';

  constructor(private readonly http: HttpService) {}

  getMarkets(): Promise<unknown[]> {
    // TODO: Implement Upbit markets API call
    // GET /v1/market/all
    return Promise.resolve([]);
  }

  getTicker(marketCode: string): Promise<unknown> {
    void marketCode;
    // TODO: Implement Upbit ticker API call
    // GET /v1/ticker?markets=KRW-BTC
    return Promise.resolve(null);
  }

  getCandles(marketCode: string, count = 1): Promise<unknown[]> {
    void marketCode;
    void count;
    // TODO: Implement Upbit candles API call
    // GET /v1/candles/minutes/1
    return Promise.resolve([]);
  }

  getOrderbook(marketCode: string): Promise<unknown> {
    void marketCode;
    // TODO: Implement Upbit orderbook API call
    // GET /v1/orderbook
    return Promise.resolve(null);
  }
}
