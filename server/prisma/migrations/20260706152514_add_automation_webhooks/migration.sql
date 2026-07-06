-- CreateEnum
CREATE TYPE "AutomationEvent" AS ENUM ('LEAD_CREATED', 'LEAD_UPDATED', 'CONVERSATION_CREATED', 'MESSAGE_RECEIVED', 'MESSAGE_SENT', 'APPOINTMENT_CREATED', 'PAYMENT_PAID');

-- CreateTable
CREATE TABLE "automation_webhooks" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "signingSecretEnc" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "events" "AutomationEvent"[] DEFAULT ARRAY[]::"AutomationEvent"[],
    "lastError" TEXT,
    "lastSuccessAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automation_webhooks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "automation_webhooks_tenantId_idx" ON "automation_webhooks"("tenantId");

-- CreateIndex
CREATE INDEX "automation_webhooks_tenantId_deletedAt_idx" ON "automation_webhooks"("tenantId", "deletedAt");

-- AddForeignKey
ALTER TABLE "automation_webhooks" ADD CONSTRAINT "automation_webhooks_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
