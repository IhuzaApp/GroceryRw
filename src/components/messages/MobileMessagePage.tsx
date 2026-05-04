import React from "react";
import { useRouter } from "next/router";
import { useTheme } from "../../context/ThemeContext";

// Helper to format time (e.g., "08:20 AM", "Yesterday", "20/03/2025")
function formatMessageTime(timestamp: any): string {
  if (!timestamp) return "";

  const now = new Date();
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const messageDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  if (messageDate.getTime() === today.getTime()) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } else if (messageDate.getTime() === yesterday.getTime()) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }
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
  conversation: Conversation,
  orders: Record<string, any>
): ConvTypeInfo {
  if (conversation.collectionPath === "business_conversations") {
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

// Define conversation interface
interface Conversation {
  id: string;
  collectionPath: "chat_conversations" | "business_conversations";
  orderId?: string;
  customerId?: string;
  shopperId?: string;
  businessId?: string;
  rfqId?: string;
  type?: "order" | "business";
  title?: string;
  counterpartName?: string;
  counterpartAvatar?: string;
  lastMessage: string;
  lastMessageTime: any;
  unreadCount: number;
  order?: any;
}

interface MobileMessagePageProps {
  conversations: Conversation[];
  orders: Record<string, any>;
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showUnreadOnly: boolean;
  setShowUnreadOnly: (show: boolean) => void;
  sortOrder: "newest" | "oldest";
  setSortOrder: (order: "newest" | "oldest") => void;
  onConversationClick: (
    orderId?: string,
    conversationId?: string,
    type?: string
  ) => void;
  selectedOrder?: any;
  isDrawerOpen: boolean;
  onCloseDrawer: () => void;
}

export default function MobileMessagePage({
  conversations,
  orders,
  loading,
  searchQuery,
  setSearchQuery,
  showUnreadOnly,
  setShowUnreadOnly,
  sortOrder,
  setSortOrder,
  onConversationClick,
  selectedOrder,
  isDrawerOpen,
  onCloseDrawer,
}: MobileMessagePageProps) {
  const { theme } = useTheme();
  const router = useRouter();

  // Active filter from URL
  const activeFilter = (router.query.filter as string) || "all";

  const setFilter = (key: string) => {
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, filter: key },
      },
      undefined,
      { shallow: true }
    );
  };

  // Filter and sort conversations
  const filteredConversations = conversations
    .filter((conversation) => {
      // Apply type filter
      if (activeFilter !== "all") {
        const typeInfo = getConvType(conversation, orders);
        if (typeInfo.key !== activeFilter) return false;
      }

      // Apply search filter
      if (searchQuery) {
        const isBusinessChat =
          !conversation.orderId || conversation.type === "business";
        const order = conversation.orderId
          ? orders[conversation.orderId]
          : null;
        const employeeId = order?.assignedTo?.shopper?.Employment_id;
        const fullName =
          order?.assignedTo?.shopper?.full_name ||
          order?.assignedTo?.name ||
          order?.shopper?.name ||
          "Shopper";
        const contactName =
          (employeeId
            ? `00${employeeId} ${fullName}`
            : fullName
          )?.toLowerCase() || "";
        const orderNumber = formatOrderID(
          order?.OrderID || conversation.orderId
        ).toLowerCase();
        const messageText = conversation.lastMessage?.toLowerCase() || "";
        const titleText = conversation.title?.toLowerCase() || "";

        const searchLower = searchQuery.toLowerCase();
        return (
          contactName.includes(searchLower) ||
          orderNumber.includes(searchLower) ||
          messageText.includes(searchLower) ||
          titleText.includes(searchLower)
        );
      }

      // Apply unread filter
      if (showUnreadOnly) {
        return conversation.unreadCount > 0;
      }

      return true;
    })
    .sort((a, b) => {
      const timeA = a.lastMessageTime
        ? new Date(a.lastMessageTime).getTime()
        : 0;
      const timeB = b.lastMessageTime
        ? new Date(b.lastMessageTime).getTime()
        : 0;

      if (sortOrder === "newest") {
        return timeB - timeA;
      } else {
        return timeA - timeB;
      }
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

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="z-20 flex-shrink-0 px-4 pb-2 pt-1">
        <div className="flex items-center justify-between py-2.5">
          <div className="flex items-center gap-1.5 focus:outline-none">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center text-green-500 transition-opacity active:opacity-50"
              aria-label="Back"
            >
              <svg
                className="h-[28px] w-[28px]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1 className="mb-1 text-[28px] font-bold leading-none tracking-tight text-[var(--text-primary)]">
              Chats
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className={`flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full transition-all active:scale-95 ${
                showUnreadOnly ? "bg-green-500 text-white" : "text-green-500"
              }`}
              aria-label="Filter Unread"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mt-1 flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute bottom-0 left-3.5 top-0 flex items-center justify-center">
              <svg
                className="h-[18px] w-[18px] text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-[10px] bg-[var(--bg-secondary)] py-2.5 pl-10 pr-4 text-[16px] text-[var(--text-primary)] placeholder-gray-500 transition-colors focus:outline-none"
            />
          </div>
        </div>

        {/* Type Filter Tabs */}
        <div className="mt-3 -mx-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 px-4 pb-1">
            {FILTER_TABS.filter((tab) => {
              // Only show tabs that have conversations (or "all")
              if (tab.key === "all") return true;
              return (countByType[tab.key] || 0) > 0;
            }).map((tab) => {
              const isActive = activeFilter === tab.key;
              const count = countByType[tab.key] || 0;
              return (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`flex flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold transition-all active:scale-95 ${
                    isActive
                      ? "bg-green-500 text-white shadow-md"
                      : "bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {count > 0 && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        isActive
                          ? "bg-white/30 text-white"
                          : "bg-black/10 dark:bg-white/10 text-[var(--text-secondary)]"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
              <p className="text-sm text-[var(--text-secondary)]">
                Loading conversations...
              </p>
            </div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex h-full items-center justify-center px-4">
            <div className="text-center">
              <div className="mb-4 flex justify-center text-gray-400">
                <svg
                  className="h-16 w-16"
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
              <h3 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">
                {activeFilter === "all"
                  ? "No conversations yet"
                  : `No ${FILTER_TABS.find((t) => t.key === activeFilter)?.label} chats`}
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                {activeFilter === "all"
                  ? "You'll see your chat conversations here once you place orders."
                  : "Try switching to a different filter tab."}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            {filteredConversations.map((conversation) => {
              const isBusinessChat =
                conversation.type === "business" || !conversation.orderId;
              const order = conversation.orderId
                ? orders[conversation.orderId] || {}
                : {};
              const employeeId = order?.assignedTo?.shopper?.Employment_id;

              let fullName = "Business Chat";
              if (isBusinessChat) {
                fullName =
                  conversation.title ||
                  conversation.counterpartName ||
                  "Business Chat";
              } else {
                fullName =
                  order?.assignedTo?.shopper?.full_name ||
                  order?.assignedTo?.name ||
                  order?.shopper?.name ||
                  "Shopper";
              }

              const contactName =
                employeeId && !isBusinessChat
                  ? `00${employeeId} ${fullName}`
                  : fullName;

              const contactAvatar = isBusinessChat
                ? conversation.counterpartAvatar ||
                  "https://ui-avatars.com/api/?name=Business&background=10b981&color=fff"
                : order?.assignedTo?.shopper?.profile_photo ||
                  order?.assignedTo?.profile_picture ||
                  order?.shopper?.avatar ||
                  "/images/ProfileImage.png";

              const typeInfo = getConvType(conversation, orders);

              return (
                <div
                  key={conversation.id}
                  onClick={() => {
                    const typeInfo = getConvType(conversation, orders);
                    onConversationClick(
                      conversation.orderId,
                      conversation.id!,
                      typeInfo.key
                    );
                  }}
                  className="flex cursor-pointer items-center transition-colors hover:bg-black/5 active:bg-black/10 dark:hover:bg-white/5 dark:active:bg-white/10"
                >
                  {/* Left Side: Avatar */}
                  <div className="relative flex-shrink-0 py-3 pl-4 pr-3">
                    <div className="flex h-[52px] w-[52px] items-center justify-center overflow-hidden rounded-full bg-gray-300 dark:bg-gray-600">
                      {contactAvatar &&
                      contactAvatar !== "/images/ProfileImage.png" ? (
                        <img
                          src={contactAvatar}
                          alt={contactName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-[22px] font-medium uppercase text-[var(--text-secondary)]">
                          {contactName.charAt(0)}
                        </span>
                      )}
                    </div>
                    {/* Type emoji badge on avatar */}
                    <div className="absolute bottom-2.5 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-white p-0.5 text-gray-500 shadow-md dark:bg-gray-800">
                      {typeInfo.icon}
                    </div>
                  </div>

                  {/* Right Side */}
                  <div className="flex h-full min-w-0 flex-1 flex-col justify-center border-b border-gray-100 py-3 pr-4 dark:border-white/5">
                    <div className="flex items-center justify-between pb-[1px]">
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <h3 className="truncate text-[17px] font-medium text-[var(--text-primary)]">
                          {contactName}
                        </h3>
                        {/* Type label badge */}
                        <span
                          className={`flex-shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${typeInfo.bg} ${typeInfo.text}`}
                        >
                          {typeInfo.label}
                        </span>
                      </div>
                      <span
                        className={`whitespace-nowrap pl-2 text-xs ${
                          conversation.unreadCount > 0
                            ? "font-medium text-green-500"
                            : "font-normal text-[var(--text-secondary)]"
                        }`}
                      >
                        {formatMessageTime(conversation.lastMessageTime)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p
                        className={`line-clamp-1 pr-2 text-[15px] leading-tight ${
                          conversation.unreadCount > 0
                            ? "font-medium text-[var(--text-primary)]"
                            : "font-normal text-[var(--text-secondary)]"
                        }`}
                      >
                        {conversation.lastMessage || "No messages yet"}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <div className="flex h-5 min-w-[20px] flex-shrink-0 items-center justify-center rounded-full bg-green-500 px-[5px] text-[11px] font-bold text-white shadow-sm">
                          {conversation.unreadCount > 9
                            ? "9+"
                            : conversation.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
