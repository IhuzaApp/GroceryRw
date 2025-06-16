"use client";
import React, { useState, useEffect } from "react";
import ShopperHeader from "@components/shopper/ShopperHeader";
import ShopperSidebar from "@components/shopper/ShopperSidebar";
import { useSession } from "next-auth/react";
import { useTheme } from "@context/ThemeContext";
import { logger } from "../../utils/logger";

interface ShopperLayoutProps {
  children: React.ReactNode;
}

export default function ShopperLayout({ children }: ShopperLayoutProps) {
  const { data: session, status } = useSession();
  const { theme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  useEffect(() => {
    if (session) {
      logger.debug("Session data", "ShopperLayout", {
        user: session.user,
        expires: session.expires
      });
    }
  }, [session]);

  // session contains user: { id, name, email, phone, gender, address }
  // status is 'authenticated' | 'loading' | 'unauthenticated'
  return (
    <div
      className={`min-h-screen ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <ShopperHeader />
      <div className="flex">
        <ShopperSidebar />
        <main
          className={`flex-1 transition-colors duration-200 relative ${
            theme === "dark"
              ? "bg-gray-900 text-gray-100"
              : "bg-gray-50 text-gray-900"
          } ${isMobile ? "p-0 pb-24" : "p-4 pl-64"}`}
        >
          <div className="relative z-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
