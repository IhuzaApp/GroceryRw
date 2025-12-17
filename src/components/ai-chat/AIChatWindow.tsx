import React, { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

interface AIChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIChatWindow({ isOpen, onClose }: AIChatWindowProps) {
  const { data: session } = useSession();
  const userName = session?.user?.name || "there";
  
  const getInitialMessage = () => ({
    id: "1",
    text: `Hello ${userName}! 😊 I'm your Plas Agent. I can help you with orders, food recommendations, and more. How can I assist you today?`,
    sender: "ai" as const,
    timestamp: new Date(),
  });

  const [messages, setMessages] = useState<Message[]>([getInitialMessage()]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update initial message when user name changes (only if it's still the initial message)
  useEffect(() => {
    if (messages.length === 1 && messages[0].id === "1") {
      const newInitialMessage = getInitialMessage();
      if (messages[0].text !== newInitialMessage.text) {
        setMessages([newInitialMessage]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userName]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [isOpen, messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response (placeholder for future AI integration)
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Thank you for your message! This is a placeholder response. Real AI integration will be added soon to help you with orders, food recommendations, and more.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - Hidden on mobile, shown on desktop */}
      <div
        className="hidden md:fixed md:inset-0 md:z-40 md:bg-black/50 md:backdrop-blur-sm md:transition-opacity md:duration-300"
        onClick={onClose}
      />

      {/* Chat Window */}
      <div className="fixed inset-0 z-[10000] flex flex-col bg-white transition-all duration-300 dark:bg-gray-800 md:inset-auto md:bottom-20 md:right-4 md:h-[500px] md:w-full md:max-w-md md:rounded-2xl md:border md:border-gray-200 md:shadow-2xl dark:md:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-[#115e59] px-6 py-4 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <svg
                className="h-6 w-6 text-white"
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
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Plas Agent</h3>
              <p className="text-xs text-white/80">Always here to help</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
            aria-label="Close chat"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.sender === "user"
                    ? "bg-[#115e59] text-white"
                    : "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
                <span
                  className={`mt-1 block text-xs ${
                    message.sender === "user"
                      ? "text-white/70"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-gray-100 px-4 py-3 dark:bg-gray-700">
                <div className="flex space-x-2">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-green-400"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#115e59] text-white transition-all duration-200 hover:bg-[#197a74] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#115e59]"
              aria-label="Send message"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            AI integration coming soon. This is a preview interface.
          </p>
        </div>
      </div>
    </>
  );
}

