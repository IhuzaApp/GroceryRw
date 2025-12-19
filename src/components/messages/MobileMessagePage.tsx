import React from "react";
import { useRouter } from "next/router";

// Helper to format time (e.g., "08:20 AM", "Yesterday", "20/03/2025")
function formatMessageTime(timestamp: any): string {
  if (!timestamp) return "";

  const now = new Date();
  const date =
    timestamp instanceof Date
      ? timestamp
      : new Date(timestamp);

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const messageDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  if (messageDate.getTime() === today.getTime()) {
    // Today - show time
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } else if (messageDate.getTime() === yesterday.getTime()) {
    // Yesterday
    return "Yesterday";
  } else {
    // Older - show date
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

// Define conversation interface
interface Conversation {
  id: string;
  orderId: string;
  customerId: string;
  shopperId: string;
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
  onConversationClick: (orderId: string) => void;
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
  const router = useRouter();

  // Filter and sort conversations
  const filteredConversations = conversations
    .filter((conversation) => {
      // Apply search filter
      if (searchQuery) {
        const order = orders[conversation.orderId];
        const contactName =
          (order?.assignedTo?.name || order?.shopper?.name || "Shopper")
            ?.toLowerCase() || "";
        const orderNumber = formatOrderID(
          order?.OrderID || conversation.orderId
        ).toLowerCase();
        const messageText = conversation.lastMessage?.toLowerCase() || "";

        const searchLower = searchQuery.toLowerCase();
        return (
          contactName.includes(searchLower) ||
          orderNumber.includes(searchLower) ||
          messageText.includes(searchLower)
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

      // Sort by time
      if (sortOrder === "newest") {
        return timeB - timeA; // newest first
      } else {
        return timeA - timeB; // oldest first
      }
    });

  // Determine if shopper is online (you can customize this logic)
  const isShopperOnline = (shopperId: string) => {
    // For now, we'll assume they're online if they have recent activity
    // You can implement actual online status checking here
    return true; // Placeholder
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-white dark:bg-gray-800 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Chat List
          </h1>
          <button className="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="px-4 pb-3 flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full bg-gray-100 dark:bg-gray-700 px-4 py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:bg-white dark:focus:bg-gray-600 transition-colors"
            />
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500"
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
          <button
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
              showUnreadOnly
                ? "bg-green-500 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Loading conversations...
              </p>
            </div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex h-full items-center justify-center px-4">
            <div className="text-center">
              <div className="mb-4 text-6xl">💬</div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                No conversations yet
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You'll see your chat conversations here once you place orders.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredConversations.map((conversation) => {
              const order = orders[conversation.orderId] || {};
              const contactName =
                order?.assignedTo?.name || order?.shopper?.name || "Shopper";
              const contactAvatar =
                order?.assignedTo?.profile_picture ||
                order?.shopper?.avatar ||
                "/images/ProfileImage.png";
              const isOnline = isShopperOnline(conversation.shopperId);

              return (
                <div
                  key={conversation.id}
                  onClick={() => onConversationClick(conversation.orderId)}
                  className="flex items-center gap-3 px-4 py-3 active:bg-gray-50 dark:active:bg-gray-700 transition-colors cursor-pointer"
                >
                  {/* Avatar with online indicator */}
                  <div className="relative flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                      {contactAvatar && contactAvatar !== "/images/ProfileImage.png" ? (
                        <img
                          src={contactAvatar}
                          alt={contactName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <svg
                          className="h-6 w-6 text-gray-400 dark:text-gray-500"
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
                    {/* Online/Offline indicator */}
                    <div
                      className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-gray-800 ${
                        isOnline ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {contactName}
                        </h3>
                        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                          {conversation.lastMessage || "No messages yet"}
                        </p>
                      </div>
                      <div className="flex flex-col items-end flex-shrink-0">
                        <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                          {formatMessageTime(conversation.lastMessageTime)}
                        </span>
                        {conversation.unreadCount > 0 && (
                          <div className="mt-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-green-500 px-1.5 text-xs font-medium text-white">
                            {conversation.unreadCount > 9
                              ? "9+"
                              : conversation.unreadCount}
                          </div>
                        )}
                      </div>
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
