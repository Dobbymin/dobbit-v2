-- CreateTable
CREATE TABLE "public"."favorites" (
    "userId" TEXT NOT NULL,
    "marketCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("userId", "marketCode")
);

-- AddForeignKey
ALTER TABLE "public"."favorites"
ADD CONSTRAINT "favorites_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
