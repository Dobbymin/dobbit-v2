import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { TokenPayload } from '@dobbit/shared';
import type { Request } from 'express';
import type { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader || Array.isArray(authHeader)) {
      throw new UnauthorizedException('로그인이 필요해요.');
    }

    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer') {
      throw new UnauthorizedException('로그인이 필요해요.');
    }

    if (!token) {
      throw new UnauthorizedException('로그인이 필요해요.');
    }

    const payload = this.authService.validateToken(token);
    if (!payload) {
      throw new UnauthorizedException('세션이 만료됐어요. 다시 로그인해 주세요.');
    }

    request.user = payload;
    return true;
  }
}
