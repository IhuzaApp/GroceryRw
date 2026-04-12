import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

interface AIChatButtonProps {
  onClick: () => void;
  /** Hide button on mobile (e.g. store/checkout pages) */
  hideOnMobile?: boolean;
}

export default function AIChatButton({
  onClick,
  hideOnMobile,
}: AIChatButtonProps) {
  const router = useRouter();
  const [showTooltip, setShowTooltip] = useState(true);

  // Synchronize visibility with Cart button logic in BottomBar
  const isHiddenPage = 
    router.pathname === "/Cart" || 
    router.pathname === "/Reels" || 
    router.pathname === "/Myprofile/become-shopper" || 
    router.pathname === "/stores/[id]" || 
    router.pathname === "/stores/[id]/checkout" || 
    router.pathname === "/plasBusiness/store/[storeId]";

  // Auto-hide the "Need help?" tooltip after 6 seconds to be minimally intrusive
  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  if (isHiddenPage) return null;

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
          ✨ Need Help? Get an AI Agent
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
            fill="currentColor"
            className="drop-shadow-md"
          >
            <path d="M12,2a8,8,0,0,0-8,8v1.9A2.92,2.92,0,0,0,3,14a2.88,2.88,0,0,0,1.94,2.61C6.24,19.72,8.85,22,12,22h3V20H12c-2.26,0-4.31-1.7-5.34-4.39l-.21-.55L5.86,15A1,1,0,0,1,5,14a1,1,0,0,1,.5-.86l.5-.29V11a1,1,0,0,1,1-1H17a1,1,0,0,1,1,1v5H13.91a1.5,1.5,0,1,0-1.52,2H20a2,2,0,0,0,2-2V14a2,2,0,0,0-2-2V10A8,8,0,0,0,12,2Z" />
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
