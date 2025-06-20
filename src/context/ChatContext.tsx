import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { isMobileDevice } from "../lib/formatters";
import {
  createConversation,
  getConversationByOrderId,
  addMessage as addFirebaseMessage,
  markMessagesAsRead as markFirebaseMessagesRead,
  listenForMessages,
  ChatMessage as FirebaseChatMessage,
} from "../services/chatService";
import { useAuth } from "./AuthContext";

// Extend the FirebaseChatMessage interface to include both text and message fields
interface ExtendedFirebaseChatMessage extends FirebaseChatMessage {
  text?: string; // Add text field for compatibility
}

// For backwards compatibility with existing components
export interface ChatMessage {
  id: string;
  sender: "customer" | "shopper";
  text: string;
  timestamp: string;
  status: "sent" | "delivered" | "read";
  image?: string;
}

interface ChatData {
  orderId: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  messages: ChatMessage[];
  unreadCount: number;
  lastMessage?: ChatMessage;
}

interface ChatContextType {
  activeChats: ChatData[];
  currentChatId: string | null;
  isDrawerOpen: boolean;
  openChat: (
    orderId: string,
    customerId: string,
    customerName: string,
    customerAvatar?: string
  ) => void;
  closeChat: () => void;
  sendMessage: (orderId: string, text: string, image?: string) => Promise<void>;
  getMessages: (orderId: string) => ChatMessage[];
  hasUnreadMessages: (orderId: string) => boolean;
  markMessagesAsRead: (orderId: string) => void;
}

const ChatContext = createContext<ChatContextType>({
  activeChats: [],
  currentChatId: null,
  isDrawerOpen: false,
  openChat: () => {},
  closeChat: () => {},
  sendMessage: async () => {},
  getMessages: () => [],
  hasUnreadMessages: () => false,
  markMessagesAsRead: () => {},
});

// Convert a Firebase chat message to our local format
const convertFirebaseMessage = (
  fbMessage: ExtendedFirebaseChatMessage
): ChatMessage => {
  return {
    id: fbMessage.id || `msg-${Date.now()}`,
    sender: fbMessage.senderType,
    text: fbMessage.message || fbMessage.text || "", // Handle both message and text fields
    timestamp: fbMessage.timestamp
      ? typeof fbMessage.timestamp === "string"
        ? fbMessage.timestamp
        : fbMessage.timestamp.toISOString?.() || new Date().toISOString()
      : new Date().toISOString(),
    status: fbMessage.isRead ? "read" : "delivered",
    image: fbMessage.image,
  };
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [activeChats, setActiveChats] = useState<ChatData[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [messageListeners, setMessageListeners] = useState<{
    [key: string]: () => void;
  }>({});

  useEffect(() => {
    setIsMobile(isMobileDevice());

    const handleResize = () => {
      setIsMobile(isMobileDevice());
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);

      // Clean up all message listeners
      Object.values(messageListeners).forEach((unsubscribe) => unsubscribe());
    };
  }, [messageListeners]);

  const openChat = useCallback(
    async (
      orderId: string,
      customerId: string,
      customerName: string,
      customerAvatar?: string
    ) => {
      console.log("User details:", user);
      if (!user?.id) {
        console.error("User not authenticated");
        return;
      }
      if (!customerId) {
        console.error("customerId is undefined, cannot create chat conversation");
        if (typeof window !== 'undefined') {
          alert("Error: Unable to start chat. Customer ID is missing. Please try again after logging in.");
        }
        return;
      }

      try {
        // Check if chat already exists in our state
        const existingChatIndex = activeChats.findIndex(
          (chat) => chat.orderId === orderId
        );

        if (existingChatIndex === -1) {
          // Get or create the conversation in Firebase
          const shopperId = user.id;
          const conversationId = await createConversation(
            orderId,
            customerId,
            shopperId
          );

          // Set up a listener for messages in this conversation
          if (!messageListeners[conversationId]) {
            const unsubscribe = listenForMessages(
              conversationId,
              (fbMessages) => {
                // Convert Firebase messages to our format
                const messages = fbMessages.map(convertFirebaseMessage);

                // Update the chat in our state
                setActiveChats((prev) => {
                  const chatIndex = prev.findIndex(
                    (chat) => chat.orderId === orderId
                  );
                  if (chatIndex >= 0) {
                    const updatedChats = [...prev];
                    updatedChats[chatIndex] = {
                      ...updatedChats[chatIndex],
                      messages,
                      unreadCount: fbMessages.filter(
                        (msg) => !msg.isRead && msg.senderId !== user.id
                      ).length,
                      lastMessage: messages[messages.length - 1],
                    };
                    return updatedChats;
                  }
                  return prev;
                });
              }
            );

            // Save the unsubscribe function
            setMessageListeners((prev) => ({
              ...prev,
              [conversationId]: unsubscribe,
            }));
          }

          // Create a new chat entry in our state
          const newChat: ChatData = {
            orderId,
            customerId,
            customerName,
            customerAvatar,
            messages: [],
            unreadCount: 0,
          };

          setActiveChats((prev) => [...prev, newChat]);
        }

        setCurrentChatId(orderId);

        // Open drawer on desktop, navigate on mobile
        if (!isMobile) {
          setIsDrawerOpen(true);
        }

        // Mark messages as read
        if (user.id) {
          const conversation = await getConversationByOrderId(orderId);
          if (conversation?.id) {
            markFirebaseMessagesRead(conversation.id, user.id);
          }
        }
      } catch (error) {
        console.error("Error opening chat:", error);
      }
    },
    [activeChats, isMobile, messageListeners, user]
  );

  const closeChat = useCallback(() => {
    setIsDrawerOpen(false);
    if (!isMobile) {
      setCurrentChatId(null);
    }
  }, [isMobile]);

  const sendMessage = useCallback(
    async (orderId: string, text: string, image?: string): Promise<void> => {
      if (!user?.id) {
        console.error("User not authenticated");
        return;
      }

      try {
        // Get the conversation from Firebase
        const conversation = await getConversationByOrderId(orderId);
        if (!conversation?.id) {
          throw new Error("Conversation not found");
        }

        // Add message to Firebase
        await addFirebaseMessage(
          conversation.id,
          text,
          user.id,
          "shopper", // Assuming this context is for shoppers only
          image
        );

        // The message will be added to our state by the listener
      } catch (error) {
        console.error("Error sending message:", error);
        throw error;
      }
    },
    [user]
  );

  const getMessages = useCallback(
    (orderId: string): ChatMessage[] => {
      const chat = activeChats.find((chat) => chat.orderId === orderId);
      return chat?.messages || [];
    },
    [activeChats]
  );

  const hasUnreadMessages = useCallback(
    (orderId: string): boolean => {
      const chat = activeChats.find((chat) => chat.orderId === orderId);
      return !!chat && chat.unreadCount > 0;
    },
    [activeChats]
  );

  const markMessagesAsRead = useCallback(
    async (orderId: string) => {
      if (!user?.id) {
        console.error("User not authenticated");
        return;
      }

      try {
        // Get the conversation from Firebase
        const conversation = await getConversationByOrderId(orderId);
        if (!conversation?.id) {
          return;
        }

        // Mark messages as read in Firebase
        await markFirebaseMessagesRead(conversation.id, user.id);

        // Update our local state
        setActiveChats((prev) => {
          const chatIndex = prev.findIndex((chat) => chat.orderId === orderId);
          if (chatIndex >= 0) {
            const updatedChats = [...prev];

            // Set unread count to 0
            updatedChats[chatIndex].unreadCount = 0;

            // Mark all messages as read
            updatedChats[chatIndex].messages = updatedChats[
              chatIndex
            ].messages.map((msg) => {
              if (msg.sender === "customer" && msg.status !== "read") {
                return { ...msg, status: "read" };
              }
              return msg;
            });

            return updatedChats;
          }
          return prev;
        });
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    },
    [user]
  );

  return (
    <ChatContext.Provider
      value={{
        activeChats,
        currentChatId,
        isDrawerOpen,
        openChat,
        closeChat,
        sendMessage,
        getMessages,
        hasUnreadMessages,
        markMessagesAsRead,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
