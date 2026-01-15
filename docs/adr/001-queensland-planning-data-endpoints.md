# ADR-001: Queensland Planning Data Endpoint Selection

**Status**: Accepted
**Date**: 2026-01-15
**Decision Makers**: Dhrubbi Biswas

---

## Context

Propure requires planning and hazard data for property investment analysis in Queensland. This data must include:

1. **Land use/zoning** - To understand permitted uses and development potential
2. **Bushfire hazard** - To assess fire risk for properties
3. **Flood hazard** - To assess flood risk for properties
4. **Heritage listings** - To identify development constraints

Queensland has multiple data sources:
- **State-level ArcGIS REST services** - Centralized, consistent, but less granular
- **Council-specific endpoints** - Detailed planning schemes, but 77 different systems

---

## Decision

We will use the following **Queensland State Government ArcGIS REST endpoints** as the primary data sources:

| Layer | Endpoint | Layer ID |
|-------|----------|----------|
| Land Use Zones | `PlanningCadastre/LandUse/MapServer` | 0 |
| Fire Management Zone | `Boundaries/AdminBoundariesFramework/MapServer` | 14 |
| Floodplain Assessment | `Boundaries/AdminBoundariesFramework/MapServer` | 15 |
| Heritage Register | `Boundaries/AdminBoundariesFramework/MapServer` | 78 |

**Base URL**: `https://spatial-gis.information.qld.gov.au/arcgis/rest/services/`

---

## Rationale

### Why State-Level Endpoints?

1. **Consistency** - Single API pattern across all of Queensland
2. **Reliability** - State government infrastructure is more stable than individual councils
3. **Coverage** - Statewide data without needing to integrate 77 council systems
4. **Maintenance** - One integration to maintain vs. 77

### Layer-Specific Decisions

#### Land Use (Layer 0) vs Council Zoning

**Decision**: Use state-level Land Use (ALUMC classification)

**Trade-off**:
- Land Use provides 194 categories of *current* land use
- Council planning zones provide *permitted* uses and development controls
- For initial MVP, land use is sufficient; council zoning can be added later

#### Fire Management Zone (Layer 14) vs Bushfire Prone Area

**Decision**: Use Fire Management Zone (Layer 14)

**Alternative Considered**: `data.qld.gov.au/dataset/bushfire-prone-area-queensland-series` (Shapefile)

**Rationale**: Layer 14 provides real-time ArcGIS REST access; Shapefile requires ETL pipeline

#### Floodplain Assessment (Layer 15) vs Council Flood Overlays

**Decision**: Use state-level Floodplain Assessment as baseline

**Trade-off**:
- Layer 15 is a *preliminary* assessment based on contours, historical data, satellite imagery
- Council flood overlays are based on detailed flood studies
- For MVP, state-level data provides coverage; council overlays can supplement for high-risk areas

#### Heritage Register (Layer 78)

**Decision**: Use Queensland Heritage Register

**Rationale**: This is the authoritative source - places registered under Queensland Heritage Act 1992

---

## Consequences

### Positive

- Faster time-to-market with unified API
- Consistent data format across Queensland
- Reduced maintenance burden
- Reliable government infrastructure

### Negative

- **Land use vs zoning gap**: Land Use shows *what is*, not *what's permitted*
- **Flood data granularity**: State-level flood data is less precise than council studies
- **Fire management scope**: Layer 14 covers reserves, not all bushfire-prone land
- **No development controls**: Height limits, FSR, lot sizes require council data

### Mitigations

1. **Phase 2**: Add council-specific zoning endpoints for major LGAs (Brisbane, Gold Coast, Sunshine Coast)
2. **Hybrid approach**: Use state data as fallback when council data unavailable
3. **User education**: Clearly label data as "preliminary" or "indicative" where appropriate

---

## Alternatives Considered

### 1. Council-First Approach

Build integrations for all 77 QLD councils individually.

**Rejected because**:
- Massive integration effort (77 different systems)
- Inconsistent data formats and availability
- Some councils have no public ArcGIS endpoints

### 2. Third-Party Data Provider

Use Landchecker, Archistar, or CoreLogic for planning data.

**Rejected because**:
- Cost (per-property or subscription fees)
- Dependency on third-party availability
- Less control over data freshness

### 3. Shapefile Download + ETL

Download state Shapefiles and process via Python pipeline.

**Rejected for MVP because**:
- Adds complexity (ETL pipeline, storage, refresh jobs)
- Delays time-to-market
- Can be added later for offline/cached access

---

## Related Decisions

- ADR-002 (pending): Council-specific endpoint integration strategy
- ADR-003 (pending): NSW planning data endpoint selection

---

## References

- [QLD Spatial GIS Portal](https://spatial-gis.information.qld.gov.au/arcgis/rest/services/)
- [PLANNING-DATA-STRATEGY.md](../PLANNING-DATA-STRATEGY.md)
- [PLANNING_DATA_LAYER.md](../PLANNING_DATA_LAYER.md)
