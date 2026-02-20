# ADR-010: Geospatial Bounding Box Strategy

**Status**: Accepted
**Date**: 2026-01-27
**Decision Makers**: Dhrubbi Biswas

---

## Context

Propure is a property investment platform that requires geospatial querying capabilities:

1. **Map viewport queries**: Find all properties visible within the current map bounds (bounding box)
2. **Radius search**: Find properties within X km of a point (e.g., near a train station)
3. **Suburb boundary queries**: Determine which suburb a property falls within
4. **Proximity ranking**: Sort properties by distance from a reference point

The current architecture uses PostGIS on Neon PostgreSQL for these queries, leveraging spatial indexes (GIST), `ST_Within`, `ST_DWithin`, `ST_Distance`, and `ST_MakeEnvelope` functions. These are powerful but tightly coupled to PostgreSQL.

With the decision to adopt Convex as the unified backend (ADR-009), PostGIS is no longer available. Convex is a document database with no spatial extension support. A new approach to geospatial queries is needed that works within Convex's index and query model.

### Query Patterns Analysis

Reviewing the existing codebase (`packages/geo/src/queries.ts` and the architecture docs), the actual geospatial query patterns are:

| Pattern | Current Implementation | Frequency |
|---------|----------------------|-----------|
| Map viewport (bounding box) | `ST_Within` + `ST_MakeEnvelope` | Every map pan/zoom |
| Radius search | `ST_DWithin` + distance calculation | AI tool calls |
| Suburb lookup by coordinates | `ST_Contains` on suburb geometry | Property ingestion |
| Nearest suburbs | `<->` KNN operator on centroid | Strategy recommendations |
| Suburb boundary rendering | `ST_AsGeoJSON` on geometry | Map layer rendering |

The key insight is that **bounding box queries dominate** (every map interaction), and most other patterns can be decomposed into a bounding box pre-filter followed by precise distance calculation.

---

## Decision

Store latitude and longitude as `v.float64()` fields on property and suburb tables. Use **Convex compound indexes** for bounding-box queries (latitude/longitude range filtering) combined with **client-side Haversine distance calculation** for precise radius filtering.

### Storage Schema

```typescript
// In Convex schema
properties: defineTable({
  // ... other fields
  latitude: v.float64(),
  longitude: v.float64(),
  suburbId: v.id("suburbs"),
})
  .index("by_location_lat", ["latitude"])
  .index("by_location_lng", ["longitude"])
  .index("by_suburb", ["suburbId"])

suburbs: defineTable({
  // ... other fields
  centroidLat: v.float64(),
  centroidLng: v.float64(),
  // Boundary GeoJSON stored as string for map rendering
  boundaryGeoJson: v.optional(v.string()),
})
  .index("by_centroid_lat", ["centroidLat"])
```

### Query Strategy

**Bounding Box (Map Viewport)**:
```typescript
// Convex query function
export const searchByBounds = query({
  args: {
    south: v.float64(),
    north: v.float64(),
    west: v.float64(),
    east: v.float64(),
    // additional filters...
  },
  handler: async (ctx, args) => {
    // Use latitude index for range query
    const candidates = await ctx.db
      .query("properties")
      .withIndex("by_location_lat", (q) =>
        q.gte("latitude", args.south).lte("latitude", args.north)
      )
      .collect();

    // Filter longitude in memory (efficient after lat narrowing)
    return candidates.filter(
      (p) => p.longitude >= args.west && p.longitude <= args.east
    );
  },
});
```

**Radius Search**:
```typescript
// Pre-filter with bounding box, then Haversine
export const searchByRadius = query({
  args: {
    centerLat: v.float64(),
    centerLng: v.float64(),
    radiusKm: v.float64(),
  },
  handler: async (ctx, args) => {
    // Calculate bounding box from radius
    const bounds = getBoundsFromRadius(args.centerLat, args.centerLng, args.radiusKm);

    // Bounding box pre-filter
    const candidates = await ctx.db
      .query("properties")
      .withIndex("by_location_lat", (q) =>
        q.gte("latitude", bounds.south).lte("latitude", bounds.north)
      )
      .collect();

    // Haversine filter for precise radius
    return candidates
      .filter((p) => p.longitude >= bounds.west && p.longitude <= bounds.east)
      .filter((p) => haversineDistance(args.centerLat, args.centerLng, p.latitude, p.longitude) <= args.radiusKm)
      .sort((a, b) =>
        haversineDistance(args.centerLat, args.centerLng, a.latitude, a.longitude) -
        haversineDistance(args.centerLat, args.centerLng, b.latitude, b.longitude)
      );
  },
});
```

**Haversine Helper**:
```typescript
export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
```

---

## Rationale

### Bounding Box Covers the Primary Use Case

Map viewport queries (bounding box) account for the vast majority of geospatial queries in the application. Every map pan and zoom triggers a bounding box query. Convex's index range queries handle this efficiently — the latitude index narrows results to a latitude band, then longitude filtering in memory is fast on the reduced set.

### Suburb-Level Filtering Covers 90% of Non-Map Queries

Most AI-driven property searches are at the suburb level ("show me properties in Parramatta" or "find suburbs near Chatswood"). These queries use `suburbId` references rather than raw coordinates. The suburb relationship is established at data ingestion time and doesn't require runtime spatial queries.

### Bounding Box → Haversine is a Standard Pattern

The bounding-box-then-precise-filter pattern is well-established in applications without spatial databases. It's used by MongoDB's 2D indexes, Elasticsearch's geo queries, and many mobile applications. The Haversine formula provides sub-metre accuracy for distances relevant to property search (1-50 km).

### Australia's Geography is Favorable

Australia's property markets are concentrated in coastal cities with relatively compact metropolitan areas. A typical map viewport at suburb-level zoom covers a small enough latitude range that the index pre-filter is highly selective. The worst case (zoomed out to national view) is not a practical search scenario — users always narrow to a city or region.

### Property Dataset Size is Manageable

The expected property dataset (active listings across Australia) is in the tens of thousands, not millions. Bounding box queries with in-memory longitude filtering will perform well at this scale. If the dataset grows to hundreds of thousands, Convex's query performance remains adequate for sub-second responses.

---

## Consequences

### Positive

- **Simple implementation**: No spatial extensions, no GIS libraries, no special index types. Standard TypeScript code with standard Convex indexes.
- **Portable logic**: Haversine and bounding box calculations are pure TypeScript functions that can run anywhere (server, client, worker).
- **Reactive queries**: Bounding box queries are standard Convex queries, so they participate in the reactive subscription system. Map data updates automatically when properties change.
- **No external dependencies**: No PostGIS, no spatial libraries, no GIST indexes. Fewer failure modes.

### Negative

- **No complex polygon queries**: Cannot efficiently answer "is this point inside this suburb boundary polygon?" at query time. Suburb assignment must be done at ingestion time.
- **Less precise than PostGIS for edge cases**: Bounding box queries on the antimeridian (180°/-180° longitude) require special handling. Not relevant for Australia.
- **No spatial JOINs**: Cannot do "find all suburbs that intersect with this rectangle" as a single indexed operation. Must iterate suburbs and check centroids.
- **In-memory filtering overhead**: For very large result sets from the latitude index, longitude filtering in memory adds CPU cost. Mitigated by the practical dataset size.
- **Suburb boundaries**: GeoJSON polygon boundaries for suburb rendering must be stored as strings and parsed client-side. No server-side spatial operations on polygon geometry.

### Mitigations

1. **Suburb assignment at ingestion**: When properties are ingested from Domain/REA APIs, assign `suburbId` based on the suburb name/postcode from the listing data (not coordinate-in-polygon). This is more reliable than spatial lookup since listing data includes suburb names.
2. **Boundary rendering**: Store suburb boundary GeoJSON in a separate field. Serve it to the frontend for MapLibre rendering. No server-side polygon operations needed — the map library handles it.
3. **Scale**: If dataset grows beyond 100K properties, consider partitioning by state or adding a `geohash` string field for more selective indexing.

---

## Alternatives Considered

### 1. Keep Neon/PostGIS Alongside Convex

Maintain a PostgreSQL database specifically for spatial queries while using Convex for everything else.

**Rejected because**:
- Defeats the single-backend goal of ADR-009
- Requires syncing data between Convex and PostgreSQL
- Adds a second database to monitor, maintain, and pay for
- Creates consistency challenges (property in Convex, spatial data in PostgreSQL)

### 2. External Geospatial API (Mapbox, Google Maps)

Use Mapbox Tilequery API or Google Maps Geocoding/Places API for spatial queries.

**Rejected because**:
- Adds external API dependency and per-request cost
- Increases latency (network round-trip to external service)
- Rate limiting constraints on external APIs
- Property data must still be indexed locally for non-spatial filters (price, bedrooms, etc.)

### 3. Geohash String Indexing

Encode lat/lng as geohash strings and use prefix matching for proximity queries.

**Rejected because**:
- More complex to implement than bounding box
- Geohash edge-case handling (boundary crossings between adjacent cells) adds code complexity
- Bounding box is simpler and sufficient for the current use case
- Could be added later as an optimisation if needed

---

## Related Decisions

- ADR-009: Convex as Unified Backend (motivating decision — no PostGIS available)
- ADR-011: Convex Agent Multi-Agent Orchestration (agents use geospatial tools)

---

## References

- [Haversine Formula](https://en.wikipedia.org/wiki/Haversine_formula)
- [Convex Indexes Documentation](https://docs.convex.dev/database/indexes/)
- [Bounding Box Distance Calculation](https://www.movable-type.co.uk/scripts/latlong.html)
- [Current PostGIS Queries](../ARCHITECTURE.md#geospatial-query-examples)
