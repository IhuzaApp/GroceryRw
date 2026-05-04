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
      <div className="notranslate fixed left-0 top-1/4 z-50 ml-3 hidden rounded-full bg-white shadow-md transition-colors duration-200 dark:bg-gray-800 md:block">
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

          {/* Cars Marketplace */}
          {session?.user && (
            <Link
              className={`rounded-full p-2 transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-green-700 dark:hover:text-white ${
                router.pathname.startsWith("/Cars")
                  ? "text-green-500"
                  : "text-inherit"
              }`}
              href={"/Cars"}
              passHref
              title="Car Marketplace"
            >
              <svg
                width="30px"
                height="30px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 8L5.72187 10.2682C5.90158 10.418 6.12811 10.5 6.36205 10.5H17.6379C17.8719 10.5 18.0984 10.418 18.2781 10.2682L21 8M6.5 14H6.51M17.5 14H17.51M8.16065 4.5H15.8394C16.5571 4.5 17.2198 4.88457 17.5758 5.50772L20.473 10.5777C20.8183 11.1821 21 11.8661 21 12.5623V18.5C21 19.0523 20.5523 19.5 20 19.5H19C18.4477 19.5 18 19.0523 18 18.5V17.5H6V18.5C6 19.0523 5.55228 19.5 5 19.5H4C3.44772 19.5 3 19.0523 3 18.5V12.5623C3 11.8661 3.18166 11.1821 3.52703 10.5777L6.42416 5.50772C6.78024 4.88457 7.44293 4.5 8.16065 4.5ZM7 14C7 14.2761 6.77614 14.5 6.5 14.5C6.22386 14.5 6 14.2761 6 14C6 13.7239 6.22386 13.5 6.5 13.5C6.77614 13.5 7 13.7239 7 14ZM18 14C18 14.2761 17.7761 14.5 17.5 14.5C17.2239 14.5 17 14.2761 17 14C17 13.7239 17.2239 13.5 17.5 13.5C17.7761 13.5 18 13.7239 18 14Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          )}

          {/* Pets Marketplace */}
          {session?.user && (
            <Link
              className={`rounded-full p-2 transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-green-700 dark:hover:text-white ${
                router.pathname.startsWith("/Pets")
                  ? "text-green-500"
                  : "text-inherit"
              }`}
              href={"/Pets"}
              passHref
              title="Pets Marketplace"
            >
              <svg
                width="30px"
                height="30px"
                viewBox="0 0 1024 1024"
                version="1.1"
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
                    d="M792.5 558.4c-46.8-27-44-118.7-14-170.7 26.9-46.6 86.5-62.6 133.1-35.7s62.6 86.5 35.7 133.1c-30.1 52.1-108 100.4-154.8 73.3zM623.4 390c-60.7-16.3-86.1-124.4-67.4-194 16.5-61.5 79.7-98.1 141.3-81.6 61.5 16.5 98.1 79.7 81.6 141.3-18.7 69.6-94.8 150.6-155.5 134.3zM233.5 558.7c-46.9 27.1-125.1-21.3-155.2-73.4-27-46.7-11-106.4 35.8-133.4 46.7-27 106.5-11 133.4 35.7 30 52.2 32.9 144-14 171.1zM374.6 390c-60.7 16.3-136.8-64.7-155.4-134.3-16.5-61.5 20-124.8 81.6-141.3S425.6 134.4 442.1 196c18.6 69.6-6.8 177.7-67.5 194zM513 436.3c111.7 0 279.9 170.1 279.9 307.6 0 91.3-28.3 143.3-79.1 161.4-17.5 6.2-32 7.4-54.3 6.7-4.4-0.1-5.2-0.2-6.5-0.2-11.7 0-23.4-3.8-39.7-11.2-5.4-2.5-11.1-5.3-19.2-9.4 5.8 2.9-15.2-7.7-20.1-10.1-16.3-8.1-28.8-13.7-40.5-17.8-9-3.2-17.2-5.3-24.5-6.3h8c-7.3 1.1-15.4 3.2-24.5 6.4-11.8 4.2-24.2 9.7-40.5 17.9-4.9 2.4-25.8 13.1-20.1 10.2-8.1 4.1-13.8 6.9-19.2 9.4-16.2 7.5-28 11.3-39.7 11.3-1.3 0-2.1 0-6.5 0.2-22.3 0.7-36.8-0.5-54.3-6.7-50.8-18.1-79.1-70.1-79.1-161.4 0-137.5 168.2-308 279.9-308z"
                    fill="currentColor"
                  ></path>
                  <path
                    d="M823.5 509.9c11.9 6.9 61.8-24 78.4-52.8 11.5-19.8 4.7-45.2-15.2-56.7-19.8-11.5-45.2-4.7-56.7 15.2-16.6 28.9-18.4 87.5-6.5 94.3zM637.9 335.9c21.7 5.8 75.1-51 86.9-94.7 8.5-31.7-10.3-64.2-42-72.7s-64.2 10.3-72.7 42c-11.8 43.7 6 119.6 27.8 125.4zM202.9 510.2c12-6.9 10.2-65.7-6.5-94.6-11.5-19.9-37-26.7-56.9-15.2s-26.7 37-15.2 56.9c16.6 28.9 66.6 59.8 78.6 52.9zM360.1 335.9c21.7-5.8 39.6-81.8 27.9-125.5-8.5-31.7-41-50.5-72.7-42s-50.5 41-42 72.7c11.7 43.8 65.1 100.6 86.8 94.8zM513 492.3c-80.6 0-223.9 145.2-223.9 251.9 0 69.7 16.2 99.5 41.8 108.7 9.2 3.3 18.1 4 33.9 3.5 5.2-0.2 6.1-0.2 8.2-0.2 3.9 0 3.7 0.1 54-25 18.2-9.1 32.5-15.5 46.9-20.6 12.3-4.3 23.9-7.4 35.1-9l4-0.6 4 0.6c11.2 1.6 22.7 4.6 35 8.9 14.4 5 28.7 11.4 46.9 20.5 50.3 25 50.1 24.9 54 24.9 2.2 0 3 0 8.2 0.2 15.8 0.5 24.7-0.2 33.9-3.5 25.6-9.1 41.8-39 41.8-108.7 0.1-106.7-143.1-251.6-223.8-251.6z"
                    fill="currentColor"
                  ></path>
                </g>
              </svg>
            </Link>
          )}

          {/* Business - Only show for full users (not guests) */}
          {session?.user && !isGuest && (
            <Link
              className="relative isolate rounded-full p-2 text-inherit transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-green-700 dark:hover:text-white"
              href={"/plasBusiness/portal"}
              passHref
              title="Business Marketplace"
            >
              <span className="relative inline-block">
                <svg
                  width="30px"
                  height="30px"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="transition-all duration-300 hover:scale-110"
                >
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    <path
                      opacity="0.4"
                      d="M2.80408 15.4771C2.80408 15.4771 2.94608 17.2151 2.97908 17.7631C3.02308 18.4981 3.30708 19.3191 3.78108 19.8891C4.45008 20.6971 5.23808 20.9821 6.29008 20.9841C7.52708 20.9861 16.5221 20.9861 17.7591 20.9841C18.8111 20.9821 19.5991 20.6971 20.2681 19.8891C20.7421 19.3191 21.0261 18.4981 21.0711 17.7631C21.1031 17.2151 21.2451 15.4771 21.2451 15.4771"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                    <path
                      d="M8.49597 5.32949V4.95849C8.49597 3.73849 9.48397 2.75049 10.704 2.75049H13.286C14.505 2.75049 15.494 3.73849 15.494 4.95849L15.495 5.32949"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                    <path
                      d="M11.995 16.6783V15.3843"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M2.74988 8.38905V11.8561C4.66788 13.1211 6.96588 14.0071 9.48788 14.3581C9.78988 13.2571 10.7829 12.4501 11.9899 12.4501C13.1779 12.4501 14.1909 13.2571 14.4729 14.3681C17.0049 14.0171 19.3119 13.1311 21.2399 11.8561V8.38905C21.2399 6.69505 19.8769 5.33105 18.1829 5.33105H5.81688C4.12288 5.33105 2.74988 6.69505 2.74988 8.38905Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
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
