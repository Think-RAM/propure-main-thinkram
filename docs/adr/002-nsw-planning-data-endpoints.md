# ADR-002: NSW Planning Data Endpoint Selection

**Status**: Accepted
**Date**: 2026-01-15
**Decision Makers**: Dhrubbi Biswas

---

## Context

Propure requires planning and hazard data for property investment analysis in NSW. This data must include:

1. **Land zoning** - To understand permitted uses and development potential
2. **Bushfire hazard** - To assess fire risk for properties
3. **Flood hazard** - To assess flood risk for properties
4. **Heritage listings** - To identify development constraints

NSW has a centralized planning data system through the NSW Planning Portal, which provides comprehensive statewide coverage via ArcGIS REST services.

---

## Decision

We will use the following **NSW Planning Portal ArcGIS REST endpoints** as the primary data sources:

| Layer | Service | Layer ID | Endpoint |
|-------|---------|----------|----------|
| Land Zoning | EPI_Primary_Planning_Layers | 2 | `Planning/EPI_Primary_Planning_Layers/MapServer/2` |
| Heritage | EPI_Primary_Planning_Layers | 0 | `Planning/EPI_Primary_Planning_Layers/MapServer/0` |
| Bushfire Prone Land | Planning_Portal_Hazard | 229 | `ePlanning/Planning_Portal_Hazard/MapServer/229` |
| Flood Planning | Planning_Portal_Hazard | 230 | `ePlanning/Planning_Portal_Hazard/MapServer/230` |

**Base URL**: `https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/`

---

## Rationale

### Why These Endpoints?

1. **Authoritative Source** - Data derived from Environmental Planning Instruments under the Environmental Planning and Assessment Act 1979
2. **Statewide Coverage** - Single integration covers all NSW LGAs
3. **Consistent Schema** - All layers use standard EPI fields (`EPI_NAME`, `LGA_NAME`, `LAY_CLASS`)
4. **Regular Updates** - Data currency maintained by NSW Planning Portal

### Layer-Specific Decisions

#### Land Zoning (Layer 2)

**Decision**: Use EPI_Primary_Planning_Layers Layer 2

**Rationale**:
- Contains formal zoning from Local Environmental Plans (LEPs)
- Includes permitted land uses via `PURPOSE` field
- Standard Instrument LEP zone codes (R1, B2, IN1, etc.) are consistent across NSW

#### Heritage (Layer 0)

**Decision**: Use EPI_Primary_Planning_Layers Layer 0

**Rationale**:
- Includes all heritage items from LEPs
- Significance levels (Local, State, National) clearly defined
- Heritage item names available for display

#### Bushfire Prone Land (Layer 229)

**Decision**: Use Planning_Portal_Hazard Layer 229

**Rationale**:
- Certified by NSW Rural Fire Service Commissioner
- Clear vegetation categories (1, 2, 3) with buffer zones
- Directly applicable to Planning for Bush Fire Protection requirements

#### Flood Planning (Layer 230)

**Decision**: Use Planning_Portal_Hazard Layer 230

**Rationale**:
- Based on LEP flood mapping clauses
- Includes 1 in 100 year flood, PMF, and flood planning areas
- Tied to development control requirements

---

## Consequences

### Positive

- **Authoritative data** - Legally-backed planning data from EPIs
- **Consistent structure** - All layers share common field patterns
- **Single integration** - One API pattern for all four layer types
- **Clear classifications** - Standard zone codes and hazard categories

### Negative

- **CRS difference from QLD** - NSW uses EPSG:4326 (GDA94) vs QLD's EPSG:3857
- **Different field names** - NSW uses `LAY_CLASS` vs QLD's varied field names
- **Bushfire categories differ** - NSW uses numeric categories, QLD uses zone names

### Mitigations

1. **CRS transformation** - Transform to EPSG:7844 (GDA2020) for storage consistency
2. **Field mapping layer** - Abstract field differences in application layer
3. **Category normalization** - Map both states' bushfire data to common risk levels

---

## Alternatives Considered

See [ADR README](./README.md#common-alternatives-rejected) for common rejected approaches.

### 1. SEED NSW Open Data

Download datasets from NSW SEED portal.

**Rejected because**:
- Requires ETL pipeline for Shapefile processing
- Less current than live ArcGIS REST endpoints
- Additional infrastructure for data refresh

### 2. Individual Council Planning Portals

Some councils have their own planning viewers.

**Rejected because**:
- Inconsistent availability
- Duplicates state-level data
- Additional integration effort with no benefit

---

## Related Decisions

- [ADR-001](./001-queensland-planning-data-endpoints.md): Queensland Planning Data Endpoint Selection
- ADR-003 (pending): Council-specific endpoint integration strategy

---

## References

- [NSW Planning Portal Spatial Viewer](https://www.planningportal.nsw.gov.au/spatialviewer/)
- [Environmental Planning and Assessment Act 1979](https://legislation.nsw.gov.au/view/html/inforce/current/act-1979-203)
- [PLANNING_DATA_LAYER.md](../PLANNING_DATA_LAYER.md)
