"use client"

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Toggle } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import { usePathname } from "next/navigation";

export default function ShopperHeader() {
  const [isAvailable, setIsAvailable] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const handleToggleAvailability = (checked: boolean) => {
    setIsAvailable(checked);
    // In a real app, send availability to backend
  };

  return (
    <header className="sticky top-0 z-10 bg-white p-4 flex items-center justify-between border-b">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
            <path d="M12 6.5a2 2 0 100-4 2 2 0 000 4zM8.5 8a2 2 0 100-4 2 2 0 000 4zM15.5 8a2 2 0 100-4 2 2 0 000 4zM18 9.5a2 2 0 100-4 2 2 0 000 4zM6 9.5a2 2 0 100-4 2 2 0 000 4zM18 14a2 2 0 100-4 2 2 0 000 4zM6 14a2 2 0 100-4 2 2 0 000 4zM15.5 16a2 2 0 100-4 2 2 0 000 4zM8.5 16a2 2 0 100-4 2 2 0 000 4zM12 17.5a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </div>
        <div>
      
          <div className="flex items-center text-md">
            <span className={`mr-2 ${isAvailable ? 'text-green-500' : 'text-gray-500'}`}>
              {isAvailable ? 'Available' : 'Unavailable'}
            </span>
            <Toggle size="sm" checked={isAvailable} onChange={handleToggleAvailability} className="scale-75 origin-left" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {!isMobile && (
          <div className="hidden md:flex items-center gap-2">
            <Link href="/shopper/earnings">
              <button className="flex items-center text-green-600 px-3 py-2 rounded-md hover:bg-green-50">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 mr-1">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                </svg>
                Earnings
              </button>
            </Link>
            <Link href="/shopper/settings">
              <button className="flex items-center text-gray-600 px-3 py-2 rounded-md hover:bg-gray-100">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 mr-1">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
                </svg>
                Settings
              </button>
            </Link>
          </div>
        )}
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <Image src="/placeholder.svg?height=32&width=32" alt="Profile" width={32} height={32} className="object-cover" />
          </div>
        </div>
      </div>
    </header>
  );
} 