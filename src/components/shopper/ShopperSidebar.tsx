"use client"

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ShopperSidebar() {
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(`${path}/`);

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 bg-white border-r min-h-[calc(100vh-73px)] sticky top-[73px]">
        <div className="p-4">
          <nav className="space-y-1">
            <Link href="/shopper">
              <div
                className={`flex items-center px-4 py-3 rounded-lg ${
                  isActive("/shopper") &&
                  !isActive("/shopper/active-orders") &&
                  !isActive("/shopper/earnings") &&
                  !isActive("/shopper/settings")
                    ? "bg-green-50 text-green-600"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-5 h-5 mr-3"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <span>Available Orders</span>
              </div>
            </Link>
            <Link href="/shopper/active-orders">
              <div
                className={`flex items-center px-4 py-3 rounded-lg ${
                  isActive("/shopper/active-orders")
                    ? "bg-green-50 text-green-600"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-5 h-5 mr-3"
                >
                  <path d="M9 17H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-4" />
                  <path d="M9 17l6-6" />
                  <path d="M15 17v-6h-6" />
                </svg>
                <span>Active Orders</span>
              </div>
            </Link>
            <Link href="/shopper/earnings">
              <div
                className={`flex items-center px-4 py-3 rounded-lg ${
                  isActive("/shopper/earnings")
                    ? "bg-green-50 text-green-600"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-5 h-5 mr-3"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                </svg>
                <span>Earnings</span>
              </div>
            </Link>
            <Link href="/shopper/settings">
              <div
                className={`flex items-center px-4 py-3 rounded-lg ${
                  isActive("/shopper/settings")
                    ? "bg-green-50 text-green-600"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-5 h-5 mr-3"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                </svg>
                <span>Settings</span>
              </div>
            </Link>
          </nav>

          <div className="mt-8 pt-4 border-t">
            <div className="px-4 py-2">
              <h3 className="text-xs uppercase text-gray-500 font-semibold">Account</h3>
            </div>
            <Link href="/">
              <div className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-5 h-5 mr-3"
                >
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Switch to Customer</span>
              </div>
            </Link>
            <div className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-5 h-5 mr-3"
              >
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Log Out</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t py-2 px-4 flex justify-around z-[1000]">
          <Link
            href="/shopper"
            className={`flex flex-col items-center ${isActive("/shopper") && !isActive("/shopper/active-orders") ? "text-green-500" : "text-gray-500"}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link
            href="/shopper/active-orders"
            className={`flex flex-col items-center ${isActive("/shopper/active-orders") ? "text-green-500" : "text-gray-500"}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
              <path d="M9 17H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-4" />
              <path d="M9 17l6-6" />
              <path d="M15 17v-6h-6" />
            </svg>
            <span className="text-xs mt-1">Active</span>
          </Link>
          <Link
            href="/shopper/earnings"
            className={`flex flex-col items-center ${isActive("/shopper/earnings") ? "text-green-500" : "text-gray-500"}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
            <span className="text-xs mt-1">Earnings</span>
          </Link>
          <Link
            href="/shopper/settings"
            className={`flex flex-col items-center ${isActive("/shopper/settings") ? "text-green-500" : "text-gray-500"}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
              <circle cx="12" cy="8" r="4" />
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            </svg>
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      )}
    </>
  );
} 