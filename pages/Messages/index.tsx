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
  Timestamp,
  or,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../src/lib/firebase";
import { useRouter } from "next/router";
import Link from "next/link";
import { Button } from "rsuite";
import CustomerChatDrawer from "../../src/components/chat/CustomerChatDrawer";
import { isMobileDevice } from "../../src/lib/formatters";
import { AuthGuard } from "../../src/components/AuthGuard";
import DesktopMessagePage from "../../src/components/messages/DesktopMessagePage";
import MobileMessagePage from "../../src/components/messages/MobileMessagePage";
import MobileChatPage from "../../src/components/messages/MobileChatPage";
import { useTheme } from "../../src/context/ThemeContext";
import {
  ChatCollection,
  ChatConversation as Conversation,
} from "../../src/services/chatService";

// Helper to format order ID
function formatOrderID(id?: string | number): string {
  if (!id) return "0000";
  const s = id.toString();
  return s.length >= 4 ? s : s.padStart(4, "0");
}

function MessagesPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [orderConversations, setOrderConversations] = useState<Conversation[]>(
    []
  );
  const [businessConversations, setBusinessConversations] = useState<
    Conversation[]
  >([]);
  const [conversationsFromOrders, setConversationsFromOrders] = useState<
    Conversation[]
  >([]);

  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingBusiness, setLoadingBusiness] = useState(true);
  const [businessAccountId, setBusinessAccountId] = useState<string | null>(
    null
  );
  const [loadingBusinessAccount, setLoadingBusinessAccount] = useState(true);
  const loading =
    loadingOrders ||
    loadingBusiness ||
    (status === "authenticated" && loadingBusinessAccount);

  // Merged and deduped
  const conversations = React.useMemo(() => {
    const byId = new Map<string, Conversation>();
    [
      ...orderConversations,
      ...businessConversations,
      ...conversationsFromOrders,
    ].forEach((c) => {
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
  }, [orderConversations, businessConversations, conversationsFromOrders]);

  const [orders, setOrders] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>(
    undefined
  );
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | undefined
  >(undefined);

  // Check if mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(isMobileDevice());
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle query parameters for auto-selection
  useEffect(() => {
    const { orderId, conversationId, chat } = router.query;
    const activeChatId = chat || conversationId;

    if (orderId && typeof orderId === "string") {
      setSelectedOrderId(orderId);
    }
    if (activeChatId && typeof activeChatId === "string") {
      setSelectedConversationId(activeChatId);
      if (!isMobile) {
        setIsDrawerOpen(true);
      }
    } else {
      setSelectedConversationId(undefined);
      setIsDrawerOpen(false);
    }
  }, [router.query, isMobile]);

  // Fetch user's business account ID
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      const fetchBusinessAccount = async () => {
        try {
          const res = await fetch("/api/queries/check-business-account");
          if (res.ok) {
            const data = await res.json();
            if (data.hasAccount && data.account?.id) {
              setBusinessAccountId(data.account.id);
            }
          }
        } catch (err) {
          console.error("Error fetching business account:", err);
        } finally {
          setLoadingBusinessAccount(false);
        }
      };
      fetchBusinessAccount();
    } else if (status !== "loading") {
      setLoadingBusinessAccount(false);
    }
  }, [status, session?.user?.id]);

  // Real-time listener for Order Conversations
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      const userId = session.user.id;
      if (!db) return;

      const q = query(
        collection(db!, "chat_conversations"),
        or(where("customerId", "==", userId), where("shopperId", "==", userId)),
        orderBy("lastMessageTime", "desc")
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list = snapshot.docs.map((doc) => ({
            id: doc.id,
            collectionPath: "chat_conversations" as ChatCollection,
            ...doc.data(),
            lastMessageTime:
              doc.data().lastMessageTime instanceof Timestamp
                ? doc.data().lastMessageTime.toDate()
                : doc.data().lastMessageTime,
          })) as Conversation[];
          console.log(
            `🔍 [Messages] Received ${list.length} order conversations`
          );
          setOrderConversations((prev) => {
            const newIds = new Set(list.map((c) => c.id));
            const manualItems = prev.filter((c) => !newIds.has(c.id));
            return [...list, ...manualItems];
          });
          setLoadingOrders(false);
        },
        (err) => {
          console.error("❌ [Messages] Order conversations error:", err);
          setLoadingOrders(false);
        }
      );

      return () => unsubscribe();
    }
  }, [status, session?.user?.id]);

  // Real-time listener for Business Conversations
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      const userId = session.user.id;
      if (!db) return;

      const constraints = [
        where("businessId", "==", userId),
        where("counterpartId", "==", userId),
      ];

      if (businessAccountId) {
        constraints.push(where("businessId", "==", businessAccountId));
        constraints.push(where("counterpartId", "==", businessAccountId));
      }

      const q = query(
        collection(db!, "business_conversations"),
        or(...constraints),
        orderBy("lastMessageTime", "desc")
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list = snapshot.docs.map((doc) => ({
            id: doc.id,
            collectionPath: "business_conversations" as ChatCollection,
            ...doc.data(),
            lastMessageTime:
              doc.data().lastMessageTime instanceof Timestamp
                ? doc.data().lastMessageTime.toDate()
                : doc.data().lastMessageTime,
          })) as Conversation[];
          if (list.length > 0) {
            console.log("🔍 [Messages] Sample Business Chat Data:", list[0]);
          }
          console.log(
            `🔍 [Messages] Received ${list.length} business conversations`
          );
          setBusinessConversations((prev) => {
            // Merge snapshot with existing items (preserving manually fetched ones not in snapshot yet)
            const newIds = new Set(list.map((c) => c.id));
            const manualItems = prev.filter((c) => !newIds.has(c.id));
            return [...list, ...manualItems];
          });
          setLoadingBusiness(false);
        },
        (err) => {
          console.error("❌ [Messages] Business conversations error:", err);
          setLoadingBusiness(false);
        }
      );

      return () => unsubscribe();
    }
  }, [status, session?.user?.id, businessAccountId]);

  // Fetch specific conversation from query params if not in list
  useEffect(() => {
    if (!db || status !== "authenticated") return;
    const { conversationId, collection: collectionName } = router.query;

    if (
      conversationId &&
      typeof conversationId === "string" &&
      collectionName &&
      typeof collectionName === "string"
    ) {
      const coll = collectionName as ChatCollection;
      const alreadyInList = [
        ...orderConversations,
        ...businessConversations,
        ...conversationsFromOrders,
      ].some((c) => c.id === conversationId);

      if (!alreadyInList) {
        console.log(
          `🔍 [Messages] Deep link conversation ${conversationId} not in list, fetching specifically...`
        );
        const fetchSpec = async () => {
          try {
            const docRef = doc(db!, coll, conversationId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              const data = docSnap.data();
              const conv = {
                id: docSnap.id,
                collectionPath: coll,
                ...data,
                lastMessageTime:
                  data.lastMessageTime instanceof Timestamp
                    ? data.lastMessageTime.toDate()
                    : data.lastMessageTime,
              } as Conversation;

              if (coll === "business_conversations") {
                setBusinessConversations((prev) => [conv, ...prev]);
              } else {
                setOrderConversations((prev) => [conv, ...prev]);
              }
              console.log(
                `🔍 [Messages] Successfully fetched deep link conversation:`,
                conv
              );
            } else {
              console.warn(
                `⚠️ [Messages] Deep link conversation not found in ${coll}: ${conversationId}`
              );
            }
          } catch (err) {
            console.error(
              "❌ [Messages] Error fetching deep link conversation:",
              err
            );
          }
        };
        fetchSpec();
      }
    }
  }, [
    router.query,
    db,
    status,
    orderConversations.length,
    businessConversations.length,
  ]);

  // Fallback for guest-upgraded orders or ID mismatches
  useEffect(() => {
    if (!db || status !== "authenticated" || !session?.user?.id) return;

    let cancelled = false;
    const run = async () => {
      try {
        const res = await fetch(
          "/api/queries/user-orders?page=1&limit=30&minimal=1"
        );
        if (!res.ok || cancelled) return;
        const data = await res.json();
        const orderIds = (data.orders || [])
          .map((o: any) => o.id)
          .filter(
            (id: string) =>
              id &&
              /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                id
              )
          )
          .slice(0, 30);

        if (orderIds.length === 0 || cancelled) return;

        const q = query(
          collection(db!, "chat_conversations"),
          where("orderId", "in", orderIds)
        );
        const snapshot = await getDocs(q);
        if (cancelled) return;

        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          collectionPath: "chat_conversations" as ChatCollection,
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

  // Fetch counterpart details for business conversations
  useEffect(() => {
    const businessConversationsToFetch = conversations
      .filter(
        (c) =>
          c.collectionPath === "business_conversations" &&
          c.counterpartId &&
          !c.counterpartName
      )
      .map((c) => c.counterpartId!);

    if (businessConversationsToFetch.length === 0) return;

    let cancelled = false;
    const fetchCounterparts = async () => {
      const uniqueIds = Array.from(new Set(businessConversationsToFetch));
      const promises = uniqueIds.map(async (uid) => {
        try {
          const userRef = doc(db!, "users", uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            return {
              id: uid,
              name: userSnap.data().name || userSnap.data().full_name,
              avatar:
                userSnap.data().profile_picture ||
                userSnap.data().profile_photo,
            };
          }
          return { id: uid, name: "Unknown User" };
        } catch (error) {
          return { id: uid, name: "Error Loading" };
        }
      });

      const results = await Promise.all(promises);
      if (cancelled) return;

      setBusinessConversations((prev) =>
        prev.map((conv) => {
          const result = results.find((r) => r.id === conv.counterpartId);
          if (result && !conv.counterpartName) {
            return {
              ...conv,
              counterpartName: result.name,
              counterpartAvatar: result.avatar,
            };
          }
          return conv;
        })
      );
    };

    fetchCounterparts();
    return () => {
      cancelled = true;
    };
  }, [conversations]);

  // Fetch order details for order-type conversations
  useEffect(() => {
    const orderIds = conversations
      .filter((c) => c.collectionPath === "chat_conversations" && c.orderId)
      .map((c) => c.orderId!)
      .filter((id) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          id
        )
      );

    if (orderIds.length === 0) return;

    let cancelled = false;
    const fetchOrders = async () => {
      const toFetch = orderIds.filter(
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

  const filteredConversations = conversations
    .filter((conversation) => {
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();

        // Match by message text
        if (conversation.lastMessage?.toLowerCase().includes(searchLower))
          return true;

        // Match by title (for business chats)
        if (conversation.title?.toLowerCase().includes(searchLower))
          return true;
        if (conversation.counterpartName?.toLowerCase().includes(searchLower))
          return true;
        if (conversation.counterpartId?.toLowerCase().includes(searchLower))
          return true;

        // Match by order details
        if (conversation.orderId) {
          const order = orders[conversation.orderId];
          const shopName = order?.shop?.name?.toLowerCase() || "";
          const orderNumber = formatOrderID(
            order?.OrderID || conversation.orderId
          ).toLowerCase();
          return (
            shopName.includes(searchLower) || orderNumber.includes(searchLower)
          );
        }

        return false;
      }
      return showUnreadOnly ? conversation.unreadCount > 0 : true;
    })
    .sort((a, b) => {
      const timeA = a.lastMessageTime
        ? new Date(a.lastMessageTime).getTime()
        : 0;
      const timeB = b.lastMessageTime
        ? new Date(b.lastMessageTime).getTime()
        : 0;
      return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
    });

  const handleChatClick = (orderId?: string, conversationId?: string) => {
    if (isMobile && conversationId) {
      router.push(
        {
          pathname: "/Messages",
          query: {
            ...router.query,
            chat: conversationId,
            orderId: orderId || "",
          },
        },
        undefined,
        { shallow: true }
      );
    } else {
      setSelectedOrderId(orderId);
      setSelectedConversationId(conversationId);
      setIsDrawerOpen(true);
    }
  };

  if (loading && status === "authenticated") {
    return (
      <RootLayout>
        <div className="flex h-full w-full flex-col bg-[var(--bg-primary)] sm:flex-row">
          {/* Sidebar Skeleton */}
          <div className="h-full w-full border-r border-gray-100 p-4 dark:border-gray-800 sm:w-1/3 md:w-1/4">
            <div className="mb-6 h-8 w-1/2 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
            <div className="mb-4 h-10 w-full animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Main Area Skeleton (hidden on small screens) */}
          <div className="hidden h-full flex-1 flex-col sm:flex">
            <div className="flex items-center border-b border-gray-100 p-4 dark:border-gray-800">
              <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="ml-3 h-5 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="flex-1 space-y-6 p-6">
               <div className="flex gap-3">
                 <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
                 <div className="h-20 w-1/2 animate-pulse rounded-2xl rounded-tl-none bg-gray-100 dark:bg-gray-800" />
               </div>
               <div className="flex justify-end gap-3">
                 <div className="h-16 w-1/3 animate-pulse rounded-2xl rounded-tr-none bg-green-50 dark:bg-green-900/20" />
               </div>
               <div className="flex gap-3">
                 <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
                 <div className="h-12 w-1/3 animate-pulse rounded-2xl rounded-tl-none bg-gray-100 dark:bg-gray-800" />
               </div>
            </div>
            <div className="border-t border-gray-100 p-4 dark:border-gray-800">
              <div className="h-12 w-full animate-pulse rounded-full bg-gray-100 dark:bg-gray-800" />
            </div>
          </div>
        </div>
      </RootLayout>
    );
  }

  if (status !== "authenticated") {
    return (
      <RootLayout>
        <div className="flex h-full w-full items-center justify-center bg-[var(--bg-primary)]">
          <div className="text-center">
            <h3 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">
              Authentication Required
            </h3>
            <Link href="/login" passHref>
              <Button appearance="primary">Sign In</Button>
            </Link>
          </div>
        </div>
      </RootLayout>
    );
  }

  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId
  );

  if (!isMobile) {
    return (
      <AuthGuard requireAuth={true}>
        <RootLayout>
          <div className="h-full w-full overflow-hidden bg-[var(--bg-primary)]">
            <DesktopMessagePage
              conversations={conversations}
              orders={orders}
              loading={loading}
              onConversationSelect={(orderId, convId) => {
                setSelectedOrderId(orderId);
                setSelectedConversationId(convId);
              }}
              selectedOrderId={selectedOrderId}
              selectedConversationId={selectedConversationId}
            />
          </div>
        </RootLayout>
      </AuthGuard>
    );
  }

  // Render Mobile View
  // If a chat is selected via URL query, render just the ChatPage full screen
  if (selectedConversation && router.query.chat) {
    return (
      <AuthGuard requireAuth={true}>
        <RootLayout hideNavigation={true}>
          <div className="h-full w-full bg-[var(--bg-primary)]">
            <MobileChatPage
              conversationId={selectedConversation.id!}
              collectionPath={selectedConversation.collectionPath}
              orderId={selectedConversation.orderId}
              counterpart={{
                id:
                  selectedConversation.shopperId ||
                  selectedConversation.businessId ||
                  selectedConversation.counterpartId ||
                  selectedConversation.customerId ||
                  "",
                name:
                  selectedConversation.title ||
                  selectedConversation.counterpartName ||
                  "User",
                avatar:
                  orders[selectedConversation.orderId!]?.shopper?.avatar ||
                  selectedConversation.counterpartAvatar ||
                  "/images/ProfileImage.png",
                role:
                  selectedConversation.collectionPath ===
                  "business_conversations"
                    ? "business"
                    : "shopper",
                phone: "",
              }}
              onBack={() => {
                // Remove chat from query to return to list
                const newQuery = { ...router.query };
                delete newQuery.chat;
                router.push(
                  { pathname: "/Messages", query: newQuery },
                  undefined,
                  { shallow: true }
                );
              }}
            />
          </div>
        </RootLayout>
      </AuthGuard>
    );
  }

  // Otherwise render the Chat List
  return (
    <AuthGuard requireAuth={true}>
      <RootLayout>
        <div className="h-full w-full overflow-hidden bg-[var(--bg-primary)]">
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
            isDrawerOpen={false}
            onCloseDrawer={() => {}}
          />
        </div>
      </RootLayout>
    </AuthGuard>
  );
}

export default MessagesPage;
