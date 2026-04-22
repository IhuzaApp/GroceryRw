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

const TierBadge: React.FC<{
  level: string;
  type: string;
  isAchieved: boolean;
}> = ({ level, type, isAchieved }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const getTierConfig = (lvl: string) => {
    switch (lvl.toLowerCase()) {
      case "bronze":
        return {
          color: "from-orange-400 to-orange-700 shadow-orange-500/20",
          text: "text-orange-500",
          bg: "bg-orange-500/10",
        };
      case "silver":
        return {
          color: "from-slate-300 to-slate-500 shadow-slate-400/20",
          text: "text-slate-400",
          bg: "bg-slate-400/10",
        };
      case "gold":
        return {
          color: "from-yellow-300 to-yellow-600 shadow-yellow-500/20",
          text: "text-yellow-500",
          bg: "bg-yellow-500/10",
        };
      case "platinum":
        return {
          color: "from-cyan-300 to-cyan-500 shadow-cyan-400/20",
          text: "text-cyan-400",
          bg: "bg-cyan-400/10",
        };
      default:
        return {
          color: "from-gray-400 to-gray-600 shadow-gray-400/10",
          text: "text-gray-400",
          bg: "bg-gray-400/10",
        };
    }
  };

  const getIcon = (t: string) => {
    const size = "h-6 w-6";
    switch (t.toLowerCase()) {
      case "earnings":
        return (
          <svg className={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "orders":
        return (
          <svg className={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
      case "ratings":
        return (
          <svg className={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        );
      default:
        return (
          <svg className={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const config = getTierConfig(level);

  return (
    <div className={`relative flex h-20 w-20 items-center justify-center transition-all duration-700 ${!isAchieved ? "opacity-30 grayscale" : "hover:scale-110"}`}>
      {/* Glow Aura */}
      <div className={`absolute inset-0 rounded-full bg-gradient-to-br opacity-20 blur-xl ${config.color}`} />
      
      {/* Badge Container */}
      <div className={`relative flex h-16 w-16 items-center justify-center rounded-[1.5rem] border-2 shadow-2xl backdrop-blur-2xl transition-all duration-500 
        ${isDark ? "border-white/10 bg-white/5" : "border-gray-100 bg-white shadow-gray-200/50"} 
        ${isAchieved ? config.text : "text-gray-400"}`}>
        {getIcon(type)}
        
        {/* Tier Indicator Corner */}
        <div className={`absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-lg shadow-lg ring-1 ring-white/10 ${config.color}`}>
          <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
        </div>
      </div>
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
      <div className="flex flex-col items-center justify-center py-32 space-y-6">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
        <p className="text-[10px] font-black uppercase tracking-[0.25em] opacity-40 animate-pulse">Syncing Trophy Room...</p>
      </div>
    );
  }

  if (!achievementData) return null;

  const { achieved, pending, summary } = achievementData;

  const renderAchievementCard = (a: Achievement, isAchieved: boolean) => {
    const tier = a.level.toLowerCase();
    const accentColor = tier === "gold" ? "amber" : tier === "platinum" ? "cyan" : tier === "silver" ? "slate" : "orange";

    return (
      <div
        key={a.badgeName}
        className={`group relative overflow-hidden rounded-[2.5rem] p-6 transition-all duration-500 hover:shadow-2xl ${
          isDark
            ? "border border-white/5 bg-gray-900/40 backdrop-blur-2xl hover:bg-gray-800/60 shadow-xl"
            : "border border-gray-100 bg-white shadow-xl shadow-gray-200/50 hover:border-emerald-200"
        }`}
      >
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center">
          <TierBadge level={a.level} type={a.type} isAchieved={isAchieved} />

          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex items-center gap-3">
              <h4 className={`truncate text-xl font-black tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                {a.badgeName}
              </h4>
              <span className={`rounded-xl px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ring-1 ${
                isDark ? "bg-white/5 text-white/40 ring-white/10" : "bg-gray-100 text-gray-500 ring-gray-200"
              }`}>
                {a.level}
              </span>
            </div>
            <p className={`text-xs font-bold leading-relaxed opacity-40 ${isDark ? "text-white" : "text-gray-900"}`}>
              {a.description}
            </p>
          </div>

          <div className="flex items-center justify-between lg:flex-col lg:items-end lg:justify-center">
            {isAchieved ? (
              <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-5 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                Mastered
              </div>
            ) : (
              <div className="space-y-1 text-right">
                <span className="text-xl font-black tabular-nums tracking-tighter opacity-20">
                  {Math.round(a.progress)}%
                </span>
              </div>
            )}
          </div>
        </div>

        {!isAchieved && (
          <div className="relative z-10 mt-6 space-y-3">
            <div className={`h-2.5 w-full overflow-hidden rounded-full p-0.5 ${isDark ? "bg-white/5 shadow-inner" : "bg-gray-100 shadow-inner"}`}>
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all duration-1000 ease-out"
                style={{ width: `${a.progress}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em] opacity-40">
              <span>Current: {a.current}</span>
              <span>Target: {a.target}</span>
            </div>
          </div>
        )}

        {/* Floating Decorative Glow */}
        <div className={`absolute -bottom-20 -right-20 h-48 w-48 rounded-full blur-[80px] opacity-0 transition-all duration-700 group-hover:opacity-10 
          ${accentColor === "amber" ? "bg-amber-500" : accentColor === "cyan" ? "bg-cyan-500" : accentColor === "slate" ? "bg-slate-400" : "bg-orange-500"}`} />
      </div>
    );
  };

  const visibleAchieved = showAllAchieved ? achieved : achieved.slice(0, INITIAL_LIMIT);
  const visiblePending = showAllPending ? pending : pending.slice(0, INITIAL_LIMIT);

  return (
    <div className="space-y-12 pb-16 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Header Stat Pills */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[
          { label: "Elite Badges", val: summary.totalAchieved, accent: "emerald", icon: "🏆" },
          { label: "Active Quests", val: summary.totalPending, accent: "amber", icon: "⚡" },
          { label: "Mastery Level", val: `${Math.round((summary.totalAchieved / (summary.totalAchieved + summary.totalPending)) * 100)}%`, accent: "purple", icon: "📈" },
        ].map((stat, i) => (
          <div
            key={i}
            className={`group relative overflow-hidden rounded-[2.5rem] p-8 transition-all duration-500 hover:shadow-2xl ${
              isDark
                ? "border border-white/5 bg-gray-900/40 backdrop-blur-2xl shadow-xl shadow-black/20"
                : "border border-gray-100 bg-white shadow-xl shadow-gray-200/50"
            } flex items-center justify-between`}
          >
            <div className="relative z-10">
              <p className={`mb-1.5 text-[10px] font-black uppercase tracking-[0.25em] ${isDark ? "text-white/30" : "text-gray-400"}`}>
                {stat.label}
              </p>
              <h2 className={`text-4xl font-black tracking-tighter ${isDark ? "text-white" : "text-gray-900"}`}>
                {stat.val}
              </h2>
            </div>
            <div className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-[1.5rem] text-2xl shadow-inner ring-1 transition-transform group-hover:rotate-12 ${
              isDark ? "bg-white/5 ring-white/10" : "bg-gray-50 ring-gray-100"
            }`}>
              {stat.icon}
            </div>
            {/* Background Glow */}
            <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full blur-3xl opacity-0 transition-opacity group-hover:opacity-10 ${
              stat.accent === "emerald" ? "bg-emerald-500" : stat.accent === "amber" ? "bg-amber-500" : "bg-purple-500"
            }`} />
          </div>
        ))}
      </div>

      <div className="space-y-16">
        {/* Archives Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between gap-6">
            <div className="flex flex-1 items-center gap-6">
              <h3 className={`text-sm font-black uppercase tracking-[0.3em] ${isDark ? "text-white/20" : "text-gray-400"}`}>
                Trophy Archive
              </h3>
              <div className="h-px flex-1 bg-gradient-to-r from-white/5 to-transparent dark:from-white/5" />
            </div>
            {achieved.length > INITIAL_LIMIT && (
              <button
                onClick={() => setShowAllAchieved(!showAllAchieved)}
                className={`group flex items-center gap-2 rounded-2xl border px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all duration-500 active:scale-95
                  ${isDark ? "border-white/5 bg-white/5 hover:bg-white/10 text-white/40" : "border-gray-100 bg-white hover:bg-gray-50 text-gray-500 shadow-sm"}`}
              >
                {showAllAchieved ? "Show Less" : `Reveal All (${achieved.length})`}
                <svg className={`h-3 w-3 transition-transform duration-500 ${showAllAchieved ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {visibleAchieved.map((a) => renderAchievementCard(a, true))}
          </div>

          {achieved.length === 0 && (
            <div className={`rounded-[3rem] border-2 border-dashed py-32 text-center transition-colors ${isDark ? "border-white/5 bg-white/[0.01]" : "border-gray-100 bg-gray-50/50"}`}>
              <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] ${isDark ? "bg-white/5" : "bg-white shadow-xl"}`}>
                <svg className="h-10 w-10 text-gray-400 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <p className="text-sm font-black uppercase tracking-[0.2em] opacity-20">No achievements recorded yet</p>
            </div>
          )}
        </div>

        {/* Current Quests Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between gap-6">
            <div className="flex flex-1 items-center gap-6">
              <h3 className={`text-sm font-black uppercase tracking-[0.3em] ${isDark ? "text-white/20" : "text-gray-400"}`}>
                Active Quests
              </h3>
              <div className="h-px flex-1 bg-gradient-to-r from-white/5 to-transparent dark:from-white/5" />
            </div>
            {pending.length > INITIAL_LIMIT && (
              <button
                onClick={() => setShowAllPending(!showAllPending)}
                className={`group flex items-center gap-2 rounded-2xl border px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all duration-500 active:scale-95
                  ${isDark ? "border-white/5 bg-white/5 hover:bg-white/10 text-white/40" : "border-gray-100 bg-white hover:bg-gray-50 text-gray-500 shadow-sm"}`}
              >
                {showAllPending ? "Show Less" : `Reveal All (${pending.length})`}
                <svg className={`h-3 w-3 transition-transform duration-500 ${showAllPending ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {visiblePending.map((a) => renderAchievementCard(a, false))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementBadges;
