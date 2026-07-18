import { Module } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';

@Module({
  providers: [FavoritesService, PrismaService],
  controllers: [FavoritesController],
  exports: [FavoritesService],
})
export class FavoritesModule {}
