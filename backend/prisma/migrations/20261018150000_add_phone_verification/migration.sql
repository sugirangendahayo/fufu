ALTER TABLE "User" ADD COLUMN "phoneVerifiedAt" TIMESTAMP(3);

CREATE TABLE "PhoneVerification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerRequestId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consumedAt" TIMESTAMP(3),
    CONSTRAINT "PhoneVerification_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PhoneVerification_providerRequestId_key" ON "PhoneVerification"("providerRequestId");
CREATE INDEX "PhoneVerification_userId_createdAt_idx" ON "PhoneVerification"("userId", "createdAt");
ALTER TABLE "PhoneVerification" ADD CONSTRAINT "PhoneVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
