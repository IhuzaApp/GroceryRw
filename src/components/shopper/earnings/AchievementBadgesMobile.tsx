import React, { useState, useEffect } from "react";
import { Progress, Tooltip, Whisper, Loader } from "rsuite";
import { formatCurrencySync } from "../../../utils/formatCurrency";
import { authenticatedFetch } from "@lib/authenticatedFetch";
import { useTheme } from "../../../context/ThemeContext";

interface Achievement {
  type: string;
  level: string;
  badgeName: string;
  description: string;
  achieved: boolean;
  progress: number;
  target: number;
  current: number;
  streakCount?: number;
  achievedAt?: string;
}

interface AchievementData {
  achieved: Achievement[];
  pending: Achievement[];
  summary: {
    totalAchieved: number;
    totalPending: number;
    monthlyEarnings: number;
    monthlyOrderCount: number;
    monthlyRating: number;
  };
}

const TierBadge: React.FC<{ level: string; type: string; isAchieved: boolean }> = ({ level, type, isAchieved }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const getTierConfig = (lvl: string) => {
    switch (lvl.toLowerCase()) {
      case "bronze": return { color: "from-orange-400 to-orange-700", glow: "shadow-orange-500/20" };
      case "silver": return { color: "from-slate-300 to-slate-500", glow: "shadow-slate-400/20" };
      case "gold": return { color: "from-yellow-300 to-yellow-600", glow: "shadow-yellow-500/20" };
      case "platinum": return { color: "from-cyan-300 to-cyan-500", glow: "shadow-cyan-400/20" };
      default: return { color: "from-gray-400 to-gray-600", glow: "shadow-gray-400/10" };
    }
  };

  const getIcon = (t: string) => {
    const size = "h-4 w-4";
    switch (t.toLowerCase()) {
      case "earnings":
        return <svg className={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      case "orders":
        return <svg className={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
      case "ratings":
        return <svg className={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>;
      default:
        return <svg className={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    }
  };

  const config = getTierConfig(level);

  return (
    <div className={`relative flex h-10 w-10 items-center justify-center transition-all duration-300 ${!isAchieved ? "grayscale" : ""}`}>
      <div className={`absolute inset-0 rounded-full bg-gradient-to-br opacity-20 blur-md ${config.color}`} />
      <div className={`relative flex h-8 w-8 items-center justify-center rounded-full border border-white/20 shadow-lg backdrop-blur-md 
        ${isDark ? "bg-white/10" : "bg-black/5"} 
        ${isAchieved ? config.glow : "opacity-30"}`}
      >
        <div className={`bg-gradient-to-br bg-clip-text text-transparent ${config.color}`}>
          {getIcon(type)}
        </div>
      </div>
    </div>
  );
};

const AchievementBadgesMobile: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [achievementData, setAchievementData] = useState<AchievementData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        const response = await authenticatedFetch("/api/queries/shopper-achievements");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setAchievementData(data.achievements);
          }
        }
      } catch (error) {
        console.error("Error fetching achievements:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAchievements();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader size="md" content="Loading Trophy Room..." vertical />
      </div>
    );
  }

  if (!achievementData) return null;

  const { achieved, pending, summary } = achievementData;

  const renderAchievementCard = (a: Achievement, isAchieved: boolean) => (
    <div 
      key={a.badgeName}
      className={`relative overflow-hidden rounded-3xl p-4 border ${
        isDark ? "bg-white/5 border-white/10" : "bg-white border-black/5 shadow-sm"
      }`}
    >
      <div className="flex items-center gap-4">
        <TierBadge level={a.level} type={a.type} isAchieved={isAchieved} />
        
        <div className="flex-1 min-w-0">
          <h4 className="text-[13px] font-black tracking-tight truncate">{a.badgeName}</h4>
          <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">{a.level} Tier</p>
        </div>

        {isAchieved ? (
          <div className="h-6 flex items-center px-3 rounded-full bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest">
            Achieved
          </div>
        ) : (
          <div className="text-[9px] font-black opacity-30 uppercase tracking-widest">
            {Math.round(a.progress)}%
          </div>
        )}
      </div>

      {!isAchieved && (
        <div className="mt-3 space-y-1.5">
          <div className="h-1 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
              style={{ width: `${a.progress}%` }} 
            />
          </div>
          <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest opacity-30">
            <span>Progress</span>
            <span>{a.current} / {a.target}</span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 pb-6">
      {/* Mobile Summary Row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Earned", val: summary.totalAchieved, color: "text-emerald-500", icon: "🏆" },
          { label: "Pending", val: summary.totalPending, color: "text-amber-500", icon: "⚡" },
          { label: "Rate", val: `${Math.round((summary.totalAchieved / (summary.totalAchieved + summary.totalPending)) * 100)}%`, color: "text-indigo-500", icon: "📈" }
        ].map((stat, i) => (
          <div key={i} className={`rounded-2xl p-3 text-center border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-black/5 shadow-sm"}`}>
            <span className="text-sm block mb-1">{stat.icon}</span>
            <div className={`text-base font-black ${stat.color}`}>{stat.val}</div>
            <div className="text-[8px] font-black opacity-40 uppercase tracking-widest mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Achieved Section */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 pl-1">Earned Rewards</h3>
        <div className="space-y-3">
          {achieved.map(a => renderAchievementCard(a, true))}
          {achieved.length === 0 && (
            <div className={`rounded-3xl border border-dashed p-8 text-center ${isDark ? "border-white/10" : "border-black/5"}`}>
              <p className="text-[10px] font-black opacity-30 uppercase tracking-widest text-center">First badge is waiting...</p>
            </div>
          )}
        </div>
      </div>

      {/* Pending Section */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 pl-1">Current Goals</h3>
        <div className="space-y-3">
          {pending.map(a => renderAchievementCard(a, false))}
        </div>
      </div>
    </div>
  );
};

export default AchievementBadgesMobile;
