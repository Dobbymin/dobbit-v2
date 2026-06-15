import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface UpbitMarket {
  market: string;
  korean_name: string;
  english_name: string;
}

interface UpbitTicker {
  market: string;
  trade_price: number;
  signed_change_rate: number;
  acc_trade_volume_24h: number;
  trade_timestamp: number;
}

interface UpbitCandle {
  market: string;
  candle_date_time_kst: string;
  candle_date_time_utc: string;
  opening_price: number;
  high_price: number;
  low_price: number;
  trade_price: number;
  candle_acc_trade_volume: number;
}

@Injectable()
export class UpbitApiClient {
  private readonly baseUrl = 'https://api.upbit.com/v1';

  constructor(private readonly http: HttpService) {}

  async getMarkets(): Promise<UpbitMarket[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<UpbitMarket[]>(`${this.baseUrl}/market/all`, {
          params: { isDetails: false },
        }),
      );
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch markets:', error);
      return [];
    }
  }

  async getTickers(marketCodes: string[]): Promise<UpbitTicker[]> {
    if (marketCodes.length === 0) {
      return [];
    }
    try {
      const response = await firstValueFrom(
        this.http.get<UpbitTicker[]>(`${this.baseUrl}/ticker`, {
          params: { markets: marketCodes.join(',') },
        }),
      );
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch tickers:', error);
      return [];
    }
  }

  async getCandles(marketCode: string, unit = 1, count = 200): Promise<UpbitCandle[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<UpbitCandle[]>(`${this.baseUrl}/candles/minutes/${unit}`, {
          params: { market: marketCode, count },
        }),
      );
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch candles:', error);
      return [];
    }
  }

  async getOrderbook(marketCode: string): Promise<unknown> {
    try {
      const response = await firstValueFrom(
        this.http.get(`${this.baseUrl}/orderbook`, {
          params: { markets: marketCode },
        }),
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch orderbook:', error);
      return null;
    }
  }
}
