import { Module } from '@nestjs/common';
import { AlertService } from './alert.service';
import { AlertController } from './alert.controller';
import { PrismaService } from '../common/prisma/prisma.service';

@Module({
  providers: [AlertService, PrismaService],
  controllers: [AlertController],
  exports: [AlertService],
})
export class AlertModule {}
