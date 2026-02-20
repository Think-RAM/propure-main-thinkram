"use client";
import { convertToUIMessages } from "@/lib/utils";
import { ChatMessageAI } from "@/types/ai";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { toast } from "sonner";
import { v4 as generateUUID } from "uuid";
// import { useQuery } from "@propure/convex";
import { api } from "@propure/convex/genereated";
import type { Doc, Id } from "@propure/convex/genereated";
import { useConvex } from "@propure/convex";

interface ChatContextType {
  historySidebarOpen: boolean;
  userChatSessions: Omit<Doc<"chatSessions">, "_id">[];
  activeSessionId: string | null;
  setActiveSession: (id: string | null) => void;
  updateChatSessionTitle: (
    id: string,
    title: string,
  ) => void;
  createNewChatSession: (send: string) => void;
  toggleHistorySidebar: (close?: boolean) => void;
  activeChatMessages: ChatMessageAI[];
  historyLoading: boolean;
  chatsLoading: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const client = useConvex();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userChatSessions, setUserChatSessions] = useState<
    Omit<Doc<"chatSessions">, "_id">[]
  >([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeChatMessages, setActiveChatMessages] = useState<ChatMessageAI[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isChatsLoading, setIsChatsLoading] = useState(false);

  const setActiveSession = useCallback(async (id: string | null) => {
    try {
      setActiveSessionId(id);
      setActiveChatMessages([]);
      if (id) {
        setIsChatsLoading(true);
        const fetchedMessages = await client.query(
          api.functions.chat.getChatById,
          { id },
        );
        setActiveChatMessages(
          fetchedMessages
            ? [...convertToUIMessages(fetchedMessages.messages)]
            : [],
        );
      }
    } catch (error) {
      console.error("Error loading chat session:", error);
      if (error instanceof Error) {
        toast.error(`Failed to load chat session: ${error.message}`);
      }
      setActiveChatMessages([]);
    } finally {
      setIsChatsLoading(false);
    }
  }, []);

  const updateChatSessionTitle = useCallback((id: string, title: string) => {
    setUserChatSessions((prevSessions) =>
      prevSessions.map((session) =>
        session.sessionId === id
          ? { ...session, title, updatedAt: Date.now() }
          : session,
      ),
    );
    // if (id !== generatedId) {
    //   setActiveSessionId(generatedId);
    // }
  }, []);

  const createNewChatSession = useCallback((send: string) => {
    const newSession: Omit<Doc<"chatSessions">, "_id"> = {
      sessionId: generateUUID(),
      title: "New Chat",
      userId: "" as Id<"users">,
      strategyId: undefined,
      _creationTime: Date.now(),
      updatedAt: Date.now(),
      createdAt: Date.now(),
      chatMessages: [],
    };
    setUserChatSessions((prevSessions) =>
      [...prevSessions, newSession].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
    );
    setActiveSessionId(newSession.sessionId);
    setActiveChatMessages([
      {
        id: generateUUID(),
        role: "user",
        parts: [{ type: "text", text: send }],
      },
    ]);
  }, []);

  const toggleHistorySidebar = useCallback((close?: boolean) => {
    setIsSidebarOpen(close === undefined ? (prev) => !prev : !close);
  }, []);

  useEffect(() => {
    const fetchUserChatSessions = async () => {
      try {
        setIsLoading(true);
        const chatHistory = await client.query(
          api.functions.chat.getUserChatSessions,
        );
        setUserChatSessions(chatHistory);
      } catch (error) {
        console.error("Error loading user chat sessions:", error);
        if (error instanceof Error) {
          toast.error(`Failed to load chat sessions: ${error.message}`);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserChatSessions();
  }, []);

  return (
    <ChatContext.Provider
      value={{
        userChatSessions,
        activeSessionId,
        setActiveSession,
        updateChatSessionTitle,
        toggleHistorySidebar,
        historySidebarOpen: isSidebarOpen,
        createNewChatSession,
        activeChatMessages,
        historyLoading: isLoading,
        chatsLoading: isChatsLoading,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useUserChats = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useUserChats must be used within a ChatProvider");
  }
  return context;
};
