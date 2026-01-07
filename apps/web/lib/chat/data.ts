"use server";
import { ChatTools } from "@/types/ai";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@propure/db";
import { UIDataTypes, UIMessagePart } from "ai";

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

export async function updateMessage(id: string, updatedParts: UIMessagePart<UIDataTypes, ChatTools>[], role: 'user' | 'assistant' | 'system', chatSessionId: string) {
    await prisma.chatMessage.upsert({
        where: { id },
        update: {
            toolCalls: updatedParts as any,
        },
        create: {
            id,
            role,
            toolCalls: updatedParts as any,
            createdAt: new Date(),
            chatSessionId,
            content: "Any Content",
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
                }
            }
        });

        return chatHistory;
    } catch (error) {
        console.error("Error fetching user chat sessions:", error);
        throw error;
    }
}