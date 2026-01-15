# Planning Data Layer Implementation Documentation

## Overview

This application implements a dynamic, multi-jurisdictional planning data visualization system for Australia using ArcGIS MapServer and FeatureServer endpoints. The system displays various planning layers (land zoning, flood hazards, bushfire zones, heritage areas, etc.) on an interactive Leaflet map with automatic jurisdiction detection and layer management.

## Architecture

### Core Components

1. **MapContext** (`MapContext.tsx`) - Central state management for map interactions
2. **LeafletMap** (`LeafletMap.tsx`) - Main map rendering component
3. **Layer Registry** (`layers.ts`) - Configuration and metadata for all data sources
4. **Style Engine** (`styles.ts`) - Legend extraction and feature styling
5. **Utility Functions** (`utils.ts`) - Spatial calculations and data fetching

## How Layers Are Rendered

### 1. Layer Selection and Initialization

When a user selects a layer (e.g., "Flood Hazard") from the `MapLayersPopover`:

```typescript
setMapLayer(layer.id === "default" ? undefined : layer.id);
```

This triggers the `setMapLayer` function in `MapContext`:

```typescript
const setMapLayer = useCallback(async (layerId?: Layers) => {
  // 1. Remove existing layers
  if (layerRef.current) {
    removeMapLayers();
  }
  
  // 2. Get current map bounds
  const mapBounds = mapRef.current.getBounds();
  const bbBox: BBBox = {
    minLat: mapBounds.getSouth(),
    minLng: mapBounds.getWest(),
    maxLat: mapBounds.getNorth(),
    maxLng: mapBounds.getEast(),
  };
  
  // 3. Determine which jurisdictions are visible
  const auState = coordToAUStates(bbBox);
  
  // 4. Fetch appropriate layer configurations
  const layerData = getLayersForView(bbBox, layerId);
  
  // 5. Load legends and add layers to map
  // ...
}, []);
```

### 2. Jurisdiction Detection

The system uses bounding box intersection to determine which Australian states/territories are currently visible:

```typescript
export function coordToAUStates(view: BBBox): AustralianState[] {
  const V = normalizeBBox(view);
  const inView: AustralianState[] = [];

  for (const s in StateCoords) {
    const state = s as AustralianState;
    if (bboxesIntersect(V, StateCoords[state])) {
      inView.push(state);
    }
  }
  
  return inView;
}
```

**State Coordinates** are predefined bounding boxes:

```typescript
export const StateCoords: Record<AustralianState, BBBox> = {
  [AustralianState.NSW]: { minLat: -37.60, minLng: 140.99, maxLat: -28.15, maxLng: 153.64 },
  [AustralianState.QLD]: { minLat: -28.20, minLng: 138.00, maxLat: -10.00, maxLng: 153.64 },
  // ... other states
};
```

### 3. Layer Registry System

Each jurisdiction has its own `LayerInfo` configuration mapping layer types to ArcGIS endpoints:

```typescript
const NSW_LAYER_INFO: LayerInfo = {
  LANDIND_ZONES: {
    id: "NSW_LAND_ZONING",
    name: "NSW Land Zoning",
    url: "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/EPI_Primary_Planning_Layers/MapServer/2",
    coverage: "state",
    propertyKey: ["LAY_CLASS", "EPI_NAME", "LGA_NAME", ...],
    labelKey: "LAY_CLASS",
  },
  FLOOD_HAZARD: {
    id: "NSW_FLOOD_HAZARD",
    name: "NSW Flood Hazard",
    url: "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/Hazard/MapServer/1",
    // ...
  },
  // ... other layers
};
```

**Key Fields:**
- `id`: Unique identifier for this specific layer instance
- `name`: Display name for legends
- `url`: ArcGIS MapServer or FeatureServer endpoint
- `coverage`: "state" (entire state) or "lga" (local government area)
- `propertyKey`: Array of attribute field names to display in popups
- `labelKey`: Primary field used for categorization/legend matching
- `jurisdiction`: (Optional) Specific LGA this layer covers

### 4. Legend Extraction from ArcGIS

The system dynamically fetches legend data from ArcGIS services:

```typescript
export const handleLegendExtraction = async (url: string, groupName: string): Promise<Styles[]> => {
  const isFeatureServer = url.includes("/FeatureServer/");
  
  if (isFeatureServer) {
    // FeatureServer: Extract from drawingInfo.renderer
    const layerInfoUrl = `${url}?f=pjson`;
    const response = await fetch(layerInfoUrl);
    const layerJson = await response.json();
    const renderer = layerJson?.drawingInfo?.renderer;
    
    if (renderer.type === "uniqueValue") {
      return renderer.uniqueValueInfos.map((info: any) => ({
        idKey: [info.value?.toString() ?? ""],
        label: info.label || info.value?.toString(),
        fillColor: seededColor(info.label),
        groupName: groupName,
      }));
    }
  } else {
    // MapServer: Use legend endpoint
    const legendUrl = url.replace(/\/\d+$/, "/legend?f=pjson");
    const legendJson: ArcGISLegendResponse = await fetch(legendUrl).then(r => r.json());
    
    return layerLegend.legend.map(item => ({
      idKey: item.values?.flatMap(v => v.split(",")).map(v => v.trim()) ?? [],
      label: item.label,
      fillColor: seededColor(item.label),
      groupName: groupName,
    }));
  }
};
```

**Legend Structure:**
```typescript
type Styles = {
  label: string;           // Display name (e.g., "Residential Zone R1")
  idKey: string[];         // Values this style applies to
  fillColor: string;       // Polygon fill color
  groupName: string;       // Layer group for organization
  strokeColor?: string;    // Optional border color
};
```

### 5. Feature Layer Creation

Once legends are loaded, Esri Leaflet FeatureLayers are created:

```typescript
const featureLyr: FeatureLayer = featureLayer({
  url: layerInfo.url,
  
  // Style function - called for each feature
  style: (feature) => styleLayer(
    feature,
    legends,
    layerInfo.propertyKey,
    layerInfo.labelKey
  ),
  
  // Popup/tooltip binding
  onEachFeature: (feature, Layer) => stylePopupLayer(
    feature,
    layerInfo.propertyKey,
    layerInfo.labelKey,
    Layer
  ),
  
  minZoom: 10,              // Only show when zoomed in
  simplifyFactor: 0.4,      // Geometry simplification
  cacheLayers: true,        // Cache for performance
  ignoreRenderer: true,     // Use custom styling
});

featureLyr.addTo(mapRef.current!);
```

### 6. Dynamic Feature Styling

The `styleLayer` function matches features to legend entries:

```typescript
export const styleLayer = (
  feature: any,
  legends: Styles[],
  propertyKeys: string[],
  labelKey: string
) => {
  // Extract the classification value from the feature
  const key = feature.properties?.[labelKey]?.toString().trim();
  
  // Find matching legend item
  const legendItem = legends.find(l =>
    l.idKey.some(id => id === key) || l.label === key
  );
  
  // Return Leaflet path options
  return {
    color: legendItem?.strokeColor ?? "#000",
    fillColor: legendItem?.fillColor ?? seededColor(key),
    weight: 1,
    fillOpacity: 0.7,
  };
};
```

### 7. Spatial Filtering and Dynamic Layer Management

The system dynamically adds/removes layers as the user pans the map:

```typescript
useEffect(() => {
  const map = mapRef.current;
  if (!map || !currentLayer) return;

  const updateSpatialFilter = () => {
    const mapBounds = map.getBounds();
    const bbBox: BBBox = { /* current bounds */ };
    
    // Get layers that should be visible
    const layerData = getLayersForView(bbBox, currentLayer);
    
    // Determine what needs to change
    const layersToKeep = layersMetadata.filter(l =>
      layerData.some(ld => ld.id === l.id)
    );
    const layersToAdd = layerData.filter(ld =>
      !layersMetadata.some(l => l.id === ld.id)
    );
    
    // Add new layers
    layersToAdd.forEach(layer => addMapLayer(layer));
    
    // Refresh existing layers
    layersToKeep.forEach(layer => {
      const featureLyr = layerRef.current![layer.id];
      featureLyr?.setWhere("1=1");
      featureLyr?.refresh();
    });
    
    // Remove out-of-bounds layers
    Object.keys(layerRef.current!).forEach(layerId => {
      if (!layersToKeep.some(l => l.id === layerId)) {
        removeMapLayer(layerId);
      }
    });
  };

  map.on("moveend", scheduleUpdate);
}, [currentLayer, layersMetadata]);
```

## ArcGIS Integration Details

### MapServer vs FeatureServer

The system handles two types of ArcGIS endpoints:

**MapServer** (Legacy):
- Accessed via: `{url}/MapServer/{layerId}`
- Legend endpoint: `{baseUrl}/MapServer/legend?f=pjson`
- Returns pre-rendered legend with `imageData` (base64)
- Example: NSW Planning layers

**FeatureServer** (Modern):
- Accessed via: `{url}/FeatureServer/{layerId}`
- Legend from: `{url}/FeatureServer/{layerId}?f=pjson` → `drawingInfo.renderer`
- More flexible, client-side rendering
- Example: ACT layers

### Query Parameters

When fetching point data for property popups:

```typescript
const params = new URLSearchParams({
  f: "json",                              // Response format
  where: "1=1",                           // SQL where clause (all features)
  geometry: `${lng},${lat}`,              // Point geometry
  geometryType: "esriGeometryPoint",      // Geometry type
  inSR: "4326",                           // Input spatial reference (WGS84)
  spatialRel: "esriSpatialRelIntersects", // Spatial relationship
  outFields: "*",                         // Return all attributes
  returnGeometry: "false",                // Don't return geometry (faster)
  resultRecordCount: "5",                 // Limit results
});
```

### Esri Leaflet Integration

The `esri-leaflet` library bridges ArcGIS services to Leaflet:

```typescript
import { featureLayer, FeatureLayer } from "esri-leaflet";

const layer = featureLayer({
  url: "https://services.arcgis.com/.../FeatureServer/0",
  style: (feature) => ({ /* Leaflet path options */ }),
  onEachFeature: (feature, layer) => { /* Bind popups */ },
});
```

**Key Options:**
- `style`: Function returning Leaflet `PathOptions` per feature
- `onEachFeature`: Callback for popups/tooltips
- `where`: SQL filter (default `"1=1"` = all features)
- `simplifyFactor`: Geometry simplification for performance
- `cacheLayers`: Enable client-side caching

## Extending the Layer System

### Adding a New Layer Type

1. **Define the layer type** in `layers.ts`:

```typescript
export type Layers = 
  | "LANDIND_ZONES" 
  | "FLOOD_HAZARD" 
  | "BUSHFIRE_HAZARD"
  | "EARTHQUAKE_RISK"  // New layer
  | "HERITAGE_ZONES";
```

2. **Add label mappings**:

```typescript
export const LayerInfoLabelNames: Record<Layers, string[]> = {
  // ... existing
  EARTHQUAKE_RISK: ["RISK_LEVEL", "ZONE_CLASS"],
};
```

3. **Configure per jurisdiction**:

```typescript
const NSW_LAYER_INFO: LayerInfo = {
  // ... existing layers
  EARTHQUAKE_RISK: {
    id: "NSW_EARTHQUAKE_RISK",
    name: "NSW Earthquake Risk Zones",
    url: "https://example.nsw.gov.au/arcgis/rest/services/Hazards/Earthquake/MapServer/0",
    coverage: "state",
    propertyKey: ["RISK_LEVEL", "ZONE_CLASS", "LAST_EVENT"],
    labelKey: "RISK_LEVEL",
  },
};
```

4. **Add to UI** in `MapLayersPopover.tsx`:

```typescript
const layers: LayerOption[] = [
  // ... existing
  {
    id: "EARTHQUAKE_RISK",
    label: "Earthquake Risk",
    icon: <Activity className="h-4 w-4" />,
  },
];
```

5. **Handle in popup rendering** (`propertyPopover.tsx`):

```typescript
function formatLayerValue(layer: Layers, data?: Record<string, any>) {
  // ... existing cases
  case "EARTHQUAKE_RISK": {
    const level = get(...LayerInfoLabelNames[layer]);
    return { 
      value: level || "No earthquake risk data", 
      tone: level ? "warn" : "muted" 
    };
  }
}
```

### Adding a Local Government Area (LGA) Layer

For fine-grained local council data:

```typescript
const QLD_LAYER_INFO: LayerInfo = {
  FLOOD_HAZARD: [
    {
      id: "QLD_FLOOD_STATE",
      name: "QLD Flood (State)",
      url: "https://..../MapServer/0",
      coverage: "state",
      propertyKey: ["FLOOD_CLASS"],
      labelKey: "FLOOD_CLASS",
    },
    {
      id: "BRISBANE_FLOOD_DETAILED",
      name: "Brisbane Detailed Flood",
      url: "https://brisbane.qld.gov.au/.../FeatureServer/5",
      coverage: "lga",
      jurisdiction: Jurisdiction.BRISBANE,  // Define in enum
      propertyKey: ["FLOOD_LEVEL", "ARI"],
      labelKey: "FLOOD_LEVEL",
    },
  ],
  // ...
};
```

Then add the jurisdiction bounds:

```typescript
export const JurisdictionCoords: Record<Jurisdiction, BBBox> = {
  // ... existing
  [Jurisdiction.BRISBANE]: {
    minLat: -27.70,
    minLng: 152.70,
    maxLat: -27.20,
    maxLng: 153.30,
  },
};
```

The system will automatically load the detailed Brisbane layer when the map viewport intersects that LGA.

## Major Drawbacks and Challenges

### 1. Inconsistent MapServer/FeatureServer Schemas

**Problem**: Different ArcGIS services use completely different attribute field names for the same logical data.

**Examples:**
- NSW uses `LAY_CLASS` for zoning classification
- QLD uses `qlump_code` for land use
- WA uses `zone` for the same concept

**Impact:**
- Requires manual mapping per jurisdiction in `propertyKey` and `labelKey`
- No standardized way to query "what's the zoning here?" across states
- Each new data source requires reverse-engineering the schema

**Mitigation:**
```typescript
// Must define per-jurisdiction mappings
export const LayerInfoLabelNames: Record<Layers, string[]> = {
  LANDIND_ZONES: ["LAY_CLASS", "qlump_code", "zone", "tertiary"],
  // Try multiple possible field names
};
```

### 2. Unreliable Legend Data

**Problem**: Some MapServers don't provide legend endpoints or return incomplete/malformed data.

**Observed Issues:**
- Some endpoints return `404` on `/legend?f=pjson`
- FeatureServer `drawingInfo.renderer` may be `null`
- Legend `values` arrays sometimes empty or inconsistent with actual feature attributes
- Image-based legends (base64) don't provide parseable color information

**Current Workaround:**
```typescript
if (!renderer) {
  console.warn(`No renderer found for layer: ${groupName}`);
  return [{
    idKey: [],
    label: groupName,
    fillColor: seededColor(groupName),  // Fallback to generated color
    groupName: groupName,
  }];
}
```

**Impact:**
- Features may render without proper styling
- Legend displays incomplete or generic entries
- Manual color assignment needed for some layers

### 3. Attribute Field Naming Chaos

**Problem**: No standardization in attribute field naming conventions.

**Examples from actual data:**

| Layer Type | NSW Field | QLD Field | WA Field | ACT Field |
|------------|-----------|-----------|----------|-----------|
| Zone Class | `LAY_CLASS` | `qlump_code` | `zone` | `ASSET_SUB_TYPE` |
| Description | `PURPOSE` | `primary_` | `label_desc` | `DESCRIPTION` |
| Date | `COMMENCED_DATE` | `year` | `gazettal_d` | `EditDate` |

**Impact:**
- Cannot create generic query functions
- Property popup code must handle all variations:

```typescript
const get = (...keys: string[]) =>
  keys
    .map((k) => safe?.[k])
    .find((v) => v !== undefined && v !== null && String(v).trim() !== "");
```

### 4. Case Sensitivity and Type Inconsistency

**Problem**: Field names and values have inconsistent casing and data types.

**Examples:**
- Field names: `LAY_CLASS` vs `lay_class` vs `LayClass`
- Boolean values: `true`, `"true"`, `1`, `"Y"`, `"Yes"`
- Null representations: `null`, `"<Null>"`, `""`, `0`

**Mitigation:**
```typescript
const toStr = (v: unknown) => {
  if (v === null || v === undefined) return "";
  return String(v).trim();  // Always normalize to string
};
```

### 5. Performance Issues with Large Geometries

**Problem**: Some layers have extremely detailed polygons that slow rendering.

**Examples:**
- Heritage areas with thousands of vertices
- Detailed flood contours
- Fine-grained bushfire risk boundaries

**Current Solutions:**
```typescript
featureLayer({
  simplifyFactor: 0.4,    // Reduce geometry complexity
  minZoom: 10,            // Only load when zoomed in
  cacheLayers: true,      // Cache loaded features
});
```

**Remaining Issues:**
- Initial load still slow for complex areas
- Simplified geometries may lose accuracy
- No progressive loading strategy

### 6. Missing or Outdated Data

**Problem**: Some jurisdictions have no ArcGIS services for certain hazard types.

**Current Gaps:**
- Tasmania: Uses NSW fallback for all layers (clearly incorrect)
- Northern Territory: Uses NSW fallback
- Storm tide hazard: Only available for some coastal LGAs
- Landslide hazard: No data for most states

**Fallback Strategy:**
```typescript
[AustralianState.TAS]: NSW_LAYER_INFO,  // ❌ Wrong but no alternative
[AustralianState.NT]: NSW_LAYER_INFO,   // ❌ Wrong but no alternative
```

### 7. No Cross-Origin Resource Sharing (CORS) for Some Services

**Problem**: Some government ArcGIS servers don't allow browser requests.

**Workaround Required:**
- Proxy server to bypass CORS
- Server-side data fetching
- Pre-cached GeoJSON exports

**Not Currently Implemented** - would fail for those services in production.

### 8. Legend-to-Feature Matching Fragility

**Problem**: Legend items use `values` arrays to match feature attributes, but this mapping is unreliable.

**Example:**
```json
{
  "label": "Residential Zone R1",
  "values": ["R1", "Residential"]  // May or may not match actual data
}
```

**Real Feature:**
```json
{
  "properties": {
    "LAY_CLASS": "R1 General Residential"  // ❌ Doesn't match "R1"
  }
}
```

**Current Workaround:**
```typescript
const findLegendItem = (legends: Styles[], key: string) => {
  if (legends.length === 1) return legends[0];  // Single item - use it
  
  return legends.find(l =>
    l.idKey.some(id => toStr(id) === k) ||  // Exact match
    toStr(l.label) === k                     // Or label match
  ) ?? legends[0];  // Fallback to first item
};
```

### 9. Rate Limiting and Service Availability

**Problem**: Public ArcGIS servers may throttle or go offline.

**Observed Issues:**
- Slow response times during peak hours
- Occasional `503 Service Unavailable`
- No official SLA for public endpoints

**No Current Mitigation** - requests simply fail with error toasts.

### 10. Spatial Reference System Confusion

**Problem**: Different services use different coordinate systems without clear documentation.

**Common SRs:**
- `4326` (WGS84) - Standard lat/lng
- `3857` (Web Mercator) - Used by most web maps
- `28355` (GDA94 Zone 55) - Australian standard for NSW
- Various state-specific systems

**Critical Bug Found:**
```typescript
// ❌ WRONG - was using Web Mercator coords with WGS84 SR
geometry: `${lng},${lat}`,
inSR: "4326",

// ✅ FIXED - explicitly specify WGS84
geometry: `${lng},${lat}`,
geometryType: "esriGeometryPoint",
inSR: "4326",
```

**Impact**: Point queries could fail or return wrong features if SR mismatch.

## Best Practices for Future Development

1. **Always Normalize Data**:
   - Convert all values to strings for comparison
   - Trim whitespace
   - Handle null/undefined consistently

2. **Graceful Degradation**:
   - Always provide fallback colors/styles
   - Log warnings, don't throw errors
   - Show partial data rather than nothing

3. **Test with Multiple Jurisdictions**:
   - Each state likely has different quirks
   - Verify legend extraction for each new layer
   - Check attribute field names in actual responses

4. **Document Schema Mappings**:
   - Maintain a lookup table of field name variations
   - Comment why specific fields are used
   - Note data quality issues per source

5. **Monitor Performance**:
   - Use `simplifyFactor` judiciously
   - Implement viewport-based loading
   - Consider pre-processing complex geometries

6. **Error Handling**:
   - Wrap all ArcGIS requests in try-catch
   - Provide user feedback on failures
   - Log issues for debugging

## Conclusion

This planning data layer system demonstrates the complexity of integrating heterogeneous government GIS services. While it successfully renders multi-jurisdictional data, it requires extensive per-layer configuration and defensive programming to handle inconsistencies. The lack of standardization across Australian government ArcGIS services remains the primary technical challenge.