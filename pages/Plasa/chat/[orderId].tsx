"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button, Avatar, Loader } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import ShopperLayout from "@components/shopper/ShopperLayout";
import {
  formatMessageDate,
  formatMessageTime,
} from "../../../src/lib/formatters";
import { useAuth } from "../../../src/context/AuthContext";
import { useTheme } from "../../../src/context/ThemeContext";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
  onSnapshot,
  Timestamp,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db, storage } from "../../../src/lib/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { formatCurrency } from "../../../src/lib/formatCurrency";

// Define message interface
interface Message {
  id: string;
  text?: string; // Customer message format
  message?: string; // Shopper message format (for compatibility)
  senderId: string;
  senderType: "customer" | "shopper";
  recipientId: string;
  timestamp: any;
  read: boolean;
  image?: string;
}

// Helper to format order ID
function formatOrderID(id?: string | string[] | number): string {
  if (Array.isArray(id)) {
    id = id[0];
  }
  const s = id != null ? id.toString() : "0";
  return s.length >= 4 ? s : s.padStart(4, "0");
}

export default function ChatPage() {
  const router = useRouter();
  const { orderId } = router.query;
  const { user } = useAuth();
  const { theme } = useTheme();

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [customerData, setCustomerData] = useState<{
    id: string;
    name: string;
    avatar: string;
    lastSeen: string;
  } | null>(null);
  const [order, setOrder] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize chat and fetch customer data
  useEffect(() => {
    if (!orderId || !user?.id) return;

    const fetchOrderAndCustomer = async () => {
      setIsLoading(true);
      try {
        // Fetch order details
        const res = await fetch(`/api/queries/orderDetails?id=${orderId}`);
        const data = await res.json();

        if (data.order) {
          setOrder(data.order);

          // Set customer data
          setCustomerData({
            id: data.order.user_id,
            name: data.order.user_name || "Customer",
            avatar: "/placeholder.svg?height=80&width=80",
            lastSeen: "Online now",
          });

          // Get or create conversation
          await getOrCreateConversation(data.order.id, data.order.user_id);
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderAndCustomer();
  }, [orderId, user?.id]);

  // Get or create conversation
  const getOrCreateConversation = async (
    orderIdStr: string,
    customerId: string
  ) => {
    try {
      // Check if conversation exists
      const conversationsRef = collection(db, "chat_conversations");
      const q = query(conversationsRef, where("orderId", "==", orderIdStr));

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Conversation exists
        const conversationDoc = querySnapshot.docs[0];
        setConversationId(conversationDoc.id);
      } else {
        // Create new conversation
        const newConversation = {
          orderId: orderIdStr,
          customerId,
          shopperId: user?.id,
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
    }
  };

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  // Set up messages listener
  useEffect(() => {
    if (!conversationId || !user?.id) return;

    // Set up listener for messages in this conversation
    const messagesRef = collection(
      db,
      "chat_conversations",
      conversationId,
      "messages"
    );
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamp to regular Date if needed
        timestamp:
          doc.data().timestamp instanceof Timestamp
            ? doc.data().timestamp.toDate()
            : doc.data().timestamp,
      })) as Message[];

      setMessages(messagesList);

      // Mark messages as read if they were sent to the current user
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
    });

    return () => unsubscribe();
  }, [conversationId, user?.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !user?.id || !conversationId || !customerData?.id)
      return;

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
        text: message.trim(),
        message: message.trim(),
        senderId: user.id,
        senderName: user.name || "Shopper",
        senderType: "shopper",
        recipientId: customerData.id,
        timestamp: serverTimestamp(),
        read: false,
      });

      // Update conversation with last message
      const convRef = doc(db, "chat_conversations", conversationId);
      await updateDoc(convRef, {
        lastMessage: message.trim(),
        lastMessageTime: serverTimestamp(),
      });

      // Clear input
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
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

  const handleAttachmentClick = () => {
    setShowAttachmentOptions(!showAttachmentOptions);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (
      !e.target.files ||
      !e.target.files[0] ||
      !user?.id ||
      !conversationId ||
      !customerData?.id
    )
      return;

    try {
      setUploadingImage(true);
      const file = e.target.files[0];

      // Upload image to Firebase Storage
      const storageRef = ref(
        storage,
        `chat_images/${orderId}/${Date.now()}_${file.name}`
      );
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Add message with image
      const messagesRef = collection(
        db,
        "chat_conversations",
        conversationId,
        "messages"
      );
      await addDoc(messagesRef, {
        text: "", // Use text field for consistency
        message: "", // Also include message field for compatibility
        senderId: user.id,
        senderName: user.name || "Shopper",
        senderType: "shopper",
        recipientId: customerData.id,
        timestamp: serverTimestamp(),
        read: false,
        image: downloadURL,
      });

      // Update conversation
      const convRef = doc(db, "chat_conversations", conversationId);
      await updateDoc(convRef, {
        lastMessage: "📷 Image",
        lastMessageTime: serverTimestamp(),
      });

      setShowAttachmentOptions(false);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploadingImage(false);
    }
  };

  // Group messages by date for better display
  const groupMessagesByDate = () => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = "";
    let currentGroup: Message[] = [];

    messages.forEach((message) => {
      const messageDate = formatMessageDate(message.timestamp);

      if (messageDate !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({ date: currentDate, messages: currentGroup });
        }
        currentDate = messageDate;
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }
    });

    if (currentGroup.length > 0) {
      groups.push({ date: currentDate, messages: currentGroup });
    }

    return groups;
  };

  const messageGroups = groupMessagesByDate();

  if (!customerData && isLoading) {
    return (
      <ShopperLayout>
        <div
          className={`flex h-[calc(100vh-200px)] items-center justify-center ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          <Loader content="Loading chat..." />
        </div>
      </ShopperLayout>
    );
  }

  return (
    <ShopperLayout>
      <div
        className={`min-h-screen ${
          theme === "dark" ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        {isLoading ? (
          <div
            className={`flex h-[calc(100vh-200px)] items-center justify-center ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            <Loader content="Loading chat..." />
          </div>
        ) : !customerData ? (
          <div className="mx-auto max-w-2xl">
            <div className="rounded-md bg-red-50 p-4">
              <h3 className="font-medium text-red-800">Error</h3>
              <p className="mt-2 text-red-700">Error fetching customer data</p>
              <Button
                appearance="primary"
                color="red"
                className="mt-4"
                onClick={() => router.push("/Plasa")}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        ) : !user ? (
          <div className="mx-auto max-w-3xl">
            <div className="rounded-lg bg-blue-50 p-6 text-center">
              <h2 className="mb-4 text-xl font-semibold text-blue-700">
                Sign in Required
              </h2>
              <p className="mb-6 text-blue-600">
                Please sign in to view messages.
              </p>
              <Link href="/login" passHref>
                <Button appearance="primary" color="blue">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-4xl p-4">
            {/* Chat Header */}
            <div
              className={`mb-4 rounded-lg p-4 shadow-sm ${
                theme === "dark"
                  ? "bg-gray-800 text-gray-100"
                  : "bg-white text-gray-900"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar
                    circle
                    src={customerData?.avatar || "/placeholder.svg"}
                    alt={customerData?.name || "Customer"}
                  />
                  <div>
                    <h2
                      className={`text-lg font-semibold ${
                        theme === "dark" ? "text-gray-100" : "text-gray-900"
                      }`}
                    >
                      {customerData?.name || "Customer"}
                    </h2>
                    <p
                      className={`text-sm ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Order #{formatOrderID(orderId)}
                    </p>
                  </div>
                </div>
                <Link href={`/Plasa/orders/${orderId}`}>
                  <Button
                    appearance="ghost"
                    className={theme === "dark" ? "rs-btn-dark" : ""}
                  >
                    View Order
                  </Button>
                </Link>
              </div>
            </div>

            {/* Messages Container */}
            <div
              className={`mb-4 h-[calc(100vh-300px)] overflow-y-auto rounded-lg p-4 shadow-sm ${
                theme === "dark"
                  ? "bg-gray-800 text-gray-100"
                  : "bg-white text-gray-900"
              }`}
            >
              {messages.map((msg, index) => (
                <div
                  key={msg.id}
                  className={`mb-4 flex ${
                    msg.senderType === "shopper"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      msg.senderType === "shopper"
                        ? theme === "dark"
                          ? "bg-green-600 text-white"
                          : "bg-green-500 text-white"
                        : theme === "dark"
                        ? "bg-gray-700 text-gray-100"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {msg.image && (
                      <img
                        src={msg.image}
                        alt="Message attachment"
                        className="mb-2 max-h-48 w-auto rounded-lg"
                      />
                    )}
                    <p>{msg.text || msg.message}</p>
                    <p
                      className={`mt-1 text-right text-xs ${
                        msg.senderType === "shopper"
                          ? "text-green-100"
                          : theme === "dark"
                          ? "text-gray-400"
                          : "text-gray-500"
                      }`}
                    >
                      {formatMessageTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div
              className={`rounded-lg p-4 shadow-sm ${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleAttachmentClick}
                  className={`rounded-full p-2 transition-colors ${
                    theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`h-6 w-6 ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                  </svg>
                </button>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className={`flex-1 rounded-lg border px-4 py-2 ${
                    theme === "dark"
                      ? "border-gray-700 bg-gray-700 text-gray-100 placeholder-gray-400"
                      : "border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-500"
                  }`}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isSending || !message.trim()}
                  className={`rounded-lg px-6 py-2 font-medium ${
                    isSending || !message.trim()
                      ? theme === "dark"
                        ? "cursor-not-allowed bg-gray-700 text-gray-500"
                        : "cursor-not-allowed bg-gray-100 text-gray-400"
                      : theme === "dark"
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-green-500 text-white hover:bg-green-600"
                  }`}
                >
                  {isSending ? (
                    <div className="flex items-center">
                      <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                      Sending...
                    </div>
                  ) : (
                    "Send"
                  )}
                </button>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>
        )}
      </div>
    </ShopperLayout>
  );
}
