"use client"

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PlasaSidebar() {
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const isActive = (path: string) =>
    pathname ? (pathname === path || pathname.startsWith(`${path}/`)) : false;

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 bg-white border-r min-h-[calc(100vh-73px)] sticky top-[73px]">
        <div className="p-4">
          <nav className="space-y-1">
            <Link href="/" passHref>
              <div
                className={`flex items-center px-4 py-3 rounded-lg ${
                  isActive("/") &&
                  !isActive("/Plasa/active-batches") &&
                  !isActive("/Plasa/earnings") &&
                  !isActive("/Plasa/invoices") &&
                  !isActive("/Plasa/settings")
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
                <span>Available batches</span>
              </div>
            </Link>
            <Link href="/Plasa/active-batches" passHref>
              <div
                className={`flex items-center px-4 py-3 rounded-lg ${
                  isActive("/Plasa/active-batches")
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
                <span>Active batches</span>
              </div>
            </Link>
            <Link href="/Plasa/earnings" passHref>
              <div
                className={`flex items-center px-4 py-3 rounded-lg ${
                  isActive("/Plasa/earnings")
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
            <Link href="/Plasa/invoices" passHref>
              <div
                className={`flex items-center px-4 py-3 rounded-lg ${
                  isActive("/Plasa/invoices")
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
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                  <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
                  <polyline points="7.5 19.79 7.5 14.6 3 12" />
                  <polyline points="21 12 16.5 14.6 16.5 19.79" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
                <span>Invoices</span>
              </div>
            </Link>
            <Link href="/Plasa/settings" passHref>
              <div
                className={`flex items-center px-4 py-3 rounded-lg ${
                  isActive("/Plasa/settings")
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
            href="/"
            passHref
            className={`flex flex-col items-center ${isActive("/Plasa") && !isActive("/Plasa/active-batches") ? "text-green-500" : "text-gray-500"}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link
            href="/Plasa/active-batches"
            passHref
            className={`flex flex-col items-center ${isActive("/Plasa/active-batches") ? "text-green-500" : "text-gray-500"}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
              <path d="M9 17H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-4" />
              <path d="M9 17l6-6" />
              <path d="M15 17v-6h-6" />
            </svg>
            <span className="text-xs mt-1">Active Batches</span>
          </Link>
          <Link
            href="/Plasa/invoices"
            passHref
            className={`flex flex-col items-center ${isActive("/Plasa/invoices") ? "text-green-500" : "text-gray-500"}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
              <line x1="12" y1="12" x2="12" y2="12" />
              <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
            </svg>
            <span className="text-xs mt-1">Invoices</span>
          </Link>
          <Link
            href="/Plasa/earnings"
            passHref
            className={`flex flex-col items-center ${isActive("/Plasa/earnings") ? "text-green-500" : "text-gray-500"}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
            <span className="text-xs mt-1">Earnings</span>
          </Link>
          <Link
            href="/Plasa/settings"
            passHref
            className={`flex flex-col items-center ${isActive("/Plasa/settings") ? "text-green-500" : "text-gray-500"}`}
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