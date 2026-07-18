import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

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
