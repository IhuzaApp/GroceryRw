"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import PWAInstallGuide from "./PWAInstallGuide";
import { Download } from "lucide-react";
import { authenticatedFetch } from "../../lib/authenticatedFetch";

export default function SideBar() {
  const router = useRouter();
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  // Listen for unread messages
  useEffect(() => {
    if (!session?.user?.id) return;

    const conversationsRef = collection(db, "chat_conversations");
    const q = query(
      conversationsRef,
      where("customerId", "==", session.user.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const totalUnread = snapshot.docs.reduce(
        (total, doc) => total + (doc.data().unreadCount || 0),
        0
      );
      setUnreadCount(totalUnread);
    });

    return () => unsubscribe();
  }, [session?.user?.id]);

  // Fetch pending orders count
  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchPendingOrders = async () => {
      try {
        const response = await authenticatedFetch("/api/queries/orders");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Check if data and data.orders exist before filtering
        if (!data || !data.orders) {
          console.warn("No orders data received from API");
          return;
        }

        const pendingOrders = data.orders.filter(
          (order: any) => order.status === "pending"
        );
        setPendingOrders(pendingOrders);
      } catch (error) {
        console.error("Error fetching pending orders:", error);
        // Set empty array on error to prevent undefined errors
        setPendingOrders([]);
      }
    };

    fetchPendingOrders();

    // Set up an interval to refresh the count every minute
    const interval = setInterval(fetchPendingOrders, 60000);

    return () => clearInterval(interval);
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

          {/* Profile */}
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

          {/* Orders */}
          <Link
            className="relative rounded-full p-2 text-inherit transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-green-700 dark:hover:text-white"
            href={"/CurrentPendingOrders"}
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
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white dark:bg-red-600">
                {pendingOrdersCount > 9 ? "9+" : pendingOrdersCount}
              </span>
            )}
          </Link>

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

          {/* Chat */}
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
                {unreadCount}
              </span>
            )}
          </Link>

          {/* Install App */}
          <button
            onClick={() => setShowInstallGuide(true)}
            className="rounded-full p-2 text-inherit transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-green-700 dark:hover:text-white"
            title="Install App"
          >
            <Download className="h-7 w-7" />
          </button>
        </div>
      </div>

      {/* Install Guide Modal */}
      <PWAInstallGuide
        isOpen={showInstallGuide}
        onClose={() => setShowInstallGuide(false)}
      />
    </>
  );
}
