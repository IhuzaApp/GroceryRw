"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function SideBar() {
  const router = useRouter();
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [pendingOrders, setPendingOrders] = useState([]);

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
        const response = await fetch("/api/queries/orders");
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
              id="_24x24_On_Light_Recent"
              data-name="24x24/On Light/Recent"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              className="text-inherit"
            >
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                <rect id="view-box" width="24" height="24" fill="none"></rect>
                <path
                  id="Shape"
                  d="M9.682,18.75a.75.75,0,0,1,.75-.75,8.25,8.25,0,1,0-6.189-2.795V12.568a.75.75,0,0,1,1.5,0v4.243a.75.75,0,0,1-.751.75H.75a.75.75,0,0,1,0-1.5H3a9.75,9.75,0,1,1,7.433,3.44A.75.75,0,0,1,9.682,18.75Zm2.875-4.814L9.9,11.281a.754.754,0,0,1-.22-.531V5.55a.75.75,0,1,1,1.5,0v4.889l2.436,2.436a.75.75,0,1,1-1.061,1.06Z"
                  transform="translate(1.568 2.25)"
                  className="fill-current"
                ></path>
              </g>
            </svg>
            {pendingOrdersCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-purple-500 text-xs font-bold text-white dark:bg-purple-600">
                {pendingOrdersCount}
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
              width="30px"
              height="30px"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-inherit"
            >
              <path
                d="M19 7V5H5v2m14 0v2H5V7m14 0H5m0 4v6a2 2 0 002 2h10a2 2 0 002-2v-6m-4 3h.01M12 14h.01M8 14h.01"
                className="stroke-current"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
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
              className="text-inherit"
            >
              <path
                d="M3 5.80005C3 4.25368 4.25368 3.00005 5.80005 3.00005H18.2C19.7464 3.00005 21 4.25368 21 5.80005V18.2C21 19.7464 19.7464 21 18.2 21H5.80005C4.25368 21 3 19.7464 3 18.2V5.80005Z"
                className="stroke-current"
                strokeWidth="1.5"
              />
              <path
                d="M10 17L15 12L10 7V17Z"
                className="stroke-current"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3 8H21"
                className="stroke-current"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M3 16H21"
                className="stroke-current"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
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
        </div>
      </div>
    </>
  );
}
