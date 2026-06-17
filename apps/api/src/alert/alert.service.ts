import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { WebSocketNotifier } from './notifiers/websocket.notifier';
import { SlackNotifier } from './notifiers/slack.notifier';
import { Prisma } from '@prisma/client';
import {
  AlertEvaluationRequest,
  AlertEvaluationResult,
  AlertComparison,
  AlertRule,
  AlertRuleType,
  CreateAlertRuleRequest,
  MarkNotificationReadResponse,
  NotificationItem,
  NotificationListQuery,
  NotificationListResponse,
  SlackIntegrationResponse,
  SlackTestResponse,
  SlackWebhookUpsertRequest,
  UpdateAlertRuleRequest,
} from '@dobbit/shared';

type AlertRuleWithMarket = Prisma.AlertRuleGetPayload<{ include: { market: true } }>;
type NotificationWithRelations = Prisma.NotificationGetPayload<{ include: { deliveries: true; market: true } }>;

@Injectable()
export class AlertService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly wsNotifier: WebSocketNotifier,
    private readonly slackNotifier: SlackNotifier,
  ) {}

  async createRule(userId: string, request: CreateAlertRuleRequest): Promise<AlertRule> {
    const market = await this.prisma.market.findUnique({ where: { code: request.marketCode } });
    if (!market) throw new NotFoundException(`Market ${request.marketCode} not found`);

    const rule = await this.prisma.alertRule.create({
      data: {
        userId,
        marketId: market.id,
        type: request.type,
        threshold: request.threshold,
        comparison: request.comparison,
        sendInApp: request.sendInApp,
        sendSlack: request.sendSlack,
        cooldownSeconds: request.cooldownSeconds,
      },
      include: { market: true },
    });

    return this.toAlertRule(rule);
  }

  async updateRule(userId: string, ruleId: string, request: UpdateAlertRuleRequest): Promise<AlertRule> {
    const rule = await this.prisma.alertRule.findFirst({ where: { id: ruleId, userId } });
    if (!rule) throw new NotFoundException('Alert rule not found');

    let marketId: string | undefined;
    if (request.marketCode) {
      const market = await this.prisma.market.findUnique({ where: { code: request.marketCode } });
      if (!market) throw new NotFoundException(`Market ${request.marketCode} not found`);
      marketId = market.id;
    }

    const updated = await this.prisma.alertRule.update({
      where: { id: ruleId },
      data: {
        ...(marketId && { marketId }),
        ...(request.type && { type: request.type }),
        ...(request.threshold !== undefined && { threshold: request.threshold }),
        ...(request.comparison && { comparison: request.comparison }),
        ...(request.sendInApp !== undefined && { sendInApp: request.sendInApp }),
        ...(request.sendSlack !== undefined && { sendSlack: request.sendSlack }),
        ...(request.cooldownSeconds !== undefined && { cooldownSeconds: request.cooldownSeconds }),
        ...(request.enabled !== undefined && { enabled: request.enabled }),
      },
      include: { market: true },
    });

    return this.toAlertRule(updated);
  }

  async deleteRule(userId: string, ruleId: string): Promise<void> {
    const rule = await this.prisma.alertRule.findFirst({ where: { id: ruleId, userId } });
    if (!rule) throw new NotFoundException('Alert rule not found');
    await this.prisma.alertRule.delete({ where: { id: ruleId } });
  }

  async getRules(userId: string): Promise<AlertRule[]> {
    const rules = await this.prisma.alertRule.findMany({
      where: { userId },
      include: { market: true },
      orderBy: { createdAt: 'desc' },
    });
    return rules.map((r) => this.toAlertRule(r));
  }

  async getNotifications(userId: string, query: NotificationListQuery = {}): Promise<NotificationListResponse> {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 50);
    const where = {
      userId,
      ...(query.unreadOnly && { readAt: null }),
      ...(query.marketCode && { market: { code: query.marketCode } }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where,
        include: { deliveries: true, market: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      items: items.map((item) => this.toNotificationItem(item)),
      page,
      limit,
      total,
    };
  }

  async markNotificationRead(userId: string, notificationId: string): Promise<MarkNotificationReadResponse> {
    const notification = await this.prisma.notification.findFirst({ where: { id: notificationId, userId } });
    if (!notification) throw new NotFoundException('Notification not found');

    const readAt = notification.readAt ?? new Date();
    await this.prisma.notification.update({
      where: { id: notificationId },
      data: { readAt },
    });

    return { id: notificationId, readAt: readAt.toISOString() };
  }

  async getSlackIntegration(userId: string): Promise<SlackIntegrationResponse> {
    return this.slackNotifier.getIntegration(userId);
  }

  async upsertSlackIntegration(userId: string, request: SlackWebhookUpsertRequest): Promise<SlackIntegrationResponse> {
    return this.slackNotifier.upsertIntegration(userId, request);
  }

  async testSlackIntegration(userId: string): Promise<SlackTestResponse> {
    return this.slackNotifier.testIntegration(userId);
  }

  async evaluateMarketSnapshot(request: AlertEvaluationRequest): Promise<AlertEvaluationResult> {
    const market = await this.prisma.market.findUnique({ where: { code: request.marketCode } });
    if (!market) throw new NotFoundException(`Market ${request.marketCode} not found`);

    const snapshotAt = request.snapshotAt ? new Date(request.snapshotAt) : new Date();
    await this.prisma.marketSnapshot.create({
      data: {
        marketId: market.id,
        tradePrice: request.tradePrice,
        signedChangeRate: request.signedChangeRate,
        accTradeVolume24h: request.accTradeVolume24h,
        snapshotAt,
      },
    });

    const rules = await this.prisma.alertRule.findMany({
      where: { marketId: market.id, enabled: true },
      include: { market: true },
    });

    let triggeredRuleCount = 0;
    let skippedRuleCount = 0;

    for (const rule of rules) {
      if (this.isInCooldown(rule)) continue;

      const value = await this.resolveRuleValue(
        rule,
        request.tradePrice,
        request.signedChangeRate,
        request.accTradeVolume24h,
      );
      if (value === null) {
        skippedRuleCount += 1;
        continue;
      }

      if (!this.compare(value, Number(rule.threshold), rule.comparison)) continue;

      triggeredRuleCount += 1;
      await this.createNotification(
        rule.userId,
        rule.id,
        market.id,
        market.code,
        this.getNotificationTitle(rule.type, market.code),
        this.getNotificationMessage(rule.type, market.code, value, Number(rule.threshold), rule.comparison),
        this.getSeverity(rule.type, rule.comparison),
        rule.sendInApp,
        rule.sendSlack,
      );
    }

    return {
      evaluatedRuleCount: rules.length,
      triggeredRuleCount,
      skippedRuleCount,
    };
  }

  async evaluateNewsSentiment(params: {
    marketId: string;
    marketCode: string;
    investmentScore: number;
    sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
    articleTitle: string;
    newsAnalysisId?: string;
  }): Promise<{ evaluatedRuleCount: number; triggeredRuleCount: number; skippedRuleCount: number }> {
    void params.newsAnalysisId;

    const rules = await this.prisma.alertRule.findMany({
      where: {
        marketId: params.marketId,
        type: 'NEWS_SENTIMENT',
        enabled: true,
      },
      include: { market: true },
    });

    let triggeredRuleCount = 0;
    let skippedRuleCount = 0;

    for (const rule of rules) {
      if (this.isInCooldown(rule)) {
        skippedRuleCount += 1;
        continue;
      }

      const threshold = Number(rule.threshold);
      if (!this.compare(params.investmentScore, threshold, rule.comparison)) continue;

      triggeredRuleCount += 1;
      await this.createNotification(
        rule.userId,
        rule.id,
        params.marketId,
        params.marketCode,
        `${params.marketCode} 뉴스 감성 알림`,
        this.getNewsSentimentMessage(
          params.marketCode,
          params.sentiment,
          params.investmentScore,
          threshold,
          rule.comparison,
          params.articleTitle,
        ),
        this.getNewsSentimentSeverity(params.investmentScore),
        rule.sendInApp,
        rule.sendSlack,
      );
    }

    return {
      evaluatedRuleCount: rules.length,
      triggeredRuleCount,
      skippedRuleCount,
    };
  }

  async createNotification(
    userId: string,
    alertRuleId: string,
    marketId: string,
    marketCode: string,
    title: string,
    message: string,
    severity: 'INFO' | 'WARNING' | 'CRITICAL',
    sendInApp: boolean,
    sendSlack: boolean,
  ): Promise<void> {
    const channels: Array<'WEBSOCKET' | 'SLACK'> = [];
    if (sendInApp) channels.push('WEBSOCKET');
    if (sendSlack) channels.push('SLACK');

    const notification = await this.prisma.notification.create({
      data: {
        userId,
        alertRuleId,
        marketId,
        title,
        message,
        severity,
        deliveries: {
          create: channels.map((channel) => ({ channel, status: 'PENDING' })),
        },
      },
      include: { deliveries: true },
    });

    await this.prisma.alertRule.update({
      where: { id: alertRuleId },
      data: { lastTriggeredAt: new Date() },
    });

    const event = {
      type: 'notification.created' as const,
      notificationId: notification.id,
      userId,
      marketCode,
      title,
      message,
      severity,
      channels,
      createdAt: notification.createdAt.toISOString(),
    };

    if (sendInApp) {
      const delivery = notification.deliveries.find((d) => d.channel === 'WEBSOCKET');
      try {
        this.wsNotifier.notify(event);
        if (delivery) {
          await this.prisma.notificationDelivery.update({
            where: { id: delivery.id },
            data: { status: 'SENT', sentAt: new Date() },
          });
        }
      } catch {
        if (delivery) {
          await this.prisma.notificationDelivery.update({
            where: { id: delivery.id },
            data: { status: 'FAILED', errorMessage: 'WebSocket emit failed' },
          });
        }
      }
    }

    if (sendSlack) {
      const delivery = notification.deliveries.find((d) => d.channel === 'SLACK');
      const result = await this.slackNotifier.notify(userId, notification.id, title, message, severity);
      if (delivery) {
        await this.prisma.notificationDelivery.update({
          where: { id: delivery.id },
          data: {
            status: result.success ? 'SENT' : 'FAILED',
            sentAt: result.success ? new Date() : null,
            errorMessage: result.error ?? null,
          },
        });
      }
      if (!result.success) {
        this.wsNotifier.notifyDeliveryFailed({
          type: 'notification.delivery.failed',
          notificationId: notification.id,
          userId,
          channel: 'SLACK',
          reason: result.error ?? 'Slack delivery failed',
          failedAt: new Date().toISOString(),
        });
      }
    }
  }

  private isInCooldown(rule: { lastTriggeredAt: Date | null; cooldownSeconds: number }): boolean {
    if (!rule.lastTriggeredAt || rule.cooldownSeconds === 0) return false;
    const elapsed = (Date.now() - rule.lastTriggeredAt.getTime()) / 1000;
    return elapsed < rule.cooldownSeconds;
  }

  private toAlertRule(rule: AlertRuleWithMarket): AlertRule {
    return {
      id: rule.id,
      marketCode: rule.market?.code ?? '',
      type: rule.type as AlertRuleType,
      threshold: Number(rule.threshold),
      comparison: rule.comparison as AlertComparison,
      enabled: rule.enabled,
      sendInApp: rule.sendInApp,
      sendSlack: rule.sendSlack,
      cooldownSeconds: rule.cooldownSeconds,
      lastTriggeredAt: rule.lastTriggeredAt?.toISOString() ?? null,
    };
  }

  private async resolveRuleValue(
    rule: { userId: string; marketId: string; type: string },
    tradePrice: number,
    signedChangeRate: number,
    accTradeVolume24h: number,
  ): Promise<number | null> {
    if (rule.type === 'PRICE_CHANGE_RATE') {
      return Math.abs(signedChangeRate) <= 1 ? Math.abs(signedChangeRate) * 100 : Math.abs(signedChangeRate);
    }

    if (rule.type === 'PROFIT_RATE_TARGET' || rule.type === 'LOSS_RATE_LIMIT') {
      const wallet = await this.prisma.wallet.findUnique({
        where: { userId_marketId: { userId: rule.userId, marketId: rule.marketId } },
      });
      if (!wallet || Number(wallet.quantity) <= 0 || Number(wallet.averagePrice) <= 0) return null;
      return ((tradePrice - Number(wallet.averagePrice)) / Number(wallet.averagePrice)) * 100;
    }

    if (rule.type === 'VOLUME_SPIKE') {
      const previous = await this.prisma.marketSnapshot.findMany({
        where: { marketId: rule.marketId },
        orderBy: { snapshotAt: 'desc' },
        skip: 1,
        take: 5,
      });
      if (previous.length === 0) return null;
      const averageVolume =
        previous.reduce((sum, snapshot) => sum + Number(snapshot.accTradeVolume24h), 0) / previous.length;
      if (averageVolume <= 0) return null;
      return ((accTradeVolume24h - averageVolume) / averageVolume) * 100;
    }

    return null;
  }

  private compare(value: number, threshold: number, comparison: string): boolean {
    if (comparison === 'GTE') return value >= threshold;
    if (comparison === 'LTE') return value <= threshold;
    return false;
  }

  private getNotificationTitle(type: string, marketCode: string): string {
    if (type === 'LOSS_RATE_LIMIT') return `${marketCode} 손실률 알림`;
    if (type === 'PROFIT_RATE_TARGET') return `${marketCode} 수익률 알림`;
    if (type === 'VOLUME_SPIKE') return `${marketCode} 거래량 알림`;
    return `${marketCode} 가격 변동 알림`;
  }

  private getNotificationMessage(
    type: string,
    marketCode: string,
    value: number,
    threshold: number,
    comparison: string,
  ): string {
    const direction = comparison === 'GTE' ? '이상' : '이하';
    return `${marketCode} ${type} 조건이 충족되었습니다. 현재값 ${value.toFixed(2)}%, 기준 ${threshold.toFixed(2)}% ${direction}`;
  }

  private getSeverity(type: string, comparison: string): 'INFO' | 'WARNING' | 'CRITICAL' {
    if (type === 'LOSS_RATE_LIMIT' || comparison === 'LTE') return 'CRITICAL';
    if (type === 'VOLUME_SPIKE') return 'WARNING';
    return 'INFO';
  }

  private getNewsSentimentMessage(
    marketCode: string,
    sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE',
    investmentScore: number,
    threshold: number,
    comparison: string,
    articleTitle: string,
  ): string {
    const sentimentLabel = {
      POSITIVE: '호재',
      NEUTRAL: '중립',
      NEGATIVE: '악재',
    }[sentiment];
    const direction = comparison === 'GTE' ? '이상' : '이하';

    return `${marketCode} 관련 뉴스가 ${sentimentLabel}(투자지수 ${investmentScore.toFixed(2)})로 분석되었습니다. 기준 ${threshold.toFixed(2)} ${direction}. — ${articleTitle}`;
  }

  private getNewsSentimentSeverity(investmentScore: number): 'INFO' | 'WARNING' | 'CRITICAL' {
    if (investmentScore <= -0.5) return 'CRITICAL';
    if (investmentScore >= 0.5) return 'WARNING';
    return 'INFO';
  }

  private toNotificationItem(notification: NotificationWithRelations): NotificationItem {
    return {
      id: notification.id,
      marketCode: notification.market?.code,
      title: notification.title,
      message: notification.message,
      severity: notification.severity as NotificationItem['severity'],
      readAt: notification.readAt?.toISOString() ?? null,
      createdAt: notification.createdAt.toISOString(),
      deliveries: notification.deliveries.map((delivery) => ({
        channel: delivery.channel as NotificationItem['deliveries'][number]['channel'],
        status: delivery.status as NotificationItem['deliveries'][number]['status'],
        errorMessage: delivery.errorMessage ?? undefined,
      })),
    };
  }
}
