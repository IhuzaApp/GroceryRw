import RootLayout from "@components/ui/layout";
import UserRecentOrders from "@components/userProfile/userRecentOrders";
import UserRecentPackages from "@components/userProfile/UserRecentPackages";
import { Package } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { authenticatedFetch } from "@lib/authenticatedFetch";
import { AuthGuard } from "../../src/components/AuthGuard";

const ORDERS_CACHE_KEY = "plasa_current_pending_orders";
const CACHE_MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes
// Bump when cache shape changes (e.g. we started including shop image/logo); old cache is ignored
const CACHE_VERSION = 2;

function getOrdersFromCache(): {
  orders: any[];
  hasMore: boolean;
  page: number;
} | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(ORDERS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      orders: any[];
      hasMore: boolean;
      page: number;
      timestamp: number;
      cacheVersion?: number;
    };
    if (!Array.isArray(parsed.orders)) return null;
    if (Date.now() - (parsed.timestamp || 0) > CACHE_MAX_AGE_MS) return null;
    if ((parsed.cacheVersion ?? 1) !== CACHE_VERSION) return null;
    return {
      orders: parsed.orders,
      hasMore: parsed.hasMore ?? false,
      page: parsed.page ?? 1,
    };
  } catch {
    return null;
  }
}

// Trim only very large fields so cache fits; keep shop image/logo so list shows them on restore
function trimOrderForCache(o: any): any {
  return {
    ...o,
    shop: o.shop
      ? {
          id: o.shop.id,
          name: o.shop.name,
          image: o.shop.image ?? "",
          logo: (o.shop as any)?.logo ?? "",
        }
      : null,
    reel: o.reel
      ? { id: o.reel.id, title: o.reel.title, video_url: undefined }
      : o.reel,
    allProducts: undefined, // strip large payload on business orders
  };
}

function setOrdersCache(orders: any[], hasMore: boolean, page: number) {
  if (typeof window === "undefined") return;
  try {
    const trimmed = orders.map(trimOrderForCache);
    sessionStorage.setItem(
      ORDERS_CACHE_KEY,
      JSON.stringify({
        orders: trimmed,
        hasMore,
        page,
        timestamp: Date.now(),
        cacheVersion: CACHE_VERSION,
      })
    );
  } catch (e) {
    // QuotaExceededError: try storing even slimmer (names only)
    try {
      const slim = orders.map((o: any) => ({
        id: o.id,
        OrderID: o.OrderID,
        status: o.status,
        created_at: o.created_at,
        delivery_time: o.delivery_time,
        pin: o.pin,
        total: o.total,
        orderType: o.orderType,
        itemsCount: o.itemsCount,
        unitsCount: o.unitsCount,
        combined_order_id: o.combined_order_id,
        shop: o.shop
          ? {
              id: o.shop.id,
              name: o.shop.name,
              image: o.shop.image ?? "",
              logo: (o.shop as any)?.logo ?? "",
            }
          : null,
        reel: o.reel ? { id: o.reel.id, title: o.reel.title } : o.reel,
      }));
      sessionStorage.setItem(
        ORDERS_CACHE_KEY,
        JSON.stringify({
          orders: slim,
          hasMore,
          page,
          timestamp: Date.now(),
          cacheVersion: CACHE_VERSION,
        })
      );
    } catch {
      // ignore
    }
  }
}

function CurrentOrdersPage() {
  const [filter, setFilter] = useState("pending");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [packages, setPackages] = useState<any[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const initialMountDone = useRef(false);
  const { data: session } = useSession();

  const fetchOrders = useCallback(async (pageNum = 1, append = false) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    try {
      const res = await authenticatedFetch(
        `/api/queries/user-orders?page=${pageNum}&limit=20`
      );
      const data = await res.json();
      const newOrders = data.orders || [];

      if (append) {
        setOrders((prev) => {
          const next = [...prev, ...newOrders];
          setOrdersCache(
            next,
            data.pagination?.hasMore ?? newOrders.length === 20,
            pageNum
          );
          return next;
        });
        setHasMore(data.pagination?.hasMore ?? newOrders.length === 20);
        setPage(pageNum);
      } else {
        setOrders(newOrders);
        setHasMore(data.pagination?.hasMore ?? newOrders.length === 20);
        setPage(pageNum);
        setOrdersCache(
          newOrders,
          data.pagination?.hasMore ?? newOrders.length === 20,
          pageNum
        );
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const fetchPackages = useCallback(async () => {
    setLoadingPackages(true);
    try {
      const res = await authenticatedFetch("/api/queries/user-packages");
      const data = await res.json();
      setPackages(data.packages || []);
    } catch (error) {
      console.error("Error fetching packages:", error);
    } finally {
      setLoadingPackages(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchOrders(page + 1, true);
    }
  }, [fetchOrders, page, loadingMore, hasMore]);

  // Only fetch on first mount if no valid cache; when switching back, restore from cache (no refetch)
  useEffect(() => {
    if (initialMountDone.current) return;
    initialMountDone.current = true;

    const cached = getOrdersFromCache();
    if (cached && cached.orders.length >= 0) {
      setOrders(cached.orders);
      setHasMore(cached.hasMore);
      setPage(cached.page);
      setLoading(false);
    } else {
      fetchOrders(1, false);
    }
  }, [fetchOrders]);

  // Fetch packages whenever session is ready (distinct from orders cache)
  useEffect(() => {
    if (session?.user) {
      fetchPackages();
    }
  }, [session, fetchPackages]);

  if (!session) {
    return (
      <RootLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 md:ml-16">
          <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-800">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <svg
                    className="h-8 w-8 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                  Sign In Required
                </h1>
                <p className="mb-6 text-gray-600 dark:text-gray-300">
                  Please sign in to view your orders.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-green-500/30 transition-all duration-300 hover:from-green-600 hover:to-green-700 hover:shadow-xl"
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
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </RootLayout>
    );
  }

  // Count all orders that are not delivered for "Ongoing" (includes unassigned orders)
  const pendingCount = orders.filter((o) => {
    return o.status !== "delivered";
  }).length;
  const completedCount = orders.filter((o) => o.status === "delivered").length;
  const packagesCount = packages.length;

  return (
    <AuthGuard requireAuth={true}>
      <RootLayout>
        <div className="bg-gray-50 dark:bg-gray-900 md:ml-16">
          {/* Mobile Header */}
          <div
            className="relative mb-2 h-32 overflow-hidden rounded-b-3xl sm:hidden"
            style={{
              marginTop: "-44px",
              marginLeft: "-16px",
              marginRight: "-16px",
            }}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: "url(/assets/images/mobileheaderbg.jpg)",
              }}
            >
              {/* Overlay for better text readability */}
              <div className="absolute inset-0 bg-black/20"></div>
            </div>

            {/* Header Content */}
            <div className="relative z-10 flex h-full items-center justify-between px-6">
              <Link
                href="/"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-colors hover:bg-white/30"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </Link>
              <div className="text-center">
                <h1 className="text-lg font-semibold !text-white">My Orders</h1>
                <p className="text-xs !text-white/90">
                  {orders.length} order{orders.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="w-10"></div> {/* Spacer for centering */}
            </div>
          </div>

          <div className="w-full pb-3 md:py-8">
            {/* Desktop Header Section */}
            <div className="mb-4 hidden px-3 md:mb-8 md:block md:px-8">
              <div className="mb-4 flex items-center justify-between md:mb-6">
                <div className="flex items-center gap-3 md:gap-4">
                  <Link
                    href="/"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition-all duration-200 hover:border-green-300 hover:bg-green-50 hover:text-green-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-green-600 dark:hover:bg-green-900/20 md:h-10 md:w-10"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-4 w-4 md:h-5 md:w-5"
                    >
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                  </Link>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white md:text-3xl">
                      My Orders
                    </h1>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 md:mt-1 md:text-sm">
                      Track and manage your orders
                    </p>
                  </div>
                </div>
                {session?.user?.name && (
                  <div className="hidden items-center gap-3 md:flex">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {session.user.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Welcome back
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Filter Tabs - Premium Segmented Control */}
            <div className="sticky top-[env(safe-area-inset-top,0px)] z-20 mb-2 -mx-3 px-3 py-2 animate-in fade-in slide-in-from-top-4 duration-500 md:relative md:top-0 md:m-0 md:mb-12 md:p-0 md:bg-transparent md:flex md:justify-center">
              {/* Glassmorphic Container */}
              <div className="flex w-full overflow-x-auto no-scrollbar rounded-2xl border border-gray-200/50 bg-white/80 p-1.5 shadow-xl backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/80 md:inline-flex md:w-auto md:shadow-sm">
                <button
                  onClick={() => setFilter("pending")}
                  className={`relative flex min-w-[110px] flex-1 items-center justify-center gap-2.5 whitespace-nowrap rounded-xl px-5 py-3 text-sm font-medium transition-all duration-300 md:min-w-0 md:flex-initial ${
                    filter === "pending"
                      ? "bg-gradient-to-br from-green-500 to-green-600 !text-white shadow-lg shadow-green-500/30 scale-[1.02]"
                      : "text-gray-500 hover:bg-gray-100/50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-gray-200"
                  }`}
                >
                  <svg
                    className={`h-4.5 w-4.5 transition-transform duration-300 ${
                      filter === "pending" ? "scale-110 !text-white" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className={filter === "pending" ? "!text-white" : ""}>Ongoing</span>
                  {pendingCount > 0 && (
                    <span
                      className={`flex h-5 items-center justify-center rounded-full px-2 text-[10px] font-black tracking-tighter transition-colors ${
                        filter === "pending"
                          ? "bg-white/20 !text-white"
                          : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                      }`}
                    >
                      {pendingCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setFilter("done")}
                  className={`relative flex min-w-[110px] flex-1 items-center justify-center gap-2.5 whitespace-nowrap rounded-xl px-5 py-3 text-sm font-medium transition-all duration-300 md:min-w-0 md:flex-initial ${
                    filter === "done"
                      ? "bg-gradient-to-br from-green-500 to-green-600 !text-white shadow-lg shadow-green-500/30 scale-[1.02]"
                      : "text-gray-500 hover:bg-gray-100/50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-gray-200"
                  }`}
                >
                  <svg
                    className={`h-4.5 w-4.5 transition-transform duration-300 ${
                      filter === "done" ? "scale-110 !text-white" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className={filter === "done" ? "!text-white" : ""}>Completed</span>
                  {completedCount > 0 && (
                    <span
                      className={`flex h-5 items-center justify-center rounded-full px-2 text-[10px] font-black tracking-tighter transition-colors ${
                        filter === "done"
                          ? "bg-white/20 !text-white"
                          : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                      }`}
                    >
                      {completedCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setFilter("packages")}
                  className={`relative flex min-w-[110px] flex-1 items-center justify-center gap-2.5 whitespace-nowrap rounded-xl px-5 py-3 text-sm font-medium transition-all duration-300 md:min-w-0 md:flex-initial ${
                    filter === "packages"
                      ? "bg-gradient-to-br from-green-500 to-green-600 !text-white shadow-lg shadow-green-500/30 scale-[1.02]"
                      : "text-gray-500 hover:bg-gray-100/50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-gray-200"
                  }`}
                >
                  <Package
                    className={`h-4.5 w-4.5 transition-transform duration-300 ${
                      filter === "packages" ? "scale-110 !text-white" : ""
                    }`}
                  />
                  <span className={filter === "packages" ? "!text-white" : ""}>Deliveries</span>
                  {packagesCount > 0 && (
                    <span
                      className={`flex h-5 items-center justify-center rounded-full px-2 text-[10px] font-black tracking-tighter transition-colors ${
                        filter === "packages"
                          ? "bg-white/20 !text-white"
                          : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                      }`}
                    >
                      {packagesCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Orders List */}
            <div className="mx-0 min-h-screen rounded-t-2xl bg-white pb-10 shadow-sm dark:bg-gray-800 md:mx-8 md:min-h-0 md:rounded-2xl md:pb-6">
              <div className="px-3 py-4 md:p-6">
                {filter === "packages" ? (
                  <UserRecentPackages 
                    packages={packages} 
                    loading={loadingPackages} 
                    onRefresh={fetchPackages}
                  />
                ) : (
                  <UserRecentOrders
                    filter={filter}
                    orders={orders}
                    loading={loading}
                    onRefresh={() => fetchOrders(1, false)}
                  />
                )}

                {/* Load More Button removed in favor of component-level pagination */}
              </div>
            </div>
          </div>
        </div>
      </RootLayout>
    </AuthGuard>
  );
}

export default CurrentOrdersPage;
