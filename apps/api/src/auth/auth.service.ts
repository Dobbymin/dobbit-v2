import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma/prisma.service';
import type { SignupRequest, LoginRequest, AuthResponse } from '@dobbit/shared';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async signup(request: SignupRequest): Promise<AuthResponse> {
    const token = this.jwtService.sign({ userId: 'dummy' });
    return {
      accessToken: token,
      user: {
        id: 'dummy',
        email: request.email,
        nickname: request.nickname,
      },
    };
  }

  async login(request: LoginRequest): Promise<AuthResponse> {
    const token = this.jwtService.sign({ userId: 'dummy' });
    return {
      accessToken: token,
      user: {
        id: 'dummy',
        email: request.email,
        nickname: 'user',
      },
    };
  }

  async refresh(refreshToken: string): Promise<AuthResponse> {
    const token = this.jwtService.sign({ userId: 'dummy' });
    return {
      accessToken: token,
      user: {
        id: 'dummy',
        email: 'user@example.com',
        nickname: 'user',
      },
    };
  }

  async logout(): Promise<{ message: string }> {
    return { message: 'Logged out successfully' };
  }

  async validateToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch {
      return null;
    }
  }
}
