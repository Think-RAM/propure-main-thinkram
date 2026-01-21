"use server";
import clerkClient from "../clerk";

export async function revokeUserSessions(sessionId: string) {
  try {
    await clerkClient.sessions.revokeSession(sessionId);
    return;
  } catch (error) {
    console.error("Error revoking user sessions:", error);
    throw error;
  }
}