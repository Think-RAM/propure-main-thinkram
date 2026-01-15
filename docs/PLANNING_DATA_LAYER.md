# Planning Data Layer Documentation

## Overview

This document defines the planning and hazard data layers available for the Propure map visualization system. Data is sourced from Australian state government ArcGIS REST services.

---

## Layer Types

| Layer ID | Name | Description |
|----------|------|-------------|
| `LANDIND_ZONES` | Land Use/Zoning | Land use classifications and planning zones |
| `FLOOD_HAZARD` | Flood Hazard | Flood-prone areas and floodplain assessments |
| `BUSHFIRE_HAZARD` | Bushfire/Fire Management | Bushfire-prone land and fire management zones |
| `LANDSLIDE_HAZARD` | Landslide Hazard | Landslide susceptibility areas |
| `STORM_TIDE_HAZARD` | Storm Tide Hazard | Storm surge inundation zones |
| `HERITAGE` | Heritage Register | Heritage-listed places and conservation areas |

---

## Queensland State-Level Endpoints

**Base Portal**: `https://spatial-gis.information.qld.gov.au/arcgis/rest/services/`

### Land Use Zones

| Property | Value |
|----------|-------|
| **Endpoint** | `PlanningCadastre/LandUse/MapServer/0` |
| **Full URL** | `https://spatial-gis.information.qld.gov.au/arcgis/rest/services/PlanningCadastre/LandUse/MapServer/0` |
| **Geometry** | Polygon |
| **CRS** | EPSG:3857 |
| **Classification** | Australian Land Use and Management Classification (ALUMC) |

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `qlump_code` | Integer | Queensland Land Use Mapping Program code |
| `alum_code` | String | Australian Land Use Management code |
| `year` | Integer | Data year |
| `primary_` | String | Primary land use classification |
| `secondary` | String | Secondary classification |
| `tertiary` | String | Tertiary classification |
| `commodity` | String | Associated commodity type |
| `management` | String | Management practice details |
| `ruleid` | Integer | Categorical identifier (30+ classes) |

**Coverage**: 194 distinct land use categories including nature conservation, agriculture, urban development, and water bodies.

**Note**: This provides land use classification, not formal council planning zones.

---

### Fire Management Zone (Bushfire)

| Property | Value |
|----------|-------|
| **Endpoint** | `Boundaries/AdminBoundariesFramework/MapServer/14` |
| **Full URL** | `https://spatial-gis.information.qld.gov.au/arcgis/rest/services/Boundaries/AdminBoundariesFramework/MapServer/14` |
| **Geometry** | Polygon |
| **CRS** | EPSG:3857 |
| **Purpose** | Fire management zones in Queensland reserves |

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `zone` | String | Fire Management Zone name |
| `subzone` | String | Fire Management Subzone |
| `frequency` | String | Recommended fire frequency range |
| `freqmin` | Integer | Minimum fire frequency (years) |
| `freqmax` | Integer | Maximum fire frequency (years) |
| `description` | String | Zone description |
| `status` | String | Current status |
| `source` | String | Data source |

**Use Case**: Identify bushfire-prone areas and fire management requirements for properties in or near reserves.

---

### Floodplain Assessment Overlay

| Property | Value |
|----------|-------|
| **Endpoint** | `Boundaries/AdminBoundariesFramework/MapServer/15` |
| **Full URL** | `https://spatial-gis.information.qld.gov.au/arcgis/rest/services/Boundaries/AdminBoundariesFramework/MapServer/15` |
| **Geometry** | Polygon |
| **CRS** | EPSG:3857 |
| **Purpose** | Preliminary flood risk assessment for local government planning |

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `sub_name` | String | Drainage sub-basin name |
| `sub_number` | String | Sub-basin identifier |
| `sub_name2` | String | Extended sub-basin name |
| `qra_supply` | String | QRA supply reference |
| `version` | String | Data version |
| `currency` | Date | Data currency/update date |

**Methodology**: Based on analysis of contours, historical flood records, vegetation patterns, soils, and satellite imagery.

**Note**: For detailed flood mapping, use council-specific flood overlays.

---

### Queensland Heritage Register

| Property | Value |
|----------|-------|
| **Endpoint** | `Boundaries/AdminBoundariesFramework/MapServer/78` |
| **Full URL** | `https://spatial-gis.information.qld.gov.au/arcgis/rest/services/Boundaries/AdminBoundariesFramework/MapServer/78` |
| **Geometry** | Polygon |
| **CRS** | EPSG:3857 |
| **Legal Basis** | Queensland Heritage Act 1992 |

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `placename` | String (100) | Heritage place name |
| `place_id` | Integer | Unique place identifier |
| `entrydate` | Date | Heritage registration date |
| `area_sqm` | Integer | Area in square metres |
| `accuracy` | String (50) | Coordinate accuracy level |
| `status` | String (50) | Registration status |

**Legal Significance**: Places in this register are legally protected and require heritage approval for development.

---

## NSW State-Level Endpoints

**Base Portal**: `https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/`

**Legal Framework**: Environmental Planning and Assessment Act 1979

### Land Zoning

| Property | Value |
|----------|-------|
| **Endpoint** | `Planning/EPI_Primary_Planning_Layers/MapServer/2` |
| **Full URL** | `https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/EPI_Primary_Planning_Layers/MapServer/2` |
| **Geometry** | Polygon |
| **CRS** | EPSG:4326 (GDA94) |
| **Legal Basis** | Environmental Planning and Assessment Act 1979 |

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `EPI_NAME` | String | Environmental Planning Instrument name |
| `LGA_NAME` | String | Local Government Area |
| `LAY_CLASS` | String | Zone classification (e.g., R2, B3, RU1) |
| `SYM_CODE` | String | Zone symbol code |
| `PURPOSE` | String | Zone purpose description |
| `EPI_TYPE` | String | Plan type (LEP or SEPP) |
| `PUBLISHED_DATE` | Date | Date published |
| `COMMENCED_DATE` | Date | Date commenced |
| `CURRENCY_DATE` | Date | Data currency date |

**Zone Categories**:

| Prefix | Category | Examples |
|--------|----------|----------|
| R | Residential | R1, R2, R3, R4, R5 |
| B | Business | B1, B2, B3, B4, B5, B6, B7, B8 |
| IN | Industrial | IN1, IN2, IN3, IN4 |
| E | Environment | E1, E2, E3, E4 |
| RE | Recreation | RE1, RE2 |
| RU | Rural | RU1, RU2, RU3, RU4, RU5, RU6 |
| SP | Special Purpose | SP1, SP2, SP3 |
| W | Waterway | W1, W2, W3 |

**Coverage**: Statewide NSW coverage with coordinates 139°-159.3°E and 28.2°-38°S.

---

### Heritage

| Property | Value |
|----------|-------|
| **Endpoint** | `Planning/EPI_Primary_Planning_Layers/MapServer/0` |
| **Full URL** | `https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/EPI_Primary_Planning_Layers/MapServer/0` |
| **Geometry** | Polygon |
| **CRS** | EPSG:4326 (GDA94) |
| **Legal Basis** | Environmental Planning and Assessment Act 1979 |

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `EPI_NAME` | String | Environmental Planning Instrument name |
| `LGA_NAME` | String | Local Government Area |
| `LAY_CLASS` | String | Heritage classification type |
| `H_NAME` | String | Heritage item name |
| `SIG` | String | Significance level (Local, State, National) |
| `EPI_TYPE` | String | Plan type (LEP or SEPP) |
| `PUBLISHED_DATE` | Date | Date published |
| `COMMENCED_DATE` | Date | Date commenced |
| `CURRENCY_DATE` | Date | Data currency date |

**Heritage Types**:
- Aboriginal objects and places
- Archaeological sites
- Heritage items (buildings, structures)
- Heritage conservation areas

**Significance Levels**:

| Level | Description |
|-------|-------------|
| Local | Significant to Local Government Area |
| State | Significant to NSW (State Heritage Register) |
| National | Significant to Australia (National Heritage List) |

---

### Bushfire Prone Land

| Property | Value |
|----------|-------|
| **Endpoint** | `ePlanning/Planning_Portal_Hazard/MapServer/229` |
| **Full URL** | `https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/ePlanning/Planning_Portal_Hazard/MapServer/229` |
| **Geometry** | Polygon |
| **CRS** | EPSG:4326 (GDA94) |
| **Authority** | NSW Rural Fire Service (RFS) Commissioner |

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `Category` | Integer | Vegetation category (1, 2, 3) |
| `d_Category` | String | Category description |
| `Guideline` | String | Guideline reference |
| `d_Guidelin` | String | Guideline version description |
| `LastUpdate` | Date | Last update date |
| `SHAPE_Leng` | Double | Shape length |

**Vegetation Categories**:

| Category | Risk Level | Vegetation Types | Buffer |
|----------|------------|------------------|--------|
| 1 | Highest | Forests, woodlands, heaths, timber plantations | 100m |
| 2 | Moderate | Rainforests, lower-risk managed vegetation | 30m |
| 3 | Lower | Grasslands, wetlands, semi-arid woodlands | 30m |
| Buffer | Varies | Buffer zones around Category 1, 2, 3 areas | - |

**Use Case**: Identify where bushfire protection measures (BAL ratings, APZ requirements) apply during development assessment.

---

### Flood Planning

| Property | Value |
|----------|-------|
| **Endpoint** | `ePlanning/Planning_Portal_Hazard/MapServer/230` |
| **Full URL** | `https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/ePlanning/Planning_Portal_Hazard/MapServer/230` |
| **Geometry** | Polygon |
| **CRS** | EPSG:4326 (GDA94) |
| **Legal Basis** | Environmental Planning and Assessment Act 1979 |

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `EPI_NAME` | String | Environmental Planning Instrument name |
| `LGA_NAME` | String | Local Government Area |
| `LAY_CLASS` | String | Flood classification category |
| `EPI_TYPE` | String | Plan type (LEP or SEPP) |
| `PUBLISHED_DATE` | Date | Date published |
| `COMMENCED_DATE` | Date | Date commenced |
| `CURRENCY_DATE` | Date | Data currency date |

**Flood Classifications**:

| Classification | Description |
|----------------|-------------|
| 1 in 100 year flood | 1% Annual Exceedance Probability (AEP) extent |
| Probable Maximum Flood (PMF) | Theoretical maximum flood extent |
| Flood prone land | General flood-affected land |
| Flood planning area | Areas subject to flood planning controls |

**Use Case**: Identify flood-related development controls and requirements for planning applications.

---

## Victoria State-Level Endpoints

**Planning Portal**: `https://plan-gis.mapshare.vic.gov.au/arcgis/rest/services/`
**Emergency Management**: `https://emapdev.ffm.vic.gov.au/arcgis/rest/services/`

**Legal Framework**: Planning and Environment Act 1987

### Planning Scheme Zones

| Property | Value |
|----------|-------|
| **Endpoint** | `Planning/Vicplan_PlanningSchemeZones/MapServer/2` |
| **Full URL** | `https://plan-gis.mapshare.vic.gov.au/arcgis/rest/services/Planning/Vicplan_PlanningSchemeZones/MapServer/2` |
| **Type** | Group Layer (contains sublayers) |
| **CRS** | EPSG:3111 (VicGrid94) |
| **Legal Basis** | Planning and Environment Act 1987 |

**Note**: This is a GROUP layer. Query individual sublayers for feature data.

**Residential Zone Sublayers**:

| Zone Code | Zone Name | Description |
|-----------|-----------|-------------|
| LDRZ | Low Density Residential Zone | Large lot residential |
| MUZ | Mixed Use Zone | Residential with commercial |
| TZ | Township Zone | Small town residential |
| RGZ | Residential Growth Zone | Higher density areas |
| NRZ | Neighbourhood Residential Zone | Limited change areas |
| GRZ | General Residential Zone | Standard residential |
| R1Z | Residential 1 Zone | Superseded zone |
| HCTZ | Housing Choice & Transport Zone | Transit-oriented development |

**Other Zone Groups in Service**:

| Layer ID | Zone Group | Contains |
|----------|------------|----------|
| 0 | All Zones | All zone types |
| 1 | Activity Centre Zones | ACZ |
| 2 | Residential Zones | LDRZ, MUZ, TZ, RGZ, NRZ, GRZ, R1Z, HCTZ |
| 3 | Industrial Zones | IN1Z, IN2Z, IN3Z |
| 4 | Commercial Zones | C1Z, C2Z, C3Z |
| 5 | Rural Zones | FZ, GWZ, RAZ, RCZ, RLZ, RUZ, SUZ, UFZ |
| 6 | Public Land Zones | PCRZ, PPRZ, PUZ, CA, RDZ |
| 7 | Special Purpose Zones | CDZ, CCZ, PDZ, SCZ, SUZ, TRZ, UGZ |

---

### Heritage and Built Form Overlays

| Property | Value |
|----------|-------|
| **Endpoint** | `Planning/Vicplan_PlanningSchemeOverlays/MapServer/6` |
| **Full URL** | `https://plan-gis.mapshare.vic.gov.au/arcgis/rest/services/Planning/Vicplan_PlanningSchemeOverlays/MapServer/6` |
| **Type** | Group Layer (contains sublayers) |
| **CRS** | EPSG:3111 (VicGrid94) |
| **Legal Basis** | Planning and Environment Act 1987 |

**Note**: This is a GROUP layer. Query individual sublayers for feature data.

**Overlay Sublayers**:

| Overlay Code | Overlay Name | Purpose |
|--------------|--------------|---------|
| DDO | Design and Development Overlay | Building design controls |
| DPO | Development Plan Overlay | Master planning areas |
| HO | Heritage Overlay | Heritage protection |
| IPO | Incorporated Plan Overlay | Specific plan requirements |
| NCO | Neighbourhood Character Overlay | Character protection |
| BFO | Built Form Overlay | Building form controls |

**Other Overlay Groups in Service**:

| Layer ID | Overlay Group | Contains |
|----------|---------------|----------|
| 0 | All Overlays | All overlay types |
| 1 | Environmental & Landscape | ESO, SLO, VPO, LSIO, SBO |
| 2 | Heritage | HO |
| 3 | Land Management | EMO, BMO, SRAO, RXO |
| 4 | Other | PAO, PO, RO, SAO, SRO |

---

### Victorian Flood Database

| Property | Value |
|----------|-------|
| **Endpoint** | `Victorian_Flood_Database/MapServer` |
| **Full URL** | `https://emapdev.ffm.vic.gov.au/arcgis/rest/services/Victorian_Flood_Database/MapServer` |
| **Type** | MapServer (multiple layers) |
| **CRS** | EPSG:4283 (GDA94) |
| **Max Records** | 1000 per query |

**Layer Categories**:

| Category | Description |
|----------|-------------|
| Stream Running Distance | Distance markers along waterways |
| Floodways | Designated floodway areas |
| Flood Structures | Levees and flood infrastructure |
| Flood History | Historical flood events (extents, heights, contours) |
| Statistical Flood Data | Probabilistic flood scenarios |

**Statistical Flood Layers (AEP)**:

| Recurrence | AEP | Description |
|------------|-----|-------------|
| 1 in 5 year | 20% | Frequent flooding |
| 1 in 10 year | 10% | Common flooding |
| 1 in 20 year | 5% | Moderate flooding |
| 1 in 50 year | 2% | Uncommon flooding |
| 1 in 100 year | 1% | Standard planning level |
| 1 in 200 year | 0.5% | Rare flooding |
| 1 in 500 year | 0.2% | Very rare flooding |

**Use Case**: Comprehensive flood risk assessment including historical events and probabilistic modeling.

---

### Flood Height Contours - 1 in 100 Year (Primary Flood Layer)

| Property | Value |
|----------|-------|
| **Endpoint** | `Victorian_Flood_Database/MapServer/13` |
| **Full URL** | `https://emapdev.ffm.vic.gov.au/arcgis/rest/services/Victorian_Flood_Database/MapServer/13` |
| **Geometry** | Polyline (contour lines) |
| **CRS** | EPSG:4283 (GDA94) |
| **Max Records** | 1000 per query |
| **ARI** | 1 in 100 year (1% AEP) |

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `HEIGHT` | Double | Flood water elevation (metres AHD) |
| `STUDYID` | String (10) | Flood study identifier |
| `ARI` | Integer | Annual Recurrence Interval |
| `STUDYARI` | String (12) | Study ARI reference |
| `METHOD` | String (50) | Modeling/survey method used |
| `RELIABILITY` | String (10) | Data reliability rating |
| `PLAN_NO` | String (20) | Planning reference number |
| `NOTE_CODE` | Integer | Note/comment code |
| `TYPE` | String (50) | Contour type classification |
| `LENGTH` | Double | Contour line length |
| `MODIFIED` | Integer | Modification flag |
| `VERSION` | SmallInteger | Data version |

**Key Field: HEIGHT**

The `HEIGHT` field contains flood water elevation in metres above Australian Height Datum (AHD). This is critical for:
- Determining floor level requirements
- Calculating freeboard requirements
- Assessing flood risk for specific properties

**Use Cases**:

| Use Case | How to Use HEIGHT |
|----------|-------------------|
| Floor level requirement | Set finished floor level above HEIGHT + freeboard (typically 300-600mm) |
| Property flood risk | Compare property ground level to nearby contour HEIGHT values |
| Development assessment | Determine if property is within flood planning area |
| Insurance assessment | Calculate potential flood depth (HEIGHT minus ground level) |

**Related Layers in Service**:

| Layer ID | Layer Name | Description |
|----------|------------|-------------|
| 10 | Flood height contours - 1 in 5 year | Frequent flooding contours |
| 11 | Flood height contours - 1 in 10 year | Common flooding contours |
| 12 | Flood height contours - 1 in 20 year | Moderate flooding contours |
| **13** | **Flood height contours - 1 in 100 year** | **Standard planning level (recommended)** |
| 14 | Flood height contours - 1 in 200 year | Rare flooding contours |
| 15 | Flood height contours - 1 in 500 year | Very rare flooding contours |

**Note**: Layer 13 (1 in 100 year) is the standard planning level used for development control across Australia.

---

### Bushfire History

| Property | Value |
|----------|-------|
| **Endpoint** | `vsw_fire_management/MapServer/47` |
| **Full URL** | `https://emapdev.ffm.vic.gov.au/arcgis/rest/services/vsw_fire_management/MapServer/47` |
| **Geometry** | Polygon |
| **CRS** | EPSG:3111 (VicGrid94) |
| **Max Records** | 1000 per query |
| **Coverage** | 50+ years of fire history |

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `FIRETYPE` | String | Type of fire |
| `SEASON` | String | Fire season |
| `FIRE_NO` | String | Fire number identifier |
| `NAME` | String | Fire name |
| `START_DATE` | Date | Fire start date |
| `FIREKEY` | String | Unique fire key |
| `AREA_HA` | Double | Affected area in hectares |
| `DSE_ID` | String | Department identifier |
| `CFA_ID` | String | CFA identifier |
| `TREATMENT_TYPE` | String | Treatment type applied |

**Note**: This is historical bushfire data, not bushfire prone land mapping. For Bushfire Management Overlay (BMO), use the Vicplan_PlanningSchemeOverlays service.

---

## Western Australia State-Level Endpoints

**Base Portal**: `https://public-services.slip.wa.gov.au/public/rest/services/SLIP_Public_Services/`

**Data Catalogue**: `https://catalogue.data.wa.gov.au/`

**Legal Framework**: Planning and Development Act 2005

### Local Planning Scheme - Zones and Reserves

| Property | Value |
|----------|-------|
| **Endpoint** | `Property_and_Planning/MapServer/112` |
| **Full URL** | `https://public-services.slip.wa.gov.au/public/rest/services/SLIP_Public_Services/Property_and_Planning/MapServer/112` |
| **Dataset ID** | DPLH-071 |
| **Geometry** | Polygon |
| **CRS** | EPSG:4326 (GDA94) |
| **Max Records** | 10,000 |
| **Legal Basis** | Planning and Development Act 2005 |

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `zone` | String (150) | Zone classification name |
| `zone_numbe` | Integer | Numeric zone identifier (standardized across schemes) |
| `scheme_nam` | String | Local planning scheme name |
| `lga` | String | Local Government Area |
| `gazettal_d` | Date | Official gazette publication date |

**Zone Categories**:

| Category | Description |
|----------|-------------|
| Residential | Multiple density levels |
| Commercial | Business and retail zones |
| Industrial | Manufacturing and industry |
| Agricultural | Farming and rural |
| Conservation | Environmental protection |
| Recreation | Parks and open space |
| Infrastructure | Utilities and services |
| Roads | Transportation corridors |

**Note**: Zone numbers are standardized across all WA local planning schemes for consistency.

---

### Local Planning Scheme - R Codes

| Property | Value |
|----------|-------|
| **Endpoint** | `Property_and_Planning/MapServer/111` |
| **Full URL** | `https://public-services.slip.wa.gov.au/public/rest/services/SLIP_Public_Services/Property_and_Planning/MapServer/111` |
| **Dataset ID** | DPLH-070 |
| **Geometry** | Polygon |
| **CRS** | EPSG:4326 (GDA94) |
| **Max Records** | 10,000 |

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `rcode_no` | Integer | R-Code number (density code) |
| `gazettal_d` | Date | Gazettal date |
| `scheme_nam` | String | Scheme name |
| `scheme_no` | String | Scheme number |

**R-Code System** (Unique to WA):

| R-Code | Minimum Lot Size | Density |
|--------|------------------|---------|
| R2 | 5,000 m² | Very low |
| R5 | 2,000 m² | Low |
| R10 | 1,000 m² | Low |
| R15 | 666 m² | Low-medium |
| R20 | 500 m² | Medium |
| R25 | 400 m² | Medium |
| R30 | 333 m² | Medium |
| R40 | 250 m² | Medium-high |
| R50 | 200 m² | High |
| R60 | 166 m² | High |
| R80 | 125 m² | High |
| R100 | 100 m² | Very high |
| R160 | 62.5 m² | Very high |

**Use Case**: Determine residential development density potential for subdivision and development applications.

---

### Bush Fire Prone Areas

| Property | Value |
|----------|-------|
| **Endpoint** | `Bush_Fire_Prone_Areas/MapServer/17` |
| **Full URL** | `https://public-services.slip.wa.gov.au/public/rest/services/SLIP_Public_Services/Bush_Fire_Prone_Areas/MapServer/17` |
| **Dataset ID** | OBRM-001 |
| **Geometry** | Polygon |
| **CRS** | EPSG:4326 (GDA94) |
| **Max Records** | 10,000 |
| **Authority** | Office of Bushfire Risk Management |

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `designation` | String (120) | Bushfire prone designation |
| `lga` | String (50) | Local Government Area |
| `type` | String (3) | Classification type |
| `designationdate` | Date | Date of designation |

**Use Case**: Identify areas requiring BAL (Bushfire Attack Level) assessment and AS 3959 compliance for new development.

---

### Heritage List

| Property | Value |
|----------|-------|
| **Endpoint** | `People_and_Society/MapServer/16` |
| **Full URL** | `https://public-services.slip.wa.gov.au/public/rest/services/SLIP_Public_Services/People_and_Society/MapServer/16` |
| **Dataset ID** | DPLH-090 |
| **Geometry** | Polygon |
| **CRS** | EPSG:4326 (GDA94) |
| **Max Records** | 10,000 |
| **Legal Basis** | Heritage Act 2018 |

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `place_no` | Integer | Heritage place number |
| `place_name` | String | Heritage site name |
| `location` | String | Site location details |
| `lga` | String | Local Government Area |
| `more_info` | String | Link to additional information |

**Use Case**: Identify heritage constraints affecting development potential and approval requirements.

---

### FPM Historical Floodplain Area

| Property | Value |
|----------|-------|
| **Endpoint** | `Water/MapServer/57` |
| **Full URL** | `https://public-services.slip.wa.gov.au/public/rest/services/SLIP_Public_Services/Water/MapServer/57` |
| **Dataset ID** | DWER-124 |
| **Geometry** | Polygon |
| **CRS** | EPSG:4326 (GDA94) |
| **Max Records** | 10,000 |
| **Authority** | Department of Water and Environmental Regulation |

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `EVENT` | String | Flood event name |
| `EST_ARI` | String | Estimated Annual Recurrence Interval |
| `HYD_NAME` | String | Hydrological name |
| `LOCATION` | String | Location description |
| `VERT_DATUM` | String | Vertical datum reference |
| `DATE_CHECK` | Date | Verification date |
| `SOURCE` | String | Data source |
| `COMMENTS` | String | Additional notes |

**ARI Values**:

| ARI | Description |
|-----|-------------|
| 1 in 5 | Frequent flooding (20% AEP) |
| 1 in 10 | Common flooding (10% AEP) |
| 1 in 20 | Moderate flooding (5% AEP) |
| 1 in 50 | Uncommon flooding (2% AEP) |
| 1 in 100 | Standard planning level (1% AEP) |
| 1 in 500 | Rare flooding (0.2% AEP) |

**Use Case**: Flood risk assessment and floodplain management planning.

---

## ACT (Australian Capital Territory) Endpoints

**Base Portal**: `https://services1.arcgis.com/E5n4f1VY84i0xSjy/ArcGIS/rest/services/`

**Legal Framework**: Planning and Development Act 2007, Territory Plan

### Territory Plan Land Use Zones

| Property | Value |
|----------|-------|
| **Endpoint** | `ACTGOV_TP_LAND_USE_ZONE/FeatureServer/1` |
| **Full URL** | `https://services1.arcgis.com/E5n4f1VY84i0xSjy/ArcGIS/rest/services/ACTGOV_TP_LAND_USE_ZONE/FeatureServer/1` |
| **Geometry** | Polygon |
| **CRS** | EPSG:7855 (GDA2020 MGA Zone 55) |
| **Max Records** | 2,000 |
| **Legal Basis** | Territory Plan under Planning and Development Act 2007 |

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `LAND_USE_ZONE_CODE_ID` | String (10) | Zone code identifier |
| `DESCRIPTION` | String (255) | Zone description |
| `LAND_USE_POLICY_DESC` | String (255) | Land use policy description |
| `DIVISION_NAME` | String (30) | Division name |
| `DISTRICT_NAME` | String (30) | District name |
| `DIVISION_SHORT` | String (4) | Division abbreviation |
| `DISTRICT_SHORT` | String (4) | District abbreviation |
| `GAZETTAL_DATE` | Date | Gazettal date |
| `GAZETTAL_NUMBER` | String (20) | Gazettal reference number |
| `VARIATION_NUMBER_CREATED_BY` | String (10) | Variation number |
| `VARIATION_YEAR` | String (2) | Variation year |
| `CURRENT_LIFECYCLE_STAGE` | String (20) | Current lifecycle status |

**Zone Categories** (23 zones in 7 groups):

| Category | Description |
|----------|-------------|
| Residential | Residential zones (RZ1-RZ5) |
| Commercial | Commercial/retail zones (CZ1-CZ6) |
| Industrial | Industrial zones (IZ1-IZ2) |
| Community Facility | Community facilities (CFZ) |
| Parks and Recreation | Open space and recreation (PRZ1-PRZ2) |
| Transport and Services | Transport corridors (TSZ1-TSZ2) |
| Non-Urban | Rural and non-urban zones (NUZ) |

**Note**: ACT uses the Territory Plan instead of Local Environmental Plans. Zones determine land use and development potential.

---

### 1 in 100 Year Flood Extent (1% AEP)

| Property | Value |
|----------|-------|
| **Endpoint** | `ACTGOV_FLOOD_EXTENT/FeatureServer/0` |
| **Full URL** | `https://services1.arcgis.com/E5n4f1VY84i0xSjy/ArcGIS/rest/services/ACTGOV_FLOOD_EXTENT/FeatureServer/0` |
| **Geometry** | Polygon |
| **CRS** | EPSG:7855 (GDA2020 MGA Zone 55) |
| **Max Records** | 2,000 |
| **Flood Standard** | 1 in 100 year (1% Annual Exceedance Probability) |

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `OBJECTID` | OID | Feature identifier |
| `Shape__Area` | Double | Polygon area |
| `Shape__Length` | Double | Polygon perimeter |

**Use Case**: Identify properties within the 1% AEP flood extent for development assessment and flood risk planning.

**Note**: This is a simple extent layer showing the 1 in 100 year flood boundary. Does not include flood depth or height data.

---

### Fire Management Zones (2015-2019)

| Property | Value |
|----------|-------|
| **Endpoint** | `Fire_Management_Zones_2015_2019/FeatureServer/0` |
| **Full URL** | `https://services1.arcgis.com/E5n4f1VY84i0xSjy/ArcGIS/rest/services/Fire_Management_Zones_2015_2019/FeatureServer/0` |
| **Geometry** | Polygon |
| **CRS** | EPSG:28355 (GDA94 MGA Zone 55) |
| **Max Records** | 1,000 |
| **Authority** | ACT Parks and Conservation Service |

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `ELEM_TEXT` | String (254) | Fire management zone type |
| `DESC_` | String (100) | Zone description |
| `Hectare` | Double | Area in hectares |
| `ID` | Integer | Zone identifier |

**Fire Management Zone Types** (7 categories):

| Zone Type | Description |
|-----------|-------------|
| Asset Protection Zone | Areas adjacent to buildings requiring fuel reduction |
| Inner Asset Protection Zone | High-priority fuel management areas |
| Strategic Fire Advantage Zone | Strategic fire break corridors |
| Land Management Zone | General land management areas |
| Conservation Zone | Areas managed for conservation |
| Exclusion Zone | Areas excluded from planned burns |
| Unzoned | Areas not yet classified |

**Use Case**: Identify fire management requirements and bushfire risk for properties in or near managed areas.

**Note**: Data covers 2015-2019 period. For current bushfire prone mapping, verify with ACT Emergency Services Agency.

---

### ACT Heritage Register

| Property | Value |
|----------|-------|
| **Endpoint** | `ACTGOV_Heritage_Register/FeatureServer/1` |
| **Full URL** | `https://services1.arcgis.com/E5n4f1VY84i0xSjy/ArcGIS/rest/services/ACTGOV_Heritage_Register/FeatureServer/1` |
| **Geometry** | Polygon |
| **CRS** | GDA2020 MGA Zone 55 |
| **Max Records** | 2,000 |
| **Legal Basis** | Heritage Act 2004 |

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `NAME` | String (100) | Heritage place name |
| `SITE_NAME` | String (50) | Site name |
| `HeritageID` | Integer | Unique heritage identifier |
| `HRcode` | String (10) | Heritage register code |
| `HRcategory` | String (30) | Heritage category (Aboriginal, Historic, Natural) |
| `HRstatus` | String (255) | Registration status |
| `BLOCK_NUMBER` | Integer | Block number |
| `SECTION_NUMBER` | Integer | Section number |
| `DIVISION_NAME` | String (30) | Division name |
| `DISTRICT_NAME` | String (30) | District name |
| `LAND_USE_POLICY_ZONES` | String (400) | Associated land use zones |
| `OVERLAY_PROVISION_ZONES` | String (400) | Associated overlay provisions |
| `DataRestrictions` | String (10) | Data access restrictions |

**Heritage Categories**:

| Category | Description |
|----------|-------------|
| Aboriginal | Aboriginal heritage places and objects |
| Historic | Historic heritage places |
| Natural | Natural heritage areas |

**Registration Statuses**:

| Status | Description |
|--------|-------------|
| Registered | Fully protected under Heritage Act 2004 |
| Nominated | Pending assessment |
| Provisionally Registered | Interim protection while under assessment |

**Use Case**: Identify heritage constraints affecting development and approval requirements under the Heritage Act 2004.

**Note**: Sensitive Aboriginal heritage site locations are protected by associating them with ACT block boundaries rather than exact coordinates.

---

## South Australia State-Level Endpoints

**Base Portal**: `https://location.sa.gov.au/server6/rest/services/ePlanningPublic/`

**Legal Framework**: Planning, Development and Infrastructure Act 2016, Planning and Design Code

### P&D Code Zones

| Property | Value |
|----------|-------|
| **Endpoint** | `CurrentPDC_wmas/MapServer/110` (Group) or `CurrentPDC_wmas/MapServer/114` (Feature) |
| **Full URL** | `https://location.sa.gov.au/server6/rest/services/ePlanningPublic/CurrentPDC_wmas/MapServer/114` |
| **Type** | Group Layer (110) containing Feature Layer (114) |
| **Geometry** | Polygon |
| **CRS** | EPSG:3857 (Web Mercator) |
| **Max Records** | 2,000 |
| **Legal Basis** | Planning and Design Code under PDI Act 2016 |

**Note**: Layer 110 is a GROUP layer. Use Layer 114 (P&D Code Zones) for feature queries.

**Group Layer Structure** (Layer 110):

| Layer ID | Name | Purpose |
|----------|------|---------|
| 111 | P&D Code Subzones - Outline & Labels | Subzone boundaries with labels |
| 112 | P&D Code Zones - Outline & Labels | Zone boundaries with labels |
| 113 | P&D Code Subzones | Subzone polygons |
| **114** | **P&D Code Zones** | **Zone polygons (recommended)** |

**Fields** (Layer 114):

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (5) | Zone identifier |
| `name` | String (50) | Zone name |
| `description` | String (500) | Zone description |
| `value` | String (50) | Zone value/code |
| `legalstartdate` | Date | Legal commencement date |
| `legalenddate` | Date | Legal end date (if superseded) |
| `systemstartdate` | Date | System start date |
| `systemenddate` | Date | System end date |
| `status` | SmallInteger | Status code |

**Zone Categories** (Planning and Design Code):

| Category | Description |
|----------|-------------|
| General Neighbourhood | Standard residential areas |
| Suburban Neighbourhood | Low-density suburban |
| Housing Diversity Neighbourhood | Medium density residential |
| Urban Corridor (Main Street) | Mixed use corridors |
| Urban Activity Centre | Major activity centres |
| Township | Rural townships |
| Rural | Agricultural and rural |
| Employment | Industrial and commercial |
| Conservation | Environmental protection |

**Note**: SA uses the Planning and Design Code (P&D Code) which replaced individual Development Plans in 2021.

---

### Hazards (Flooding - General)

| Property | Value |
|----------|-------|
| **Endpoint** | `ConsultFlooding/MapServer/7` |
| **Full URL** | `https://location.sa.gov.au/server6/rest/services/ePlanningPublic/ConsultFlooding/MapServer/7` |
| **Geometry** | Polygon |
| **CRS** | EPSG:3857 (Web Mercator) |
| **Max Records** | 2,000 |
| **Purpose** | General flood hazard areas |

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (5) | Hazard identifier |
| `name` | String (50) | Hazard area name |
| `description` | String (500) | Hazard description |
| `value` | String (50) | Hazard classification value |
| `legalstartdate` | Date | Legal commencement date |
| `legalenddate` | Date | Legal end date |
| `systemstartdate` | Date | System start date |
| `systemenddate` | Date | System end date |
| `status` | SmallInteger | Status code |

**Use Case**: Identify flood-prone areas for development assessment and risk planning.

**Note**: This layer provides general flood hazard mapping under the P&D Code overlay system.

---

### Hazards (Bushfire)

| Property | Value |
|----------|-------|
| **Endpoint** | `CurrentPDC_wmas/MapServer/8` (Group) |
| **Full URL** | `https://location.sa.gov.au/server6/rest/services/ePlanningPublic/CurrentPDC_wmas/MapServer/8` |
| **Type** | Group Layer (contains 6 sublayers) |
| **CRS** | EPSG:3857 (Web Mercator) |
| **Max Records** | 2,000 per sublayer |
| **Authority** | SA Country Fire Service (CFS) |

**Note**: Layer 8 is a GROUP layer. Query individual sublayers for specific risk levels.

**Bushfire Risk Sublayers**:

| Layer ID | Name | Risk Level |
|----------|------|------------|
| 9 | Hazards (Bushfire - Urban Interface) | Highest - urban edge areas |
| 10 | Hazards (Bushfire - High Risk) | High risk vegetation |
| 11 | Hazards (Bushfire - Medium Risk) | Medium risk areas |
| 12 | Hazards (Bushfire - General Risk) | General bushfire risk |
| 13 | Hazards (Bushfire - Regional) | Regional risk areas |
| 14 | Hazards (Bushfire - Outback) | Remote/outback areas |

**Fields** (all sublayers share same schema):

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (5) | Hazard identifier |
| `name` | String (50) | Bushfire hazard name |
| `description` | String (500) | Hazard description |
| `value` | String (50) | Risk classification value |
| `legalstartdate` | Date | Legal commencement date |
| `legalenddate` | Date | Legal end date |
| `status` | SmallInteger | Status code |

**Use Case**: Identify bushfire risk levels for BAL assessment and AS 3959 compliance requirements.

**Note**: SA uses a 6-tier bushfire risk system, more granular than NSW's 3-category system.

---

### Heritage

| Property | Value |
|----------|-------|
| **Endpoint** | `CurrentPDC_wmas/MapServer/18` (Group) |
| **Full URL** | `https://location.sa.gov.au/server6/rest/services/ePlanningPublic/CurrentPDC_wmas/MapServer/18` |
| **Type** | Group Layer (contains 6 sublayers) |
| **CRS** | EPSG:3857 (Web Mercator) |
| **Max Records** | 2,000 per sublayer |
| **Legal Basis** | Heritage Places Act 1993 |

**Note**: Layer 18 is a GROUP layer. Query individual sublayers for specific heritage types.

**Heritage Sublayers**:

| Layer ID | Name | Description |
|----------|------|-------------|
| 19 | Historic Area | Historic conservation areas |
| 20 | Historic Shipwrecks | Maritime heritage sites |
| 21 | Heritage Adjacency | Properties adjacent to heritage items |
| 22 | Local Heritage Place | Council-listed heritage places |
| 23 | State Heritage Area | State-significant heritage areas |
| 24 | State Heritage Place | State Heritage Register places |

**Fields** (all sublayers share same schema):

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (5) | Heritage identifier |
| `name` | String (50) | Heritage place name |
| `description` | String (500) | Heritage description |
| `value` | String (50) | Heritage classification |
| `legalstartdate` | Date | Legal commencement date |
| `legalenddate` | Date | Legal end date |
| `status` | SmallInteger | Status code |

**Heritage Levels**:

| Level | Description |
|-------|-------------|
| State Heritage Place | Highest protection - State Heritage Register |
| State Heritage Area | State-significant precincts |
| Local Heritage Place | Council-listed heritage items |
| Heritage Adjacency | Properties affecting heritage settings |
| Historic Area | Local character/historic areas |
| Historic Shipwrecks | Commonwealth/State maritime heritage |

**Use Case**: Identify heritage constraints affecting development and approval requirements under the Heritage Places Act 1993.

---

## Property Field Mappings by Layer

Different ArcGIS MapServers use varying property names. Key classification fields per layer:

| Layer | QLD | NSW | VIC | WA | ACT | SA |
|-------|-----|-----|-----|-----|-----|-----|
| Land Use/Zones | `primary_` | `LAY_CLASS` | Zone code (GRZ) | `zone`, `zone_numbe` | `LAND_USE_ZONE_CODE_ID` | `name`, `value` |
| Flood Hazard | `sub_name` | `LAY_CLASS` | AEP layers | `EST_ARI`, `EVENT` | Extent only | `name`, `value` |
| Bushfire/Fire | `zone` | `Category` | `FIRETYPE` | `designation`, `type` | `ELEM_TEXT` | `name`, `value` |
| Heritage | `placename` | `H_NAME` | HO sublayer | `place_name`, `place_no` | `NAME`, `HRcategory` | `name`, `value` |
| Density Code | N/A | N/A | N/A | `rcode_no` (R-Codes) | N/A | N/A |

### Cross-State Field Comparison

| Aspect | NSW | QLD | VIC | WA | ACT | SA |
|--------|-----|-----|-----|-----|-----|-----|
| CRS | EPSG:4326 | EPSG:3857 | EPSG:3111 | EPSG:4326 | EPSG:7855 | EPSG:3857 |
| LGA identifier | `LGA_NAME` | `lga_code` | Spatial query | `lga` | `DIVISION_NAME` | Spatial query |
| Data source | `EPI_NAME` | `source` | Scheme | `scheme_nam` | `GAZETTAL_NUMBER` | `legalstartdate` |
| Zone codes | R2, B3 | Descriptive | GRZ, NRZ | Descriptive + Number | RZ1, CZ1 | Descriptive |
| Layer structure | Feature | Feature | Group | Feature | Feature | Group |
| Legal framework | EP&A Act 1979 | Planning Act 2016 | P&E Act 1987 | P&D Act 2005 | P&D Act 2007 | PDI Act 2016 |
| Density system | Zone-based | Zone-based | Zone-based | R-Codes (unique) | Zone-based | Zone-based |
| Max records | 2,000 | 2,000 | 1,000 | 10,000 | 2,000 | 2,000 |

---

## ArcGIS REST API Patterns

### URL Structure

```
https://{server}/arcgis/rest/services/{folder}/{service}/MapServer/{layerId}
```

### Query Endpoint

Append `/query` to fetch features:
```
{layerUrl}/query?where=1=1&outFields=*&f=geojson&geometry={bbox}
```

### Legend Endpoint

Replace layer ID with `/legend`:
```
{baseUrl}/MapServer/legend?f=pjson
```

---

## Technical Specifications

| Specification | Value |
|---------------|-------|
| **Target CRS** | EPSG:7844 (GDA2020) for storage |
| **Display CRS** | EPSG:3857 (Web Mercator) |
| **Max Records** | 2000 per query (implement pagination) |
| **Supported Formats** | JSON, GeoJSON, PBF |
| **Min Zoom** | 10 (for performance) |

---

## Known Limitations

### Data Inconsistencies

- **Property naming**: Different servers use different field names for classification
- **Zone codes**: NSW uses alphanumeric codes (R1, B2), QLD uses descriptive names, ACT uses RZ1/CZ1 format
- **Geometry precision**: Varies by council and data source
- **Update frequency**: Ranges from daily to annually depending on source

### Cross-State Differences

| Aspect | NSW | QLD | VIC | WA | ACT | SA |
|--------|-----|-----|-----|-----|-----|-----|
| Residential zones | R1-R5 | Descriptive | GRZ, NRZ, RGZ | Zone + R-Code | RZ1-RZ5 | Neighbourhood |
| Classification field | `LAY_CLASS` | `primary_` | Zone abbrev | `zone`, `rcode_no` | `LAND_USE_ZONE_CODE_ID` | `name` |
| Data currency | Weekly | Varies | Varies | Varies | Varies | Varies |
| Layer type | Feature | Feature | Group | Feature | Feature | Group |
| CRS | EPSG:4326 | EPSG:3857 | EPSG:3111 | EPSG:4326 | EPSG:7855 | EPSG:3857 |
| Unique feature | LEP-based | ALUMC | Sublayers | R-Codes | Territory Plan | P&D Code |

### Service Availability

- ArcGIS REST services may experience downtime
- CORS policies can block browser access
- Some endpoints require authentication
- Rate limiting may apply

### Performance Considerations

- Legend fetch adds 200-500ms latency
- Layers with 10,000+ features can cause lag
- Complex geometries (coastlines) impact rendering
- Currently limited to one active layer at a time

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| [PLANNING-DATA-STRATEGY.md](./PLANNING-DATA-STRATEGY.md) | Full ingestion strategy and all endpoints |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture |
| [DATA-INDICATORS.md](./DATA-INDICATORS.md) | Market data definitions |
| [ADR-001](./adr/001-queensland-planning-data-endpoints.md) | Queensland endpoint decisions |
| [ADR-002](./adr/002-nsw-planning-data-endpoints.md) | NSW endpoint decisions |
| [ADR-003](./adr/003-victoria-planning-data-endpoints.md) | Victoria endpoint decisions |
| [ADR-004](./adr/004-western-australia-planning-data-endpoints.md) | Western Australia endpoint decisions |
| [ADR-005](./adr/005-act-planning-data-endpoints.md) | ACT endpoint decisions |
| [ADR-006](./adr/006-south-australia-planning-data-endpoints.md) | South Australia endpoint decisions |

---

*Last Updated: January 2026*
*Status: Validated - QLD, NSW, VIC, WA, ACT, and SA State Endpoints Confirmed*
