-- CreateEnum
CREATE TYPE "public"."AlertRule_type" AS ENUM ('PRICE_CHANGE_RATE', 'PROFIT_RATE_TARGET', 'LOSS_RATE_LIMIT', 'VOLUME_SPIKE', 'NEWS_SENTIMENT');

CREATE TYPE "public"."AlertRule_comparison" AS ENUM ('GTE', 'LTE');

CREATE TYPE "public"."Trade_type" AS ENUM ('BUY', 'SELL');

CREATE TYPE "public"."NewsAnalysis_sentiment" AS ENUM ('POSITIVE', 'NEUTRAL', 'NEGATIVE');

CREATE TYPE "public"."NotificationDelivery_channel" AS ENUM ('WEBSOCKET', 'SLACK');

CREATE TYPE "public"."LearningSample_feedbackLabel" AS ENUM ('GOOD', 'BAD', 'NEEDS_REVIEW');

-- CreateTable users (no FK deps)
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "passwordHash" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable markets (no FK deps)
CREATE TABLE "public"."markets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL UNIQUE,
    "symbol" TEXT NOT NULL UNIQUE,
    "koreanName" TEXT NOT NULL,
    "englishName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable news_articles (no FK deps)
CREATE TABLE "public"."news_articles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL UNIQUE,
    "publisher" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "rawPayload" JSONB,
    "collectedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable news_analysis_runs (no FK deps)
CREATE TABLE "public"."news_analysis_runs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "totalCount" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable cash_balances (refs users)
CREATE TABLE "public"."cash_balances" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "amount" DECIMAL(18,8) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "cash_balances_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable wallets (refs users, markets)
CREATE TABLE "public"."wallets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "quantity" DECIMAL(18,8) NOT NULL,
    "averagePrice" DECIMAL(18,8) NOT NULL,
    "totalCost" DECIMAL(18,8) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "wallets_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "public"."markets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable trades (refs users, markets)
CREATE TABLE "public"."trades" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "price" DECIMAL(18,8) NOT NULL,
    "quantity" DECIMAL(18,8) NOT NULL,
    "totalAmount" DECIMAL(18,8) NOT NULL,
    "fee" DECIMAL(18,8) NOT NULL,
    "executedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "trades_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "public"."markets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "trades_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable market_snapshots (refs markets)
CREATE TABLE "public"."market_snapshots" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "marketId" TEXT NOT NULL,
    "tradePrice" DECIMAL(18,8) NOT NULL,
    "signedChangeRate" DECIMAL(8,4) NOT NULL,
    "accTradeVolume24h" DECIMAL(18,2) NOT NULL,
    "snapshotAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "market_snapshots_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "public"."markets" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable news_market_tags (refs markets, news_articles)
CREATE TABLE "public"."news_market_tags" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "newsArticleId" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "confidence" DECIMAL(5,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "news_market_tags_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "public"."markets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "news_market_tags_newsArticleId_fkey" FOREIGN KEY ("newsArticleId") REFERENCES "public"."news_articles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable news_analyses (refs news_articles)
CREATE TABLE "public"."news_analyses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "newsArticleId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "sentiment" TEXT NOT NULL,
    "confidence" DECIMAL(5,4) NOT NULL,
    "investmentScore" DECIMAL(5,4) NOT NULL,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "reason" TEXT NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "analyzedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "news_analyses_newsArticleId_fkey" FOREIGN KEY ("newsArticleId") REFERENCES "public"."news_articles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable alert_rules (refs users, markets)
CREATE TABLE "public"."alert_rules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "threshold" DECIMAL(8,4) NOT NULL,
    "comparison" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "sendInApp" BOOLEAN NOT NULL DEFAULT true,
    "sendSlack" BOOLEAN NOT NULL DEFAULT false,
    "cooldownSeconds" INTEGER NOT NULL DEFAULT 0,
    "lastTriggeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "alert_rules_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "public"."markets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "alert_rules_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable slack_integrations (refs users)
CREATE TABLE "public"."slack_integrations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "webhookUrlEncrypted" TEXT NOT NULL,
    "channelName" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "lastTestedAt" TIMESTAMP(3),
    "lastErrorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "slack_integrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable learning_samples (no FK constraints)
CREATE TABLE "public"."learning_samples" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "newsAnalysisId" TEXT,
    "predictionReviewId" TEXT,
    "inputSnapshot" JSONB NOT NULL,
    "expectedOutput" JSONB NOT NULL,
    "actualOutput" JSONB NOT NULL,
    "feedbackLabel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable balance_histories (refs users, trades)
CREATE TABLE "public"."balance_histories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "marketId" TEXT,
    "changeType" TEXT NOT NULL,
    "quantityDelta" DECIMAL(18,8) NOT NULL,
    "cashDelta" DECIMAL(18,8) NOT NULL,
    "reason" TEXT,
    "tradeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "balance_histories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "balance_histories_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "public"."trades" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable prediction_reviews (refs markets, news_analyses)
CREATE TABLE "public"."prediction_reviews" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "newsAnalysisId" TEXT NOT NULL UNIQUE,
    "marketId" TEXT NOT NULL,
    "basePrice" DECIMAL(18,8) NOT NULL,
    "futurePrice" DECIMAL(18,8) NOT NULL,
    "timeHorizon" TEXT NOT NULL,
    "predictedDirection" TEXT NOT NULL,
    "actualDirection" TEXT NOT NULL,
    "isMatched" BOOLEAN NOT NULL,
    "errorRate" DECIMAL(5,4) NOT NULL,
    "reviewedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "prediction_reviews_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "public"."markets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "prediction_reviews_newsAnalysisId_fkey" FOREIGN KEY ("newsAnalysisId") REFERENCES "public"."news_analyses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable notifications (refs users, alert_rules)
CREATE TABLE "public"."notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "alertRuleId" TEXT,
    "marketId" TEXT,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "payload" JSONB,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_alertRuleId_fkey" FOREIGN KEY ("alertRuleId") REFERENCES "public"."alert_rules" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable notification_deliveries (refs notifications)
CREATE TABLE "public"."notification_deliveries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "notificationId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notification_deliveries_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "public"."notifications" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "wallets_userId_marketId_key" ON "public"."wallets"("userId", "marketId");

-- CreateIndex
CREATE INDEX "wallets_userId_idx" ON "public"."wallets"("userId");

-- CreateIndex
CREATE INDEX "balance_histories_userId_idx" ON "public"."balance_histories"("userId");

-- CreateIndex
CREATE INDEX "balance_histories_tradeId_idx" ON "public"."balance_histories"("tradeId");

-- CreateIndex
CREATE INDEX "trades_userId_idx" ON "public"."trades"("userId");

-- CreateIndex
CREATE INDEX "trades_marketId_idx" ON "public"."trades"("marketId");

-- CreateIndex
CREATE INDEX "trades_executedAt_idx" ON "public"."trades"("executedAt");

-- CreateIndex
CREATE INDEX "market_snapshots_marketId_idx" ON "public"."market_snapshots"("marketId");

-- CreateIndex
CREATE INDEX "market_snapshots_snapshotAt_idx" ON "public"."market_snapshots"("snapshotAt");

-- CreateIndex
CREATE INDEX "news_articles_publishedAt_idx" ON "public"."news_articles"("publishedAt");

-- CreateIndex
CREATE INDEX "news_articles_source_idx" ON "public"."news_articles"("source");

-- CreateIndex
CREATE UNIQUE INDEX "news_market_tags_newsArticleId_marketId_key" ON "public"."news_market_tags"("newsArticleId", "marketId");

-- CreateIndex
CREATE INDEX "news_market_tags_marketId_idx" ON "public"."news_market_tags"("marketId");

-- CreateIndex
CREATE UNIQUE INDEX "news_analyses_newsArticleId_provider_modelVersion_key" ON "public"."news_analyses"("newsArticleId", "provider", "modelVersion");

-- CreateIndex
CREATE INDEX "news_analyses_newsArticleId_idx" ON "public"."news_analyses"("newsArticleId");

-- CreateIndex
CREATE INDEX "news_analyses_provider_idx" ON "public"."news_analyses"("provider");

-- CreateIndex
CREATE INDEX "news_analyses_sentiment_idx" ON "public"."news_analyses"("sentiment");

-- CreateIndex
CREATE INDEX "news_analysis_runs_provider_idx" ON "public"."news_analysis_runs"("provider");

-- CreateIndex
CREATE INDEX "news_analysis_runs_status_idx" ON "public"."news_analysis_runs"("status");

-- CreateIndex
CREATE INDEX "news_analysis_runs_targetDate_idx" ON "public"."news_analysis_runs"("targetDate");

-- CreateIndex
CREATE INDEX "prediction_reviews_marketId_idx" ON "public"."prediction_reviews"("marketId");

-- CreateIndex
CREATE INDEX "prediction_reviews_reviewedAt_idx" ON "public"."prediction_reviews"("reviewedAt");

-- CreateIndex
CREATE INDEX "learning_samples_feedbackLabel_idx" ON "public"."learning_samples"("feedbackLabel");

-- CreateIndex
CREATE UNIQUE INDEX "alert_rules_userId_marketId_type_key" ON "public"."alert_rules"("userId", "marketId", "type");

-- CreateIndex
CREATE INDEX "alert_rules_userId_idx" ON "public"."alert_rules"("userId");

-- CreateIndex
CREATE INDEX "alert_rules_marketId_idx" ON "public"."alert_rules"("marketId");

-- CreateIndex
CREATE INDEX "alert_rules_enabled_idx" ON "public"."alert_rules"("enabled");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "public"."notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_alertRuleId_idx" ON "public"."notifications"("alertRuleId");

-- CreateIndex
CREATE INDEX "notifications_readAt_idx" ON "public"."notifications"("readAt");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "public"."notifications"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "notification_deliveries_notificationId_channel_key" ON "public"."notification_deliveries"("notificationId", "channel");

-- CreateIndex
CREATE INDEX "notification_deliveries_notificationId_idx" ON "public"."notification_deliveries"("notificationId");

-- CreateIndex
CREATE INDEX "notification_deliveries_status_idx" ON "public"."notification_deliveries"("status");
