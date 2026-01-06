import {
  streamText,
  createUIMessageStream,
  JsonToSseTransformStream,
  stepCountIs,
  smoothStream,
  convertToModelMessages,
  generateText,
  UIMessage,
} from "ai";
import { google } from "@ai-sdk/google"

import { auth } from "@clerk/nextjs/server";
import { ChatMessage, prisma } from "@propure/db";
import { searchDomainProperties, searchRealestateProperties } from "@/lib/tools/propertySearchTools";
import { getDemographics, getEconomicIndicators, getPopulationProjections, getRbaRates, getSuburbProfile, getSuburbStats } from "@/lib/tools/marketTools";
import { getAuctionResults, getSalesHistory, getSoldProperties } from "@/lib/tools/salesTools";
import { calculateCashFlow, calculateROI } from "@/lib/tools/financialTools";
import { saveStrategy } from "@/lib/tools/strategyTools";
import { v4 as generateUUID } from "uuid";
import { ChatMessageAI } from "@/types/ai";
import { ChatSDKError } from "@/lib/ai-error";
import { convertToUIMessages, getChatById, saveChatSession, saveMessages, updateChatTitleById, updateMessage } from "@/lib/chat/data";

/* ======================================================================
   SYSTEM PROMPT
   ====================================================================== */

export const titlePrompt = `Generate a very short chat title (2-5 words max) based on the user's message.
Rules:
- Maximum 30 characters
- No quotes, colons, hashtags, or markdown
- Just the topic/intent, not a full sentence
- If the message is a greeting like "hi" or "hello", respond with just "New conversation"
- Be concise: "Weather in NYC" not "User asking about the weather in New York City"`;


const SYSTEM_PROMPT = `
You are the Propure AI assistant, helping users discover their ideal property
investment strategy in Australia. You coordinate between specialist agents:

- STRATEGIST: For strategy discovery and recommendations
- ANALYST: For financial calculations and risk assessment
- RESEARCHER: For market data and property search

Route user requests to the appropriate agent(s), synthesize their outputs,
and present cohesive responses. Always maintain context of the user's
situation, goals, and current strategy.

When multiple agents are needed, invoke them efficiently:
- Parallel: When outputs are independent
- Sequential: When one depends on another
- Feedback: When results need refinement
`;

function getTextFromMessage(message: ChatMessageAI | UIMessage): string {
  return message.parts
    .filter((part) => part.type === 'text')
    .map((part) => (part as { type: 'text'; text: string }).text)
    .join('');
}


async function generateTitleFromUserMessage({
  message,
}: {
  message: UIMessage;
}) {
  const { text: title } = await generateText({
    model: google("gemini-2.0-flash-lite"),
    system: titlePrompt,
    prompt: getTextFromMessage(message),
  });

  return title;
}


/* ======================================================================
   ROUTE
   ====================================================================== */

export async function POST(req: Request) {
  const { id, message, messages, strategyId } = await req.json();


  try {
    /* ---------------- Auth ---------------- */

    const { userId } = await auth();
    if (!userId) {
      console.log("Unauthorized request to chat API");
      return new ChatSDKError("unauthorized:chat").toResponse();
    }

    /* ---------------- User Context ---------------- */

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      include: {
        strategies: {
          where: strategyId
            ? { id: strategyId }
            : { status: "ACTIVE" },
          take: 1,
          orderBy: { updatedAt: "desc" },
        },
      },
    });

    if (!user) {
      console.log("User not found in chat API:", userId);
      return new ChatSDKError("unauthorized:chat").toResponse();
    }

    const activeStrategy = user.strategies[0];

    const strategyContext = activeStrategy
      ? `
        Current strategy:
        - Type: ${activeStrategy.type}
        - Budget: ${activeStrategy.budget ?? "Not set"}
        - Deposit: ${activeStrategy.deposit ?? "Not set"}
        - Risk: ${activeStrategy.riskTolerance ?? "Unknown"}
        `
      : "";

    /* ---------------- Chat Persistance ---------------- */
    const chat = await getChatById({ id });
    let messagesFromDb: ChatMessage[] = [];
    let titlePromise: Promise<string> | null = null;

    if (chat) {
      if (chat.userId !== user.id) {
        return new ChatSDKError("forbidden:chat").toResponse();
      }
      messagesFromDb = chat.messages;
    } else if (message?.role === "user") {
      // Save chat immediately with placeholder title
      await saveChatSession({
        id,
        userId: user.id,
        title: "New chat",
        strategyId: activeStrategy?.id,
      });

      // Start title generation in parallel (don't await)
      titlePromise = generateTitleFromUserMessage({ message });
    }

    const UIMessages = [...convertToUIMessages(messagesFromDb), message as ChatMessageAI];

    const stream = createUIMessageStream({
      originalMessages: UIMessages,
      execute: async ({ writer: dataStream }) => {
        // Handle title generation in parallel
        if (titlePromise) {
          titlePromise.then((title) => {
            updateChatTitleById({ chatId: id, title });
            dataStream.write({ type: "data-chat-title", data: title });
          });
        }
        /* ---------------- AI Stream ---------------- */

        const result = streamText({
          model: google("gemini-2.5-flash"),
          system: SYSTEM_PROMPT + strategyContext,
          messages: await convertToModelMessages(UIMessages),
          stopWhen: stepCountIs(12),
          experimental_transform: smoothStream({ chunking: "word" }),

          tools: {
            /* ============================================================
               PROPERTY SEARCH
               ============================================================ */

            searchDomainProperties: searchDomainProperties,

            searchRealestateProperties: searchRealestateProperties,

            /* ============================================================
               SUBURB & MARKET DATA
               ============================================================ */

            getSuburbStats: getSuburbStats,

            getSuburbProfile: getSuburbProfile,

            getDemographics: getDemographics,

            getPopulationProjections: getPopulationProjections,

            getRbaRates: getRbaRates,

            getEconomicIndicators: getEconomicIndicators,

            /* ============================================================
               SALES & AUCTIONS
               ============================================================ */

            getSalesHistory: getSalesHistory,

            getSoldProperties: getSoldProperties,

            getAuctionResults: getAuctionResults,

            /* ============================================================
               FINANCIAL ANALYSIS
               ============================================================ */

            calculateCashFlow: calculateCashFlow,

            calculateROI: calculateROI,

            /* ============================================================
               STRATEGY PERSISTENCE
               ============================================================ */

            saveStrategy: saveStrategy({ user, strategyId }),
          }
        });

        result.consumeStream();

        dataStream.merge(
          result.toUIMessageStream({
            sendReasoning: true,
          })
        );
      },
      generateId: generateUUID,
      onFinish: async ({ messages: finishedMessages }) => {
        // Separate messages into new and updated
        const newMessages = [];
        const updatedMessageIds = [];

        for (const finishedMsg of finishedMessages) {
          const existingMsg = UIMessages.find((m) => m.id === finishedMsg.id);
          if (existingMsg) {
            updatedMessageIds.push(finishedMsg.id);
            await updateMessage(finishedMsg.id, finishedMsg.parts);
          } else {
            newMessages.push({
              id: finishedMsg.id,
              role: finishedMsg.role,
              parts: finishedMsg.parts,
              createdAt: new Date(),
              chatId: id,
            });
          }
        }

        // Bulk save all new messages at once
        if (newMessages.length > 0) {
          await saveMessages(newMessages);
        }
      },
      onError: () => {
        return "Oops, an error occurred!";
      },
    });

    return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
  }
  catch (error) {
    const vercelId = req.headers.get("x-vercel-id");

    console.error("Unhandled error in chat API:", error, { vercelId });
    return new ChatSDKError("offline:chat").toResponse();
  }
}
