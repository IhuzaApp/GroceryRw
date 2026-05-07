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
import { useShopperProfile } from "../../src/hooks/useShopperProfile";
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

function getOrderType(conversation: Conversation): string {
  if (conversation.type === "petBusiness" || conversation.type === "pet" || conversation.title?.startsWith("Adoption: ")) {
    return "pet";
  }
  if (conversation.type === "carBusiness") {
    return "vehicle";
  }
  if (conversation.collectionPath === "business_conversations") {
    return "business";
  }
  return "";
}

function MessagesPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { shopper } = useShopperProfile();

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
  const [businessAccountId, setBusinessAccountId] = useState<string | null>(null);
  const [petVendorId, setPetVendorId] = useState<string | null>(null);
  const [logisticsAccountId, setLogisticsAccountId] = useState<string | null>(
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
  const [userAdoptions, setUserAdoptions] = useState<any[]>([]);

  // Fetch adoptions to backfill missing pet info on legacy chats
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      let cancelled = false;
      fetch("/api/queries/get-user-adoptions")
        .then((res) => res.json())
        .then((data) => {
          if (!cancelled) setUserAdoptions(data.adoptions || []);
        })
        .catch((err) => console.error("Error fetching adoptions:", err));
      return () => {
        cancelled = true;
      };
    }
  }, [status, session?.user?.id]);

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

  // Auto-select conversation matching the orderId if one exists
  useEffect(() => {
    if (
      selectedOrderId &&
      !selectedConversationId &&
      conversations.length > 0
    ) {
      const conv = conversations.find((c) => c.orderId === selectedOrderId);
      if (conv) {
        setSelectedConversationId(conv.id);
        if (!isMobile) setIsDrawerOpen(true);
      }
    }
  }, [selectedOrderId, selectedConversationId, conversations, isMobile]);

  // Fetch user's business account ID
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      const fetchAllAccounts = async () => {
        try {
          // 1. Business Account
          const busRes = await fetch("/api/queries/check-business-account");
          if (busRes.ok) {
            const data = await busRes.json();
            if (data.hasAccount && data.account?.id) {
              setBusinessAccountId(data.account.id);
            }
          }

          // 2. Pet Vendor
          const petRes = await fetch("/api/queries/check-pet-vendor");
          if (petRes.ok) {
            const data = await petRes.json();
            if (data.hasAccount && data.account?.id) {
              setPetVendorId(data.account.id);
            }
          }

          // 3. Logistics Account
          const logRes = await fetch("/api/queries/check-logistics-account");
          if (logRes.ok) {
            const data = await logRes.json();
            if (data.hasAccount && data.account?.id) {
              setLogisticsAccountId(data.account.id);
            }
          }
        } catch (err) {
          console.error("Error fetching business accounts:", err);
        } finally {
          setLoadingBusinessAccount(false);
        }
      };
      fetchAllAccounts();
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
        or(
          where("customerId", "==", userId),
          where("shopperId", "==", userId),
          ...(shopper?.id ? [where("shopperId", "==", shopper.id)] : [])
        ),
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
  }, [status, session?.user?.id, shopper?.id]);

  // Real-time listener for Business Conversations
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      const userId = session.user.id;
      if (!db) return;
      const constraints = [
        where("counterpartId", "==", userId),
        where("customerId", "==", userId),
      ];

      if (businessAccountId) {
        constraints.push(where("businessId", "==", businessAccountId));
        constraints.push(where("counterpartId", "==", businessAccountId));
        constraints.push(where("customerId", "==", businessAccountId));
      }
      if (petVendorId) {
        constraints.push(where("counterpartId", "==", petVendorId));
        constraints.push(where("customerId", "==", petVendorId));
      }
      if (logisticsAccountId) {
        constraints.push(where("counterpartId", "==", logisticsAccountId));
        constraints.push(where("customerId", "==", logisticsAccountId));
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
  }, [status, session?.user?.id, businessAccountId, petVendorId, logisticsAccountId]);

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
    const idsToFetch = new Set<string>();

    // Always include current user if they don't have an image in session
    if (session?.user?.id && !session.user.image) {
      idsToFetch.add(session.user.id);
    }

    conversations.forEach((c) => {
      if (c.collectionPath === "business_conversations") {
        if (c.counterpartId && c.counterpartId !== session?.user?.id && !c.counterpartId) {
          idsToFetch.add(c.counterpartId);
        }
        if (c.customerId && c.customerId !== session?.user?.id && !(c as any).customerName) {
          idsToFetch.add(c.customerId);
        }
        if ((c as any).vendorUserId && (c as any).vendorUserId !== session?.user?.id && !c.counterpartAvatar) {
          idsToFetch.add((c as any).vendorUserId);
        }
      }
      if (c.collectionPath === "chat_conversations") {
        if (c.shopperId && c.shopperId !== session?.user?.id && !c.counterpartId) {
          idsToFetch.add(c.shopperId);
        }
        if (c.customerId && c.customerId !== session?.user?.id && !(c as any).customerName) {
          idsToFetch.add(c.customerId);
        }
        if ((c as any).shopperUserId && (c as any).shopperUserId !== session?.user?.id && !c.counterpartAvatar) {
          idsToFetch.add((c as any).shopperUserId);
        }
      }
    });

    if (idsToFetch.size === 0) return;

    // Clean IDs to ensure they are valid UUIDs before sending to Hasura
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    const businessConversationsToFetch = Array.from(idsToFetch)
      .map(id => {
        const match = id.match(uuidRegex);
        return match ? match[0] : null;
      })
      .filter((id): id is string => !!id);

    if (businessConversationsToFetch.length === 0) return;

    let cancelled = false;
    const fetchCounterparts = async () => {
      const uniqueIds = Array.from(new Set(businessConversationsToFetch));
      try {
        const response = await fetch(`/api/queries/users?ids=${uniqueIds.join(",")}`);
        const data = await response.json();
        const results = (data.users || []).map((u: any) => ({
          id: u.id,
          name: u.name,
          avatar: u.profile_picture,
          phone: u.phone
        }));

        if (cancelled) return;

        setBusinessConversations((prev) =>
          prev.map((conv) => {
            const counterpart = results.find((r: { id: string; }) =>
              (conv.counterpartId && conv.counterpartId.includes(r.id)) ||
              ((conv as any).vendorUserId && (conv as any).vendorUserId.includes(r.id)) ||
              (conv.shopperId && conv.shopperId.includes(r.id)) ||
              ((conv as any).shopperUserId && (conv as any).shopperUserId.includes(r.id))
            );
            const customer = results.find((r: { id: string; }) => conv.customerId && conv.customerId.includes(r.id));
            const currentUserProfile = results.find((r: { id: string | undefined; }) => r.id === session?.user?.id);

            let updated = { ...conv };

            // Handle current user avatar fallback
            if (currentUserProfile && !session?.user?.image) {
              if (conv.customerId === session?.user?.id) {
                updated.customerAvatar = currentUserProfile.avatar;
                updated.customerName = currentUserProfile.name;
              }
              if (conv.counterpartId === session?.user?.id || (conv as any).vendorUserId === session?.user?.id) {
                updated.counterpartAvatar = currentUserProfile.avatar;
                updated.counterpartName = currentUserProfile.name;
              }
            }

            if (counterpart && !conv.counterpartName) {
              updated = {
                ...updated,
                counterpartName: counterpart.name,
                counterpartAvatar: counterpart.avatar,
                counterpartPhone: counterpart.phone,
              };
            }
            if (customer && !updated.customerName) {
              updated = {
                ...updated,
                customerName: customer.name,
                customerAvatar: customer.avatar,
                customerPhone: customer.phone,
              };
            }
            return updated;
          })
        );
      } catch (error) {
        console.error("Error fetching counterparts:", error);
      }
    };

    fetchCounterparts();
    return () => {
      cancelled = true;
    };
  }, [conversations]);

  // Fetch order details for order-type conversations
  useEffect(() => {
    const orderIds = conversations
      .filter((c) => c.orderId)
      .map((c) => c.orderId!)
      .filter((id) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) || // uuid
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
      );

    if (orderIds.length === 0) return;

    let cancelled = false;
    const fetchOrders = async () => {
      const toFetch = orderIds.filter(
        (id) =>
          !orders[id] ||
          ((orders[id] as any)?.error && !(orders[id] as any)?.permanent)
      );
      if (toFetch.length === 0) return;

      const promises = toFetch.map(async (orderId) => {
        try {
          // Find the conversation for this orderId to get a hint of the type
          const conv = conversations.find((c) => c.orderId === orderId);
          const typeHint = conv ? getOrderType(conv) : "";
          const urlType = router.query.type;
          const finalType = urlType || typeHint;

          const res = await fetch(
            `/api/queries/orderDetails?id=${orderId}${finalType ? `&type=${finalType}` : ""
            }`
          );
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
            const isPermanent = order?.status === 404 || order?.status === 400;
            next[orderId] = order
              ? { ...order, permanent: isPermanent }
              : { error: true, permanent: true };
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
    .map((conversation) => {
      const isPetChat = conversation.type === "petBusiness" || conversation.type === "pet" || conversation.title?.startsWith("Adoption: ");
      if (isPetChat && (!conversation.petImage || !conversation.petId)) {
        const petName = conversation.petName || conversation.title?.replace("Adoption: ", "").trim();
        const match = userAdoptions.find(
          (a) =>
            a.pets?.name?.toLowerCase() === petName?.toLowerCase() &&
            (a.pets?.pet_vendors?.user_id === conversation.counterpartId ||
              a.pets?.pet_vendors?.user_id === conversation.businessId)
        );
        if (match) {
          return {
            ...conversation,
            petId: match.pets.id,
            petImage: match.pets.image,
            petName: match.pets.name,
          };
        }
      }
      return conversation;
    })
    .filter((conversation) => {
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();

        // Match by message text
        if (conversation.lastMessage?.toLowerCase().includes(searchLower))
          return true;

        // Match by title (for business chats)
        if (conversation.title?.toLowerCase().includes(searchLower))
          return true;
        if (conversation.counterpartId?.toLowerCase().includes(searchLower))
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

  const handleChatClick = (
    orderId?: string,
    conversationId?: string,
    type?: string
  ) => {
    const query: any = {
      ...router.query,
      chat: conversationId || "true",
      orderId: orderId || "",
    };

    if (type) {
      query.type = type;
    }

    if (isMobile && conversationId) {
      router.push(
        {
          pathname: "/Messages",
          query,
        },
        undefined,
        { shallow: true }
      );
    } else {
      setSelectedOrderId(orderId);
      setSelectedConversationId(conversationId);
      setIsDrawerOpen(true);
      // Also update URL for desktop if possible, or just keep it simple
      if (orderId || conversationId) {
        router.push(
          {
            pathname: "/Messages",
            query,
          },
          undefined,
          { shallow: true }
        );
      }
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
              orderId={selectedConversation.orderId || undefined}
              counterpart={(() => {
                const currentUserId = session?.user?.id;
                const isMeCustomer =
                  currentUserId === selectedConversation.customerId;
                const order = selectedConversation.orderId
                  ? orders[selectedConversation.orderId]
                  : null;

                if (
                  selectedConversation.collectionPath ===
                  "business_conversations"
                ) {
                  return {
                    id:
                      selectedConversation.counterpartId === currentUserId
                        ? selectedConversation.businessId || ""
                        : selectedConversation.counterpartId || "",
                    name:
                      selectedConversation.title ||
                      selectedConversation.counterpartId ||
                      "Business",
                    avatar:
                      selectedConversation.type === "petBusiness" || selectedConversation.type === "pet" || selectedConversation.title?.startsWith("Adoption: ")
                        ? selectedConversation.petImage || "/images/placeholder.png"
                        : selectedConversation.counterpartAvatar ||
                        "/images/ProfileImage.png",
                    role: "business",
                    phone: (selectedConversation as any).counterpartPhone || "",
                  };
                }

                const orderDisplayID = order?.OrderID
                  ? String(order.OrderID).length >= 4
                    ? String(order.OrderID)
                    : String(order.OrderID).padStart(4, "0")
                  : "";

                if (isMeCustomer) {
                  const baseName =
                    order?.assignedTo?.shopper?.full_name ||
                    order?.assignedTo?.name ||
                    selectedConversation.counterpartId ||
                    "Shopper";
                  const shopperId =
                    (selectedConversation.shopperId &&
                      selectedConversation.shopperId !== currentUserId
                      ? selectedConversation.shopperId
                      : null) ||
                    order?.assignedTo?.shopper?.id ||
                    order?.assignedTo?.id ||
                    "";
                  return {
                    id: shopperId,
                    name: orderDisplayID
                      ? `${baseName} (#${orderDisplayID})`
                      : baseName,
                    avatar:
                      order?.assignedTo?.shopper?.profile_photo ||
                      order?.assignedTo?.profile_picture ||
                      selectedConversation.counterpartAvatar ||
                      "/images/ProfileImage.png",
                    role: "shopper",
                    phone: order?.assignedTo?.phone || "",
                  };
                }

                // I am the shopper/business, counterpart is the customer
                const baseName =
                  order?.orderedBy?.name ||
                  selectedConversation.counterpartId ||
                  "Customer";
                return {
                  id: selectedConversation.customerId || "",
                  name: orderDisplayID
                    ? `${baseName} (#${orderDisplayID})`
                    : baseName,
                  avatar:
                    order?.orderedBy?.profile_picture ||
                    selectedConversation.counterpartAvatar ||
                    "/images/ProfileImage.png",
                  role: "customer",
                  phone:
                    order?.orderedBy?.phone ||
                    (selectedConversation as any).counterpartPhone ||
                    "",
                };
              })()}
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
            onCloseDrawer={() => { }}
          />
        </div>
      </RootLayout>
    </AuthGuard>
  );
}

export default MessagesPage;
