"use client"
import React from 'react';
import ShopperHeader from '@components/shopper/ShopperHeader';
import ShopperSidebar from '@components/shopper/ShopperSidebar';

interface ShopperLayoutProps {
  children: React.ReactNode;
}

export default function ShopperLayout({ children }: ShopperLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Fixed header */}
      <ShopperHeader />
      {/* Main content wrapper */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar and bottom nav inside sidebar component */}
        <ShopperSidebar />
        {/* Scrollable content area with padding for bottom nav on mobile */}
        <div className="flex-1 overflow-auto pb-16 md:pb-0">{children}</div>
      </div>
    </div>
  );
} 