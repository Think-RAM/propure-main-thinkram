# Schema Migration Plan

> **As of**: 2025-12-30
> **Source of truth**: `packages/db/prisma/schema.prisma`
> **Target**: PRD schema design in `docs/PRD.md`

---

## Current Schema Summary

### Strategy Model
```prisma
model Strategy {
  id        String       @id @default(cuid())
  userId    String
  type      StrategyType // Required, includes RENOVATION_FLIP
  status    StrategyStatus
  params    Json         // Generic JSON for all parameters
  // Minimal finance fields
}

enum StrategyType {
  CASH_FLOW
  CAPITAL_GROWTH
  RENOVATION_FLIP  // PRD uses RENOVATION
  DEVELOPMENT
  SMSF
  COMMERCIAL
  MIXED
}
```

### Chat Models
```prisma
model ChatSession {
  id        String   @id
  userId    String
  // No strategyId link
  // Uses normalized ChatMessage table
}

model ChatMessage {
  id          String @id
  sessionId   String
  role        String
  content     String
  // Normalized, not JSON array
}
```

### Search/Shortlist
- `SavedSearch` exists (userId, filters, results JSON)
- No `Search` model tied to Strategy
- No `Shortlist` model

### Geographic Models
```prisma
model State { id, name, code }  // No geometry
model City { id, stateId, name }  // No geometry
model Suburb { id, cityId, name, postcode }  // No lat/long, no geometry
```

### Property Model
```prisma
model Property {
  address     String        // Single string, not structured
  price       Decimal?
  rentWeekly  Decimal?
  features    Json          // JSON array
  images      Json          // JSON array
  // Enums include LEASED, OFF_MARKET
}
```

### Metrics Models
```prisma
model SuburbMetric {
  metricType  String  // String, not enum
  // Regular table, not hypertable
}

model MarketIndicator {
  indicatorType String
  // Regular table, not hypertable
}
```

---

## PRD Target Schema

### Strategy (Expanded)
```prisma
model Strategy {
  id              String         @id
  userId          String
  type            StrategyType?  // Optional during discovery
  status          StrategyStatus

  // Discovery profile (PRD addition)
  profile         Json           @default("{}")

  // Financial inputs (PRD additions)
  budget          Decimal?
  deposit         Decimal?
  annualIncome    Decimal?
  borrowingCapacity Decimal?

  // Preferences (PRD additions)
  riskTolerance   String?
  timeline        String?
  managementStyle String?
  preferredStates String[]
  preferredSuburbs String[]
  propertyTypes   String[]
  minBedrooms     Int?
  maxBedrooms     Int?

  // Relations (PRD additions)
  searches        Search[]
  shortlist       Shortlist[]
  chatSession     ChatSession?
}

enum StrategyType {
  CASH_FLOW
  CAPITAL_GROWTH
  RENOVATION      // Changed from RENOVATION_FLIP
  DEVELOPMENT
  SMSF
  COMMERCIAL
  MIXED
}
```

### New Models
```prisma
model Search {
  id          String   @id
  strategyId  String
  name        String?
  filters     Json
  resultCount Int
  topResults  Json     // Top 10 for quick display
}

model Shortlist {
  id          String   @id
  strategyId  String
  propertyId  String
  notes       String?
  score       Int?     // Strategy alignment score
}
```

### Geographic (With PostGIS)
```prisma
model Suburb {
  latitude    Decimal
  longitude   Decimal
  // + geometry column via SQL
  // + centroid column via SQL
}

model Property {
  // + location geography(Point) via SQL
}
```

---

## Migration Steps

### Phase 1: Backwards-Compatible Additions

**Step 1.1: Add new enum value**
```sql
ALTER TYPE "StrategyType" ADD VALUE 'RENOVATION';
```

**Step 1.2: Add new Strategy fields**
```prisma
// Add to schema.prisma
model Strategy {
  // Existing fields...

  // Add these
  profile         Json     @default("{}")
  budget          Decimal? @db.Decimal(12, 2)
  deposit         Decimal? @db.Decimal(12, 2)
  annualIncome    Decimal? @db.Decimal(12, 2)
  borrowingCapacity Decimal? @db.Decimal(12, 2)
  riskTolerance   String?
  timeline        String?
  managementStyle String?
  preferredStates String[] @default([])
  preferredSuburbs String[] @default([])
  propertyTypes   String[] @default([])
  minBedrooms     Int?
  maxBedrooms     Int?
}
```

**Step 1.3: Add new tables**
```prisma
model Search {
  id          String    @id @default(cuid())
  strategyId  String
  name        String?
  filters     Json      @default("{}")
  resultCount Int       @default(0)
  topResults  Json      @default("[]")
  strategy    Strategy  @relation(fields: [strategyId], references: [id])
  createdAt   DateTime  @default(now())

  @@index([strategyId])
}

model Shortlist {
  id          String    @id @default(cuid())
  strategyId  String
  propertyId  String
  notes       String?
  score       Int?
  strategy    Strategy  @relation(fields: [strategyId], references: [id])
  property    Property  @relation(fields: [propertyId], references: [id])
  createdAt   DateTime  @default(now())

  @@unique([strategyId, propertyId])
  @@index([strategyId])
}
```

**Step 1.4: Link ChatSession to Strategy**
```prisma
model ChatSession {
  // Existing fields...
  strategyId  String?   @unique
  strategy    Strategy? @relation(fields: [strategyId], references: [id])
}
```

---

### Phase 2: Data Migration

**Step 2.1: Create default strategies for users with SavedSearch**
```sql
INSERT INTO "Strategy" (id, "userId", status, "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  "userId",
  'DISCOVERY',
  NOW(),
  NOW()
FROM "SavedSearch" ss
WHERE NOT EXISTS (
  SELECT 1 FROM "Strategy" s WHERE s."userId" = ss."userId"
)
GROUP BY "userId";
```

**Step 2.2: Migrate SavedSearch to Search**
```sql
INSERT INTO "Search" (id, "strategyId", name, filters, "resultCount", "topResults", "createdAt")
SELECT
  gen_random_uuid()::text,
  (SELECT id FROM "Strategy" WHERE "userId" = ss."userId" LIMIT 1),
  ss.name,
  ss.filters,
  COALESCE(jsonb_array_length(ss.results::jsonb), 0),
  COALESCE((ss.results::jsonb)[0:10], '[]'::jsonb),
  ss."createdAt"
FROM "SavedSearch" ss;
```

**Step 2.3: Update app code to use Search instead of SavedSearch**
- Update all queries to use `Search` model
- Update all writes to use `Search` model
- Keep `SavedSearch` reads for backwards compatibility during transition

---

### Phase 3: Enum Alignment

**Step 3.1: Update existing RENOVATION_FLIP to RENOVATION**
```sql
UPDATE "Strategy"
SET type = 'RENOVATION'
WHERE type = 'RENOVATION_FLIP';
```

**Step 3.2: Update application code**
- Change all `RENOVATION_FLIP` references to `RENOVATION`
- Update chat route tool definitions
- Update UI components

**Step 3.3: Remove old enum value (optional, requires careful migration)**
```sql
-- Only after confirming no rows use RENOVATION_FLIP
-- This may require recreating the enum
```

---

### Phase 4: PostGIS & TimescaleDB

**Step 4.1: Enable extensions**
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS timescaledb;
```

**Step 4.2: Add geometry columns**
```sql
-- State
ALTER TABLE "State" ADD COLUMN IF NOT EXISTS geometry geography(MultiPolygon, 4326);
CREATE INDEX IF NOT EXISTS idx_state_geometry ON "State" USING GIST (geometry);

-- City
ALTER TABLE "City" ADD COLUMN IF NOT EXISTS geometry geography(MultiPolygon, 4326);
CREATE INDEX IF NOT EXISTS idx_city_geometry ON "City" USING GIST (geometry);

-- Suburb
ALTER TABLE "Suburb" ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 7);
ALTER TABLE "Suburb" ADD COLUMN IF NOT EXISTS longitude DECIMAL(10, 7);
ALTER TABLE "Suburb" ADD COLUMN IF NOT EXISTS geometry geography(MultiPolygon, 4326);
ALTER TABLE "Suburb" ADD COLUMN IF NOT EXISTS centroid geography(Point, 4326);
CREATE INDEX IF NOT EXISTS idx_suburb_geometry ON "Suburb" USING GIST (geometry);
CREATE INDEX IF NOT EXISTS idx_suburb_centroid ON "Suburb" USING GIST (centroid);

-- Property
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS location geography(Point, 4326);
CREATE INDEX IF NOT EXISTS idx_property_location ON "Property" USING GIST (location);
```

**Step 4.3: Add location trigger**
```sql
CREATE OR REPLACE FUNCTION update_property_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude::float, NEW.latitude::float), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_property_location
BEFORE INSERT OR UPDATE OF latitude, longitude ON "Property"
FOR EACH ROW EXECUTE FUNCTION update_property_location();
```

**Step 4.4: Convert to hypertables**
```sql
-- SuburbMetric
SELECT create_hypertable('"SuburbMetric"', 'recordedAt', migrate_data => true);

-- MarketIndicator
SELECT create_hypertable('"MarketIndicator"', 'recordedAt', migrate_data => true);
```

---

### Phase 5: Cleanup

**Step 5.1: Verify data migration**
```sql
-- Verify all SavedSearch migrated
SELECT COUNT(*) FROM "SavedSearch" ss
WHERE NOT EXISTS (
  SELECT 1 FROM "Search" s
  WHERE s.filters = ss.filters
);

-- Verify no RENOVATION_FLIP remains
SELECT COUNT(*) FROM "Strategy" WHERE type = 'RENOVATION_FLIP';
```

**Step 5.2: Drop deprecated tables/columns**
```sql
-- Only after verification and app updates
DROP TABLE IF EXISTS "SavedSearch";
```

---

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Strategy.type nullable during migration | Keep as optional until discovery complete |
| SavedSearch.results JSON shape varies | Validate shape before backfill |
| PostGIS not available on Neon | Verify Neon plan supports PostGIS |
| TimescaleDB not available | Use regular tables with time indexes as fallback |
| Breaking changes to enum | Add new value first, migrate, then remove old |

---

## Rollback Plan

Each phase should be independently reversible:

1. **Phase 1**: Drop new columns/tables (no data loss in existing)
2. **Phase 2**: Keep SavedSearch, delete migrated Search rows
3. **Phase 3**: Re-add RENOVATION_FLIP, update rows back
4. **Phase 4**: Drop geometry columns, disable extensions

---

*Document Version: 1.0*
*Last Updated: 2025-12-30*
