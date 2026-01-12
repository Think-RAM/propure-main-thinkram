# Propure - Planning Data Ingestion Strategy

> **Purpose**: Comprehensive strategy for ingesting, processing, and serving Australian planning scheme data (zoning, overlays, hazards) from LGAs and State governments into the Propure platform.

---

## Executive Summary

Propure's current data architecture covers property listings, suburb statistics, and economic indicators. However, **planning data** from Local Government Authorities (LGAs) and State planning portals is a critical missing layer that informs:

- **Zoning classifications** (residential, commercial, industrial, mixed-use)
- **Development potential** (height limits, floor space ratios, subdivision rules)
- **Planning overlays** (heritage, vegetation, design, environmental)
- **Hazard zones** (flood, bushfire, coastal, contaminated land)
- **Future development areas** (urban growth boundaries, precinct plans)

This document outlines a **Python-first, data-driven approach** to ingest this geospatial data into PostgreSQL/PostGIS for consumption by the Next.js frontend.

---

## 1. Gap Analysis

### Current State (from STRATEGY.md)

| Data Layer     | Current Coverage                         | Planning Gap                                                      |
| -------------- | ---------------------------------------- | ----------------------------------------------------------------- |
| **National**   | RBA rates, ABS demographics              | None                                                              |
| **State/City** | Building approvals, job ads              | State planning policies, urban growth boundaries                  |
| **Suburb**     | Yield, vacancy, median values            | Zoning mix, heritage areas, overlay counts                        |
| **Street**     | Flood zones (partial), school catchments | Council-specific planning controls, hazard overlays               |
| **Property**   | Address, price, beds, land size          | Zoning classification, development potential, overlay constraints |

### Missing Data Categories

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    PLANNING DATA CATEGORIES                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  1. ZONING MAPS                          2. PLANNING OVERLAYS                   │
│  ─────────────                           ─────────────────────                  │
│  • Land use zones (R1, R2, B1, IN1...)   • Heritage conservation               │
│  • Zone objectives & permitted uses      • Design & development controls       │
│  • Minimum lot sizes                     • Vegetation protection               │
│  • Floor space ratios                    • Urban character areas               │
│  • Height limits                         • Acid sulfate soils                  │
│                                          • Scenic landscape                    │
│                                                                                  │
│  3. HAZARD MAPPING                       4. FUTURE PLANNING                     │
│  ─────────────────                       ────────────────────                   │
│  • Flood planning levels                 • Urban growth boundaries             │
│  • Bushfire prone land                   • Precinct structure plans            │
│  • Coastal erosion zones                 • Priority development areas          │
│  • Landslip risk                         • Infrastructure corridors            │
│  • Mine subsidence                       • Development contribution plans      │
│  • Contaminated land                                                            │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Australian Planning Data Sources

### 2.1 State Planning Portals

| State   | Portal                                                                             | Data Formats                     | API/Download                                |
| ------- | ---------------------------------------------------------------------------------- | -------------------------------- | ------------------------------------------- |
| **NSW** | [NSW Planning Portal](https://www.planningportal.nsw.gov.au/spatialviewer/)        | WMS, WFS, ArcGIS REST, Shapefile | WMS/WFS + bulk download via data.nsw.gov.au |
| **VIC** | [VicPlan](https://www.planning.vic.gov.au/planning-schemes/using-vicplan)          | WMS, ArcGIS REST, GeoJSON        | Vicmap Planning REST API                    |
| **QLD** | [QLD Planning Mapping](https://www.planning.qld.gov.au/planning-framework/mapping) | WMS, WFS, Shapefile              | QSpatial catalogue + Open Data Portal       |
| **WA**  | [PlanWA](https://www.planning.wa.gov.au/mapping-and-data/planwa)                   | WMS, Shapefile                   | data.wa.gov.au                              |
| **SA**  | [PlanSA](https://plan.sa.gov.au/)                                                  | WMS, Shapefile                   | data.sa.gov.au                              |
| **TAS** | [LIST Tasmania](https://www.thelist.tas.gov.au/)                                   | WMS, Shapefile                   | theList Data Services                       |
| **NT**  | [NT Planning](https://nt.gov.au/property/land-planning-and-development)            | Shapefile, PDF                   | Limited digital availability                |
| **ACT** | [ACTmapi](https://app.actmapi.act.gov.au/)                                         | WMS, ArcGIS REST                 | data.act.gov.au                             |

### 2.2 Key NSW Data Endpoints

| Dataset             | Endpoint                                                                                                           | Format          |
| ------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------- |
| Land Zoning         | `https://mapprod3.environment.nsw.gov.au/arcgis/services/Planning/EPI_Primary_Planning_Layers/MapServer/WMSServer` | WMS             |
| Flood Planning      | [SEED NSW](https://datasets.seed.nsw.gov.au/dataset/epi-flood)                                                     | Shapefile, WFS  |
| Bushfire Prone Land | [SEED NSW](https://datasets.seed.nsw.gov.au/dataset/bush-fire-prone-land)                                          | Shapefile       |
| Heritage            | [NSW Heritage Inventory](https://www.heritage.nsw.gov.au/search-for-heritage/heritage-search/)                     | API + Shapefile |
| Height of Buildings | NSW Planning Portal Open Data                                                                                      | WMS, Shapefile  |
| Minimum Lot Size    | NSW Planning Portal Open Data                                                                                      | WMS, Shapefile  |

### 2.3 Key Victoria Data Endpoints

| Dataset             | Endpoint                                                                                                      | Format      |
| ------------------- | ------------------------------------------------------------------------------------------------------------- | ----------- |
| Planning Zones      | `https://plan-gis.mapshare.vic.gov.au/arcgis/rest/services/Planning/Vicplan_PlanningSchemeZones/MapServer`    | ArcGIS REST |
| Planning Overlays   | `https://plan-gis.mapshare.vic.gov.au/arcgis/rest/services/Planning/Vicplan_PlanningSchemeOverlays/MapServer` | ArcGIS REST |
| Bushfire Management | Vicmap Planning                                                                                               | Shapefile   |
| Heritage            | Victorian Heritage Database                                                                                   | API         |

### 2.4 Key Queensland Data Endpoints

| Dataset                 | Endpoint                                                                                                         | Format    |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------- | --------- |
| SPP Interactive Mapping | [SPP IMS](https://planning.dsdmip.qld.gov.au/maps?type=spp)                                                      | WMS       |
| SARA Mapping            | [DAMS](https://www.planning.qld.gov.au/planning-framework/mapping)                                               | WMS       |
| Bushfire Prone Area     | [data.qld.gov.au](https://www.data.qld.gov.au/dataset/bushfire-prone-area-queensland-series)                     | Shapefile |
| Cadastral Data          | [QSpatial](https://www.business.qld.gov.au/running-business/support-services/mapping-data-imagery/data/qspatial) | GPKG, SHP |

### 2.5 National Administrative Boundaries

| Dataset                   | Source      | URL                                                                                                                                                                                            |
| ------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| LGA Boundaries            | ABS ASGS    | [ABS Digital Boundary Files](https://www.abs.gov.au/statistics/standards/australian-statistical-geography-standard-asgs-edition-3/jul2021-jun2026/access-and-downloads/digital-boundary-files) |
| Geoscape Admin Boundaries | Data.gov.au | [Geoscape Administrative Boundaries](https://data.gov.au/data/dataset/geoscape-administrative-boundaries)                                                                                      |
| Land Use                  | ABARES      | [ACLUMP Data Download](https://www.agriculture.gov.au/abares/aclump/land-use/data-download)                                                                                                    |

---

## 3. Python Tech Stack

### 3.1 Core Libraries

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    PYTHON GEOSPATIAL STACK                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  DATA READING & WRITING                  GEOMETRY OPERATIONS                    │
│  ─────────────────────────               ────────────────────                   │
│  • geopandas (0.14+)                     • shapely (2.0+)                       │
│  • fiona (1.9+)                          • pyproj (3.6+)                        │
│  • rasterio (1.3+)                       • rtree (1.2+)                         │
│  • pyogrio (0.7+) - faster I/O                                                  │
│                                                                                  │
│  GDAL/OGR (Core Engine)                  DATABASE CONNECTIVITY                  │
│  ─────────────────────────               ─────────────────────                  │
│  • gdal (3.8+)                           • sqlalchemy (2.0+)                    │
│  • Handles 50+ formats                   • geoalchemy2 (0.14+)                  │
│  • CRS transformations                   • psycopg2 / psycopg (3.0+)            │
│                                                                                  │
│  WEB SERVICES                            PIPELINE ORCHESTRATION                 │
│  ────────────────                        ──────────────────────                 │
│  • owslib (0.30+) - WMS/WFS client       • dagster (1.7+) OR prefect (2.0+)     │
│  • requests + aiohttp                    • dbt-core (optional for transforms)  │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Recommended Environment

```yaml
# environment.yml (conda)
name: propure-geo
channels:
  - conda-forge
dependencies:
  - python=3.11
  - geopandas=0.14
  - pyogrio=0.7
  - fiona=1.9
  - rasterio=1.3
  - shapely=2.0
  - pyproj=3.6
  - gdal=3.8
  - owslib=0.30
  - sqlalchemy=2.0
  - geoalchemy2=0.14
  - psycopg2=2.9
  - rtree=1.2
  - pip:
      - dagster
      - dagster-postgres
      - httpx
      - aiofiles
```

### 3.3 Alternative: DuckDB Spatial

For **exploratory analysis** and **batch transformations**, DuckDB Spatial is an excellent lightweight alternative:

```python
import duckdb

# Install and load spatial extension
duckdb.execute("INSTALL spatial; LOAD spatial;")

# Read shapefile directly
result = duckdb.sql("""
    SELECT * FROM ST_Read('zoning.shp')
    WHERE ST_Intersects(geom, ST_GeomFromText('POLYGON(...)'))
""")

# Export to GeoJSON
duckdb.sql("COPY (SELECT * FROM zones) TO 'output.geojson' WITH (FORMAT GDAL, DRIVER 'GeoJSON')")
```

**Best for**: Pre-processing, filtering large datasets before PostGIS load, ad-hoc analysis.

---

## 4. Data Pipeline Architecture

### 4.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    PLANNING DATA PIPELINE                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  EXTERNAL SOURCES                                                               │
│  ─────────────────                                                              │
│  [State Portals]    [LGA Open Data]    [ABS/Geoscape]                           │
│       │                   │                   │                                  │
│       │                   │                   │                                  │
│       ▼                   ▼                   ▼                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                    PYTHON DATA PIPELINE                                  │    │
│  │                    (Dagster or Prefect)                                  │    │
│  ├─────────────────────────────────────────────────────────────────────────┤    │
│  │                                                                          │    │
│  │  ┌────────────┐   ┌────────────┐   ┌────────────┐   ┌────────────┐     │    │
│  │  │  EXTRACT   │   │ TRANSFORM  │   │  VALIDATE  │   │    LOAD    │     │    │
│  │  │            │   │            │   │            │   │            │     │    │
│  │  │ • WFS/WMS  │──▶│ • CRS to   │──▶│ • Schema   │──▶│ • Upsert   │     │    │
│  │  │ • REST API │   │   GDA2020  │   │   checks   │   │   PostGIS  │     │    │
│  │  │ • Shapefile│   │ • Simplify │   │ • Topology │   │ • Partition│     │    │
│  │  │ • GeoJSON  │   │ • Clip to  │   │ • Area     │   │   by LGA   │     │    │
│  │  │            │   │   LGA      │   │   calcs    │   │            │     │    │
│  │  └────────────┘   └────────────┘   └────────────┘   └────────────┘     │    │
│  │                                                                          │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                            │                                     │
│                                            │                                     │
│                                            ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                    POSTGRESQL + POSTGIS                                  │    │
│  ├─────────────────────────────────────────────────────────────────────────┤    │
│  │                                                                          │    │
│  │  planning_zones      planning_overlays    hazard_zones                  │    │
│  │  ────────────────    ─────────────────    ────────────                  │    │
│  │  • zone_code         • overlay_type       • hazard_type                 │    │
│  │  • zone_name         • overlay_code       • risk_level                  │    │
│  │  • lga_code          • schedule_no        • planning_level              │    │
│  │  • state             • lga_code           • lga_code                    │    │
│  │  • geometry          • geometry           • geometry                    │    │
│  │  • effective_date    • effective_date     • source                      │    │
│  │                                                                          │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                            │                                     │
│                                            │                                     │
│                                            ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                    NEXT.JS APPLICATION                                   │    │
│  ├─────────────────────────────────────────────────────────────────────────┤    │
│  │                                                                          │    │
│  │  API Routes              MapLibre + deck.gl         AI Agents           │    │
│  │  ──────────              ─────────────────          ──────────          │    │
│  │  • /api/planning/zone    • GeoJSON layers           • getPlanningInfo   │    │
│  │  • /api/planning/overlay • Choropleth fills         • assessDevelopment │    │
│  │  • /api/planning/hazard  • Popup details            • checkConstraints  │    │
│  │                                                                          │    │
│  └─────────────────────────────────────────────────────────────────────────┘
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Map Technology Decision

**Critical Choice**: Planning zones can be visualized using different frontend map libraries.

| Requirement                   | Leaflet                     | MapLibre GL            | Decision                        |
| ----------------------------- | --------------------------- | ---------------------- | ------------------------------- |
| **Planning Zones** (polygons) | ✅ Excellent support        | ⚠️ Works but complex   | ✅ **Leaflet (Primary)**        |
| **Property Markers** (points) | ✅ Native support           | ✅ Excellent           | ✅ **Leaflet**                  |
| **Property Heatmaps**         | ⚠️ Plugin available         | ✅ WebGL excels        | ⚠️ **Leaflet-heat** (if needed) |
| **ArcGIS REST/WFS**           | ✅ esri-leaflet (mature)    | ⚠️ Needs custom source | ✅ **Leaflet + WFS plugin**     |
| **Performance (10k zones)**   | ✅ Canvas/SVG (fast enough) | ❌ WebGL overhead      | ✅ **Sufficient**               |

**Recommendation**: **Start with Leaflet for Planning Zones**

**Rationale**:

1. **Leaflet is battle-tested** for ArcGIS REST and WFS integration (esri-leaflet, leaflet-omnivore plugins)
2. **Simpler codebase** (~50KB vs ~300KB with deck.gl)
3. **Mature plugin ecosystem** (10,000+ plugins vs growing deck.gl ecosystem)
4. **Better ArcGIS support** (native esri-leaflet vs experimental @deck.gl/mapbox)
5. **Native WFS** (critical for QLD councils - only Ipswich has WFS available)
6. **Lower learning curve** for developers
7. **Better mobile support** and touch interactions

**Performance Monitoring Required**:
Before adding MapLibre GL + deck.gl, implement and measure:

- Core Web Vitals (LCP)
- Chrome DevTools Performance panel
- Page load time with 5k+ zones
- Frame rate during pan/zoom operations
- Bundle size impact

**When to Add MapLibre GL + deck.gl**:
Only add if performance issues arise:

- Property heatmaps with 50k+ unfiltered points
- Real-time analytics requiring GPU acceleration
- 3D visualizations (building envelopes, terrain)
- Complex WebGL shaders/filters needed

**Implementation Approach**:

```bash
# Phase 1: Leaflet-only (Start here)
pnpm add leaflet esri-leaflet leaflet-omnivore

# Phase 2: Add MapLibre GL (If needed)
pnpm add react-map-gl maplibre-gl @deck.gl/core @deck.gl/layers
```

**API Routes (Updated)**:

```
API Routes              Leaflet (Primary) or MapLibre GL (Optional)     AI Agents           │
────────────────        ────────────────────────────────────────────────────          │
/api/planning/zone    • GeoJSON layers (Leaflet/esri-leaflet)   • getPlanningInfo   │
/api/planning/overlay • Choropleth fills (Leaflet)         • assessDevelopment │
/api/planning/hazard  • Popup details (Leaflet)          • checkConstraints │
/api/planning/heatmap • Property heatmaps (MapLibre GL + deck.gl) • updateFilters    │
```

---

### 4.2 Pipeline Orchestration with Dagster

```python
# propure-geo/assets/planning_zones.py

from dagster import asset, AssetIn, MetadataValue
import geopandas as gpd
from sqlalchemy import create_engine

@asset(
    group_name="planning",
    metadata={"state": "NSW", "source": "NSW Planning Portal"}
)
def nsw_land_zoning_raw():
    """Extract NSW Land Zoning from WFS endpoint."""
    from owslib.wfs import WebFeatureService

    wfs = WebFeatureService(
        'https://mapprod3.environment.nsw.gov.au/arcgis/services/Planning/EPI_Primary_Planning_Layers/MapServer/WFSServer',
        version='2.0.0'
    )

    response = wfs.getfeature(typename='Land_Zoning', outputFormat='json')
    gdf = gpd.read_file(response)

    return gdf

@asset(
    ins={"raw_data": AssetIn("nsw_land_zoning_raw")},
    group_name="planning"
)
def nsw_land_zoning_transformed(raw_data: gpd.GeoDataFrame):
    """Transform to standard schema, reproject to GDA2020."""

    # Reproject to GDA2020 (EPSG:7844)
    gdf = raw_data.to_crs(epsg=7844)

    # Standardize column names
    gdf = gdf.rename(columns={
        'LAY_CLASS': 'zone_code',
        'LABEL': 'zone_name',
        'LGA_NAME': 'lga_name'
    })

    # Add state identifier
    gdf['state'] = 'NSW'

    # Simplify geometries for performance
    gdf['geometry'] = gdf['geometry'].simplify(tolerance=1.0)

    # Calculate area in hectares
    gdf['area_ha'] = gdf['geometry'].area / 10000

    return gdf[['zone_code', 'zone_name', 'lga_name', 'state', 'area_ha', 'geometry']]

@asset(
    ins={"transformed": AssetIn("nsw_land_zoning_transformed")},
    group_name="planning"
)
def nsw_land_zoning_loaded(transformed: gpd.GeoDataFrame):
    """Load to PostGIS database."""

    engine = create_engine(os.environ['DATABASE_URL'])

    transformed.to_postgis(
        name='planning_zones',
        con=engine,
        if_exists='append',
        index=False,
        schema='planning'
    )

    return {"rows_loaded": len(transformed)}
```

### 4.3 Scheduled Refresh Strategy

| Dataset Type   | Refresh Frequency | Trigger                            |
| -------------- | ----------------- | ---------------------------------- |
| Zoning Maps    | Quarterly         | Council planning scheme amendments |
| Overlays       | Monthly           | State government gazette updates   |
| Flood Zones    | Annually          | Flood study updates                |
| Bushfire Prone | Annually          | Pre-summer season update           |
| LGA Boundaries | Annually          | ABS ASGS release                   |
| Heritage       | Monthly           | Heritage register updates          |

---

## 5. Database Schema (PostGIS)

### 5.1 Core Tables

```sql
-- Create planning schema
CREATE SCHEMA IF NOT EXISTS planning;

-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- LGA Reference Table
CREATE TABLE planning.lgas (
    id SERIAL PRIMARY KEY,
    lga_code VARCHAR(10) UNIQUE NOT NULL,
    lga_name VARCHAR(255) NOT NULL,
    state VARCHAR(3) NOT NULL,
    geometry GEOMETRY(MULTIPOLYGON, 7844),
    population INTEGER,
    area_sqkm DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lgas_geometry ON planning.lgas USING GIST(geometry);
CREATE INDEX idx_lgas_state ON planning.lgas(state);

-- Planning Zones
CREATE TABLE planning.zones (
    id SERIAL PRIMARY KEY,
    zone_code VARCHAR(20) NOT NULL,
    zone_name VARCHAR(255) NOT NULL,
    zone_category VARCHAR(50), -- Residential, Commercial, Industrial, etc.
    lga_code VARCHAR(10) REFERENCES planning.lgas(lga_code),
    state VARCHAR(3) NOT NULL,
    planning_instrument VARCHAR(255), -- LEP/Planning Scheme name
    effective_date DATE,
    geometry GEOMETRY(MULTIPOLYGON, 7844),
    area_ha DECIMAL(12,4),
    source_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_zone_per_lga UNIQUE (zone_code, lga_code, planning_instrument)
);

CREATE INDEX idx_zones_geometry ON planning.zones USING GIST(geometry);
CREATE INDEX idx_zones_lga ON planning.zones(lga_code);
CREATE INDEX idx_zones_code ON planning.zones(zone_code);

-- Planning Overlays
CREATE TABLE planning.overlays (
    id SERIAL PRIMARY KEY,
    overlay_type VARCHAR(100) NOT NULL, -- Heritage, Design, Vegetation, etc.
    overlay_code VARCHAR(50),
    overlay_name VARCHAR(255),
    schedule_number VARCHAR(20),
    lga_code VARCHAR(10) REFERENCES planning.lgas(lga_code),
    state VARCHAR(3) NOT NULL,
    planning_instrument VARCHAR(255),
    geometry GEOMETRY(MULTIPOLYGON, 7844),
    area_ha DECIMAL(12,4),
    restrictions JSONB, -- Key restrictions as structured data
    source_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_overlays_geometry ON planning.overlays USING GIST(geometry);
CREATE INDEX idx_overlays_type ON planning.overlays(overlay_type);
CREATE INDEX idx_overlays_lga ON planning.overlays(lga_code);

-- Hazard Zones
CREATE TABLE planning.hazard_zones (
    id SERIAL PRIMARY KEY,
    hazard_type VARCHAR(50) NOT NULL, -- Flood, Bushfire, Coastal, Landslip, etc.
    risk_level VARCHAR(20), -- High, Medium, Low
    planning_level VARCHAR(50), -- e.g., "1 in 100 year flood"
    lga_code VARCHAR(10) REFERENCES planning.lgas(lga_code),
    state VARCHAR(3) NOT NULL,
    geometry GEOMETRY(MULTIPOLYGON, 7844),
    area_ha DECIMAL(12,4),
    source VARCHAR(255),
    source_date DATE,
    source_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hazards_geometry ON planning.hazard_zones USING GIST(geometry);
CREATE INDEX idx_hazards_type ON planning.hazard_zones(hazard_type);
CREATE INDEX idx_hazards_lga ON planning.hazard_zones(lga_code);

-- Development Controls (height, FSR, lot size)
CREATE TABLE planning.development_controls (
    id SERIAL PRIMARY KEY,
    control_type VARCHAR(50) NOT NULL, -- Height, FSR, LotSize, Setback
    control_value DECIMAL(10,2),
    control_unit VARCHAR(20), -- metres, ratio, sqm
    zone_code VARCHAR(20),
    lga_code VARCHAR(10) REFERENCES planning.lgas(lga_code),
    state VARCHAR(3) NOT NULL,
    geometry GEOMETRY(MULTIPOLYGON, 7844),
    planning_instrument VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_controls_geometry ON planning.development_controls USING GIST(geometry);
CREATE INDEX idx_controls_type ON planning.development_controls(control_type);
```

### 5.2 Materialized Views for Performance

```sql
-- Property Planning Context (pre-joined for fast lookup)
CREATE MATERIALIZED VIEW planning.property_planning_context AS
SELECT
    p.id AS property_id,
    p.address,
    z.zone_code,
    z.zone_name,
    z.zone_category,
    l.lga_name,
    COALESCE(
        jsonb_agg(DISTINCT jsonb_build_object('type', o.overlay_type, 'code', o.overlay_code))
        FILTER (WHERE o.id IS NOT NULL),
        '[]'::jsonb
    ) AS overlays,
    COALESCE(
        jsonb_agg(DISTINCT jsonb_build_object('type', h.hazard_type, 'level', h.risk_level))
        FILTER (WHERE h.id IS NOT NULL),
        '[]'::jsonb
    ) AS hazards,
    dc_height.control_value AS max_height_m,
    dc_fsr.control_value AS floor_space_ratio,
    dc_lot.control_value AS min_lot_size_sqm
FROM properties p
LEFT JOIN planning.zones z ON ST_Within(p.location, z.geometry)
LEFT JOIN planning.lgas l ON z.lga_code = l.lga_code
LEFT JOIN planning.overlays o ON ST_Intersects(p.location, o.geometry)
LEFT JOIN planning.hazard_zones h ON ST_Intersects(p.location, h.geometry)
LEFT JOIN planning.development_controls dc_height
    ON ST_Within(p.location, dc_height.geometry) AND dc_height.control_type = 'Height'
LEFT JOIN planning.development_controls dc_fsr
    ON ST_Within(p.location, dc_fsr.geometry) AND dc_fsr.control_type = 'FSR'
LEFT JOIN planning.development_controls dc_lot
    ON ST_Within(p.location, dc_lot.geometry) AND dc_lot.control_type = 'LotSize'
GROUP BY p.id, p.address, z.zone_code, z.zone_name, z.zone_category, l.lga_name,
         dc_height.control_value, dc_fsr.control_value, dc_lot.control_value;

CREATE UNIQUE INDEX idx_property_planning_context_id ON planning.property_planning_context(property_id);

-- Refresh strategy
REFRESH MATERIALIZED VIEW CONCURRENTLY planning.property_planning_context;
```

---

## 6. Integration with Next.js

### 6.1 Data-Driven Approach (Recommended)

Instead of Python FastAPI, the frontend consumes **pre-processed data directly from PostgreSQL**:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    DATA-DRIVEN ARCHITECTURE                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Python Pipeline              PostgreSQL/PostGIS         Next.js App            │
│  ───────────────              ─────────────────          ───────────            │
│                                                                                  │
│  ┌────────────┐              ┌──────────────┐           ┌──────────────┐        │
│  │ Dagster    │──ETL──▶      │ planning.*   │──Prisma──▶│ API Routes   │        │
│  │ Jobs       │              │ tables       │           │ /api/plan/*  │        │
│  └────────────┘              └──────────────┘           └──────────────┘        │
│       │                            │                           │                │
│       │                            │                           │                │
│       │                      ┌─────▼─────┐              ┌──────▼──────┐         │
│       │                      │ Mat Views │              │ MapLibre +  │         │
│       │                      │ (cached)  │              │ deck.gl     │         │
│  ┌────▼────┐                 └───────────┘              └─────────────┘         │
│  │ Inngest │                                                                    │
│  │ Trigger │ ◄──── Webhook on planning scheme amendment                         │
│  └─────────┘                                                                    │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Prisma Schema Extension

```prisma
// packages/db/prisma/schema.prisma

// Add to existing schema

model PlanningZone {
  id                  Int       @id @default(autoincrement())
  zoneCode            String    @map("zone_code")
  zoneName            String    @map("zone_name")
  zoneCategory        String?   @map("zone_category")
  lgaCode             String    @map("lga_code")
  state               String
  planningInstrument  String?   @map("planning_instrument")
  effectiveDate       DateTime? @map("effective_date")
  areaHa              Decimal?  @map("area_ha") @db.Decimal(12, 4)
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")

  // Note: geometry handled via raw SQL / PostGIS functions

  @@unique([zoneCode, lgaCode, planningInstrument])
  @@map("zones")
  @@schema("planning")
}

model PlanningOverlay {
  id                  Int       @id @default(autoincrement())
  overlayType         String    @map("overlay_type")
  overlayCode         String?   @map("overlay_code")
  overlayName         String?   @map("overlay_name")
  scheduleNumber      String?   @map("schedule_number")
  lgaCode             String    @map("lga_code")
  state               String
  restrictions        Json?
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")

  @@map("overlays")
  @@schema("planning")
}

model HazardZone {
  id            Int       @id @default(autoincrement())
  hazardType    String    @map("hazard_type")
  riskLevel     String?   @map("risk_level")
  planningLevel String?   @map("planning_level")
  lgaCode       String    @map("lga_code")
  state         String
  source        String?
  sourceDate    DateTime? @map("source_date")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  @@map("hazard_zones")
  @@schema("planning")
}
```

### 6.3 API Routes Example

```typescript
// apps/web/app/api/planning/property/[propertyId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@propure/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { propertyId: string } },
) {
  const { propertyId } = params;

  // Use raw query for PostGIS spatial lookup
  const planningContext = await prisma.$queryRaw`
    SELECT
      z.zone_code,
      z.zone_name,
      z.zone_category,
      l.lga_name,
      COALESCE(
        jsonb_agg(DISTINCT jsonb_build_object('type', o.overlay_type, 'code', o.overlay_code))
        FILTER (WHERE o.id IS NOT NULL),
        '[]'::jsonb
      ) AS overlays,
      COALESCE(
        jsonb_agg(DISTINCT jsonb_build_object('type', h.hazard_type, 'level', h.risk_level))
        FILTER (WHERE h.id IS NOT NULL),
        '[]'::jsonb
      ) AS hazards
    FROM properties p
    LEFT JOIN planning.zones z ON ST_Within(p.location, z.geometry)
    LEFT JOIN planning.lgas l ON z.lga_code = l.lga_code
    LEFT JOIN planning.overlays o ON ST_Intersects(p.location, o.geometry)
    LEFT JOIN planning.hazard_zones h ON ST_Intersects(p.location, h.geometry)
    WHERE p.id = ${propertyId}
    GROUP BY z.zone_code, z.zone_name, z.zone_category, l.lga_name
  `;

  return NextResponse.json(planningContext[0] || null);
}
```

### 6.4 AI Agent Tool

```typescript
// packages/ai/src/tools/get-planning-info.ts

import { tool } from "ai";
import { z } from "zod";
import { prisma } from "@propure/db";

export const getPlanningInfo = tool({
  description:
    "Get planning zone, overlays, and hazard information for a property or location",
  parameters: z.object({
    propertyId: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
  execute: async ({ propertyId, latitude, longitude }) => {
    let query: string;
    let params: any[];

    if (propertyId) {
      query = `
        SELECT * FROM planning.property_planning_context
        WHERE property_id = $1
      `;
      params = [propertyId];
    } else if (latitude && longitude) {
      query = `
        SELECT
          z.zone_code, z.zone_name, z.zone_category,
          l.lga_name, l.state,
          array_agg(DISTINCT o.overlay_type) FILTER (WHERE o.id IS NOT NULL) AS overlay_types,
          array_agg(DISTINCT h.hazard_type) FILTER (WHERE h.id IS NOT NULL) AS hazard_types
        FROM planning.zones z
        LEFT JOIN planning.lgas l ON z.lga_code = l.lga_code
        LEFT JOIN planning.overlays o ON ST_Intersects(ST_SetSRID(ST_Point($1, $2), 7844), o.geometry)
        LEFT JOIN planning.hazard_zones h ON ST_Intersects(ST_SetSRID(ST_Point($1, $2), 7844), h.geometry)
        WHERE ST_Within(ST_SetSRID(ST_Point($1, $2), 7844), z.geometry)
        GROUP BY z.zone_code, z.zone_name, z.zone_category, l.lga_name, l.state
      `;
      params = [longitude, latitude];
    } else {
      throw new Error("Either propertyId or latitude/longitude required");
    }

    const result = await prisma.$queryRawUnsafe(query, ...params);
    return result[0] || null;
  },
});
```

---

## 7. Phased Implementation Plan

### Phase 1: Foundation (Weeks 1-4)

| Task                      | Description                         | Output                    |
| ------------------------- | ----------------------------------- | ------------------------- |
| Set up Python environment | Conda env with geospatial stack     | `environment.yml`         |
| Create PostGIS schema     | Planning tables, indexes, functions | SQL migrations            |
| Load LGA boundaries       | ABS ASGS boundaries for all states  | `planning.lgas` populated |
| NSW pilot                 | Zones + overlays for Greater Sydney | ~400k polygons            |

### Phase 2: State Expansion (Weeks 5-8)

| Task             | Description                      | Output                    |
| ---------------- | -------------------------------- | ------------------------- |
| Victoria data    | VicPlan zones + overlays         | ~300k polygons            |
| Queensland data  | SPP + DAMS mapping layers        | ~350k polygons            |
| Hazard layers    | Flood + bushfire for NSW/VIC/QLD | ~200k polygons            |
| Dagster pipeline | Automated ETL with scheduling    | Production-ready pipeline |

### Phase 3: Integration (Weeks 9-12)

| Task               | Description                        | Output                 |
| ------------------ | ---------------------------------- | ---------------------- |
| Prisma integration | Schema extension + raw queries     | API routes working     |
| AI tool            | `getPlanningInfo` tool for agents  | AI can query planning  |
| MapLibre layers    | Zoning choropleth + overlay toggle | Visual planning on map |
| Materialized views | Property planning context cache    | <100ms lookups         |

### Phase 4: Remaining States + Maintenance (Ongoing)

| Task                    | Description                 | Output             |
| ----------------------- | --------------------------- | ------------------ |
| SA, WA, TAS, NT, ACT    | Complete national coverage  | All ~570 LGAs      |
| Refresh automation      | Quarterly/monthly sync jobs | Inngest triggers   |
| Heritage data           | State heritage registers    | Additional overlay |
| Data quality monitoring | Dagster freshness checks    | Observability      |

---

## 8. Key Decisions

### 8.1 Why Python (Not Node.js)?

| Factor                   | Python                                    | Node.js                           |
| ------------------------ | ----------------------------------------- | --------------------------------- |
| **Geospatial libraries** | Mature ecosystem (GDAL, GeoPandas, Fiona) | Limited (turf.js for basics only) |
| **WFS/WMS clients**      | OWSLib with full OGC support              | No maintained equivalent          |
| **Shapefile support**    | Native via Fiona/pyshp                    | Requires external tools           |
| **CRS transformations**  | pyproj (PROJ bindings)                    | proj4js (less complete)           |
| **PostGIS integration**  | GeoAlchemy2 + psycopg                     | Raw SQL only                      |
| **Community**            | GIS professionals use Python              | Web developers use Node           |

### 8.2 Why Data-Driven (Not API-Driven)?

| Approach         | Data-Driven                     | API-Driven (FastAPI)             |
| ---------------- | ------------------------------- | -------------------------------- |
| **Architecture** | Python ETL → PostGIS → Next.js  | Python API ↔ Next.js             |
| **Performance**  | Pre-computed, cached queries    | Real-time processing             |
| **Complexity**   | Single database source of truth | Two services to maintain         |
| **Latency**      | <100ms (PostGIS index)          | +50ms network hop                |
| **Scaling**      | Scale PostgreSQL                | Scale API + PostgreSQL           |
| **Recommended**  | **Yes**                         | For real-time external APIs only |

### 8.3 Why Dagster (Not Airflow/Prefect)?

| Factor             | Dagster             | Airflow           | Prefect          |
| ------------------ | ------------------- | ----------------- | ---------------- |
| **Asset-centric**  | First-class support | Task-focused      | Task-focused     |
| **Data lineage**   | Built-in            | Plugin required   | Limited          |
| **Testing**        | Unit test assets    | Integration tests | Unit tests       |
| **Local dev**      | `dagster dev`       | Docker compose    | `prefect server` |
| **Freshness**      | Declarative SLAs    | Manual monitoring | Manual           |
| **Learning curve** | Moderate            | Steep             | Shallow          |

---

## 9. Data Quality & Validation

### 9.1 Validation Checks

```python
# propure-geo/validation/planning_checks.py

from dagster import asset_check, AssetCheckResult
import geopandas as gpd

@asset_check(asset="nsw_land_zoning_transformed")
def check_valid_geometries(gdf: gpd.GeoDataFrame) -> AssetCheckResult:
    """Ensure all geometries are valid."""
    invalid_count = (~gdf.is_valid).sum()
    passed = invalid_count == 0

    return AssetCheckResult(
        passed=passed,
        metadata={"invalid_geometries": invalid_count}
    )

@asset_check(asset="nsw_land_zoning_transformed")
def check_zone_codes(gdf: gpd.GeoDataFrame) -> AssetCheckResult:
    """Ensure zone codes match expected patterns."""
    valid_prefixes = ['R', 'B', 'IN', 'E', 'RE', 'RU', 'SP', 'W']
    invalid = ~gdf['zone_code'].str[:2].isin(valid_prefixes + [p[:1] for p in valid_prefixes])

    return AssetCheckResult(
        passed=invalid.sum() == 0,
        metadata={"invalid_zone_codes": gdf.loc[invalid, 'zone_code'].unique().tolist()[:10]}
    )

@asset_check(asset="nsw_land_zoning_transformed")
def check_coverage(gdf: gpd.GeoDataFrame) -> AssetCheckResult:
    """Ensure reasonable coverage area."""
    total_area_sqkm = gdf['area_ha'].sum() / 100
    expected_min = 50000  # NSW is ~800,000 km²

    return AssetCheckResult(
        passed=total_area_sqkm > expected_min,
        metadata={"total_area_sqkm": total_area_sqkm}
    )
```

### 9.2 Topology Validation

```sql
-- Check for overlapping zones within same LGA (should not exist)
SELECT z1.id, z2.id, z1.zone_code, z2.zone_code
FROM planning.zones z1
JOIN planning.zones z2 ON z1.lga_code = z2.lga_code
    AND z1.id < z2.id
    AND ST_Overlaps(z1.geometry, z2.geometry)
    AND ST_Area(ST_Intersection(z1.geometry, z2.geometry)) > 100;  -- > 100 sqm overlap
```

---

## 10. Monitoring & Observability

### 10.1 Dagster + Metrics

```python
# Dagster resource for metrics
from dagster import ConfigurableResource
from prometheus_client import Counter, Histogram

class MetricsResource(ConfigurableResource):
    rows_loaded = Counter('planning_rows_loaded', 'Rows loaded to PostGIS', ['table', 'state'])
    etl_duration = Histogram('planning_etl_duration_seconds', 'ETL job duration', ['pipeline'])
```

### 10.2 Data Freshness Dashboard

| Dataset   | Last Updated | Expected  | Status        |
| --------- | ------------ | --------- | ------------- |
| NSW Zones | 2024-01-15   | Quarterly | ✅ Current    |
| NSW Flood | 2023-11-01   | Annually  | ✅ Current    |
| VIC Zones | 2024-01-08   | Weekly    | ⚠️ 7 days old |
| QLD SARA  | 2023-09-15   | Monthly   | ❌ Stale      |

---

## 11. Related Documents

| Document                                               | Purpose                                             |
| ------------------------------------------------------ | --------------------------------------------------- |
| [STRATEGY.md](./STRATEGY.md)                           | Product strategy (this fills the planning data gap) |
| [ARCHITECTURE.md](./ARCHITECTURE.md)                   | System architecture                                 |
| [MCP-ARCHITECTURE.md](./MCP-ARCHITECTURE.md)           | MCP server patterns                                 |
| [DATA-INDICATORS.md](./DATA-INDICATORS.md)             | Market data definitions                             |
| [SCHEMA-MIGRATION-PLAN.md](./SCHEMA-MIGRATION-PLAN.md) | Database migration strategy                         |

---

## 12. References

### Data Sources

- [ABS Digital Boundary Files](https://www.abs.gov.au/statistics/standards/australian-statistical-geography-standard-asgs-edition-3/jul2021-jun2026/access-and-downloads/digital-boundary-files)
- [Geoscape Administrative Boundaries](https://data.gov.au/data/dataset/geoscape-administrative-boundaries)
- [NSW Planning Portal](https://www.planningportal.nsw.gov.au/spatialviewer/)
- [VicPlan](https://www.planning.vic.gov.au/planning-schemes/using-vicplan)
- [Queensland Planning Mapping](https://www.planning.qld.gov.au/planning-framework/mapping)

### Python Libraries

- [GeoPandas Documentation](https://geopandas.org/en/stable/docs/user_guide/io.html)
- [Fiona Documentation](https://pypi.org/project/fiona/)
- [GeoPandas to PostGIS](https://geopandas.org/en/stable/docs/reference/api/geopandas.GeoDataFrame.to_postgis.html)
- [DuckDB Spatial Extension](https://duckdb.org/docs/stable/core_extensions/spatial/overview)
- [Dagster Documentation](https://dagster.io/)

---

_Document Version: 2.0_
_Last Updated: January 2026_
_Status: Validated - Ready for Implementation_

---

## Appendix A: Deep Research Findings

### A.1 Australian Spatial Standards

#### GDA2020 (Geocentric Datum of Australia 2020)

**Critical Decision**: Use EPSG:7844 (GDA2020), NOT EPSG:4326 (WGS84)

| Aspect              | EPSG:7844 (GDA2020)            | EPSG:4326 (WGS84)                      |
| ------------------- | ------------------------------ | -------------------------------------- |
| **Scope**           | Australia + territories        | Global                                 |
| **Accuracy**        | cm-level                       | ~2 metres                              |
| **Tectonic Motion** | Accounted for at epoch 2020.0  | Not consistently applied               |
| **Practical Issue** | Precise Australian positioning | 1.8m misalignment with Australian data |

**Rationale**: Australia has moved ~1.8m northeast since GDA94 was established. All government planning data is referenced to GDA2020. Using WGS84 creates systematic positional errors.

Source: [ICSM GDA2020](https://www.icsm.gov.au/gda2020)

#### FSDF (Foundation Spatial Data Framework)

The 10 FSDF themes provide foundational spatial data:

1. Administrative Boundaries
2. Geocoded Addressing (G-NAF)
3. Land Parcel and Property
4. Transport
5. Positioning
6. Place Names
7. Elevation and Depth
8. Imagery
9. Water
10. Land Cover

**Key Finding**: Planning/zoning is NOT an FSDF theme. Each state maintains separate systems with no national standard.

#### State Zoning Terminology Differences

| State   | System                         | Example Codes                      |
| ------- | ------------------------------ | ---------------------------------- |
| **NSW** | Standard Instrument LEP        | R1, R2, B1, B2, IN1, E1            |
| **VIC** | Victoria Planning Provisions   | NRZ, GRZ, MUZ (descriptive names)  |
| **QLD** | Queensland Planning Provisions | LDR, MDR (varies by council)       |
| **WA**  | R-Codes                        | R20, R30, R40 (density-based)      |
| **SA**  | Planning & Design Code         | Zone-based since 2016              |
| **TAS** | State Planning Provisions      | 23 zones without code numbers      |
| **ACT** | Territory Plan                 | RZ1-RZ5 (different from NSW R1-R5) |

**Implication**: Zone mapping/translation tables required per state.

---

### A.2 Database Technology Validation

#### PostGIS Performance Benchmarks

| Operation                  | Performance       | Notes                    |
| -------------------------- | ----------------- | ------------------------ |
| Point-in-polygon (indexed) | **0.2ms average** | 10M polygon benchmark    |
| Spatial join (9M x 150)    | **24 seconds**    | 4 parallel workers       |
| Throughput                 | **290,000 TPS**   | Point-in-polygon queries |

**For 1-3M polygons** (Propure's scale):

- Expected point-in-polygon latency: <1ms
- Memory recommendation: 8-16GB for full index caching

#### Index Type Selection

| Index       | Build Time (1M rows) | Size | Query Speed | Use Case                              |
| ----------- | -------------------- | ---- | ----------- | ------------------------------------- |
| **GiST**    | 15.0s                | 53MB | Fastest     | Planning zones (overlapping polygons) |
| **SP-GiST** | 5.6s                 | 44MB | Fast        | Property points (non-overlapping)     |
| **BRIN**    | 0.4s                 | 24KB | Moderate    | Time-series metrics                   |

#### Cloud Alternatives Evaluation

| Solution           | Scale Target | Propure's Scale (1-3M) | Verdict         |
| ------------------ | ------------ | ---------------------- | --------------- |
| **PostGIS (Neon)** | 1M - 100M    | Perfect fit            | **SELECTED**    |
| BigQuery GIS       | 100M+        | Overkill               | Skip            |
| Snowflake Geo      | 10M+         | Overkill               | Skip            |
| Redshift Spatial   | 10M+         | Borderline             | Skip            |
| **DuckDB Spatial** | ETL/Analysis | Complementary          | **Use for ETL** |

**Decision**: PostGIS on Neon for production, DuckDB for ETL preprocessing.

---

### A.3 Python Stack Recommendations

#### Recommended Library Versions (2026)

```python
# pyproject.toml
[project]
dependencies = [
    "geopandas>=1.0.0",      # Pyogrio as default engine
    "shapely>=2.0.6",        # Vectorized GEOS operations
    "pyogrio>=0.9.0",        # 10-20x faster I/O
    "pyproj>=3.6.0",         # CRS transformations
    "owslib>=0.35.0",        # WFS/WMS client
    "dagster>=1.6.0",        # Pipeline orchestration
    "geoalchemy2>=0.18.0",   # PostGIS ORM
    "pandera>=0.20.0",       # Schema validation
]
```

#### Performance Improvements

- **pyogrio with Arrow**: 10-20x faster file I/O
- **Shapely 2.0**: Vectorized operations, no Python loops
- **DuckDB preprocessing**: 5s to read 1M shapefile vs 30-60s with ogr2ogr

#### Dagster Asset Pattern

```python
@asset(
    metadata={
        "state": "NSW",
        "source": "NSW Planning Portal",
        "refresh_frequency": "quarterly"
    },
    freshness_policy=FreshnessPolicy(maximum_lag_minutes=60*24*90)  # 90 days
)
def nsw_planning_zones():
    """Fetch NSW planning zones from WFS."""
    ...
```

---

### A.4 Integration Architecture Validation

#### Data-Driven vs API-Driven

| Aspect       | Data-Driven (SELECTED)         | API-Driven (FastAPI)   |
| ------------ | ------------------------------ | ---------------------- |
| Architecture | Python ETL → PostGIS → Next.js | Python API ↔ Next.js   |
| Latency      | <1ms (indexed query)           | +10-30ms network       |
| Complexity   | Single database                | Two services           |
| Scaling      | Scale PostgreSQL only          | Scale both             |
| Best For     | Propure's use case             | Real-time ML inference |

**Decision**: Data-driven architecture. Python writes to database, Next.js reads via Prisma.

#### Prisma + PostGIS Integration

```typescript
// Use $queryRaw for spatial operations
const planningContext = await prisma.$queryRaw`
  SELECT z.zone_code, z.zone_name,
         ST_AsGeoJSON(z.geometry)::text as geometry
  FROM planning.zones z
  WHERE ST_Within(
    ST_SetSRID(ST_Point(${lng}, ${lat}), 7844),
    z.geometry
  )
`;
```

#### GeoJSON Serving Strategy

| Dataset Size | Strategy                   |
| ------------ | -------------------------- |
| <1MB         | GeoJSON API route          |
| 1-10MB       | GeoJSON with CDN caching   |
| 10-100MB     | PMTiles (static hosting)   |
| >100MB       | PMTiles + Martin (dynamic) |

---

### A.5 Case Study Insights

#### Landchecker Pattern

- Cloud-based SaaS platform
- Aggregates from **hundreds of sources**
- Daily refresh cycles
- Over 100,000 users

#### Archistar Pattern

- **100,000+ hours** researching planning documents
- AI-powered compliance checking (eCheck)
- 3D compliance envelope visualization
- Integration with Domain, CoreLogic, Nearmap

#### National Zoning Atlas Methodology

- 200+ regulatory characteristics per district
- Dropdown menus with prescribed options (prevents subjective entries)
- Manual human review (algorithms can't yet parse nuanced zoning codes)
- State-specific teams coordinate standardization

#### UK Digital Land Pipeline

- Python CLI tools for data transformation
- Specification repo for field definitions (semantic versioning)
- Collect → Transform → Harmonize → Publish pattern

---

### A.6 Risk Mitigation

| Risk                          | Mitigation                                |
| ----------------------------- | ----------------------------------------- |
| **State data format changes** | Version-controlled transformation configs |
| **WFS service outages**       | Local cache + retry logic in Dagster      |
| **Geometry validity issues**  | `make_valid()` in preprocessing           |
| **CRS mismatches**            | Enforce GDA2020 (EPSG:7844) throughout    |
| **Stale data detection**      | Dagster freshness policies + alerts       |
| **Large file processing**     | DuckDB for preprocessing before PostGIS   |
