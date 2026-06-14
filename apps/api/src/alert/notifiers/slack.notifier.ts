import { Injectable } from '@nestjs/common';

@Injectable()
export class SlackNotifier {
  notify(userId: string, message: string): void {
    // TODO: Implement Slack notification
    // Send webhook to Slack integration
  }
}
