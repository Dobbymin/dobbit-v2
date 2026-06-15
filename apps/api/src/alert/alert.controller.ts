import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { AlertService } from './alert.service';
import {
  AlertEvaluationRequest,
  AlertEvaluationResult,
  AlertRule,
  CreateAlertRuleRequest,
  MarkNotificationReadResponse,
  NotificationListResponse,
  SlackIntegrationResponse,
  SlackTestResponse,
  SlackWebhookUpsertRequest,
  UpdateAlertRuleRequest,
} from '@dobbit/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

type AuthenticatedRequest = {
  user: {
    userId: string;
  };
};

@Controller('api/alert')
@UseGuards(JwtAuthGuard)
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @Post('rules')
  async createRule(@Req() req: AuthenticatedRequest, @Body() request: CreateAlertRuleRequest): Promise<AlertRule> {
    return this.alertService.createRule(req.user.userId, request);
  }

  @Put('rules/:id')
  async updateRule(
    @Req() req: AuthenticatedRequest,
    @Param('id') ruleId: string,
    @Body() request: UpdateAlertRuleRequest,
  ): Promise<AlertRule> {
    return this.alertService.updateRule(req.user.userId, ruleId, request);
  }

  @Delete('rules/:id')
  async deleteRule(@Req() req: AuthenticatedRequest, @Param('id') ruleId: string): Promise<void> {
    return this.alertService.deleteRule(req.user.userId, ruleId);
  }

  @Get('rules')
  async getRules(@Req() req: AuthenticatedRequest): Promise<AlertRule[]> {
    return this.alertService.getRules(req.user.userId);
  }

  @Get('notifications')
  async getNotifications(
    @Req() req: AuthenticatedRequest,
    @Query('unreadOnly') unreadOnly?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<NotificationListResponse> {
    return this.alertService.getNotifications(req.user.userId, {
      unreadOnly: unreadOnly === 'true',
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Patch('notifications/:id/read')
  async markNotificationRead(
    @Req() req: AuthenticatedRequest,
    @Param('id') notificationId: string,
  ): Promise<MarkNotificationReadResponse> {
    return this.alertService.markNotificationRead(req.user.userId, notificationId);
  }

  @Get('slack')
  async getSlackIntegration(@Req() req: AuthenticatedRequest): Promise<SlackIntegrationResponse> {
    return this.alertService.getSlackIntegration(req.user.userId);
  }

  @Put('slack')
  async upsertSlackIntegration(
    @Req() req: AuthenticatedRequest,
    @Body() request: SlackWebhookUpsertRequest,
  ): Promise<SlackIntegrationResponse> {
    return this.alertService.upsertSlackIntegration(req.user.userId, request);
  }

  @Post('slack/test')
  async testSlackIntegration(@Req() req: AuthenticatedRequest): Promise<SlackTestResponse> {
    return this.alertService.testSlackIntegration(req.user.userId);
  }

  @Post('evaluate')
  async evaluate(@Body() request: AlertEvaluationRequest): Promise<AlertEvaluationResult> {
    return this.alertService.evaluateMarketSnapshot(request);
  }
}
