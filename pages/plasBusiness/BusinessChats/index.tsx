"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import RootLayout from "../../../src/components/ui/layout";
import { useAuth } from "../../../src/context/AuthContext";
import {
  Search,
  MessageSquare,
  Send,
  Phone,
  Video,
  MoreVertical,
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

export default function BusinessChatsPage() {
  const { isLoggedIn, authReady } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(
    mockConversations[0]?.id || null
  );
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Handle supplier parameter from URL
  useEffect(() => {
    const { supplier } = router.query;
    if (supplier && typeof supplier === "string") {
      // Find conversation with this supplier
      const conversation = mockConversations.find(
        (c) =>
          c.id === supplier ||
          c.counterpartName.toLowerCase().includes(supplier.toLowerCase())
      );
      if (conversation) {
        setActiveId(conversation.id);
      }
    }
  }, [router.query]);

  useEffect(() => {
    if (!authReady) return;
    if (!isLoggedIn) {
      router.push("/Auth/Login");
    }
  }, [authReady, isLoggedIn, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeId]);

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

  if (!authReady) {
    return (
      <RootLayout>
        <div className="flex h-screen w-full items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-b-4 border-t-4 border-green-800"></div>
        </div>
      </RootLayout>
    );
  }

  return (
    <RootLayout>
      <div className="h-[calc(100vh-6.5rem)] overflow-hidden via-white to-gray-100 dark:from-gray-900 md:fixed md:left-16 md:right-0 md:top-16 md:h-[calc(100vh-4rem)] md:w-[calc(100%-4rem)]">
        <div className="mx-auto h-full w-full max-w-full p-4 md:p-6">
          <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
            {/* Conversations List */}
            <div className="flex h-full min-h-0 flex-col rounded-2xl border border-gray-100 bg-white shadow dark:border-gray-700 dark:bg-gray-800 lg:col-span-1">
              <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-100 p-4 dark:border-gray-700">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                  <MessageSquare className="h-5 w-5" /> Business Chats
                </h2>
                <div className="relative w-48">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>
              </div>
              <div className="min-h-0 flex-1 divide-y divide-gray-100 overflow-y-auto dark:divide-gray-700">
                {conversations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveId(c.id)}
                    className={`w-full p-4 text-left transition hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      activeId === c.id ? "bg-gray-50 dark:bg-gray-700" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {c.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {c.counterpartName} •{" "}
                          {c.role === "supplier" ? "Supplier" : "Customer"}
                        </p>
                        <p className="line-clamp-1 text-sm text-gray-500 dark:text-gray-400">
                          {c.lastMessage}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {c.lastTime}
                        </p>
                        {c.unread > 0 && (
                          <span
                            className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-green-500 px-1 text-xs font-semibold text-white"
                            style={{ color: "#ffffff" }}
                          >
                            {c.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Window */}
            <div className="flex h-full min-h-0 flex-col rounded-2xl border border-gray-100 bg-white shadow dark:border-gray-700 dark:bg-gray-800 lg:col-span-2">
              <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-100 p-4 dark:border-gray-700">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {activeConversation?.title || "Select a conversation"}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {activeConversation?.counterpartName}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <button
                    className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Audio call"
                  >
                    <Phone className="h-4 w-4" />
                  </button>
                  <button
                    className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Video call"
                  >
                    <Video className="h-4 w-4" />
                  </button>
                  <button
                    className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="More"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
                {currentMessages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${
                      m.sender === "me" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow ${
                        m.sender === "me"
                          ? "bg-green-500 text-white"
                          : "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
                      }`}
                      style={
                        m.sender === "me" ? { color: "#ffffff" } : undefined
                      }
                    >
                      <p>{m.text}</p>
                      <p
                        className={`mt-1 text-[10px] ${
                          m.sender === "me"
                            ? "text-white/80"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {m.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="flex-shrink-0 border-t border-gray-100 p-3 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSend();
                    }}
                    className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  />
                  <button
                    onClick={handleSend}
                    className="flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2 text-white transition hover:bg-green-600"
                    style={{ color: "#ffffff" }}
                  >
                    <Send className="h-4 w-4" />
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RootLayout>
  );
}
