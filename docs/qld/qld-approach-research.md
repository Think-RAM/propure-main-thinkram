# QLD Planning Data Acquisition Approach

## Executive Summary

Queensland uses a **decentralized planning system** where zoning is managed by individual local government areas (councils), contrasting with NSW's centralized Standard Instrument LEP approach. The State Planning Policy (SPP) sets overarching state interests, but detailed zoning is implemented through **council-specific planning schemes**.

**Key Finding**: No statewide WFS/WFS endpoint for planning zoning exists in QLD. Each council must be approached individually.

---

## 1. QLD Planning Framework Structure

### State vs Local Planning Relationship

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    QLD PLANNING HIERARCHY                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                │
│  STATE LEVEL                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │ State Planning Policy (SPP)                               │  │
│  │ • 17 state interests across 5 themes                   │  │
│  │ • Matters of state interest (SDAs, PDAs)             │  │
│  │ • Delivered through local planning schemes                  │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                        ↓                                          │
│  LOCAL GOVERNMENT LEVEL                                     │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │ Local Planning Schemes (Council-Specific)                  │  │
│  │ • Council-owned and maintained                              │  │
│  │ • Detailed zoning, overlays, development codes               │  │
│  │ • Approved by Planning Minister                               │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                │
│  STATE PREVAILS OVER LOCAL                                      │
│  • If inconsistency between SPP and local scheme, SPP applies    │
│  • State planning instruments prevail over local instruments          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Key Principles:**

1. **Local governments create planning schemes** - Each council maintains its own zoning system
2. **SPP integration required** - Councils must incorporate state interests
3. **No standardization** - Zone codes vary significantly between councils
4. **State hierarchy** - State planning instruments prevail in conflicts

**Critical Implication**: Unlike NSW's single WFS endpoint, QLD requires 77 separate data access approaches (one per council).

---

## 2. Council-Specific Data Access Matrix

### Major Councils Analysis

| Council                          | LGA Code | Population | Planning Scheme                | Data Access             | Format            | API Available |
| -------------------------------- | -------- | ---------- | ------------------------------ | ----------------------- | ----------------- | ------------- |
| **Brisbane City Council**        | BCC      | ~1.3M      | Open Data Portal               | GeoJSON, CSV            | REST API          |
| **City of Gold Coast**           | GCC      | ~650K      | Open Data Portal + Data.gov.au | ESRI Geodatabase        | ArcGIS REST       |
| **Sunshine Coast Council**       | SCC      | ~340K      | ArcGIS REST Server             | JSON, GeoJSON, PBF      | ArcGIS REST       |
| **Logan City Council**           | LCC      | ~340K      | Open Data Portal               | Shapefile, Geodatabase  | Limited API       |
| **Redland City Council**         | RCC      | ~180K      | ArcGIS REST Server             | Geodatabase             | ArcGIS REST       |
| **Moreton Bay Regional Council** | MBRC     | ~70K       | Datahub + Data.gov.au          | Shapefile, KML, CSV     | REST API          |
| **Ipswich City Council**         | ICC      | ~250K      | Data.gov.au                    | Shapefile, GeoJSON, WFS | **WFS Available** |

### Detailed Council Analysis

---

### 2.1 Brisbane City Council (BCC)

**Planning Scheme**: Brisbane City Plan 2014

**Data Access Methods:**

- **Open Data Portal**: https://data.brisbane.qld.gov.au/
- **Zoning Dataset**: `cp14-zoning-overlay`
- **Primary Datasets**:
  - Zoning overlay
  - Neighbourhood Plan boundaries
  - Neighbourhood Plan precincts
  - Property boundaries (parcel)

**Formats Available:**

- ✅ GeoJSON
- ✅ CSV
- ✅ Shapefile (with size limitations)
- ✅ ESRI Geodatabase (recommended for large datasets)

**API/Technical Details:**

- **REST API**: Available via ArcGIS Online
- **Query Support**: Yes
- **Download Limit**: 2GB for shapefiles (recommends Geodatabase for large datasets)
- **No WFS**: Not explicitly available for zoning

**Zone Codes (Residential):**

- **LDR** - Low Density Residential
- **LDMR** - Low-Medium Density Residential
- **MDR** - Medium Density Residential
- **TA** - Traditional Housing (Brisbane-specific precinct codes)

**Special Notes:**

- Over 40 neighbourhood plan precincts
- Zoning available by property search via interactive map
- Property parcel data linked to DCDB (Queensland Digital Cadastral Database)

**Contact/Support:**

- GIS Support: Council GIS team (via open data portal)

---

### 2.2 City of Gold Coast (GCC)

**Planning Scheme**: City Plan Version 7 (current)

**Data Access Methods:**

- **Open Data Portal**: https://data-goldcoast.opendata.arcgis.com/
- **Data.gov.au**: https://www.data.gov.au/dataset/?organization=city-of-gold-coast
- **Planning Theme**: "Planning and Building" category

**Primary Datasets:**

- **Zoning** (City Plan Version 7)
  - Data.gov.au ID: `city-plan-zone`
  - Format: Zipped ESRI File Geodatabase
- **Light Rail Urban Renewal Area**
- **Historical Plans**: City Plan Versions 10, 11, 12

**Formats Available:**

- ✅ ESRI Geodatabase (.gdb)
- ✅ Shapefile (via portal)
- ✅ GeoJSON (via ArcGIS REST)
- ✅ WMS (for visualization)

**API/Technical Details:**

- **ArcGIS REST Server**: Full access
- **Interactive Mapping**: City Plan interactive mapping tool
- **No explicit WFS**: Uses ArcGIS REST primarily

**Zone Code System:**

- Three-tier code structure:
  1. **Place Codes** - Apply to specific areas
  2. **Specific Development Codes** - Apply to development types
  3. **Constraint Codes** - Generic constraints

**Special Notes:**

- Well-organized open data portal
- Multiple historical plan versions available
- Good documentation

**Contact/Support:**

- Council Planning Department
- Open Data Portal support

---

### 2.3 Sunshine Coast Council (SCC)

**Planning Scheme**: Sunshine Coast Planning Scheme 2014

**Data Access Methods:**

- **Open Data Portal**: https://data.sunshinecoast.qld.gov.au/
- **ArcGIS REST Services**: Multiple endpoints
- **Interactive Mapping**: MyMaps tool

**Primary Datasets:**

- **Zones** (Layer ID: 5)
  - 22 zones total
  - Types: Residential, Centre, Industry, Open Space
- **Zone Precincts**
- **Community Facilities Zone Annotations**

**ArcGIS REST Endpoint:**

- **Base URL**: `https://gislegacy.scc.qld.gov.au/arcgis/rest/services/PlanningCadastre/PlanningScheme_SunshineCoast_Zoning_SCC/MapServer`
- **Alternative**: `https://geoimage.scc.qld.gov.au/arcgis/rest/services/PlanningCadastre/PlanningScheme_SunshineCoast_Zoning_SCC/MapServer`
- **Layer ID**: 5 (Zones)

**Formats Available:**

- ✅ JSON
- ✅ GeoJSON
- ✅ PBF (Protocolbuffer Format)
- ❌ Shapefile (not explicitly listed)

**Supported Query Formats:**

- JSON, geoJSON, PBF

**Zone Types (22 zones):**

- Residential zones
- Centre zones
- Industry zones
- Open Space zones
- Other zones

**Special Notes:**

- No direct WFS
- ArcGIS REST provides query capability
- Interactive mapping available

**Contact/Support:**

- Strategic Planning Branch (mentioned in API docs)

---

### 2.4 Logan City Council (LCC)

**Planning Scheme**: Logan Planning Scheme 2015 v9.2

**Data Access Methods:**

- **Open Data Portal**: https://data-logancity.opendata.arcgis.com/
- **PD Hub**: https://www.logan.qld.gov.au/planning-and-development/pd-hub (interactive only)
- **Development Enquiry Tool**: Online planning enquiries

**Primary Datasets:**

- **Planning Scheme Zones**
- **Zone Precincts**
- **Zoning Maps**

**Zone Codes (Residential):**

- **LD RES** - Low Density Residential
  - Sub-types: Acreage, Large Suburban, Small Acreage, Small Lot, Suburban, Village
- **MD RES** - Medium Density Residential
  - Sub-types: High Rise, Medium Rise
- **MU IND** - Mixed Use
- Other codes: TA (Traditional Housing) for Beenleigh area

**Formats Available:**

- ✅ Shapefile (via open data portal)
- ✅ ESRI Geodatabase
- ❌ WFS (not explicitly available)
- ✅ Interactive mapping (PD Hub)

**Special Notes:**

- PD Hub explicitly states "cannot download data" - must use Open Data Portal
- Multiple precinct codes within zone types
- Fact sheet available: Zone Descriptions

**Data Packages:**

- Layer packages with pre-built symbology recommended
- ArcGIS Pro for full access

**Contact/Support:**

- Open Data Portal (primary)
- Strategic Planning team

---

### 2.5 Redland City Council (RCC)

**Planning Scheme**: Redland City Plan Version 13 (current)

**Data Access Methods:**

- **ArcGIS REST Server**: https://gis.redland.qld.gov.au/arcgis/rest/services/planning/city_plan/MapServer
- **Open Data Portal**: https://opendata.redland.qld.gov.au/
- **Document Portal**: City Plan documents and zoning maps

**Primary Datasets:**

- **Zones** (Layer ID: 44)
- **Zone Precincts**
- **Overlays**
- **Zoning Maps** (PDF series)

**ArcGIS REST Endpoint:**

- **Base URL**: `https://gis.redland.qld.gov.au/arcgis/rest/services/planning/city_plan/MapServer`
- **Layer ID**: 44 (Zones)
- **Field for Zone Code**: `QPP_Zone`

**Zone Codes (Residential):**

- **LDR** - Low Density Residential
  - Precincts: LDR1, LDR2, LDR3, LDR4, LDR5
- **LMDR** - Low-Medium Density Residential
  - Precincts: LMDR1, LMDR2
- **MDR** - Medium Density Residential
  - Precincts: MDR1 through MDR9
- **TA** - Traditional Housing (Brisbane-style adaptation)

**Other Zone Categories:**

- **CR** - Centre zones
- **TA** - Traditional Housing
- **PC** - Principal Centre
- **MC** - Major Centre
- **DC** - District Centre
- **LC** - Local Centre
- **NC** - Neighbourhood Centre
- **SC** - Specialised Centre
- **ROS** - Recreation/Open Space
- **EM** - Environmental Management
- **CN** - Conservation
- **LI** - Light Industry
- **MI** - Medium Industry
- **WMI** - Waterfront and Marine Industry
- **CF** - Community Facilities
  - Precincts: CF1 through CF9
- **EC** - Education and Community
- **MU** - Mixed Use
- **W** - Waterways

**Special Notes:**

- 21 zones total
- Zone precincts provide variation within zones
- Comprehensive zone code system

**Formats Available:**

- ✅ Layer packages (recommended)
- ✅ Feature service (ArcGIS REST)
- ✅ CSV, KML (via feature service)
- ✅ Pre-built symbology with layer packages

**Contact/Support:**

- Spatial Business Intelligence team

---

### 2.6 Moreton Bay Regional Council (MBRC)

**Planning Scheme**: MBRC Planning Scheme

**Data Access Methods:**

- **Datahub**: https://datahub.moretonbay.qld.gov.au/
- **Data.gov.au**: https://www.data.gov.au/dataset/?organization=moreton-bay-regional-council
- **Interactive Mapping**: My Property Look Up tool

**Primary Datasets:**

- **Zones** (ZM_Zones dataset)
- **Local Plan Precincts** (derived from Zones)
- **Riparian Wetland Setbacks Overlay**
- **Planning Scheme Overlays**

**ArcGIS REST Endpoint:**

- **Base URL**: `https://services-ap1.arcgis.com/YQyt7djuXN7rQyg4/arcgis/rest/services/ZM_Zones_Dissolved_WebMercator_OpenData/FeatureServer/0`
- **Layer ID**: 0
- **Field for Zone Name**: `LVL1_ZONE`

**Formats Available:**

- ✅ JSON
- ✅ GeoJSON
- ✅ PBF
- ✅ CSV
- ✅ KML
- ❌ WFS (not explicitly available)
- ✅ Shapefile (via Data.gov.au)

**Special Notes:**

- Zoning map available (PDF format)
- Interactive mapping for property look-up
- Last updated: March 7, 2022
- Zones dissolved for web mercator projection

**Contact/Support:**

- **MBRC GIS**: GIS@moretonbay.qld.gov.au (mentioned in API docs)

---

### 2.7 Ipswich City Council (ICC)

**Planning Scheme**: Ipswich Planning Scheme (current) / New Ipswich Planning Scheme 2025 (replacing July 2025)

**Data Access Methods:**

- **Data.gov.au**: Primary distribution channel
- **Interactive Mapping**: Current Planning Scheme Mapping tool
- **Document Portal**: Planning scheme documents

**Primary Datasets:**

- **Planning Zones** (Shapefile available)
- **Planning Designations**
- **Planning Overlays**
- **Shifting Boundaries**

**Dataset Details:**

- **Data.gov.au ID**: `ipswich-planning-scheme-zones`
- **Title**: Ipswich Planning Scheme - Zones, Designations and Notations
- **Formats Available**: SHP, GeoJSON, KML, ZIP, WMS, WFS, QGIS

**Formats Available:**

- ✅ **Shapefile (SHP)** - Explicitly listed
- ✅ GeoJSON
- ✅ KML
- ✅ WFS (Web Feature Service) - Available
- ✅ WMS
- ✅ ZIP

**Special Notes:**

- WFS available (rare among QLD councils)
- New planning scheme launching July 1, 2025
- Good documentation

**Contact/Support:**

- Council Planning Department

---

## 3. Zone Code Standardization Challenges

### Code Variations Between Councils

| Density Level          | Brisbane    | Logan              | Redland              | Gold Coast                      | Issue |
| ---------------------- | ----------- | ------------------ | -------------------- | ------------------------------- | ----- |
| **Low Density**        | LDR         | LD RES             | Varies               | Different codes, same intent    |
| **Low-Medium Density** | LDMR        | LMDR               | N/A                  | Slight variation in name        |
| **Medium Density**     | MDR         | MD RES             | Varies               | Brisbane uses numeric precincts |
| **High Density**       | Part of MDR | MD RES (High Rise) | Different approaches |

### Standardization Strategy

**Option 1: Propure-Standard Categories**
Map all council codes to Propure's internal categories:

```python
# Zone Code Mapping Dictionary
ZONE_CODE_MAPPING = {
    # Brisbane
    "LDR": "LOW_DENSITY_RESIDENTIAL",
    "LDMR": "LOW_MEDIUM_DENSITY_RESIDENTIAL",
    "MDR": "MEDIUM_DENSITY_RESIDENTIAL",

    # Logan
    "LD RES": "LOW_DENSITY_RESIDENTIAL",
    "MD RES": "MEDIUM_DENSITY_RESIDENTIAL",

    # Redland
    "LDR": "LOW_DENSITY_RESIDENTIAL",
    "LMDR": "LOW_MEDIUM_DENSITY_RESIDENTIAL",
    "MDR": "MEDIUM_DENSITY_RESIDENTIAL",

    # Sunshine Coast
    # (Requires manual mapping from 22 zones)

    # Gold Coast
    # (Requires mapping from City Plan version 7 codes)

    # Moreton Bay
    "General Residential": "LOW_DENSITY_RESIDENTIAL",
    "Rural Residential": "RURAL_RESIDENTIAL",
}
```

**Option 2: Density-Based Classification**
Create density metrics from zone descriptions:

```python
# Density Classification Rules
DENSITY_RULES = {
    "max_dwellings_per_ha": {
        (0, 2): "LOW_DENSITY",
        (2, 15): "MEDIUM_DENSITY",
        (15, 40): "HIGH_DENSITY",
        (40, float('inf')): "VERY_HIGH_DENSITY"
    },
    "min_lot_size_sqm": {
        (0, 400): "LOW_DENSITY",
        (400, 600): "MEDIUM_DENSITY",
        (600, 1000): "HIGH_DENSITY",
        (1000, float('inf')): "RURAL"
    }
}
```

**Option 3: Permitted Uses Analysis**
Parse zone objectives and permitted uses to categorize zones automatically.

---

## 4. Licensing and Commercial Use

### Queensland Government Policy

**Default License**: Creative Commons Attribution (CC BY 4.0)

- Applies to Queensland Government data
- Requires attribution to data source
- Allows commercial use
- No restrictions on redistribution or adaptation

### Council-Specific Licenses

| Council            | License          | Commercial Use | Attribution Required | Data Source |
| ------------------ | ---------------- | -------------- | -------------------- | ----------- |
| **Brisbane**       | CC BY 4.0        | ✅ Yes         | Open Data Portal     |
| **Gold Coast**     | CC BY (likely)   | ✅ Yes         | Data.gov.au          |
| **Sunshine Coast** | Open data policy | ✅ Likely      | ArcGIS REST          |
| **Logan**          | Open data policy | ✅ Likely      | Open Data Portal     |
| **Redland**        | Open data policy | ✅ Likely      | ArcGIS REST          |
| **Moreton Bay**    | CC BY (likely)   | ✅ Yes         | Data.gov.au          |
| **Ipswich**        | CC BY (likely)   | ✅ Yes         | Data.gov.au          |

### Commercial Use Terms

**Key Findings:**

1. **Commercial use is permitted** under CC BY license
2. **Attribution required** - Must credit the council as data source
3. **No restrictions on derivative works** - Can modify, transform, build on the data
4. **State encourages commercial innovation** - QTT Open Data Strategy supports economic stimulation

**Best Practice for Propure:**

- Add "Data Sources" page attributing all councils
- Include council logos/attribution in map layers
- Document data update dates and versions in metadata
- Register council API usage where required (if applicable)

---

## 5. Technical Implementation Approach

### Python Stack for QLD Council Data

```python
# Recommended Python Libraries
# pyproject.toml
[project]
dependencies = [
    "geopandas>=1.0.0",          # Primary geospatial library
    "pyogrio>=0.9.0",           # Fast I/O (10-20x faster)
    "shapely>=2.0.6",            # Vectorized GEOS operations
    "requests>=2.31.0",             # HTTP client
    "fiona>=1.9.0",              # Format support
    "arcgis>=1.9.0",            # ArcGIS REST API client
    "pandera>=0.20.0",           # Schema validation
    "sqlalchemy>=2.0.0",           # PostGIS connection
    "geoalchemy2>=0.18.0",        # PostGIS ORM
    "psycopg2>=2.9.0",             # PostgreSQL driver
]
```

### Council-Specific Ingestion Patterns

#### Pattern 1: ArcGIS REST API (Sunshine Coast, Redland, Gold Coast)

```python
# Example: Sunshine Coast Zones
from arcgis.features import FeatureLayer
import geopandas as gpd

def fetch_sunshine_coast_zones():
    """Fetch zones from Sunshine Coast ArcGIS REST API"""
    # ArcGIS REST endpoint
    layer_url = "https://gislegacy.scc.qld.gov.au/arcgis/rest/services/PlanningCadastre/PlanningScheme_SunshineCoast_Zoning_SCC/MapServer/5"

    # Initialize FeatureLayer
    layer = FeatureLayer(layer_url)

    # Query all features
    zones_gdf = layer.query(where="1=1", out_fields="*", return_geometry=True)

    # Transform to GDA2020 (EPSG:7844)
    zones_gdf = zones_gdf.to_crs(epsg=7844)

    # Standardize columns
    zones_gdf = zones_gdf.rename(columns={
        'ZONE_CODE': 'zone_code',
        'ZONE_NAME': 'zone_name',
        'ZONE_DESC': 'zone_description'
    })

    # Add metadata
    zones_gdf['council'] = 'Sunshine Coast Council'
    zones_gdf['state'] = 'QLD'
    zones_gdf['planning_scheme'] = 'Sunshine Coast Planning Scheme 2014'
    zones_gdf['data_source'] = 'SCC ArcGIS REST'

    return zones_gdf
```

#### Pattern 2: Direct Downloads (Ipswich, Moreton Bay, Brisbane)

```python
import requests
import geopandas as gpd
import zipfile
import io

def fetch_ipswich_zones():
    """Download and parse Ipswich planning zones"""
    # Download shapefile from Data.gov.au
    data_url = "https://example.data.gov.au/dataset/ipswich-planning-scheme-zones/resources/PlanningZones.zip"

    response = requests.get(data_url)
    response.raise_for_status()

    # Unzip in memory
    with zipfile.ZipFile(io.BytesIO(response.content)) as zip_ref:
        # Find shapefile
        shp_file = [f for f in zip_ref.namelist() if f.endswith('.shp')][0]
        with zip_ref.open(shp_file) as f:
            zones_gdf = gpd.read_file(f)

    # Standardize (same as ArcGIS REST pattern)
    zones_gdf = zones_gdf.to_crs(epsg=7844)
    zones_gdf['zone_code'] = zones_gdf['ZONE_CODE']
    zones_gdf['zone_name'] = zones_gdf['ZONE_NAME']
    zones_gdf['council'] = 'Ipswich City Council'
    zones_gdf['state'] = 'QLD'

    return zones_gdf
```

#### Pattern 3: Open Data Portal (Logan, Brisbane)

```python
def fetch_logan_zones():
    """Fetch Logan zones from open data portal"""
    # Open Data Portal API endpoint
    portal_url = "https://data-logancity.opendata.arcgis.com/datasets/logan::planning-scheme-zones"

    # Use ArcGIS REST under the hood
    zones_gdf = gpd.read_file(portal_url)

    # Standardize
    zones_gdf['zone_code'] = zones_gdf['ZONE_CODE']  # LD RES, MD RES
    zones_gdf['zone_code_std'] = zones_gdf['ZONE_CODE'].replace(' RES', '_DENSITY_RESIDENTIAL').replace(' ', '')

    # Add precinct information if available
    if 'PRECINCT' in zones_gdf.columns:
        zones_gdf['precinct_code'] = zones_gdf['PRECINCT']

    zones_gdf['council'] = 'Logan City Council'
    zones_gdf['state'] = 'QLD'
    zones_gdf['planning_scheme'] = 'Logan Planning Scheme 2015 v9.2'

    return zones_gdf
```

### Data Quality Validation

```python
from pandera import DataFrameSchema, Column
import shapely
import numpy as np

def validate_zones_gdf(zones_gdf, council_name):
    """Validate zone data before loading to PostGIS"""

    # Schema validation
    schema = DataFrameSchema({
        'zone_code': Column(str, nullable=False),
        'zone_name': Column(str, nullable=False),
        'zone_description': Column(str, nullable=True),
        'geometry': Column(str, nullable=False),  # Will check separately
        'council': Column(str, nullable=False),
        'state': Column(str, nullable=False)
    })

    validated = schema.validate(zones_gdf)

    # Geometry validation
    valid_geom = zones_gdf.geometry.is_valid
    invalid_count = (~valid_geom).sum()

    if invalid_count > 0:
        print(f"⚠️  Found {invalid_count} invalid geometries for {council_name}")
        # Attempt to fix
        zones_gdf.geometry = zones_gdf.geometry.buffer(0)  # Fix self-intersections

    # Coverage validation
    total_area_ha = zones_gdf.geometry.area.sum() / 10000
    print(f"📊 {council_name} total area: {total_area_ha:,.0f} hectares")

    # Zone code validation
    unique_zones = zones_gdf['zone_code'].unique()
    print(f"📝 Found {len(unique_zones)} unique zone codes for {council_name}")

    # CRS validation
    current_crs = zones_gdf.crs
    print(f"🌍 CRS: {current_crs}")

    if current_crs != 'EPSG:7844':
        print(f"⚠️  Warning: Expected EPSG:7844 (GDA2020), got {current_crs}")

    return validated, zones_gdf
```

### Database Loading Pattern

```python
from sqlalchemy import create_engine
from geoalchemy2 import GeoAlchemy2

def load_zones_to_postgis(zones_gdf):
    """Load zones to PostGIS"""

    # Database connection
    engine = create_engine(os.environ['DATABASE_URL'])

    # Ensure PostGIS extension
    with engine.connect() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))

    # Load to planning schema
    zones_gdf.to_postgis(
        name='zones',
        con=engine,
        if_exists='append',  # Upsert strategy
        index=False,  # Use spatial index separately
        schema='planning'
    )

    # Create spatial indexes
    with engine.connect() as conn:
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_zones_geometry ON planning.zones USING GIST(geometry);"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_zones_council ON planning.zones(council);"))

    print(f"✅ Loaded {len(zones_gdf)} zone features to PostGIS")
```

---

## 6. Implementation Prioritization

### Phase 1: Priority Councils (Immediate)

| Council            | Priority | Rationale                 | Data Quality | Effort |
| ------------------ | -------- | ------------------------- | ------------ | ------ |
| **Brisbane**       | 🥇 1     | Largest market, good API  | Low          |
| **Ipswich**        | 🥈 2     | WFS available, clear docs | Low          |
| **Sunshine Coast** | 🥉 3     | ArcGIS REST available     | Low          |
| **Gold Coast**     | 🥉 4     | Good open data portal     | Medium       |

**Estimated Coverage**: ~50% of QLD property market by value

### Phase 2: Secondary Councils (Next)

| Council         | Priority | Rationale                           | Data Quality | Effort |
| --------------- | -------- | ----------------------------------- | ------------ | ------ |
| **Logan**       | 5        | Large council, moderate data access | Medium       |
| **Redland**     | 6        | Complex zone codes, good API        | Medium       |
| **Moreton Bay** | 7        | Smaller but accessible              | Low          |

**Estimated Coverage**: Additional ~25% of QLD property market

### Phase 3: Remaining Councils (Long-term)

- **70 remaining councils**
- Smaller LGAs with limited data access
- May require direct contact
- Effort varies significantly per council

---

## 7. Risk Assessment and Mitigation

### High-Priority Risks

| Risk                            | Impact                         | Likelihood | Mitigation Strategy                                                       |
| ------------------------------- | ------------------------------ | ---------- | ------------------------------------------------------------------------- |
| **Council scheme updates**      | Data becomes stale             | Medium     | Subscribe to council newsletters; Set up monitoring for scheme amendments |
| **Zone code changes**           | Incorrect zone classifications | High       | Version-controlled mapping tables; Automated validation alerts            |
| **API endpoint changes**        | Ingestion pipelines break      | Medium     | Use versioned API clients; Fallback to downloads                          |
| **Geometry invalidity**         | PostGIS loading failures       | Medium     | Automated geometry validation; Buffer technique for fixing                |
| **CRS mismatches**              | Spatial queries fail           | Medium     | Force reproject to GDA2020 (EPSG:7844)                                    |
| **Council-specific variations** | Standardization issues         | High       | Per-council mapping tables; Density-based fallback                        |

### Medium-Priority Risks

| Risk                     | Impact                      | Likelihood | Mitigation Strategy                                                  |
| ------------------------ | --------------------------- | ---------- | -------------------------------------------------------------------- |
| **Limited council APIs** | Manual processes required   | High       | Build council-specific scrapers; Use browser automation where needed |
| **Documentation gaps**   | Misunderstanding zone codes | Medium     | Contact council GIS teams; Review scheme documents                   |
| **Data size limits**     | Incomplete coverage         | Low        | Process by suburb/LGA sections; Use geodatabase format               |
| **Licensing changes**    | Legal/compliance issues     | Low        | Regular review of council open data policies; Attribution tracking   |

### Monitoring and Maintenance Strategy

```python
# Data freshness monitoring
import datetime

def check_data_freshness(council, dataset_type='zones'):
    """Check if council zoning data is current"""

    # Query database for last update
    with create_engine(os.environ['DATABASE_URL']) as conn:
        result = conn.execute(text("""
            SELECT MAX(created_at) as last_updated
            FROM planning.zones
            WHERE council = :council AND state = 'QLD'
        """), {'council': council})

        last_updated = result.fetchone()[0]

    if last_updated:
        days_old = (datetime.now() - last_updated).days
        if days_old > 90:  # Stale if > 3 months
            print(f"⚠️  ALERT: {council} zoning data is {days_old} days old")
            return False
        else:
            return True
    return False
```

---

## 8. Cost Considerations

### Direct Costs

| Item                 | Estimated Cost | Notes                                                   |
| -------------------- | -------------- | ------------------------------------------------------- |
| **Council data**     | $0             | Free under open data policies                           |
| **API access**       | $0             | No API keys required for most councils                  |
| **Download storage** | Low            | Shapefiles and geodatabases range 10-500MB              |
| **Development time** | High           | Council-by-council approach requires significant effort |

### Indirect Costs

| Item                 | Impact | Estimated Effort                                        |
| -------------------- | ------ | ------------------------------------------------------- |
| **Development time** | High   | ~3-5 days per council (research, testing, deployment)   |
| **Maintenance**      | Medium | Quarterly reviews of council scheme updates             |
| **Standardization**  | High   | Creating and maintaining mapping tables for 77 councils |
| **Documentation**    | Medium | Documenting per-council data structures                 |
| **Monitoring**       | Low    | Automated freshness checks                              |

### Total Estimated Effort

**Phase 1 (4 councils)**: ~12-20 person-days
**Phase 2 (3 councils)**: ~9-15 person-days
**Phase 3 (70 councils)**: ~105-350 person-days

**Total**: ~126-385 person-days (6-18 months for one FTE)

---

## 9. Recommendations

### Immediate Actions

1. **Start with Brisbane City Council**
   - Best data quality and API support
   - Covers largest property market (~40% of QLD value)
   - Open data portal well-documented

2. **Implement Ipswich next**
   - Only council with WFS available
   - Good documentation
   - Provides a test case for WFS ingestion

3. **Create Council Ingestion Framework**
   - Develop base classes for ArcGIS REST, direct downloads, and WFS
   - Implement standardization pipeline
   - Build data quality validation suite

### Medium-Term Actions

1. **Prioritize by property market value**
   - Focus on councils with highest median prices
   - Brisbane, Gold Coast, Sunshine Coast, Logan cover 70%+

2. **Establish council relationships**
   - Contact GIS teams at priority councils
   - Understand data update schedules
   - Request access to beta APIs if available

3. **Build zone code mapping infrastructure**
   - Start with Brisbane, Logan, Redland
   - Extend to other councils as implemented
   - Document mapping decisions and rationale

### Long-Term Strategy

1. **Evaluate statewide solutions**
   - Work with QLD Department of State Development to explore centralized options
   - Participate in open data advisory groups
   - Advocate for standardization

2. **Consider hybrid approach**
   - Use council zoning for detailed restrictions
   - Use state ALUMC land use for broad categorization
   - Combine both for comprehensive view

3. **Investigate industry solutions**
   - Research how Landchecker, Archistar, Property Council handle QLD
   - Consider partnerships or data licensing
   - Evaluate commercial data providers

---

## 10. Case Studies

### Comparable Industry Approaches

**Landchecker:**

- Approach: Council-by-council ingestion
- Strategy: Build direct relationships with councils
- Technology: Custom ETL pipelines per council
- Coverage: All Australian states including QLD

**Archistar:**

- Approach: Deep research and manual data collection
- Investment: 100,000+ hours researching planning documents
- Strategy: AI-powered compliance checking
- QLD Coverage: Comprehensive but slow expansion

**National Zoning Atlas:**

- Approach: State-specific research teams
- Method: Manual review and standardization
- Strategy: Dropdown menus for prescribed options
- QLD Status: Requires council-specific teams

**Key Insight**: Even major players must use council-specific approaches for QLD. There's no shortcut.

---

## 11. Technical Appendix

### Council Contact Matrix

| Council        | GIS Contact                   | Planning Contact    | Open Data URL                               | API Documentation        |
| -------------- | ----------------------------- | ------------------- | ------------------------------------------- | ------------------------ |
| Brisbane       | Open Data Portal support      | Planning Department | https://data.brisbane.qld.gov.au/           | Terms & Conditions       |
| Gold Coast     | Planning team                 | Planning Department | https://data-goldcoast.opendata.arcgis.com/ | City Plan documentation  |
| Sunshine Coast | Strategic Planning Branch     | Planning Department | https://data.sunshinecoast.qld.gov.au/      | ArcGIS REST docs         |
| Logan          | Open Data Portal              | Planning Department | https://data-logancity.opendata.arcgis.com/ | Fact sheets              |
| Redland        | Spatial Business Intelligence | Planning Department | https://opendata.redland.qld.gov.au/        | ArcGIS REST docs         |
| Moreton Bay    | GIS@moretonbay.qld.gov.au     | Planning Department | https://datahub.moretonbay.qld.gov.au/      | Interactive mapping help |
| Ipswich        | Planning Department           | Planning Department | https://www.data.gov.au/ (search)           | Planning scheme docs     |

### Zone Code Reference Table

| Category                         | Common Codes | Description                          | Typical Councils |
| -------------------------------- | ------------ | ------------------------------------ | ---------------- |
| **Residential - Low Density**    | LDR, LD RES  | Brisbane, Logan, Redland             |
| **Residential - Low-Medium**     | LDMR         | Brisbane, Redland                    |
| **Residential - Medium Density** | MDR, MD RES  | Brisbane, Logan, Redland, Gold Coast |
| **Residential - Traditional**    | TA           | Brisbane (Beenleigh)                 |
| **Centre - Principal**           | PC           | Redland                              |
| **Centre - Major**               | MC           | Redland                              |
| **Centre - District**            | DC           | Redland                              |
| **Centre - Local**               | LC, NC       | Redland                              |
| **Centre - Neighbourhood**       | NC           | Redland                              |
| **Mixed Use**                    | MU, MU IND   | Logan                                |
| **Rural**                        | RU           | Multiple councils                    |
| **Environmental**                | E, EM        | Multiple councils                    |

---

**Document Version**: 1.0
**Date**: 2026-01-09
**Status**: Complete
**Next Steps**: Implement Brisbane City Council ingestion pipeline
