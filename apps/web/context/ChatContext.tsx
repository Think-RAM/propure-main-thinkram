"use client";
import { getChatById, getUserChatSessions } from "@/lib/chat/data";
import { convertToUIMessages } from "@/lib/utils";
import { ChatMessageAI } from "@/types/ai";
import { ChatSession } from "@prisma/client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { toast } from "sonner";
import { v4 as generateUUID } from "uuid";

interface ChatContextType {
  userChatSessions: ChatSession[];
  activeSessionId: string | null;
  setActiveSession: (id: string | null) => void;
  updateChatSessionTitle: (id: string, title: string) => void;
  createNewChatSession: (send: string) => void;
  activeChatMessages: ChatMessageAI[];
  historyLoading: boolean;
  chatsLoading: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [userChatSessions, setUserChatSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeChatMessages, setActiveChatMessages] = useState<ChatMessageAI[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isChatsLoading, setIsChatsLoading] = useState(false);

  const setActiveSession = useCallback(async (id: string | null) => {
    try {
      setActiveSessionId(id);
      setActiveChatMessages([]);
      if (id) {
        setIsChatsLoading(true);
        const fetchedMessages = await getChatById({ id });
        setActiveChatMessages(
          fetchedMessages
            ? [...convertToUIMessages(fetchedMessages.messages)]
            : []
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
        session.id === id ? { ...session, title, updatedAt: new Date() } : session
      )
    );
  }, []);

  const createNewChatSession = useCallback((send: string) => {
    const newSession: ChatSession = {
      id: generateUUID(),
      title: "New Chat",
      userId: "",
      strategyId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setUserChatSessions((prevSessions) => [...prevSessions, newSession].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()));
    setActiveSessionId(newSession.id);
    setActiveChatMessages([
      {
        id: generateUUID(),
        role: "user",
        parts: [{ type: "text", text: send }],
      }
    ]);
  }, []);

  useEffect(() => {
    const fetchUserChatSessions = async () => {
      try {
        setIsLoading(true);
        const chatHistory = await getUserChatSessions();
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
