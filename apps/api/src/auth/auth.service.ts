import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma/prisma.service';
import type { SignupRequest, LoginRequest, AuthResponse, TokenPayload } from '@dobbit/shared';
import * as bcrypt from 'bcrypt';

const NICKNAME_MIN_LENGTH = 2;
const NICKNAME_MAX_LENGTH = 24;

export interface UserProfile {
  id: string;
  username: string;
  nickname: string;
  createdAt: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async signup(request: SignupRequest): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { username: request.username },
    });

    if (existingUser) {
      throw new ConflictException('이미 사용 중인 아이디예요.');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(request.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        username: request.username,
        passwordHash,
        nickname: request.nickname || '사용자',
      },
    });

    // Generate JWT
    const accessToken = this.jwtService.sign({ sub: user.id, username: user.username });

    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
      },
    };
  }

  async login(request: LoginRequest): Promise<AuthResponse> {
    // Find user by username
    const user = await this.prisma.user.findUnique({
      where: { username: request.username },
    });

    if (!user) {
      throw new UnauthorizedException('아이디 또는 비밀번호가 일치하지 않아요.');
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(request.password, user.passwordHash);

    if (!passwordMatch) {
      throw new UnauthorizedException('아이디 또는 비밀번호가 일치하지 않아요.');
    }

    // Generate JWT
    const accessToken = this.jwtService.sign({ sub: user.id, username: user.username });

    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
      },
    };
  }

  async refresh(token: string): Promise<AuthResponse> {
    // Verify and decode the token
    let payload: TokenPayload;
    try {
      payload = this.jwtService.verify<TokenPayload>(token);
    } catch {
      throw new UnauthorizedException('세션이 만료됐어요. 다시 로그인해 주세요.');
    }

    // Get user from DB
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없어요.');
    }

    // Generate new JWT
    const accessToken = this.jwtService.sign({ sub: user.id, username: user.username });

    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
      },
    };
  }

  logout(): Promise<{ message: string }> {
    return Promise.resolve({ message: 'Logged out successfully' });
  }

  async getProfile(userId: string): Promise<UserProfile> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없어요.');
    }

    return this.toProfile(user);
  }

  async updateNickname(userId: string, nickname: string): Promise<UserProfile> {
    const trimmed = typeof nickname === 'string' ? nickname.trim() : '';

    if (trimmed.length < NICKNAME_MIN_LENGTH || trimmed.length > NICKNAME_MAX_LENGTH) {
      throw new BadRequestException(
        `닉네임은 ${NICKNAME_MIN_LENGTH}자 이상 ${NICKNAME_MAX_LENGTH}자 이하로 입력해 주세요.`,
      );
    }

    const existing = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existing) {
      throw new UnauthorizedException('사용자를 찾을 수 없어요.');
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { nickname: trimmed },
    });

    return this.toProfile(user);
  }

  private toProfile(user: { id: string; username: string; nickname: string; createdAt: Date }): UserProfile {
    return {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      createdAt: user.createdAt.toISOString(),
    };
  }

  validateToken(token: string): TokenPayload | null {
    try {
      return this.jwtService.verify<TokenPayload>(token);
    } catch {
      return null;
    }
  }
}
