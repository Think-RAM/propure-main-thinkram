import { ChatMessageAI, ChatTools } from "@/types/ai";
import { ChatMessage, prisma } from "@propure/db";
import { UIDataTypes, UIMessagePart } from "ai";
import { formatISO } from 'date-fns';

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
}

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
        }
    })
}

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

export async function updateMessage(id: string, updatedParts: UIMessagePart<UIDataTypes, ChatTools>[]) {
    await prisma.chatMessage.update({
        where: { id },
        data: {
            toolCalls: updatedParts as any,
        },
    });
}

export async function saveMessages(messages: Array<{
    id: string;
    role: 'user' | 'assistant' | 'system';
    parts: UIMessagePart<UIDataTypes, ChatTools>[];
    createdAt: Date;
    chatId: string;
}>) {
    await prisma.chatMessage.createMany({
        data: messages.map(({ id, role, parts, createdAt, chatId }) => ({
            id,
            role,
            toolCalls: parts as any,
            createdAt,
            chatSessionId: chatId,
            content: "Any Content",
        })),
    });
}