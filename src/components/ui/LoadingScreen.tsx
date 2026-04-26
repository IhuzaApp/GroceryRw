import React, { useState, useEffect } from "react";
import { useTheme } from "@context/ThemeContext";

interface LoadingScreenProps {
  loadingProgress?: number;
  loadingMessage?: string;
  showProgressBar?: boolean;
  showBouncingDots?: boolean;
  customMessages?: string[];
  onComplete?: () => void;
  isOverlay?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  loadingProgress: externalProgress,
  loadingMessage: externalMessage,
  showProgressBar = true,
  showBouncingDots = true,
  customMessages = [
    "Initializing your Plas experience...",
    "Curating fresh inventory...",
    "Syncing with our smart servers...",
    "Preparing your dashboard...",
    "Final touches strictly for you...",
  ],
  onComplete,
  isOverlay = false,
}) => {
  const { theme } = useTheme();
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState(customMessages[0]);

  useEffect(() => {
    if (externalProgress !== undefined) {
      setLoadingProgress(externalProgress);
      return;
    }

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 10) + 2;

      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => onComplete?.(), 500);
      }

      setLoadingProgress(progress);

      const messageIndex = Math.min(
        Math.floor(progress / 20),
        customMessages.length - 1
      );
      setLoadingMessage(customMessages[messageIndex]);
    }, 600);

    return () => clearInterval(interval);
  }, [externalProgress, customMessages, onComplete]);

  useEffect(() => {
    if (externalMessage) {
      setLoadingMessage(externalMessage);
    }
  }, [externalMessage]);

  const bgColor = isOverlay
    ? theme === "dark"
      ? "bg-[#020d0b]/80 backdrop-blur-xl"
      : "bg-white/70 backdrop-blur-xl"
    : theme === "dark"
    ? "bg-[#020d0b]"
    : "bg-[#fafdfc]";

  const textColor = theme === "dark" ? "text-[#f0f9f6]" : "text-[#022c22]";
  const secondaryTextColor = theme === "dark" ? "text-gray-400" : "text-gray-500";

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden font-['Nunito'] transition-colors duration-700 ${bgColor}`}
      style={{
        width: "100vw",
        height: "100vh",
      }}
    >
      {/* Dynamic Background Elements - only for non-overlay */}
      {!isOverlay && (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-1/4 -top-1/4 h-[70vw] w-[70vw] animate-pulse rounded-full bg-[#022c22]/5 blur-[120px] dark:bg-[#022c22]/10" />
          <div
            className="absolute -bottom-1/4 -right-1/4 h-[70vw] w-[70vw] animate-pulse rounded-full bg-[#10b981]/5 blur-[120px] dark:bg-[#10b981]/10"
            style={{ animationDelay: "2s" }}
          />
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
            style={{
              backgroundImage:
                "radial-gradient(#022c22 0.5px, transparent 0.5px)",
              backgroundSize: "24px 24px",
            }}
          />
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        {/* Premium Logo Presentation - No Cards */}
        <div className="group relative mb-12">
          {/* Outer Glow */}
          <div className="absolute inset-0 -z-10 animate-pulse scale-150 rounded-full bg-[#10b981]/20 blur-3xl dark:bg-[#10b981]/15" />
          
          <div className="relative flex h-24 w-24 items-center justify-center transition-transform duration-700 hover:scale-110 sm:h-32 sm:w-32">
            <img
              src="/assets/logos/PlasIcon.png"
              alt="Plas Logo"
              className="h-20 w-20 animate-float object-contain sm:h-28 sm:w-28"
            />
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-sm space-y-6">
          <div className="space-y-2">
            <h2 className={`font-['Poppins'] text-2xl font-bold tracking-tight ${textColor} sm:text-3xl`}>
              {isOverlay ? (
                <span className="flex items-center justify-center gap-2">
                  Processing <span className="text-[#10b981]">Plas</span>
                </span>
              ) : (
                <>Welcome to <span className="text-[#10b981]">Plas</span></>
              )}
            </h2>
            <p className={`min-h-[1.5rem] text-sm font-medium transition-all duration-500 ${secondaryTextColor} sm:text-base`}>
              {loadingMessage}
            </p>
          </div>

          {/* Modern Progress Tracking */}
          {showProgressBar && !isOverlay && (
            <div className="relative py-4">
              <div className={`mb-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest ${textColor} opacity-60`}>
                <span>Optimization Status</span>
                <span className="tabular-nums">{loadingProgress}%</span>
              </div>
              <div className="relative h-1.5 w-64 overflow-hidden rounded-full bg-gray-100 dark:bg-white/5 sm:w-80">
                {/* Progress Fill */}
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#022c22] to-[#10b981] shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all duration-700 ease-out dark:from-[#10b981] dark:to-[#022c22]"
                  style={{ width: `${loadingProgress}%` }}
                >
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </div>
              </div>
            </div>
          )}

          {/* Soft Indicator */}
          {(showBouncingDots || isOverlay) && (
            <div className="flex justify-center space-x-1.5 opacity-50">
              {[0, 150, 300].map((delay) => (
                <div
                  key={delay}
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#022c22] dark:bg-[#10b981]"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;

