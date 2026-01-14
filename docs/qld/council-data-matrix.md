# Queensland Council GIS Data Matrix

> Comprehensive matrix of GIS/ArcGIS endpoints for Queensland's 77 local government areas.

## Overview

Queensland uses a **decentralized planning system** where each council maintains its own planning scheme data. This matrix documents the data access methods available for each council.

**Access Types:**
- **ArcGIS REST**: Direct ArcGIS REST MapServer/FeatureServer endpoints (best for automation)
- **ArcGIS Hub**: ArcGIS Online Hub or Open Data portal
- **Geocortex**: Geocortex-based mapping portal
- **WFS/WMS**: OGC web services
- **Interactive**: Web-based interactive mapping only (not programmatic)
- **PDF Only**: Only PDF maps available
- **Unknown**: Requires further investigation

---

## South East Queensland (SEQ) - High Priority

| Council | Population | Access Type | Endpoint/Portal | Planning Services | Status |
|---------|------------|-------------|-----------------|-------------------|--------|
| **Brisbane City** | 1,200,000 | ArcGIS Hub | `https://spatial-brisbane.opendata.arcgis.com/` | Open Data | ✅ |
| **Brisbane City** | - | Open Data | `https://www.spatial-data.brisbane.qld.gov.au/` | Alternative | ✅ |
| **Gold Coast City** | 600,000 | ArcGIS REST | `https://maps.cityofgoldcoast.com.au/arcgis/rest/services/` | City Plan | Found |
| **Moreton Bay Regional** | 500,000 | ArcGIS REST | `https://gis.moretonbay.qld.gov.au/arcgis/rest/services/` | Multiple folders | Found |
| **Sunshine Coast** | 350,000 | ArcGIS REST | `https://services-ap1.arcgis.com/YQyt7djuXN7rQyg4/arcgis/rest/services/` | 80+ layers | ✅ |
| **Sunshine Coast (Legacy)** | - | ArcGIS REST | `https://gislegacy.scc.qld.gov.au/arcgis/rest/services/PlanningCadastre/` | Zones, Overlays | ✅ |
| **Logan City** | 340,000 | ArcGIS REST | `https://arcgis.lcc.wspdigital.com/server/rest/services/LoganHub/Logan_Planning_Scheme_v9_1_TLPI_20241030/MapServer` | 387 layers | ✅ |
| **Ipswich City** | 230,000 | WFS | data.gov.au | WFS available | ✅ |
| **Redland City** | 160,000 | ArcGIS REST | `https://gis.redland.qld.gov.au/arcgis/rest/services/planning/city_plan/MapServer` | City Plan | ✅ |
| **Noosa Shire** | 55,000 | ArcGIS StoryMaps | `https://storymaps.arcgis.com/collections/effa39321b984f94a4ccee16f7588ba4` | Limited | Found |
| **Scenic Rim Regional** | 45,000 | ArcGIS REST | `https://esriprod.scenicrim.qld.gov.au/arcgis/rest/services/EPlan_Scenic_Rim_Planning_Scheme/MapServer` | 210+ layers | ✅ |
| **Lockyer Valley Regional** | 42,000 | Interactive | Council website | Needs investigation | ⚠️ |
| **Somerset Regional** | 25,000 | ArcGIS Online | `https://somerset.maps.arcgis.com/` | Limited | Found |

---

## Darling Downs & South West

| Council | Population | Access Type | Endpoint/Portal | Planning Services | Status |
|---------|------------|-------------|-----------------|-------------------|--------|
| **Toowoomba Regional** | 175,000 | ArcGIS REST | `https://maps.tr.qld.gov.au/arcgis/rest/services/External/External_PlanningScheme/MapServer` | 170+ layers | ✅ |
| Southern Downs Regional | 35,000 | Unknown | - | Needs investigation | ⚠️ |
| Western Downs Regional | 35,000 | Unknown | - | Needs investigation | ⚠️ |
| Goondiwindi Regional | 12,000 | Unknown | - | Needs investigation | ⚠️ |
| Maranoa Regional | 13,000 | Unknown | - | Needs investigation | ⚠️ |
| Balonne Shire | 4,500 | Unknown | - | Likely PDF only | ⚠️ |
| Paroo Shire | 1,800 | Unknown | - | Likely PDF only | ⚠️ |
| Bulloo Shire | 400 | Unknown | - | Likely PDF only | ⚠️ |
| Quilpie Shire | 900 | Unknown | - | Likely PDF only | ⚠️ |
| Murweh Shire | 4,500 | Unknown | - | Likely PDF only | ⚠️ |

---

## Wide Bay-Burnett

| Council | Population | Access Type | Endpoint/Portal | Planning Services | Status |
|---------|------------|-------------|-----------------|-------------------|--------|
| **Bundaberg Regional** | 100,000 | ArcGIS REST | `https://mappingdata.bundaberg.qld.gov.au/arcgis/rest/services/` | 50+ services | ✅ |
| **Fraser Coast Regional** | 105,000 | Interactive | `https://pdonline.frasercoast.qld.gov.au/` | Needs investigation | ⚠️ |
| **Gympie Regional** | 55,000 | Custom | `https://maps.gympie.qld.gov.au/` | Interactive mapping | Found |
| North Burnett Regional | 10,500 | Unknown | - | Needs investigation | ⚠️ |
| South Burnett Regional | 32,000 | Unknown | - | Needs investigation | ⚠️ |

---

## Central Queensland

| Council | Population | Access Type | Endpoint/Portal | Planning Services | Status |
|---------|------------|-------------|-----------------|-------------------|--------|
| **Rockhampton Regional** | 85,000 | ArcGIS REST | `https://arcgismaps-prod.rockhamptonregion.qld.gov.au/arcgis/rest/services/` | Multiple | Found |
| **Rockhampton Regional** | - | Geocortex | `https://maps.rockhamptonregion.qld.gov.au/Geocortex/` | Interactive | Found |
| **Gladstone Regional** | 65,000 | Interactive | Council website | Needs investigation | ⚠️ |
| Livingstone Shire | 40,000 | Unknown | - | Needs investigation | ⚠️ |
| Central Highlands Regional | 28,000 | Unknown | - | Needs investigation | ⚠️ |
| Banana Shire | 14,000 | Unknown | - | Likely PDF only | ⚠️ |
| Woorabinda Aboriginal Shire | 1,000 | Unknown | - | Special case | ⚠️ |

---

## Mackay-Whitsunday

| Council | Population | Access Type | Endpoint/Portal | Planning Services | Status |
|---------|------------|-------------|-----------------|-------------------|--------|
| **Mackay Regional** | 120,000 | ArcGIS REST | `https://arcgis.mackay.qld.gov.au/server/rest/services/` | Enterprise | ✅ |
| Whitsunday Regional | 35,000 | Unknown | - | Needs investigation | ⚠️ |
| Isaac Regional | 20,000 | Unknown | - | Needs investigation | ⚠️ |

---

## North Queensland

| Council | Population | Access Type | Endpoint/Portal | Planning Services | Status |
|---------|------------|-------------|-----------------|-------------------|--------|
| **Townsville City** | 195,000 | ArcGIS Hub | `https://data-tsvcitycouncil.opendata.arcgis.com/` | Open Data | ✅ |
| **Cairns Regional** | 165,000 | Interactive | CairnsPlan 2016 interactive | Needs REST endpoint | ⚠️ |
| Burdekin Shire | 17,000 | Unknown | - | Needs investigation | ⚠️ |
| Charters Towers Regional | 12,000 | Unknown | - | Needs investigation | ⚠️ |
| Hinchinbrook Shire | 11,000 | Unknown | - | Needs investigation | ⚠️ |
| Palm Island Aboriginal Shire | 2,500 | Unknown | - | Special case | ⚠️ |

---

## Far North Queensland

| Council | Population | Access Type | Endpoint/Portal | Planning Services | Status |
|---------|------------|-------------|-----------------|-------------------|--------|
| **Cassowary Coast Regional** | 30,000 | Interactive/ePlan | Council ePlan system | Custom | Found |
| Tablelands Regional | 25,000 | Unknown | - | Needs investigation | ⚠️ |
| Mareeba Shire | 22,000 | Unknown | - | Needs investigation | ⚠️ |
| Douglas Shire | 12,000 | Unknown | - | Needs investigation | ⚠️ |
| Cook Shire | 4,500 | Unknown | - | Likely PDF only | ⚠️ |
| Yarrabah Aboriginal Shire | 2,500 | Unknown | - | Special case | ⚠️ |
| Wujal Wujal Aboriginal Shire | 300 | Unknown | - | Special case | ⚠️ |
| Hope Vale Aboriginal Shire | 1,000 | Unknown | - | Special case | ⚠️ |
| Lockhart River Aboriginal Shire | 600 | Unknown | - | Special case | ⚠️ |
| Mapoon Aboriginal Shire | 300 | Unknown | - | Special case | ⚠️ |
| Napranum Aboriginal Shire | 1,000 | Unknown | - | Special case | ⚠️ |
| Northern Peninsula Area Regional | 2,500 | Unknown | - | Special case | ⚠️ |
| Pormpuraaw Aboriginal Shire | 700 | Unknown | - | Special case | ⚠️ |
| Kowanyama Aboriginal Shire | 1,200 | Unknown | - | Special case | ⚠️ |
| Aurukun Shire | 1,500 | Unknown | - | Special case | ⚠️ |

---

## Gulf & Western Queensland

| Council | Population | Access Type | Endpoint/Portal | Planning Services | Status |
|---------|------------|-------------|-----------------|-------------------|--------|
| Mount Isa City | 18,000 | Unknown | - | Needs investigation | ⚠️ |
| Cloncurry Shire | 3,500 | Unknown | - | Likely PDF only | ⚠️ |
| McKinlay Shire | 900 | Unknown | - | Likely PDF only | ⚠️ |
| Richmond Shire | 800 | Unknown | - | Likely PDF only | ⚠️ |
| Flinders Shire | 1,600 | Unknown | - | Likely PDF only | ⚠️ |
| Carpentaria Shire | 2,000 | Unknown | - | Likely PDF only | ⚠️ |
| Burke Shire | 500 | Unknown | - | Likely PDF only | ⚠️ |
| Doomadgee Aboriginal Shire | 1,500 | Unknown | - | Special case | ⚠️ |
| Mornington Shire | 1,200 | Unknown | - | Special case | ⚠️ |
| Boulia Shire | 500 | Unknown | - | Likely PDF only | ⚠️ |
| Diamantina Shire | 300 | Unknown | - | Likely PDF only | ⚠️ |
| Barcoo Shire | 300 | Unknown | - | Likely PDF only | ⚠️ |
| Longreach Regional | 4,000 | Unknown | - | Needs investigation | ⚠️ |
| Winton Shire | 1,200 | Unknown | - | Likely PDF only | ⚠️ |
| Barcaldine Regional | 3,000 | Unknown | - | Likely PDF only | ⚠️ |
| Blackall-Tambo Regional | 2,000 | Unknown | - | Likely PDF only | ⚠️ |
| Etheridge Shire | 800 | Unknown | - | Likely PDF only | ⚠️ |
| Croydon Shire | 300 | Unknown | - | Likely PDF only | ⚠️ |

---

## Torres Strait

| Council | Population | Access Type | Endpoint/Portal | Planning Services | Status |
|---------|------------|-------------|-----------------|-------------------|--------|
| Torres Shire | 4,000 | Unknown | - | Special case | ⚠️ |
| Torres Strait Island Regional | 4,500 | Unknown | - | Special case | ⚠️ |

---

## Summary Statistics

| Category | Count | Percentage |
|----------|-------|------------|
| **Tier 1: ArcGIS REST** | 11 | 14% |
| **Tier 2: ArcGIS Hub/Online** | 5 | 6% |
| **Tier 3: Geocortex/Custom** | 4 | 5% |
| **Tier 4: WFS/WMS** | 1 | 1% |
| **Needs Investigation** | ~56 | 74% |

---

## Common URL Patterns

When investigating councils, try these URL patterns:

```
https://gis.[council].qld.gov.au/arcgis/rest/services/
https://maps.[council].qld.gov.au/arcgis/rest/services/
https://arcgis.[council].qld.gov.au/arcgis/rest/services/
https://[council].maps.arcgis.com/
https://services-ap1.arcgis.com/[orgId]/arcgis/rest/services/
```

---

## Notes

1. **Aboriginal Shire Councils**: Many remote Aboriginal shire councils may not have digital planning data available and may require direct contact with the council.

2. **Small Rural Shires**: Councils with populations under 5,000 often only provide PDF planning scheme maps.

3. **Population Data**: Approximate 2021 Census figures.

4. **Status Legend**:
   - ✅ Validated - Endpoint confirmed working
   - Found - Endpoint identified but not fully validated
   - ⚠️ Needs investigation - No endpoint found yet

---

## Last Updated

2026-01-12
