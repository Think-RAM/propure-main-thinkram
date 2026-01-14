import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ChatSDKError, ErrorCode } from "./ai-error";
import { ChatMessage } from "@prisma/client";
import { ChatMessageAI, ChatTools } from "@/types/ai";
import { UIDataTypes, UIMessagePart } from "ai";
import { formatISO } from "date-fns";
import { AustralianState, BBBox, getLayersForView, JuridsictionCoords, Jurisdiction, Layers, StateCoords } from "./map/layers";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function fetchWithErrorHandlers(
  input: RequestInfo | URL,
  init?: RequestInit,
) {
  try {
    const response = await fetch(input, init);

    if (!response.ok) {
      const { code, cause } = await response.json();
      throw new ChatSDKError(code as ErrorCode, cause);
    }

    return response;
  } catch (error: unknown) {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new ChatSDKError('offline:chat');
    }

    throw error;
  }
}

export function convertToUIMessages(messages: ChatMessage[]): ChatMessageAI[] {
  return messages.map((message) => ({
    id: message.id,
    role: message.role as 'user' | 'assistant' | 'system',
    parts: message.toolCalls as UIMessagePart<UIDataTypes, ChatTools>[],
    metadata: {
      createdAt: formatISO(message.createdAt),
    },
  }));
}

export function convertCurrency(value: number | string, locale: string = 'en-AU', currency: string = 'AUD', decimal: number = 2): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: decimal,
  }).format(typeof value === "string" ? parseFloat(value.replace(/[^0-9.-]+/g, "")) : value);
}

export function normalizeBBox(b: BBBox): BBBox {
  const minLat = Math.min(b.minLat, b.maxLat);
  const maxLat = Math.max(b.minLat, b.maxLat);
  const minLng = Math.min(b.minLng, b.maxLng);
  const maxLng = Math.max(b.minLng, b.maxLng);
  return { minLat, minLng, maxLat, maxLng };
}

export function bboxesIntersect(a: BBBox, b: BBBox): boolean {
  const A = normalizeBBox(a);
  const B = normalizeBBox(b);

  // If one is completely left/right/up/down of the other → no intersection
  return !(
    A.maxLng < B.minLng ||
    A.minLng > B.maxLng ||
    A.maxLat < B.minLat ||
    A.minLat > B.maxLat
  );
}

export function pointInBBox(lat: number, lng: number, b: BBBox): boolean {
  const B = normalizeBBox(b);
  return lat >= B.minLat && lat <= B.maxLat && lng >= B.minLng && lng <= B.maxLng;
}

export function coordToAUStates(
  view: BBBox
): AustralianState[] {
  const V = normalizeBBox(view);

  const inView: AustralianState[] = [];

  for (const s in StateCoords) {
    const state = s as AustralianState;
    if (bboxesIntersect(V, StateCoords[state])) inView.push(state);
  }

  // ACT is special: it sits inside NSW bbox, so bbox-intersection with NSW will
  // almost always include NSW when ACT is visible. We want ACT too when visible.
  if (bboxesIntersect(V, StateCoords[AustralianState.ACT])) {
    inView.push(AustralianState.ACT);
  }

  return inView;
}

export function coordsToJurisdictions(view: BBBox): Jurisdiction[] {
  const V = normalizeBBox(view);

  const inView: Jurisdiction[] = [];

  for (const j in JuridsictionCoords) {
    const juris = j as Jurisdiction;
    if (bboxesIntersect(V, JuridsictionCoords[juris])) {
      inView.push(juris);
    }
  }

  return inView;
}

type ArcGisFeature = { attributes: Record<string, any> };

export async function fetchDetailsAtPoint(layerId: Layers, lat: number, lng: number) {
  const bbBox: BBBox = {
    minLat: lat - 0.0001,
    minLng: lng - 0.0001,
    maxLat: lat + 0.0001,
    maxLng: lng + 0.0001,
  };
  const layerData = getLayersForView(bbBox, layerId);
  const params = new URLSearchParams({
    f: "json",
    where: "1=1",
    geometry: `${lng},${lat}`,
    geometryType: "esriGeometryPoint",
    inSR: "4326", // ✅ FIX
    spatialRel: "esriSpatialRelIntersects",
    outFields: "*",
    returnGeometry: "false",
    resultRecordCount: "5",
  });

  const layer = layerData[0];

  try {
    const res = await fetch(`${layer.url}/query?${params.toString()}`);
    const json = await res.json();
    if (!json.error) {
      return {
        data: json.features.length > 0 ? json.features[0] as ArcGisFeature : {} as ArcGisFeature,
        attrs: layer.propertyKey,
      };
    }
  } catch (error) {
    console.error(`Failed to fetch from layer ${layer.url}:`, error);
  }

  return {
    data: {} as ArcGisFeature,
    attrs: layer.propertyKey,
  };
}

