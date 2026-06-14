import { Injectable } from '@nestjs/common';
import { RealtimeService } from '../../realtime/realtime.service';
import { NotificationCreatedEvent, NotificationDeliveryFailedEvent } from '@dobbit/shared';

@Injectable()
export class WebSocketNotifier {
  constructor(private readonly realtimeService: RealtimeService) {}

  notify(event: NotificationCreatedEvent): void {
    this.realtimeService.emitToUser(event.userId, event);
  }

  notifyDeliveryFailed(event: NotificationDeliveryFailedEvent): void {
    this.realtimeService.emitToUser(event.userId, event);
  }
}
