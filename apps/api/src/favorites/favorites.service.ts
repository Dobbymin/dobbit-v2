import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async getFavorites(userId: string): Promise<string[]> {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      select: { marketCode: true },
      orderBy: { createdAt: 'asc' },
    });

    return favorites.map((favorite) => favorite.marketCode);
  }

  async addFavorite(userId: string, marketCode: string): Promise<void> {
    if (typeof marketCode !== 'string' || !/^KRW-[A-Z0-9]+$/.test(marketCode)) {
      throw new BadRequestException('유효하지 않은 마켓 코드입니다.');
    }

    const market = await this.prisma.market.findUnique({ where: { code: marketCode } });
    if (!market) throw new BadRequestException(`Market ${marketCode} not found`);

    await this.prisma.favorite.upsert({
      where: { userId_marketCode: { userId, marketCode } },
      create: { userId, marketCode },
      update: {},
    });
  }

  async removeFavorite(userId: string, marketCode: string): Promise<void> {
    await this.prisma.favorite.deleteMany({
      where: { userId, marketCode },
    });
  }
}
