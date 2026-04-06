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
  onConversationClick: (orderId?: string, conversationId?: string) => void;
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

  // Filter and sort conversations
  const filteredConversations = conversations
    .filter((conversation) => {
      // Apply search filter
      if (searchQuery) {
        const isBusinessChat =
          !conversation.orderId || conversation.type === "business";
        const order = conversation.orderId ? orders[conversation.orderId] : null;
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
  const isShopperOnline = (shopperId?: string) => {
    // For now, we'll assume they're online if they have recent activity
    // You can implement actual online status checking here
    return true; // Placeholder
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="flex-shrink-0 z-20 px-4 pt-1 pb-2">
        <div className="flex items-center justify-between py-2.5">
          <div className="flex items-center gap-1.5 focus:outline-none">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center text-green-500 transition-opacity active:opacity-50"
              aria-label="Back"
            >
              <svg className="h-[28px] w-[28px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-[28px] font-bold tracking-tight text-[var(--text-primary)] leading-none mb-1">
              Chats
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-green-500 transition-opacity active:opacity-50" aria-label="Camera">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </button>
            <button className="text-green-500 transition-opacity active:opacity-50" aria-label="New Chat">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v8"/>
                <path d="M8 12h8"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mt-1 flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute left-3.5 top-0 bottom-0 flex items-center justify-center">
              <svg className="h-[18px] w-[18px] text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
          <button
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            className={`flex h-[36px] w-[36px] flex-shrink-0 items-center justify-center rounded-full transition-all active:scale-95 ${
              showUnreadOnly
                ? "bg-green-500 text-white"
                : "text-green-500"
            }`}
            aria-label="Filter Unread"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
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
              <div className="mb-4 text-6xl">💬</div>
              <h3 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">
                No conversations yet
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                You'll see your chat conversations here once you place orders.
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
              
              // Handle name display for business chats
              let fullName = "Business Chat";
              if (isBusinessChat) {
                fullName = conversation.title || conversation.counterpartName || "Business Chat";
              } else {
                fullName = order?.assignedTo?.shopper?.full_name ||
                  order?.assignedTo?.name ||
                  order?.shopper?.name ||
                  "Shopper";
              }

              const contactName = employeeId && !isBusinessChat
                ? `00${employeeId} ${fullName}`
                : fullName;

              const contactAvatar = isBusinessChat
                ? conversation.counterpartAvatar || "https://ui-avatars.com/api/?name=Business&background=10b981&color=fff"
                : order?.assignedTo?.shopper?.profile_photo ||
                  order?.assignedTo?.profile_picture ||
                  order?.shopper?.avatar ||
                  "/images/ProfileImage.png";
              const isOnline = isShopperOnline(conversation.shopperId);

              return (
                <div
                  key={conversation.id}
                  onClick={() =>
                    onConversationClick(conversation.orderId, conversation.id!)
                  }
                  className="flex cursor-pointer items-center transition-colors hover:bg-black/5 active:bg-black/10 dark:hover:bg-white/5 dark:active:bg-white/10"
                >
                  {/* Left Side: Avatar */}
                  <div className="relative pl-4 pr-3 py-3 flex-shrink-0">
                    <div className="flex h-[52px] w-[52px] items-center justify-center overflow-hidden rounded-full bg-gray-300 dark:bg-gray-600">
                      {contactAvatar && contactAvatar !== "/images/ProfileImage.png" ? (
                        <img
                          src={contactAvatar}
                          alt={contactName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-[22px] font-medium text-[var(--text-secondary)] uppercase">
                          {contactName.charAt(0)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Side: Content with perfectly aligned inner bottom border common in iOS WhatsApp */}
                  <div className="min-w-0 flex-1 py-3 pr-4 h-full flex flex-col justify-center border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between pb-[1px]">
                      <h3 className="truncate text-[17px] font-medium text-[var(--text-primary)]">
                        {contactName}
                      </h3>
                      <span className={`whitespace-nowrap pl-2 text-xs ${conversation.unreadCount > 0 ? "font-medium text-green-500" : "font-normal text-[var(--text-secondary)]"}`}>
                        {formatMessageTime(conversation.lastMessageTime)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`line-clamp-1 pr-2 text-[15px] leading-tight ${conversation.unreadCount > 0 ? "font-medium text-[var(--text-primary)]" : "font-normal text-[var(--text-secondary)]"}`}>
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
