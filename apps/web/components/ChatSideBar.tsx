"use client";

import { useChat } from "@ai-sdk/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useRef, useState } from "react";
import { DefaultChatTransport } from "ai";
import { SendHorizonalIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ChatMessageAI } from "@/types/ai";

interface ChatSidebarProps {
  open: boolean;
  send?: string;
  activeSessionId?: string;
  initialMessages?: ChatMessageAI[];
}

export function ChatSidebar({ open, send }: ChatSidebarProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");

  const { messages, status, sendMessage } = useChat<ChatMessageAI>({
    experimental_throttle: 100,
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (send && open) {
      sendMessage({
        parts: [{ type: "text", text: send }],
      });
    }
  }, [send, open, sendMessage]);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-20 w-80",
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
          <div className="flex flex-col gap-3">
            {messages.map(
              (msg) =>
                msg.parts.some(
                  (part) => part.type === "text" && part.text.trim().length > 0
                ) && (
                  <div
                    key={msg.id}
                    className={cn(
                      "max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-cyan-100/70 text-gray-900 self-end"
                        : "bg-white/80 text-gray-800 border border-cyan-100 self-start"
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
                )
            )}

            {status === "streaming" && (
              <div className="text-xs text-cyan-600">Thinking…</div>
            )}

            <div ref={bottomRef} />
          </div>
        </ScrollArea>
      </div>

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
            disabled={!input.trim()}
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
