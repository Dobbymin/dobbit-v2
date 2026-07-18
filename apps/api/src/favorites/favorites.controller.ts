import { Body, Controller, Delete, Get, HttpCode, Param, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FavoritesService } from './favorites.service';

interface UserRequest extends Request {
  user: {
    userId: string;
  };
}

interface CreateFavoriteRequest {
  marketCode: string;
}

@Controller('api/favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  getFavorites(@Req() req: UserRequest): Promise<string[]> {
    return this.favoritesService.getFavorites(req.user.userId);
  }

  @Post()
  @HttpCode(200)
  async addFavorite(@Req() req: UserRequest, @Body() request: CreateFavoriteRequest): Promise<void> {
    await this.favoritesService.addFavorite(req.user.userId, request.marketCode);
  }

  @Delete(':marketCode')
  @HttpCode(204)
  async removeFavorite(@Req() req: UserRequest, @Param('marketCode') marketCode: string): Promise<void> {
    await this.favoritesService.removeFavorite(req.user.userId, marketCode);
  }
}
