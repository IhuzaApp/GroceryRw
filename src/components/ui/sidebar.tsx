"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import LoadingOverlay from "./LoadingOverlay";

export default function SideBar() {
  // Get toggleRole & current role from auth context
  const { role } = useAuth();
  const router = useRouter();
  const [isSwitching, setIsSwitching] = useState(false);

  // Clear loading overlay when navigation completes or errors
  useEffect(() => {
    const handleFinish = () => setIsSwitching(false);
    router.events.on("routeChangeComplete", handleFinish);
    router.events.on("routeChangeError", handleFinish);
    return () => {
      router.events.off("routeChangeComplete", handleFinish);
      router.events.off("routeChangeError", handleFinish);
    };
  }, [router.events]);

  return (
    <>
      {isSwitching && <LoadingOverlay />}
      {/* Sidebar */}
      <div className="fixed left-0 top-1/4 z-50 ml-3 hidden rounded-full bg-white shadow-md transition-colors duration-200 dark:bg-gray-800 md:block">
        <div className="flex flex-col items-center gap-6 p-4">
          <Link
            className="rounded-full p-2 text-inherit transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-700"
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
                {" "}
                <path
                  d="M22 12.2039V13.725C22 17.6258 22 19.5763 20.8284 20.7881C19.6569 22 17.7712 22 14 22H10C6.22876 22 4.34315 22 3.17157 20.7881C2 19.5763 2 17.6258 2 13.725V12.2039C2 9.91549 2 8.77128 2.5192 7.82274C3.0384 6.87421 3.98695 6.28551 5.88403 5.10813L7.88403 3.86687C9.88939 2.62229 10.8921 2 12 2C13.1079 2 14.1106 2.62229 16.116 3.86687L18.116 5.10812C20.0131 6.28551 20.9616 6.87421 21.4808 7.82274"
                  className="stroke-current"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                ></path>{" "}
                <path
                  d="M15 18H9"
                  className="stroke-current"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                ></path>{" "}
              </g>
            </svg>
          </Link>

          <Link
            className="rounded-full p-2 text-inherit transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-700"
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
                {" "}
                <circle
                  cx="12"
                  cy="6"
                  r="4"
                  className="stroke-current"
                  strokeWidth="1.5"
                ></circle>{" "}
                <path
                  d="M19.9975 18C20 17.8358 20 17.669 20 17.5C20 15.0147 16.4183 13 12 13C7.58172 13 4 15.0147 4 17.5C4 19.9853 4 22 12 22C14.231 22 15.8398 21.8433 17 21.5634"
                  className="stroke-current"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                ></path>{" "}
              </g>
            </svg>{" "}
          </Link>
          <Link
            className="rounded-full p-2 text-inherit transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-700"
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
                {" "}
                <rect
                  id="view-box"
                  width="24"
                  height="24"
                  fill="none"
                ></rect>{" "}
                <path
                  id="Shape"
                  d="M9.682,18.75a.75.75,0,0,1,.75-.75,8.25,8.25,0,1,0-6.189-2.795V12.568a.75.75,0,0,1,1.5,0v4.243a.75.75,0,0,1-.751.75H.75a.75.75,0,0,1,0-1.5H3a9.75,9.75,0,1,1,7.433,3.44A.75.75,0,0,1,9.682,18.75Zm2.875-4.814L9.9,11.281a.754.754,0,0,1-.22-.531V5.55a.75.75,0,1,1,1.5,0v4.889l2.436,2.436a.75.75,0,1,1-1.061,1.06Z"
                  transform="translate(1.568 2.25)"
                  className="fill-current"
                ></path>{" "}
              </g>
            </svg>
          </Link>
        </div>
      </div>
    </>
  );
}
