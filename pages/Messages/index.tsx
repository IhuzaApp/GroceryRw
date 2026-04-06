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
import { useTheme } from "../../src/context/ThemeContext";
import { ChatCollection, ChatConversation as Conversation } from "../../src/services/chatService";

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
  
  const [orderConversations, setOrderConversations] = useState<Conversation[]>([]);
  const [businessConversations, setBusinessConversations] = useState<Conversation[]>([]);
  const [conversationsFromOrders, setConversationsFromOrders] = useState<Conversation[]>([]);
  
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingBusiness, setLoadingBusiness] = useState(true);
  const loading = loadingOrders || loadingBusiness;
  
  // Merged and deduped
  const conversations = React.useMemo(() => {
    const byId = new Map<string, Conversation>();
    [...orderConversations, ...businessConversations, ...conversationsFromOrders].forEach((c) => {
      if (c.id && !byId.has(c.id)) byId.set(c.id, c);
    });
    return Array.from(byId.values()).sort((a, b) => {
      const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
      const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
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
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>(undefined);
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(undefined);

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
    const { orderId, conversationId } = router.query;
    if (orderId && typeof orderId === "string") {
      setSelectedOrderId(orderId);
      if (isMobile) {
        router.push(`/Messages/${orderId}`);
      }
    }
    if (conversationId && typeof conversationId === "string") {
      setSelectedConversationId(conversationId);
      if (isMobile) {
        setIsDrawerOpen(true);
      }
    }
  }, [router.query, isMobile]);

  // Real-time listener for Order Conversations
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      const userId = session.user.id;
      if (!db) return;
      
      const q = query(
        collection(db!, "chat_conversations"),
        or(
          where("customerId", "==", userId),
          where("shopperId", "==", userId)
        ),
        orderBy("lastMessageTime", "desc")
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(doc => ({
          id: doc.id,
          collectionPath: "chat_conversations" as ChatCollection,
          ...doc.data(),
          lastMessageTime: doc.data().lastMessageTime instanceof Timestamp 
            ? doc.data().lastMessageTime.toDate() 
            : doc.data().lastMessageTime,
        })) as Conversation[];
        console.log(`🔍 [Messages] Received ${list.length} order conversations`);
        setOrderConversations(list);
        setLoadingOrders(false);
      }, (err) => {
        console.error("❌ [Messages] Order conversations error:", err);
        setLoadingOrders(false);
      });

      return () => unsubscribe();
    }
  }, [status, session?.user?.id]);

  // Real-time listener for Business Conversations
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      const userId = session.user.id;
      if (!db) return;
      
      const q = query(
        collection(db!, "business_conversations"),
        or(
          where("businessId", "==", userId),
          where("counterpartId", "==", userId)
        ),
        orderBy("lastMessageTime", "desc")
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(doc => ({
          id: doc.id,
          collectionPath: "business_conversations" as ChatCollection,
          ...doc.data(),
          lastMessageTime: doc.data().lastMessageTime instanceof Timestamp 
            ? doc.data().lastMessageTime.toDate() 
            : doc.data().lastMessageTime,
        })) as Conversation[];
        if (list.length > 0) {
          console.log("🔍 [Messages] Sample Business Chat Data:", list[0]);
        }
        console.log(`🔍 [Messages] Received ${list.length} business conversations`);
        setBusinessConversations(list);
        setLoadingBusiness(false);
      }, (err) => {
        console.error("❌ [Messages] Business conversations error:", err);
        setLoadingBusiness(false);
      });

      return () => unsubscribe();
    }
  }, [status, session?.user?.id]);

  // Fetch specific conversation from query params if not in list
  useEffect(() => {
    if (!db || status !== "authenticated") return;
    const { conversationId, collection: collectionName } = router.query;
    
    if (conversationId && typeof conversationId === "string" && collectionName && typeof collectionName === "string") {
      const coll = collectionName as ChatCollection;
      const alreadyInList = [...orderConversations, ...businessConversations, ...conversationsFromOrders].some(c => c.id === conversationId);
      
      if (!alreadyInList) {
        console.log(`🔍 [Messages] Deep link conversation ${conversationId} not in list, fetching specifically...`);
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
                lastMessageTime: data.lastMessageTime instanceof Timestamp 
                  ? data.lastMessageTime.toDate() 
                  : data.lastMessageTime,
              } as Conversation;
              
              if (coll === "business_conversations") {
                setBusinessConversations(prev => [conv, ...prev]);
              } else {
                setOrderConversations(prev => [conv, ...prev]);
              }
              console.log(`🔍 [Messages] Successfully fetched deep link conversation:`, conv);
            } else {
              console.warn(`⚠️ [Messages] Deep link conversation not found in ${coll}: ${conversationId}`);
            }
          } catch (err) {
            console.error("❌ [Messages] Error fetching deep link conversation:", err);
          }
        };
        fetchSpec();
      }
    }
  }, [router.query, db, status, orderConversations.length, businessConversations.length]);

  // Fallback for guest-upgraded orders or ID mismatches
  useEffect(() => {
    if (!db || status !== "authenticated" || !session?.user?.id) return;

    let cancelled = false;
    const run = async () => {
      try {
        const res = await fetch("/api/queries/user-orders?page=1&limit=30&minimal=1");
        if (!res.ok || cancelled) return;
        const data = await res.json();
        const orderIds = (data.orders || [])
          .map((o: any) => o.id)
          .filter((id: string) => id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))
          .slice(0, 30);
          
        if (orderIds.length === 0 || cancelled) return;

        const q = query(collection(db!, "chat_conversations"), where("orderId", "in", orderIds));
        const snapshot = await getDocs(q);
        if (cancelled) return;
        
        const list = snapshot.docs.map(doc => ({
          id: doc.id,
          collectionPath: "chat_conversations" as ChatCollection,
          ...doc.data(),
          lastMessageTime: doc.data().lastMessageTime instanceof Timestamp 
            ? doc.data().lastMessageTime.toDate() 
            : doc.data().lastMessageTime,
        })) as Conversation[];
        setConversationsFromOrders(list);
      } catch (err) {
        if (!cancelled) console.error("Error fetching conversations by orders:", err);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [status, session?.user?.id]);

  // Fetch counterpart details for business conversations
  useEffect(() => {
    const businessConversationsToFetch = conversations
      .filter(c => c.collectionPath === "business_conversations" && c.counterpartId && !c.counterpartName)
      .map(c => c.counterpartId!);
      
    if (businessConversationsToFetch.length === 0) return;

    let cancelled = false;
    const fetchCounterparts = async () => {
      const uniqueIds = Array.from(new Set(businessConversationsToFetch));
      const promises = uniqueIds.map(async (uid) => {
        try {
          const userRef = doc(db!, "users", uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            return { id: uid, name: userSnap.data().name || userSnap.data().full_name, avatar: userSnap.data().profile_picture || userSnap.data().profile_photo };
          }
          return { id: uid, name: "Unknown User" };
        } catch (error) {
          return { id: uid, name: "Error Loading" };
        }
      });

      const results = await Promise.all(promises);
      if (cancelled) return;

      setBusinessConversations(prev => prev.map(conv => {
        const result = results.find(r => r.id === conv.counterpartId);
        if (result && !conv.counterpartName) {
          return { ...conv, counterpartName: result.name, counterpartAvatar: result.avatar };
        }
        return conv;
      }));
    };

    fetchCounterparts();
    return () => { cancelled = true; };
  }, [conversations]);

  // Fetch order details for order-type conversations
  useEffect(() => {
    const orderIds = conversations
      .filter(c => c.collectionPath === "chat_conversations" && c.orderId)
      .map(c => c.orderId!)
      .filter(id => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));
      
    if (orderIds.length === 0) return;

    let cancelled = false;
    const fetchOrders = async () => {
      const toFetch = orderIds.filter(id => !orders[id] || (orders[id] as any)?.error);
      if (toFetch.length === 0) return;
      
      const promises = toFetch.map(async (orderId) => {
        try {
          const res = await fetch(`/api/queries/orderDetails?id=${orderId}`);
          if (!res.ok) return { orderId, order: { error: true, status: res.status } };
          const data = await res.json();
          return { orderId, order: data.order };
        } catch (error) {
          return { orderId, order: { error: true } };
        }
      });
      
      const results = await Promise.all(promises);
      if (cancelled) return;
      
      setOrders(prev => {
        const next = { ...prev };
        let changed = false;
        results.forEach(({ orderId, order }) => {
          if (order && !order.error && (!prev[orderId] || (prev[orderId] as any).error)) {
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
    return () => { cancelled = true; };
  }, [conversations, orders]);

  const filteredConversations = conversations
    .filter(conversation => {
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        
        // Match by message text
        if (conversation.lastMessage?.toLowerCase().includes(searchLower)) return true;
        
        // Match by title (for business chats)
        if (conversation.title?.toLowerCase().includes(searchLower)) return true;
        if (conversation.counterpartName?.toLowerCase().includes(searchLower)) return true;
        if (conversation.counterpartId?.toLowerCase().includes(searchLower)) return true;
        
        // Match by order details
        if (conversation.orderId) {
          const order = orders[conversation.orderId];
          const shopName = order?.shop?.name?.toLowerCase() || "";
          const orderNumber = formatOrderID(order?.OrderID || conversation.orderId).toLowerCase();
          return shopName.includes(searchLower) || orderNumber.includes(searchLower);
        }
        
        return false;
      }
      return showUnreadOnly ? conversation.unreadCount > 0 : true;
    })
    .sort((a, b) => {
      const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
      const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
      return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
    });

  const handleChatClick = (orderId?: string, conversationId?: string) => {
    if (isMobile && orderId) {
      router.push(`/Messages/${orderId}`);
    } else {
      setSelectedOrderId(orderId);
      setSelectedConversationId(conversationId);
      setIsDrawerOpen(true);
    }
  };

  if (loading && status === "authenticated") {
    return (
      <RootLayout>
        <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center bg-[var(--bg-primary)]">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img src="/assets/logos/PlasIcon.png" alt="Plas Logo" className="h-16 w-16 animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </RootLayout>
    );
  }

  if (status !== "authenticated") {
    return (
      <RootLayout>
        <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center bg-[var(--bg-primary)]">
          <div className="text-center">
            <h3 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">Authentication Required</h3>
            <Link href="/login" passHref><Button appearance="primary">Sign In</Button></Link>
          </div>
        </div>
      </RootLayout>
    );
  }

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  if (!isMobile) {
    return (
      <AuthGuard requireAuth={true}>
        <RootLayout>
          <div className="h-[calc(100vh-4rem)] w-full overflow-hidden bg-[var(--bg-primary)]">
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
          {selectedConversation && (
            <CustomerChatDrawer
              conversationId={selectedConversation.id!}
              collectionPath={selectedConversation.collectionPath}
              orderId={selectedConversation.orderId}
              counterpart={{
                id: selectedConversation.shopperId || selectedConversation.businessId || selectedConversation.counterpartId || selectedConversation.customerId || "",
                name: selectedConversation.title || selectedConversation.counterpartName || "User",
                avatar: orders[selectedConversation.orderId!]?.shopper?.avatar || "/images/ProfileImage.png",
                role: selectedConversation.collectionPath === "business_conversations" ? "business" : "shopper",
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
