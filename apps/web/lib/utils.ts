import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ChatSDKError, ErrorCode } from "./ai-error";
import { ChatMessage } from "@prisma/client";
import { ChatMessageAI, ChatTools } from "@/types/ai";
import { UIDataTypes, UIMessagePart } from "ai";
import { formatISO } from "date-fns";

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