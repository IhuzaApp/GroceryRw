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
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Fixed header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <ShopperHeader />
      </div>

      {/* Main content wrapper */}
      <div className="flex flex-1 pt-[64px] overflow-hidden">
        {/* Sidebar - visible on desktop */}
        <div className="hidden md:block">
          <ShopperSidebar />
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-auto pb-20 md:pb-0 px-2 sm:px-4">
          {children}
        </div>
      </div>

      {/* Bottom nav (inside ShopperSidebar or create separate if needed) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
        {/* If ShopperSidebar includes mobile nav logic, remove this and handle there */}
        <ShopperSidebar />
      </div>
    </div>
  );
}
