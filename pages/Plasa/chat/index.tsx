"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  Unsubscribe,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../src/lib/firebase";
import { Avatar, Loader, Input, IconButton } from "rsuite";
import { formatCurrency } from "../../../src/lib/formatCurrency";

import ShopperLayout from "@components/shopper/ShopperLayout";
import { useTheme } from "../../../src/context/ThemeContext";
import {
  containsBlockedPii,
  getBlockedMessage,
  sanitizeMessageForDisplay,
} from "../../../src/lib/chatPiiBlock";
import { useChatTypingIndicator } from "../../../src/hooks/useChatTypingIndicator";
import { useShopperProfile } from "../../../src/hooks/useShopperProfile";

// Define message interface
interface Message {
  id: string;
  text?: string;
  message?: string;
  senderId: string;
  senderType: "customer" | "shopper";
  recipientId: string;
  timestamp: any;
  read: boolean;
}

// Define conversation interface
interface Conversation {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  lastMessage: string;
  lastMessageTime: any;
  unreadCount: number;
  order?: any;
}

// Helper to format order ID
function formatOrderID(id?: string | number): string {
  if (!id) return "0000";
  const s = id.toString();
  return s.length >= 4 ? s : s.padStart(4, "0");
}

// Helper to format time
function formatTime(timestamp: any): string {
  if (!timestamp) return "";
  const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
}

// Global cache to persist between navigations
const orderCache = new Map<string, any>();

export default function ShopperChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { profileImage: shopperImage } = useShopperProfile();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Mobile detection
  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Fetch conversations
  useEffect(() => {
    if (!session?.user?.id) return;
    let unsubscribe: Unsubscribe | null = null;

    const fetchConversations = async () => {
      try {
        if (!db) {
          console.error("Firebase database not initialized");
          return;
        }
        
        const conversationsRef = collection(db, "chat_conversations");
        const q = query(
          conversationsRef,
          where("shopperId", "==", session.user.id),
          orderBy("lastMessageTime", "desc")
        );

        unsubscribe = onSnapshot(q, async (snapshot) => {
          // If we already have conversations, don't show the full-page loader again
          // unless it's the very first load
          if (conversations.length === 0) {
            setLoading(true);
          }

          const conversationPromises = snapshot.docs.map(async (doc) => {
            const data = doc.data();
            const orderId = data.orderId;
            
            let orderData = orderCache.get(orderId);
            
            if (!orderData) {
              try {
                const res = await fetch(`/api/shopper/orderDetails?id=${orderId}`);
                if (res.ok) {
                  const result = await res.json();
                  orderData = result.order;
                  orderCache.set(orderId, orderData);
                }
              } catch (err) {
                console.error(`Failed to fetch order details for ${orderId}:`, err);
              }
            }

            return {
              id: doc.id,
              orderId: data.orderId,
              customerId: data.customerId,
              customerName: orderData?.orderedBy?.name || data.customerName || "Customer",
              customerAvatar: orderData?.orderedBy?.profile_picture || data.customerAvatar || "/images/userProfile.png",
              lastMessage: data.lastMessage || "No messages yet",
              lastMessageTime: data.lastMessageTime,
              unreadCount: data.unreadCount || 0,
              order: orderData,
            };
          });

          const conversationsList = await Promise.all(conversationPromises);
          
          // Manual sort as fallback if index isn't ready
          conversationsList.sort((a, b) => {
            const timeA = a.lastMessageTime?.toDate?.() || new Date(a.lastMessageTime || 0);
            const timeB = b.lastMessageTime?.toDate?.() || new Date(b.lastMessageTime || 0);
            return timeB.getTime() - timeA.getTime();
          });

          setConversations(conversationsList);
          setLoading(false);
        });
      } catch (err) {
        console.error("Error setting up conversations listener:", err);
        setError("Failed to load conversations");
        setLoading(false);
      }
    };

    fetchConversations();
    return () => unsubscribe?.();
  }, [session?.user?.id]);

  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const filteredConversations = conversations.filter(c => {
    const matchesSearch = c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.orderId.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (showUnreadOnly) return matchesSearch && c.unreadCount > 0;
    return matchesSearch;
  });

  const ChatListSkeleton = () => (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="flex animate-pulse items-center gap-4 rounded-[2.5rem] bg-black/5 p-5 dark:bg-white/5">
          <div className="h-16 w-16 rounded-full bg-black/10 dark:bg-white/10" />
          <div className="flex-1 space-y-3">
            <div className="h-4 w-1/2 rounded bg-black/10 dark:bg-white/10" />
            <div className="h-3 w-3/4 rounded bg-black/10 dark:bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <ShopperLayout>
      <div className="flex h-full w-full flex-col bg-[var(--bg-primary)] scrollbar-hide overflow-y-auto">
        {/* Header Section */}
        <div className="px-6 py-8 w-full">
          <div className="mb-6 md:mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">Chats</h1>
              <p className="mt-1 text-[10px] md:text-xs font-bold opacity-30 uppercase tracking-widest">Conversation history</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                className={`flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-2xl transition-all active:scale-90 ${showUnreadOnly ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20' : 'bg-black/5 text-gray-400 dark:bg-white/5'}`}
              >
                <svg className="h-5 w-5 md:h-6 md:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6 md:mb-10">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30">
              <svg className="h-4 w-4 md:h-5 md:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl bg-black/5 py-3 md:py-4 pl-11 md:pl-12 pr-6 text-sm font-medium outline-none transition-all focus:bg-black/10 focus:ring-4 focus:ring-emerald-500/5 dark:bg-white/5 dark:focus:bg-white/10"
            />
          </div>

          {/* Loading State */}
          {loading ? (
            <ChatListSkeleton />
          ) : (
            /* Conversation List - Vertical Inbox Style */
            <div className="flex flex-col border border-black/5 dark:border-white/5 rounded-3xl overflow-hidden bg-white dark:bg-white/5">
              {filteredConversations.map((conv, idx) => (
                <Link
                  key={conv.id}
                  href={`/Plasa/chat/${conv.orderId}`}
                  className={`group relative flex items-center gap-4 p-4 md:p-6 transition-all hover:bg-black/5 dark:hover:bg-white/5 ${
                    idx !== filteredConversations.length - 1 ? 'border-b border-black/5 dark:border-white/5' : ''
                  }`}
                >
                  {/* Avatar Section */}
                  <div className="relative">
                    <Avatar src={conv.customerAvatar} circle size="md" className="md:size-14 ring-2 ring-black/5 dark:ring-white/5" />
                    {conv.unreadCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 md:h-6 md:w-6 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black text-white shadow-lg ring-2 ring-white dark:ring-[#0A0A0A]">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="truncate text-sm md:text-base font-black tracking-tight">{conv.customerName}</h3>
                      <span className="text-[10px] font-bold opacity-30 whitespace-nowrap">{formatTime(conv.lastMessageTime)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-md text-[8px] font-black uppercase tracking-widest">
                        Order #{formatOrderID(conv.order?.OrderID || conv.orderId)}
                      </span>
                    </div>

                    <p className="truncate text-xs font-medium opacity-50 group-hover:opacity-80 transition-opacity">
                      {conv.lastMessage}
                    </p>
                  </div>

                  {/* Action Section */}
                  <div className="flex items-center gap-4">
                    <div className="hidden md:flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-all">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </div>
                </Link>
              ))}

              {filteredConversations.length === 0 && (
                <div className="py-24 text-center">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-black/5 dark:bg-white/5">
                     <svg className="h-10 w-10 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  </div>
                  <h3 className="text-xl font-black opacity-30 uppercase tracking-[0.2em]">No conversations found</h3>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ShopperLayout>
  );
}
