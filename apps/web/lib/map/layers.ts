export const enum AustralianState {
    NSW = "NSW",
    VIC = "VIC",
    QLD = "QLD",
    WA = "WA",
    SA = "SA",
    TAS = "TAS",
    NT = "NT",
    ACT = "ACT",
}

export type Layers = "LANDIND_ZONES" | "FLOOD_HAZARD" | "BUSHFIRE_HAZARD" | "LANDSLIDE_HAZARD" | "STORM_TIDE_HAZARD";

export type Styles = {
    label: string;
    idKey: string[];
    fillColor: string;
    strokeColor?: string;
};

type LayerStyles = Record<string, Styles>;


type LayerInfo = Record<Layers, { name: string; url: string }>;

const NSW_LAYER_INFO: LayerInfo = {
    LANDIND_ZONES: {
        name: "NSW Land Zoning",
        url: "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/EPI_Primary_Planning_Layers/MapServer/2",
    },
    FLOOD_HAZARD: {
        name: "NSW Flood Hazard",
        url: "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/Hazard/MapServer/1",

    },
    BUSHFIRE_HAZARD: {
        name: "NSW Bushfire Hazard",
        url: "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Hazards/Bushfire_Hazard/MapServer/0",
    },
    LANDSLIDE_HAZARD: {
        name: "NSW Landslide Hazard",
        url: "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/Hazard/MapServer/2",
    },
    STORM_TIDE_HAZARD: {
        name: "NSW Storm Tide Hazard",
        url: "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Hazards/Storm_Tide_Hazard/MapServer/0",
    },
}

const QLD_LAYER_INFO: LayerInfo = {
    LANDIND_ZONES: {
        name: "QLD Land Zoning",
        url: "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/EPI_Primary_Planning_Layers/MapServer/2",
    },
    FLOOD_HAZARD: {
        name: "QLD Flood Hazard",
        url: "https://maps.tr.qld.gov.au/arcgis/rest/services/External/External_PlanningScheme/MapServer/156",
    },
    BUSHFIRE_HAZARD: {
        name: "QLD Bushfire Hazard",
        url: "https://maps.tr.qld.gov.au/arcgis/rest/services/External/External_PlanningScheme/MapServer/145",
    },
    LANDSLIDE_HAZARD: {
        name: "QLD Landslide Hazard",
        url: "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Hazards/Landslide_Hazard/MapServer/0",
    },
    STORM_TIDE_HAZARD: {
        name: "QLD Storm Tide Hazard",
        url: "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Hazards/Storm_Tide_Hazard/MapServer/0",
    },
}

export const stateLayerMapping: Record<AustralianState, LayerInfo> = {
    [AustralianState.NSW]: NSW_LAYER_INFO,
    [AustralianState.VIC]: NSW_LAYER_INFO,
    [AustralianState.QLD]: QLD_LAYER_INFO,
    [AustralianState.WA]: NSW_LAYER_INFO,
    [AustralianState.SA]: NSW_LAYER_INFO,
    [AustralianState.TAS]: NSW_LAYER_INFO,
    [AustralianState.NT]: NSW_LAYER_INFO,
    [AustralianState.ACT]: NSW_LAYER_INFO,
}