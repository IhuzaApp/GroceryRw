import React from "react";
import { useTheme } from "@context/ThemeContext";

const LoadingOverlay: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{
        width: "100vw",
        height: "100vh",
      }}
    >
      {/* Premium Glass Backdrop */}
      <div
        className={`absolute inset-0 backdrop-blur-xl transition-colors duration-700 ${
          theme === "dark" ? "bg-[#020d0b]/80" : "bg-white/70"
        }`}
      />

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
        {/* Animated Logo with Glow */}
        <div className="group relative">
          {/* Subtle Glow behind logo */}
          <div className="absolute inset-0 -z-10 animate-pulse rounded-full bg-[#10b981]/20 blur-2xl dark:bg-[#10b981]/10" />

          <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-white shadow-xl ring-1 ring-black/5 dark:bg-[#021c16] sm:h-28 sm:w-28">
            <img
              src="/assets/logos/PlasIcon.png"
              alt="Plas Logo"
              className="sm:h-18 sm:w-18 h-16 w-16 animate-[pulse_3s_ease-in-out_infinite] object-contain"
            />
          </div>

          {/* Minimal Spinning Ring */}
          <svg
            className="h-30 w-30 sm:h-34 sm:w-34 absolute -inset-3 animate-[spin_3s_linear_infinite]"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="url(#overlayGradient)"
              strokeWidth="1.5"
              strokeDasharray="60 140"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient
                id="overlayGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#022c22" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Loading Message */}
        <div className="space-y-2">
          <span
            className={`font-['Poppins'] text-sm font-semibold uppercase tracking-wider ${
              theme === "dark" ? "text-[#10b981]" : "text-[#022c22]"
            }`}
          >
            Processing
          </span>
          <div className="flex h-1 items-center justify-center gap-1.5">
            {[0, 150, 300].map((delay) => (
              <div
                key={delay}
                className="h-1 w-1 animate-bounce rounded-full bg-[#022c22] dark:bg-[#10b981]"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.85;
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingOverlay;
