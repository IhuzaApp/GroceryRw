import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  Timestamp,
  Unsubscribe,
  addDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db, uploadToFirebase } from "../../lib/firebase";
import { toast } from "react-hot-toast";
import { Avatar } from "rsuite";
import { formatCurrency } from "../../lib/formatCurrency";
import {
  containsBlockedPii,
  getBlockedMessage,
  sanitizeMessageForDisplay,
} from "../../lib/chatPiiBlock";
import { useChatTypingIndicator } from "../../hooks/useChatTypingIndicator";
import { useTheme } from "../../context/ThemeContext";
import HeaderLayout from "../ui/NavBar/headerLayout";
import { useShopperProfile } from "../../hooks/useShopperProfile";

// Helper to format time (e.g., "01:09 am", "08:24PM")
function formatTime(timestamp: any): string {
  if (!timestamp) return "";

  const date =
    timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// Helper to format date (e.g., "29 July 2024")
function formatDate(timestamp: any): string {
  if (!timestamp) return "";

  const date =
    timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);

  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Helper to check if two timestamps are on the same day
function isSameDay(timestamp1: any, timestamp2: any): boolean {
  if (!timestamp1 || !timestamp2) return false;

  const date1 =
    timestamp1 instanceof Timestamp
      ? timestamp1.toDate()
      : new Date(timestamp1);
  const date2 =
    timestamp2 instanceof Timestamp
      ? timestamp2.toDate()
      : new Date(timestamp2);

  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

// Helper to get date label for grouping
function getDateLabel(timestamp: any): string {
  if (!timestamp) return "";

  const date =
    timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday = date.toDateString() === today.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) {
    return "Today";
  } else if (isYesterday) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }
}

// Helper to group messages by date
function groupMessagesByDate(
  messages: any[]
): Array<{ date: string; messages: any[] }> {
  const groups: Record<string, any[]> = {};

  messages.forEach((message) => {
    const dateLabel = getDateLabel(message.timestamp);
    if (!groups[dateLabel]) {
      groups[dateLabel] = [];
    }
    groups[dateLabel].push(message);
  });

  return Object.entries(groups).map(([date, msgs]) => ({
    date,
    messages: msgs,
  }));
}

// Helper to format order ID
function formatOrderID(id?: string | number): string {
  if (!id) return "0000";
  const s = id.toString();
  return s.length >= 4 ? s : s.padStart(4, "0");
}

// Conversation type info helper
type ConvTypeKey =
  | "order"
  | "business"
  | "restaurant"
  | "reel"
  | "car"
  | "pet"
  | "package";

interface ConvTypeInfo {
  key: ConvTypeKey;
  label: string;
  icon: React.ReactNode;
  bg: string;
  text: string;
}

function getConvType(
  conversation: any,
  orders: Record<string, any>
): ConvTypeInfo {
  if (conversation.collectionPath === "business_conversations") {
    const isPet =
      conversation.type === "petBusiness" ||
      conversation.type === "pet" ||
      conversation.title?.startsWith("Adoption: ");
    const isCar =
      conversation.type === "carBusiness" ||
      conversation.title?.startsWith("Car Inquiry:");

    if (isPet) {
      return {
        key: "pet",
        label: "Pet",
        icon: (
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        ),
        bg: "bg-amber-100 dark:bg-amber-900/40",
        text: "text-amber-700 dark:text-amber-300",
      };
    }

    if (isCar) {
      return {
        key: "car",
        label: "Car",
        icon: (
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            />
          </svg>
        ),
        bg: "bg-blue-100 dark:bg-blue-900/40",
        text: "text-blue-700 dark:text-blue-300",
      };
    }

    return {
      key: "business",
      label: "Business",
      icon: (
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      bg: "bg-purple-100 dark:bg-purple-900/40",
      text: "text-purple-700 dark:text-purple-300",
    };
  }
  const order = conversation.orderId ? orders[conversation.orderId] : null;
  switch (order?.orderType) {
    case "restaurant":
      return {
        key: "restaurant",
        label: "Restaurant",
        icon: (
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
        ),
        bg: "bg-orange-100 dark:bg-orange-900/40",
        text: "text-orange-700 dark:text-orange-300",
      };
    case "reel":
      return {
        key: "reel",
        label: "Reel",
        icon: (
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        ),
        bg: "bg-pink-100 dark:bg-pink-900/40",
        text: "text-pink-700 dark:text-pink-300",
      };
    case "vehicle":
      return {
        key: "car",
        label: "Car",
        icon: (
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            />
          </svg>
        ),
        bg: "bg-blue-100 dark:bg-blue-900/40",
        text: "text-blue-700 dark:text-blue-300",
      };
    case "pet":
      return {
        key: "pet",
        label: "Pet",
        icon: (
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        ),
        bg: "bg-amber-100 dark:bg-amber-900/40",
        text: "text-amber-700 dark:text-amber-300",
      };
    case "package":
      return {
        key: "package",
        label: "Package",
        icon: (
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        ),
        bg: "bg-teal-100 dark:bg-teal-900/40",
        text: "text-teal-700 dark:text-teal-300",
      };
    default:
      return {
        key: "order",
        label: "Order",
        icon: (
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        ),
        bg: "bg-green-100 dark:bg-green-900/40",
        text: "text-green-700 dark:text-green-300",
      };
  }
}

const FILTER_TABS: {
  key: ConvTypeKey | "all";
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    key: "all",
    label: "All",
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    ),
  },
  {
    key: "order",
    label: "Orders",
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
    ),
  },
  {
    key: "business",
    label: "Business",
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    key: "restaurant",
    label: "Food",
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
        />
      </svg>
    ),
  },
  {
    key: "reel",
    label: "Reels",
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    key: "car",
    label: "Cars",
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
        />
      </svg>
    ),
  },
  {
    key: "pet",
    label: "Pets",
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    ),
  },
  {
    key: "package",
    label: "Packages",
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    ),
  },
];

// Define message interface
interface Message {
  id: string;
  text?: string;
  message?: string;
  senderId: string;
  senderType: "customer" | "shopper" | "business";
  recipientId: string;
  timestamp: any;
  read: boolean;
  product?: {
    id: string;
    name: string;
    image: string;
    price: number;
  };
}

// Define conversation interface
interface Conversation {
  id?: string;
  collectionPath: "chat_conversations" | "business_conversations";
  orderId?: string | null;
  customerId?: string;
  shopperId?: string;
  shopperUserId?: string;
  businessId?: string;
  rfqId?: string;
  counterpartId?: string;
  type?: "order" | "business" | "pet" | "petBusiness" | "carBusiness";
  title?: string;
  counterpartName?: string;
  counterpartAvatar?: string;
  petId?: string;
  petName?: string;
  petImage?: string;
  lastMessage?: string;
  lastMessageTime?: any;
  unreadCount: number;
  order?: any;
}

interface DesktopMessagePageProps {
  conversations: Conversation[];
  orders: Record<string, any>;
  loading: boolean;
  onConversationSelect: (
    orderId?: string,
    conversationId?: string,
    type?: string
  ) => void;
  selectedOrderId?: string;
  selectedConversationId?: string;
  businessAccountId?: string;
  storeIds?: string[];
  stores?: any[];
}

export default function DesktopMessagePage({
  conversations,
  orders,
  loading,
  onConversationSelect,
  selectedOrderId,
  selectedConversationId,
  businessAccountId,
  storeIds = [],
  stores = [],
}: DesktopMessagePageProps) {
  const { theme } = useTheme();
  const { data: session } = useSession();
  const { shopper } = useShopperProfile();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [pendingMessages, setPendingMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [piiError, setPiiError] = useState<string | null>(null);
  const [selectedRfq, setSelectedRfq] = useState<any>(null);
  const [loadingRfq, setLoadingRfq] = useState(false);
  const [selectedBusinessOrder, setSelectedBusinessOrder] = useState<any>(null);
  const [loadingBusinessOrder, setLoadingBusinessOrder] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [businessAccount, setBusinessAccount] = useState<any>(null);
  const [petVendor, setPetVendor] = useState<any>(null);
  const [logisticsAccount, setLogisticsAccount] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const isPetChat =
    !!selectedConversation &&
    (selectedConversation.type === "petBusiness" ||
      selectedConversation.type === "pet" ||
      selectedConversation.title?.startsWith("Adoption: "));
  const isBusinessChat =
    !!selectedConversation &&
    (selectedConversation.type === "business" ||
      selectedConversation.type === "businessOrder" ||
      !selectedConversation.orderId) &&
    !isPetChat;

  const isMeBusinessRole = (conv: any) => {
    return (
      (businessAccount?.id && businessAccount.id === conv.counterpartId) ||
      (businessAccountId && businessAccountId === conv.counterpartId) ||
      (storeIds && storeIds.includes(conv.counterpartId))
    );
  };

  const isMeCustomerSelected =
    !!selectedConversation &&
    session?.user?.id === selectedConversation.customerId;
  const isMeBusinessSelected =
    !!selectedConversation && isMeBusinessRole(selectedConversation);
  const isMeShopperSelected =
    !!selectedConversation &&
    !isMeCustomerSelected &&
    (session?.user?.id === (selectedConversation as any)?.shopperUserId ||
      (shopper?.id && shopper.id === selectedConversation?.shopperId));

  const selectedOrder =
    selectedConversation && selectedConversation.orderId
      ? orders[selectedConversation.orderId as string]
      : null;

  const { otherTypingName, reportTyping, clearTyping } = useChatTypingIndicator(
    {
      conversationId,
      currentUserId: session?.user?.id ?? "",
      currentUserName: session?.user?.name ?? "Customer",
      enabled:
        !!conversationId && !!session?.user?.id && !!selectedConversation,
    }
  );

  // Filter conversations based on search and type
  const filteredConversations = conversations.filter((conversation) => {
    // Type filter
    if (activeFilter !== "all") {
      const typeInfo = getConvType(conversation, orders);
      if (typeInfo.key !== activeFilter) return false;
    }
    if (!searchQuery) return true;

    const order = conversation.orderId
      ? orders[conversation.orderId as string]
      : undefined;
    const customerName =
      order?.orderedBy?.name?.toLowerCase() ||
      order?.customer?.name?.toLowerCase() ||
      "";
    const messageText = conversation.lastMessage?.toLowerCase() || "";
    const titleText = conversation.title?.toLowerCase() || "";

    return (
      customerName.includes(searchQuery.toLowerCase()) ||
      messageText.includes(searchQuery.toLowerCase()) ||
      titleText.includes(searchQuery.toLowerCase())
    );
  });

  // Count per type for tab badges
  const countByType = React.useMemo(() => {
    const map: Record<string, number> = { all: conversations.length };
    conversations.forEach((c) => {
      const key = getConvType(c, orders).key;
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [conversations, orders]);

  // Fetch business accounts
  useEffect(() => {
    if (session?.user?.id) {
      // 1. Business Account
      fetch("/api/queries/check-business-account")
        .then((res) => res.json())
        .then((data) => {
          if (data.hasAccount) setBusinessAccount(data.account);
        })
        .catch((err) => console.error("Error fetching business account:", err));

      // 2. Pet Vendor
      fetch("/api/queries/check-pet-vendor")
        .then((res) => res.json())
        .then((data) => {
          if (data.hasAccount) setPetVendor(data.account);
        })
        .catch((err) => console.error("Error fetching pet vendor:", err));

      // 3. Logistics Account
      fetch("/api/queries/check-logistics-account")
        .then((res) => res.json())
        .then((data) => {
          if (data.hasAccount) setLogisticsAccount(data.account);
        })
        .catch((err) =>
          console.error("Error fetching logistics account:", err)
        );
    }
  }, [session?.user?.id]);

  // Set selected conversation when selectedOrderId or selectedConversationId changes
  useEffect(() => {
    if (selectedConversationId) {
      const conv = conversations.find((c) => c.id === selectedConversationId);
      if (conv) {
        setSelectedConversation(conv);
        return;
      }
    }

    if (selectedOrderId) {
      const conv = conversations.find((c) => c.orderId === selectedOrderId);
      if (conv) {
        setSelectedConversation(conv);
        return;
      }
    }

    if (filteredConversations.length > 0 && !selectedConversation) {
      setSelectedConversation(filteredConversations[0]);
    }
  }, [
    selectedOrderId,
    selectedConversationId,
    conversations,
    filteredConversations,
  ]);

  // Get conversation ID and shopper data when conversation is selected
  useEffect(() => {
    if (selectedConversation && selectedConversation.id) {
      // Get conversation ID and shopper data
      const getConversationData = async () => {
        try {
          setConversationId(selectedConversation.id!);

          // Mark as read logic preserved...
          const convRef = doc(
            db!,
            selectedConversation.collectionPath,
            selectedConversation.id!
          );
          const convSnap = await getDoc(convRef);

          if (convSnap.exists() && convSnap.data().unreadCount > 0) {
            await updateDoc(convRef, { unreadCount: 0 });
          }

          // Fetch RFQ or Order details if it's a business chat
          if (
            selectedConversation.collectionPath === "business_conversations" &&
            (selectedConversation.rfqId ||
              (selectedConversation as any).orderId)
          ) {
            const rfqId = selectedConversation.rfqId;
            const orderId = (selectedConversation as any).orderId;

            setSelectedRfq(null);
            setSelectedBusinessOrder(null);

            if (rfqId) {
              setLoadingRfq(true);
              try {
                const res = await fetch(
                  `/api/queries/rfq-details-and-responses?rfq_id=${rfqId}`
                );
                if (res.ok) {
                  const data = await res.json();
                  setSelectedRfq(data.rfq);
                } else if (res.status === 400) {
                  // If RFQ fetch fails because of format, it might be an Order ID stored in rfqId field (Legacy)
                  setLoadingBusinessOrder(true);
                  const orderRes = await fetch(
                    `/api/queries/orderDetails?id=${rfqId}`
                  );
                  if (orderRes.ok) {
                    const orderData = await orderRes.json();
                    setSelectedBusinessOrder(orderData.order);
                  }
                  setLoadingBusinessOrder(false);
                }
              } catch (err) {
                console.error("Error fetching RFQ details:", err);
              } finally {
                setLoadingRfq(false);
              }
            } else if (orderId) {
              setLoadingBusinessOrder(true);
              try {
                const res = await fetch(
                  `/api/queries/orderDetails?id=${orderId}`
                );
                if (res.ok) {
                  const data = await res.json();
                  setSelectedBusinessOrder(data.order);
                }
              } catch (err) {
                console.error("Error fetching Business Order details:", err);
              } finally {
                setLoadingBusinessOrder(false);
              }
            }
          } else {
            setSelectedRfq(null);
            setSelectedBusinessOrder(null);
          }
        } catch (error) {
          console.error("Error getting conversation data:", error);
        }
      };
      getConversationData();
    } else {
      setConversationId(null);
      setMessages([]);
      setSelectedRfq(null);
    }
  }, [selectedConversation]);

  // Set up messages listener
  useEffect(() => {
    if (!conversationId || !session?.user?.id) return;

    const messagesRef = collection(
      db!,
      selectedConversation!.collectionPath,
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
          timestamp:
            doc.data().timestamp instanceof Timestamp
              ? doc.data().timestamp.toDate()
              : doc.data().timestamp,
        })) as Message[];

        setMessages(messagesList);

        // Filter out pending messages that have been confirmed
        setPendingMessages((prev) =>
          prev.filter(
            (p) =>
              !messagesList.some(
                (m) =>
                  m.senderId === p.senderId &&
                  (m.text === p.text || m.message === p.text)
              )
          )
        );

        if (messagesList.length > 0) {
          const last = messagesList[messagesList.length - 1];
        }

        // Mark all unread messages as read
        const unreadMessages = messagesList.filter(
          (message) => message.senderType === "shopper" && !message.read
        );

        if (unreadMessages.length > 0) {
          // Mark messages as read (async operation)
          (async () => {
            for (const message of unreadMessages) {
              const messageRef = doc(
                db!,
                selectedConversation!.collectionPath,
                conversationId,
                "messages",
                message.id
              );
              await updateDoc(messageRef, { read: true });
            }

            // Update conversation unread count to 0
            const convRef = doc(
              db!,
              selectedConversation!.collectionPath,
              conversationId
            );
            await updateDoc(convRef, {
              unreadCount: 0,
            });
          })();
        }

        // Scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      },
      (error) => {
        console.error("Error in messages listener:", error);
      }
    );

    return () => unsubscribe();
  }, [conversationId, session?.user?.id]);

  const displayMessages = React.useMemo(() => {
    const combined = [...messages, ...pendingMessages];
    combined.sort((a, b) => {
      const getVal = (ts: any) => {
        if (!ts) return Date.now();
        if (ts instanceof Date) return ts.getTime();
        if (ts?.seconds) return ts.seconds * 1000;
        if (ts?.toDate) return ts.toDate().getTime();
        return Date.now();
      };
      return getVal(a.timestamp) - getVal(b.timestamp);
    });
    return combined;
  }, [messages, pendingMessages]);

  // Handle sending a new message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (
      !newMessage.trim() ||
      !session?.user?.id ||
      !conversationId ||
      !selectedConversation
    ) {
      return;
    }

    const text = newMessage.trim();
    const piiCheck = containsBlockedPii(text, {
      senderId: session.user.id,
      senderName: session.user.name || "User",
      conversationId: conversationId,
    });
    if (piiCheck.blocked && piiCheck.reason) {
      setPiiError(getBlockedMessage(piiCheck.reason));
      return;
    }
    setPiiError(null);

    try {
      setIsSending(true);

      const messagesRef = collection(
        db!,
        selectedConversation.collectionPath,
        conversationId,
        "messages"
      );
      const isMeCustomer = session.user.id === selectedConversation.customerId;
      const isMeShopper =
        session.user.id === selectedConversation.shopperId ||
        session.user.id === (selectedConversation as any).shopperUserId ||
        (shopper?.id && shopper.id === selectedConversation.shopperId);

      const isMePetVendor =
        petVendor?.id && petVendor.id === selectedConversation.counterpartId;
      const isMeCarVendor =
        logisticsAccount?.id &&
        logisticsAccount.id === selectedConversation.counterpartId;
      const isMeBusinessVendor = isMeBusinessRole(selectedConversation);

      const senderType =
        isMeBusinessVendor || isMePetVendor || isMeCarVendor
          ? "business"
          : isMeCustomer
          ? "customer"
          : isMeShopper
          ? "shopper"
          : "business";

      let senderId = session.user.id;
      let senderName = session.user.name || "User";

      if (senderType === "shopper") {
        senderId = shopper?.id || session.user.id;
      } else if (senderType === "business") {
        if (isMePetVendor) {
          senderId = petVendor.id;
          senderName = petVendor.organisationName || petVendor.fullname;
        } else if (isMeCarVendor) {
          senderId = logisticsAccount.id;
          senderName =
            logisticsAccount.businessName || logisticsAccount.fullname;
        } else if (isMeBusinessVendor) {
          senderId = selectedConversation.counterpartId; // Use Store ID
          senderName =
            (selectedConversation as any).counterpartName ||
            businessAccount?.businessName ||
            "Business";
        } else if (businessAccount?.id || businessAccountId) {
          // Fallback to general business account if it exists
          senderId = businessAccount?.id || businessAccountId!;
          senderName = businessAccount?.businessName || "Business";
        }
      }

      // Fallback for recipientId if shopperId is corrupted (same as customerId)
      const selectedOrder = selectedConversation.orderId
        ? orders[selectedConversation.orderId]
        : null;
      const orderShopperId =
        selectedOrder?.assignedTo?.shopper?.id || selectedOrder?.assignedTo?.id;

      const recipientId =
        senderType === "customer"
          ? (selectedConversation.shopperId &&
            selectedConversation.shopperId !== session.user.id
              ? selectedConversation.shopperId
              : null) ||
            orderShopperId ||
            (selectedConversation as any).businessId ||
            selectedConversation.counterpartId
          : senderType === "shopper"
          ? selectedConversation.customerId ||
            selectedConversation.counterpartId
          : selectedConversation.customerId ||
            selectedConversation.shopperId ||
            selectedConversation.counterpartId;

      const messagePayload = {
        text: newMessage.trim(),
        message: newMessage.trim(),
        senderId,
        senderName,
        senderType,
        recipientId,
        timestamp: serverTimestamp(),
        read: false,
      };

      if (!recipientId) {
        throw new Error("Could not determine message recipient.");
      }

      // 1. Optimistic Update
      const tempId = `temp-${Date.now()}`;
      setPendingMessages((p) => [
        ...p,
        {
          id: tempId,
          text: newMessage.trim(),
          message: newMessage.trim(),
          senderId,
          senderName,
          senderType,
          timestamp: new Date(),
          read: false,
        },
      ]);
      const messageText = newMessage.trim();
      setNewMessage("");

      // 2. Firestore Write
      await addDoc(messagesRef, messagePayload);

      // 3. Update Conversation
      const convRef = doc(
        db!,
        selectedConversation.collectionPath,
        conversationId
      );
      await updateDoc(convRef, {
        lastMessage: messageText,
        lastMessageTime: serverTimestamp(),
        unreadCount: 1,
      });

      // 4. Trigger FCM Notification
      try {
        const fcmRecipientId =
          senderType === "customer"
            ? (selectedConversation as any).vendorUserId ||
              (selectedConversation.shopperUserId &&
              selectedConversation.shopperUserId !== session.user.id
                ? selectedConversation.shopperUserId
                : null) ||
              (selectedConversation.shopperId &&
              selectedConversation.shopperId !== session.user.id
                ? selectedConversation.shopperId
                : null) ||
              selectedOrder?.assignedTo?.userId ||
              orderShopperId ||
              (selectedConversation as any).businessId ||
              selectedConversation.counterpartId
            : selectedConversation.customerId ||
              selectedConversation.counterpartId;

        if (fcmRecipientId && fcmRecipientId !== session.user.id) {
          await fetch("/api/fcm/send-notification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              recipientId: fcmRecipientId,
              senderName:
                senderType === "business" && businessAccount?.businessName
                  ? businessAccount.businessName
                  : session.user.name || "User",
              message: messageText,
              orderId: selectedConversation.orderId || null,
              conversationId,
              collectionPath: selectedConversation.collectionPath,
            }),
          });
        }
      } catch (fcmErr) {
        console.warn("FCM send (non-blocking):", fcmErr);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  // Handle conversation click
  const handleConversationClick = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    const typeInfo = getConvType(conversation, orders);
    onConversationSelect(
      conversation.orderId || undefined,
      conversation.id,
      typeInfo.key
    );
  };

  return (
    <div className="relative !mt-0 flex h-screen flex-col overflow-hidden bg-white !pt-0 dark:bg-[#0A0A0A]">
      <style jsx global>{`
        body,
        html,
        #__next {
          margin-top: 0 !important;
          padding-top: 0 !important;
          top: 0 !important;
        }
      `}</style>
      <HeaderLayout fullWidth />
      <div className="flex flex-1 overflow-hidden">
        {/* Left Column - Conversation List */}
        <div className="flex h-full w-80 flex-shrink-0 flex-col border-r border-gray-200 dark:border-white/10">
          {/* Header */}
          <div className="flex flex-shrink-0 items-center justify-between px-5 py-3">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-[var(--text-primary)]">
                Messages
              </h1>
            </div>
            <button className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex-shrink-0 px-4 pb-2">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full rounded-xl bg-[var(--bg-secondary)] px-4 py-3 pl-11 text-sm text-[var(--text-primary)] placeholder-gray-500 transition-all focus:bg-white/60 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:bg-white/5 dark:placeholder-gray-400 dark:focus:bg-white/10"
              />
              <svg
                className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Type Filter Tabs */}
          <div className="scrollbar-hide flex-shrink-0 overflow-x-auto px-4 pb-3">
            <div className="flex gap-1.5">
              {FILTER_TABS.filter((tab) =>
                tab.key === "all" ? true : (countByType[tab.key] || 0) > 0
              ).map((tab) => {
                const isActive = activeFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveFilter(tab.key)}
                    className={`flex flex-shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all ${
                      isActive
                        ? "bg-green-600 text-white shadow-sm"
                        : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-200 dark:bg-gray-700"></div>

          {/* Conversation List */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--bg-secondary)] border-t-green-600 dark:border-white/5 dark:border-t-green-500"></div>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Loading...
                  </p>
                </div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex h-full items-center justify-center px-4">
                <div className="text-center">
                  <div className="mb-3 flex justify-center text-gray-400">
                    <svg
                      className="h-12 w-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    No conversations found
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    Try adjusting your search
                  </p>
                </div>
              </div>
            ) : (
              filteredConversations.map((conversation, index) => {
                const isPetChat =
                  conversation.type === "petBusiness" ||
                  conversation.type === "pet" ||
                  conversation.title?.startsWith("Adoption: ");
                const isBusinessChat =
                  (conversation.type === "business" ||
                    conversation.type === "businessOrder" ||
                    !conversation.orderId) &&
                  !isPetChat;
                const order = conversation.orderId
                  ? orders[conversation.orderId] || {}
                  : {};

                const isMeCustomer =
                  session?.user?.id === conversation.customerId;
                const isMeShopper =
                  !isMeCustomer &&
                  (session?.user?.id === (conversation as any).shopperUserId ||
                    (shopper?.id && shopper.id === conversation.shopperId));

                const employeeId = order?.assignedTo?.shopper?.Employment_id;

                // Handle name display for business chats
                let fullName = "Business Chat";
                if (isPetChat) {
                  fullName =
                    conversation.title ||
                    `Adoption: ${conversation.petName || "Pet"}`;
                } else if (isBusinessChat) {
                  // If I am the business owner (counterpart), I want to see the customer's name
                  if (isMeBusinessRole(conversation)) {
                    fullName =
                      (conversation as any).customerName ||
                      conversation.title ||
                      "Customer";
                  } else {
                    fullName =
                      conversation.title ||
                      conversation.counterpartName ||
                      "Business Chat";
                  }
                } else {
                  if (isMeShopper) {
                    fullName = order?.orderedBy?.name || "Customer";
                  } else if (isMeCustomer) {
                    fullName =
                      order?.assignedTo?.shopper?.full_name ||
                      order?.assignedTo?.name ||
                      "Shopper";
                  } else {
                    // Fallback for when current user is neither (e.g. admin or corrupted data)
                    fullName = order?.orderedBy?.name || "Customer";
                  }
                }

                const orderDisplayID = order?.OrderID
                  ? formatOrderID(order.OrderID)
                  : "";

                const contactName =
                  orderDisplayID && !isBusinessChat
                    ? `${fullName} (#${orderDisplayID})`
                    : employeeId && !isBusinessChat
                    ? `00${employeeId} ${fullName}`
                    : fullName;
                const matchingStore = isBusinessChat
                  ? stores.find((s) => s.id === conversation.counterpartId)
                  : null;

                const contactAvatar = isPetChat
                  ? conversation.petImage || "/images/placeholder.png"
                  : isBusinessChat
                  ? (isMeBusinessRole(conversation)
                      ? (conversation as any).customerAvatar
                      : matchingStore?.image ||
                        matchingStore?.logo ||
                        conversation.counterpartAvatar) ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      fullName
                    )}&background=10b981&color=fff`
                  : isMeShopper
                  ? order?.orderedBy?.profile_picture ||
                    "/images/ProfileImage.png"
                  : isMeCustomer
                  ? order?.assignedTo?.shopper?.profile_photo ||
                    order?.assignedTo?.profile_picture ||
                    "/images/ProfileImage.png"
                  : order?.orderedBy?.profile_picture ||
                    "/images/ProfileImage.png";

                const isSelected = selectedConversation?.id === conversation.id;
                const typeInfo = getConvType(conversation, orders);

                return (
                  <React.Fragment key={conversation.id}>
                    <div
                      onClick={() => handleConversationClick(conversation)}
                      className={`group relative cursor-pointer px-5 py-4 transition-all duration-200 ${
                        isSelected
                          ? "bg-white/70 shadow-sm ring-1 ring-black/5 backdrop-blur-sm dark:bg-gray-800/70 dark:ring-white/10"
                          : "hover:bg-white/40 dark:hover:bg-gray-800/40"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute left-0 top-0 h-full w-1 bg-green-600 dark:bg-green-500"></div>
                      )}
                      <div className="flex items-center gap-4">
                        <div className="relative flex-shrink-0">
                          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-md ring-2 ring-white dark:ring-gray-700">
                            {contactAvatar &&
                            contactAvatar !== "/images/ProfileImage.png" ? (
                              <img
                                src={contactAvatar}
                                alt={contactName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <svg
                                className="h-7 w-7 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                            )}
                          </div>
                          {/* Type icon badge */}
                          <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white p-0.5 text-gray-500 shadow-md dark:bg-gray-800">
                            {typeInfo.icon}
                          </div>
                          {conversation.unreadCount > 0 && (
                            <div className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-green-600 px-1 text-[10px] font-bold text-white shadow-lg ring-2 ring-white dark:ring-gray-800">
                              {conversation.unreadCount > 9
                                ? "9+"
                                : conversation.unreadCount}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex min-w-0 items-center gap-1.5">
                              <h3
                                className={`truncate text-sm font-bold tracking-tight ${
                                  isSelected
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-gray-900 dark:text-white"
                                }`}
                              >
                                {contactName}
                              </h3>
                              {/* Type badge */}
                              <span
                                className={`flex flex-shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${typeInfo.bg} ${typeInfo.text}`}
                              >
                                {typeInfo.icon} {typeInfo.label}
                              </span>
                            </div>
                            <span className="flex-shrink-0 text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
                              {formatTime(conversation.lastMessageTime)}
                            </span>
                          </div>
                          <p
                            className={`mt-1 line-clamp-1 text-xs leading-relaxed ${
                              conversation.unreadCount > 0
                                ? "font-semibold text-gray-900 dark:text-gray-100"
                                : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            {conversation.lastMessage || "No messages yet"}
                          </p>
                        </div>
                      </div>
                    </div>
                    {index < filteredConversations.length - 1 && (
                      <div className="mx-4 h-px bg-gray-100 dark:bg-gray-700/50"></div>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </div>
        </div>

        {/* Middle Column - Chat Window */}
        <div className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 px-8 py-5 dark:border-gray-700/50">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg ring-2 ring-white dark:ring-gray-700">
                      {isPetChat ? (
                        <img
                          src={
                            selectedConversation.petImage ||
                            "/images/placeholder.png"
                          }
                          alt={
                            selectedConversation.petName ||
                            selectedConversation.title
                              ?.replace("Adoption: ", "")
                              .trim() ||
                            "Pet"
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : isBusinessChat ? (
                        <img
                          src={
                            (isMeBusinessSelected
                              ? (selectedConversation as any).customerAvatar
                              : selectedConversation.counterpartAvatar) ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              selectedConversation.title ||
                                selectedConversation.counterpartName ||
                                "Business"
                            )}&background=10b981&color=fff`
                          }
                          alt={selectedConversation.title || "Business"}
                          className="h-full w-full object-cover"
                        />
                      ) : isMeShopperSelected ? (
                        <img
                          src={
                            selectedOrder?.orderedBy?.profile_picture ||
                            "/images/ProfileImage.png"
                          }
                          alt={selectedOrder?.orderedBy?.name || "Customer"}
                          className="h-full w-full object-cover"
                        />
                      ) : selectedOrder?.assignedTo?.shopper?.profile_photo ||
                        selectedOrder?.assignedTo?.profile_picture ? (
                        <img
                          src={
                            selectedOrder.assignedTo?.shopper?.profile_photo ||
                            selectedOrder.assignedTo?.profile_picture
                          }
                          alt={
                            selectedOrder.assignedTo?.shopper?.full_name ||
                            selectedOrder.assignedTo?.name ||
                            "Shopper"
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <svg
                          className="h-7 w-7 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500 shadow-sm dark:border-gray-800"></div>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                      {isPetChat ? (
                        selectedConversation.title ||
                        `Adoption: ${selectedConversation.petName || "Pet"}`
                      ) : isBusinessChat ? (
                        isMeBusinessSelected ? (
                          selectedConversation.title ||
                          (selectedConversation as any).customerName ||
                          "Customer"
                        ) : (
                          selectedConversation.title ||
                          selectedConversation.counterpartName ||
                          "Business Chat"
                        )
                      ) : (
                        <>
                          {isMeShopperSelected
                            ? selectedOrder?.orderedBy?.name || "Customer"
                            : selectedOrder?.assignedTo?.shopper?.full_name ||
                              selectedOrder?.assignedTo?.name ||
                              "Shopper"}
                          {selectedOrder?.OrderID && (
                            <span className="ml-2 text-xs font-semibold text-gray-400 dark:text-gray-500">
                              (#{formatOrderID(selectedOrder.OrderID)})
                            </span>
                          )}
                          {!isMeShopperSelected &&
                            selectedOrder?.assignedTo?.shopper
                              ?.Employment_id && (
                              <span className="ml-2 text-xs font-semibold text-gray-400 dark:text-gray-500">
                                #00
                                {selectedOrder.assignedTo.shopper.Employment_id}
                              </span>
                            )}
                        </>
                      )}
                    </h2>
                    <p className="text-xs font-medium text-green-600 dark:text-green-400">
                      Online Now
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Phone Display for Car Bookings */}
                  {(selectedOrder?.orderType === "vehicle" ||
                    isBusinessChat) && (
                    <div className="mr-2 flex flex-col items-end">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Contact
                      </span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {selectedOrder?.orderedBy?.phone ||
                          (isMeBusinessSelected
                            ? (selectedConversation as any).customerPhone
                            : (selectedConversation as any).counterpartPhone) ||
                          "N/A"}
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      const phone =
                        selectedOrder?.orderedBy?.phone ||
                        (selectedConversation as any).counterpartPhone;
                      if (phone) {
                        window.open(`tel:${phone}`, "_self");
                      } else {
                        toast.error("Phone number not available");
                      }
                    }}
                    className="rounded-xl p-2.5 text-[var(--text-secondary)] transition-all hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Call"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </button>

                  {/* Hide video for car bookings as requested */}
                  {selectedOrder?.orderType !== "vehicle" && (
                    <button className="rounded-xl p-2.5 text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polygon points="23 7 16 12 23 17 23 7" />
                        <rect
                          x="1"
                          y="5"
                          width="15"
                          height="14"
                          rx="2"
                          ry="2"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Messages Area */}
              <div
                ref={messagesContainerRef}
                className="scrollbar-hide flex-1 overflow-y-auto bg-[var(--bg-primary)] px-8 pb-32 pt-6"
              >
                {messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <p className="text-sm text-[var(--text-secondary)]">
                        No messages yet. Start the conversation!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {otherTypingName && (
                      <div className="flex justify-start">
                        <div className="rounded-2xl rounded-bl-md bg-white px-4 py-2.5 text-[var(--text-primary)] shadow-sm dark:bg-gray-700">
                          <span className="text-sm text-[var(--text-secondary)]">
                            {otherTypingName} is typing
                          </span>
                          <span className="typing-dots ml-1 inline-flex gap-0.5">
                            <span className="h-1 w-1 animate-bounce rounded-full bg-gray-500 [animation-delay:0ms]" />
                            <span className="h-1 w-1 animate-bounce rounded-full bg-gray-500 [animation-delay:150ms]" />
                            <span className="h-1 w-1 animate-bounce rounded-full bg-gray-500 [animation-delay:300ms]" />
                          </span>
                        </div>
                      </div>
                    )}
                    {groupMessagesByDate(displayMessages).map(
                      (group, groupIndex) => (
                        <div key={groupIndex} className="space-y-4">
                          {/* Date Separator */}
                          <div className="flex items-center gap-4 py-2">
                            <div className="flex-1 border-t border-gray-200 dark:border-white/10"></div>
                            <span className="rounded-full bg-[var(--bg-secondary)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]">
                              {group.date}
                            </span>
                            <div className="flex-1 border-t border-gray-200 dark:border-white/10"></div>
                          </div>

                          {/* Messages for this date */}
                          <div className="flex flex-col gap-6">
                            {group.messages.map((message, index) => {
                              const isCurrentUser = [
                                session?.user?.id,
                                businessAccount?.id,
                                businessAccountId,
                                petVendor?.id,
                                logisticsAccount?.id,
                                ...storeIds,
                              ].includes(message.senderId);

                              return (
                                <React.Fragment key={message.id}>
                                  <div
                                    className={`flex items-end gap-3 ${
                                      isCurrentUser
                                        ? "flex-row-reverse"
                                        : "flex-row"
                                    }`}
                                  >
                                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-md ring-2 ring-white dark:ring-gray-700">
                                      <img
                                        src={(() => {
                                          let resolvedAvatar =
                                            "/images/userProfile.png";
                                          if (
                                            message.senderId ===
                                              session?.user?.id &&
                                            session?.user?.image &&
                                            message.senderType !== "business"
                                          ) {
                                            resolvedAvatar = session.user.image;
                                          }

                                          // Match by ID against conversation participants (even if it's Me)
                                          if (
                                            resolvedAvatar ===
                                              "/images/userProfile.png" ||
                                            isCurrentUser
                                          ) {
                                            let dbAvatar = null;

                                            // Fallback for current user's role image
                                            if (
                                              message.senderType ===
                                                "business" &&
                                              (message.senderId ===
                                                businessAccount?.id ||
                                                message.senderId ===
                                                  session?.user?.id ||
                                                storeIds.includes(
                                                  message.senderId
                                                ))
                                            ) {
                                              // Prioritize specific store logo from stores prop if available
                                              const matchingStore = stores.find(
                                                (s) => s.id === message.senderId
                                              );
                                              dbAvatar =
                                                matchingStore?.image ||
                                                matchingStore?.logo ||
                                                (selectedConversation as any)
                                                  .counterpartAvatar ||
                                                businessAccount?.faceImage ||
                                                businessAccount?.logo ||
                                                businessAccount?.image;
                                            } else if (
                                              message.senderType ===
                                                "shopper" &&
                                              (message.senderId ===
                                                shopper?.id ||
                                                message.senderId ===
                                                  session?.user?.id)
                                            ) {
                                              dbAvatar =
                                                shopper?.profile_photo ||
                                                (selectedConversation as any)
                                                  .shopperAvatar;
                                            } else if (
                                              message.senderType ===
                                                "business" &&
                                              message.senderId === petVendor?.id
                                            ) {
                                              dbAvatar =
                                                petVendor.organisationLogo ||
                                                petVendor.profile_photo ||
                                                (selectedConversation as any)
                                                  .counterpartAvatar;
                                            } else if (
                                              message.senderType ===
                                                "business" &&
                                              message.senderId ===
                                                logisticsAccount?.id
                                            ) {
                                              dbAvatar =
                                                logisticsAccount.businessLogo ||
                                                logisticsAccount.profile_picture ||
                                                (selectedConversation as any)
                                                  .counterpartAvatar;
                                            }

                                            if (!dbAvatar) {
                                              if (
                                                message.senderId ===
                                                selectedConversation?.customerId
                                              ) {
                                                dbAvatar =
                                                  (selectedConversation as any)
                                                    .customerAvatar ||
                                                  selectedOrder?.orderedBy
                                                    ?.profile_picture;
                                              } else if (
                                                message.senderId ===
                                                  selectedConversation?.counterpartId ||
                                                message.senderId ===
                                                  (selectedConversation as any)
                                                    .vendorUserId ||
                                                message.senderId ===
                                                  selectedConversation?.shopperId ||
                                                message.senderId ===
                                                  (selectedConversation as any)
                                                    .shopperUserId
                                              ) {
                                                dbAvatar =
                                                  (selectedConversation as any)
                                                    .counterpartAvatar ||
                                                  selectedOrder?.shop?.image ||
                                                  selectedOrder?.assignedTo
                                                    ?.profile_picture ||
                                                  selectedRfq?.business_account
                                                    ?.face_image;
                                              }
                                            }

                                            if (dbAvatar)
                                              resolvedAvatar = dbAvatar;
                                          }

                                          // Fallback by type if still placeholder and not Me
                                          if (
                                            resolvedAvatar ===
                                              "/images/userProfile.png" &&
                                            !isCurrentUser
                                          ) {
                                            if (
                                              message.senderType === "customer"
                                            ) {
                                              resolvedAvatar =
                                                selectedOrder?.orderedBy
                                                  ?.profile_picture ||
                                                (selectedConversation as any)
                                                  .customerAvatar ||
                                                (selectedConversation as any)
                                                  .counterpartAvatar ||
                                                "/images/userProfile.png";
                                            } else if (
                                              message.senderType === "shopper"
                                            ) {
                                              resolvedAvatar =
                                                selectedOrder?.assignedTo
                                                  ?.shopper?.profile_photo ||
                                                selectedOrder?.assignedTo
                                                  ?.profile_picture ||
                                                "/images/userProfile.png";
                                            } else if (
                                              message.senderType === "business"
                                            ) {
                                              resolvedAvatar =
                                                (selectedConversation as any)
                                                  .counterpartAvatar ||
                                                (selectedConversation as any)
                                                  .businessAvatar ||
                                                selectedOrder?.shop?.image ||
                                                selectedRfq?.business_account
                                                  ?.face_image ||
                                                "/images/userProfile.png";
                                            }
                                          }

                                          return resolvedAvatar;
                                        })()}
                                        alt="Profile"
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                          (
                                            e.target as HTMLImageElement
                                          ).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                            message.senderName || "U"
                                          )}&background=10b981&color=fff`;
                                        }}
                                      />
                                    </div>
                                    <div
                                      className={`flex max-w-[70%] flex-col ${
                                        isCurrentUser
                                          ? "items-end"
                                          : "items-start"
                                      }`}
                                    >
                                      {(message as any).image && (
                                        <div className="mb-2 max-w-sm overflow-hidden rounded-xl border border-gray-100 shadow-sm dark:border-white/5">
                                          <img
                                            src={(message as any).image}
                                            alt="Attachment"
                                            className="h-auto w-full cursor-pointer transition-transform hover:scale-105"
                                            onClick={() =>
                                              window.open(
                                                (message as any).image,
                                                "_blank"
                                              )
                                            }
                                          />
                                        </div>
                                      )}
                                      <div
                                        className={`group relative rounded-[20px] px-5 py-3.5 transition-all duration-200 hover:shadow-sm ${
                                          isCurrentUser
                                            ? "rounded-br-none bg-green-600 font-medium text-white shadow-md shadow-green-200/50 dark:bg-green-600 dark:shadow-none"
                                            : "rounded-bl-none border-2 border-gray-200/50 bg-white text-gray-800 shadow-sm backdrop-blur-sm dark:border-white/5 dark:bg-gray-800 dark:text-gray-100"
                                        }`}
                                      >
                                        {message.product ? (
                                          <div className="mb-3 flex overflow-hidden rounded-xl bg-black/5 p-2 dark:bg-white/5">
                                            <img
                                              src={message.product.image}
                                              alt={message.product.name}
                                              className="h-14 w-14 rounded-lg object-cover shadow-sm"
                                            />
                                            <div className="ml-3 min-w-0 flex-1">
                                              <p
                                                className={`truncate text-sm font-bold opacity-90 ${
                                                  isCurrentUser
                                                    ? "!text-white"
                                                    : ""
                                                }`}
                                              >
                                                {message.product.name}
                                              </p>
                                              <p
                                                className={`text-xs font-semibold opacity-70 ${
                                                  isCurrentUser
                                                    ? "!text-white"
                                                    : ""
                                                }`}
                                              >
                                                {formatCurrency(
                                                  message.product.price
                                                )}
                                              </p>
                                            </div>
                                          </div>
                                        ) : null}
                                        <p
                                          className={`whitespace-pre-wrap text-sm leading-relaxed ${
                                            isCurrentUser ? "!text-white" : ""
                                          }`}
                                        >
                                          {sanitizeMessageForDisplay(
                                            message.text ||
                                              message.message ||
                                              ""
                                          )}
                                        </p>
                                      </div>
                                      <div
                                        className={`mt-1.5 flex items-center gap-1.5 px-1 ${
                                          isCurrentUser
                                            ? "flex-row-reverse"
                                            : "flex-row"
                                        }`}
                                      >
                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                          {formatTime(message.timestamp)}
                                        </span>
                                        {isCurrentUser &&
                                          (message.id
                                            .toString()
                                            .startsWith("temp-") ? (
                                            <span className="text-[10px] font-bold text-gray-400">
                                              ...
                                            </span>
                                          ) : (
                                            <svg
                                              className="h-3.5 w-3.5 text-green-500"
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={3}
                                                d="M5 13l4 4L19 7"
                                              />
                                            </svg>
                                          ))}
                                      </div>
                                    </div>
                                  </div>
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </div>
                      )
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* PII block error */}
              {piiError && (
                <div className="flex-shrink-0 border-t border-red-200 bg-red-50 px-6 py-2 dark:border-red-800 dark:bg-red-900/30">
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {piiError}
                  </p>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-gray-200/50 bg-white/80 px-8 pb-8 pt-4 backdrop-blur-md dark:border-white/5 dark:bg-gray-900/80">
                <form
                  onSubmit={handleSendMessage}
                  className="relative mx-auto flex max-w-4xl items-center gap-3"
                >
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        reportTyping();
                      }}
                      onBlur={clearTyping}
                      placeholder="Write a message..."
                      className="h-12 w-full rounded-2xl border-none bg-white/40 px-6 pr-12 text-sm font-medium text-gray-900 placeholder-gray-400 transition-all focus:bg-white/60 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:bg-gray-800/40 dark:text-white dark:placeholder-gray-500 dark:focus:bg-gray-700/60"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-green-600 to-emerald-700 shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 dark:focus:ring-offset-gray-800"
                    aria-label="Send message"
                  >
                    <svg
                      className="h-6 w-6 !text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center bg-[var(--bg-primary)]">
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-500/10 dark:to-emerald-500/10">
                  <svg
                    className="h-12 w-12 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Select a conversation
                </h3>
                <p className="mt-2 max-w-xs text-sm text-[var(--text-secondary)]">
                  Choose a chat from the list to start messaging and view order
                  details
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex h-full w-96 flex-shrink-0 flex-col overflow-hidden border-l border-gray-200 bg-[var(--bg-primary)] dark:border-white/10">
          {selectedConversation &&
          (selectedOrder ||
            selectedRfq ||
            selectedConversation.type === "petBusiness" ||
            selectedConversation.type === "carBusiness") ? (
            <>
              {/* Header */}
              <div className="flex-shrink-0 bg-white px-8 py-6 shadow-sm dark:bg-gray-800/50">
                <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                  {selectedOrder
                    ? "Order Details"
                    : selectedRfq
                    ? "Quote Details"
                    : "Context Details"}
                </h2>
              </div>

              {/* Content */}
              <div className="flex-1 space-y-6 overflow-y-auto p-6">
                {selectedOrder ? (
                  <>
                    {/* Company Info / Vehicle Info Card */}
                    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md dark:bg-gray-800 dark:ring-white/5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/20">
                          {selectedOrder.Order_Items?.[0]?.product?.image ? (
                            <img
                              src={selectedOrder.Order_Items[0].product.image}
                              alt="Vehicle"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <svg
                              className="h-8 w-8"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-base font-bold text-gray-900 dark:text-white">
                            {selectedOrder.Order_Items?.[0]?.product
                              ?.ProductName?.name ||
                              selectedOrder.shop?.name ||
                              "Store"}
                          </h3>
                          <p className="mt-0.5 text-xs font-semibold uppercase tracking-widest text-gray-400">
                            ID: #
                            {formatOrderID(
                              selectedOrder.OrderID || selectedOrder.id
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="my-5 h-px bg-gray-100 dark:bg-gray-700/50"></div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                          Status
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                            selectedOrder.status === "completed" ||
                            selectedOrder.status === "PAID"
                              ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                              : selectedOrder.status === "in_progress" ||
                                selectedOrder.status === "ACCEPTED"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                              : selectedOrder.status === "pending"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400"
                          }`}
                        >
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current"></span>
                          {selectedOrder.status || "Pending"}
                        </span>
                      </div>
                    </div>

                    {/* Rental Duration Card (if vehicle) */}
                    {selectedOrder.pickup_date && (
                      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md dark:bg-gray-800 dark:ring-white/5">
                        <h4 className="mb-5 text-sm font-bold uppercase tracking-wider text-gray-400">
                          Rental Duration
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                              Pickup
                            </p>
                            <p className="text-xs font-bold text-gray-900 dark:text-white">
                              {new Date(
                                selectedOrder.pickup_date
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                              Return
                            </p>
                            <p className="text-xs font-bold text-gray-900 dark:text-white">
                              {new Date(
                                selectedOrder.return_date
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Counterpart Details Card (Shopper or Owner) */}
                    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md dark:bg-gray-800 dark:ring-white/5">
                      <h4 className="mb-5 text-sm font-bold uppercase tracking-wider text-gray-400">
                        {selectedOrder.assignedTo?.shopper?.Employment_id ===
                        "VEHICLE"
                          ? "Owner Details"
                          : "Shopper Details"}
                      </h4>
                      {selectedOrder.assignedTo && (
                        <div className="flex items-center gap-4">
                          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-md ring-2 ring-white dark:ring-gray-700">
                            {selectedOrder.assignedTo?.shopper?.profile_photo ||
                            selectedOrder.assignedTo?.profile_picture ? (
                              <img
                                src={
                                  selectedOrder.assignedTo?.shopper
                                    ?.profile_photo ||
                                  selectedOrder.assignedTo?.profile_picture
                                }
                                alt="Counterpart"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <svg
                                className="h-7 w-7 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              {selectedOrder.assignedTo?.shopper
                                ?.Employment_id &&
                                selectedOrder.assignedTo.shopper
                                  .Employment_id !== "VEHICLE" && (
                                  <span className="rounded-md bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:bg-green-500/20 dark:text-green-400">
                                    #00
                                    {
                                      selectedOrder.assignedTo.shopper
                                        .Employment_id
                                    }
                                  </span>
                                )}
                            </div>
                            <h5 className="mt-1 truncate text-sm font-bold text-gray-900 dark:text-white">
                              {selectedOrder.assignedTo?.shopper?.full_name ||
                                selectedOrder.assignedTo?.name ||
                                "Partner"}
                            </h5>
                            <p className="truncate text-xs font-medium text-gray-500 dark:text-gray-400">
                              {selectedOrder.assignedTo?.email ||
                                "No contact info"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Customer Details Card */}
                    {selectedOrder.orderedBy &&
                      selectedOrder.orderType !== "vehicle" && (
                        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md dark:bg-gray-800 dark:ring-white/5">
                          <h4 className="mb-5 text-sm font-bold uppercase tracking-wider text-gray-400">
                            Customer Details
                          </h4>
                          <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-md ring-2 ring-white dark:ring-gray-700">
                              {selectedOrder.orderedBy.profile_picture ? (
                                <img
                                  src={selectedOrder.orderedBy.profile_picture}
                                  alt="Customer"
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-indigo-100 text-lg font-black text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                                  {selectedOrder.orderedBy.name
                                    ?.charAt(0)
                                    .toUpperCase() || "C"}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h5 className="truncate text-sm font-bold text-gray-900 dark:text-white">
                                {selectedOrder.orderedBy.name || "Customer"}
                              </h5>
                              {selectedOrder.orderedBy.phone && (
                                <a
                                  href={`tel:${selectedOrder.orderedBy.phone}`}
                                  className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-green-600 transition-colors hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                                >
                                  <svg
                                    className="h-3.5 w-3.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2.5}
                                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                    />
                                  </svg>
                                  {selectedOrder.orderedBy.phone}
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                    {/* Confirmation Action Button */}
                    {selectedOrder.orderType === "vehicle" &&
                      selectedOrder.status === "PENDING" &&
                      (selectedOrder.assignedTo?.id === session?.user?.id ||
                        selectedOrder.assignedTo?.shopper?.id ===
                          session?.user?.id) && (
                        <div className="pt-2">
                          <button
                            disabled={isConfirming}
                            onClick={async () => {
                              if (
                                !window.confirm(
                                  "Are you sure you want to confirm this booking?"
                                )
                              )
                                return;
                              setIsConfirming(true);
                              try {
                                const res = await fetch(
                                  "/api/mutations/update-vehicle-booking-status",
                                  {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                      bookingId: selectedOrder.id,
                                      status: "ACCEPTED",
                                    }),
                                  }
                                );
                                const data = await res.json();
                                if (data.success) {
                                  window.location.reload();
                                } else {
                                  alert(
                                    data.error || "Failed to confirm booking"
                                  );
                                  setIsConfirming(false);
                                }
                              } catch (error) {
                                console.error(
                                  "Error confirming booking:",
                                  error
                                );
                                alert("An error occurred. Please try again.");
                                setIsConfirming(false);
                              }
                            }}
                            className={`group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 py-4 text-xs font-black uppercase tracking-[0.2em] text-white shadow-lg transition-all active:scale-[0.98] ${
                              isConfirming
                                ? "cursor-not-allowed opacity-70"
                                : "hover:scale-[1.02] hover:shadow-green-500/25"
                            }`}
                          >
                            <span className="relative z-10">
                              {isConfirming
                                ? "Confirming..."
                                : "Confirm Booking"}
                            </span>
                            {!isConfirming && (
                              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                            )}
                          </button>
                        </div>
                      )}
                  </>
                ) : isPetChat ? (
                  <div className="space-y-6">
                    {/* Pet Details Card */}
                    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md dark:bg-gray-800 dark:ring-white/5">
                      <div className="flex flex-col items-center text-center">
                        <div className="relative mb-4 h-32 w-32 overflow-hidden rounded-[2rem] shadow-lg">
                          <img
                            src={
                              selectedConversation.petImage ||
                              "/images/placeholder.png"
                            }
                            alt={
                              selectedConversation.petName ||
                              selectedConversation.title
                                ?.replace("Adoption: ", "")
                                .trim() ||
                              "Pet"
                            }
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {selectedConversation.petName ||
                            selectedConversation.title
                              ?.replace("Adoption: ", "")
                              .trim() ||
                            "Adoption"}
                        </h3>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                          Pet Adoption
                        </p>
                      </div>
                      {selectedConversation.petId && (
                        <>
                          <div className="my-6 h-px bg-gray-100 dark:bg-gray-700/50"></div>
                          <button
                            onClick={() =>
                              window.open(
                                `/Pets/${selectedConversation.petId}`,
                                "_blank"
                              )
                            }
                            className="w-full rounded-2xl bg-amber-500 py-3.5 text-xs font-black uppercase tracking-[0.2em] text-white shadow-md transition-all hover:bg-amber-600 active:scale-[0.98]"
                          >
                            View Pet Profile
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ) : selectedRfq ? (
                  <div className="space-y-6">
                    {/* Quote Header Card */}
                    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md dark:bg-gray-800 dark:ring-white/5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
                          <svg
                            className="h-8 w-8"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-base font-bold text-gray-900 dark:text-white">
                            {selectedRfq.title || "Business Inquiry"}
                          </h3>
                          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            RFQ: #{selectedRfq.id?.split("-")[0].toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <div className="my-5 h-px bg-gray-100 dark:bg-gray-700/50"></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Category
                          </p>
                          <p className="text-xs font-bold text-gray-900 dark:text-white">
                            {selectedRfq.category || "General"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Urgency
                          </p>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              selectedRfq.urgency === "high"
                                ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                                : selectedRfq.urgency === "medium"
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                            }`}
                          >
                            {selectedRfq.urgency || "normal"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Budget & Requirements Card */}
                    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md dark:bg-gray-800 dark:ring-white/5">
                      <div className="mb-4 flex items-center justify-between">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400">
                          Details
                        </h4>
                        <div className="text-right">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Budget
                          </p>
                          <p className="text-sm font-black text-green-600 dark:text-green-400">
                            {selectedRfq.budget_range || "Open"}
                          </p>
                        </div>
                      </div>
                      <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-900/50">
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Requirements
                        </p>
                        <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                          {selectedRfq.requirements ||
                            "No specific requirements provided."}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : selectedBusinessOrder ? (
                  <div className="space-y-6">
                    {/* Order Header Card */}
                    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md dark:bg-gray-800 dark:ring-white/5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/20">
                          <svg
                            className="h-8 w-8"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                            />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-base font-bold text-gray-900 dark:text-white">
                            {selectedBusinessOrder.OrderID}
                          </h3>
                          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            Business Order
                          </p>
                        </div>
                      </div>
                      <div className="my-5 h-px bg-gray-100 dark:bg-gray-700/50"></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Status
                          </p>
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                            {selectedBusinessOrder.status}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Total
                          </p>
                          <p className="text-xs font-bold text-gray-900 dark:text-white">
                            {selectedBusinessOrder.total}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Order Details Card */}
                    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md dark:bg-gray-800 dark:ring-white/5">
                      <div className="mb-4 flex items-center justify-between">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400">
                          Items
                        </h4>
                      </div>
                      <div className="space-y-3">
                        {selectedBusinessOrder.Order_Items?.map(
                          (item: any, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3 dark:bg-gray-900/50"
                            >
                              <div className="h-10 w-10 overflow-hidden rounded-lg">
                                <img
                                  src={
                                    item.product?.image ||
                                    item.product?.ProductName?.image
                                  }
                                  alt={item.product?.ProductName?.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-bold text-gray-900 dark:text-white">
                                  {item.product?.ProductName?.name}
                                </p>
                                <p className="text-[10px] text-gray-500">
                                  Qty: {item.quantity} × {item.price}
                                </p>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ) : selectedConversation.type === "petBusiness" ? (
                  <div className="flex-1 space-y-6 overflow-y-auto p-6">
                    {/* Pet Info Card */}
                    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md dark:bg-gray-800 dark:ring-white/5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20">
                          {selectedConversation.petImage ? (
                            <img
                              src={selectedConversation.petImage}
                              alt={selectedConversation.petName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-3xl">🐾</span>
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-gray-900 dark:text-white">
                            {selectedConversation.petName || "Pet Adoption"}
                          </h3>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                              Pet Adoption
                            </span>
                            {selectedConversation.petId && (
                              <span className="text-[10px] font-medium uppercase tracking-widest text-gray-400">
                                ID: {selectedConversation.petId.slice(0, 8)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 space-y-4">
                        <button
                          onClick={() =>
                            window.open(
                              `/Pets/${selectedConversation.petId}`,
                              "_blank"
                            )
                          }
                          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3 font-bold text-white shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-600"
                        >
                          View Pet Profile
                        </button>
                      </div>
                    </div>
                  </div>
                ) : selectedConversation.type === "carBusiness" ? (
                  <div className="flex-1 space-y-6 overflow-y-auto p-6">
                    {/* Car Info Card */}
                    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md dark:bg-gray-800 dark:ring-white/5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
                          <span className="text-3xl">🚗</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-gray-900 dark:text-white">
                            {selectedConversation.title?.replace(
                              "Car Inquiry: ",
                              ""
                            ) || "Vehicle Inquiry"}
                          </h3>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                              Vehicle Rental
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center p-8">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
                  <svg
                    className="h-10 w-10 text-gray-400 dark:text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  No order selected
                </h3>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Select a conversation to view
                  <br />
                  order details and information
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
