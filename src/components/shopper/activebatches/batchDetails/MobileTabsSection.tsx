"use client";

import React from "react";
import { useTheme } from "../../../../context/ThemeContext";

interface MobileTabsSectionProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function MobileTabsSection({
  activeTab,
  onTabChange,
}: MobileTabsSectionProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div 
      className={`sticky top-[58px] z-40 border-b transition-all duration-300 sm:hidden ${
        isDark ? "bg-[#0A0A0A]/70 border-white/5" : "bg-white/70 border-black/5"
      }`}
      style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
    >
      <div className="flex px-4 py-1">
        <TabButton 
          active={activeTab === "items"} 
          onClick={() => onTabChange("items")} 
          label="Items" 
          isDark={isDark}
        />
        <TabButton 
          active={activeTab === "details"} 
          onClick={() => onTabChange("details")} 
          label="Details" 
          isDark={isDark}
        />
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label, isDark }: { active: boolean, onClick: () => void, label: string, isDark: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex-1 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${
        active 
          ? "text-emerald-500" 
          : "text-gray-500 opacity-60 hover:opacity-100"
      }`}
    >
      <span className="relative z-10">{label}</span>
      {active && (
        <>
          <div className="absolute bottom-0 left-1/4 h-[3px] w-1/2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          <div className="absolute inset-x-2 inset-y-1.5 rounded-xl bg-emerald-500/5" />
        </>
      )}
    </button>
  );
}
