import { coordsToJurisdictions, coordToAUStates } from "../utils";

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

export const enum Jurisdiction {
    TOOWOOMBA = "Toowoomba Regional Council",
    MAKAYE = "Mackay Regional Council",
}

export type Layers = "LANDIND_ZONES" | "FLOOD_HAZARD" | "BUSHFIRE_HAZARD" | "LANDSLIDE_HAZARD" | "STORM_TIDE_HAZARD" | "HERITAGE_ZONES";

export type Styles = {
    label: string;
    idKey: string[];
    fillColor: string;
    groupName: string;
    strokeColor?: string;
};

export interface BBBox {
    minLat: number;
    minLng: number;
    maxLat: number;
    maxLng: number;
}

export type LayerRegistry = {
    id: string;
    name: string;
    url: string;
    coverage: "state" | "lga";
    propertyKey: string[];
    labelKey: string;
    jurisdiction?: Jurisdiction;
    coverageCords?: BBBox;
}


export const JuridsictionCoords: Record<Jurisdiction, BBBox> = {
    [Jurisdiction.TOOWOOMBA]: {
        minLat: -28.192347,
        minLng: 150.702672,
        maxLat: -26.766807,
        maxLng: 152.251429,
    },
    [Jurisdiction.MAKAYE]: {
        minLat: -22.40,
        minLng: 147.90,
        maxLat: -20.10,
        maxLng: 150.60,
    },
};

export const StateCoords: Record<AustralianState, BBBox> = {
    [AustralianState.ACT]: { minLat: -35.92, minLng: 148.76, maxLat: -35.12, maxLng: 149.40 },
    [AustralianState.TAS]: { minLat: -43.75, minLng: 144.40, maxLat: -39.20, maxLng: 148.50 },
    [AustralianState.VIC]: { minLat: -39.20, minLng: 140.90, maxLat: -33.90, maxLng: 150.00 },
    [AustralianState.NSW]: { minLat: -37.60, minLng: 140.99, maxLat: -28.15, maxLng: 153.64 },
    [AustralianState.QLD]: { minLat: -28.20, minLng: 138.00, maxLat: -10.00, maxLng: 153.64 },
    [AustralianState.SA]: { minLat: -38.10, minLng: 129.00, maxLat: -26.00, maxLng: 141.00 },
    [AustralianState.NT]: { minLat: -26.00, minLng: 129.00, maxLat: -10.00, maxLng: 138.00 },
    [AustralianState.WA]: { minLat: -35.20, minLng: 112.90, maxLat: -13.50, maxLng: 129.00 },
};

type LayerInfo = Record<Layers, LayerRegistry | LayerRegistry[]>;

const NSW_LAYER_INFO: LayerInfo = {
    LANDIND_ZONES: {
        id: "NSW_LAND_ZONING",
        name: "NSW Land Zoning",
        url: "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/EPI_Primary_Planning_Layers/MapServer/2",
        coverage: "state",
        propertyKey: [
            "OBJECTID",
            "EPI_NAME",
            "LGA_NAME",
            "PUBLISHED_DATE",
            "COMMENCED_DATE",
            "CURRENCY_DATE",
            "AMENDMENT",
            "MAP_TYPE",
            "MAP_NAME",
            "LAY_NAME",
            "LAY_CLASS",
            "SYM_CODE",
            "PURPOSE",
            "LEGIS_REF_AREA",
            "LEGIS_REF_CLAUSE",
            "LEGIS_REF_VALUE",
            "PCO_REF_KEY",
            "EPI_TYPE",
            "SHAPE",
        ],
        labelKey: "LAY_CLASS",
    },
    FLOOD_HAZARD: {
        id: "NSW_FLOOD_HAZARD",
        name: "NSW Flood Hazard",
        url: "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/Hazard/MapServer/1",
        coverage: "state",
        propertyKey: [
            "OBJECTID",
            "EPI_NAME",
            "LGA_NAME",
            "PUBLISHED_DATE",
            "COMMENCED_DATE",
            "CURRENCY_DATE",
            "AMENDMENT",
            "LAY_CLASS",
            "EPI_TYPE",
            "COMMENT",
            "SHAPE",
        ],
        labelKey: "LAY_CLASS",
    },
    BUSHFIRE_HAZARD: {
        id: "NSW_BUSHFIRE_HAZARD",
        name: "NSW Bushfire Hazard",
        url: "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Fire/NPWS_Fire_History/MapServer/0", // Placeholder URL as not provided
        coverage: "state",
        propertyKey: [
            "OBJECTID",
            "FireType",
            "FireName",
            "FireNo",
            "FireYear",
            "Label",
            "StartDate",
            "EndDate",
            "Intensity",
            "AreaHa",
            "PerimeterM",
            "OFHObjMet",
            "ObjNotMet",
            "NPWSBranch",
            "NPWSArea",
            "Shape",
            "VerDate",
            "Shape.STArea()",
            "Shape.STLength()",
        ],
        labelKey: "FireType",
    },
    LANDSLIDE_HAZARD: {
        id: "NSW_LANDSLIDE_HAZARD",
        name: "NSW Landslide Hazard",
        url: "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/Hazard/MapServer/2",
        coverage: "state",
        propertyKey: [
            "OBJECTID",
            "EPI_NAME",
            "LGA_NAME",
            "PUBLISHED_DATE",
            "COMMENCED_DATE",
            "CURRENCY_DATE",
            "AMENDMENT",
            "LAY_CLASS",
            "EPI_TYPE",
            "SHAPE",
        ],
        labelKey: "LAY_CLASS",

    },
    STORM_TIDE_HAZARD: {
        id: "NSW_STORM_TIDE_HAZARD",
        name: "NSW Storm Tide Hazard",
        url: "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Hazards/Storm_Tide_Hazard/MapServer/0",  // Placeholder URL as not provided
        coverage: "state",
        propertyKey: [],
        labelKey: "",
    },
    HERITAGE_ZONES: {
        id: "NSW_HERITAGE_ZONES",
        name: "NSW Heritage Zones",
        url: "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/EPI_Primary_Planning_Layers/MapServer/0",
        coverage: "state",
        propertyKey: [
            "OBJECTID",
            "EPI_NAME",
            "LGA_NAME",
            "PUBLISHED_DATE",
            "COMMENCED_DATE",
            "CURRENCY_DATE",
            "AMENDMENT",
            "MAP_TYPE",
            "MAP_NAME",
            "LAY_NAME",
            "LAY_CLASS",
            "H_ID",
            "H_NAME",
            "SIG",
            "LEGIS_REF_CLAUSE",
            "PCO_REF_KEY",
            "EPI_TYPE",
            "SHAPE",
        ],
        labelKey: "LAY_CLASS",
    }
}

const QLD_LAYER_INFO: LayerInfo = {
    LANDIND_ZONES: [
        {
            id: "QLD_LAND_ZONING",
            name: "QLD Land Zoning",
            url: "https://spatial-gis.information.qld.gov.au/arcgis/rest/services/PlanningCadastre/LandUse/MapServer/0",
            coverage: "state",
            propertyKey: [
                "objectid",
                "year",
                "qlump_code",
                "alum_code",
                "secondary",
                "tertiary",
                "commodity",
                "management",
                "ruleid",
                "shape",
                "st_area(shape)",
                "st_perimeter(shape)",
                "primary_",
            ],
            labelKey: "qlump_code",
        }
    ],
    FLOOD_HAZARD: [
        {
            id: "QLD_FLOOD_HAZARD",
            name: "QLD Flood Hazard",
            url: "https://spatial-gis.information.qld.gov.au/arcgis/rest/services/Boundaries/AdminBoundariesFramework/MapServer/15",
            coverage: "state",
            propertyKey: [
                "objectid",
                "sub_name",
                "sub_number",
                "qra_supply",
                "sub_name2",
                "version",
                "currency",
                "globalid",
                "shape",
                "st_area(shape)",
                "st_perimeter(shape)",
            ],
            labelKey: "sub_name",
        }
    ],
    BUSHFIRE_HAZARD: [
        {
            id: "QLD_BUSHFIRE_HAZARD",
            name: "QLD Bushfire Hazard",
            url: "https://spatial-gis.information.qld.gov.au/arcgis/rest/services/Boundaries/AdminBoundariesFramework/MapServer/14",
            coverage: "state",
            propertyKey: [
                "objectid",
                "zone",
                "subzone",
                "frequency",
                "freqmin",
                "freqmax",
                "description",
                "status",
                "source",
                "src_comment",
                "vetting",
                "pos_acc",
                "shape",
                "st_area(shape)",
                "st_perimeter(shape)",
            ],
            labelKey: "zone",
        }
    ],
    LANDSLIDE_HAZARD: {
        id: "QLD_LANDSLIDE_HAZARD",
        name: "QLD Landslide Hazard",
        url: "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Hazards/Landslide_Hazard/MapServer/0",  // Placeholder URL as not provided
        coverage: "state",
        propertyKey: [],
        labelKey: "",
    },
    STORM_TIDE_HAZARD: {
        id: "QLD_STORM_TIDE_HAZARD",
        name: "QLD Storm Tide Hazard",
        url: "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Hazards/Storm_Tide_Hazard/MapServer/0",  // Placeholder URL as not provided
        coverage: "state",
        propertyKey: [],
        labelKey: "",
    },
    HERITAGE_ZONES: {
        id: "QLD_HERITAGE_ZONES",
        name: "QLD Heritage Zones",
        url: "https://spatial-gis.information.qld.gov.au/arcgis/rest/services/Boundaries/AdminBoundariesFramework/MapServer/78",
        coverage: "state",
        propertyKey: [
            "placename",
            "place_id",
            "entrydate",
            "area_sqm",
            "accuracy",
            "status",
            "objectid",
            "shape",
        ],
        labelKey: "placename",
    }
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

export const getLayersForView = (view: BBBox, layer: Layers): LayerRegistry[] => {
    const statesInView = coordToAUStates(view);
    const lgasInView = coordsToJurisdictions(view);

    const layers: LayerRegistry[] = [];

    statesInView.forEach((state) => {
        const layerInfo = stateLayerMapping[state][layer];
        if (Array.isArray(layerInfo)) {
            layerInfo.forEach((layerItem) => {
                if (layerItem.coverage === "state") {
                    layers.push(layerItem);
                }
                else if (layerItem.coverage === "lga" && layerItem.jurisdiction && lgasInView.includes(layerItem.jurisdiction)) {
                    layers.push(layerItem);
                }
            });
        }
        else {
            layers.push(layerInfo);
        }
    });
    return layers;
}