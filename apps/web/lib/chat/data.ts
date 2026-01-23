"use server";
import { ChatTools } from "@/types/ai";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@propure/db";
import { UIDataTypes, UIMessagePart } from "ai";

/**
 * Deep clones message parts using JSON serialization to ensure
 * they can be safely stored in the database without reference issues.
 */
function serializeMessageParts(
  parts: UIMessagePart<UIDataTypes, ChatTools>[],
): UIMessagePart<UIDataTypes, ChatTools>[] {
  return JSON.parse(JSON.stringify(parts));
}

/**
 * Extracts text content from message parts for the content field.
 * Concatenates all text parts, falling back to a summary if no text is found.
 */
function extractTextContent(
  parts: UIMessagePart<UIDataTypes, ChatTools>[],
): string {
  const textParts = parts
    .filter(
      (
        part,
      ): part is UIMessagePart<UIDataTypes, ChatTools> & {
        type: "text";
        text: string;
      } =>
        part.type === "text" &&
        typeof (part as { text?: string }).text === "string",
    )
    .map((part) => part.text);

  if (textParts.length > 0) {
    return textParts.join("\n");
  }

  // Fallback: describe what types of parts are present
  const partTypes = [...new Set(parts.map((p) => p.type))];
  return partTypes.length > 0 ? `[${partTypes.join(", ")}]` : "";
}

export const getChatById = async ({ id }: { id: string }) => {
  const chat = await prisma.chatSession.findUnique({
    where: { id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return chat;
};

export const saveChatSession = async ({
  userId,
  strategyId,
  title = "New Chat",
  id,
}: {
  userId: string;
  strategyId?: string;
  title?: string;
  id?: string;
}) => {
  await prisma.chatSession.create({
    data: {
      userId,
      strategyId,
      title,
      id,
    },
  });
};

export const updateChatTitleById = async ({
  chatId,
  title,
}: {
  chatId: string;
  title: string;
}) => {
  await prisma.chatSession.update({
    where: { id: chatId },
    data: { title },
  });
};

export async function updateMessage(
  id: string,
  updatedParts: UIMessagePart<UIDataTypes, ChatTools>[],
  role: "user" | "assistant" | "system",
  chatSessionId: string,
) {
  const serializedParts = serializeMessageParts(updatedParts);
  const content = extractTextContent(updatedParts);

  await prisma.chatMessage.upsert({
    where: { id },
    update: {
      toolCalls: serializedParts as any,
      content,
    },
    create: {
      id,
      role,
      toolCalls: serializedParts as any,
      createdAt: new Date(),
      chatSessionId,
      content,
    },
  });
}

export async function saveMessages(
  messages: Array<{
    id: string;
    role: "user" | "assistant" | "system";
    parts: UIMessagePart<UIDataTypes, ChatTools>[];
    createdAt: Date;
    chatId: string;
  }>,
) {
  await prisma.chatMessage.createMany({
    data: messages.map(({ id, role, parts, createdAt, chatId }) => {
      const serializedParts = serializeMessageParts(parts);
      const content = extractTextContent(parts);

      return {
        id,
        role,
        toolCalls: serializedParts as any,
        createdAt,
        chatSessionId: chatId,
        content,
      };
    }),
  });
}

export async function getUserChatSessions() {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User not authenticated");
    }
    const chatHistory = await prisma.chatSession.findMany({
      where: {
        user: {
          clerkUserId: userId,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return chatHistory;
  } catch (error) {
    console.error("Error fetching user chat sessions:", error);
    throw error;
  }
}
