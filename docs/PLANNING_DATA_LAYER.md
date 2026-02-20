# Planning Data Layer Documentation

Planning and hazard data layers from Australian state government ArcGIS REST services.

---

## Quick Reference

| State | Zones | Flood | Bushfire | Heritage | CRS | Max Records |
|-------|-------|-------|----------|----------|-----|-------------|
| QLD | MapServer/0 | MapServer/15 | MapServer/14 | MapServer/78 | EPSG:3857 | 2,000 |
| NSW | MapServer/2 | MapServer/230 | MapServer/229 | MapServer/0 | EPSG:4326 | 2,000 |
| VIC | MapServer/2 (Group) | MapServer/13 | MapServer/47 | MapServer/6 (Group) | EPSG:3111 | 1,000 |
| WA | MapServer/112 | MapServer/57 | MapServer/17 | MapServer/16 | EPSG:4326 | 10,000 |
| ACT | FeatureServer/1 | FeatureServer/0 | FeatureServer/0 | FeatureServer/1 | EPSG:7855 | 2,000 |
| SA | MapServer/114 | MapServer/7 | MapServer/8 (Group) | MapServer/18 (Group) | EPSG:3857 | 2,000 |

---

## Queensland

**Base URL**: `https://spatial-gis.information.qld.gov.au/arcgis/rest/services/`

| Layer | Endpoint | Key Fields |
|-------|----------|------------|
| Land Use | `PlanningCadastre/LandUse/MapServer/0` | `primary_`, `secondary`, `alum_code` |
| Flood | `Boundaries/AdminBoundariesFramework/MapServer/15` | `sub_name`, `currency` |
| Bushfire | `Boundaries/AdminBoundariesFramework/MapServer/14` | `zone`, `frequency` |
| Heritage | `Boundaries/AdminBoundariesFramework/MapServer/78` | `placename`, `place_id`, `status` |

---

## NSW

**Base URL**: `https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/`

| Layer | Endpoint | Key Fields |
|-------|----------|------------|
| Zones | `Planning/EPI_Primary_Planning_Layers/MapServer/2` | `LAY_CLASS`, `LGA_NAME`, `EPI_NAME` |
| Flood | `ePlanning/Planning_Portal_Hazard/MapServer/230` | `LAY_CLASS`, `LGA_NAME` |
| Bushfire | `ePlanning/Planning_Portal_Hazard/MapServer/229` | `Category`, `d_Category` |
| Heritage | `Planning/EPI_Primary_Planning_Layers/MapServer/0` | `H_NAME`, `SIG`, `LAY_CLASS` |

**Zone Prefixes**: R (Residential), B (Business), IN (Industrial), E (Environment), RE (Recreation), RU (Rural), SP (Special), W (Waterway)

---

## Victoria

**Planning Portal**: `https://plan-gis.mapshare.vic.gov.au/arcgis/rest/services/`
**Emergency**: `https://emapdev.ffm.vic.gov.au/arcgis/rest/services/`

| Layer | Endpoint | Key Fields |
|-------|----------|------------|
| Zones | `Planning/Vicplan_PlanningSchemeZones/MapServer/2` | Zone code (GRZ, NRZ, etc.) |
| Flood | `Victorian_Flood_Database/MapServer/13` | `HEIGHT`, `ARI`, `RELIABILITY` |
| Bushfire | `vsw_fire_management/MapServer/47` | `FIRETYPE`, `NAME`, `AREA_HA` |
| Heritage | `Planning/Vicplan_PlanningSchemeOverlays/MapServer/6` | HO sublayer |

**Group Layer Note**: Zones (Layer 2) and Heritage (Layer 6) are GROUP layers - query sublayers for features.

**Zone Sublayers** (Layer 2):
| ID | Zones |
|----|-------|
| 2 | Residential (LDRZ, MUZ, TZ, RGZ, NRZ, GRZ, HCTZ) |
| 3 | Industrial (IN1Z, IN2Z, IN3Z) |
| 4 | Commercial (C1Z, C2Z, C3Z) |
| 5 | Rural (FZ, GWZ, RAZ, RCZ, RLZ, RUZ) |

---

## Western Australia

**Base URL**: `https://public-services.slip.wa.gov.au/public/rest/services/SLIP_Public_Services/`

| Layer | Endpoint | Key Fields |
|-------|----------|------------|
| Zones | `Property_and_Planning/MapServer/112` | `zone`, `zone_numbe`, `lga` |
| R-Codes | `Property_and_Planning/MapServer/111` | `rcode_no`, `scheme_nam` |
| Flood | `Water/MapServer/57` | `EVENT`, `EST_ARI` |
| Bushfire | `Bush_Fire_Prone_Areas/MapServer/17` | `designation`, `type` |
| Heritage | `People_and_Society/MapServer/16` | `place_name`, `place_no` |

**R-Code System** (unique to WA):
| R-Code | Min Lot Size |
|--------|--------------|
| R20 | 500 m² |
| R30 | 333 m² |
| R40 | 250 m² |
| R60 | 166 m² |

---

## ACT

**Base URL**: `https://services1.arcgis.com/E5n4f1VY84i0xSjy/ArcGIS/rest/services/`

| Layer | Endpoint | Key Fields |
|-------|----------|------------|
| Zones | `ACTGOV_TP_LAND_USE_ZONE/FeatureServer/1` | `LAND_USE_ZONE_CODE_ID`, `DIVISION_NAME` |
| Flood | `ACTGOV_FLOOD_EXTENT/FeatureServer/0` | Extent only |
| Fire Mgmt | `Fire_Management_Zones_2015_2019/FeatureServer/0` | `ELEM_TEXT`, `DESC_` |
| Heritage | `ACTGOV_Heritage_Register/FeatureServer/1` | `NAME`, `HRcategory`, `HRstatus` |

**Zone Codes**: RZ1-RZ5 (Residential), CZ1-CZ6 (Commercial), IZ1-IZ2 (Industrial), CFZ, PRZ1-PRZ2, TSZ1-TSZ2, NUZ

---

## South Australia

**Base URL**: `https://location.sa.gov.au/server6/rest/services/ePlanningPublic/`

| Layer | Endpoint | Key Fields |
|-------|----------|------------|
| Zones | `CurrentPDC_wmas/MapServer/114` | `name`, `value`, `id` |
| Flood | `ConsultFlooding/MapServer/7` | `name`, `value` |
| Bushfire | `CurrentPDC_wmas/MapServer/8` (Group) | `name`, `value` |
| Heritage | `CurrentPDC_wmas/MapServer/18` (Group) | `name`, `value` |

**Group Layer Note**: Zones use Layer 110 (group) containing Layer 114 (features). Bushfire and Heritage are also groups.

**Bushfire Sublayers** (Layer 8):
| ID | Risk Level |
|----|------------|
| 9 | Urban Interface (highest) |
| 10 | High Risk |
| 11 | Medium Risk |
| 12 | General Risk |
| 13 | Regional |
| 14 | Outback |

**Heritage Sublayers** (Layer 18):
| ID | Type |
|----|------|
| 19 | Historic Area |
| 22 | Local Heritage Place |
| 23 | State Heritage Area |
| 24 | State Heritage Place |

---

## Key Field Mappings

| Layer | QLD | NSW | VIC | WA | ACT | SA |
|-------|-----|-----|-----|-----|-----|-----|
| Zone class | `primary_` | `LAY_CLASS` | Zone code | `zone` | `LAND_USE_ZONE_CODE_ID` | `name` |
| Flood | `sub_name` | `LAY_CLASS` | `HEIGHT` | `EST_ARI` | Extent | `name` |
| Bushfire | `zone` | `Category` | `FIRETYPE` | `designation` | `ELEM_TEXT` | `name` |
| Heritage | `placename` | `H_NAME` | HO | `place_name` | `NAME` | `name` |

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| [ADR-001](./adr/001-queensland-planning-data-endpoints.md) | Queensland decisions |
| [ADR-002](./adr/002-nsw-planning-data-endpoints.md) | NSW decisions |
| [ADR-003](./adr/003-victoria-planning-data-endpoints.md) | Victoria decisions |
| [ADR-004](./adr/004-western-australia-planning-data-endpoints.md) | WA decisions |
| [ADR-005](./adr/005-act-planning-data-endpoints.md) | ACT decisions |
| [ADR-006](./adr/006-south-australia-planning-data-endpoints.md) | SA decisions |

---

*Last Updated: January 2026*
*Status: Validated - All State Endpoints Confirmed*
