# Research Report: Land Use Zone Datasources for NSW and QLD

## Executive Summary

**NSW** has a well-established, centralized zoning data system with multiple access methods (WFS, WMS, ArcGIS REST). **QLD** has a more fragmented system where planning zoning is largely council-specific, with state providing land use data (ALUMC) rather than detailed zoning classifications.

---

## 1. NEW SOUTH WALES (NSW)

### Primary Data Source: NSW Planning Portal

**ArcGIS REST Endpoint:**

- **Base URL**: `https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/EPI_Primary_Planning_Layers/MapServer`
- **Land Zoning Layer**: Layer ID 2 (`Land Zoning`)
- **Spatial Reference**: EPSG:4283 (GDA94)
- **Supported Formats**: JSON, geoJSON
- **Max Record Count**: 10,000 features per query
- **Min/Max Scale**: 500,000 to 0

**WFS Endpoint:**

- **URL**: `https://mapprod3.environment.nsw.gov.au/arcgis/services/Planning/EPI_Primary_Planning_Layers/MapServer/WFSServer?request=GetCapabilities&service=WFS`
- **Data.NSW Dataset**: [Environmental Planning Instrument - Land Zoning](https://data.nsw.gov.au/data/dataset/environment-planning-instrument-local-environmental-plan-land-zoning)
- **Update Frequency**: Weekly
- **Data Format**: GeoJSON, Shapefile (via contact)

**SEED NSW Open Data:**

- **Dataset Page**: [SEED NSW - Environmental Planning Instrument Land Zoning](https://datasets.seed.nsw.gov.au/dataset/environment-planning-instrument-local-environmental-plan-land-zoning)
- **WFS URL**: `/EPI_Primary_Planning_Layers/MapServer/WFSServer?request=GetCapabilities&service=WFS`

### NSW Zone Classification System

**Broad Categories:**

- **R** - Residential (R1, R2, R3, R4, R5)
- **B** - Business (B1, B2, B3, B4, B5, B6, B7, B8)
- **IN** - Industrial (IN1, IN2, IN3)
- **E** - Environment/Conservation (E1, E2, E3, E4)
- **RE** - Recreation (RE1, RE2)
- **RU** - Rural (RU1, RU2, RU3, RU4, RU5, RU6)
- **SP** - Special Purpose (SP1, SP2, SP3, SP4)
- **W** - Waterways (W1, W2)

**Key Zone Codes (Standard Instrument LEP):**

| Zone Code | Description                | Primary Uses                                                                             |
| --------- | -------------------------- | ---------------------------------------------------------------------------------------- |
| **R1**    | General Residential        | Detached houses, multi-dwelling housing, residential flat buildings, neighbourhood shops |
| **R2**    | Low Density Residential    | Detached dwelling houses primarily, restricted supporting uses                           |
| **R3**    | Medium Density Residential | Medium-density housing, terraces, townhouses                                             |
| **R4**    | High Density Residential   | Residential flat buildings, high-density housing                                         |
| **B1**    | Neighbourhood Centre       | Small-scale convenience retail, services                                                 |
| **B2**    | Local Centre               | Medium-scale retail, commercial services                                                 |
| **IN1**   | Light Industrial           | Light industrial, warehousing                                                            |
| **E1**    | Environmental Conservation | National parks, conservation areas                                                       |

**Key Data Fields (from ArcGIS REST schema):**

- `LAY_CLASS` - Zone code (e.g., "R1", "R2", "B1")
- `LABEL` - Zone name/description
- `LGA_NAME` - Local Government Area name
- `EPI_Name` - Environmental Planning Instrument name (LEP)
- `OBJECTID` - Unique identifier
- `SHAPE` - Polygon geometry

### Access Methods for NSW

1. **WFS (Web Feature Service)** - Recommended for programmatic access
2. **ArcGIS REST API** - Direct JSON/GeoJSON queries
3. **WMS (Web Map Service)** - For visualization only
4. **Shapefile Download** - Via contact/SEED portal

---

## 2. QUEENSLAND (QLD)

### Primary Data Sources

**Important Note:** QLD does not have a centralized zoning system like NSW. Zoning is managed by individual local governments (councils). The state provides land use data, not detailed planning zones.

#### State-Level Land Use Data (Not Planning Zoning)

**ArcGIS REST Endpoint:**

- **Base URL**: `https://spatial-gis.information.qld.gov.au/arcgis/rest/services/PlanningCadastre/LandUse/MapServer`
- **Layer**: `Queensland Land Use - Current` (Layer ID 0)
- **Spatial Reference**: EPSG:3857 (Web Mercator)
- **Supported Formats**: JSON, geoJSON, PBF
- **Max Record Count**: 5,000 features per query
- **Data Updated**: June 2019
- **Tiled Service**: Yes (20 levels of detail, cached)

**Classification System:**

- **Standard**: Australian Land Use and Management Classification (ALUMC)
- **Program**: Australian Collaborative Land Use and Management Program (ACLUMP)
- **Purpose**: National land use mapping consistency
- **Type**: Land use classification, not planning zoning

**Not Planning Zones:** This dataset describes current land use (e.g., "agriculture crops", "residential dwellings"), not planning zoning (e.g., "LDR", "MDR").

#### Council-Specific Planning Zoning

**SPP Interactive Mapping System:**

- **Portal**: [SPP IMS](https://planning.dsdmip.qld.gov.au/maps?type=spp)
- **Purpose**: Defines matters of State interest (State Development Areas, Priority Development Areas)
- **Data**: State-level planning matters, not local zoning
- **Format**: WMS, Interactive mapping

**DAMS (Development Assessment Mapping System):**

- **Portal**: [DAMS Mapping](https://www.planning.qld.gov.au/planning-framework/mapping)
- **Purpose**: Development assessment triggers and referrals
- **Format**: Interactive mapping, limited API access

**Data.Qld.Gov.Au:**

- **Dataset**: [Land Use Mapping Series](https://www.data.qld.gov.au/dataset/land-use-mapping-series)
- **Formats**: ESRI Geodatabase, Spatial Data Format
- **Content**: Regional and time-series land use maps
- **No Direct WFS**: Primarily downloadable files

### QLD Zone Classification (Council-Specific)

**Common Zone Codes (examples from various councils):**

| Zone Code        | Description                    | Council Examples              |
| ---------------- | ------------------------------ | ----------------------------- |
| **LDR / LD RES** | Low Density Residential        | Logan, Redland, Brisbane      |
| **MDR / MD RES** | Medium Density Residential     | Logan, Redland, Brisbane      |
| **LDMR**         | Low-Medium Density Residential | Brisbane                      |
| **MU / MU IND**  | Mixed Use                      | Logan, various councils       |
| **TA**           | Traditional Housing            | Brisbane (specific precincts) |

**Key Finding:** Zone codes vary significantly between councils. No statewide standardization like NSW's Standard Instrument LEP.

**Council-Specific Zoning Sources:**

- **Brisbane City Plan 2014**: Residential zones with precincts
  - URL: https://www.brisbane.qld.gov.au/planning-and-building/planning-guidelines-and-tools/brisbane-city-plan-2014/supporting-information/residential-zones-and-zone-precincts
  - Zones: LDR, LDMR, MDR, Traditional Housing (TA)

- **Logan Planning Scheme 2015**: LD RES, MD RES, MU IND codes
  - URL: https://www.logan.qld.gov.au/downloads/file/2408/fact-sheet-zone-descriptions
  - Zones: Low Density Residential (LD RES), Medium Density Residential (MD RES), Mixed Use (MU IND)

- **Redland City Plan**: LDR, MDR, LMDR codes
  - URL: https://yoursay.redland.qld.gov.au/mdr-review
  - Zones: Low Density Residential (LDR), Medium Density Residential (MDR)

### Access Methods for QLD

1. **Council Planning Schemes** - Primary source for actual zoning
2. **SPP IMS** - State planning matters only (WMS)
3. **DAMS** - Development assessment triggers (interactive only)
4. **Data.Qld.Gov.Au** - Land use data, not zoning

---

## 3. Key Challenges & Recommendations

### NSW - Advantages

✅ Centralized, standardized zoning system
✅ Multiple access methods (WFS, REST, Shapefile)
✅ Weekly updates
✅ Comprehensive documentation
✅ Standard Instrument LEP statewide

### QLD - Challenges

❌ Fragmented system (council-specific)
❌ No statewide zoning WFS endpoint
❌ Land use data ≠ Planning zoning
❌ Councils use different zone codes
❌ Limited programmatic access to zoning

### QLD - Recommended Approach

1. **Council-by-council approach**: Each council has its own planning scheme
2. **Manual data ingestion**: Most councils don't provide WFS/WMS for zoning
3. **Council consultation**: Need to contact each council for zoning data
4. **Start with major councils**: Brisbane, Gold Coast, Sunshine Coast, Logan

---

## 4. Codebase Findings

### Current State

- **No planning zone tables** in Prisma schema
- **No MCP servers** for planning/zoning data
- **No PostGIS geometry schemas** for planning
- **Existing MCP servers**: `mcp-domain`, `mcp-realestate`, `mcp-market-data` (property data only)

### Existing Patterns

- **Market data MCP**: Uses mock mode vs real API pattern
- **Zod schemas**: Used for type validation
- **Property model**: Includes latitude/longitude but no planning attributes
- **No geospatial infrastructure**: PostGIS not currently used

---

## 5. Data Format Comparison

| Aspect                  | NSW                             | QLD                                  |
| ----------------------- | ------------------------------- | ------------------------------------ |
| **Format**              | WFS, GeoJSON, Shapefile         | WMS, Geodatabase (no WFS for zoning) |
| **Standardization**     | Statewide (Standard Instrument) | Council-specific                     |
| **Update Frequency**    | Weekly                          | Varies by council                    |
| **Programmatic Access** | Excellent                       | Poor to none                         |
| **CRS**                 | EPSG:4283 (GDA94)               | EPSG:3857 (Web Mercator)             |
| **Polygon Count**       | ~400,000+ (estimated)           | Unknown (council-specific)           |

---

## 6. Recommendations for Propure

### Immediate Actions (NSW First)

1. **Priority 1**: Implement NSW zoning ingestion (WFS endpoint available)
2. **Use Python + GeoPandas** as outlined in PLANNING-DATA-STRATEGY.md
3. **Create PostGIS tables** for planning zones (schema defined in strategy doc)
4. **Start with Greater Sydney** as pilot region

### QLD Approach

1. **Research major councils**: Brisbane, Gold Coast, Sunshine Coast, Logan first
2. **Contact council GIS teams** for zoning data access
3. **Council-specific MCP servers** may be needed
4. **Consider manual ingestion** where APIs don't exist

### Technical Stack

- **NSW**: WFS → GeoPandas → PostGIS (streamlined)
- **QLD**: Council-specific → Varying formats → PostGIS (complex)

---

## 7. Implementation Priority

| Priority | State                | Complexity | Datasource Quality | Recommended Approach        |
| -------- | -------------------- | ---------- | ------------------ | --------------------------- |
| **1**    | NSW                  | Medium     | Excellent          | Implement WFS ingestion     |
| **2**    | Victoria             | Medium     | Good (VicPlan)     | Similar to NSW              |
| **3**    | QLD                  | High       | Poor               | Council-by-council approach |
| **4**    | WA, SA, TAS, NT, ACT | Varies     | Mixed              | Evaluate per state          |

---

## 8. Data Sources Reference

### NSW Data Sources

1. **Primary**:
   - ArcGIS REST: `https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/EPI_Primary_Planning_Layers/MapServer`
   - WFS: `https://mapprod3.environment.nsw.gov.au/arcgis/services/Planning/EPI_Primary_Planning_Layers/MapServer/WFSServer`
   - Data.NSW: `https://data.nsw.gov.au/data/dataset/environment-planning-instrument-local-environmental-plan-land-zoning`
   - SEED NSW: `https://datasets.seed.nsw.gov.au/dataset/environment-planning-instrument-local-environmental-plan-land-zoning`

2. **Documentation**:
   - NSW Planning Portal Open Data
   - Standard Instrument LEP Practice Notes
   - Planning Practice Note PN 11-002

### QLD Data Sources

1. **State-Level (Land Use, Not Zoning)**:
   - Land Use ArcGIS: `https://spatial-gis.information.qld.gov.au/arcgis/rest/services/PlanningCadastre/LandUse/MapServer`
   - SPP IMS: `https://planning.dsdmip.qld.gov.au/maps?type=spp`
   - DAMS: `https://www.planning.qld.gov.au/planning-framework/mapping`
   - Data.Qld.Gov.Au: `https://www.data.qld.gov.au/dataset/land-use-mapping-series`

2. **Council-Specific (Zoning)**:
   - Brisbane City Plan 2014
   - Logan Planning Scheme 2015
   - Redland City Plan
   - Gold Coast Planning Scheme (TBD)
   - Sunshine Coast Planning Scheme (TBD)

---

**End of Research Report**

_Generated: 2026-01-09_
_Status: Research Phase 1 Complete_
