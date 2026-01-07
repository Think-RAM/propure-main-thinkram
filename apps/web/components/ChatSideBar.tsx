"use client";

import { useChat } from "@ai-sdk/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useRef, useState } from "react";
import { DefaultChatTransport } from "ai";
import { ArrowDownIcon, Bot, SendHorizonalIcon, SparklesIcon } from "lucide-react";

import { cn, fetchWithErrorHandlers } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ChatMessageAI } from "@/types/ai";
import { v4 as generateUUID } from "uuid";
import { useAutoResume } from "@/hooks/use-auto-resume";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useUserChats } from "@/context/ChatContext";

interface ChatSidebarProps {
  open: boolean;
  send?: string;
  activeSessionId?: string;
  initialMessages: ChatMessageAI[];
  isLoading: boolean;
}

export function ChatSidebar({
  open,
  send,
  initialMessages,
  activeSessionId,
  isLoading,
}: ChatSidebarProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const lastSentRef = useRef<string | null>(null);
  const isAtBottomRef = useRef(true);
  const [error, setError] = useState<Error | null>(null);
  const { updateChatSessionTitle } = useUserChats();

  const handleScroll = () => {
    const el = viewportRef.current;
    if (!el) return;

    const atBottom =
      Math.abs(el.scrollHeight - el.scrollTop - el.clientHeight) < 10;

    isAtBottomRef.current = atBottom;
  };

  const { messages, status, sendMessage, setMessages, resumeStream } =
    useChat<ChatMessageAI>({
      id: activeSessionId,
      messages: initialMessages,
      generateId: generateUUID,
      experimental_throttle: 100,
      transport: new DefaultChatTransport({
        api: "/api/chat",
        fetch: fetchWithErrorHandlers,
        prepareSendMessagesRequest(request) {
          const lastMessage = request.messages.at(-1);

          // Check if this is a tool approval continuation:
          // - Last message is NOT a user message (meaning no new user input)
          // - OR any message has tool parts that were responded to (approved or denied)
          const isToolApprovalContinuation =
            lastMessage?.role !== "user" ||
            request.messages.some((msg) =>
              msg.parts?.some((part) => {
                const state = (part as { state?: string }).state;
                return (
                  state === "approval-responded" || state === "output-denied"
                );
              })
            );

          return {
            body: {
              id: request.id,
              // Send all messages for tool approval continuation, otherwise just the last user message
              ...(isToolApprovalContinuation
                ? { messages: request.messages }
                : { message: lastMessage }),
              ...request.body,
            },
          };
        },
      }),
      onData: (dataPart) => {
        console.log("Data Parts: ", dataPart);
        switch (dataPart.type) {
          case "data-chat-title":
            const titleData = dataPart.data as { title: string; id: string };
            updateChatSessionTitle(titleData.id, titleData.title);
            break;
        }
      },
      onError: (error) => {
        console.error("Chat error:", error);
        setError(error);
      },
    });

  useEffect(() => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, [messages.length]);

  useEffect(() => {
    if (!send || !open) return;
    if (lastSentRef.current === send) return;

    lastSentRef.current = send;

    sendMessage({
      parts: [{ type: "text", text: send }],
    });
  }, [send, open]);

  useAutoResume({
    autoResume: true,
    initialMessages,
    resumeStream,
    setMessages,
  });

  if (isLoading) {
    return (
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-20 w-96",
          "bg-gradient-to-b from-white/95 via-white/90 to-cyan-50/95 backdrop-blur-lg",
          "border-r border-cyan-200/50 rounded-r-xl shadow-xl",
          "transition-transform duration-300 ease-in-out",
          "flex flex-col",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full px-4 py-3">
            <div className="flex flex-col gap-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "max-w-[85%] rounded-lg px-3 py-2 h-12 animate-pulse",
                    i % 2 === 0
                      ? "bg-cyan-100/50 self-end"
                      : "bg-white/50 border border-cyan-100 self-start"
                  )}
                />
              ))}
            </div>
          </ScrollArea>
        </div>

        <form className="border-t border-cyan-200/40 px-4 py-3">
          <div className="relative">
            <Textarea
              disabled
              rows={1}
              placeholder="Ask about properties, data, or insights…"
              className="resize-none pr-12 rounded-lg border border-cyan-200/60 bg-white/90 text-sm focus-visible:ring-0"
            />
            <Button
              type="submit"
              size="icon"
              disabled
              className="absolute right-2 bottom-2 h-8 w-8 rounded-full bg-cyan-200 text-cyan-600"
            >
              <SendHorizonalIcon className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-20 w-96",
        "bg-gradient-to-b from-white/95 via-white/90 to-cyan-50/95 backdrop-blur-lg",
        "border-r border-cyan-200/50 rounded-r-xl shadow-xl",
        "transition-transform duration-300 ease-in-out",
        "flex flex-col", // ✅ critical
        open ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* ================= Messages ================= */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full px-4 py-3">
          <div
            className="flex flex-col gap-3"
            ref={viewportRef}
            onScroll={handleScroll}
          >
            {messages.map(
              (msg) =>
                msg.parts.some(
                  (part) => part.type === "text" && part.text.trim().length > 0
                ) && (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-2",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {/* Agent Avatar */}
                    {msg.role !== "user" && (
                      <Avatar className="h-8 w-8 border border-cyan-200 bg-white">
                        <AvatarFallback className="bg-cyan-50 text-cyan-700">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={cn(
                        "max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed",
                        msg.role === "user"
                          ? "bg-cyan-100/70 text-gray-900"
                          : "bg-white/80 text-gray-800 border border-cyan-100"
                      )}
                    >
                      {msg.parts.map((part, i) =>
                        part.type === "text" ? (
                          <div
                            key={i}
                            className="prose prose-sm prose-cyan m-0 p-0"
                          >
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {part.text}
                            </ReactMarkdown>
                          </div>
                        ) : null
                      )}
                    </div>
                  </div>
                )
            )}

            {status === "streaming" && <ThinkingMessage />}
            {error && (
              <div className="max-w-[85%] rounded-lg bg-red-100/70 text-red-900 self-center px-3 py-2 text-sm leading-relaxed">
                {error.message ||
                  "An error occurred while processing your chat."}
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Hover to see scroll button */}
      <button
        aria-label="Scroll to bottom"
        className={`-translate-x-1/2 absolute bottom-4 left-1/2 z-10 rounded-full border bg-background p-2 shadow-lg transition-all hover:bg-muted ${
          isAtBottomRef.current
            ? "pointer-events-none scale-0 opacity-0"
            : "pointer-events-auto scale-100 opacity-100"
        }`}
        onClick={() =>
          bottomRef.current?.scrollIntoView({ behavior: "smooth" })
        }
        type="button"
      >
        <ArrowDownIcon className="size-4" />
      </button>

      {/* ================= Composer ================= */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!input.trim()) return;
          sendMessage({ parts: [{ type: "text", text: input }] });
          setInput("");
        }}
        className="border-t border-cyan-200/40 px-4 py-3"
      >
        <div className="relative">
          <Textarea
            value={input}
            rows={1}
            placeholder="Ask about properties, data, or insights…"
            onChange={(e) => {
              setInput(e.target.value);
              e.currentTarget.style.height = "auto";
              e.currentTarget.style.height = `${Math.min(
                e.currentTarget.scrollHeight,
                160
              )}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (input.trim()) {
                  sendMessage({
                    parts: [{ type: "text", text: input }],
                  });
                  setInput("");
                }
              }
            }}
            className="resize-none pr-12 rounded-lg border border-cyan-200/60 bg-white/90 text-sm focus-visible:ring-0"
          />

          <Button
            type="submit"
            size="icon"
            disabled={
              !input.trim() || status === "streaming" || status === "submitted"
            }
            className={cn(
              "absolute right-2 bottom-2 h-8 w-8 rounded-full",
              input.trim()
                ? "bg-gradient-to-br from-cyan-400 to-teal-500 text-white"
                : "bg-cyan-200 text-cyan-600"
            )}
          >
            <SendHorizonalIcon className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </aside>
  );
}

export const ThinkingMessage = () => {
  return (
    <div
      className="group/message fade-in w-full animate-in duration-300"
      data-role="assistant"
      data-testid="message-assistant-loading"
    >
      <div className="flex items-start justify-start gap-3">
        <div className="-mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-border">
          <div className="animate-pulse">
            <SparklesIcon size={14} />
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 md:gap-4">
          <div className="flex items-center gap-1 p-0 text-muted-foreground text-sm">
            <span className="animate-pulse">Thinking</span>
            <span className="inline-flex">
              <span className="animate-bounce [animation-delay:0ms]">.</span>
              <span className="animate-bounce [animation-delay:150ms]">.</span>
              <span className="animate-bounce [animation-delay:300ms]">.</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
