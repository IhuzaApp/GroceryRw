import React from "react";
import { useTheme } from "@context/ThemeContext";
import { ChevronRight, LayoutGrid, BarChart3, ShoppingBag, CreditCard, Trophy } from "lucide-react";

interface MenuItem {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  accent: string;
}

interface EarningsMobileMenuProps {
  onSelect: (id: string) => void;
}

const EarningsMobileMenu: React.FC<EarningsMobileMenuProps> = ({ onSelect }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const menuItems: MenuItem[] = [
    {
      id: "overview",
      label: "Overview",
      description: "Daily stats and earning summary",
      icon: LayoutGrid,
      accent: "emerald",
    },
    {
      id: "breakdown",
      label: "Breakdown",
      description: "Detailed income analysis",
      icon: BarChart3,
      accent: "blue",
    },
    {
      id: "recent-orders",
      label: "Orders",
      description: "History and fulfillment data",
      icon: ShoppingBag,
      accent: "orange",
    },
    {
      id: "payments",
      label: "Payments",
      description: "Withdrawals and transactions",
      icon: CreditCard,
      accent: "purple",
    },
    {
      id: "achievements",
      label: "Badges",
      description: "Milestones and performance",
      icon: Trophy,
      accent: "amber",
    },
  ];

  return (
    <div className="flex flex-col gap-4 pb-10">
      <div className="mb-2">
        <h2 className="text-2xl font-black tracking-tight">Financial Center</h2>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Command & Control</p>
      </div>

      <div className="space-y-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          
          // Static accent mapping
          const accentConfig = {
            emerald: isDark ? "bg-emerald-500/10 text-emerald-500" : "bg-emerald-50 text-emerald-600",
            blue: isDark ? "bg-blue-500/10 text-blue-500" : "bg-blue-50 text-blue-600",
            orange: isDark ? "bg-orange-500/10 text-orange-500" : "bg-orange-50 text-orange-600",
            purple: isDark ? "bg-purple-500/10 text-purple-500" : "bg-purple-50 text-purple-600",
            amber: isDark ? "bg-amber-500/10 text-amber-500" : "bg-amber-50 text-amber-600",
          }[item.accent as keyof typeof accentConfig];

          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`group flex w-full items-center gap-4 rounded-[2rem] p-5 border transition-all duration-300 active:scale-[0.98] ${
                isDark 
                  ? "bg-white/5 border-white/10 hover:bg-white/10" 
                  : "bg-white border-black/5 shadow-sm hover:shadow-md"
              }`}
            >
              <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl transition-all duration-300 ${accentConfig}`}>
                <Icon className="h-6 w-6" />
              </div>

              <div className="flex-1 text-left">
                <h3 className="text-sm font-black tracking-tight">{item.label}</h3>
                <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{item.description}</p>
              </div>

              <div className="opacity-30 group-hover:opacity-100 transition-all duration-300">
                <ChevronRight className="h-5 w-5" />
              </div>
            </button>
          );
        })}
      </div>

    </div>
  );
};

export default EarningsMobileMenu;
