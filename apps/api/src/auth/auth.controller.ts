import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupRequest, LoginRequest, AuthResponse } from '@dobbit/shared';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() request: SignupRequest): Promise<AuthResponse> {
    return this.authService.signup(request);
  }

  @Post('login')
  async login(@Body() request: LoginRequest): Promise<AuthResponse> {
    return this.authService.login(request);
  }

  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string): Promise<AuthResponse> {
    return this.authService.refresh(refreshToken);
  }

  @Post('logout')
  async logout(): Promise<{ message: string }> {
    return this.authService.logout();
  }
}
