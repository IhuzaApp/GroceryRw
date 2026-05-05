"use client";

import React from "react";

interface ShopperChatInputProps {
  message: string;
  setMessage: (val: string) => void;
  handleSendMessage: (e?: React.FormEvent) => void;
  reportTyping: () => void;
  clearTyping: () => void;
  piiError: string | null;
}

export const ShopperChatInput: React.FC<ShopperChatInputProps> = ({
  message,
  setMessage,
  handleSendMessage,
  reportTyping,
  clearTyping,
  piiError,
}) => {
  return (
    <div className="p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <form
          onSubmit={handleSendMessage}
          className="relative flex items-center gap-3"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                reportTyping();
              }}
              onBlur={clearTyping}
              placeholder="Type a message..."
              className="w-full rounded-[2rem] bg-white px-6 py-4 text-sm font-medium outline-none shadow-sm transition-all focus:shadow-md dark:bg-white/5 dark:focus:bg-white/10"
            />
          </div>
          <button
            type="submit"
            disabled={!message.trim()}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 transition-all hover:scale-110 active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
          >
            <svg
              className="h-6 w-6 rotate-90"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
        {piiError && (
          <p className="mt-3 text-center text-[10px] font-black uppercase tracking-widest text-red-500">
            {piiError}
          </p>
        )}
      </div>
    </div>
  );
};
