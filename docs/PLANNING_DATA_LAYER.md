# Planning Data Layer Implementation Documentation

## Overview

This application implements an interactive map visualization system for Australian planning and hazard data using Leaflet.js as the base mapping library and ArcGIS REST services as the data source. The system dynamically fetches, styles, and renders geospatial layers based on user selection and map viewport.

## Architecture

### Core Components

The implementation is structured across several key files:

1.  **`layers.ts`** - Layer configuration and state-specific endpoint definitions
2.  **`styles.ts`** - Legend extraction and feature styling logic
3.  **`MapContext.tsx`** - State management and layer orchestration
4.  **`LeafletMap.tsx`** & **`MapLayersPopover.tsx`** - UI components for map interaction

## Layer Configuration System

### State-Based Layer Mapping

The application defines five primary layer types available across Australian states:

```typescript
type Layers = 
  | "LANDIND_ZONES"      // Land use zoning classifications
  | "FLOOD_HAZARD"       // Flood risk areas
  | "BUSHFIRE_HAZARD"    // Bushfire prone land
  | "LANDSLIDE_HAZARD"   // Landslide susceptibility
  | "STORM_TIDE_HAZARD"  // Storm surge inundation zones

```

Each layer type is mapped to state-specific ArcGIS MapServer endpoints:

```typescript
const NSW_LAYER_INFO: LayerInfo = {
    LANDIND_ZONES: {
        name: "NSW Land Zoning",
        url: "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/EPI_Primary_Planning_Layers/MapServer/2",
    },
    FLOOD_HAZARD: {
        name: "NSW Flood Hazard",
        url: "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/Hazard/MapServer/1",
    },
    // ... additional layers
}

```

The `stateLayerMapping` object provides a lookup table that maps each Australian state/territory to its corresponding layer endpoints. Currently, only NSW and QLD have fully implemented layer URLs, while other states fall back to NSW endpoints as placeholders.

### Layer URL Structure

ArcGIS MapServer URLs follow a consistent pattern:

```
https://{server}/arcgis/rest/services/{folder}/{service}/MapServer/{layerId}

```

The `layerId` at the end (e.g., `/2`, `/1`) identifies the specific sublayer within the MapServer that contains the desired feature data.

## Data Fetching and Rendering Pipeline

### 1. Layer Activation

When a user selects a layer from the UI (`MapLayersPopover.tsx`), the `setMapLayer()` function in `MapContext.tsx` orchestrates the entire rendering process:

```typescript
const setMapLayer = useCallback(async (layerId?: Layers) => {
    // 1. Remove existing layer
    if (layerRef.current) {
        layerRef.current.remove();
        mapRef.current.removeLayer(layerRef.current);
        layerRef.current = null;
    }
    
    if (!layerId) return; // Clear layer only
    
    // 2. Determine which state's data to use
    const mapCenter = mapRef.current.getCenter();
    const auState = coordToAUState(mapCenter.lat, mapCenter.lng);
    
    // 3. Fetch layer configuration
    const layerData = stateLayerMapping[auState][layerId];
    
    // 4. Extract legend/styling information
    const legendData = await handleLegendExtraction(layerData.url);
    
    // 5. Create and add the feature layer
    const layer: FeatureLayer = featureLayer({
        url: layerData.url,
        style: (feature) => styleLayer(feature, legendData),
        minZoom: 10,
        simplifyFactor: 0.4,
        cacheLayers: true,
        ignoreRenderer: true,
    });
    
    layer.addTo(mapRef.current);
    layerRef.current = layer;
}, []);

```

### 2. Legend Extraction (`styles.ts`)

Before rendering features, the system fetches styling information from the ArcGIS Legend API:

```typescript
export const handleLegendExtraction = async (url: string): Promise<Styles[]> => {
    // Convert layer URL to legend endpoint
    // Example: ".../MapServer/2" → ".../MapServer/legend?f=pjson"
    const legendUrl = url.replace(/\/\d+$/, "/legend?f=pjson");
    const layerIdMatch = url.match(/\/(\d+)$/);
    const layerId = layerIdMatch ? parseInt(layerIdMatch[1], 10) : 0;
    
    const legendsData = await fetch(legendUrl);
    const legendJson: ArcGISLegendResponse = await legendsData.json();
    
    // Find the specific layer's legend
    const layerLegend = legendJson.layers.find(layer => layer.layerId === layerId);
    
    // Transform legend items into styling objects
    const stylesData = layerLegend.legend.map(item => ({
        idKey: item.values?.flatMap(v => v.split(",")).map(v => v.trim()) ?? [],
        label: item.label.length ? item.label : layerLegend.layerName,
        fillColor: seededColor(item.label), // Generate consistent color from label
    }));
    
    return stylesData;
}

```

#### Legend Response Structure

The ArcGIS Legend API returns data in this format:

```typescript
interface ArcGISLegendResponse {
    layers: [
        {
            layerId: 2,
            layerName: "Land Zoning",
            legend: [
                {
                    label: "Residential R1",
                    values: ["R1", "R1A"],  // Classification codes
                    imageData: "base64...", // Symbol preview
                    contentType: "image/png",
                    height: 20,
                    width: 20
                },
                // ... more symbols
            ]
        }
    ]
}

```

The `values` array contains the classification codes that will be matched against feature properties during styling.

### 3. Feature Styling

Each feature (polygon) fetched from the ArcGIS service is styled using the extracted legend data:

```typescript
export const styleLayer = (feature: any, legends: Styles[]) => {
    // Extract classification from feature properties
    const key = feature.properties.LAY_CLASS || feature.properties.OVL2_CAT;
    
    // Find matching legend entry
    const legendItem = legends.find(l => 
        l.idKey.includes(key) || l.label === key
    );
    
    if (!legendItem) {
        // Fallback styling for unmapped features
        return {
            fillColor: legends.length === 1 ? legends[0].fillColor : "#CCCCCC",
            color: legends.length === 1 ? legends[0].strokeColor ?? "#000000" : "#000000",
            weight: 1,
            fillOpacity: 0.7,
        };
    }
    
    // Apply legend-based styling
    return {
        color: legendItem.strokeColor ?? "#000",
        fillColor: legendItem.fillColor ?? "#FFF",
        weight: 1,
        fillOpacity: 0.7,
    };
};

```

### 4. Esri-Leaflet Integration

The application uses the `esri-leaflet` plugin to handle communication with ArcGIS REST services:

```typescript
import { featureLayer, FeatureLayer } from "esri-leaflet";

const layer: FeatureLayer = featureLayer({
    url: layerData.url,                          // ArcGIS MapServer endpoint
    style: (feature) => styleLayer(feature, legendData), // Custom styling function
    minZoom: 10,                                 // Performance optimization
    simplifyFactor: 0.4,                         // Geometry simplification
    cacheLayers: true,                           // Browser caching
    ignoreRenderer: true,                        // Use custom styling instead of server defaults
});

```

#### Spatial Query Optimization

To improve performance, the system implements viewport-based querying:

```typescript
useEffect(() => {
    if (!mapRef.current || !layerRef.current) return;
    
    const updateSpatialFilter = () => {
        const bounds = mapRef.current!.getBounds();
        
        // Apply bounding box spatial filter
        layerRef.current!.query()
            .bboxIntersects(bounds)
            .where("1=1");
        
        // Force refresh with new bounds
        layerRef.current!.setWhere("1=1");
        layerRef.current!.refresh();
    };
    
    // Update on map movement
    mapRef.current.on("moveend", updateSpatialFilter);
    updateSpatialFilter();
    
    return () => {
        mapRef.current?.off("moveend", updateSpatialFilter);
    };
}, [layerRef.current]);

```

This ensures only features visible in the current viewport are fetched and rendered, significantly improving performance for large datasets.

## Color Generation

Since ArcGIS legend images are returned as base64 PNG data, the application generates colors programmatically using a seeded hash function:

```typescript
export const seededColor = (key: string): string => {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
        hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 60%, 55%)`;
};

```

This approach:

-   Generates consistent colors for the same label across sessions
-   Provides reasonable visual distinction between categories
-   Avoids parsing/extracting colors from base64 images

## Extending the Layer System

### Adding New Layer Types

1.  **Update the `Layers` type** in `layers.ts`:

```typescript
export type Layers = 
  | "LANDIND_ZONES" 
  | "FLOOD_HAZARD" 
  | "BUSHFIRE_HAZARD"
  | "LANDSLIDE_HAZARD"
  | "STORM_TIDE_HAZARD"
  | "HERITAGE_SITES"      // New layer type
  | "ENVIRONMENTAL_ZONES"; // New layer type

```

2.  **Add endpoint configurations** for each state:

```typescript
const NSW_LAYER_INFO: LayerInfo = {
    // ... existing layers
    HERITAGE_SITES: {
        name: "NSW Heritage Sites",
        url: "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Heritage/Sites/MapServer/0",
    },
    ENVIRONMENTAL_ZONES: {
        name: "NSW Environmental Zones",
        url: "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Environment/Zones/MapServer/1",
    },
};

```

3.  **Update the UI** in `MapLayersPopover.tsx`:

```typescript
const layers: LayerOption[] = [
    // ... existing layers
    {
        id: "HERITAGE_SITES",
        label: "Heritage Sites",
        icon: <Landmark className="h-4 w-4" />,
    },
    {
        id: "ENVIRONMENTAL_ZONES",
        label: "Environmental Zones",
        icon: <TreePine className="h-4 w-4" />,
    },
];

```

### Adding New States/Territories

To add full support for additional states:

1.  **Create state-specific layer configuration**:

```typescript
const VIC_LAYER_INFO: LayerInfo = {
    LANDIND_ZONES: {
        name: "VIC Land Zoning",
        url: "https://services.land.vic.gov.au/catalogue/publicproxy/guest/dv_geoserver/datavic/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=datavic:PLANNING_ZONE",
    },
    // ... other layers
};

```

2.  **Update the state mapping**:

```typescript
export const stateLayerMapping: Record<AustralianState, LayerInfo> = {
    [AustralianState.NSW]: NSW_LAYER_INFO,
    [AustralianState.VIC]: VIC_LAYER_INFO,  // Now using VIC-specific endpoints
    [AustralianState.QLD]: QLD_LAYER_INFO,
    // ...
};

```

### Custom Styling Logic

For layers requiring specialized styling beyond legend-based coloring:

```typescript
export const styleLayer = (feature: any, legends: Styles[]) => {
    const key = feature.properties.LAY_CLASS || feature.properties.OVL2_CAT;
    
    // Custom logic for specific layer types
    if (feature.properties.HAZARD_LEVEL) {
        const hazardLevel = feature.properties.HAZARD_LEVEL;
        return {
            fillColor: getHazardColor(hazardLevel),
            color: "#000",
            weight: 2,
            fillOpacity: 0.6,
        };
    }
    
    // Default legend-based styling
    const legendItem = legends.find(l => l.idKey.includes(key));
    // ... rest of logic
};

```

## Known Drawbacks and Limitations

### 1. **Inconsistent MapServer Data Structures**

Different ArcGIS MapServers use varying property names for classification:

```typescript
// Some servers use "LAY_CLASS"
feature.properties.LAY_CLASS = "R1";

// Others use "OVL2_CAT"
feature.properties.OVL2_CAT = "Flood";

// Some use entirely different names
feature.properties.ZONE_CODE = "Residential";
feature.properties.CLASS_NAME = "High Risk";

```

**Impact**: The current `styleLayer()` function hardcodes two property names (`LAY_CLASS` and `OVL2_CAT`), meaning layers using different property structures won't style correctly.

**Mitigation Strategies**:

-   Implement per-layer property mapping configuration
-   Use ArcGIS metadata endpoints to discover property schemas dynamically
-   Fall back to inspecting feature properties at runtime

### 2. **Inconsistent Legend Data**

Not all ArcGIS MapServers provide comprehensive legend information:

-   **Missing legend endpoints**: Some services don't expose `/legend?f=pjson`
-   **Incomplete `values` arrays**: Legend items may lack the classification codes needed for matching
-   **Label inconsistencies**: Labels in legend may not match actual feature property values
-   **Single-symbol layers**: Some layers return only one legend entry with no classification values

**Current Fallback Behavior**:

```typescript
if (!legendItem) {
    // If no matching legend found, use generic styling
    return {
        fillColor: legends.length === 1 ? legends[0].fillColor : "#CCCCCC",
        color: "#000000",
        weight: 1,
        fillOpacity: 0.7,
    };
}

```

This results in many features appearing gray when proper legend matching fails.

**Potential Solutions**:

-   Maintain manual legend mappings for problematic layers
-   Parse feature properties to auto-detect unique classifications
-   Use ArcGIS renderer information (currently ignored via `ignoreRenderer: true`)

### 3. **Cross-State Data Inconsistencies**

Queensland and NSW use different:

-   Property naming conventions
-   Classification systems (e.g., zoning codes differ between states)
-   Geometry precision and simplification levels
-   Update frequencies and data currency

**Example**: NSW uses `R1`, `R2`, `R3` for residential zones, while QLD uses `Low Density Residential`, `Medium Density Residential`, etc.

This makes it challenging to create unified styling rules across states.

### 4. **Performance Limitations**

-   **Initial legend fetch**: Adds ~200-500ms latency before layer renders
-   **Large datasets**: Layers with 10,000+ features can cause lag even with viewport filtering
-   **Geometry complexity**: Highly detailed polygons (coastlines, irregular boundaries) impact rendering performance
-   **Multiple layers**: Currently limited to one active layer at a time due to performance constraints

### 5. **Service Availability and CORS**

-   ArcGIS REST services can experience downtime or rate limiting
-   CORS policies may block certain endpoints from browser access
-   Some government servers have IP-based restrictions
-   Authentication requirements (not currently implemented) limit access to certain datasets

### 6. **Property Name Hardcoding**

The current implementation assumes specific property names:

```typescript
const key = feature.properties.LAY_CLASS || feature.properties.OVL2_CAT;

```

This brittle approach means:

-   New layers may require code changes
-   No runtime configuration of property mappings
-   Debugging requires inspecting network traffic to discover actual property names

**Better Approach**:

```typescript
const LAYER_PROPERTY_MAP: Record<Layers, string[]> = {
    LANDIND_ZONES: ["LAY_CLASS", "ZONE_CODE", "ZONE_NAME"],
    FLOOD_HAZARD: ["OVL2_CAT", "HAZARD_CAT", "FLOOD_CLASS"],
    // ... etc
};

const extractClassification = (feature: any, layerType: Layers) => {
    const possibleProps = LAYER_PROPERTY_MAP[layerType];
    for (const prop of possibleProps) {
        if (feature.properties[prop]) {
            return feature.properties[prop];
        }
    }
    return null;
};

```

### 7. **Limited Error Handling**

Current error handling is minimal:

```typescript
try {
    const legendsData = await fetch(legendUrl);
    if (!legendsData.ok) {
        console.error(`Failed to fetch legend data: ${legendsData.statusText}`);
        return [] as Styles[];
    }
    // ...
} catch (error) {
    console.error("Error fetching legend data:", error);
    return [] as Styles[];
}

```

Issues:

-   Silent failures return empty arrays
-   No user notification of partial data loads
-   No retry logic for transient failures
-   No telemetry for monitoring service health

### 8. **State Detection Edge Cases**

The `coordToAUState()` function determines which state's data to use based on map center:

```typescript
const auState = coordToAUState(mapCenter.lat, mapCenter.lng);

```

Problems:

-   Border regions may get incorrect state assignment
-   Zoomed-out views spanning multiple states only show one state's data
-   No handling for offshore territories
-   Manual pan across state borders requires layer refresh

## Recommendations for Production

1.  **Implement layer-specific configuration files**:

```typescript
// config/layers/flood-hazard.json
{
    "type": "FLOOD_HAZARD",
    "propertyMappings": {
        "NSW": ["OVL2_CAT"],
        "QLD": ["FLOOD_CLASS", "HAZARD_CATEGORY"],
        "VIC": ["FLOOD_ZONE"]
    },
    "customStyling": {
        "High": { "fillColor": "#FF0000", "weight": 2 },
        "Medium": { "fillColor": "#FFA500", "weight": 1 },
        "Low": { "fillColor": "#FFFF00", "weight": 1 }
    }
}

```

2.  **Add comprehensive error boundaries and fallbacks**
3.  **Implement layer caching** to reduce repeated legend fetches
4.  **Add service health monitoring** to detect MapServer availability
5.  **Consider pre-processing legend data** and storing in a database for consistent access
6.  **Implement multi-layer support** with z-index management
7.  **Add loading states and progress indicators** for better UX
8.  **Build property schema introspection** to automatically detect classification fields