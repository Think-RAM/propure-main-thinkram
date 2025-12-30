-- CreateEnum
CREATE TYPE "StrategyType" AS ENUM ('CASH_FLOW', 'CAPITAL_GROWTH', 'RENOVATION_FLIP', 'DEVELOPMENT', 'SMSF', 'COMMERCIAL');

-- CreateEnum
CREATE TYPE "StrategyStatus" AS ENUM ('DISCOVERY', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('HOUSE', 'APARTMENT', 'TOWNHOUSE', 'VILLA', 'UNIT', 'LAND', 'RURAL', 'COMMERCIAL', 'INDUSTRIAL');

-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('SALE', 'RENT', 'SOLD', 'LEASED');

-- CreateEnum
CREATE TYPE "DataSource" AS ENUM ('DOMAIN', 'REALESTATE', 'CORELOGIC', 'ABS', 'RBA', 'MANUAL');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('ACTIVE', 'UNDER_CONTRACT', 'SOLD', 'WITHDRAWN', 'OFF_MARKET');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strategies" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "StrategyType" NOT NULL,
    "status" "StrategyStatus" NOT NULL DEFAULT 'DISCOVERY',
    "params" JSONB,
    "budget" DOUBLE PRECISION,
    "deposit" DOUBLE PRECISION,
    "income" DOUBLE PRECISION,
    "riskTolerance" TEXT,
    "timeline" TEXT,
    "managementStyle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "strategies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "strategyId" TEXT,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "chatSessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "toolCalls" JSONB,
    "toolResults" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_searches" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT,
    "filters" JSONB NOT NULL,
    "results" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_searches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "states" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" TEXT NOT NULL,
    "stateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suburbs" (
    "id" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "postcode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suburbs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "suburbId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "propertyType" "PropertyType" NOT NULL,
    "listingType" "ListingType" NOT NULL,
    "listingStatus" "ListingStatus" NOT NULL DEFAULT 'ACTIVE',
    "source" "DataSource" NOT NULL DEFAULT 'MANUAL',
    "sourceUrl" TEXT,
    "price" DOUBLE PRECISION,
    "rentWeekly" DOUBLE PRECISION,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "carSpaces" INTEGER,
    "landSize" DOUBLE PRECISION,
    "buildingSize" DOUBLE PRECISION,
    "description" TEXT,
    "features" JSONB,
    "images" JSONB,
    "agentId" TEXT,
    "agencyId" TEXT,
    "scrapedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suburb_metrics" (
    "id" TEXT NOT NULL,
    "suburbId" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "source" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "suburb_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agents" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "source" "DataSource" NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "profileUrl" TEXT,
    "photoUrl" TEXT,
    "agencyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agencies" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "source" "DataSource" NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "website" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_history" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "price" DOUBLE PRECISION,
    "priceType" TEXT NOT NULL,
    "priceText" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "source" "DataSource" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sale_records" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "suburb" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postcode" TEXT,
    "saleDate" TIMESTAMP(3) NOT NULL,
    "salePrice" DOUBLE PRECISION NOT NULL,
    "saleType" TEXT NOT NULL,
    "source" "DataSource" NOT NULL,
    "sourceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sale_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auction_results" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "suburb" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postcode" TEXT,
    "auctionDate" TIMESTAMP(3) NOT NULL,
    "result" TEXT NOT NULL,
    "guidePrice" DOUBLE PRECISION,
    "soldPrice" DOUBLE PRECISION,
    "bidderCount" INTEGER,
    "source" "DataSource" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auction_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "infrastructure_projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "suburbs" TEXT[],
    "estimatedCost" DOUBLE PRECISION,
    "completionDate" TIMESTAMP(3),
    "sourceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "infrastructure_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_indicators" (
    "id" TEXT NOT NULL,
    "indicatorType" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "source" "DataSource" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "market_indicators_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_clerkUserId_key" ON "users"("clerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "strategies_userId_idx" ON "strategies"("userId");

-- CreateIndex
CREATE INDEX "strategies_type_idx" ON "strategies"("type");

-- CreateIndex
CREATE INDEX "strategies_status_idx" ON "strategies"("status");

-- CreateIndex
CREATE INDEX "chat_sessions_userId_idx" ON "chat_sessions"("userId");

-- CreateIndex
CREATE INDEX "chat_sessions_strategyId_idx" ON "chat_sessions"("strategyId");

-- CreateIndex
CREATE INDEX "chat_messages_chatSessionId_idx" ON "chat_messages"("chatSessionId");

-- CreateIndex
CREATE INDEX "chat_messages_createdAt_idx" ON "chat_messages"("createdAt");

-- CreateIndex
CREATE INDEX "saved_searches_userId_idx" ON "saved_searches"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "states_name_key" ON "states"("name");

-- CreateIndex
CREATE UNIQUE INDEX "states_code_key" ON "states"("code");

-- CreateIndex
CREATE INDEX "cities_stateId_idx" ON "cities"("stateId");

-- CreateIndex
CREATE UNIQUE INDEX "cities_stateId_name_key" ON "cities"("stateId", "name");

-- CreateIndex
CREATE INDEX "suburbs_cityId_idx" ON "suburbs"("cityId");

-- CreateIndex
CREATE INDEX "suburbs_postcode_idx" ON "suburbs"("postcode");

-- CreateIndex
CREATE UNIQUE INDEX "suburbs_cityId_name_postcode_key" ON "suburbs"("cityId", "name", "postcode");

-- CreateIndex
CREATE UNIQUE INDEX "properties_externalId_key" ON "properties"("externalId");

-- CreateIndex
CREATE INDEX "properties_suburbId_idx" ON "properties"("suburbId");

-- CreateIndex
CREATE INDEX "properties_propertyType_idx" ON "properties"("propertyType");

-- CreateIndex
CREATE INDEX "properties_listingType_idx" ON "properties"("listingType");

-- CreateIndex
CREATE INDEX "properties_listingStatus_idx" ON "properties"("listingStatus");

-- CreateIndex
CREATE INDEX "properties_source_idx" ON "properties"("source");

-- CreateIndex
CREATE INDEX "properties_price_idx" ON "properties"("price");

-- CreateIndex
CREATE INDEX "properties_bedrooms_idx" ON "properties"("bedrooms");

-- CreateIndex
CREATE INDEX "properties_agentId_idx" ON "properties"("agentId");

-- CreateIndex
CREATE INDEX "properties_agencyId_idx" ON "properties"("agencyId");

-- CreateIndex
CREATE INDEX "properties_latitude_longitude_idx" ON "properties"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "suburb_metrics_suburbId_idx" ON "suburb_metrics"("suburbId");

-- CreateIndex
CREATE INDEX "suburb_metrics_metricType_idx" ON "suburb_metrics"("metricType");

-- CreateIndex
CREATE INDEX "suburb_metrics_recordedAt_idx" ON "suburb_metrics"("recordedAt");

-- CreateIndex
CREATE UNIQUE INDEX "suburb_metrics_suburbId_metricType_recordedAt_key" ON "suburb_metrics"("suburbId", "metricType", "recordedAt");

-- CreateIndex
CREATE UNIQUE INDEX "agents_externalId_key" ON "agents"("externalId");

-- CreateIndex
CREATE INDEX "agents_agencyId_idx" ON "agents"("agencyId");

-- CreateIndex
CREATE INDEX "agents_source_idx" ON "agents"("source");

-- CreateIndex
CREATE UNIQUE INDEX "agencies_externalId_key" ON "agencies"("externalId");

-- CreateIndex
CREATE INDEX "agencies_source_idx" ON "agencies"("source");

-- CreateIndex
CREATE INDEX "price_history_propertyId_idx" ON "price_history"("propertyId");

-- CreateIndex
CREATE INDEX "price_history_recordedAt_idx" ON "price_history"("recordedAt");

-- CreateIndex
CREATE INDEX "price_history_priceType_idx" ON "price_history"("priceType");

-- CreateIndex
CREATE INDEX "sale_records_suburb_state_idx" ON "sale_records"("suburb", "state");

-- CreateIndex
CREATE INDEX "sale_records_saleDate_idx" ON "sale_records"("saleDate");

-- CreateIndex
CREATE INDEX "sale_records_source_idx" ON "sale_records"("source");

-- CreateIndex
CREATE INDEX "auction_results_suburb_state_idx" ON "auction_results"("suburb", "state");

-- CreateIndex
CREATE INDEX "auction_results_auctionDate_idx" ON "auction_results"("auctionDate");

-- CreateIndex
CREATE INDEX "auction_results_result_idx" ON "auction_results"("result");

-- CreateIndex
CREATE INDEX "infrastructure_projects_state_idx" ON "infrastructure_projects"("state");

-- CreateIndex
CREATE INDEX "infrastructure_projects_category_idx" ON "infrastructure_projects"("category");

-- CreateIndex
CREATE INDEX "infrastructure_projects_status_idx" ON "infrastructure_projects"("status");

-- CreateIndex
CREATE INDEX "market_indicators_indicatorType_idx" ON "market_indicators"("indicatorType");

-- CreateIndex
CREATE INDEX "market_indicators_scope_idx" ON "market_indicators"("scope");

-- CreateIndex
CREATE INDEX "market_indicators_recordedAt_idx" ON "market_indicators"("recordedAt");

-- CreateIndex
CREATE UNIQUE INDEX "market_indicators_indicatorType_scope_recordedAt_key" ON "market_indicators"("indicatorType", "scope", "recordedAt");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strategies" ADD CONSTRAINT "strategies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "strategies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_chatSessionId_fkey" FOREIGN KEY ("chatSessionId") REFERENCES "chat_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_searches" ADD CONSTRAINT "saved_searches_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "states"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suburbs" ADD CONSTRAINT "suburbs_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_suburbId_fkey" FOREIGN KEY ("suburbId") REFERENCES "suburbs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suburb_metrics" ADD CONSTRAINT "suburb_metrics_suburbId_fkey" FOREIGN KEY ("suburbId") REFERENCES "suburbs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agents" ADD CONSTRAINT "agents_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
