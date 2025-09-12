import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
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
  getDoc,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import { db, storage } from "../../src/lib/firebase";
import { formatCurrency } from "../../src/lib/formatCurrency";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { AuthGuard } from "../../src/components/AuthGuard";

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

// Helper to format order ID
function formatOrderID(id?: string | number): string {
  const s = id != null ? id.toString() : "0";
  return s.length >= 4 ? s : s.padStart(4, "0");
}

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

// Message component
interface MessageProps {
  message: Message;
  isCurrentUser: boolean;
  senderName: string;
}

const Message: React.FC<MessageProps> = ({
  message,
  isCurrentUser,
  senderName,
}) => {
  const messageContent = message.text || message.message || "";

  return (
    <div
      className={`mb-4 flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
    >
      {!isCurrentUser && <Avatar color="blue" circle size="xs" />}
      <div
        className={`max-w-[85%] ${
          isCurrentUser
            ? "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100"
            : "bg-blue-100 text-gray-900 dark:bg-blue-900 dark:text-blue-100"
        } rounded-[20px] p-3`}
      >
        {!isCurrentUser && (
          <div className="mb-1 flex gap-2 text-xs font-medium text-gray-600 dark:text-gray-300">
            {senderName}{" "}
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatMessageDate(message.timestamp)}
            </span>
          </div>
        )}
        <div className="whitespace-pre-wrap text-sm">{messageContent}</div>
        {message.image && (
          <div className="mt-2">
            <Avatar color="blue" circle />
          </div>
        )}
      </div>
      {isCurrentUser && <Avatar color="green" circle size="xs" />}
    </div>
  );
};

// Chat page component
function ChatPage() {
  const router = useRouter();
  const { orderId } = router.query;
  const { data: session, status } = useSession();
  const [order, setOrder] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [shopper, setShopper] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch order details
  useEffect(() => {
    if (orderId && status === "authenticated") {
      const fetchOrder = async () => {
        try {
          const res = await fetch(`/api/queries/orderDetails?id=${orderId}`);
          const data = await res.json();

          if (data.order) {
            setOrder(data.order);

            // Fetch shopper details if available
            // The shopper ID might be in assignedTo.id or shopper_id
            const shopperId =
              data.order.assignedTo?.id || data.order.shopper_id;
            if (shopperId) {
              setShopper({
                id: shopperId,
                name: data.order.assignedTo?.name || "Shopper",
                avatar:
                  data.order.assignedTo?.profile_picture ||
                  "/placeholder.svg?height=80&width=80",
              });

              // Get or create conversation immediately if we have shopper ID
              if (session?.user?.id) {
                getOrCreateConversation(shopperId);
              }
            } else {
              console.error("No shopper assigned to this order");
            }
          }
        } catch (error) {
          console.error("Error fetching order:", error);
          setError("Error fetching order. Please try again later.");
        } finally {
          setLoading(false);
        }
      };

      fetchOrder();
    }
  }, [orderId, status, session?.user?.id]);

  // Get or create conversation
  const getOrCreateConversation = async (shopperId: string) => {
    if (!orderId || !session?.user?.id) return;

    try {
      console.log("Creating conversation with:", {
        orderId,
        customerId: session.user.id,
        shopperId,
      });

      // Check if conversation exists
      const conversationsRef = collection(db, "chat_conversations");
      const q = query(conversationsRef, where("orderId", "==", orderId));

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Conversation exists
        const conversationDoc = querySnapshot.docs[0];
        console.log("Found existing conversation:", conversationDoc.id);
        setConversationId(conversationDoc.id);
      } else {
        // Create new conversation
        const newConversation = {
          orderId,
          customerId: session.user.id,
          shopperId: shopperId,
          createdAt: serverTimestamp(),
          lastMessage: "",
          lastMessageTime: serverTimestamp(),
          unreadCount: 0,
        };

        console.log("Creating new conversation:", newConversation);
        const docRef = await addDoc(conversationsRef, newConversation);
        console.log("Created conversation:", docRef.id);
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

    console.log(
      "Setting up message listener for conversation:",
      conversationId
    );

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
        console.log("Messages snapshot received, count:", snapshot.docs.length);

        const messagesList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore timestamp to regular Date if needed
          timestamp:
            doc.data().timestamp instanceof Timestamp
              ? doc.data().timestamp.toDate()
              : doc.data().timestamp,
        })) as Message[];

        console.log("Processed messages:", messagesList);
        setMessages(messagesList);

        // Mark messages as read if they were sent to the current user
        messagesList.forEach(async (message) => {
          if (message.senderType === "shopper" && !message.read) {
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

  // Handle sending a new message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (
      !newMessage.trim() ||
      !session?.user?.id ||
      !conversationId ||
      !shopper?.id
    ) {
      console.log("Cannot send message, missing data:", {
        hasMessage: !!newMessage.trim(),
        hasUser: !!session?.user?.id,
        hasConversation: !!conversationId,
        hasShopperId: !!shopper?.id,
      });
      return;
    }

    try {
      setIsSending(true);

      console.log("Sending message:", {
        text: newMessage.trim(),
        senderId: session.user.id,
        senderName: session.user.name || "Customer",
        recipientId: shopper.id,
      });

      // Add new message to Firestore
      const messagesRef = collection(
        db,
        "chat_conversations",
        conversationId,
        "messages"
      );
      await addDoc(messagesRef, {
        text: newMessage.trim(), // Use text field for customer messages
        message: newMessage.trim(), // Also include message field for compatibility
        senderId: session.user.id,
        senderName: session.user.name || "Customer",
        senderType: "customer",
        recipientId: shopper.id,
        timestamp: serverTimestamp(),
        read: false,
      });

      // Update conversation with last message
      const convRef = doc(db, "chat_conversations", conversationId);
      await updateDoc(convRef, {
        lastMessage: newMessage.trim(),
        lastMessageTime: serverTimestamp(),
        unreadCount: 1, // Increment unread count for shopper
      });

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

  const handleAttachmentClick = () => {
    setShowAttachmentOptions(!showAttachmentOptions);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (
      !e.target.files ||
      !e.target.files[0] ||
      !session?.user?.id ||
      !conversationId ||
      !shopper?.id
    )
      return;

    try {
      setUploadingImage(true);
      const file = e.target.files[0];

      console.log("Uploading image for conversation:", conversationId);

      // Upload image to Firebase Storage
      const storageRef = ref(
        storage,
        `chat_images/${orderId}/${Date.now()}_${file.name}`
      );
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      console.log("Image uploaded, URL:", downloadURL);

      // Add message with image
      const messagesRef = collection(
        db,
        "chat_conversations",
        conversationId,
        "messages"
      );
      await addDoc(messagesRef, {
        text: "", // Use text field for customer messages
        message: "", // Also include message field for compatibility
        senderId: session.user.id,
        senderName: session.user.name || "Customer",
        senderType: "customer",
        recipientId: shopper.id,
        timestamp: serverTimestamp(),
        read: false,
        image: downloadURL,
      });

      // Update conversation
      const convRef = doc(db, "chat_conversations", conversationId);
      await updateDoc(convRef, {
        lastMessage: "📷 Image",
        lastMessageTime: serverTimestamp(),
        unreadCount: 1, // Increment unread count for shopper
      });

      setShowAttachmentOptions(false);
    } catch (error) {
      console.error("Error uploading image:", error);
      setError("Error uploading image. Please try again later.");
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <AuthGuard requireAuth={true}>
      <div className="fixed inset-0 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <Link href="/Messages" className="text-gray-600 dark:text-gray-400">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          {shopper && (
            <div className="flex items-center gap-2">
              <Avatar
                src={shopper.avatar}
                alt={shopper.name}
                circle
                size="sm"
              />
              <div>
                <h2 className="text-sm font-medium text-gray-900 dark:text-white">
                  {shopper.name}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Order #{formatOrderID(order?.OrderID)}
                </p>
              </div>
            </div>
          )}
        </div>

        <Dropdown
          placement="bottomEnd"
          renderToggle={(props, ref) => (
            <IconButton
              {...props}
              ref={ref}
              icon={
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-gray-600 dark:text-gray-400"
                >
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
              }
              circle
              size="sm"
              appearance="subtle"
            />
          )}
        >
          <Dropdown.Item
            onClick={() =>
              router.push(`/CurrentPendingOrders/viewOrderDetails/${order?.id}`)
            }
          >
            View Order Details
          </Dropdown.Item>
        </Dropdown>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Messages Section */}
        <div className="flex flex-1 flex-col">
          <div
            className="flex-1 overflow-y-auto bg-gray-50 px-4 py-2 dark:bg-gray-900"
            ref={messagesEndRef}
          >
            {messages.map((message, index) => (
              <Message
                key={message.id}
                message={message}
                isCurrentUser={message.senderId === session?.user?.id}
                senderName={
                  message.senderId === session?.user?.id
                    ? "You"
                    : shopper?.name || "Shopper"
                }
              />
            ))}
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(value) => setNewMessage(value)}
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button
                appearance="primary"
                color="green"
                type="submit"
                loading={isSending}
              >
                Send
              </Button>
            </form>
          </div>
        </div>

        {/* Order Details Section - Only visible on desktop */}
        <div className="hidden border-l border-gray-200 dark:border-gray-700 lg:block lg:w-96">
          {order && (
            <div className="h-full overflow-y-auto bg-white px-4 py-3 dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Order Details
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Status
                  </h3>
                  <p className="text-gray-900 dark:text-white">
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total
                  </h3>
                  <p className="text-gray-900 dark:text-white">
                    {formatCurrency(order.total)}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Delivery Address
                  </h3>
                  <p className="text-gray-900 dark:text-white">
                    {order.delivery_address}
                  </p>
                </div>

                {shopper && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Shopper
                    </h3>
                    <div className="mt-1 flex items-center gap-2">
                      <Avatar
                        src={shopper.avatar}
                        alt={shopper.name}
                        circle
                        size="sm"
                      />
                      <span className="text-gray-900 dark:text-white">
                        {shopper.name}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </AuthGuard>
  );
}

// Add this to tell Next.js to use a custom layout
ChatPage.getLayout = function getLayout(page: React.ReactElement) {
  return page;
};

export default ChatPage;
