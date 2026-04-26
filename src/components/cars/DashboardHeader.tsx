"use client";

import React from "react";
import { Plus } from "lucide-react";

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
  onAction: () => void;
  actionLabel: string;
  theme: string;
}

export default function DashboardHeader({ 
  title, 
  subtitle, 
  onAction, 
  actionLabel,
  theme 
}: DashboardHeaderProps) {
  return (
    <div className={`px-6 py-8 ${theme === 'dark' ? 'bg-gradient-to-b from-green-900/20 to-transparent' : 'bg-gradient-to-b from-green-50 to-transparent'}`}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">{title}</h1>
            <p className="text-gray-500 font-medium">{subtitle}</p>
          </div>
          <button 
            onClick={onAction}
            className="flex items-center gap-2 rounded-2xl bg-green-500 px-6 py-3 font-black text-white shadow-xl shadow-green-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] !text-white"
          >
            <Plus className="h-5 w-5" />
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
