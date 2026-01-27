# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) for the Propure project.

---

## Common Context: Planning Data Requirements

All state-level planning data ADRs (001-006) address the same four data requirements for property investment analysis:

1. **Land zoning** - To understand permitted uses and development potential
2. **Bushfire hazard** - To assess fire risk for properties
3. **Flood hazard** - To assess flood risk for properties
4. **Heritage listings** - To identify development constraints

For cross-state comparisons and endpoint details, see **[PLANNING_DATA_LAYER.md](../PLANNING_DATA_LAYER.md)**.

---

## Common Alternatives Rejected

The following approaches were evaluated and rejected for all states:

| Approach | Rejected Because |
|----------|------------------|
| **Shapefile/ETL download** | Requires pipeline infrastructure, less current than live APIs |
| **Council-specific endpoints** | Inconsistent availability, duplicates state-level data |
| **Third-party aggregators** | Additional cost, data freshness concerns, dependency risk |

---

## Index

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [001](./001-queensland-planning-data-endpoints.md) | Queensland Planning Data Endpoint Selection | Accepted | 2026-01-15 |
| [002](./002-nsw-planning-data-endpoints.md) | NSW Planning Data Endpoint Selection | Accepted | 2026-01-15 |
| [003](./003-victoria-planning-data-endpoints.md) | Victoria Planning Data Endpoint Selection | Accepted | 2026-01-15 |
| [004](./004-western-australia-planning-data-endpoints.md) | Western Australia Planning Data Endpoint Selection | Accepted | 2026-01-15 |
| [005](./005-act-planning-data-endpoints.md) | ACT Planning Data Endpoint Selection | Accepted | 2026-01-15 |
| [006](./006-south-australia-planning-data-endpoints.md) | South Australia Planning Data Endpoint Selection | Accepted | 2026-01-15 |
| [009](./009-convex-unified-backend.md) | Convex as Unified Backend Platform | Accepted | 2026-01-27 |
| [010](./010-geospatial-bounding-box-strategy.md) | Geospatial Bounding Box Strategy | Accepted | 2026-01-27 |
| [011](./011-convex-agent-multi-agent-orchestration.md) | Convex Agent Multi-Agent Orchestration | Accepted | 2026-01-27 |

## Pending Decisions

| ADR | Title | Status |
|-----|-------|--------|
| 007 | Council-specific endpoint integration strategy | Pending |
| 008 | Map library selection (Leaflet vs MapLibre GL) | Pending |

## ADR Format

Each ADR follows this structure:

1. **Status** - Proposed, Accepted, Deprecated, Superseded
2. **Context** - Why is this decision needed?
3. **Decision** - What is the change being proposed?
4. **Rationale** - Why was this decision made?
5. **Consequences** - What are the positive and negative outcomes?
6. **Alternatives Considered** - What other options were evaluated?

## Creating a New ADR

1. Copy `_template.md` to a new file with the next number (e.g., `002-title.md`)
2. Fill in all sections
3. Update the index in this README
4. Submit for review
