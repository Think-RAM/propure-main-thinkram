import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { Id } from "../_generated/dataModel";

export const getChatById = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const chat = await ctx.db.query("chatSessions").withIndex("by_session_id", (q) => q.eq("sessionId", id)).first();
    // return chat;

    if (!chat) {
      return null;
    }

    const chatMessages = await ctx.db
      .query("chatMessages")
      .withIndex("by_session", (q) => q.eq("sessionId", chat.sessionId))
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

export const getUserChatSessionsByUserId = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    const chatSessions = await ctx.db
      .query("chatSessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    chatSessions.sort((a, b) => b.updatedAt - a.updatedAt);
    return chatSessions;
  },
});

export const saveChatSession = mutation({
  args: {
    id: v.string(),
    strategyId: v.optional(v.id("strategies")),
    title: v.optional(v.string()),
    userId: v.id("users"),
    // id: v.optional(v.string()),
  },
  handler: async (ctx, { id, strategyId, title = "New Chat", userId }) => {
    const chatSessionId = await ctx.db.insert("chatSessions", {
      sessionId: id,
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
    chatId: v.string(),
    title: v.string(),
  },
  handler: async (ctx, { chatId, title }) => {
    const record = await ctx.db.query("chatSessions").withIndex("by_session_id", (q) => q.eq("sessionId", chatId)).first();
    if (!record) {
      throw new Error("Chat session not found");
    }
    await ctx.db.patch("chatSessions", record._id, {
      title,
      updatedAt: Date.now(),
    });
  },
});

export const updateMessage = mutation({
  args: {
    id: v.string(), // if no id, we create a new message
    updatedParts: v.array(v.any()), // tighten later
    role: v.union(
      v.literal("user"),
      v.literal("assistant"),
      v.literal("system"),
    ),
    chatSessionId: v.string(),
  },
  handler: async (ctx, { id, updatedParts, role, chatSessionId }) => {
    const existing = id ? await ctx.db.query("chatMessages").withIndex("by_message_id", (q) => q.eq("messageId", id)).first() : null;

    if (id && existing) {
      // equivalent to update
      await ctx.db.patch(existing._id, {
        role,
        content: updatedParts,
      });
    } else {
      // equivalent to create
      const newMessageId = await ctx.db.insert("chatMessages", {
        messageId: id,
        role,
        content: updatedParts,
        sessionId: chatSessionId,
        timestamp: Date.now(),
        createdAt: Date.now(),
      });

      const chatSession = await ctx.db.query("chatSessions").withIndex("by_session_id", (q) => q.eq("sessionId", chatSessionId)).first();
      if(!chatSession){
        throw new Error("Chat session not found");
      }
      await ctx.db.patch("chatSessions", chatSession._id, {
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
        id: v.string(),
        role: v.union(
          v.literal("user"),
          v.literal("assistant"),
          v.literal("system"),
        ),
        parts: v.array(v.any()), // tighten later
        createdAt: v.float64(),
        chatId: v.string(),
      }),
    ),
  },
  handler: async (ctx, { messages }) => {
    for (const { id, role, parts, createdAt, chatId } of messages) {
      await ctx.db.insert("chatMessages", {
        messageId: id,
        role,
        content: parts,
        timestamp: createdAt,
        sessionId: chatId,
        createdAt,
      });
    }
  },
});
