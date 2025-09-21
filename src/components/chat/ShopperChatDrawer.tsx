import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  Avatar,
  Button,
  Input,
  Loader,
  Panel,
  Dropdown,
  IconButton,
} from "rsuite";
import {
  collection,
  query,
  where,
  orderBy,
  addDoc,
  serverTimestamp,
  onSnapshot,
  Timestamp,
  doc,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import soundNotification from "../../utils/soundNotification";

// Helper to format date for messages
function formatMessageDate(timestamp: any) {
  if (!timestamp) return "";

  const date =
    timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday = date.toDateString() === today.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) {
    return `Today at ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else if (isYesterday) {
    return `Yesterday at ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else {
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }
}

// Define message interface
interface Message {
  id: string;
  text?: string;
  message?: string;
  senderId: string;
  senderType: "customer" | "shopper";
  recipientId: string;
  timestamp: any;
  read: boolean;
}

// Message component for shoppers
interface MessageProps {
  message: Message;
  isCurrentUser: boolean;
  customerName: string;
}

const ShopperMessage: React.FC<MessageProps> = ({
  message,
  isCurrentUser,
  customerName,
}) => {
  const messageContent = message.text || message.message || "";

  return (
    <div className={`mb-2 flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
      {!isCurrentUser && <Avatar color="blue" circle size="xs" />}
      <div
        className={`max-w-[80%] ${
          isCurrentUser
            ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100"
            : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
        } rounded-lg p-2`}
      >
        {!isCurrentUser && (
          <div className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-300">
            {customerName}
          </div>
        )}
        <div className="whitespace-pre-wrap text-sm">{messageContent}</div>
      </div>
      {isCurrentUser && <Avatar color="blue" circle size="xs" />}
    </div>
  );
};

// Shopper Chat Drawer Props
interface ShopperChatDrawerProps {
  orderId: string;
  customer: {
    id: string;
    name: string;
    avatar: string;
    phone?: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

const ShopperChatDrawer: React.FC<ShopperChatDrawerProps> = ({
  orderId,
  customer,
  isOpen,
  onClose,
}) => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Get or create conversation
  const getOrCreateConversation = async () => {
    if (!orderId || !session?.user?.id || !customer?.id) return;

    try {

      // Check if conversation exists
      const conversationsRef = collection(db, "chat_conversations");
      const q = query(conversationsRef, where("orderId", "==", orderId));

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Conversation exists
        const conversationDoc = querySnapshot.docs[0];
        setConversationId(conversationDoc.id);
      } else {
        // Create new conversation
        const newConversation = {
          orderId,
          customerId: customer.id,
          shopperId: session.user.id,
          createdAt: serverTimestamp(),
          lastMessage: "",
          lastMessageTime: serverTimestamp(),
          unreadCount: 0,
        };

        const docRef = await addDoc(conversationsRef, newConversation);
        setConversationId(docRef.id);
      }
    } catch (error) {
      console.error("Error getting/creating conversation:", error);
      setError("Error getting/creating conversation. Please try again later.");
    }
  };

  // Set up messages listener
  useEffect(() => {
    if (!conversationId || !session?.user?.id) return;


    // Set up listener for messages in this conversation
    const messagesRef = collection(
      db,
      "chat_conversations",
      conversationId,
      "messages"
    );
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {

        const messagesList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore timestamp to regular Date if needed
          timestamp:
            doc.data().timestamp instanceof Timestamp
              ? doc.data().timestamp.toDate()
              : doc.data().timestamp,
        })) as Message[];

        
        // Check for new unread messages from customer and play sound
        const previousMessageCount = messages.length;
        const newMessages = messagesList.slice(previousMessageCount);
        const newUnreadCustomerMessages = newMessages.filter(
          (message) => 
            message.senderType === "customer" && 
            message.senderId !== session?.user?.id &&
            !message.read
        );
        
        if (newUnreadCustomerMessages.length > 0) {
          soundNotification.play();
        }
        
        setMessages(messagesList);

        // Mark messages as read if they were sent to the current user (shopper)
        messagesList.forEach(async (message) => {
          if (message.senderType === "customer" && !message.read) {
            const messageRef = doc(
              db,
              "chat_conversations",
              conversationId,
              "messages",
              message.id
            );
            await updateDoc(messageRef, { read: true });

            // Update unread count in conversation
            const convRef = doc(db, "chat_conversations", conversationId);
            await updateDoc(convRef, {
              unreadCount: 0,
            });
          }
        });

        // Scroll to bottom after messages load
        setTimeout(scrollToBottom, 100);
      },
      (error) => {
        console.error("Error in messages listener:", error);
        setError("Error in messages listener. Please try again later.");
      }
    );

    return () => unsubscribe();
  }, [conversationId, session?.user?.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize conversation when drawer opens
  useEffect(() => {
    if (isOpen && orderId && customer?.id) {
      getOrCreateConversation();
    }
  }, [isOpen, orderId, customer?.id]);

  // Handle sending a new message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (
      !newMessage.trim() ||
      !session?.user?.id ||
      !conversationId ||
      !customer?.id
    ) {
      return;
    }

    try {
      setIsSending(true);


      // Add new message to Firestore
      const messagesRef = collection(
        db,
        "chat_conversations",
        conversationId,
        "messages"
      );
      await addDoc(messagesRef, {
        text: newMessage.trim(),
        message: newMessage.trim(),
        senderId: session.user.id,
        senderName: session.user.name || "Shopper",
        senderType: "shopper",
        recipientId: customer.id,
        timestamp: serverTimestamp(),
        read: false,
      });

      // Update conversation with last message
      const convRef = doc(db, "chat_conversations", conversationId);
      await updateDoc(convRef, {
        lastMessage: newMessage.trim(),
        lastMessageTime: serverTimestamp(),
        unreadCount: 1, // Increment unread count for customer
      });

      // Send FCM notification to the customer
      try {
        const response = await fetch('/api/fcm/send-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipientId: customer.id,
            senderName: session.user.name || 'Shopper',
            message: newMessage.trim(),
            orderId: orderId,
            conversationId: conversationId,
          }),
        });

        if (response.ok) {
          // FCM notification sent successfully
        } else {
          // FCM notification failed (non-critical)
        }
      } catch (fcmError) {
        console.error('⚠️ [Shopper Chat Drawer] FCM notification error (non-critical):', fcmError);
      }

      // Clear input
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Error sending message. Please try again later.");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-16 z-[1000] hidden h-[calc(100vh-4rem)] w-[28rem] transform bg-white shadow-xl transition-transform duration-300 ease-in-out dark:bg-gray-800 md:block">
      {/* Compact Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <Avatar src={customer.avatar} alt={customer.name} circle size="xs" />
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">{customer.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Customer</p>
          </div>
        </div>
        {customer.phone && (
          <button
            onClick={() => window.open(`tel:${customer.phone}`, '_self')}
            className="rounded-full bg-green-500 p-1.5 text-white hover:bg-green-600"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1 .45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex h-[calc(100vh-8rem)] flex-col">
        <div className="flex-1 overflow-y-auto bg-gray-50 px-3 py-2 dark:bg-gray-900" ref={messagesEndRef}>
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mb-2 text-4xl">💬</div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Start chatting with your customer</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <ShopperMessage
                key={message.id}
                message={message}
                isCurrentUser={message.senderId === session?.user?.id}
                customerName={customer.name}
              />
            ))
          )}
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 rounded-full border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:bg-gray-600"
            />
            <button
              type="submit"
              disabled={isSending || !newMessage.trim()}
              className="rounded-full bg-blue-500 p-2 text-white shadow-lg transition-all duration-200 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-800"
            >
              {isSending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="border-t border-red-200 bg-red-50 px-3 py-1 dark:border-red-800 dark:bg-red-900">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
};

export default ShopperChatDrawer;
