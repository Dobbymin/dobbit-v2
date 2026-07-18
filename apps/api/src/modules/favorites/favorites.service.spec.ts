import { UnauthorizedException } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../../common/prisma/prisma.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';

describe('FavoritesService', () => {
  const userId = 'context-user-id';
  let prisma: {
    favorite: {
      findMany: ReturnType<typeof vi.fn>;
      upsert: ReturnType<typeof vi.fn>;
      deleteMany: ReturnType<typeof vi.fn>;
    };
  };
  let service: FavoritesService;

  beforeEach(() => {
    prisma = {
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
    expect(() => guard.handleRequest(null, false, undefined)).toThrow(UnauthorizedException);
    expect(() => guard.handleRequest(null, false, undefined)).toThrow('Unauthorized');
  });

  it('does not throw when favorite already exists', async () => {
    await expect(service.addFavorite(userId, 'KRW-BTC')).resolves.toBeUndefined();
  });

  // Complex PK collision validation requires live DB; defer to integration tests.
});
