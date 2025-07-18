import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Button, Avatar, Input } from "rsuite";
import { formatMessageDate } from "../../lib/formatters";
import { ChevronRight, Maximize2 } from "lucide-react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

interface Message {
  id: string;
  text?: string;
  message?: string;
  senderId: string;
  senderType: "customer" | "shopper";
  recipientId: string;
  timestamp: any;
  read: boolean;
  image?: string;
}

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  shopper: any;
  messages?: Message[];
  newMessage: string;
  setNewMessage: (message: string) => void;
  handleSendMessage: (e?: React.FormEvent) => void;
  isSending: boolean;
  currentUserId: string;
}

const Message: React.FC<{
  message: Message;
  isCurrentUser: boolean;
  senderName: string;
}> = ({ message, isCurrentUser, senderName }) => {
  const messageContent = message.text || message.message || "";

  return (
    <div
      className={`mb-4 flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
    >
      <div className="max-w-[75%]">
        {!isCurrentUser && (
          <div className="mb-1 flex items-center space-x-2">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {senderName}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {formatMessageDate(message.timestamp)}
            </span>
          </div>
        )}
        <div
          className={`rounded-2xl px-4 py-1 shadow-sm ${
            isCurrentUser
              ? "bg-green-700 text-white"
              : "bg-white text-gray-900 dark:bg-gray-800 dark:text-white"
          }`}
        >
          {message.image && (
            <div className="mb-2">
              <img
                src={message.image}
                alt="Message attachment"
                className="max-h-48 w-auto rounded-lg"
              />
            </div>
          )}
          <p className="text-sm leading-relaxed">{messageContent}</p>
          {isCurrentUser && (
            <div className="mt-1 flex items-center justify-end space-x-1">
              <span className="text-xs text-green-100">
                {formatMessageDate(message.timestamp)}
              </span>
              <svg className="h-3 w-3 text-green-100" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ChatDrawer({
  isOpen,
  onClose,
  order,
  shopper,
  messages: propMessages = [],
  newMessage,
  setNewMessage,
  handleSendMessage,
  isSending,
  currentUserId,
}: ChatDrawerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Get conversation ID and set up message listener
  useEffect(() => {
    if (!isOpen || !order?.id || !currentUserId) return;

    let unsubscribe: (() => void) | undefined;

    const setupMessages = async () => {
      try {
        // Get conversation ID
        const conversationsRef = collection(db, "chat_conversations");
        const q = query(conversationsRef, where("orderId", "==", order.id));
        const { getDocs } = await import("firebase/firestore");
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const conversationDoc = querySnapshot.docs[0];
          setConversationId(conversationDoc.id);
          
          // Set up listener for messages
          const messagesRef = collection(db, "chat_conversations", conversationDoc.id, "messages");
          const messagesQuery = query(messagesRef, orderBy("timestamp", "asc"));
          
          unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
            const messagesList = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              timestamp: doc.data().timestamp instanceof Timestamp
                ? doc.data().timestamp.toDate()
                : doc.data().timestamp,
            })) as Message[];
            
            setMessages(messagesList);
            setIsLoading(false);
            
            // Scroll to bottom
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
          });
        }
      } catch (error) {
        console.error("Error setting up messages:", error);
        setIsLoading(false);
      }
    };

    setupMessages();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isOpen, order?.id, currentUserId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopper?.id) {
      console.error("Cannot send message: Shopper ID is missing");
      return;
    }
    handleSendMessage(e);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-16 z-[1000] hidden h-[calc(100vh-4rem)] w-96 transform bg-white shadow-xl transition-transform duration-300 ease-in-out dark:bg-gray-800 md:block">
      {/* Professional Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={shopper?.profile_picture || "/placeholder.svg"}
                alt={shopper?.name || "Shopper"}
                className="h-10 w-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
              />
              <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {shopper?.name || "Shopper"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Order #{order?.OrderID || order?.id?.slice(0, 8)}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => router.push(`/Messages/${order?.id}`)}
          className="rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <Maximize2 className="h-5 w-5" />
        </button>
      </div>

      {/* Messages Container */}
      <div className="flex h-[calc(100vh-8rem)] flex-col">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-green-500 dark:border-gray-600 dark:border-t-green-400"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Loading messages...
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 px-4 py-4">
              {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No messages yet</h3>
                    <p className="text-gray-500 dark:text-gray-400">Start the conversation with your shopper</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <Message
                      key={message.id}
                      message={message}
                      isCurrentUser={message.senderId === currentUserId}
                      senderName={
                        message.senderId === currentUserId
                          ? "You"
                          : "Customer"
                      }
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Professional Message Input */}
            <div className="border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
              <form onSubmit={handleSubmit} className="flex items-end space-x-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full rounded-full border border-gray-300 bg-gray-50 px-4 py-3 text-sm focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-green-400 dark:focus:bg-gray-600"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSending || !newMessage.trim()}
                  className="flex-shrink-0 rounded-full bg-green-500 p-3 text-white shadow-lg transition-all duration-200 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-800"
                >
                  {isSending ? (
                    <div className="flex items-center">
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  ) : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
