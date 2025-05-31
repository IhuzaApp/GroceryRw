"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import "rsuite/dist/rsuite.min.css";
import { usePathname } from "next/navigation";
import { useTheme } from "@context/ThemeContext";
import { Button } from "rsuite";

export default function ShopperHeader() {
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Get page title based on pathname
  const getPageTitle = () => {
    // Don't show title on home/map page
    if (pathname === '/' || pathname === '/map') return null;
    if (pathname === '/Plasa/active-batches') return 'Active Batches';
    if (pathname === '/Plasa/Earnings') return 'Earnings';
    if (pathname === '/Plasa/settings') return 'Settings';
    return '';
  };

  if (isMobile) {
    const title = getPageTitle();
    // Don't render header at all if there's no title
    if (!title) return null;

    return (
      <header className={`sticky top-0 z-[1000] border-b ${
        theme === 'dark' ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-200 bg-white text-gray-900'
      }`}>
        <h1 className="px-4 py-3 text-lg font-semibold">{title}</h1>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-[1000] flex items-center justify-between border-b border-gray-200 bg-white p-4 transition-colors duration-200 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6 text-white"
            fill="currentColor"
          >
            <path d="M12 6.5a2 2 0 100-4 2 2 0 000 4zM8.5 8a2 2 0 100-4 2 2 0 000 4zM15.5 8a2 2 0 100-4 2 2 0 000 4zM18 9.5a2 2 0 100-4 2 2 0 000 4zM6 9.5a2 2 0 100-4 2 2 0 000 4zM18 14a2 2 0 100-4 2 2 0 000 4zM6 14a2 2 0 100-4 2 2 0 000 4zM15.5 16a2 2 0 100-4 2 2 0 000 4zM8.5 16a2 2 0 100-4 2 2 0 000 4zM12 17.5a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </div>
        <div></div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 md:flex">
          <Link href="/shopper/earnings">
            <button className="flex items-center rounded-md px-3 py-2 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="mr-1 h-5 w-5"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </svg>
              Earnings
            </button>
          </Link>
          <Link href="/shopper/settings">
            <button className="flex items-center rounded-md px-3 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="mr-1 h-5 w-5"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
              Settings
            </button>
          </Link>
          <Button
            appearance="subtle"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center rounded-md px-3 py-2"
          >
            {theme === "dark" ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5 text-yellow-500"
              >
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5 text-gray-600"
              >
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
          </Button>
        </div>
        <div className="flex items-center">
          <div className="h-8 w-8 overflow-hidden rounded-full">
            <Image
              src="/placeholder.svg?height=32&width=32"
              alt="Profile"
              width={32}
              height={32}
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
