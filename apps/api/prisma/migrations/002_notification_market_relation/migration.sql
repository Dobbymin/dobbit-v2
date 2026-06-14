-- Add a reproducible foreign key for notifications.marketId.
CREATE INDEX IF NOT EXISTS "notifications_marketId_idx" ON "public"."notifications"("marketId");

ALTER TABLE "public"."notifications"
ADD CONSTRAINT "notifications_marketId_fkey"
FOREIGN KEY ("marketId") REFERENCES "public"."markets"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
