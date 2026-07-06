-- AlterEnum
ALTER TYPE "AutomationEvent" ADD VALUE 'AUTOMATION_TEST';

-- CreateTable
CREATE TABLE "automation_dispatch_logs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "webhookId" TEXT NOT NULL,
    "event" "AutomationEvent" NOT NULL,
    "eventId" TEXT NOT NULL,
    "deliveryId" TEXT NOT NULL,
    "urlSnapshot" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "httpStatus" INTEGER,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "errorType" TEXT,
    "errorMessage" TEXT,
    "attempt" INTEGER NOT NULL DEFAULT 1,
    "durationMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "automation_dispatch_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "automation_dispatch_logs_tenantId_idx" ON "automation_dispatch_logs"("tenantId");

-- CreateIndex
CREATE INDEX "automation_dispatch_logs_webhookId_createdAt_idx" ON "automation_dispatch_logs"("webhookId", "createdAt");

-- CreateIndex
CREATE INDEX "automation_dispatch_logs_deliveryId_idx" ON "automation_dispatch_logs"("deliveryId");

-- AddForeignKey
ALTER TABLE "automation_dispatch_logs" ADD CONSTRAINT "automation_dispatch_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_dispatch_logs" ADD CONSTRAINT "automation_dispatch_logs_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "automation_webhooks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
