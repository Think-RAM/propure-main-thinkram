import { Doc } from "@propure/convex/genereated";
import { buildABSContext } from "./formatSuburbMarketData";
import { generateText, Output } from "ai";
import { google } from "@ai-sdk/google";
import z from "zod";
import { Layers } from "@/lib/map/layers";
import { addressToCoordinatesGoogle } from "@/lib/map/geoEncoding";
import { fetchDetailsAtPoint } from "@/lib/utils";

const model = google("gemini-2.5-flash")

export const generateRiskMetrics = async (suburbMetrics: Doc<"suburbMetrics">, absMarketData: Doc<"absMarketData">[], address: string) => {
    const riskScore = suburbMetrics.metrics.riskScore;
    const riskLabel = getRiskLabel(riskScore);

    const [geographicRisk, demographicRisk] = await Promise.all([
        geographicRiskScore(address),
        demographRiskScore(absMarketData),
    ]);

    const factors = [
        { name: "Market Volatility", value: suburbMetrics.metrics.risk.marketRisk },
        { name: "Liquidity Risk", value: suburbMetrics.metrics.risk.liquidityRisk },
        { name: "Economic Risk", value: suburbMetrics.metrics.risk.financialRisk },
        { name: "Concentration Risk", value: suburbMetrics.metrics.risk.concentrationRisk },
        { name: "Bushfire Risk", value: geographicRisk.bushfire },
        { name: "Flood Risk", value: geographicRisk.flood },
        { name: "Demographic Risk", value: demographicRisk },
    ];

    return {
        score: riskScore,
        label: riskLabel,
        factors,
    }
}

const getRiskLabel = (riskScore: number): string => {
    if (riskScore >= 80) return "High Risk";
    if (riskScore >= 60) return "Medium-High Risk";
    if (riskScore >= 40) return "Medium Risk";
    if (riskScore >= 20) return "Low-Medium Risk";
    return "Low Risk";
};

const demographRiskScore = async (absData: Doc<"absMarketData">[]) => {
    const context = `
            ${absData.map(buildABSContext).join("\n")}
    `
    const { output } = await generateText({
        model,
        prompt: `Based on the following ABS market data, provide a demographic risk score (0-100) for a property in this area, where 0 is very low risk and 100 is very high risk. Consider factors such as population growth, age distribution, income levels, and migration patterns. Provide a brief explanation for the score.\n\n${context}`,
        output: Output.object({
            schema: z.object({
                score: z.number().min(0).max(100).describe("A risk score between 0 and 100, where 0 is very low risk and 100 is very high risk."),
            })
        })
    })

    return output.score;
}

const DEFAULT_LAYERS: Layers[] = [
  "FLOOD_HAZARD",
  "BUSHFIRE_HAZARD",
];

type LayerInput = {
  layer: Layers;
  data: { attributes: Record<string, any> };
  attrs: string[];
};


const geographicRiskScore = async (address: string) => {
    const coords = await addressToCoordinatesGoogle(address);
    if(!coords) return {
        flood: 0,
        bushfire: 0,
    };
    const layerData = await Promise.all(
        DEFAULT_LAYERS.map(async (layer) => {
            const res = await fetchDetailsAtPoint(layer, coords.lat, coords.lng)
            return {
                layer,
                data: res.data,
                attrs: res.attrs,
            }
        })
    )
    const context = `
    ${buildLayerContextPrompt(layerData)}
    # RAW LAYER DATA (Backup)
    ${JSON.stringify(layerData, null, 2)}
    `
    const { output } = await generateText({
        model,
        prompt: `Based on the following environmental hazard data, provide a flood risk score and a bushfire risk score (0-100) for a property at this location, where 0 is very low risk and 100 is very high risk. Consider all relevant attributes and factors from the data.\n\n${context}`,
        output: Output.object({
            schema: z.object({
                flood: z.number().min(0).max(100).describe("Flood risk score between 0 and 100."),
                bushfire: z.number().min(0).max(100).describe("Bushfire risk score between 0 and 100."),
            })
        })
    })

    return {
        flood: output.flood,
        bushfire: output.bushfire,
    };
}

const formatKey = (key: string) =>
  key
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

const formatValue = (value: any): string => {
  if (value === null || value === undefined || value === "") return "Not available";

  if (typeof value === "number") return value.toLocaleString();
  if (typeof value === "boolean") return value ? "Yes" : "No";

  return String(value);
};

const layerDescriptions: Record<Layers, string> = {
    FLOOD_HAZARD: "Flood risk and inundation exposure",
    BUSHFIRE_HAZARD: "Bushfire risk and vegetation/fire exposure",
    LANDIND_ZONES: "",
    LANDSLIDE_HAZARD: "",
    STORM_TIDE_HAZARD: "",
    HERITAGE_ZONES: "",
    SCHOOL_ZONES: ""
};

export const buildLayerContextPrompt = (layers: LayerInput[]): string => {
  if (!layers.length) {
    return "No hazard or environmental risk data available for this property.";
  }

  const sections = layers.map(({ layer, data, attrs }) => {
    const attributes = data?.attributes || {};

    const extracted = attrs
      .map((key) => {
        const value = attributes[key];
        if (value === undefined || value === null || value === "") return null;

        return `${formatKey(key)}: ${formatValue(value)}`;
      })
      .filter(Boolean);

    if (!extracted.length) return null;

    return `
${layer.replace(/_/g, " ")} (${layerDescriptions[layer]}):
- ${extracted.join("\n- ")}
`.trim();
  });

  const validSections = sections.filter(Boolean);

  if (!validSections.length) {
    return "Hazard layers were present but contained no usable attribute data.";
  }

  return `
ENVIRONMENTAL & RISK INSIGHTS

The following hazard data has been retrieved from ArcGIS spatial layers and represents environmental risks associated with the property:

${validSections.join("\n\n")}
`.trim();
};