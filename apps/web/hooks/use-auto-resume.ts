"use client";

import { ChatMessageAI } from "@/types/ai";
import type { UseChatHelpers } from "@ai-sdk/react";
import { useEffect } from "react";

export type UseAutoResumeParams = {
  autoResume: boolean;
  initialMessages: ChatMessageAI[];
  resumeStream: UseChatHelpers<ChatMessageAI>["resumeStream"];
  setMessages: UseChatHelpers<ChatMessageAI>["setMessages"];
};

export function useAutoResume({
  autoResume,
  initialMessages,
  resumeStream,
  setMessages,
}: UseAutoResumeParams) {
  useEffect(() => {
    if (!autoResume) {
      return;
    }

    const mostRecentMessage = initialMessages.at(-1);

    if (mostRecentMessage?.role === "user") {
      resumeStream();
    }

    // we intentionally run this effect once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoResume, initialMessages, resumeStream]);

  useEffect(() => {
    setMessages([...initialMessages]);
  }, [initialMessages, setMessages]);
}
