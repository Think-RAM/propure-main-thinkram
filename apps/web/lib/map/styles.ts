import { Styles } from "./layers";

/** Root legend response */
export interface ArcGISLegendResponse {
    layers: ArcGISLegendLayer[];
}

/** A single layer in the legend */
export interface ArcGISLegendLayer {
    layerId: number;
    layerName: string;
    layerType: string;
    minScale: number;
    maxScale: number;
    legend: ArcGISLegendItem[];
}

/** A single legend item (symbol entry) */
export interface ArcGISLegendItem {
    label: string;
    /** Image id or hash (not always a full URL) */
    url: string;
    /** Base64 encoded image */
    imageData: string;
    contentType: string;
    height: number;
    width: number;
    /** Renderer values this symbol applies to */
    values?: string[];
}

export const seededColor = (key: string): string => {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
        hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 60%, 55%)`;
};

// Helper: parse labels out of a SQL-ish where clause.
// For now focuses on patterns like:  POITYPE IN ('Academy','University')
// Also supports: POITYPE = 'Academy'  (nice fallback)
const extractLabelsFromWhereClause = (whereClause?: string): string[] => {
  if (!whereClause) return [];

  const wc = whereClause.trim();

  // 1) IN (...) pattern (case-insensitive)
  //    Captures whatever is inside the parentheses.
  const inMatch = wc.match(/\bIN\s*\(([^)]*)\)/i);
  if (inMatch?.[1]) {
    const inside = inMatch[1];

    // Prefer quoted strings: 'Academy', "University"
    const quoted: string[] = [];
    const quotedRe = /'([^']*)'|"([^"]*)"/g;
    let m: RegExpExecArray | null;
    while ((m = quotedRe.exec(inside)) !== null) {
      const val = (m[1] ?? m[2] ?? "").trim();
      if (val) quoted.push(val);
    }

    // If nothing was quoted, fall back to splitting by comma
    if (quoted.length) return quoted;

    return inside
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  // 2) Equality pattern: FIELD = 'Value'
  const eqMatch = wc.match(/=\s*('([^']*)'|"([^"]*)"|([^\s)]+))/i);
  if (eqMatch) {
    const val = (eqMatch[2] ?? eqMatch[3] ?? eqMatch[4] ?? "").trim();
    return val ? [val] : [];
  }

  return [];
};


export const handleLegendExtraction = async (url: string, groupName: string, whereClause?: string): Promise<Styles[]> => {
    try {
        // Check if this is a FeatureServer or MapServer endpoint
        const isFeatureServer = url.includes("/FeatureServer/");
        
        if (isFeatureServer) {
            // For FeatureServer, get legend info from the layer's drawingInfo
            const layerInfoUrl = `${url}?f=pjson`;
            const response = await fetch(layerInfoUrl);
            if (!response.ok) {
                console.error(`Failed to fetch layer info: ${response.statusText}`);
                return [] as Styles[];
            }
            const layerJson = await response.json();
            
            // Extract from drawingInfo.renderer
            const renderer = layerJson?.drawingInfo?.renderer;
            if (!renderer) {
                console.warn(`No renderer found for FeatureServer layer: ${groupName}`);
                // Return a default style based on layer name
                return [{
                    idKey: [],
                    label: groupName,
                    fillColor: seededColor(groupName),
                    groupName: groupName,
                }];
            }

            // Handle uniqueValue renderer
            if (renderer.type === "uniqueValue" && renderer.uniqueValueInfos) {
                return renderer.uniqueValueInfos.map((info: any) => ({
                    idKey: [info.value?.toString() ?? ""],
                    label: info.label || info.value?.toString() || groupName,
                    fillColor: seededColor(info.label || info.value?.toString() || groupName),
                    groupName: groupName,
                }));
            }

            // Handle simple renderer
            if (renderer.type === "simple") {
                return [{
                    idKey: [],
                    label: renderer.label || groupName,
                    fillColor: seededColor(renderer.label || groupName),
                    groupName: groupName,
                }];
            }

            // Default fallback
            return [{
                idKey: [],
                label: groupName,
                fillColor: seededColor(groupName),
                groupName: groupName,
            }];
        }

        // convert arcgis endpoint to legend endpoint eg: "MapServer/1" to "MapServer/legend?f=pjson
        const legendUrl = url.replace(/\/\d+$/, "/legend?f=pjson");
        const layerIdMatch = url.match(/\/(\d+)$/);
        const layerId = layerIdMatch ? parseInt(layerIdMatch[1], 10) : 0;
        const allowed = new Set(extractLabelsFromWhereClause(whereClause));

        const legendsData = await fetch(legendUrl)
        if (!legendsData.ok) {
            console.error(`Failed to fetch legend data: ${legendsData.statusText}`);
            return [] as Styles[];
        }
        const legendJson: ArcGISLegendResponse = await legendsData.json();
        const layerLegend = legendJson.layers.find(layer => layer.layerId === layerId);
        if (!layerLegend) {
            console.error(`Layer ID ${layerId} not found in legend data`);
            return [] as Styles[];
        }
        const stylesData = layerLegend.legend.map(item => {
            {
                if (allowed.size > 0 && !allowed.has(item.label)) {
                    // Skip items not in the allowed set
                    return null;
                }
                const style: Styles = {
                    idKey: item.values?.flatMap(v => v.split(",")).map(v => v.trim()) ?? [],
                    label: item.label.length ? item.label : layerLegend.layerName, // Clean label if needed
                    fillColor: seededColor(item.label),
                    groupName: groupName,
                };
                return style;
            }
        }).filter(Boolean) as Styles[];

        return stylesData
    } catch (error) {
        console.error("Error fetching legend data:", error);
        return [] as Styles[];
    }
}

// ensures we always compare strings
const toStr = (v: unknown) => {
    if (v === null || v === undefined) return "";
    // ArcGIS sometimes sends numbers/booleans - coerce
    return String(v);
};

const getLabelValue = (feature: any, labelKey: string) => {
    const props = feature?.properties ?? {};
    const v = props?.[labelKey];
    const s = toStr(v).trim();
    return s;
};

const findLegendItem = (legends: Styles[], key: string) => {
    // normalize comparisons
    const k = key.trim();
    if(legends.length === 1) {
        return legends[0];
    }
    return legends.find(l =>
        (Array.isArray(l.idKey) && l.idKey.some(id => toStr(id) === k)) ||
        toStr(l.label) === k
    );
};

export const styleLayer = (
    feature: any,
    legends: Styles[],
    propertyKeys: string[],
    labelKey: string
) => {
    const key = getLabelValue(feature, labelKey);

    // if labelKey not present or empty, you can choose a fallback:
    // 1) use "Unknown"
    // 2) or use first non-empty property among propertyKeys
    const fallbackKey =
        key ||
        propertyKeys.map(k => toStr(feature?.properties?.[k]).trim()).find(Boolean) ||
        "Unknown";

    const legendItem = findLegendItem(legends, fallbackKey);

    if (!legendItem) {
        console.info(`No legend item found for feature label: ${fallbackKey}`);
        console.log(feature)
        return {
            fillColor: seededColor(fallbackKey),
            color: "#000",
            weight: 1,
            fillOpacity: 0.7,
        };
    }

    return {
        color: legendItem.strokeColor ?? "#000",
        fillColor: legendItem.fillColor ?? "#FFF",
        weight: 1,
        fillOpacity: 0.7,
    };
};

export const stylePopupLayer = (
    feature: any,
    propertyKeys: string[],
    labelKey: string,
    layer: L.Layer
) => {
    const props = feature?.properties ?? {};
    const label = getLabelValue(feature, labelKey) || "Unknown";

    // Tooltip title (simple + stable)
    layer.bindTooltip(label, { sticky: true });

    // If you also want a popup showing only propertyKeys, uncomment:
    const rows = propertyKeys
        .map((k) => {
            const val = toStr(props?.[k]);
            return `<tr><td style="padding:4px 8px;font-weight:600;">${k}</td><td style="padding:4px 8px;">${val}</td></tr>`;
        })
        .join("");

    layer.bindPopup(
        `
        <div style="max-width:320px;">
            <div style="font-weight:700;margin-bottom:6px;">${labelKey}: ${label}</div>
            <table style="border-collapse:collapse;width:100%;">${rows}</table>
        </div>
     `
    );
};

export const styleMarker = (
    feature: any,
    legends: Styles[],
    propertyKeys: string[],
    labelKey: string
) => {
    const key = getLabelValue(feature, labelKey);
}