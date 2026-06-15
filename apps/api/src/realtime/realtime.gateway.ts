import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from './guards/ws-jwt.guard';

interface MarketJoinDto {
  marketCode: string;
}

interface PrivateJoinResponse {
  userId: string;
}

interface PrivateSocketData {
  userId?: string;
}

type PrivateSocket = Socket & {
  data: unknown;
};

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);
  private readonly activeMarkets = new Map<string, number>();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('market:join')
  handleMarketJoin(@ConnectedSocket() client: Socket, @MessageBody() data: MarketJoinDto): void {
    const channel = `market:${data.marketCode}`;
    void client.join(channel);
    this.logger.debug(`Client ${client.id} joined channel: ${channel}`);

    // Increment reference count for this market
    const currentCount = this.activeMarkets.get(data.marketCode) || 0;
    this.activeMarkets.set(data.marketCode, currentCount + 1);
    this.logger.debug(`Market ${data.marketCode} subscription count: ${currentCount + 1}`);
  }

  @SubscribeMessage('market:leave')
  handleMarketLeave(@ConnectedSocket() client: Socket, @MessageBody() data: MarketJoinDto): void {
    const channel = `market:${data.marketCode}`;
    void client.leave(channel);
    this.logger.debug(`Client ${client.id} left channel: ${channel}`);

    // Decrement reference count for this market
    const currentCount = this.activeMarkets.get(data.marketCode) || 0;
    if (currentCount > 1) {
      this.activeMarkets.set(data.marketCode, currentCount - 1);
    } else {
      this.activeMarkets.delete(data.marketCode);
    }
    this.logger.debug(`Market ${data.marketCode} subscription count: ${Math.max(0, currentCount - 1)}`);
  }

  getActiveMarkets(): string[] {
    return Array.from(this.activeMarkets.keys());
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('private:join')
  handlePrivateJoin(@ConnectedSocket() client: PrivateSocket): PrivateJoinResponse {
    const socketData = client.data as PrivateSocketData;
    const userId = socketData.userId;
    if (!userId) {
      return { userId: '' };
    }
    const channel = `user:${userId}`;
    void client.join(channel);
    this.logger.debug(`Client ${client.id} joined private channel: ${channel}`);
    return { userId };
  }
}
