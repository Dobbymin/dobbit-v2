import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class InternalTokenGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers['x-internal-token'] as string;
    const expectedToken = this.config.get<string>('INTERNAL_CRON_TOKEN');

    if (!expectedToken) {
      throw new ForbiddenException('INTERNAL_CRON_TOKEN이 설정되지 않았습니다');
    }

    if (!token || token !== expectedToken) {
      throw new ForbiddenException('Invalid or missing internal token');
    }

    return true;
  }
}
