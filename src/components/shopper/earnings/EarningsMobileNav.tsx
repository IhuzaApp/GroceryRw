import React from "react";
import { useTheme } from "@context/ThemeContext";
import { ChevronLeft } from "lucide-react";

interface EarningsMobileNavProps {
  activeTab: string;
  onBack: () => void;
}

const EarningsMobileNav: React.FC<EarningsMobileNavProps> = ({ activeTab, onBack }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const getTabLabel = (id: string) => {
    switch (id) {
      case "overview": return "Overview";
      case "breakdown": return "Breakdown";
      case "recent-orders": return "Recent Orders";
      case "payments": return "Payments";
      case "achievements": return "Achievements";
      default: return "Details";
    }
  };

  return (
    <div className={`sticky top-0 z-50 mb-6 -mx-4 px-4 py-4 border-b backdrop-blur-xl transition-all duration-300 ${
      isDark ? "bg-black/40 border-white/10" : "bg-white/40 border-black/5"
    }`}>
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className={`group flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
            isDark ? "bg-white/10 text-white" : "bg-black/5 text-black"
          }`}
        >
          <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
        </button>
        
        <div>
          <h2 className="text-lg font-black tracking-tight leading-none">{getTabLabel(activeTab)}</h2>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">Nexus Financial Hub</p>
        </div>
      </div>
    </div>
  );
};

export default EarningsMobileNav;
