# ADR-006: South Australia Planning Data Endpoint Selection

**Status**: Accepted
**Date**: 2026-01-15
**Decision Makers**: Dhrubbi Biswas

---

## Context

Propure requires planning and hazard data for property investment analysis in South Australia. This data must include:

1. **Land zoning** - To understand permitted uses and development potential
2. **Bushfire hazard** - To assess fire risk for properties
3. **Flood hazard** - To assess flood risk for properties
4. **Heritage listings** - To identify development constraints

South Australia underwent a major planning reform in 2021, replacing individual council Development Plans with a single statewide Planning and Design Code (P&D Code) under the Planning, Development and Infrastructure Act 2016.

---

## Decision

We will use the following **SA Location SA ArcGIS REST endpoints** as the primary data sources:

| Layer | Service | Layer ID | Type |
|-------|---------|----------|------|
| P&D Code Zones | CurrentPDC_wmas | 110 (Group) / 114 (Feature) | Group/Feature |
| Flooding - General | ConsultFlooding | 7 | Feature |
| Bushfire Hazards | CurrentPDC_wmas | 8 (Group) | Group (6 sublayers) |
| Heritage | CurrentPDC_wmas | 18 (Group) | Group (6 sublayers) |

**Base URL**: `https://location.sa.gov.au/server6/rest/services/ePlanningPublic/`

---

## Rationale

### Why These Endpoints?

1. **Statewide P&D Code** - Single planning system since 2021 reform
2. **Consistent Schema** - All layers share common field structure
3. **Comprehensive Hazard Coverage** - 6-tier bushfire system, detailed heritage layers

### Layer-Specific Decisions

#### P&D Code Zones (Layer 110/114)

**Decision**: Use CurrentPDC_wmas Layer 110 (group) or Layer 114 (feature) for zone data

**Rationale**:
- Contains all Planning and Design Code zones statewide
- Replaced 72 individual council Development Plans
- Unified zone naming convention across SA

**Important Note**: Layer 110 is a GROUP layer containing:
- Layer 111: P&D Code Subzones - Outline & Labels
- Layer 112: P&D Code Zones - Outline & Labels
- Layer 113: P&D Code Subzones
- **Layer 114: P&D Code Zones** (recommended for queries)

**Zone Categories**:

| Zone Type | Description |
|-----------|-------------|
| General Neighbourhood | Standard residential |
| Suburban Neighbourhood | Low-density residential |
| Housing Diversity Neighbourhood | Medium density |
| Urban Corridor (Main Street) | Mixed use |
| Urban Activity Centre | Major centres |
| Township | Rural towns |
| Rural | Agricultural |
| Employment | Industrial/commercial |
| Conservation | Environmental |

#### Hazards (Flooding - General) (Layer 7)

**Decision**: Use ConsultFlooding Layer 7 for flood hazard data

**Rationale**:
- Part of P&D Code overlay system
- General flood hazard mapping
- Includes legal start/end dates for data currency

**Note**: This is a general flood hazard layer. For detailed flood studies, council-specific data may be required.

#### Hazards (Bushfire) (Layer 8)

**Decision**: Use CurrentPDC_wmas Layer 8 (group) for bushfire data

**Rationale**:
- 6-tier risk classification (most granular of all states)
- CFS (Country Fire Service) managed data
- Covers urban interface to outback areas

**Important Note**: Layer 8 is a GROUP layer containing 6 sublayers:

| Layer ID | Risk Level | Description |
|----------|------------|-------------|
| 9 | Urban Interface | Highest risk - urban/rural edge |
| 10 | High Risk | High vegetation hazard |
| 11 | Medium Risk | Moderate vegetation hazard |
| 12 | General Risk | General bushfire areas |
| 13 | Regional | Regional risk areas |
| 14 | Outback | Remote/low-density areas |

#### Heritage (Layer 18)

**Decision**: Use CurrentPDC_wmas Layer 18 (group) for heritage data

**Rationale**:
- Comprehensive heritage coverage including maritime
- State and Local heritage differentiated
- Includes Heritage Adjacency for buffer zones

**Important Note**: Layer 18 is a GROUP layer containing 6 sublayers:

| Layer ID | Heritage Type | Description |
|----------|---------------|-------------|
| 19 | Historic Area | Conservation areas |
| 20 | Historic Shipwrecks | Maritime heritage |
| 21 | Heritage Adjacency | Buffer zones |
| 22 | Local Heritage Place | Council-listed |
| 23 | State Heritage Area | State precincts |
| 24 | State Heritage Place | State Register |

---

## Consequences

### Positive

- **Unified statewide system** - P&D Code replaced 72 Development Plans
- **Consistent field schema** - All layers use same structure (id, name, description, value)
- **6-tier bushfire system** - Most granular risk classification of all states
- **Comprehensive heritage** - Includes maritime and adjacency layers
- **Same CRS as QLD** - EPSG:3857, no transformation needed

### Negative

- **Group layer complexity** - Zones, Bushfire, Heritage all use group layers
- **Descriptive zone names** - Less standardized than NSW alphanumeric codes
- **Recent system** - P&D Code only since 2021, some teething issues
- **Limited flood detail** - General hazard only, no AEP/ARI data

### Mitigations

1. **Sublayer documentation** - Clear mapping of group layers to feature layers
2. **Zone normalization** - Map SA zone names to common categories
3. **Flood supplementation** - Use council flood studies where available
4. **Heritage layer selection** - Query specific sublayers based on use case

---

## SA-Specific Features

### Planning and Design Code

The P&D Code is unique in that:
- Replaced all 72 individual council Development Plans in 2021
- Provides consistent zone naming across the state
- Uses "overlays" for hazards and constraints (similar to VIC approach)
- Single assessment pathway for all developments

This is the most recent major planning reform in Australia.

### 6-Tier Bushfire System

SA's bushfire classification is the most granular:
1. **Urban Interface** - Urban/rural edge (highest risk)
2. **High Risk** - Dense vegetation
3. **Medium Risk** - Moderate vegetation
4. **General Risk** - General bushfire areas
5. **Regional** - Regional areas
6. **Outback** - Remote/arid areas

For cross-state comparisons, see [PLANNING_DATA_LAYER.md](../PLANNING_DATA_LAYER.md#quick-reference).

---

## Alternatives Considered

See [ADR README](./README.md#common-alternatives-rejected) for common rejected approaches.

### 1. Individual Council Data

Access planning data from individual SA councils.

**Rejected because**:
- P&D Code already provides statewide coverage
- 72 councils would require 72 integrations
- Data would be inconsistent

### 2. SAILIS Data Downloads

Download datasets from SA Land Information System.

**Rejected because**:
- Requires ETL pipeline
- Less current than live services
- Additional infrastructure burden

---

## Related Decisions

- [ADR-001](./001-queensland-planning-data-endpoints.md): Queensland Planning Data Endpoint Selection
- [ADR-002](./002-nsw-planning-data-endpoints.md): NSW Planning Data Endpoint Selection
- [ADR-003](./003-victoria-planning-data-endpoints.md): Victoria Planning Data Endpoint Selection
- [ADR-004](./004-western-australia-planning-data-endpoints.md): Western Australia Planning Data Endpoint Selection
- [ADR-005](./005-act-planning-data-endpoints.md): ACT Planning Data Endpoint Selection
- ADR-007 (pending): Council-specific endpoint integration strategy

---

## References

- [PlanSA](https://plan.sa.gov.au/)
- [Planning and Design Code](https://code.plan.sa.gov.au/)
- [Planning, Development and Infrastructure Act 2016](https://www.legislation.sa.gov.au/lz?path=/c/a/planning%20development%20and%20infrastructure%20act%202016)
- [Heritage Places Act 1993](https://www.legislation.sa.gov.au/lz?path=/c/a/heritage%20places%20act%201993)
- [Location SA](https://location.sa.gov.au/)
- [PLANNING_DATA_LAYER.md](../PLANNING_DATA_LAYER.md)
