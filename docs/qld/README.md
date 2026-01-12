# Queensland Planning Data Research

This directory contains research and documentation specific to ingesting Queensland planning and zoning data into Propure.

## Context

Queensland uses a **decentralized planning system** where zoning is managed by individual local government areas (councils). This contrasts with NSW's centralized Standard Instrument LEP approach.

## Key Challenges

1. **Council-Specific Zoning**: Each of the 77 QLD councils has its own planning scheme with unique zone codes
2. **No Statewide WFS**: Unlike NSW/VIC, there's no single WFS endpoint for planning zones
3. **Land Use ≠ Zoning**: State provides ALUMC land use data, not detailed planning zoning
4. **Varying Access Methods**: Some councils offer WFS/WMS, others only interactive maps, many require direct contact

## Central QLD Government ArcGIS REST Services

### Main Portal (Statewide)

**Central Directory**: `https://spatial-gis.information.qld.gov.au/arcgis/rest/services/`

This is the authoritative statewide ArcGIS REST directory (Version 11.3) with 50+ service folders covering all QLD government spatial data. Key folders for planning include:

| Folder | Services | Description |
|--------|----------|-------------|
| `PlanningCadastre/` | 11 services | Cadastral, Land Use, PDAs, SDAs, Coastal |
| `Boundaries/` | AdminBoundariesFramework (130+ layers) | LGAs, Localities, ShapingSEQ, Electoral |
| `FloodCheck/` | Flood mapping | Historic flood lines, overlays |
| `Environment/` | Environmental layers | MSES, Vegetation, Wetlands |

**Important Limitation**: The central portal provides **statewide foundational data** but does **NOT** include individual council planning zones. Council-specific zoning data must be accessed from each council's own ArcGIS endpoint.

### PlanningCadastre Services

| Service | Endpoint | Description |
|---------|----------|-------------|
| **Land Parcel Framework** | `https://spatial-gis.information.qld.gov.au/arcgis/rest/services/PlanningCadastre/LandParcelPropertyFramework/MapServer` | Cadastral parcels (nightly), addresses, LGA/locality boundaries |
| **Land Use (ALUMC)** | `https://spatial-gis.information.qld.gov.au/arcgis/rest/services/PlanningCadastre/LandUse/MapServer` | Statewide land use classification (ACLUMP) |
| **Priority Development Areas** | `https://spatial-gis.information.qld.gov.au/arcgis/rest/services/PlanningCadastre/PriorityDevelopmentAreas/MapServer` | Gazetted PDAs statewide |
| **State Development Areas** | `https://spatial-gis.information.qld.gov.au/arcgis/rest/services/PlanningCadastre/StateDevelopmentAreas/MapServer` | Coordinator General SDAs |
| **Residential Land Supply** | `https://spatial-gis.information.qld.gov.au/arcgis/rest/services/PlanningCadastre/ResidentialLandSupply/MapServer` | Housing supply data |
| **Coastal Management** | `https://spatial-gis.information.qld.gov.au/arcgis/rest/services/PlanningCadastre/CoastalManagement/MapServer` | Coastal zones/erosion |

### Administrative Boundaries Framework (130+ Layers)

**Endpoint**: `https://spatial-gis.information.qld.gov.au/arcgis/rest/services/Boundaries/AdminBoundariesFramework/MapServer`

Key layer groups:
- **Local Government area** (Layer 11) - All 77 QLD councils
- **Locality boundary** (Layer 26) - Suburb boundaries
- **ShapingSEQ 2023** (Layers 110-160) - SEQ regional plan data
- **State development area** (Layer 37) - SDAs statewide
- **MSES layers** (Layers 181-195) - Matters of State Environmental Significance
- **Floodplain overlay** (Layer 15) - State flood mapping
- **Queensland heritage register** (Layer 78) - Heritage sites

**Technical**: CRS EPSG:3857, MaxRecordCount 2000, Supports JSON/GeoJSON/WMS/WFS

### Council Planning Scheme Services

#### Tier 1: Full ArcGIS REST MapServer (Validated)

| Council | Endpoint | Services | Status |
|---------|----------|----------|--------|
| **Toowoomba Regional** | `https://maps.tr.qld.gov.au/arcgis/rest/services/External/External_PlanningScheme/MapServer` | 170+ layers | ✅ Validated |
| **Scenic Rim Regional** | `https://esriprod.scenicrim.qld.gov.au/arcgis/rest/services/EPlan_Scenic_Rim_Planning_Scheme/MapServer` | 210+ layers | ✅ Validated |
| **Logan City** | `https://arcgis.lcc.wspdigital.com/server/rest/services/LoganHub/Logan_Planning_Scheme_v9_1_TLPI_20241030/MapServer` | 387 layers | ✅ Validated |
| **Bundaberg Regional** | `https://mappingdata.bundaberg.qld.gov.au/arcgis/rest/services/` | 50+ services | ✅ Validated |
| **Sunshine Coast** | `https://services-ap1.arcgis.com/YQyt7djuXN7rQyg4/arcgis/rest/services/` | 80+ layers | ✅ Validated |
| **Sunshine Coast (Legacy)** | `https://gislegacy.scc.qld.gov.au/arcgis/rest/services/PlanningCadastre/` | Multiple | ✅ Found |
| **Redland City** | `https://gis.redland.qld.gov.au/arcgis/rest/services/planning/city_plan/MapServer` | Planning | ✅ Found |
| **Mackay Regional** | `https://arcgis.mackay.qld.gov.au/server/rest/services/` | Enterprise | ✅ Validated |
| **Gold Coast City** | `https://maps.cityofgoldcoast.com.au/arcgis/rest/services/` | Multiple | Found |
| **Moreton Bay Regional** | `https://gis.moretonbay.qld.gov.au/arcgis/rest/services/` | Multiple folders | Found |
| **Rockhampton Regional** | `https://arcgismaps-prod.rockhamptonregion.qld.gov.au/arcgis/rest/services/` | Multiple | Found |

#### Tier 2: ArcGIS Online / Hub Open Data Portals

| Council | Portal URL | Type |
|---------|------------|------|
| **Brisbane City** | `https://spatial-brisbane.opendata.arcgis.com/` | ArcGIS Hub |
| **Brisbane City** | `https://www.spatial-data.brisbane.qld.gov.au/` | Open Data Portal |
| **Townsville City** | `https://data-tsvcitycouncil.opendata.arcgis.com/` | ArcGIS Hub |
| **Somerset Regional** | `https://somerset.maps.arcgis.com/` | ArcGIS Online |
| **Noosa Shire** | `https://storymaps.arcgis.com/collections/effa39321b984f94a4ccee16f7588ba4` | StoryMaps |

#### Tier 3: Geocortex / Custom Mapping Portals

| Council | Portal URL | Type |
|---------|------------|------|
| **Bundaberg Regional** | `https://mapping.bundaberg.qld.gov.au/Geocortex/` | Geocortex |
| **Rockhampton Regional** | `https://maps.rockhamptonregion.qld.gov.au/Geocortex/` | Geocortex |
| **Gympie Regional** | `https://maps.gympie.qld.gov.au/` | Custom |
| **Cassowary Coast** | ePlan interactive mapping | Custom |

#### Tier 4: WFS / Data.gov.au

| Council | Source | Format |
|---------|--------|--------|
| **Ipswich City** | data.gov.au | WFS |

### Bundaberg Regional Council - Key Services

```
https://mappingdata.bundaberg.qld.gov.au/arcgis/rest/services/

Planning Scheme:
- 2015_Adopted_Planning_Scheme_Zoning/MapServer
- 2015_Adopted_Planning_Scheme_Overlays/MapServer
- 2015_Adopted_Planning_Scheme_PIP/MapServer
- 2015_Adopted_Planning_Scheme_Strategic_Framework/MapServer
- 2022_LGIP_PFTI/MapServer

Flood & Hazards:
- BRC_Flood_2013/MapServer
- BRC_Flood_Hazard_Area_Maps/MapServer

Infrastructure:
- BRC_Infrastructure/MapServer
- BRC_Cadastre_*/MapServer
- BRC_Imagery/MapServer
```

## Research Focus

- Major council planning schemes (Brisbane, Gold Coast, Sunshine Coast, Logan, Toowoomba, etc.)
- Data access methods and formats per council
- Zone code standardization approaches
- Technical implementation patterns
- Cost and licensing considerations

## Documentation

- `qld-approach-research.md` - Comprehensive research on QLD planning data acquisition strategy (8 councils documented)
- `council-data-matrix.md` - (Planned) Matrix of data access methods by council
- `zone-code-mapping.md` - (Planned) Zone code translation tables

## Related Documents

- `/docs/PLANNING-DATA-STRATEGY.md` - Overall planning data strategy
- `/docs/land-use-zones-research.md` - NSW and QLD datasource comparison

## Last Updated

- **2026-01-12**: Comprehensive QLD council GIS endpoint research
  - **Discovered central QLD Government ArcGIS REST directory** at `spatial-gis.information.qld.gov.au/arcgis/rest/services/`
  - Validated PlanningCadastre folder with 11 statewide services (Land Use, PDAs, SDAs, Coastal, etc.)
  - Validated AdminBoundariesFramework service with 130+ layers (LGAs, ShapingSEQ 2023, MSES, Heritage)
  - Confirmed central portal does NOT include council-specific planning zones

  **Council ArcGIS REST Endpoints Validated (Tier 1):**
  - Toowoomba Regional Council (170+ layers)
  - Scenic Rim Regional Council (210+ layers)
  - Logan City Council (387 layers)
  - Bundaberg Regional Council (50+ services) - comprehensive planning & flood data
  - Sunshine Coast Council (80+ FeatureServer layers)
  - Mackay Regional Council (Enterprise ArcGIS)
  - Redland City Council
  - Gold Coast City Council
  - Moreton Bay Regional Council
  - Rockhampton Regional Council

  **ArcGIS Hub/Online Portals (Tier 2):**
  - Brisbane City Council (2 portals)
  - Townsville City Council
  - Somerset Regional Council
  - Noosa Shire Council

  **Geocortex/Custom Portals (Tier 3):**
  - Bundaberg, Rockhampton, Gympie, Cassowary Coast
