import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ChatSDKError, ErrorCode } from "./ai-error";
import { ChatMessage } from "@prisma/client";
import { ChatMessageAI, ChatTools } from "@/types/ai";
import { UIDataTypes, UIMessagePart } from "ai";
import { formatISO } from "date-fns";
import { AustralianState } from "./map/layers";

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

export function coordToAUState(
  lat: number,
  lng: number
): AustralianState | null {

  // ACT — must come before NSW
  if (
    lat >= -35.92 && lat <= -35.12 &&
    lng >= 148.76 && lng <= 149.40
  ) {
    return AustralianState.ACT;
  }

  // Tasmania
  if (
    lat >= -43.75 && lat <= -39.20 &&
    lng >= 144.40 && lng <= 148.50
  ) {
    return AustralianState.TAS;
  }

  // Victoria
  if (
    lat >= -39.20 && lat <= -33.90 &&
    lng >= 140.90 && lng <= 150.00
  ) {
    return AustralianState.VIC;
  }

  // New South Wales
  if (
    lat >= -37.60 && lat <= -28.15 &&
    lng >= 140.99 && lng <= 153.64
  ) {
    return AustralianState.NSW;
  }

  // Queensland
  if (
    lat >= -28.20 && lat <= -10.00 &&
    lng >= 138.00 && lng <= 153.64
  ) {
    return AustralianState.QLD;
  }

  // South Australia
  if (
    lat >= -38.10 && lat <= -26.00 &&
    lng >= 129.00 && lng <= 141.00
  ) {
    return AustralianState.SA;
  }

  // Northern Territory
  if (
    lat >= -26.00 && lat <= -10.00 &&
    lng >= 129.00 && lng <= 138.00
  ) {
    return AustralianState.NT;
  }

  // Western Australia
  if (
    lat >= -35.20 && lat <= -13.50 &&
    lng >= 112.90 && lng <= 129.00
  ) {
    return AustralianState.WA;
  }

  return null;
}
