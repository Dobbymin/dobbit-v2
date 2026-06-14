import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma/prisma.service';
import type { SignupRequest, LoginRequest, AuthResponse, TokenPayload } from '@dobbit/shared';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  signup(request: SignupRequest): Promise<AuthResponse> {
    const token = this.jwtService.sign({ userId: 'dummy' });
    return Promise.resolve({
      accessToken: token,
      user: {
        id: 'dummy',
        email: request.email,
        nickname: request.nickname,
      },
    });
  }

  login(request: LoginRequest): Promise<AuthResponse> {
    const token = this.jwtService.sign({ userId: 'dummy' });
    return Promise.resolve({
      accessToken: token,
      user: {
        id: 'dummy',
        email: request.email,
        nickname: 'user',
      },
    });
  }

  refresh(refreshToken: string): Promise<AuthResponse> {
    void refreshToken;
    const token = this.jwtService.sign({ userId: 'dummy' });
    return Promise.resolve({
      accessToken: token,
      user: {
        id: 'dummy',
        email: 'user@example.com',
        nickname: 'user',
      },
    });
  }

  logout(): Promise<{ message: string }> {
    return Promise.resolve({ message: 'Logged out successfully' });
  }

  validateToken(token: string): TokenPayload | null {
    try {
      return this.jwtService.verify<TokenPayload>(token);
    } catch {
      return null;
    }
  }
}
