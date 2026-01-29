import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { Id } from "../_generated/dataModel";

export const getChatById = query({
  args: { id: v.id("chatSessions") },
  handler: async (ctx, { id }) => {
    const chat = await ctx.db.get("chatSessions", id);
    // return chat;

    if (!chat) {
      return null;
    }

    const chatMessages = await ctx.db
      .query("chatMessages")
      .withIndex("by_session", (q) => q.eq("sessionId", chat._id))
      .collect();
    return {
      ...chat,
      messages: chatMessages,
    };
  },
});

export const getUserChatSessions = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    const userId = (identity.metadata as any)?.application_id as Id<"users">;
    console.log(`User ID ${userId}`)
    const chatSessions = await ctx.db
      .query("chatSessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    console.log(`Returned Data Length ${chatSessions.length}`)
    chatSessions.sort((a, b) => b.updatedAt - a.updatedAt);
    return chatSessions;
  },
});

export const saveChatSession = mutation({
  args: {
    strategyId: v.optional(v.id("strategies")),
    title: v.optional(v.string()),
    userId: v.id("users"),
    // id: v.optional(v.string()),
  },
  handler: async (ctx, { strategyId, title = "New Chat", userId }) => {
    const chatSessionId = await ctx.db.insert("chatSessions", {
      userId,
      strategyId,
      title,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      chatMessages: [],
    });
    return chatSessionId;
  },
});

export const updateChatTitleById = mutation({
  args: {
    chatId: v.id("chatSessions"),
    title: v.string(),
  },
  handler: async (ctx, { chatId, title }) => {
    await ctx.db.patch("chatSessions", chatId, { title });
  },
});

export const updateMessage = mutation({
  args: {
    id: v.optional(v.id("chatMessages")),
    updatedParts: v.array(v.any()), // tighten later
    role: v.union(
      v.literal("user"),
      v.literal("assistant"),
      v.literal("system"),
    ),
    chatSessionId: v.id("chatSessions"),
  },
  handler: async (ctx, { id, updatedParts, role, chatSessionId }) => {
    const existing = id ? await ctx.db.get(id) : null;

    if (id && existing) {
      // equivalent to Prisma update
      await ctx.db.patch(id, {
        role,
        content: updatedParts,
      });
    } else {
      // equivalent to Prisma create
      const newMessageId = await ctx.db.insert("chatMessages", {
        role,
        content: updatedParts,
        sessionId: chatSessionId,
        timestamp: Date.now(),
        createdAt: Date.now(),
      });

      const chatSession = await ctx.db.get("chatSessions", chatSessionId);
      await ctx.db.patch("chatSessions", chatSessionId, {
        updatedAt: Date.now(),
        chatMessages: [...(chatSession?.chatMessages ?? []), newMessageId],
      });
    }
  },
});

export const saveMessages = mutation({
  args: {
    messages: v.array(
      v.object({
        id: v.optional(v.id("chatMessages")),
        role: v.union(
          v.literal("user"),
          v.literal("assistant"),
          v.literal("system"),
        ),
        parts: v.array(v.any()), // tighten later
        createdAt: v.float64(),
        chatId: v.id("chatSessions"),
      }),
    ),
  },
  handler: async (ctx, { messages }) => {
    for (const { id, role, parts, createdAt, chatId } of messages) {
      await ctx.db.insert("chatMessages", {
        role,
        content: parts,
        timestamp: createdAt,
        sessionId: chatId,
        createdAt,
      });
    }
  },
});
