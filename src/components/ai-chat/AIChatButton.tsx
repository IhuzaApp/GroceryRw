import React, { useState, useEffect } from "react";

interface AIChatButtonProps {
  onClick: () => void;
}

export default function AIChatButton({ onClick }: AIChatButtonProps) {
  const [currentIcon, setCurrentIcon] = useState(0);

  // Icons to cycle through
  const icons = ["🍕", "🍔", "🥗", "🍜", "🍰", "☕", "🥤", "🍏", "🍌", "🍇", "🍓", "🍒", "🍑", "🍎", "🍊", "🍑", "🍎", "🍊", "🍋", "🍐" , "🥬" , "🍆", "🥦", "🫑" , "🥑" , "🌶️" , "🧄" , "🥯" , "🍞" , "🥩" , "🍖" , "🌭" , "🍳" , "🫚" , "🍠" , "🍧" , "🍣" , "🍿" , "🎂"];

  // Cycle through icons
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIcon((prev) => (prev + 1) % icons.length);
    }, 3000); // Changed to 3 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <button
      onClick={onClick}
      className="group fixed bottom-40 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#115e59] text-white shadow-lg transition-all duration-300 hover:bg-[#197a74] hover:scale-110 hover:shadow-xl active:scale-95 md:bottom-24 md:right-4"
      aria-label="Open Plas Agent"
    >
      {/* Rotating icon display */}
      <span className="text-2xl transition-all duration-500 ease-in-out">
        {icons[currentIcon]}
      </span>

      {/* AI icon overlay */}
      <svg
        className="absolute h-5 w-5 opacity-40 transition-transform duration-300 group-hover:scale-110"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>

      {/* Pulse animation */}
      <span className="absolute inset-0 animate-ping rounded-full bg-[#115e59] opacity-20"></span>
    </button>
  );
}

