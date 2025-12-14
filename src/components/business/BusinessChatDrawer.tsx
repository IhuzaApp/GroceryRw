"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import {
  Search,
  MessageSquare,
  Send,
  Phone,
  Video,
  MoreVertical,
  X,
  ArrowLeft,
} from "lucide-react";

interface Conversation {
  id: string;
  title: string;
  counterpartName: string;
  role: "supplier" | "customer";
  lastMessage: string;
  lastTime: string;
  unread: number;
}

interface ChatMessage {
  id: string;
  sender: "me" | "them";
  text?: string;
  timestamp: string;
  attachments?: Array<{ name: string; url: string }>;
}

interface BusinessChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockConversations: Conversation[] = [
  {
    id: "c-001",
    title: "Weekly Fresh Produce",
    counterpartName: "Green Valley Farms",
    role: "supplier",
    lastMessage: "We can deliver by Friday",
    lastTime: "2h",
    unread: 2,
  },
  {
    id: "c-002",
    title: "Office Cleaning Services",
    counterpartName: "CleanPro Services",
    role: "supplier",
    lastMessage: "Please review the updated quote",
    lastTime: "1d",
    unread: 0,
  },
  {
    id: "c-003",
    title: "Equipment Maintenance",
    counterpartName: "TechFix Solutions",
    role: "customer",
    lastMessage: "Thanks, we'll proceed",
    lastTime: "3d",
    unread: 0,
  },
];

const mockMessages: Record<string, ChatMessage[]> = {
  "c-001": [
    {
      id: "m1",
      sender: "them",
      text: "Hello! We reviewed your RFQ.",
      timestamp: "09:10",
    },
    {
      id: "m2",
      sender: "me",
      text: "Great. Can you deliver by Friday?",
      timestamp: "09:12",
    },
    {
      id: "m3",
      sender: "them",
      text: "Yes, delivery by Friday is possible.",
      timestamp: "09:15",
    },
  ],
  "c-002": [
    {
      id: "m1",
      sender: "me",
      text: "Can you send an updated quote?",
      timestamp: "Yesterday",
    },
    {
      id: "m2",
      sender: "them",
      text: "Sure, just sent it.",
      timestamp: "Yesterday",
    },
  ],
  "c-003": [
    {
      id: "m1",
      sender: "them",
      text: "We completed the last maintenance.",
      timestamp: "Mon",
    },
    { id: "m2", sender: "me", text: "Thanks, looks good.", timestamp: "Mon" },
  ],
};

export default function BusinessChatDrawer({
  isOpen,
  onClose,
}: BusinessChatDrawerProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showChatBody, setShowChatBody] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Handle supplier parameter from URL when drawer opens
  useEffect(() => {
    if (isOpen) {
      const { supplier } = router.query;
      if (supplier && typeof supplier === "string") {
        const conversation = mockConversations.find(
          (c) =>
            c.id === supplier ||
            c.counterpartName.toLowerCase().includes(supplier.toLowerCase())
        );
        if (conversation) {
          setActiveId(conversation.id);
          setShowChatBody(true);
        }
      }
    }
  }, [isOpen, router.query]);

  useEffect(() => {
    if (showChatBody && activeId) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeId, showChatBody]);

  // Reset state when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setShowChatBody(false);
      setActiveId(null);
      setQuery("");
      setInput("");
    }
  }, [isOpen]);

  const conversations = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mockConversations;
    return mockConversations.filter((c) =>
      [c.title, c.counterpartName].some((s) => s.toLowerCase().includes(q))
    );
  }, [query]);

  const currentMessages = useMemo(() => {
    return (activeId ? mockMessages[activeId] : []) || [];
  }, [activeId]);

  const activeConversation = useMemo(() => {
    return mockConversations.find((c) => c.id === activeId) || null;
  }, [activeId]);

  const handleConversationClick = (conversationId: string) => {
    setActiveId(conversationId);
    setShowChatBody(true);
  };

  const handleBackToList = () => {
    setShowChatBody(false);
    setActiveId(null);
  };

  const handleSend = () => {
    if (!input.trim() || !activeId) return;
    // Here you would POST to your messages API
    mockMessages[activeId] = [
      ...(mockMessages[activeId] || []),
      {
        id: `m-${Date.now()}`,
        sender: "me",
        text: input.trim(),
        timestamp: new Date().toLocaleTimeString(),
      },
    ];
    setInput("");
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - Only show on desktop (lg+) */}
      <div
        className="hidden fixed inset-0 z-[9998] bg-black/50 transition-opacity lg:block"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 bottom-0 z-[9999] flex h-screen w-full transform bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:bg-gray-800 lg:h-screen lg:w-[36rem] lg:max-w-[36rem] xl:w-[44rem] xl:max-w-[44rem] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {!showChatBody ? (
          /* Conversations List */
          <div className="flex h-full w-full flex-col overflow-hidden">
            {/* Header */}
            <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                <MessageSquare className="h-5 w-5" /> Business Chats
              </h2>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search */}
            <div className="flex-shrink-0 border-b border-gray-200 p-4 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="min-h-0 flex-1 divide-y divide-gray-100 overflow-y-auto dark:divide-gray-700">
              {conversations.length === 0 ? (
                <div className="flex h-full items-center justify-center p-8 text-center">
                  <div>
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                      No conversations found
                    </p>
                  </div>
                </div>
              ) : (
                conversations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleConversationClick(c.id)}
                    className={`w-full p-4 text-left transition hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      activeId === c.id ? "bg-gray-50 dark:bg-gray-700" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {c.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {c.counterpartName} •{" "}
                          {c.role === "supplier" ? "Supplier" : "Customer"}
                        </p>
                        <p className="line-clamp-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {c.lastMessage}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-right ml-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {c.lastTime}
                        </p>
                        {c.unread > 0 && (
                          <span
                            className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-green-500 px-1 text-xs font-semibold text-white mt-1"
                            style={{ color: "#ffffff" }}
                          >
                            {c.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        ) : (
          /* Chat Body */
          <div className="flex h-full w-full flex-col overflow-hidden">
            {/* Chat Header */}
            <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button
                  onClick={handleBackToList}
                  className="lg:hidden flex-shrink-0 rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {activeConversation?.title || "Chat"}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {activeConversation?.counterpartName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  className="hidden sm:block rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Audio call"
                >
                  <Phone className="h-4 w-4" />
                </button>
                <button
                  className="hidden sm:block rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Video call"
                >
                  <Video className="h-4 w-4" />
                </button>
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-4 dark:bg-gray-900">
              {currentMessages.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                      <MessageSquare className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      No messages yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Start the conversation
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentMessages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${
                        m.sender === "me" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div className="max-w-[75%]">
                        <div
                          className={`rounded-2xl px-4 py-3 shadow-sm ${
                            m.sender === "me"
                              ? "bg-green-500 text-white"
                              : "bg-white text-gray-900 dark:bg-gray-800 dark:text-white"
                          }`}
                          style={
                            m.sender === "me" ? { color: "#ffffff" } : undefined
                          }
                        >
                          <p className="text-sm leading-relaxed">{m.text}</p>
                          {m.sender === "me" && (
                            <div className="mt-1 flex items-center justify-end space-x-1">
                              <span className="text-xs text-green-100">
                                {m.timestamp}
                              </span>
                              <svg
                                className="h-3 w-3 text-green-100"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )}
                          {m.sender !== "me" && (
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              {m.timestamp}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Professional Message Input */}
            <div className="flex-shrink-0 border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-end space-x-3"
              >
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    className="w-full rounded-full border border-gray-300 bg-gray-50 px-4 py-3 text-sm focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-green-400 dark:focus:bg-gray-600"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="flex-shrink-0 rounded-full bg-green-500 p-3 text-white shadow-lg transition-all duration-200 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-800"
                  style={{ color: "#ffffff" }}
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

