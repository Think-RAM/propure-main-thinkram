# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) for the Propure project.

## Index

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [001](./001-queensland-planning-data-endpoints.md) | Queensland Planning Data Endpoint Selection | Accepted | 2026-01-15 |
| [002](./002-nsw-planning-data-endpoints.md) | NSW Planning Data Endpoint Selection | Accepted | 2026-01-15 |
| [003](./003-victoria-planning-data-endpoints.md) | Victoria Planning Data Endpoint Selection | Accepted | 2026-01-15 |
| [004](./004-western-australia-planning-data-endpoints.md) | Western Australia Planning Data Endpoint Selection | Accepted | 2026-01-15 |

## Pending Decisions

| ADR | Title | Status |
|-----|-------|--------|
| 005 | Council-specific endpoint integration strategy | Pending |
| 006 | Map library selection (Leaflet vs MapLibre GL) | Pending |

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
