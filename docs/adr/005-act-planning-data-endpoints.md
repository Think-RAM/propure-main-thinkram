# ADR-005: ACT Planning Data Endpoint Selection

**Status**: Accepted
**Date**: 2026-01-15
**Decision Makers**: Dhrubbi Biswas

---

## Context

Propure requires planning and hazard data for property investment analysis in the Australian Capital Territory. This data must include:

1. **Land zoning** - To understand permitted uses and development potential
2. **Bushfire hazard** - To assess fire risk for properties
3. **Flood hazard** - To assess flood risk for properties
4. **Heritage listings** - To identify development constraints

The ACT uses a unique planning system based on the Territory Plan under the Planning and Development Act 2007, administered by a single planning authority (unlike states with multiple local councils).

---

## Decision

We will use the following **ACT Government ArcGIS REST endpoints** as the primary data sources:

| Layer | Service | Layer ID |
|-------|---------|----------|
| Territory Plan Land Use Zones | ACTGOV_TP_LAND_USE_ZONE | 1 |
| 1 in 100 Year Flood Extent | ACTGOV_FLOOD_EXTENT | 0 |
| Fire Management Zones | Fire_Management_Zones_2015_2019 | 0 |
| Heritage Register | ACTGOV_Heritage_Register | 1 |

**Base URL**: `https://services1.arcgis.com/E5n4f1VY84i0xSjy/ArcGIS/rest/services/`

---

## Rationale

### Why These Endpoints?

1. **Single Planning Authority** - ACT is unique in having one planning system for the entire territory
2. **Territory Plan** - All zoning is governed by the Territory Plan, providing consistent data
3. **Modern CRS** - ACT uses GDA2020 (EPSG:7855), the most current Australian datum

### Layer-Specific Decisions

#### Territory Plan Land Use Zones (Layer 1)

**Decision**: Use ACTGOV_TP_LAND_USE_ZONE FeatureServer Layer 1

**Rationale**:
- Contains all 23 Territory Plan zones across 7 categories
- Zone codes (RZ1-RZ5, CZ1-CZ6, etc.) are well-structured
- Includes gazettal dates and variation tracking for data currency
- Division and District fields provide locality context

**Zone Categories**:

| Category | Zone Codes | Purpose |
|----------|------------|---------|
| Residential | RZ1-RZ5 | Suburban to high-density residential |
| Commercial | CZ1-CZ6 | Retail, office, mixed use |
| Industrial | IZ1-IZ2 | Light and heavy industrial |
| Community Facility | CFZ | Schools, hospitals, community uses |
| Parks and Recreation | PRZ1-PRZ2 | Open space and recreation |
| Transport and Services | TSZ1-TSZ2 | Roads, utilities, infrastructure |
| Non-Urban | NUZ | Rural and conservation areas |

#### 1 in 100 Year Flood Extent (Layer 0)

**Decision**: Use ACTGOV_FLOOD_EXTENT FeatureServer Layer 0

**Rationale**:
- Standard 1% AEP flood extent used for planning across Australia
- Simple extent layer suitable for property risk identification
- GDA2020 projection matches modern standards

**Important Note**: This layer provides flood extent only, not flood depth or height data. For detailed flood assessment, additional studies may be required.

#### Fire Management Zones 2015-2019 (Layer 0)

**Decision**: Use Fire_Management_Zones_2015_2019 FeatureServer Layer 0

**Rationale**:
- Contains 7 fire management zone categories
- Includes Asset Protection Zones critical for property assessment
- Managed by ACT Parks and Conservation Service

**Important Note**: This data covers 2015-2019. For current bushfire prone area mapping, verify with ACT Emergency Services Agency. ACT does not maintain a formal "bushfire prone land" map like other states.

#### ACT Heritage Register (Layer 1)

**Decision**: Use ACTGOV_Heritage_Register FeatureServer Layer 1

**Rationale**:
- Official Heritage Register under Heritage Act 2004
- Includes Aboriginal, Historic, and Natural heritage categories
- Registration status clearly indicates protection level
- Sensitive Aboriginal site locations are protected through block-level mapping

---

## Consequences

### Positive

- **Single planning system** - One set of rules for entire ACT, simpler than multi-council states
- **Modern CRS** - GDA2020 is the current Australian standard
- **Clear zone codes** - RZ1, CZ1 format is intuitive and consistent
- **Heritage categories** - Aboriginal, Historic, Natural clearly distinguished
- **Territory Plan structure** - Well-documented with gazettal tracking

### Negative

- **Different CRS from other states** - EPSG:7855 requires transformation
- **Limited flood data** - Extent only, no height/depth information
- **Historical fire data** - 2015-2019 data may not reflect current conditions
- **No formal bushfire prone mapping** - Unlike NSW/WA, ACT lacks RFS-style categories
- **Smaller record limits** - 1,000-2,000 records vs WA's 10,000

### Mitigations

1. **CRS transformation** - Transform EPSG:7855 to EPSG:7844 (GDA2020 geographic) for storage
2. **Flood supplementation** - Consider Icon Water flood studies for detailed analysis
3. **Fire data verification** - Cross-reference with ACT ESA for current conditions
4. **Layer ID awareness** - Note that ACT uses Layer 1 (not 0) for some FeatureServers

---

## ACT-Specific: Single Planning Authority

Unlike all other Australian states/territories, ACT has:
- One Territory Plan covering all land
- No local councils with separate planning schemes
- Unified development assessment process
- Consistent data across entire territory

This simplifies integration but requires understanding the ACT-specific zone nomenclature.

For cross-state comparisons, see [PLANNING_DATA_LAYER.md](../PLANNING_DATA_LAYER.md#quick-reference).

---

## Alternatives Considered

See [ADR README](./README.md#common-alternatives-rejected) for common rejected approaches.

### 1. ACTmapi Portal

Use the direct ACTmapi endpoints at gisdata.act.gov.au.

**Rejected because**:
- Less reliable availability observed during testing
- services1.arcgis.com endpoints more stable
- Same underlying data, different hosting

### 2. data.act.gov.au Downloads

Download datasets from the ACT open data portal.

**Rejected because**:
- Requires ETL pipeline for Shapefile/GeoJSON processing
- Less current than live services
- Additional infrastructure for data refresh

---

## Related Decisions

- [ADR-001](./001-queensland-planning-data-endpoints.md): Queensland Planning Data Endpoint Selection
- [ADR-002](./002-nsw-planning-data-endpoints.md): NSW Planning Data Endpoint Selection
- [ADR-003](./003-victoria-planning-data-endpoints.md): Victoria Planning Data Endpoint Selection
- [ADR-004](./004-western-australia-planning-data-endpoints.md): Western Australia Planning Data Endpoint Selection
- ADR-006 (pending): Council-specific endpoint integration strategy

---

## References

- [ACTmapi](https://actmapi.act.gov.au/)
- [Territory Plan](https://www.planning.act.gov.au/planning-our-city/territory-plan)
- [Planning and Development Act 2007](https://www.legislation.act.gov.au/a/2007-24/)
- [Heritage Act 2004](https://www.legislation.act.gov.au/a/2004-57/)
- [PLANNING_DATA_LAYER.md](../PLANNING_DATA_LAYER.md)
