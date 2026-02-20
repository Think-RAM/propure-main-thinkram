"use client";
import { useChat } from "@ai-sdk/react";
import remarkGfm from "remark-gfm";
import { useEffect, useRef, useState } from "react";
import { DefaultChatTransport } from "ai";
import {
  ArrowDownIcon,
  Bot,
  PanelLeft,
  SendHorizonalIcon,
  SparklesIcon,
} from "lucide-react";
import { ToolResult } from "./chat/ToolResults";
import {
  AUS_CENTER,
  PropertiesFoundPayload,
  toSearchResult,
} from "@/lib/utils";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
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
import { useMap } from "@/context/MapContext";
import type { Id } from "@propure/convex/genereated";

interface ChatSidebarProps {
  open: boolean;
  send?: string;
  activeSessionId?: string;
  initialMessages: ChatMessageAI[];
  isLoading: boolean;
  className?: string;
  onBackToHistory: () => void;
}

export function ChatSidebar({
  open,
  send,
  initialMessages,
  activeSessionId,
  isLoading,
  className,
  onBackToHistory,
}: ChatSidebarProps) {
  const [input, setInput] = useState("");
  const lastSentRef = useRef<string | null>(null);
  const scrollElRef = useRef<HTMLDivElement | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const { updateChatSessionTitle } = useUserChats();
  const { setCenter, setResults } = useMap();

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
            const titleData = dataPart.data as { title: string; id: string };
            console.log("DATA PART", titleData);
            updateChatSessionTitle(titleData.id, titleData.title);
            break;
          case "data-properties-found":
            console.log("Properties Found Data: ", dataPart.data);
            const propData = dataPart.data as PropertiesFoundPayload;
            setCenter(propData.suburb.latLng || AUS_CENTER);
            setResults(propData.listings.map(toSearchResult));
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

  if (!open) return null;

  if (isLoading) {
    return (
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-20 w-[40vw] min-w-[320px] max-w-[600px]",
          "bg-[#1a1f26]/95 backdrop-blur-xl border-r border-white/10",
          "transition-transform duration-300 ease-in-out flex flex-col",
          open ? "translate-x-0" : "-translate-x-[-100%]",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-[#242b33]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0d7377] to-[#095456] flex items-center justify-center font-serif font-bold text-lg text-white">
              P
            </div>
            <span className="font-serif text-xl font-semibold text-[#f7f9fc]">
              Propure
            </span>
          </div>
          <div className="h-8 w-8 bg-gray-700 rounded animate-pulse" />
        </div>
        {/* Loading skeleton */}
        <ScrollArea className="h-full px-4 py-6">
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
                  <div className="h-8 w-8 rounded-full bg-gray-700 animate-pulse" />
                )}
                <div
                  className={cn(
                    "h-10 rounded-lg animate-pulse",
                    i % 2 === 0
                      ? "w-[60%] bg-gray-700"
                      : "w-[75%] bg-[#242b33] border border-white/10",
                  )}
                />
              </div>
            ))}
          </div>
        </ScrollArea>
        {/* Disabled input */}
        <form className="border-t border-white/10 px-4 py-3 bg-[#242b33]">
          <div className="relative">
            <Textarea
              disabled
              rows={1}
              placeholder="Ask about properties, data, or insights…"
              className="resize-none pr-12 rounded-lg border border-white/10 bg-[#1a1f26]/80 text-sm focus-visible:ring-0"
            />
            <Button
              type="submit"
              size="icon"
              disabled
              className="absolute right-2 bottom-2 h-8 w-8 rounded-full bg-[#0d7377]/40 text-[#0d7377]"
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
        "fixed inset-y-0 left-0 z-20 w-[40vw] min-w-[320px] max-w-[600px]",
        "bg-[#1a1f26]/95 backdrop-blur-xl border-r border-white/10",
        "transition-transform duration-300 ease-in-out flex flex-col",
        open ? "translate-x-0" : "-translate-x-[-100%]",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-[#242b33]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0d7377] to-[#095456] flex items-center justify-center font-serif font-bold text-lg text-white">
            P
          </div>
          <span className="font-serif text-xl font-semibold text-[#f7f9fc]">
            Propure
          </span>
        </div>
        {/* Optional: Add a toggle button or avatar here */}
        <div className="h-8 w-8 rounded">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                onClick={onBackToHistory}
                className="
                          bg-[#1a1f26]/90 backdrop-blur-md
                          border border-white/10
                          shadow-lg
                          hover:bg-[#242b33]
                        "
              >
                <PanelLeft className="h-5 w-5 text-[#0d7377]" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Open chats</TooltipContent>
          </Tooltip>
        </div>
      </div>
      {/* Chat messages */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full px-4 py-3">
          <div className="flex flex-col gap-4">
            {messages.map(
              (msg) =>
                msg.parts.some(
                  (part) => part.type === "text" && part.text.trim().length > 0,
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
                      <Avatar className="h-8 w-8 mt-0.5 border border-[#0d7377] bg-[#242b33]">
                        <AvatarFallback className="bg-[#0d7377] text-white">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    {/* Message Bubble */}
                    <div
                      className={cn(
                        "max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed",
                        msg.role === "user"
                          ? "bg-[#0d7377]/20 text-[#f7f9fc]"
                          : "bg-[#242b33] text-[#f7f9fc] border border-[#0d7377]/30",
                      )}
                    >
                      {msg.parts.map((part, i) =>
                        part.type === "text" ? (
                          <div
                            key={i}
                            className="m-0 p-0 w-full"
                          >
                            <Response
                              controls={{ table: true }}
                              remarkPlugins={[remarkGfm]}
                            >
                              {part.text}
                            </Response>
                          </div>
                        ) : part.type.startsWith("tool-") ? (
                          <div className="my-2" key={`tool-part-${i}`}>
                            <ToolResult part={part as any} />
                          </div>
                        ) : null,
                      )}
                    </div>
                  </div>
                ),
            )}
            {status === "streaming" && <ThinkingMessage />}
            {error && (
              <div className="max-w-[85%] rounded-lg bg-red-100/70 text-red-900 self-center px-3 py-2 text-sm leading-relaxed">
                {error.message ||
                  "An error occurred while processing your chat."}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      {/* Composer */}
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
            className="resize-none pr-12 rounded-lg border border-white/10 bg-[#1a1f26]/80 text-sm focus-visible:ring-0"
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
                ? "bg-gradient-to-br from-[#0d7377] to-[#095456] text-white"
                : "bg-[#0d7377]/40 text-[#0d7377]",
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
