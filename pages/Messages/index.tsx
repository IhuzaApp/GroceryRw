import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import RootLayout from "@components/ui/layout";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
  doc,
  updateDoc,
  Timestamp,
  Unsubscribe,
  addDoc,
  serverTimestamp,
  getDoc,
  or,
} from "firebase/firestore";
import { db } from "../../src/lib/firebase";
import { useRouter } from "next/router";
import Link from "next/link";
import { Button, Loader, Panel, Placeholder, Avatar, Input } from "rsuite";
import { formatCurrency } from "../../src/lib/formatCurrency";
import CustomerChatDrawer from "../../src/components/chat/CustomerChatDrawer";
import { isMobileDevice } from "../../src/lib/formatters";
import { AuthGuard } from "../../src/components/AuthGuard";
import DesktopMessagePage from "../../src/components/messages/DesktopMessagePage";
import MobileMessagePage from "../../src/components/messages/MobileMessagePage";
import {
  containsBlockedPii,
  getBlockedMessage,
} from "../../src/lib/chatPiiBlock";
import { useTheme } from "../../src/context/ThemeContext";

// Helper to display timestamps as relative time ago
function timeAgo(timestamp: any) {
  if (!timestamp) return "";

  const now = new Date().getTime();
  const date =
    timestamp instanceof Timestamp
      ? timestamp.toDate().getTime()
      : new Date(timestamp).getTime();

  const diff = now - date;
  const seconds = Math.floor(diff / 1000);

  if (seconds < 60) return `${seconds} sec${seconds !== 1 ? "s" : ""} ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes !== 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(date).toLocaleDateString();
}

// Helper to format order ID
function formatOrderID(id?: string | number): string {
  if (!id) return "0000";
  const s = id.toString();
  return s.length >= 4 ? s : s.padStart(4, "0");
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

// Define conversation interface
interface Conversation {
  id: string;
  orderId?: string;
  customerId?: string;
  shopperId?: string;
  businessId?: string;
  type?: "order" | "business";
  title?: string;
  counterpartName?: string;
  lastMessage: string;
  lastMessageTime: any;
  unreadCount: number;
  order?: any;
}

function MessagesPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [conversationsFromCustomer, setConversationsFromCustomer] = useState<
    Conversation[]
  >([]);
  const [conversationsFromOrders, setConversationsFromOrders] = useState<
    Conversation[]
  >([]);
  // Merged and deduped: customerId match + conversations for user's orders (fallback for ID mismatch e.g. guest upgrade)
  const conversations = React.useMemo(() => {
    const byId = new Map<string, Conversation>();
    [...conversationsFromCustomer, ...conversationsFromOrders].forEach((c) => {
      if (c.id && !byId.has(c.id)) byId.set(c.id, c);
    });
    return Array.from(byId.values()).sort((a, b) => {
      const timeA = a.lastMessageTime
        ? new Date(a.lastMessageTime).getTime()
        : 0;
      const timeB = b.lastMessageTime
        ? new Date(b.lastMessageTime).getTime()
        : 0;
      return timeB - timeA;
    });
  }, [conversationsFromCustomer, conversationsFromOrders]);
  const [orders, setOrders] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>(
    undefined
  );
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | undefined
  >(undefined);
  const [sendError, setSendError] = useState<string | null>(null);

  // Check if mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(isMobileDevice());
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle orderId query parameter to auto-select conversation (no auto-creation)
  useEffect(() => {
    const { orderId } = router.query;
    if (orderId && typeof orderId === "string") {
      setSelectedOrderId(orderId);
      // If mobile, navigate to the specific order chat page that handles creation safely
      if (isMobile) {
        router.push(`/Messages/${orderId}`);
      }
    }
  }, [router.query, isMobile]);

  // Fetch conversations and their associated orders
  useEffect(() => {
    // Only fetch if user is authenticated
    if (status === "authenticated" && session?.user?.id) {
      const userId = session.user.id;

      const fetchConversationsAndOrders = async () => {
        try {
          setLoading(true);

          // Get conversations where the current user is either the customer or shopper
          if (!db) return;
          const conversationsRef = collection(db!, "chat_conversations");

          // Query for conversations where user is customer, shopper, or business participant
          const q = query(
            conversationsRef,
            or(
              where("customerId", "==", userId),
              where("shopperId", "==", userId),
              where("businessId", "==", userId)
            ),
            orderBy("lastMessageTime", "desc")
          );

          // Set up real-time listener for conversations (customerId match)
          const unsubscribe = onSnapshot(
            q,
            async (snapshot) => {
              const conversationList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                lastMessageTime:
                  doc.data().lastMessageTime instanceof Timestamp
                    ? doc.data().lastMessageTime.toDate()
                    : doc.data().lastMessageTime,
              })) as Conversation[];

              setConversationsFromCustomer(conversationList);

              setLoading(false);
            },
            (error) => {
              setLoading(false);
            }
          );

          return unsubscribe;
        } catch (error) {
          setLoading(false);
          return undefined;
        }
      };

      const unsubscribePromise = fetchConversationsAndOrders();
      return () => {
        unsubscribePromise.then((unsubscribe) => {
          if (unsubscribe) {
            unsubscribe();
          }
        });
      };
    }
  }, [status, session?.user?.id]);

  // Fallback: fetch conversations by user's order IDs (catches guest-upgrade or customerId mismatch)
  useEffect(() => {
    if (!db || status !== "authenticated" || !session?.user?.id) return;

    let cancelled = false;
    const conversationsRef = collection(db!, "chat_conversations");

    const run = async () => {
      try {
        const res = await fetch(
          "/api/queries/user-orders?page=1&limit=30&minimal=1"
        );
        if (!res.ok || cancelled) return;
        const data = await res.json();
        const ordersList = data.orders || [];
        const orderIds = ordersList
          .map((o: any) => o.id)
          .filter(
            (id: string) =>
              id &&
              typeof id === "string" &&
              id.trim() !== "" &&
              /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                id
              )
          )
          .slice(0, 30); // Firestore "in" limit
        if (orderIds.length === 0 || cancelled) return;

        const q = query(conversationsRef, where("orderId", "in", orderIds));
        const snapshot = await getDocs(q);
        if (cancelled) return;
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          lastMessageTime:
            doc.data().lastMessageTime instanceof Timestamp
              ? doc.data().lastMessageTime.toDate()
              : doc.data().lastMessageTime,
        })) as Conversation[];
        setConversationsFromOrders(list);
      } catch (err) {
        if (!cancelled)
          console.error("Error fetching conversations by orders:", err);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [status, session?.user?.id]);

  // Fetch order details for all conversations (merged list)
  useEffect(() => {
    const orderIds = conversations
      .map((c) => c.orderId)
      .filter((id) => id && typeof id === "string" && id.trim() !== "");
    if (orderIds.length === 0) return;

    let cancelled = false;
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const validIds = orderIds.filter((id) => uuidRegex.test(id));

    const fetchOrders = async () => {
      // Only fetch orders we don't already have (avoid refetch on every merge)
      const toFetch = validIds.filter(
        (id) => !orders[id] || (orders[id] as any)?.error
      );
      if (toFetch.length === 0) return;
      const promises = toFetch.map(async (orderId) => {
        try {
          const res = await fetch(`/api/queries/orderDetails?id=${orderId}`);
          if (!res.ok)
            return { orderId, order: { error: true, status: res.status } };
          const data = await res.json();
          return { orderId, order: data.order };
        } catch (error) {
          return { orderId, order: { error: true } };
        }
      });
      const results = await Promise.all(promises);
      if (cancelled) return;
      setOrders((prev) => {
        const next = { ...prev };
        let changed = false;
        results.forEach(({ orderId, order }) => {
          if (
            order &&
            !order.error &&
            (!prev[orderId] || (prev[orderId] as any).error)
          ) {
            next[orderId] = order;
            changed = true;
          } else if (!prev[orderId]) {
            next[orderId] = order || { error: true };
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    };

    fetchOrders();
    return () => {
      cancelled = true;
    };
  }, [conversations, orders]);

  // Filter and sort conversations
  const filteredConversations = conversations
    .filter((conversation) => {
      // Apply search filter
      if (searchQuery) {
        const order = orders[conversation.orderId];
        const shopName = order?.shop?.name?.toLowerCase() || "";
        const orderNumber = formatOrderID(
          order?.OrderID || conversation.orderId
        ).toLowerCase();
        const messageText = conversation.lastMessage?.toLowerCase() || "";

        const searchLower = searchQuery.toLowerCase();
        return (
          shopName.includes(searchLower) ||
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

  // Handle chat click
  const handleChatClick = async (orderId?: string, conversationId?: string) => {
    if (isMobile && orderId) {
      router.push(`/Messages/${orderId}`);
    } else {
      setSelectedOrderId(orderId);
      setSelectedConversationId(conversationId);
      setIsDrawerOpen(true);
    }
  };

  // Handle conversation select for desktop
  const handleConversationSelect = (
    orderId?: string,
    conversationId?: string
  ) => {
    setSelectedOrderId(orderId);
    setSelectedConversationId(conversationId);
  };


  // Handle sending a new message

  // Render loading state
  if (loading) {
    return (
      <RootLayout>
        <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center bg-[var(--bg-primary)]">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src="/assets/logos/PlasIcon.png"
                alt="Plas Logo"
                className="h-16 w-16 animate-pulse"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
              </div>
            </div>
            <div className="text-center">
              <h3 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">
                Loading...
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Loading conversations
              </p>
            </div>
          </div>
        </div>
      </RootLayout>
    );
  }

  // Render authentication required
  if (status !== "authenticated") {
    return (
      <RootLayout>
        <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center bg-[var(--bg-primary)]">
          <div className="text-center">
            <div className="mb-4 text-6xl">⚠️</div>
            <h3 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">
              Authentication Required
            </h3>
            <p className="mb-4 text-[var(--text-secondary)]">
              Please sign in to view your messages.
            </p>
            <Link href="/login" passHref>
              <Button appearance="primary">Sign In</Button>
            </Link>
          </div>
        </div>
      </RootLayout>
    );
  }


  // Render desktop view with new component
  if (!isMobile) {
    return (
      <AuthGuard requireAuth={true}>
        <RootLayout>
          <div className="h-[calc(100vh-4rem)] w-full overflow-hidden bg-[var(--bg-primary)]">
            <DesktopMessagePage
              conversations={conversations}
              orders={orders}
              loading={loading}
              onConversationSelect={handleConversationSelect}
              selectedOrderId={selectedOrderId}
              selectedConversationId={selectedConversationId}
            />
          </div>
        </RootLayout>
      </AuthGuard>
    );
  }

  // Render mobile view with new component
  return (
    <AuthGuard requireAuth={true}>
      <RootLayout>
        <div className="h-[calc(100vh-4rem)] w-full overflow-hidden bg-[var(--bg-primary)]">
          <MobileMessagePage
            conversations={conversations}
            orders={orders}
            loading={loading}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            showUnreadOnly={showUnreadOnly}
            setShowUnreadOnly={setShowUnreadOnly}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            onConversationClick={handleChatClick}
            selectedOrder={selectedOrder}
            isDrawerOpen={isDrawerOpen}
            onCloseDrawer={() => setIsDrawerOpen(false)}
          />
          {/* Customer Chat Drawer for Mobile */}
          {selectedConversation && (
            <CustomerChatDrawer
              conversationId={selectedConversation.id}
              orderId={selectedConversation.orderId}
              counterpart={{
                id:
                  selectedConversation.shopperId ||
                  selectedConversation.businessId ||
                  selectedConversation.customerId ||
                  "",
                name:
                  selectedConversation.counterpartName ||
                  selectedConversation.title ||
                  "User",
                avatar:
                  selectedConversation.order?.shopper?.avatar ||
                  "/images/ProfileImage.png",
                role:
                  selectedConversation.type === "business"
                    ? "business"
                    : "shopper",
              }}
              isOpen={isDrawerOpen}
              onClose={() => setIsDrawerOpen(false)}
            />
          )}
        </div>
      </RootLayout>
    </AuthGuard>
  );
}

export default MessagesPage;
