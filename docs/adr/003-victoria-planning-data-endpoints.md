# ADR-003: Victoria Planning Data Endpoint Selection

**Status**: Accepted
**Date**: 2026-01-15
**Decision Makers**: Dhrubbi Biswas

---

## Context

Propure requires planning and hazard data for property investment analysis in Victoria. This data must include:

1. **Land zoning** - To understand permitted uses and development potential
2. **Bushfire hazard** - To assess fire risk for properties
3. **Flood hazard** - To assess flood risk for properties
4. **Heritage listings** - To identify development constraints

Victoria has two primary data portals:
- **Vicplan** - Planning scheme zones and overlays
- **eMap (FFM)** - Emergency management data (flood, fire)

---

## Decision

We will use the following **Victorian Government ArcGIS REST endpoints** as the primary data sources:

| Layer | Service | Endpoint |
|-------|---------|----------|
| Planning Zones | Vicplan | `Planning/Vicplan_PlanningSchemeZones/MapServer/2` |
| Heritage & Built Form | Vicplan | `Planning/Vicplan_PlanningSchemeOverlays/MapServer/6` |
| Flood Database | eMap FFM | `Victorian_Flood_Database/MapServer` |
| **Flood Height (1:100)** | eMap FFM | `Victorian_Flood_Database/MapServer/13` |
| Bushfire History | eMap FFM | `vsw_fire_management/MapServer/47` |

**Base URLs**:
- Vicplan: `https://plan-gis.mapshare.vic.gov.au/arcgis/rest/services/`
- eMap: `https://emapdev.ffm.vic.gov.au/arcgis/rest/services/`

---

## Rationale

### Why These Endpoints?

1. **Authoritative Source** - Vicplan provides official planning scheme data under the Planning and Environment Act 1987
2. **Comprehensive Coverage** - Victorian Flood Database provides historical and statistical flood data
3. **Established Services** - Both services are maintained by Victorian Government agencies

### Layer-Specific Decisions

#### Planning Scheme Zones (Vicplan Layer 2)

**Decision**: Use Vicplan_PlanningSchemeZones Group Layer

**Important Note**: This is a GROUP layer containing sublayers for each zone type. Implementation must query individual sublayers (GRZ, NRZ, etc.) for feature data.

**Rationale**:
- Contains all Victoria Planning Provisions (VPP) zones
- Organized by zone category (Residential, Commercial, Industrial, Rural, etc.)
- Direct link to planning scheme provisions

#### Heritage and Built Form Overlays (Vicplan Layer 6)

**Decision**: Use Vicplan_PlanningSchemeOverlays Group Layer

**Important Note**: This is a GROUP layer. Query HO (Heritage Overlay) sublayer specifically for heritage data.

**Rationale**:
- Heritage Overlay (HO) provides heritage protection boundaries
- Also includes DDO, DPO, NCO for built form controls
- Covers both individual items and precincts

#### Victorian Flood Database

**Decision**: Use eMap Victorian_Flood_Database MapServer

**Rationale**:
- Comprehensive flood data: historical events, statistical modeling, infrastructure
- Multiple AEP layers (1 in 5 to 1 in 500 year)
- More detailed than NSW/QLD preliminary assessments

#### Flood Height Contours - 1 in 100 Year (Layer 13)

**Decision**: Use Layer 13 as primary flood layer for height and zone data

**Endpoint**: `Victorian_Flood_Database/MapServer/13`

**Rationale**:
- 1 in 100 year (1% AEP) is the standard planning level across Australia
- Contains `HEIGHT` field with flood elevation in metres AHD
- Includes `RELIABILITY` and `METHOD` fields for data quality assessment
- Essential for determining floor level requirements and freeboard calculations

**Key Fields**:
- `HEIGHT` - Flood water elevation (metres AHD)
- `STUDYID` - Links to specific flood study
- `RELIABILITY` - Data quality indicator
- `METHOD` - Modeling methodology used

**Use Cases**:
- Floor level requirements (HEIGHT + freeboard)
- Property flood risk assessment
- Development application assessment
- Insurance risk calculation

#### Bushfire History (Layer 47)

**Decision**: Use vsw_fire_management Layer 47 for historical data

**Important Note**: This provides HISTORICAL bushfire records, not bushfire prone land mapping. For formal Bushfire Management Overlay (BMO), use the Vicplan_PlanningSchemeOverlays service (Layer 3 - Land Management).

**Rationale**:
- 50+ years of fire history
- Useful for risk assessment and insurance purposes
- Complements BMO planning overlay

---

## Consequences

### Positive

- **Authoritative planning data** - Direct from Victoria Planning Provisions
- **Comprehensive flood data** - Best flood database of the three states
- **Historical fire records** - Unique dataset for risk assessment

### Negative

- **Group layers require sublayer queries** - More complex than NSW/QLD feature layers
- **Different CRS** - EPSG:3111 (VicGrid94) requires transformation
- **Bushfire data is historical** - Not bushfire prone land mapping
- **Two different portals** - Planning vs Emergency Management data split

### Mitigations

1. **Sublayer handling** - Implement logic to query specific sublayers within group layers
2. **CRS transformation** - Transform to EPSG:7844 (GDA2020) for storage consistency
3. **BMO for bushfire planning** - Use Vicplan_PlanningSchemeOverlays Layer 3 for Bushfire Management Overlay
4. **Portal abstraction** - Abstract portal differences in application layer

---

## Alternatives Considered

See [ADR README](./README.md#common-alternatives-rejected) for common rejected approaches.

### 1. DataVic Open Data

Download datasets from data.vic.gov.au.

**Rejected because**:
- Requires ETL pipeline
- Less current than live services
- Additional infrastructure burden

### 2. Council Planning Portals

Some councils have their own planning viewers.

**Rejected because**:
- Vicplan already provides statewide coverage
- Duplicates state-level data
- Inconsistent availability

---

## Related Decisions

- [ADR-001](./001-queensland-planning-data-endpoints.md): Queensland Planning Data Endpoint Selection
- [ADR-002](./002-nsw-planning-data-endpoints.md): NSW Planning Data Endpoint Selection
- ADR-004 (pending): Council-specific endpoint integration strategy

---

## References

- [Vicplan](https://www.planning.vic.gov.au/planning-schemes/using-vicplan)
- [Planning and Environment Act 1987](https://www.legislation.vic.gov.au/in-force/acts/planning-and-environment-act-1987)
- [Victoria Planning Provisions](https://planning-schemes.app.planning.vic.gov.au/Victoria%20Planning%20Provisions)
- [PLANNING_DATA_LAYER.md](../PLANNING_DATA_LAYER.md)
