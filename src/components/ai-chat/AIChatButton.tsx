import React, { useState, useEffect } from "react";

interface AIChatButtonProps {
  onClick: () => void;
  /** Hide button on mobile (e.g. store/checkout pages) */
  hideOnMobile?: boolean;
}

export default function AIChatButton({
  onClick,
  hideOnMobile,
}: AIChatButtonProps) {
  const [showTooltip, setShowTooltip] = useState(true);

  // Auto-hide the "Need help?" tooltip after 6 seconds to be minimally intrusive
  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`fixed bottom-40 right-4 z-[100000] md:bottom-24 md:right-4 ${
        hideOnMobile ? "hidden md:block" : "block"
      }`}
    >
      {/* Educational Tooltip */}
      <div
        className={`pointer-events-none absolute -top-14 right-0 w-max origin-bottom-right transition-all duration-500 ease-out ${
          showTooltip
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-2 scale-90 opacity-0"
        }`}
      >
        <div className="relative rounded-2xl border border-[#115e59]/20 bg-white px-4 py-2 text-sm font-bold text-[#115e59] shadow-xl dark:border-white/10 dark:bg-gray-800 dark:text-[#84cc16]">
          ✨ Need help? Ask AI
          {/* Tooltip Tail pointer */}
          <div className="absolute -bottom-2 right-5 h-4 w-4 rotate-45 border-b border-r border-[#115e59]/20 bg-white dark:border-white/10 dark:bg-gray-800"></div>
        </div>
      </div>

      {/* Main AI Button */}
      <button
        onClick={() => {
          setShowTooltip(false);
          onClick();
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="group relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#064e3b] via-[#115e59] to-[#047857] shadow-[0_8px_30px_rgb(17,94,89,0.3)] transition-all duration-300 hover:scale-110 hover:shadow-[0_8px_40px_rgb(17,94,89,0.5)] active:scale-95"
        aria-label="Open Plas AI Assistant"
      >
        {/* Hover inner glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Ambient ping effect for the background */}
        <span className="absolute inset-0 animate-[ping_3s_ease-out_infinite] rounded-full bg-white opacity-20 group-hover:animate-none"></span>

        {/* Core AI Sparkle SVG Icon */}
        <div className="relative z-10 flex h-full w-full items-center justify-center text-white transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-md"
          >
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
          </svg>
        </div>

        {/* Dynamic bright notification dot */}
        <span className="absolute right-0 top-0 flex h-3.5 w-3.5 rounded-full border-2 border-[#115e59] bg-[#84cc16]">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#84cc16] opacity-75"></span>
        </span>
      </button>
    </div>
  );
}
