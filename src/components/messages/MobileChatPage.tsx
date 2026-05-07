import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Avatar } from "rsuite";
import {
  collection,
  query,
  where,
  orderBy,
  addDoc,
  serverTimestamp,
  onSnapshot,
  Timestamp,
  doc,
  updateDoc,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { db, uploadToFirebase } from "../../lib/firebase";
import { toast } from "react-hot-toast";
import soundNotification from "../../utils/soundNotification";
import {
  containsBlockedPii,
  getBlockedMessage,
  sanitizeMessageForDisplay,
} from "../../lib/chatPiiBlock";
import { useChatTypingIndicator } from "../../hooks/useChatTypingIndicator";
import { useTheme } from "../../context/ThemeContext";
import { ChatCollection } from "../../services/chatService";
import { useShopperProfile } from "../../hooks/useShopperProfile";

// Helper to format time for messages
function formatMessageTime(timestamp: any) {
  if (!timestamp) return "";
  const date =
    timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Helper to group messages by date
function getDateLabel(timestamp: any) {
  if (!timestamp) return "";
  const date =
    timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

interface Message {
  id: string;
  text?: string;
  message?: string;
  senderId: string;
  senderType: "customer" | "shopper" | "business";
  recipientId?: string;
  timestamp: any;
  read?: boolean;
  image?: string;
}

interface PendingMessage {
  tempId: string;
  text: string;
  senderId: string;
  senderType: "customer" | "shopper" | "business";
  timestamp: Date;
  image?: string;
}

const CustomerMessage: React.FC<{
  message: Message | PendingMessage;
  isCurrentUser: boolean;
  counterpartName: string;
  counterpartImage?: string;
  customerImage?: string;
  statusLabel?: "Sending..." | "Sent" | null;
}> = ({ message, isCurrentUser, counterpartName, counterpartImage, customerImage, statusLabel }) => {
  const rawContent =
    "text" in message
      ? message.text
      : (message as Message).text || (message as Message).message || "";
  const messageContent = sanitizeMessageForDisplay(rawContent ?? "");

  return (
    <div
      className={`mb-3 flex items-end gap-2 ${isCurrentUser ? "flex-row-reverse" : "flex-row"}`}
    >
      <div className="relative flex-shrink-0 mb-1">
        <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 shadow-sm">
          {(() => {
            const avatarUrl = isCurrentUser ? customerImage : counterpartImage;
            const fallbackLetter = isCurrentUser ? "M" : (counterpartName?.charAt(0) || "C");
            
            if (avatarUrl && avatarUrl !== "/images/ProfileImage.png") {
              return <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />;
            }
            return <span className="text-[10px] font-bold text-gray-500 uppercase">{fallbackLetter}</span>;
          })()}
        </div>
      </div>
      <div
        className={`relative max-w-[85%] px-4 py-2 text-[15px] leading-relaxed shadow-sm transition-all ${
          isCurrentUser
            ? "rounded-2xl rounded-tr-sm bg-green-600 !text-white"
            : "rounded-2xl rounded-tl-sm bg-gray-700 !text-white"
        }`}
      >
        {"image" in message && message.image && (
          <div className="mb-2 overflow-hidden rounded-lg">
            <img
              src={message.image}
              alt="Attachment"
              className="h-auto w-full max-w-[200px]"
              onClick={() => window.open(message.image, "_blank")}
            />
          </div>
        )}
        <div className="whitespace-pre-wrap break-words font-normal !text-white">
          {messageContent}
        </div>
        <div className="mt-0.5 flex items-center justify-end gap-1">
          <span
            className={`select-none text-[11px] ${
              isCurrentUser ? "text-green-100" : "!text-white/70"
            }`}
          >
            {formatMessageTime(message.timestamp)}
          </span>
          {isCurrentUser && statusLabel && (
            <span className="select-none text-[11px] font-bold tracking-wide text-green-100">
              {statusLabel === "Sending..." ? (
                "..."
              ) : (
                <svg
                  className="h-3 w-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default function MobileChatPage({
  orderId,
  conversationId: providedConversationId,
  collectionPath = "chat_conversations",
  counterpart,
  currentUserImage,
  onBack,
}: {
  orderId?: string;
  conversationId?: string;
  collectionPath?: ChatCollection;
  counterpart: {
    id: string;
    name: string;
    avatar: string;
    role?: "shopper" | "business" | "customer";
    phone?: string;
  };
  currentUserImage?: string;
  onBack: () => void;
}) {
  const { data: session } = useSession();
  const { shopper } = useShopperProfile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [pendingMessages, setPendingMessages] = useState<PendingMessage[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [newMessage, setNewMessage] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(
    providedConversationId || null
  );
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [businessAccount, setBusinessAccount] = useState<any>(null);
  const [petVendor, setPetVendor] = useState<any>(null);
  const [logisticsAccount, setLogisticsAccount] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { otherTypingName, reportTyping, clearTyping } = useChatTypingIndicator(
    {
      conversationId,
      currentUserId: session?.user?.id ?? "",
      currentUserName: session?.user?.name ?? "Customer",
      enabled: !!conversationId && !!session?.user?.id,
    }
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch business accounts
  useEffect(() => {
    if (session?.user?.id) {
      // 1. Business Account
      fetch("/api/queries/check-business-account")
        .then((res) => res.json())
        .then((data) => {
          if (data.hasAccount) setBusinessAccount(data.account);
        })
        .catch((err) => console.error("Error fetching business account:", err));

      // 2. Pet Vendor
      fetch("/api/queries/check-pet-vendor")
        .then((res) => res.json())
        .then((data) => {
          if (data.hasAccount) setPetVendor(data.account);
        })
        .catch((err) => console.error("Error fetching pet vendor:", err));

      // 3. Logistics Account
      fetch("/api/queries/check-logistics-account")
        .then((res) => res.json())
        .then((data) => {
          if (data.hasAccount) setLogisticsAccount(data.account);
        })
        .catch((err) => console.error("Error fetching logistics account:", err));
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (
      !providedConversationId &&
      orderId &&
      session?.user?.id &&
      counterpart?.id
    ) {
      const getOrCreate = async () => {
        try {
          if (!db) return;
          const conversationsRef = collection(db!, "chat_conversations");
          const q = query(conversationsRef, where("orderId", "==", orderId));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            setConversationId(querySnapshot.docs[0].id);
          } else {
            const isShopper = shopper?.id && (shopper.id === counterpart.id || session.user.role === "shopper");
            const newConversation = {
              orderId,
              customerId: isShopper ? counterpart.id : session.user.id,
              shopperId: isShopper ? (shopper.id || session.user.id) : counterpart.id,
              createdAt: serverTimestamp(),
              lastMessage: "",
              lastMessageTime: serverTimestamp(),
              unreadCount: 0,
            };
            const d = await addDoc(conversationsRef, newConversation);
            setConversationId(d.id);
          }
        } catch (e) {
          console.error(e);
        }
      };
      getOrCreate();
    } else if (providedConversationId) {
      setConversationId(providedConversationId);
    }
  }, [providedConversationId, orderId, session?.user?.id, counterpart?.id, shopper?.id]);

  useEffect(() => {
    if (!db || !conversationId) return;
    const fetchConv = async () => {
      const docRef = doc(db!, collectionPath, conversationId!);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSelectedConversation({ id: docSnap.id, ...docSnap.data() });
      }
    };
    fetchConv();
  }, [db, conversationId, collectionPath]);

  useEffect(() => {
    if (!db || !conversationId || !session?.user?.id) return;

    const messagesRef = collection(
      db!,
      collectionPath,
      conversationId,
      "messages"
    );
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp:
          doc.data().timestamp instanceof Timestamp
            ? doc.data().timestamp.toDate()
            : doc.data().timestamp,
      })) as Message[];

      console.log(`🔍 [Mobile Chat] Received ${messagesList.length} messages:`, messagesList);
      if (messagesList.length > 0) {
        const last = messagesList[messagesList.length - 1];
        console.log(`🔍 [Mobile Chat] Latest message:`, {
          text: last.text || last.message,
          senderId: last.senderId,
          senderType: last.senderType,
          recipientId: last.recipientId,
          timestamp: last.timestamp
        });
      }

      setPendingMessages((prev) =>
        prev.filter(
          (p) =>
            !messagesList.some(
              (m) =>
                m.senderId === p.senderId &&
                ((p.text && (m.text === p.text || m.message === p.text)) ||
                  (p.image && m.image === p.image))
            )
        )
      );

      const oldLen = messages.length;
      if (messagesList.length > oldLen) {
        const last = messagesList[messagesList.length - 1];
        if (last.senderId !== session?.user?.id) soundNotification.play();
      }

      setMessages(messagesList);

      snapshot.docs.forEach((d) => {
        const m = d.data();
        if (m.senderId !== session?.user?.id && !m.read)
          updateDoc(d.ref, { read: true });
      });

      const convRef = doc(db!, collectionPath, conversationId!);
      getDoc(convRef).then((snap) => {
        if (snap.exists() && snap.data().unreadCount > 0)
          updateDoc(convRef, { unreadCount: 0 });
      });

      setTimeout(scrollToBottom, 100);
    });

    return () => unsubscribe();
  }, [conversationId, session?.user?.id, collectionPath, messages.length]);

  const displayMessages = React.useMemo(() => {
    const pendingsAsMsg: (Message | PendingMessage)[] = pendingMessages.map(
      (p) => ({ ...p, id: p.tempId, timestamp: p.timestamp })
    );
    const combined = [...messages, ...pendingsAsMsg];
    combined.sort((a, b) => {
      const getVal = (ts: any) => {
        if (ts instanceof Date) return ts.getTime();
        if (ts?.seconds) return ts.seconds * 1000;
        if (ts?.toDate) return ts.toDate().getTime();
        return Date.now(); // Treat as new if timestamp is missing/null
      };
      return getVal(a.timestamp) - getVal(b.timestamp);
    });
    return combined;
  }, [messages, pendingMessages]);

  const groupedMessages = React.useMemo(() => {
    const groups: Record<string, typeof displayMessages> = {};
    displayMessages.forEach((msg) => {
      const lbl = getDateLabel(msg.timestamp);
      if (!groups[lbl]) groups[lbl] = [];
      groups[lbl].push(msg);
    });
    return groups;
  }, [displayMessages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!db || !newMessage.trim() || !session?.user?.id || !conversationId || !counterpart?.id)
      return;

    const text = newMessage.trim();
    const piiCheck = containsBlockedPii(text, {
      senderId: session.user.id,
      senderName: session.user.name || "User",
      conversationId: conversationId!,
    });
    if (piiCheck.blocked && piiCheck.reason) {
      setError(getBlockedMessage(piiCheck.reason));
      return;
    }
    setError(null);

    const tempId = `temp-${Date.now()}`;
    const isMeCustomer = session.user.id === selectedConversation?.customerId;
    const isMeShopper =
      session.user.id === selectedConversation?.shopperId ||
      session.user.id === (selectedConversation as any)?.shopperUserId ||
      (shopper?.id && shopper.id === selectedConversation?.shopperId);

    const isMePetVendor =
      petVendor?.id && petVendor.id === selectedConversation?.counterpartId;
    const isMeCarVendor =
      logisticsAccount?.id &&
      logisticsAccount.id === selectedConversation?.counterpartId;
    const isMeBusinessVendor =
      businessAccount?.id &&
      businessAccount.id === selectedConversation?.counterpartId;

    const senderType = isMeCustomer
      ? "customer"
      : isMeShopper
      ? "shopper"
      : "business";

    let senderId = session.user.id;
    let senderName = session.user.name || "User";

    if (senderType === "shopper") {
      senderId = shopper?.id || session.user.id;
    } else if (senderType === "business") {
      if (isMePetVendor) {
        senderId = petVendor.id;
        senderName = petVendor.organisationName || petVendor.fullname;
      } else if (isMeCarVendor) {
        senderId = logisticsAccount.id;
        senderName = logisticsAccount.businessName || logisticsAccount.fullname;
      } else if (isMeBusinessVendor) {
        senderId = businessAccount.id;
        senderName = businessAccount.businessName;
      } else if (businessAccount?.id) {
        senderId = businessAccount.id;
        senderName = businessAccount.businessName;
      }
    }

    const recipientId = isMeCustomer
      ? selectedConversation.shopperId ||
        (selectedConversation as any).businessId ||
        selectedConversation.counterpartId
      : selectedConversation.customerId || selectedConversation.counterpartId;

    const recipientUserId = isMeCustomer
      ? (selectedConversation as any).vendorUserId ||
        (selectedConversation as any).shopperUserId ||
        selectedConversation.shopperId ||
        selectedConversation.counterpartId
      : selectedConversation.customerId || selectedConversation.counterpartId;

    setPendingMessages((p) => [
      ...p,
      {
        tempId,
        text,
        senderId,
        senderType,
        timestamp: new Date(),
      },
    ]);
    setNewMessage("");

    try {
      const messagesRef = collection(
        db!,
        collectionPath,
        conversationId!,
        "messages"
      );
      const messagePayload = {
        text,
        message: text,
        senderId,
        senderName,
        senderType,
        recipientId,
        timestamp: serverTimestamp(),
        read: false,
      };

      console.log("🔍 [Mobile Chat] Sending message:", messagePayload);

      await addDoc(messagesRef, messagePayload);

      const convRef = doc(db!, collectionPath, conversationId!);
      await updateDoc(convRef, {
        lastMessage: text,
        lastMessageTime: serverTimestamp(),
        unreadCount: 1,
      });

      await fetch("/api/fcm/send-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: recipientUserId,
          senderName,
          message: text,
          orderId,
          conversationId: conversationId!,
          collectionPath,
        }),
      });
    } catch (err) {
      setError("Error sending message. Please try again.");
      setPendingMessages((p) => p.filter((item) => item.tempId !== tempId));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col bg-[var(--bg-primary)]">
      {/* WhatsApp Style Header */}
      <div className="z-20 flex flex-shrink-0 items-center justify-between bg-[var(--bg-secondary)] px-2 py-2 shadow-sm transition-colors">
        <div
          className="flex flex-1 cursor-pointer items-center"
          onClick={onBack}
        >
          <button className="mr-1 rounded-full p-2 text-[var(--text-secondary)] transition-colors hover:bg-black/5 active:bg-black/10 dark:hover:bg-white/5 dark:active:bg-white/10">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-300 dark:bg-gray-600">
                {counterpart.avatar &&
                counterpart.avatar !== "/images/ProfileImage.png" ? (
                  <img
                    src={counterpart.avatar}
                    alt={counterpart.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-bold uppercase text-gray-500 dark:text-gray-300">
                    {counterpart.name.charAt(0)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-1 flex-col pl-1">
              <h3 className="truncate text-base font-medium text-[var(--text-primary)]">
                {counterpart.name}
              </h3>
              <span className="truncate text-xs text-[var(--text-secondary)]">
                {otherTypingName
                  ? "typing..."
                  : counterpart.role === "business"
                  ? "Business Account"
                  : "Online"}
              </span>
            </div>
          </div>
        </div>
        <div className="mx-2 flex items-center gap-1">
          {counterpart.phone && (
            <button
              onClick={() => window.open(`tel:${counterpart.phone}`, "_self")}
              className="rounded-full p-2.5 text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1 .45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*,application/pdf"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (
            !file ||
            !db ||
            !session?.user?.id ||
            !conversationId ||
            !counterpart?.id
          )
            return;

          const toastId = toast.loading("Uploading attachment...");
          setIsUploading(true);
          const tempId = `temp-img-${Date.now()}`;
          const localUrl = URL.createObjectURL(file);

          try {
            // Optimistic update
            setPendingMessages((p) => [
              ...p,
              {
                tempId,
                text: `Attachment: ${file.name}`,
                senderId: session.user.id,
                senderType:
                  counterpart.role === "business" ? "business" : "customer",
                timestamp: new Date(),
                image: localUrl,
              },
            ]);

            const path = `chats/${conversationId}/${Date.now()}_${file.name}`;
            const url = await uploadToFirebase(file, path);

            const messagesRef = collection(
              db,
              collectionPath,
              conversationId!,
              "messages"
            );

            await addDoc(messagesRef, {
              text: `Attachment: ${file.name}`,
              message: `Attachment: ${file.name}`,
              image: url,
              senderId: session.user.id,
              senderName: session.user.name || "User",
              senderType:
                counterpart.role === "business" ? "business" : "customer",
              recipientId: counterpart.id,
              timestamp: serverTimestamp(),
              read: false,
            });

            const convRef = doc(db!, collectionPath, conversationId!);
            await updateDoc(convRef, {
              lastMessage: "Attachment",
              lastMessageTime: serverTimestamp(),
              unreadCount: 1,
            });

            toast.success("Attachment sent", { id: toastId });
          } catch (err) {
            console.error("Upload error:", err);
            toast.error("Failed to upload attachment", { id: toastId });
            setPendingMessages((p) => p.filter((item) => item.tempId !== tempId));
          } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
            URL.revokeObjectURL(localUrl);
          }
        }}
      />

      <div className="relative flex-1 overflow-y-auto bg-[var(--bg-primary)] px-3 py-4 sm:px-4">
        {Object.entries(groupedMessages).map(([dateLabel, msgs]) => (
          <div key={dateLabel} className="mb-4">
            <div className="mb-3 flex justify-center">
              <span className="rounded-md bg-[var(--bg-secondary)] px-3 py-1 text-xs uppercase tracking-wide text-[var(--text-secondary)] shadow-sm">
                {dateLabel}
              </span>
            </div>
            {msgs.map((message) => (
              <CustomerMessage
                key={"tempId" in message ? message.tempId : message.id}
                message={message}
                isCurrentUser={[
                  session?.user?.id,
                  businessAccount?.id,
                  petVendor?.id,
                  logisticsAccount?.id,
                ].includes(message.senderId)}
                counterpartName={counterpart.name}
                counterpartImage={counterpart.avatar}
                customerImage={currentUserImage || session?.user?.image || undefined}
                statusLabel={"tempId" in message ? "Sending..." : "Sent"}
              />
            ))}
          </div>
        ))}
        {error && (
          <div className="mt-2 rounded-lg bg-red-500/10 px-4 py-2 text-center text-xs text-red-400">
            {error}
          </div>
        )}
        <div ref={messagesEndRef} className="pb-2" />
      </div>

      {/* Input Box */}
      <div className="z-10 flex flex-shrink-0 items-end gap-2 bg-[var(--bg-secondary)] p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] transition-colors">
        <div className="flex flex-1 items-end rounded-[24px] bg-[var(--bg-primary)]">
          <textarea
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              reportTyping();
            }}
            onBlur={clearTyping}
            onKeyDown={handleKeyPress}
            placeholder="Message"
            className="w-full resize-none bg-transparent px-4 py-[14px] text-[15px] font-normal text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none"
            rows={1}
            style={{ maxHeight: "100px" }}
          />
        </div>

        {newMessage.trim() ? (
          <button
            onClick={handleSendMessage}
            className="ml-1 flex items-center justify-center rounded-full bg-green-500 p-3 shadow-sm transition-transform active:scale-95"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        ) : (
          <button className="ml-1 flex items-center justify-center rounded-full p-3 text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.999 14.942c2.001 0 3.531-1.53 3.531-3.531V4.35c0-2.001-1.53-3.531-3.531-3.531S8.468 2.349 8.468 4.35v7.061c0 2.001 1.53 3.531 3.531 3.531zm6.238-3.53c0 3.531-2.942 6.002-6.237 6.002s-6.237-2.471-6.237-6.002H3.761c0 4.001 3.178 7.297 7.061 7.885v3.884h2.354v-3.884c3.884-.588 7.061-3.884 7.061-7.885h-2.001z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
