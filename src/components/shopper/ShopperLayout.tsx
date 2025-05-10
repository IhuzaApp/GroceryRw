"use client";
import React from "react";
import ShopperHeader from "@components/shopper/ShopperHeader";
import ShopperSidebar from "@components/shopper/ShopperSidebar";
import { useSession } from "next-auth/react";

interface ShopperLayoutProps {
  children: React.ReactNode;
}

export default function ShopperLayout({ children }: ShopperLayoutProps) {
  const { data: session, status } = useSession();
  // session contains user: { id, name, email, phone, gender, address }
  // status is 'authenticated' | 'loading' | 'unauthenticated'
  console.log(session);
  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Fixed header */}
      <div className="fixed left-0 right-0 top-0 z-50">
        <ShopperHeader />
      </div>

      {/* Main content wrapper */}
      <div className="flex flex-1 overflow-hidden pt-[64px]">
        {/* Sidebar - visible on desktop */}
        <div className="hidden md:block">
          <ShopperSidebar />
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-auto px-2 pb-20 sm:px-4 md:pb-0">
          {children}
        </div>
      </div>

      {/* Bottom nav (inside ShopperSidebar or create separate if needed) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
        {/* If ShopperSidebar includes mobile nav logic, remove this and handle there */}
        <ShopperSidebar />
      </div>
    </div>
  );
}
