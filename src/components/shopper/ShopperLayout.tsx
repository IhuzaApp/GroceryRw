"use client"
import React from 'react';
import ShopperHeader from '@components/shopper/ShopperHeader';
import ShopperSidebar from '@components/shopper/ShopperSidebar';

interface ShopperLayoutProps {
  children: React.ReactNode;
}

export default function ShopperLayout({ children }: ShopperLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <ShopperHeader />
      <div className="flex">
        <ShopperSidebar />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
} 