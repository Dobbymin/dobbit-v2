import { Logger } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../common/prisma/prisma.service';
import type { Market } from '@dobbit/shared';
import type { UpbitApiClient } from './external/upbit-api.client';
import { MarketService } from './market.service';

describe('MarketService', () => {
  let prisma: {
    market: {
      findMany: ReturnType<typeof vi.fn>;
      updateMany: ReturnType<typeof vi.fn>;
      upsert: ReturnType<typeof vi.fn>;
    };
  };
  let service: MarketService;

  const market = (code: string): Market => ({
    id: code,
    code,
    symbol: code.replace('KRW-', ''),
    koreanName: `${code} Korean`,
    englishName: `${code} English`,
    isActive: true,
  });

  beforeEach(() => {
    prisma = {
      market: {
        findMany: vi.fn().mockResolvedValue([]),
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        upsert: vi.fn().mockResolvedValue({}),
      },
    };
    service = new MarketService(
      { getMarkets: vi.fn() } as unknown as UpbitApiClient,
      prisma as unknown as PrismaService,
    );
  });

  it('deactivates active markets missing from Upbit response', async () => {
    const activeCodes = ['KRW-BTC', 'KRW-ETH'];
    vi.spyOn(service, 'getMarkets').mockResolvedValue(activeCodes.map(market));
    prisma.market.findMany.mockResolvedValue([{ code: 'KRW-AERGO' }]);
    prisma.market.updateMany.mockResolvedValue({ count: 1 });

    await service.syncMarkets();

    expect(prisma.market.updateMany).toHaveBeenCalledWith({
      where: { code: { notIn: activeCodes }, isActive: true },
      data: { isActive: false },
    });
  });

  it('does not deactivate markets included in Upbit response', async () => {
    vi.spyOn(service, 'getMarkets').mockResolvedValue([market('KRW-BTC')]);

    await service.syncMarkets();

    expect(prisma.market.upsert).toHaveBeenCalledWith(expect.objectContaining({ where: { code: 'KRW-BTC' } }));
    expect(prisma.market.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { code: { notIn: ['KRW-BTC'] }, isActive: true },
      }),
    );
  });

  it('skips deactivation when Upbit returns no markets', async () => {
    const warn = vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    vi.spyOn(service, 'getMarkets').mockResolvedValue([]);

    await service.syncMarkets();

    expect(prisma.market.upsert).not.toHaveBeenCalled();
    expect(prisma.market.findMany).not.toHaveBeenCalled();
    expect(prisma.market.updateMany).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith('Skipping market deactivation because Upbit returned no KRW markets');
  });

  it('only selects and deactivates currently active markets', async () => {
    vi.spyOn(service, 'getMarkets').mockResolvedValue([market('KRW-BTC')]);

    await service.syncMarkets();

    const where = { code: { notIn: ['KRW-BTC'] }, isActive: true };
    expect(prisma.market.findMany).toHaveBeenCalledWith({ where, select: { code: true } });
    expect(prisma.market.updateMany).toHaveBeenCalledWith({
      where,
      data: { isActive: false },
    });
  });
});
