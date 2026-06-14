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

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('market:join')
  handleMarketJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: MarketJoinDto,
  ): void {
    const channel = `market:${data.marketCode}`;
    client.join(channel);
    this.logger.debug(`Client ${client.id} joined channel: ${channel}`);
  }

  @SubscribeMessage('market:leave')
  handleMarketLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: MarketJoinDto,
  ): void {
    const channel = `market:${data.marketCode}`;
    client.leave(channel);
    this.logger.debug(`Client ${client.id} left channel: ${channel}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('private:join')
  handlePrivateJoin(
    @ConnectedSocket() client: Socket,
  ): PrivateJoinResponse {
    const userId = client.data.userId;
    const channel = `user:${userId}`;
    client.join(channel);
    this.logger.debug(`Client ${client.id} joined private channel: ${channel}`);
    return { userId };
  }
}
