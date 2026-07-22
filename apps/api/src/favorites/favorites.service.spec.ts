import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../common/prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';

describe('FavoritesService', () => {
  const userId = 'context-user-id';
  let prisma: {
    market: {
      findUnique: ReturnType<typeof vi.fn>;
    };
    favorite: {
      findMany: ReturnType<typeof vi.fn>;
      upsert: ReturnType<typeof vi.fn>;
      deleteMany: ReturnType<typeof vi.fn>;
    };
  };
  let service: FavoritesService;

  beforeEach(() => {
    prisma = {
      market: {
        findUnique: vi.fn().mockResolvedValue({ code: 'KRW-BTC' }),
      },
      favorite: {
        findMany: vi.fn().mockResolvedValue([{ marketCode: 'KRW-BTC' }]),
        upsert: vi.fn().mockResolvedValue({}),
        deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
    };
    service = new FavoritesService(prisma as unknown as PrismaService);
  });

  it('uses only context userId', async () => {
    await service.addFavorite(userId, 'KRW-BTC');

    expect(prisma.favorite.upsert).toHaveBeenCalledWith({
      where: { userId_marketCode: { userId, marketCode: 'KRW-BTC' } },
      create: { userId, marketCode: 'KRW-BTC' },
      update: {},
    });
  });

  it('requires JWT, so a missing JWT receives 401 from JwtAuthGuard', () => {
    expect(Reflect.getMetadata(GUARDS_METADATA, FavoritesController)).toContain(JwtAuthGuard);

    const guard = new JwtAuthGuard();
    expect(() => {
      guard.handleRequest(null, false, undefined);
    }).toThrow(UnauthorizedException);
    expect(() => {
      guard.handleRequest(null, false, undefined);
    }).toThrow('Unauthorized');
  });

  it('rejects invalid marketCodes before upsert', async () => {
    for (const marketCode of ['', 'krw-btc', 'KRWBTC', 'KRW-', 'KRW-BTC-USD', 123, undefined]) {
      await expect(service.addFavorite(userId, marketCode as string)).rejects.toThrow(BadRequestException);
    }

    expect(prisma.favorite.upsert).not.toHaveBeenCalled();
  });

  it('rejects nonexistent markets before upsert', async () => {
    prisma.market.findUnique.mockResolvedValue(null);

    await expect(service.addFavorite(userId, 'KRW-BTC')).rejects.toThrow(BadRequestException);
    expect(prisma.favorite.upsert).not.toHaveBeenCalled();
  });

  it('accepts valid marketCodes', async () => {
    for (const marketCode of ['KRW-BTC', 'KRW-ETH', 'KRW-1INCH', 'KRW-API3', 'KRW-0G', 'KRW-2Z']) {
      await expect(service.addFavorite(userId, marketCode)).resolves.toBeUndefined();
      expect(prisma.favorite.upsert).toHaveBeenCalledWith({
        where: { userId_marketCode: { userId, marketCode } },
        create: { userId, marketCode },
        update: {},
      });
    }
  });

  // Complex PK collision validation requires live DB; defer to integration tests.
});
