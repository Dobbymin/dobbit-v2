import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { SignupRequest, LoginRequest, AuthResponse } from '@dobbit/shared';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() request: SignupRequest, @Res({ passthrough: true }) res: Response): Promise<AuthResponse> {
    const response = await this.authService.signup(request);
    res.cookie('access_token', response.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 3600000, // 1 hour
    });
    return response;
  }

  @Post('login')
  async login(@Body() request: LoginRequest, @Res({ passthrough: true }) res: Response): Promise<AuthResponse> {
    const response = await this.authService.login(request);
    res.cookie('access_token', response.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 3600000, // 1 hour
    });
    return response;
  }

  @Post('refresh')
  async refresh(
    @Body('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const response = await this.authService.refresh(refreshToken);
    res.cookie('access_token', response.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 3600000, // 1 hour
    });
    return response;
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response): Promise<{ message: string }> {
    res.clearCookie('access_token', { path: '/' });
    return this.authService.logout();
  }
}
