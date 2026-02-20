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
import { google } from "@ai-sdk/google";
import { auth } from "@clerk/nextjs/server";
import { v4 as generateUUID } from "uuid";
import { ChatMessageAI } from "@/types/ai";
import { ChatSDKError } from "@/lib/ai-error";
import { StrategyAgentTool } from "@/lib/tools/agents/strategistAgent";
import { ResearcherAgentTool } from "@/lib/tools/agents/researcherAgent";
import { AnalystAgentTool } from "@/lib/tools/agents/analystAgent";
import { convertToUIMessages } from "@/lib/utils";
import { client } from "@propure/convex/client";
import {
  api,
  Doc
} from "@propure/convex/genereated";

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

function getTextFromMessage(message: ChatMessageAI[] | UIMessage[]): string {
  return message
    .filter(
      (msg): msg is NonNullable<typeof msg> => msg != null && msg.parts != null,
    )
    .flatMap((msg) => msg.parts)
    .filter((part) => part.type === "text")
    .map((part) => (part as { type: "text"; text: string }).text)
    .join("");
}

async function generateTitleFromUserMessage({
  message,
}: {
  message: UIMessage[] | ChatMessageAI[];
}) {
  const { text: title } = await generateText({
    model: google("gemini-2.0-flash-lite"),
    system: titlePrompt,
    prompt: getTextFromMessage(message),
  });

  console.log(`Chat Title ${title}`);

  return title;
}

/* ======================================================================
   ROUTE
   ====================================================================== */

export async function POST(req: Request) {
  const { id, message, messages, strategyId } = await req.json();

  console.log(`Processing Chat Id ${id}`)

  try {
    /* ---------------- Message Validation ---------------- */

    // Determine if this is a single message request or a messages array request
    // (tool approval continuations send `messages` array, normal requests send `message`)
    const isContinuationRequest = !message && Array.isArray(messages);

    if (isContinuationRequest) {
      // Validate messages array for continuation requests
      if (messages.length === 0) {
        console.error("Invalid continuation: messages array is empty");
        return new ChatSDKError("bad_request:chat").toResponse();
      }
    } else {
      // Validate single message for normal requests
      if (!message || typeof message !== "object") {
        console.error("Invalid message: message is missing or not an object");
        return new ChatSDKError("bad_request:chat").toResponse();
      }

      // Validate message has required parts structure
      if (!message.parts || !Array.isArray(message.parts) || !message.role) {
        console.error("Invalid message structure:", {
          hasParts: !!message.parts,
          partsIsArray: Array.isArray(message.parts),
          hasRole: !!message.role,
        });
        return new ChatSDKError("bad_request:chat").toResponse();
      }

      // Ensure message has an id (generate one if missing)
      if (!message.id) {
        message.id = generateUUID();
      }
    }

    /* ---------------- Auth ---------------- */

    const { userId } = await auth();
    if (!userId) {
      console.log("Unauthorized request to chat API");
      return new ChatSDKError("unauthorized:chat").toResponse();
    }

    /* ---------------- User Context ---------------- */
    const user = await client.query(api.functions.user.GetUserByClerkId, { clerkUserId: userId });

    if (!user) {
      console.log("User not found in chat API:", userId);
      return new ChatSDKError("unauthorized:chat").toResponse();
    }

    let chat = null;
    chat = await client.query(api.functions.chat.getChatById, { id });

    let messagesFromDb: Doc<"chatMessages">[] = [];
    let titlePromise: Promise<string> | null = null;

    if (chat) {
      if (chat.userId !== user._id) {
        return new ChatSDKError("forbidden:chat").toResponse();
      }
      messagesFromDb = chat.messages;
    } else if (message?.role === "user") {
      // Save chat immediately with placeholder title
      await client.mutation(api.functions.chat.saveChatSession, {
        id,
        title: "New chat",
        userId: user._id,
      });
    }

    let UIMessages = chat
      ? [...convertToUIMessages(messagesFromDb), message as ChatMessageAI]
      : [message as ChatMessageAI];

    if (isContinuationRequest) {
      // For continuation requests (tool approval, auto-continue after tool calls),
      // use the messages array directly from the client
      UIMessages = (messages as ChatMessageAI[]).filter(
        (msg): msg is ChatMessageAI =>
          msg != null && msg.parts != null && msg.role != null,
      );
    } else {
      // For normal requests, append the new message to existing DB messages
      UIMessages = (
        chat
          ? [...convertToUIMessages(messagesFromDb), message as ChatMessageAI]
          : [message as ChatMessageAI]
      ).filter(
        (msg): msg is ChatMessageAI =>
          msg != null && msg.parts != null && msg.role != null,
      );
    }

    // Safety check - ensure we have valid messages to process
    if (UIMessages.length === 0) {
      console.error("No valid messages to process after filtering");
      return new ChatSDKError("bad_request:chat").toResponse();
    }

    // Start title generation in parallel (only for new chats with user messages)
    if (!chat && !isContinuationRequest && message?.role === "user") {
      titlePromise = generateTitleFromUserMessage({ message: UIMessages });
    }

    const stream = createUIMessageStream({
      originalMessages: UIMessages,
      execute: async ({ writer: dataStream }) => {
        // Handle title generation in parallel
        if (titlePromise) {
          titlePromise.then((title) => {
            client.mutation(api.functions.chat.updateChatTitleById, {
              chatId: id,
              title,
            });

            // updateChatTitleById({ chatId: id, title });
            dataStream.write({
              type: "data-chat-title",
              data: {
                title,
                id
              },
            });
          })
        }
        /* ---------------- AI Stream ---------------- */

        const result = streamText({
          model: google("gemini-2.5-flash"),
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(UIMessages),
          stopWhen: stepCountIs(20),
          experimental_transform: smoothStream({ chunking: "word" }),
          // toolChoice: "auto",
          tools: {
            // Strategy Agent
            strategist: StrategyAgentTool({ user, strategyId, dataStream }),
            // Researcher Agent
            researcher: ResearcherAgentTool({ dataStream }),
            // Analyst Agent
            analyst: AnalystAgentTool({ dataStream }),
          },
        });

        result.consumeStream();

        dataStream.merge(
          result.toUIMessageStream({
            sendReasoning: true,
          }),
        );
      },
      generateId: generateUUID,
      onFinish: async ({ messages: finishedMessages }) => {
        // Guard against undefined or empty messages
        if (!finishedMessages || finishedMessages.length === 0) {
          console.warn("onFinish called with no messages");
          return;
        }

        // Separate messages into new and updated
        const newMessages = [];
        const updatedMessageIds = [];

        for (const finishedMsg of finishedMessages) {
          // Skip invalid messages
          if (!finishedMsg?.id || !finishedMsg?.role || !finishedMsg?.parts) {
            console.warn("Skipping invalid message in onFinish:", finishedMsg);
            continue;
          }

          const existingMsg = UIMessages.find((m) => m?.id === finishedMsg.id);
          if (existingMsg) {
            updatedMessageIds.push(finishedMsg.id);
            await client.mutation(api.functions.chat.updateMessage, {
              id: finishedMsg.id, // this id is not equivalent to convex _id
              updatedParts: finishedMsg.parts,
              role: finishedMsg.role,
              chatSessionId: id,
            });
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
          await client.mutation(api.functions.chat.saveMessages, {
            messages: newMessages.map(({ ...rest }) => ({
              ...rest,
              createdAt: rest.createdAt.getTime(),
            })),
          });
        }
      },
      onError: (error) => {
        console.error("Stream error:", {
          error,
          chatId: id,
          userId: user._id,
          vercelId: req.headers.get("x-vercel-id"),
        });

        // Return user-friendly message based on error type
        if (error instanceof ChatSDKError) {
          return error.message;
        }
        if (error instanceof Error && error.message.includes("rate limit")) {
          return "Too many requests. Please wait a moment.";
        }
        return "An error occurred while processing your request.";
      },
    });

    return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
  } catch (error) {
    const vercelId = req.headers.get("x-vercel-id");

    console.error("Unhandled error in chat API:", error, { vercelId });
    return new ChatSDKError("offline:chat").toResponse();
  }
}
