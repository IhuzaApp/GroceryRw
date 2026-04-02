"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { LogIn } from "lucide-react";
import { authenticatedFetch } from "../../lib/authenticatedFetch";
import { useAuth } from "../../hooks/useAuth";

export default function SideBar() {
  const router = useRouter();
  const { data: session } = useSession();
  const { isGuest } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [marketplaceNotificationCount, setMarketplaceNotificationCount] =
    useState(0);

  // Listen for unread messages (customer: where I'm customer; shopper: where I'm shopper)
  useEffect(() => {
    if (!session?.user?.id || !db) return;

    const role = (session.user as any)?.role;
    const isShopper = role === "shopper";
    const conversationsRef = collection(db, "chat_conversations");
    const field = isShopper ? "shopperId" : "customerId";
    const q = query(conversationsRef, where(field, "==", session.user.id));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const totalUnread = snapshot.docs.reduce(
        (total, doc) => total + (doc.data().unreadCount || 0),
        0
      );
      setUnreadCount(totalUnread);
    });

    return () => unsubscribe();
  }, [session?.user?.id, (session?.user as any)?.role]);

  // Fetch pending orders count
  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchPendingOrders = async () => {
      try {
        // user-orders returns Orders + reel_orders + restaurant_orders (same as CurrentPendingOrders)
        // Use limit=50 for sidebar badge - most users won't have more than 50 pending orders
        const response = await authenticatedFetch(
          "/api/queries/user-orders?limit=50&minimal=1"
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (!data || !data.orders) {
          console.warn("No orders data received from API");
          return;
        }

        const pending = data.orders.filter(
          (order: any) => order.status !== "delivered"
        );
        setPendingOrders(pending);
        setPendingOrdersCount(pending.length);
      } catch (error) {
        console.error("Error fetching pending orders:", error);
        setPendingOrders([]);
        setPendingOrdersCount(0);
      }
    };

    fetchPendingOrders();

    // Set up an interval to refresh the count every minute
    const interval = setInterval(fetchPendingOrders, 60000);

    return () => clearInterval(interval);
  }, [session?.user?.id]);

  // Fetch marketplace notifications (RFQ responses + incomplete orders)
  // Uses fcmClient (via useFCMNotifications) to receive fcm-marketplace-update; API uses fcmService to send
  useEffect(() => {
    if (!session?.user?.id) {
      setMarketplaceNotificationCount(0);
      return;
    }

    const fetchMarketplaceNotifications = async () => {
      try {
        const response = await fetch("/api/queries/marketplace-notifications");
        const data = await response.json();
        // Use only marketplace-specific counts (RFQ responses, new RFQs, business orders).
        // Exclude incompleteOrdersCount so we don't duplicate the Orders icon badge.
        const marketplaceOnly =
          (data.rfqResponsesCount || 0) +
          (data.newRFQsCount || 0) +
          (data.newBusinessOrdersCount || 0);
        setMarketplaceNotificationCount(marketplaceOnly);
      } catch (error) {
        console.error("Error fetching marketplace notifications:", error);
      }
    };

    fetchMarketplaceNotifications();
    // Refresh every 30 seconds
    const interval = setInterval(fetchMarketplaceNotifications, 30000);

    const onMarketplaceUpdate = () => fetchMarketplaceNotifications();
    window.addEventListener("fcm-marketplace-update", onMarketplaceUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener("fcm-marketplace-update", onMarketplaceUpdate);
    };
  }, [session?.user?.id]);

  return (
    <>
      {/* Sidebar */}
      <div className="fixed left-0 top-1/4 z-50 ml-3 hidden rounded-full bg-white shadow-md transition-colors duration-200 dark:bg-gray-800 md:block">
        <div className="flex flex-col items-center gap-6 p-4">
          {/* Home */}
          <Link
            className="rounded-full p-2 text-inherit transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-green-700 dark:hover:text-white"
            href={"/"}
            passHref
          >
            <svg
              width="30px"
              height="30px"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-inherit"
            >
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                <path
                  d="M22 12.2039V13.725C22 17.6258 22 19.5763 20.8284 20.7881C19.6569 22 17.7712 22 14 22H10C6.22876 22 4.34315 22 3.17157 20.7881C2 19.5763 2 17.6258 2 13.725V12.2039C2 9.91549 2 8.77128 2.5192 7.82274C3.0384 6.87421 3.98695 6.28551 5.88403 5.10813L7.88403 3.86687C9.88939 2.62229 10.8921 2 12 2C13.1079 2 14.1106 2.62229 16.116 3.86687L18.116 5.10812C20.0131 6.28551 20.9616 6.87421 21.4808 7.82274"
                  className="stroke-current"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                ></path>
                <path
                  d="M15 18H9"
                  className="stroke-current"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                ></path>
              </g>
            </svg>
          </Link>

          {/* Profile - Only show if user is signed in */}
          {session?.user && (
            <Link
              className="rounded-full p-2 text-inherit transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-green-700 dark:hover:text-white"
              href={"/Myprofile"}
              passHref
            >
              <svg
                width="30px"
                height="30px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-inherit"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  <circle
                    cx="12"
                    cy="6"
                    r="4"
                    className="stroke-current"
                    strokeWidth="1.5"
                  ></circle>
                  <path
                    d="M19.9975 18C20 17.8358 20 17.669 20 17.5C20 15.0147 16.4183 13 12 13C7.58172 13 4 15.0147 4 17.5C4 19.9853 4 22 12 22C14.231 22 15.8398 21.8433 17 21.5634"
                    className="stroke-current"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  ></path>
                </g>
              </svg>
            </Link>
          )}

          {/* Orders - Show for all signed in users including guests */}
          {session?.user && (
            <Link
              className="relative isolate rounded-full p-2 text-inherit transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-green-700 dark:hover:text-white"
              href={"/CurrentPendingOrders"}
              passHref
            >
              <span className="relative inline-block">
                <svg
                  width="30px"
                  height="30px"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    <path
                      d="M7.5 18C8.32843 18 9 18.6716 9 19.5C9 20.3284 8.32843 21 7.5 21C6.67157 21 6 20.3284 6 19.5C6 18.6716 6.67157 18 7.5 18Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    ></path>
                    <path
                      d="M16.5 18.0001C17.3284 18.0001 18 18.6716 18 19.5001C18 20.3285 17.3284 21.0001 16.5 21.0001C15.6716 21.0001 15 20.3285 15 19.5001C15 18.6716 15.6716 18.0001 16.5 18.0001Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    ></path>
                    <path
                      d="M11 10.8L12.1429 12L15 9"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                    <path
                      d="M2 3L2.26121 3.09184C3.5628 3.54945 4.2136 3.77826 4.58584 4.32298C4.95808 4.86771 4.95808 5.59126 4.95808 7.03836V9.76C4.95808 12.7016 5.02132 13.6723 5.88772 14.5862C6.75412 15.5 8.14857 15.5 10.9375 15.5H12M16.2404 15.5C17.8014 15.5 18.5819 15.5 19.1336 15.0504C19.6853 14.6008 19.8429 13.8364 20.158 12.3075L20.6578 9.88275C21.0049 8.14369 21.1784 7.27417 20.7345 6.69708C20.2906 6.12 18.7738 6.12 17.0888 6.12H11.0235M4.95808 6.12H7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    ></path>
                  </g>
                </svg>
                {pendingOrdersCount > 0 && (
                  <span
                    className="absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white dark:bg-red-600"
                    aria-label={`${pendingOrdersCount} pending orders`}
                  >
                    {pendingOrdersCount > 9 ? "9+" : pendingOrdersCount}
                  </span>
                )}
              </span>
            </Link>
          )}

          {/* Recipes */}
          <Link
            className="rounded-full p-2 text-inherit transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-green-700 dark:hover:text-white"
            href={"/Recipes"}
            passHref
          >
            <svg
              fill="currentColor"
              height="30px"
              width="30px"
              version="1.1"
              id="Layer_1"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              viewBox="0 0 511.999 511.999"
              xmlSpace="preserve"
            >
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                <g>
                  <g>
                    <path d="M324.799,68.799c-103.222,0-187.2,83.978-187.2,187.2s83.978,187.2,187.2,187.2s187.2-83.978,187.2-187.2 S428.022,68.799,324.799,68.799z M324.799,407.169c-83.354,0-151.168-67.814-151.168-151.168s67.814-151.17,151.168-151.17 s151.168,67.814,151.168,151.168S408.154,407.169,324.799,407.169z"></path>
                  </g>
                </g>
                <g>
                  <g>
                    <path d="M324.799,148.019c-59.541,0-107.981,48.44-107.981,107.981s48.44,107.981,107.981,107.981S432.78,315.54,432.78,255.999 S384.34,148.019,324.799,148.019z M324.799,327.95c-39.673,0-71.949-32.276-71.949-71.949s32.276-71.949,71.949-71.949 c39.673,0,71.949,32.276,71.949,71.949S364.472,327.95,324.799,327.95z"></path>
                  </g>
                </g>
                <g>
                  <g>
                    <path d="M110.491,68.799c-9.95,0-18.016,8.066-18.016,18.016v96.161H81.959V86.815c0-9.95-8.066-18.016-18.016-18.016 c-9.95,0-18.016,8.066-18.016,18.016v96.161h-9.896V86.815c0-9.95-8.066-18.016-18.016-18.016S0,76.866,0,86.815v99.764 c0,17.881,14.547,32.428,32.428,32.428h12.298v206.175c0,9.95,8.066,18.016,18.016,18.016s18.016-8.066,18.016-18.016V219.009 h15.321c17.881,0,32.428-14.547,32.428-32.428V86.815C128.507,76.866,120.441,68.799,110.491,68.799z"></path>
                  </g>
                </g>
              </g>
            </svg>
          </Link>

          {/* Reels */}
          <Link
            className="rounded-full p-2 text-inherit transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-green-700 dark:hover:text-white"
            href={"/Reels"}
            passHref
          >
            <svg
              width="30px"
              height="30px"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                <path
                  d="M19.5617 7C19.7904 5.69523 18.7863 4.5 17.4617 4.5H6.53788C5.21323 4.5 4.20922 5.69523 4.43784 7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                ></path>
                <path
                  d="M17.4999 4.5C17.5283 4.24092 17.5425 4.11135 17.5427 4.00435C17.545 2.98072 16.7739 2.12064 15.7561 2.01142C15.6497 2 15.5194 2 15.2588 2H8.74099C8.48035 2 8.35002 2 8.24362 2.01142C7.22584 2.12064 6.45481 2.98072 6.45704 4.00434C6.45727 4.11135 6.47146 4.2409 6.49983 4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                ></path>
                <path
                  d="M21.1935 16.793C20.8437 19.2739 20.6689 20.5143 19.7717 21.2572C18.8745 22 17.5512 22 14.9046 22H9.09536C6.44881 22 5.12553 22 4.22834 21.2572C3.33115 20.5143 3.15626 19.2739 2.80648 16.793L2.38351 13.793C1.93748 10.6294 1.71447 9.04765 2.66232 8.02383C3.61017 7 5.29758 7 8.67239 7H15.3276C18.7024 7 20.3898 7 21.3377 8.02383C22.0865 8.83268 22.1045 9.98979 21.8592 12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                ></path>
                <path
                  d="M14.5812 13.6159C15.1396 13.9621 15.1396 14.8582 14.5812 15.2044L11.2096 17.2945C10.6669 17.6309 10 17.1931 10 16.5003L10 12.32C10 11.6273 10.6669 11.1894 11.2096 11.5258L14.5812 13.6159Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                ></path>
              </g>
            </svg>
          </Link>

          {/* Business - Only show for full users (not guests) */}
          {session?.user && !isGuest && (
            <Link
              className="relative isolate rounded-full p-2 text-inherit transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-green-700 dark:hover:text-white"
              href={"/plasBusiness"}
              passHref
              title="Business Marketplace"
            >
              <span className="relative inline-block">
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 290.625 290.625"
                  width="30px"
                  height="30px"
                  className="transition-all duration-300 hover:scale-110"
                >
                  <g>
                    <polygon
                      style={{ fill: "#2aea63" }}
                      points="39.511,192.188 147.323,192.188 137.948,239.063 53.573,239.063"
                    />
                    <rect
                      x="58.261"
                      y="187.5"
                      style={{ fill: "currentColor" }}
                      width="70.313"
                      height="9.375"
                    />
                    <rect
                      x="62.948"
                      y="210.938"
                      style={{ fill: "currentColor" }}
                      width="60.938"
                      height="9.375"
                    />
                    <path
                      style={{ fill: "currentColor" }}
                      d="M278.573,267.923l-84.722-55.069l-7.252-50.742l14.813-3.173l28.181-32.878l46.514-11.63 l-6.675,20.02l8.892,2.967l10.289-30.872l-20.798-20.798l-6.628,6.628l12.895,12.895l-49.669,12.417l-28.069,32.747l-11.086,2.377 l-5.592-39.155l-48.22-16.073l-47.475,66.478H64.669l29.658-93.211l92.841,13.927l44.072-70.519l5.639,11.273l8.386-4.195 L234.595,0h-26.334v9.375h14.981L182.48,74.597L87.82,60.398L54.834,164.063h-5.948v9.375h97.406l-12.188,60.938H52.645 L33.895,150H2.011v9.375h24.366l16.927,76.167c-4.983,2.17-8.48,7.125-8.48,12.895c0,5.62,3.338,10.444,8.114,12.694 c-2.142,3.052-3.427,6.741-3.427,10.744c0,10.341,8.409,18.75,18.75,18.75s18.75-8.409,18.75-18.75 c0-3.431-0.994-6.605-2.606-9.375h47.405c-1.617,2.77-2.611,5.944-2.611,9.375c0,10.341,8.409,18.75,18.75,18.75 s18.75-8.409,18.75-18.75s-8.409-18.75-18.75-18.75H48.886c-2.583,0-4.688-2.105-4.688-4.688s2.105-4.688,4.688-4.688h92.906 l15.052-75.258l20.569-4.406l7.758,54.309l87.956,57.173l-15.047,6.019l3.483,8.705l26.386-10.556v-31.298h-9.375L278.573,267.923 L278.573,267.923z M67.636,271.875c0,5.17-4.205,9.375-9.375,9.375s-9.375-4.205-9.375-9.375s4.205-9.375,9.375-9.375 S67.636,266.705,67.636,271.875z M147.323,271.875c0,5.17-4.205,9.375-9.375,9.375s-9.375-4.205-9.375-9.375 s4.205-9.375,9.375-9.375S147.323,266.705,147.323,271.875z M132.759,164.063H95.494l39.567-55.397l36.155,12.052l4.866,34.059 L132.759,164.063z"
                    />
                  </g>
                </svg>
                {marketplaceNotificationCount > 0 && (
                  <span
                    className="absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-lg"
                    aria-label={`${marketplaceNotificationCount} marketplace notifications`}
                  >
                    {marketplaceNotificationCount > 9
                      ? "9+"
                      : marketplaceNotificationCount}
                  </span>
                )}
              </span>
            </Link>
          )}

          {/* Chat - Only show if user is signed in and not a guest */}
          {session?.user && !isGuest && (
            <Link
              className="relative rounded-full p-2 text-inherit transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-green-700 dark:hover:text-white"
              href={"/Messages"}
              passHref
            >
              <svg
                width="30px"
                height="30px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-inherit"
              >
                <path
                  d="M8 10.5H16"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M8 14H13.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M17 3.33782C15.5291 2.48697 13.8214 2 12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.04346 16.4525C3.22094 16.8088 3.28001 17.2161 3.17712 17.6006L2.58151 19.8267C2.32295 20.793 3.20701 21.677 4.17335 21.4185L6.39939 20.8229C6.78393 20.72 7.19121 20.7791 7.54753 20.9565C8.88837 21.6244 10.4003 22 12 22C17.5228 22 22 17.5228 22 12C22 10.1786 21.513 8.47087 20.6622 7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white dark:bg-green-600">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          )}

          {/* Login - Only show if user is NOT signed in */}
          {!session?.user && (
            <Link
              className="rounded-full p-2 text-inherit transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-green-700 dark:hover:text-white"
              href={"/Auth/Login"}
              passHref
              title="Login"
            >
              <LogIn className="h-7 w-7" />
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
