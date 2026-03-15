import React, { useState, useEffect } from "react";

interface LoadingScreenProps {
  loadingProgress?: number;
  loadingMessage?: string;
  showProgressBar?: boolean;
  showBouncingDots?: boolean;
  customMessages?: string[];
  onComplete?: () => void;
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
}) => {
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

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-[#fafdfc] font-['Nunito'] dark:bg-[#020d0b]"
      style={{
        width: "100vw",
        height: "100vh",
      }}
    >
      {/* Dynamic Background Elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-1/4 -top-1/4 h-[70vw] w-[70vw] animate-pulse rounded-full bg-[#022c22]/5 blur-[120px] dark:bg-[#022c22]/10" />
        <div
          className="absolute -bottom-1/4 -right-1/4 h-[70vw] w-[70vw] animate-pulse rounded-full bg-[#10b981]/5 blur-[120px] dark:bg-[#10b981]/10"
          style={{ animationDelay: "2s" }}
        />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(#022c22 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        {/* Premium Logo Presentation */}
        <div className="group relative mb-12">
          {/* Outer Glow */}
          <div className="absolute inset-0 animate-ping rounded-full bg-[#022c22]/20 blur-xl dark:bg-[#10b981]/20" />

          <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 transition-transform duration-500 hover:scale-105 dark:bg-[#021c16] sm:h-32 sm:w-32">
            <img
              src="/assets/logos/PlasIcon.png"
              alt="Plas Logo"
              className="h-16 w-16 object-contain animate-[pulse_3s_ease-in-out_infinite] sm:h-20 sm:w-20"
            />
          </div>

          {/* Minimal Ring Spinner around Logo */}
          <svg className="absolute -inset-4 h-32 w-32 animate-[spin_4s_linear_infinite] sm:h-40 sm:w-40" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="2"
              strokeDasharray="40 160"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#022c22" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Content Section */}
        <div className="max-w-sm space-y-6">
          <div className="space-y-2">
            <h2 className="font-['Poppins'] text-2xl font-bold tracking-tight text-[#022c22] dark:text-[#f0f9f6] sm:text-3xl">
              Welcome to <span className="text-[#10b981]">Plas</span>
            </h2>
            <p className="min-h-[1.5rem] text-sm font-medium text-gray-500 transition-all duration-500 dark:text-gray-400 sm:text-base">
              {loadingMessage}
            </p>
          </div>

          {/* Modern Progress Tracking */}
          {showProgressBar && (
            <div className="relative py-4">
              <div className="mb-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-[#022c22]/60 dark:text-[#f0f9f6]/60">
                <span>Optimization Status</span>
                <span className="tabular-nums">{loadingProgress}%</span>
              </div>
              <div className="relative h-1.5 w-64 overflow-hidden rounded-full bg-gray-100 dark:bg-white/5 sm:w-80">
                {/* Progress Fill */}
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#022c22] to-[#10b981] shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all duration-700 ease-out"
                  style={{ width: `${loadingProgress}%` }}
                >
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </div>
              </div>
            </div>
          )}

          {/* Soft Indicator */}
          {showBouncingDots && (
            <div className="flex justify-center space-x-1.5 opacity-50">
              {[0, 150, 300].map((delay) => (
                <div
                  key={delay}
                  className="h-1 w-1 animate-bounce rounded-full bg-[#022c22] dark:bg-[#10b981]"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
