# ADR-004: Western Australia Planning Data Endpoint Selection

**Status**: Accepted
**Date**: 2026-01-15
**Decision Makers**: Dhrubbi Biswas

---

## Context

Propure requires planning and hazard data for property investment analysis in Western Australia. This data must include:

1. **Land zoning** - To understand permitted uses and development potential
2. **Density codes (R-Codes)** - WA-specific residential density system
3. **Bushfire hazard** - To assess fire risk for properties
4. **Flood hazard** - To assess flood risk for properties
5. **Heritage listings** - To identify development constraints

Western Australia has a centralized Shared Location Information Platform (SLIP) that provides comprehensive statewide planning data via ArcGIS REST services.

---

## Decision

We will use the following **WA SLIP ArcGIS REST endpoints** as the primary data sources:

| Layer | Service | Layer ID | Dataset ID |
|-------|---------|----------|------------|
| Zones and Reserves | Property_and_Planning | 112 | DPLH-071 |
| R-Codes | Property_and_Planning | 111 | DPLH-070 |
| Bush Fire Prone Areas | Bush_Fire_Prone_Areas | 17 | OBRM-001 |
| Heritage List | People_and_Society | 16 | DPLH-090 |
| Historical Floodplain | Water | 57 | DWER-124 |

**Base URL**: `https://public-services.slip.wa.gov.au/public/rest/services/SLIP_Public_Services/`

---

## Rationale

### Why These Endpoints?

1. **Centralized Platform** - SLIP provides single point of access for all WA spatial data
2. **Standardized Zones** - Zone numbers standardized across all local planning schemes
3. **High Record Limit** - 10,000 records per query (highest of all states)
4. **Dataset IDs** - Each layer has a catalogue reference for data lineage

### Layer-Specific Decisions

#### Zones and Reserves (Layer 112)

**Decision**: Use Property_and_Planning Layer 112 for primary zoning

**Rationale**:
- Contains all local planning scheme zones statewide
- Zone numbers standardized for cross-scheme comparison
- Includes gazettal dates for data currency

#### R-Codes (Layer 111)

**Decision**: Include R-Codes as a separate layer (unique to WA)

**Rationale**:
- WA uses R-Codes for residential density (R2 to R160)
- Determines minimum lot sizes and dwelling yield
- Critical for subdivision and development feasibility
- Not available in any other state's planning system

**R-Code Impact on Development**:

| R-Code | Min Lot Size | Typical Use |
|--------|--------------|-------------|
| R20 | 500 m² | Standard suburban |
| R30 | 333 m² | Medium density |
| R40 | 250 m² | Grouped dwellings |
| R60 | 166 m² | Townhouses |
| R80+ | <125 m² | Apartments |

#### Bush Fire Prone Areas (Layer 17)

**Decision**: Use Bush_Fire_Prone_Areas Layer 17

**Rationale**:
- Official OBRM (Office of Bushfire Risk Management) data
- Triggers AS 3959 compliance requirements
- Includes designation dates for currency

#### Heritage List (Layer 16)

**Decision**: Use People_and_Society Layer 16

**Rationale**:
- State Heritage Register data under Heritage Act 2018
- Includes place numbers and names
- Links to additional information via `more_info` field

#### Historical Floodplain (Layer 57)

**Decision**: Use Water Layer 57 for flood data

**Rationale**:
- DWER (Department of Water and Environmental Regulation) authoritative data
- Includes ARI (Annual Recurrence Interval) values
- Historical flood events with verification dates

---

## Consequences

### Positive

- **Highest record limit** - 10,000 per query vs 1,000-2,000 in other states
- **Standardized zones** - Zone numbers consistent across all WA schemes
- **R-Code data** - Unique density information not available elsewhere
- **Dataset IDs** - Clear data provenance and catalogue references
- **Same CRS as NSW** - EPSG:4326, no transformation needed

### Negative

- **R-Code complexity** - Additional layer to query and interpret
- **Descriptive zone names** - Less standardized than NSW alphanumeric codes
- **Historical flood data** - Based on past events, not modeled scenarios
- **Different service structure** - Multiple services for different data types

### Mitigations

1. **R-Code lookup table** - Implement lot size calculations from R-Code values
2. **Zone normalization** - Map WA zone names to common categories
3. **Flood modeling** - Supplement with council-specific flood studies where available

---

## WA-Specific: R-Codes

R-Codes are unique to Western Australia and determine:
- Minimum and average lot sizes
- Plot ratio (for higher codes)
- Open space requirements
- Setback requirements
- Dwelling yield potential

This is a **critical differentiator** for development feasibility analysis in WA.

For cross-state comparisons, see [PLANNING_DATA_LAYER.md](../PLANNING_DATA_LAYER.md#quick-reference).

---

## Alternatives Considered

See [ADR README](./README.md#common-alternatives-rejected) for common rejected approaches.

### 1. Individual Council Planning Schemes

Access each local government's planning data separately.

**Rejected because**:
- SLIP already aggregates all LGA data
- 139 local governments in WA
- Inconsistent data formats

### 2. PlanWA Portal

Use the interactive PlanWA mapping viewer.

**Rejected because**:
- No REST API access
- SLIP provides same data via API
- Limited query capabilities

---

## Related Decisions

- [ADR-001](./001-queensland-planning-data-endpoints.md): Queensland Planning Data Endpoint Selection
- [ADR-002](./002-nsw-planning-data-endpoints.md): NSW Planning Data Endpoint Selection
- [ADR-003](./003-victoria-planning-data-endpoints.md): Victoria Planning Data Endpoint Selection
- ADR-005 (pending): Council-specific endpoint integration strategy

---

## References

- [SLIP Portal](https://www.slip.wa.gov.au/)
- [WA Data Catalogue](https://catalogue.data.wa.gov.au/)
- [Planning and Development Act 2005](https://www.legislation.wa.gov.au/legislation/statutes.nsf/main_mrtitle_767_homepage.html)
- [R-Codes (State Planning Policy 7.3)](https://www.wa.gov.au/government/publications/state-planning-policy-73-residential-design-codes)
- [PLANNING_DATA_LAYER.md](../PLANNING_DATA_LAYER.md)
