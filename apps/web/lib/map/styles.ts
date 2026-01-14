import { Styles } from "./layers";
import L from "leaflet";

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



export const handleLegendExtraction = async (url: string, groupName: string): Promise<Styles[]> => {
    try {
        // convert arcgis endpoint to legend endpoint eg: "MapServer/1" to "MapServer/legend?f=pjson
        const legendUrl = url.replace(/\/\d+$/, "/legend?f=pjson");
        const layerIdMatch = url.match(/\/(\d+)$/);
        const layerId = layerIdMatch ? parseInt(layerIdMatch[1], 10) : 0;

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
                const style: Styles = {
                    idKey: item.values?.flatMap(v => v.split(",")).map(v => v.trim()) ?? [],
                    label: item.label.length ? item.label : layerLegend.layerName, // Clean label if needed
                    fillColor: seededColor(item.label),
                    groupName: groupName,
                };
                return style;
            }
        });

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