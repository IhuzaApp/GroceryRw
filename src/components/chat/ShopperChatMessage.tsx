"use client";

import React from "react";
import {
  formatMessageDate,
  formatMessageTime,
} from "../../lib/formatters";
import { sanitizeMessageForDisplay } from "../../lib/chatPiiBlock";

interface MessageProps {
  msg: any;
  isDark: boolean;
  isMe: boolean;
  isPending: boolean;
  isRead: boolean;
  showDate: boolean;
}

export const ShopperChatMessage: React.FC<MessageProps> = ({
  msg,
  isDark,
  isMe,
  isPending,
  isRead,
  showDate,
}) => {
  return (
    <React.Fragment>
      {showDate && (
        <div className="flex items-center gap-4 py-4">
          <div className="h-px flex-1 bg-black/5 dark:bg-white/5" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30">
            {formatMessageDate(msg.timestamp)}
          </span>
          <div className="h-px flex-1 bg-black/5 dark:bg-white/5" />
        </div>
      )}
      <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
        <div
          className={`group relative max-w-[80%] rounded-3xl px-5 py-3 shadow-sm transition-all duration-300 md:max-w-[60%] ${
            isMe
              ? "rounded-br-none bg-emerald-500 text-white shadow-emerald-500/20"
              : isDark
              ? "rounded-bl-none border border-white/5 bg-white/5 text-gray-100 backdrop-blur-md"
              : "rounded-bl-none border border-black/5 bg-white text-gray-900"
          }`}
        >
          <div className="whitespace-pre-wrap text-sm font-medium leading-relaxed">
            {sanitizeMessageForDisplay(
              ("text" in msg ? msg.text : msg.message) ?? ""
            )}
          </div>
          <div
            className={`mt-1.5 flex items-center gap-2 opacity-40 transition-opacity group-hover:opacity-100 ${
              isMe ? "justify-end text-white" : ""
            }`}
          >
            {isMe && (
              <span className="text-[8px] font-black uppercase tracking-tighter">
                {isPending ? "Sending..." : isRead ? "Read" : "Sent"}
              </span>
            )}
            <span className="text-[8px] font-black">
              {formatMessageTime(msg.timestamp)}
            </span>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
