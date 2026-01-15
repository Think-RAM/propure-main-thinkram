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

// Western Australia Layer Configuration
const WA_LAYER_INFO: LayerInfo = {
    LANDIND_ZONES: {
        id: "WA_LAND_ZONING",
        name: "WA Land Zoning",
        url: "https://public-services.slip.wa.gov.au/public/rest/services/SLIP_Public_Services/Property_and_Planning/MapServer/112",
        coverage: "state",
        propertyKey: [
            "objectid",
            "zone_numbe",
            "zone",
            "add_label",
            "rest_label",
            "specadd_la",
            "special_la",
            "label",
            "label_desc",
            "gazettal_d",
            "scheme_nam",
            "lga",
            "scheme_no",
            "shape",
        ],
        labelKey: "zone",
    },
    FLOOD_HAZARD: {
        id: "WA_FLOOD_HAZARD",
        name: "WA Flood Hazard (Climate Projections)",
        url: "https://public-services.slip.wa.gov.au/public/rest/services/SLIP_Public_Services/Climate/MapServer/0",
        coverage: "state",
        propertyKey: [
            "objectid",
            "x",
            "y",
            "uniqueid",
            "model_tags",
            "shape",
            "st_area(shape)",
            "st_perimeter(shape)",
        ],
        labelKey: "uniqueid",
    },
    BUSHFIRE_HAZARD: {
        id: "WA_BUSHFIRE_HAZARD",
        name: "WA Bushfire Prone Areas",
        url: "https://public-services.slip.wa.gov.au/public/rest/services/SLIP_Public_Services/Bush_Fire_Prone_Areas/MapServer/17",
        coverage: "state",
        propertyKey: [
            "designation",
            "lga",
            "objectid",
            "type",
            "designationdate",
            "shape",
            "st_area(shape)",
            "st_perimeter(shape)",
        ],
        labelKey: "designation",
    },
    LANDSLIDE_HAZARD: {
        id: "WA_LANDSLIDE_HAZARD",
        name: "WA Landslide Hazard",
        url: "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Hazards/Landslide_Hazard/MapServer/0", // Placeholder - no WA specific data
        coverage: "state",
        propertyKey: [],
        labelKey: "",
    },
    STORM_TIDE_HAZARD: {
        id: "WA_STORM_TIDE_HAZARD",
        name: "WA Storm Tide Hazard",
        url: "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Hazards/Storm_Tide_Hazard/MapServer/0", // Placeholder - no WA specific data
        coverage: "state",
        propertyKey: [],
        labelKey: "",
    },
    HERITAGE_ZONES: {
        id: "WA_HERITAGE_ZONES",
        name: "WA Heritage Register",
        url: "https://public-services.slip.wa.gov.au/public/rest/services/SLIP_Public_Services/People_and_Society/MapServer/7",
        coverage: "state",
        propertyKey: [
            "objectid",
            "place_no",
            "place_name",
            "location",
            "lga",
            "her_record",
            "date_modif",
            "cluster",
            "more_info",
            "shape_leng",
            "shape",
            "st_area(shape)",
            "st_perimeter(shape)",
        ],
        labelKey: "place_name",
    }
}

// South Australia Layer Configuration
const SA_LAYER_INFO: LayerInfo = {
    LANDIND_ZONES: {
        id: "SA_LAND_ZONING",
        name: "SA Land Use (Biologically Important Areas)",
        url: "https://gis.environment.gov.au/gispubmap/rest/services/ogc_services/Biologically_Important_Areas/MapServer/1",
        coverage: "state",
        propertyKey: [],
        labelKey: "",
    },
    FLOOD_HAZARD: {
        id: "SA_FLOOD_HAZARD",
        name: "SA Flood Hazard (National Heritage)",
        url: "https://gis.environment.gov.au/gispubmap/rest/services/ogc_services/National_Heritage_List/FeatureServer/0",
        coverage: "state",
        propertyKey: [],
        labelKey: "",
    },
    BUSHFIRE_HAZARD: {
        id: "SA_BUSHFIRE_HAZARD",
        name: "SA Bushfire Hazard (World Heritage)",
        url: "https://gis.environment.gov.au/gispubmap/rest/services/ogc_services/World_Heritage_Areas/MapServer/0",
        coverage: "state",
        propertyKey: [],
        labelKey: "",
    },
    LANDSLIDE_HAZARD: {
        id: "SA_LANDSLIDE_HAZARD",
        name: "SA Landslide Hazard",
        url: "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Hazards/Landslide_Hazard/MapServer/0", // Placeholder
        coverage: "state",
        propertyKey: [],
        labelKey: "",
    },
    STORM_TIDE_HAZARD: {
        id: "SA_STORM_TIDE_HAZARD",
        name: "SA Storm Tide Hazard",
        url: "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Hazards/Storm_Tide_Hazard/MapServer/0", // Placeholder
        coverage: "state",
        propertyKey: [],
        labelKey: "",
    },
    HERITAGE_ZONES: {
        id: "SA_HERITAGE_ZONES",
        name: "SA Heritage Areas (World Heritage)",
        url: "https://gis.environment.gov.au/gispubmap/rest/services/ogc_services/World_Heritage_Areas/MapServer/0",
        coverage: "state",
        propertyKey: [],
        labelKey: "",
    }
}

// Australian Capital Territory Layer Configuration
const ACT_LAYER_INFO: LayerInfo = {
    LANDIND_ZONES: {
        id: "ACT_LAND_ZONING",
        name: "ACT Landscape Area Assets",
        url: "https://services1.arcgis.com/E5n4f1VY84i0xSjy/ArcGIS/rest/services/ACTGOV_Landscape_Area_Assets/FeatureServer/1",
        coverage: "state",
        propertyKey: [
            "OBJECTID",
            "ASSET_TYPE",
            "ASSET_SUB_TYPE",
            "ASSET_ID",
            "ASSET_NAME",
            "LOCATION",
            "MATERIAL",
            "EDGE_MATERIAL",
            "SURFACE_AREA",
            "SURFACE_AREA_UNIT",
            "SUBURB",
            "ADDRESS",
            "OWNERSHIP",
            "MAINTAINED_BY",
            "GlobalID",
            "Shape__Area",
            "Shape__Length",
        ],
        labelKey: "ASSET_SUB_TYPE",
    },
    FLOOD_HAZARD: {
        id: "ACT_FLOOD_HAZARD",
        name: "ACT Flood Extent",
        url: "https://services1.arcgis.com/E5n4f1VY84i0xSjy/ArcGIS/rest/services/ACTGOV_FLOOD_EXTENT/FeatureServer/0",
        coverage: "state",
        propertyKey: [
            "OBJECTID",
            "FLOOD_TYPE",
            "FLOOD_ZONE",
            "DESCRIPTION",
            "GlobalID",
            "Shape__Area",
            "Shape__Length",
        ],
        labelKey: "FLOOD_ZONE",
    },
    BUSHFIRE_HAZARD: {
        id: "ACT_BUSHFIRE_HAZARD",
        name: "ACT Fire Management Zones",
        url: "https://services1.arcgis.com/E5n4f1VY84i0xSjy/ArcGIS/rest/services/ESA_Fire_Management_Zones_Final/FeatureServer/0",
        coverage: "state",
        propertyKey: [
            "objectid",
            "zonetype",
            "iapz",
            "oapz",
            "vegtype",
            "reference",
            "notes",
            "Shape__Area",
            "Shape__Length",
            "CreationDate",
            "Creator",
            "EditDate",
            "Editor",
            "GlobalID",
        ],
        labelKey: "zonetype",
    },
    LANDSLIDE_HAZARD: {
        id: "ACT_LANDSLIDE_HAZARD",
        name: "ACT Landslide Hazard",
        url: "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Hazards/Landslide_Hazard/MapServer/0", // Placeholder
        coverage: "state",
        propertyKey: [],
        labelKey: "",
    },
    STORM_TIDE_HAZARD: {
        id: "ACT_STORM_TIDE_HAZARD",
        name: "ACT Storm Tide Hazard",
        url: "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Hazards/Storm_Tide_Hazard/MapServer/0", // Placeholder
        coverage: "state",
        propertyKey: [],
        labelKey: "",
    },
    HERITAGE_ZONES: {
        id: "ACT_HERITAGE_ZONES",
        name: "ACT Heritage Register",
        url: "https://services1.arcgis.com/E5n4f1VY84i0xSjy/ArcGIS/rest/services/ACTGOV_Heritage_Register/FeatureServer/1",
        coverage: "state",
        propertyKey: [
            "OBJECTID",
            "BLOCK_NUMBER",
            "SECTION_NUMBER",
            "LAND_USE_POLICY_ZONES",
            "OVERLAY_PROVISION_ZONES",
            "DIVISION_CODE",
            "DIVISION_NAME",
            "DIVISION_SHORT",
            "DISTRICT_CODE",
            "DISTRICT_NAME",
            "DISTRICT_SHORT",
            "NAME",
            "SITE_NAME",
            "DataRestrictions",
            "HRcategory",
            "HRcode",
            "HeritageID",
            "HRstatus",
            "last_edited_user",
            "last_edited_date",
            "created_user",
            "created_date",
            "Shape__Area",
            "Shape__Length",
        ],
        labelKey: "NAME",
    }
}

// Victoria Layer Configuration
const VIC_LAYER_INFO: LayerInfo = {
    LANDIND_ZONES: {
        id: "VIC_LAND_ZONING",
        name: "VIC Local Government Areas",
        url: "https://services2.arcgis.com/18ajPSI0b3ppsmMt/arcgis/rest/services/LGA/FeatureServer/0",
        coverage: "state",
        propertyKey: [
            "OBJECTID_1",
            "OBJECTID",
            "COLOR",
            "SH_NAME",
            "ABB_NAME",
        ],
        labelKey: "SH_NAME",
    },
    FLOOD_HAZARD: {
        id: "VIC_FLOOD_HAZARD",
        name: "VIC Flood Hazard (LGA)",
        url: "https://services2.arcgis.com/18ajPSI0b3ppsmMt/arcgis/rest/services/LGA/FeatureServer/0",
        coverage: "state",
        propertyKey: [
            "OBJECTID_1",
            "OBJECTID",
            "COLOR",
            "SH_NAME",
            "ABB_NAME",
        ],
        labelKey: "SH_NAME",
    },
    BUSHFIRE_HAZARD: {
        id: "VIC_BUSHFIRE_HAZARD",
        name: "VIC Bushfire Hazard (LGA)",
        url: "https://services2.arcgis.com/18ajPSI0b3ppsmMt/arcgis/rest/services/LGA/FeatureServer/0",
        coverage: "state",
        propertyKey: [
            "OBJECTID_1",
            "OBJECTID",
            "COLOR",
            "SH_NAME",
            "ABB_NAME",
        ],
        labelKey: "SH_NAME",
    },
    LANDSLIDE_HAZARD: {
        id: "VIC_LANDSLIDE_HAZARD",
        name: "VIC Landslide Hazard",
        url: "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Hazards/Landslide_Hazard/MapServer/0", // Placeholder
        coverage: "state",
        propertyKey: [],
        labelKey: "",
    },
    STORM_TIDE_HAZARD: {
        id: "VIC_STORM_TIDE_HAZARD",
        name: "VIC Storm Tide Hazard",
        url: "https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Hazards/Storm_Tide_Hazard/MapServer/0", // Placeholder
        coverage: "state",
        propertyKey: [],
        labelKey: "",
    },
    HERITAGE_ZONES: {
        id: "VIC_HERITAGE_ZONES",
        name: "VIC Heritage Areas (Resurfacing)",
        url: "https://services2.arcgis.com/18ajPSI0b3ppsmMt/ArcGIS/rest/services/Area_of_Resurfacing_2019_20/FeatureServer/0",
        coverage: "state",
        propertyKey: [
            "OBJECTID",
            "Resurface",
            "Area",
            "GlobalID",
            "Shape__Area",
            "Shape__Length",
            "Bid_id",
            "Comments_1",
            "Comments_2",
            "JobStatus",
            "gisAREA",
            "Patch",
            "MixedType",
            "CNJobNumb",
        ],
        labelKey: "Resurface",
    }
}

export const LayerInfoLabelNames: Record<Layers, string[]> = {
    LANDIND_ZONES: ["LAY_CLASS", "tertiary"],
    FLOOD_HAZARD: ["LAY_CLASS", "sub_name"],
    BUSHFIRE_HAZARD: ["zone", "FireType"],
    LANDSLIDE_HAZARD: ["LAY_CLASS"],
    STORM_TIDE_HAZARD: ["LAY_CLASS"],
    HERITAGE_ZONES: ["LAY_CLASS", "placename"],
}

export const stateLayerMapping: Record<AustralianState, LayerInfo> = {
    [AustralianState.NSW]: NSW_LAYER_INFO,
    [AustralianState.VIC]: VIC_LAYER_INFO,
    [AustralianState.QLD]: QLD_LAYER_INFO,
    [AustralianState.WA]: WA_LAYER_INFO,
    [AustralianState.SA]: SA_LAYER_INFO,
    [AustralianState.TAS]: NSW_LAYER_INFO, // Tasmania still uses NSW as fallback
    [AustralianState.NT]: NSW_LAYER_INFO, // Northern Territory still uses NSW as fallback
    [AustralianState.ACT]: ACT_LAYER_INFO,
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