import { Controller, Post, Put, Delete, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AlertService } from './alert.service';
import { AlertRule, CreateAlertRuleRequest, UpdateAlertRuleRequest } from '@dobbit/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('alert')
@UseGuards(JwtAuthGuard)
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @Post('rules')
  async createRule(@Req() req: any, @Body() request: CreateAlertRuleRequest): Promise<AlertRule> {
    return this.alertService.createRule(req.user.userId, request);
  }

  @Put('rules/:id')
  async updateRule(
    @Req() req: any,
    @Param('id') ruleId: string,
    @Body() request: UpdateAlertRuleRequest,
  ): Promise<AlertRule> {
    return this.alertService.updateRule(req.user.userId, ruleId, request);
  }

  @Delete('rules/:id')
  async deleteRule(@Req() req: any, @Param('id') ruleId: string): Promise<void> {
    return this.alertService.deleteRule(req.user.userId, ruleId);
  }

  @Get('rules')
  async getRules(@Req() req: any): Promise<AlertRule[]> {
    return this.alertService.getRules(req.user.userId);
  }
}
