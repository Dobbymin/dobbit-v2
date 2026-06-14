import { Injectable, Logger } from '@nestjs/common';
import { WebSocketEvent, WsChannels } from '@dobbit/shared';
import { RealtimeGateway } from './realtime.gateway';

@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);

  constructor(private readonly gateway: RealtimeGateway) {}

  emitToMarket(marketCode: string, event: WebSocketEvent): void {
    const channel = WsChannels.market(marketCode);
    this.gateway.server.to(channel).emit(event.type, event);
    this.logger.debug(`Emitted event "${event.type}" to channel: ${channel}`);
  }

  emitToUser(userId: string, event: WebSocketEvent): void {
    const channel = WsChannels.user(userId);
    this.gateway.server.to(channel).emit(event.type, event);
    this.logger.debug(`Emitted event "${event.type}" to channel: ${channel}`);
  }

  emitToAll(event: WebSocketEvent): void {
    this.gateway.server.emit(event.type, event);
    this.logger.debug(`Emitted event "${event.type}" to all clients`);
  }
}
