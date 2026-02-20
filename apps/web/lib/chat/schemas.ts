import z from "zod";

/**
 * Tool state schema representing AI SDK v6 tool execution states.
 * These states track the lifecycle of a tool call from pending to completion.
 */
export const toolStateSchema = z.enum([
  "pending",
  "partial-call",
  "call",
  "output-available",
  "output-error",
  "approval-requested",
  "approval-responded",
  "output-denied",
]);

export type ToolState = z.infer<typeof toolStateSchema>;

/**
 * Text part schema for plain text message content.
 */
export const textPartSchema = z.object({
  type: z.literal("text"),
  text: z.string(),
});

export type TextPart = z.infer<typeof textPartSchema>;

/**
 * Tool call part schema for tool invocation message content.
 * The type field starts with 'tool-' to distinguish tool-related parts.
 */
export const toolCallPartSchema = z.object({
  type: z.string().startsWith("tool-"),
  toolCallId: z.string(),
  toolName: z.string(),
  input: z.unknown(),
  state: toolStateSchema,
  output: z.unknown().optional(),
});

export type ToolCallPart = z.infer<typeof toolCallPartSchema>;

/**
 * Message part schema as a discriminated union of text and tool call parts.
 * Uses the 'type' field as the discriminator.
 */
export const messagePartSchema = z.discriminatedUnion("type", [
  textPartSchema,
  // For discriminatedUnion, we need a literal type for the discriminator
  // Since toolCallPartSchema uses startsWith, we create specific tool part schemas
  z.object({
    type: z.literal("tool-call"),
    toolCallId: z.string(),
    toolName: z.string(),
    input: z.unknown(),
    state: toolStateSchema,
    output: z.unknown().optional(),
  }),
  z.object({
    type: z.literal("tool-result"),
    toolCallId: z.string(),
    toolName: z.string(),
    input: z.unknown(),
    state: toolStateSchema,
    output: z.unknown().optional(),
  }),
]);

export type MessagePart = z.infer<typeof messagePartSchema>;

/**
 * Role schema for message sender identification.
 */
export const roleSchema = z.enum(["user", "assistant", "system"]);

export type Role = z.infer<typeof roleSchema>;

/**
 * Stored message schema for persisted chat messages.
 * Includes the message ID, role, parts array, and creation timestamp.
 */
export const storedMessageSchema = z.object({
  id: z.string(),
  role: roleSchema,
  parts: z.array(messagePartSchema),
  createdAt: z.string(),
});

export type StoredMessage = z.infer<typeof storedMessageSchema>;
