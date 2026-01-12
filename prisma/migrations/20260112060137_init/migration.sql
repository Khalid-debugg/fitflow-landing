-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "language" VARCHAR(5) NOT NULL DEFAULT 'en',
    "preferredCurrency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "detectedCountry" VARCHAR(2),
    "trialStartAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trialEndAt" TIMESTAMP(3) NOT NULL,
    "subscriptionStatus" VARCHAR(20) NOT NULL DEFAULT 'trial',
    "subscriptionType" VARCHAR(20),
    "planTier" VARCHAR(20),
    "deviceLimit" INTEGER NOT NULL DEFAULT 1,
    "licenseKey" VARCHAR(100),
    "lemonSqueezyCustomerId" VARCHAR(100),
    "lemonSqueezySubscriptionId" VARCHAR(100),
    "perpetualLicensePurchasedAt" TIMESTAMP(3),
    "perpetualLicenseUpdatesUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivatedDevice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceId" VARCHAR(255) NOT NULL,
    "deviceName" VARCHAR(100),
    "platform" VARCHAR(20) NOT NULL,
    "appVersion" VARCHAR(20) NOT NULL,
    "activatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastValidatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ActivatedDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Download" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "version" VARCHAR(20) NOT NULL,
    "platform" VARCHAR(20) NOT NULL,
    "downloadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Download_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurrencyRate" (
    "id" TEXT NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "rateToUSD" DOUBLE PRECISION NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CurrencyRate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_licenseKey_key" ON "User"("licenseKey");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_licenseKey_idx" ON "User"("licenseKey");

-- CreateIndex
CREATE INDEX "User_subscriptionStatus_idx" ON "User"("subscriptionStatus");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "ActivatedDevice_userId_idx" ON "ActivatedDevice"("userId");

-- CreateIndex
CREATE INDEX "ActivatedDevice_lastValidatedAt_idx" ON "ActivatedDevice"("lastValidatedAt");

-- CreateIndex
CREATE INDEX "ActivatedDevice_isActive_idx" ON "ActivatedDevice"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ActivatedDevice_userId_deviceId_key" ON "ActivatedDevice"("userId", "deviceId");

-- CreateIndex
CREATE INDEX "Download_userId_idx" ON "Download"("userId");

-- CreateIndex
CREATE INDEX "Download_downloadedAt_idx" ON "Download"("downloadedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CurrencyRate_currency_key" ON "CurrencyRate"("currency");

-- CreateIndex
CREATE INDEX "CurrencyRate_currency_idx" ON "CurrencyRate"("currency");

-- CreateIndex
CREATE INDEX "CurrencyRate_lastUpdated_idx" ON "CurrencyRate"("lastUpdated");

-- AddForeignKey
ALTER TABLE "ActivatedDevice" ADD CONSTRAINT "ActivatedDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Download" ADD CONSTRAINT "Download_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
