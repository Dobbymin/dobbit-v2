import { Module } from '@nestjs/common';
import { AlertService } from './alert.service';
import { AlertController } from './alert.controller';
import { PrismaService } from '../common/prisma/prisma.service';
import { RealtimeModule } from '../realtime/realtime.module';
import { WebSocketNotifier } from './notifiers/websocket.notifier';
import { SlackNotifier } from './notifiers/slack.notifier';
import { PriceChangeEvaluator } from './evaluators/price-change.evaluator';

@Module({
  imports: [RealtimeModule],
  providers: [AlertService, PrismaService, WebSocketNotifier, SlackNotifier, PriceChangeEvaluator],
  controllers: [AlertController],
  exports: [AlertService],
})
export class AlertModule {}
