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



export const handleLegendExtraction = async (url: string): Promise<Styles[]> => {
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

export const styleLayer = (feature: any, legends: Styles[]) => {
    const key = feature.properties.LAY_CLASS || feature.properties.OVL2_CAT;
    const legendItem = legends.find(l => l.idKey.includes(key) || l.label === key);
    if (!legendItem) {
        console.info(`No legend item found for feature label: ${key}`);
        console.log(feature)
        return {
            fillColor: legends.length === 1 ? legends[0].fillColor : "#CCCCCC",
            color: legends.length === 1 ? legends[0].strokeColor ?? "#000000" : "#000000",
            weight: 1,
            fillOpacity: 0.7,
        }
    }
    return {
        color: legendItem.strokeColor ?? "#000",
        fillColor: legendItem.fillColor ?? "#FFF",
        weight: 1,
        fillOpacity: 0.7,
    };
}