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
import { useQuery } from "@propure/convex";
import { api } from "@propure/convex/api";
import type { Doc, Id } from "@propure/convex/dataModel";

interface ChatContextType {
  userChatSessions: Doc<"chatSessions">[];
  activeSessionId: Id<"chatSessions"> | null;
  setActiveSession: (id: Id<"chatSessions"> | null) => void;
  updateChatSessionTitle: (id: Id<"chatSessions">, title: string) => void;
  createNewChatSession: (send: string) => void;
  activeChatMessages: ChatMessageAI[];
  historyLoading: boolean;
  chatsLoading: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const userChatSessionsFetched = useQuery(
    api.functions.chat.getUserChatSessions,
  );
  const [userChatSessions, setUserChatSessions] = useState<
    Doc<"chatSessions">[]
  >([]);
  const [activeSessionId, setActiveSessionId] =
    useState<Id<"chatSessions"> | null>(null);
  const [activeChatMessages, setActiveChatMessages] = useState<ChatMessageAI[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isChatsLoading, setIsChatsLoading] = useState(false);
  const activeChatMessagesFetched = useQuery(
    api.functions.chat.getChatById,
    (activeSessionId && !activeSessionId.startsWith("chat-"))
      ? { id: activeSessionId }
      : "skip",
  );

  const setActiveSession = useCallback(
    async (id: Id<"chatSessions"> | null) => {
      setActiveSessionId(id);
      setActiveChatMessages([]);
      setIsChatsLoading(true);
    },
    [],
  );

  const updateChatSessionTitle = useCallback(
    (id: Id<"chatSessions">, title: string) => {
      setUserChatSessions((prevSessions) =>
        prevSessions.map((session) =>
          session._id === id
            ? { ...session, title, updatedAt: Date.now() }
            : session,
        ),
      );
    },
    [],
  );

  const createNewChatSession = useCallback((send: string) => {
    const newSession: Doc<"chatSessions"> = {
      _id: `chat-${generateUUID()}` as Id<"chatSessions">,
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
    setActiveSessionId(newSession._id);
    setActiveChatMessages([
      {
        id: generateUUID(),
        role: "user",
        parts: [{ type: "text", text: send }],
      },
    ]);
  }, []);

  useEffect(() => {
    const fetchUserChatSessions = async () => {
      const chatHistory = userChatSessionsFetched ?? [];
      setUserChatSessions(chatHistory);
      setIsLoading(false);
    };
    if (userChatSessionsFetched) {
      fetchUserChatSessions();
    } else {
      setIsLoading(true);
    }
  }, [userChatSessionsFetched]);

  useEffect(() => {
    const fetchActiveChatMessages = async () => {
      if (activeChatMessagesFetched && activeSessionId) {
        const uiMessages = convertToUIMessages(
          activeChatMessagesFetched.messages,
        );
        setActiveChatMessages(uiMessages);
      }
      setIsChatsLoading(false);
      toast.success("Chat messages loaded");
    };

    if (activeChatMessagesFetched && activeSessionId) {
      fetchActiveChatMessages();
    }
    if (!activeSessionId) {
      setIsChatsLoading(false);
    }
    else if (activeSessionId.startsWith("chat-")) {
      // New chat session, no messages to load
      setIsChatsLoading(false);
    }
    else {
      toast.loading("Loading chat messages...");
      setIsChatsLoading(true);
    }
  }, [activeChatMessagesFetched, activeSessionId]);

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
