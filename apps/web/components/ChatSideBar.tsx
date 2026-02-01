"use client";
import { useChat } from "@ai-sdk/react";
import remarkGfm from "remark-gfm";
import { useEffect, useRef, useState } from "react";
import { DefaultChatTransport } from "ai";
import {
  ArrowDownIcon,
  Bot,
  SendHorizonalIcon,
  SparklesIcon,
} from "lucide-react";

import { cn, fetchWithErrorHandlers } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ChatMessageAI } from "@/types/ai";
import { v4 as generateUUID } from "uuid";
import { useAutoResume } from "@/hooks/use-auto-resume";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useUserChats } from "@/context/ChatContext";
import { Response } from "./elements/response";
import { ScrollArea } from "./ui/scroll-area";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { Id } from "@propure/convex/dataModel";

interface ChatSidebarProps {
  open: boolean;
  send?: string;
  activeSessionId?: string;
  initialMessages: ChatMessageAI[];
  isLoading: boolean;
  className?: string;
}

export function ChatSidebar({
  open,
  send,
  initialMessages,
  activeSessionId,
  isLoading,
  className,
}: ChatSidebarProps) {
  const [input, setInput] = useState("");
  const lastSentRef = useRef<string | null>(null);
  const scrollElRef = useRef<HTMLDivElement | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const { updateChatSessionTitle } = useUserChats();

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    const el = scrollElRef.current;
    if (!el) return;

    el.scrollTo({
      top: el.scrollHeight,
      behavior,
    });
  };

  const { messages, status, sendMessage, setMessages, resumeStream, error } =
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
              }),
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
            const titleData = dataPart.data as { title: string; id: string; generatedId: Id<"chatSessions"> };
            console.log("DATA PART", titleData)
            updateChatSessionTitle(titleData.id, titleData.title, titleData.generatedId);
            break;
        }
      },
      onError: (error) => {
        console.error("Chat error:", error);
      },
    });

  // Auto-scroll ONLY if already at bottom
  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom("auto");
    }
  }, [messages.length]);

  useEffect(() => {
    if (!send || !open) return;
    if (lastSentRef.current === send) return;

    lastSentRef.current = send;

    sendMessage({
      parts: [{ type: "text", text: send }],
    });
  }, [send, open]);

  useEffect(() => {
    const root = document.querySelector(
      "[data-radix-scroll-area-viewport]",
    ) as HTMLDivElement | null;

    if (!root) {
      console.warn("Scroll viewport not found");
      return;
    }

    scrollElRef.current = root;

    const onScroll = () => {
      const el = root;
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 24;

      setIsAtBottom(atBottom);
    };

    root.addEventListener("scroll", onScroll);
    onScroll(); // initialize state

    return () => {
      root.removeEventListener("scroll", onScroll);
    };
  }, []);

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
          // default behavior (floating sidebar)
          "fixed inset-y-0 left-0 z-20 w-96",
          // Propure dark panel
          "bg-[#1a1f26]",
          "border-r border-white/10 shadow-2xl",
          "transition-transform duration-300 ease-in-out",
          "flex flex-col",
          open ? "translate-x-0" : "-translate-x-full",
          // when embedded in split view, override fixed positioning
          className &&
            "static z-10 w-auto translate-x-0 rounded-none border-r-0 border-l border-white/10",
          className,
        )}
      >
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full px-4 py-3">
            <div className="flex flex-col gap-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex gap-2",
                    i % 2 === 0 ? "justify-end" : "justify-start",
                  )}
                >
                  {i % 2 !== 0 && (
                    <div className="h-8 w-8 rounded-full bg-white/10 animate-pulse" />
                  )}

                  <div
                    className={cn(
                      "h-10 rounded-lg animate-pulse",
                      i % 2 === 0
                        ? "w-[60%] bg-[#0d7377]/20 border border-[#0d7377]/20"
                        : "w-[75%] bg-white/5 border border-white/10",
                    )}
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <form className="border-t border-white/10 px-4 py-3 bg-[#242b33]">
          <div className="relative">
            <Textarea
              disabled
              rows={1}
              placeholder="Ask about properties, data, or insights…"
              className="resize-none pr-12 rounded-lg border border-white/10 bg-[#1a1f26]/90 text-sm text-[#f7f9fc] placeholder:text-white/40 focus-visible:ring-0"
            />
            <Button
              type="submit"
              size="icon"
              disabled
              className="absolute right-2 bottom-2 h-8 w-8 rounded-full bg-white/10 text-white/40"
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
        // default behavior (floating sidebar)
        "fixed inset-y-0 left-0 z-20 w-96",
        // Propure dark panel
        "bg-[#1a1f26]",
        "border-r border-white/10 rounded-r-xl shadow-2xl",
        "transition-transform duration-300 ease-in-out",
        "flex flex-col", // ✅ critical
        open ? "translate-x-0" : "-translate-x-full",
        // when embedded in split view, override fixed positioning
        className &&
          "static z-10 w-auto translate-x-0 rounded-none border-r-0 border-l border-white/10",
        className,
      )}
    >
      {/* ================= Messages ================= */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <ScrollAreaPrimitive.Viewport className="h-full px-4 py-3">
            <div className="flex flex-col gap-4">
              {messages.map(
                (msg) =>
                  msg.parts.some(
                    (part) =>
                      part.type === "text" && part.text.trim().length > 0,
                  ) && (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex gap-2",
                        msg.role === "user" ? "justify-end" : "justify-start",
                      )}
                    >
                      {/* Agent Avatar */}
                      {msg.role !== "user" && (
                        <Avatar className="h-8 w-8 mt-0.5 border border-white/10 bg-[#242b33]">
                          <AvatarFallback className="bg-[#242b33] text-[#1a9599]">
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}

                      {/* Message Bubble */}
                      <div
                        className={cn(
                          "max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed",
                          msg.role === "user"
                            ? "bg-[#0d7377]/20 text-[#f7f9fc] border border-[#0d7377]/30"
                            : "bg-[#242b33]/85 text-[#f7f9fc] border border-white/10",
                        )}
                      >
                        {msg.parts.map((part, i) =>
                          part.type === "text" ? (
                            <div
                              key={i}
                              className="prose prose-sm m-0 p-0 max-w-none prose-invert"
                            >
                              <Response
                                controls={{
                                  table: true, // Show table download button
                                }}
                                remarkPlugins={[remarkGfm]}
                              >
                                {part.text}
                              </Response>
                            </div>
                          ) : null,
                        )}
                      </div>
                    </div>
                  ),
              )}

              {status === "streaming" && <ThinkingMessage />}
              {error && (
                <div className="max-w-[85%] rounded-lg bg-red-500/10 text-red-200 border border-red-500/20 self-center px-3 py-2 text-sm leading-relaxed">
                  {error.message ||
                    "An error occurred while processing your chat."}
                </div>
              )}
            </div>
          </ScrollAreaPrimitive.Viewport>
        </ScrollArea>

        {/* Scroll to bottom button */}
        <button
          type="button"
          aria-label="Scroll to bottom"
          onClick={() => scrollToBottom()}
          className={cn(
            "absolute bottom-24 left-1/2 -translate-x-1/2 z-50",
            "rounded-full border border-white/10 bg-[#242b33] p-2 shadow-xl transition-all",
            isAtBottom
              ? "pointer-events-none opacity-0 scale-90"
              : "opacity-100 scale-100 hover:bg-white/5",
          )}
        >
          <ArrowDownIcon className="h-4 w-4 text-[#f7f9fc]" />
        </button>
      </div>

      {/* ================= Composer ================= */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!input.trim()) return;
          sendMessage({ parts: [{ type: "text", text: input }] });
          setInput("");
        }}
        className="border-t border-white/10 px-4 py-3 bg-[#242b33]"
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
                160,
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
            className={cn(
              "resize-none pr-12 rounded-lg text-sm focus-visible:ring-0",
              "border border-white/10 bg-[#1a1f26]/90",
              "text-[#f7f9fc] placeholder:text-white/40",
              "focus:border-[#0d7377]",
            )}
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
                ? "bg-gradient-to-br from-[#0d7377] to-[#095456] text-white hover:brightness-110"
                : "bg-white/10 text-white/40",
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
        <div className="-mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#242b33] ring-1 ring-white/10">
          <div className="animate-pulse">
            <SparklesIcon size={14} />
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 md:gap-4">
          <div className="flex items-center gap-1 p-0 text-white/60 text-sm">
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
