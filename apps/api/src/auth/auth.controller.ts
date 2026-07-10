import { Controller, Post, Body, Res, Req, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
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
      maxAge: 604800000, // 7 days
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
      maxAge: 604800000, // 7 days
    });
    return response;
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<AuthResponse> {
    const token = req.cookies?.['access_token'] as string | undefined;
    if (!token) {
      throw new UnauthorizedException('Missing refresh cookie');
    }
    const response = await this.authService.refresh(token);
    res.cookie('access_token', response.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 604800000, // 7 days
    });
    return response;
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response): Promise<{ message: string }> {
    res.clearCookie('access_token', { path: '/' });
    return this.authService.logout();
  }
}
