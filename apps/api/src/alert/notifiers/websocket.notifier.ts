import { Injectable } from '@nestjs/common';

@Injectable()
export class WebSocketNotifier {
  notify(userId: string, message: string): void {
    // TODO: Implement WebSocket notification
    // Send notification through WebSocket gateway to user
  }
}
