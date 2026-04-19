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
      case "bronze": 
        return { 
          color: "from-orange-400 to-orange-700", 
          glow: "shadow-orange-500/20",
          text: "text-orange-500",
          bg: "bg-orange-500/10"
        };
      case "silver": 
        return { 
          color: "from-slate-300 to-slate-500", 
          glow: "shadow-slate-400/20",
          text: "text-slate-400",
          bg: "bg-slate-400/10"
        };
      case "gold": 
        return { 
          color: "from-yellow-300 to-yellow-600", 
          glow: "shadow-yellow-500/20",
          text: "text-yellow-500",
          bg: "bg-yellow-500/10"
        };
      case "platinum": 
        return { 
          color: "from-cyan-300 to-cyan-500", 
          glow: "shadow-cyan-400/20",
          text: "text-cyan-400",
          bg: "bg-cyan-400/10"
        };
      default: 
        return { 
          color: "from-gray-400 to-gray-600", 
          glow: "shadow-gray-400/10",
          text: "text-gray-400",
          bg: "bg-gray-400/10"
        };
    }
  };

  const getIcon = (t: string) => {
    const size = "h-5 w-5";
    switch (t.toLowerCase()) {
      case "earnings":
        return <svg className={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      case "orders":
        return <svg className={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
      case "ratings":
        return <svg className={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>;
      default:
        return <svg className={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    }
  };

  const config = getTierConfig(level);

  return (
    <div className={`relative flex h-14 w-14 items-center justify-center transition-all duration-300 ${!isAchieved ? "opacity-30 grayscale" : ""}`}>
      {/* Dynamic Glow Aura */}
      <div className={`absolute inset-0 rounded-full bg-gradient-to-br opacity-20 blur-md ${config.color}`} />
      
      {/* Main Glass Disc */}
      <div className={`relative flex h-12 w-12 items-center justify-center rounded-full border-2 shadow-lg backdrop-blur-md transition-all duration-300 
        ${isDark ? "bg-white/10 border-white/20" : "bg-white border-black/10"} 
        ${isAchieved ? `shadow-xl ${config.glow} ${config.text}` : "text-gray-400"}`}
      >
        {getIcon(type)}
      </div>
      
      {/* Achievement Sparkle */}
      {isAchieved && (
        <div className="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
      )}
    </div>
  );
};

const AchievementBadges: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [achievementData, setAchievementData] = useState<AchievementData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [showAllAchieved, setShowAllAchieved] = useState(false);
  const [showAllPending, setShowAllPending] = useState(false);
  const INITIAL_LIMIT = 4;

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
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Syncing Trophy Room...</p>
      </div>
    );
  }

  if (!achievementData) return null;

  const { achieved, pending, summary } = achievementData;

  const renderAchievementCard = (a: Achievement, isAchieved: boolean) => {
    const tier = a.level.toLowerCase();
    const glowClass = tier === 'gold' ? 'bg-yellow-500' : tier === 'platinum' ? 'bg-cyan-500' : tier === 'silver' ? 'bg-slate-400' : 'bg-orange-500';

    return (
      <div 
        key={a.badgeName}
        className={`relative overflow-hidden group rounded-[2rem] p-5 transition-all duration-500 border ${
          isDark 
            ? "bg-white/5 border-white/10 hover:bg-white/10" 
            : "bg-white border-black/5 shadow-sm hover:shadow-md"
        }`}
      >
        <div className="flex items-center gap-4">
          <TierBadge level={a.level} type={a.type} isAchieved={isAchieved} />
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-black tracking-tight truncate">{a.badgeName}</h4>
            <div className="flex items-center gap-1.5">
              <span className={`h-1 w-1 rounded-full ${glowClass.replace('bg-', 'bg-')}`} />
              <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest truncate">{a.level} Tier</p>
            </div>
          </div>

          {isAchieved ? (
            <div className="flex h-8 items-center px-4 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
              Achieved
            </div>
          ) : (
            <div className="text-right">
              <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">
                {Math.round(a.progress)}%
              </span>
            </div>
          )}
        </div>

        {!isAchieved && (
          <div className="mt-4 space-y-2">
            <div className="h-1 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                style={{ width: `${a.progress}%` }} 
              />
            </div>
            <p className="text-[10px] font-black opacity-30 text-right uppercase tracking-widest">
              {a.current} / {a.target}
            </p>
          </div>
        )}

        {/* Decorative Gradient Background */}
        <div className={`absolute -right-4 -bottom-4 h-24 w-24 rounded-full blur-[40px] opacity-10 transition-all duration-700 group-hover:scale-150 group-hover:opacity-20 ${glowClass}`} />
      </div>
    );
  };

  const visibleAchieved = showAllAchieved ? achieved : achieved.slice(0, INITIAL_LIMIT);
  const visiblePending = showAllPending ? pending : pending.slice(0, INITIAL_LIMIT);

  return (
    <div className="space-y-12 pb-10">
      {/* Header Stat Pills */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Earned", val: summary.totalAchieved, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "In Progress", val: summary.totalPending, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Completion", val: `${Math.round((summary.totalAchieved / (summary.totalAchieved + summary.totalPending)) * 100)}%`, color: "text-indigo-500", bg: "bg-indigo-500/10" }
        ].map((stat, i) => (
          <div key={i} className={`rounded-[2rem] p-6 border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-black/5 shadow-sm"} flex items-center justify-between`}>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">{stat.label}</p>
              <h2 className={`text-2xl font-black ${stat.color}`}>{stat.val}</h2>
            </div>
            <div className={`h-12 w-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
              {i === 0 ? "🏆" : i === 1 ? "⚡" : "📈"}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-12">
        {/* Achieved Section - NOW ON TOP */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 justify-between">
            <div className="flex items-center gap-3 flex-1">
              <h3 className="text-sm font-black uppercase tracking-widest opacity-40 whitespace-nowrap">Archives</h3>
              <div className="h-px flex-1 bg-black/5 dark:bg-white/5" />
            </div>
            {achieved.length > INITIAL_LIMIT && (
              <button 
                onClick={() => setShowAllAchieved(!showAllAchieved)}
                className={`flex h-8 items-center px-4 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-300
                  ${isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-black/5 border-transparent hover:bg-black/10"}`}
              >
                {showAllAchieved ? "View Less" : `View More (${achieved.length - INITIAL_LIMIT})`}
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {visibleAchieved.map(a => renderAchievementCard(a, true))}
          </div>

          {achieved.length === 0 && (
            <div className={`rounded-[2.5rem] border-2 border-dashed p-12 text-center ${isDark ? "border-white/5" : "border-black/5"}`}>
              <p className="text-sm font-bold opacity-30 uppercase tracking-widest">No badges earned yet</p>
            </div>
          )}
        </div>

        {/* In Progress Section - NOW BELOW */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 justify-between">
            <div className="flex items-center gap-3 flex-1">
              <h3 className="text-sm font-black uppercase tracking-widest opacity-40 whitespace-nowrap">Current Goals</h3>
              <div className="h-px flex-1 bg-black/5 dark:bg-white/5" />
            </div>
            {pending.length > INITIAL_LIMIT && (
              <button 
                onClick={() => setShowAllPending(!showAllPending)}
                className={`flex h-8 items-center px-4 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-300
                  ${isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-black/5 border-transparent hover:bg-black/10"}`}
              >
                {showAllPending ? "View Less" : `View More (${pending.length - INITIAL_LIMIT})`}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {visiblePending.map(a => renderAchievementCard(a, false))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementBadges;
