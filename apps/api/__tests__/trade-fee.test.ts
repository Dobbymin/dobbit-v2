import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { calculateTradeFee } from '@dobbit/shared';
import type { PrismaService } from '../src/common/prisma/prisma.service';
import type { MarketService } from '../src/market/market.service';
import { TradeService } from '../src/trade/trade.service';
import { TradeValidator } from '../src/trade/validators/trade.validator';

const userId = 'user-1';
const market = { id: 'market-1', code: 'KRW-BTC' };
const price = 1_000_000;
const quantity = 1;

const createTrade = (fee: string) => ({
  id: 'trade-1',
  price: String(price),
  quantity: String(quantity),
  totalAmount: String(price * quantity),
  fee,
  executedAt: new Date('2026-08-03T00:00:00.000Z'),
});

const createService = (cashAmount: string, wallet: object | null = null) => {
  const tx = {
    cashBalance: {
      findUnique: vi.fn().mockResolvedValue({ amount: cashAmount }),
      update: vi.fn().mockResolvedValue({}),
      upsert: vi.fn().mockResolvedValue({}),
    },
    wallet: {
      findUnique: vi.fn().mockResolvedValue(wallet),
      upsert: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({}),
    },
    trade: {
      create: vi.fn().mockImplementation(({ data }) => Promise.resolve(createTrade(data.fee))),
    },
    balanceHistory: {
      create: vi.fn().mockResolvedValue({}),
    },
  };
  const prisma = {
    market: { findUnique: vi.fn().mockResolvedValue(market) },
    $transaction: async (callback: (transaction: typeof tx) => Promise<unknown>) => callback(tx),
  } as unknown as PrismaService;
  const marketService = {
    getCurrentPrice: vi.fn().mockResolvedValue({ tradePrice: price }),
  } as unknown as MarketService;

  return {
    service: new TradeService(prisma, new TradeValidator(), marketService),
    tx,
  };
};

describe('trade fee', () => {
  it('calculates 0.05% fee', () => {
    expect(calculateTradeFee(1_000_000)).toBe(500);
  });

  it('rejects buy when balance covers total amount but not fee', async () => {
    const { service } = createService('1000000');

    await expect(service.buyOrder(userId, market.code, quantity, price)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('deducts buy fee from cash and stores it on trade', async () => {
    const { service, tx } = createService('1000500');

    await service.buyOrder(userId, market.code, quantity, price);

    expect(tx.cashBalance.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { amount: { decrement: '1000500' } } }),
    );
    expect(tx.trade.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ fee: '500' }) }));
  });

  it('includes buy fee in wallet cost and average price', async () => {
    const { service, tx } = createService('1000500');

    await service.buyOrder(userId, market.code, quantity, price);

    expect(tx.wallet.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ totalCost: '1000500', averagePrice: '1000500' }),
      }),
    );
  });

  it('adds sell settlement after fee to cash', async () => {
    const { service, tx } = createService('0', {
      id: 'wallet-1',
      quantity: '1',
      totalCost: '1000000',
    });

    await service.sellOrder(userId, market.code, quantity, price);

    expect(tx.cashBalance.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ update: { amount: { increment: '999500' } } }),
    );
  });
});
