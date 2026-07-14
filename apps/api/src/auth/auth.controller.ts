import { Controller, Post, Get, Patch, Body, Res, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService, type UserProfile } from './auth.service';
import { SignupRequest, LoginRequest, AuthResponse } from '@dobbit/shared';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

interface UserRequest extends Request {
  user: {
    userId: string;
  };
}

interface UpdateNicknameRequest {
  nickname: string;
}

const ACCESS_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 604800000, // 7 days
} as const;

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() request: SignupRequest, @Res({ passthrough: true }) res: Response): Promise<AuthResponse> {
    const response = await this.authService.signup(request);
    res.cookie('access_token', response.accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
    return response;
  }

  @Post('login')
  async login(@Body() request: LoginRequest, @Res({ passthrough: true }) res: Response): Promise<AuthResponse> {
    const response = await this.authService.login(request);
    res.cookie('access_token', response.accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
    return response;
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<AuthResponse> {
    const token = req.cookies?.['access_token'] as string | undefined;
    if (!token) {
      throw new UnauthorizedException('Missing access token cookie');
    }
    const response = await this.authService.refresh(token);
    res.cookie('access_token', response.accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
    return response;
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response): Promise<{ message: string }> {
    res.clearCookie('access_token', { path: '/' });
    return this.authService.logout();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: UserRequest): Promise<UserProfile> {
    return this.authService.getProfile(req.user.userId);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateMe(@Req() req: UserRequest, @Body() request: UpdateNicknameRequest): Promise<UserProfile> {
    return this.authService.updateNickname(req.user.userId, request.nickname);
  }
}
