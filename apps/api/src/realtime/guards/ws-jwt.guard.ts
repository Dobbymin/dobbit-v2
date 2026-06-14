import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Socket } from 'socket.io';
import { TokenPayload } from '@dobbit/shared';

interface SocketAuth {
  token?: string;
}

interface AuthenticatedSocketData {
  userId?: string;
}

type AuthenticatedSocket = Socket & {
  data: unknown;
  handshake: Socket['handshake'] & {
    auth: SocketAuth;
  };
};

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<AuthenticatedSocket>();

    try {
      const token = client.handshake.auth.token ?? this.extractTokenFromHeader(client.handshake.headers.authorization);

      if (!token) {
        client.emit('error', { message: 'Unauthorized: No token provided' });
        client.disconnect();
        return false;
      }

      const payload: TokenPayload = await this.jwtService.verifyAsync<TokenPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const socketData = client.data as AuthenticatedSocketData;
      socketData.userId = payload.sub;
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`JWT verification failed: ${errorMessage}`);
      client.emit('error', { message: 'Unauthorized: Invalid token' });
      client.disconnect();
      return false;
    }
  }

  private extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader) return null;
    const parts = authHeader.split(' ');
    return parts.length === 2 && parts[0] === 'Bearer' ? parts[1] : null;
  }
}
