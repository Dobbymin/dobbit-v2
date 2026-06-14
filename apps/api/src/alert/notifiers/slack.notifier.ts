import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { SlackIntegrationResponse, SlackTestResponse, SlackWebhookUpsertRequest } from '@dobbit/shared';
import * as crypto from 'crypto';

@Injectable()
export class SlackNotifier {
  private readonly algorithm = 'aes-256-gcm';

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async getIntegration(userId: string): Promise<SlackIntegrationResponse> {
    const integration = await this.prisma.slackIntegration.findUnique({ where: { userId } });
    if (!integration) {
      return {
        enabled: false,
        channelName: null,
        lastTestedAt: null,
        lastErrorMessage: null,
      };
    }

    return this.toResponse(integration);
  }

  async upsertIntegration(userId: string, request: SlackWebhookUpsertRequest): Promise<SlackIntegrationResponse> {
    const integration = await this.prisma.slackIntegration.upsert({
      where: { userId },
      create: {
        userId,
        webhookUrlEncrypted: this.encrypt(request.webhookUrl),
        channelName: request.channelName,
        enabled: request.enabled ?? true,
        lastErrorMessage: null,
      },
      update: {
        webhookUrlEncrypted: this.encrypt(request.webhookUrl),
        channelName: request.channelName,
        enabled: request.enabled ?? true,
        lastErrorMessage: null,
      },
    });

    return this.toResponse(integration);
  }

  async testIntegration(userId: string): Promise<SlackTestResponse> {
    const testedAt = new Date();
    const integration = await this.prisma.slackIntegration.findUnique({ where: { userId } });
    if (!integration) {
      return {
        success: false,
        lastTestedAt: testedAt.toISOString(),
        lastErrorMessage: 'Slack integration not configured or disabled',
      };
    }

    const result = await this.send(
      userId,
      'Dobbit Slack 알림 테스트',
      'Slack 알림 연결이 정상적으로 동작합니다.',
      'INFO',
    );

    await this.prisma.slackIntegration.update({
      where: { userId },
      data: {
        lastTestedAt: testedAt,
        lastErrorMessage: result.error ?? null,
      },
    });

    return {
      success: result.success,
      lastTestedAt: testedAt.toISOString(),
      lastErrorMessage: result.error ?? null,
    };
  }

  async notify(
    userId: string,
    _notificationId: string,
    title: string,
    message: string,
    severity: string,
  ): Promise<{ success: boolean; error?: string }> {
    return this.send(userId, title, message, severity);
  }

  private async send(
    userId: string,
    title: string,
    message: string,
    severity: string,
  ): Promise<{ success: boolean; error?: string }> {
    const integration = await this.prisma.slackIntegration.findUnique({ where: { userId } });
    if (!integration || !integration.enabled) {
      return { success: false, error: 'Slack integration not configured or disabled' };
    }

    let webhookUrl: string;
    try {
      webhookUrl = this.decrypt(integration.webhookUrlEncrypted);
    } catch {
      return { success: false, error: 'Failed to decrypt Slack webhook' };
    }

    const emoji =
      severity === 'CRITICAL' ? ':rotating_light:' : severity === 'WARNING' ? ':warning:' : ':information_source:';
    const payload = { text: `${emoji} *${title}*\n${message}` };

    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = `Slack webhook responded with ${res.status}`;
        await this.prisma.slackIntegration.update({ where: { userId }, data: { lastErrorMessage: error } });
        return { success: false, error };
      }

      await this.prisma.slackIntegration.update({ where: { userId }, data: { lastErrorMessage: null } });
      return { success: true };
    } catch (err) {
      const error = this.sanitizeError(err instanceof Error ? err.message : 'Unknown error');
      await this.prisma.slackIntegration.update({ where: { userId }, data: { lastErrorMessage: error } });
      return { success: false, error };
    }
  }

  private encrypt(value: string): string {
    const key = this.config.get<string>('ENCRYPTION_KEY');
    if (!key) throw new Error('ENCRYPTION_KEY not configured');

    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(key, 'hex'), iv);
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
  }

  private decrypt(encrypted: string): string {
    const key = this.config.get<string>('ENCRYPTION_KEY');
    if (!key) throw new Error('ENCRYPTION_KEY not configured');

    const [ivHex, authTagHex, dataHex] = encrypted.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encryptedData = Buffer.from(dataHex, 'hex');

    const keyBuffer = Buffer.from(key, 'hex');
    const decipher = crypto.createDecipheriv(this.algorithm, keyBuffer, iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([decipher.update(encryptedData), decipher.final()]).toString('utf8');
  }

  private sanitizeError(message: string): string {
    return message.replace(/https?:\/\/\S+/g, '[redacted-url]');
  }

  private toResponse(integration: {
    enabled: boolean;
    channelName: string | null;
    lastTestedAt: Date | null;
    lastErrorMessage: string | null;
  }): SlackIntegrationResponse {
    return {
      enabled: integration.enabled,
      channelName: integration.channelName,
      lastTestedAt: integration.lastTestedAt?.toISOString() ?? null,
      lastErrorMessage: integration.lastErrorMessage,
    };
  }
}
