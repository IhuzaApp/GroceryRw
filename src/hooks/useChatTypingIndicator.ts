import { useState, useEffect, useRef, useCallback } from "react";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";

const TYPING_STALE_MS = 5000;
const STOP_TYPING_DEBOUNCE_MS = 2000;
const START_TYPING_DEBOUNCE_MS = 300;

export interface UseChatTypingIndicatorOptions {
  conversationId: string | null;
  currentUserId: string;
  currentUserName: string;
  enabled?: boolean;
}

/**
 * Hook to manage "is typing" indicator for a chat conversation.
 * - Call reportTyping() on input change (debounced) to mark current user as typing.
 * - otherTypingName is set when the other party has a recent typing heartbeat.
 */
export function useChatTypingIndicator({
  conversationId,
  currentUserId,
  currentUserName,
  enabled = true,
}: UseChatTypingIndicatorOptions) {
  const [otherTypingName, setOtherTypingName] = useState<string | null>(null);
  const stopTypingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTypingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Listen for other users' typing in this conversation
  useEffect(() => {
    if (!enabled || !conversationId || !db) return;

    const typingRef = collection(db, "chat_conversations", conversationId, "typing");

    const unsubscribe = onSnapshot(typingRef, (snapshot) => {
      const now = Date.now();
      let name: string | null = null;

      snapshot.docs.forEach((d) => {
        if (d.id === currentUserId) return; // ignore self
        const data = d.data();
        const updatedAt = data?.updatedAt;
        const ts =
          updatedAt instanceof Timestamp
            ? updatedAt.toMillis()
            : updatedAt?.seconds != null
              ? updatedAt.seconds * 1000
              : 0;
        if (now - ts < TYPING_STALE_MS) {
          name = data?.userName ?? "Someone";
        }
      });

      setOtherTypingName(name);
    });

    return () => unsubscribe();
  }, [enabled, conversationId, currentUserId]);

  // Report that current user is typing (debounced start, and schedule stop after idle)
  const reportTyping = useCallback(() => {
    if (!enabled || !conversationId || !currentUserId || !db) return;

    const clearStopTimer = () => {
      if (stopTypingTimerRef.current) {
        clearTimeout(stopTypingTimerRef.current);
        stopTypingTimerRef.current = null;
      }
    };

    const clearStartTimer = () => {
      if (startTypingTimerRef.current) {
        clearTimeout(startTypingTimerRef.current);
        startTypingTimerRef.current = null;
      }
    };

    clearStopTimer();

    const doSetTyping = () => {
      const ref = doc(db, "chat_conversations", conversationId, "typing", currentUserId);
      setDoc(ref, {
        userId: currentUserId,
        userName: currentUserName,
        updatedAt: serverTimestamp(),
      }).catch(() => {});
    };

    // Debounce start: set typing after a short delay so we don't write on every keystroke
    if (!startTypingTimerRef.current) {
      startTypingTimerRef.current = setTimeout(() => {
        startTypingTimerRef.current = null;
        doSetTyping();
      }, START_TYPING_DEBOUNCE_MS);
    }

    // Schedule stop after idle
    stopTypingTimerRef.current = setTimeout(() => {
      stopTypingTimerRef.current = null;
      clearStartTimer();
      const ref = doc(db, "chat_conversations", conversationId, "typing", currentUserId);
      deleteDoc(ref).catch(() => {});
    }, STOP_TYPING_DEBOUNCE_MS);
  }, [enabled, conversationId, currentUserId, currentUserName]);

  // Call when input blurs or conversation closes to clear typing immediately
  const clearTyping = useCallback(() => {
    if (stopTypingTimerRef.current) {
      clearTimeout(stopTypingTimerRef.current);
      stopTypingTimerRef.current = null;
    }
    if (startTypingTimerRef.current) {
      clearTimeout(startTypingTimerRef.current);
      startTypingTimerRef.current = null;
    }
    if (enabled && conversationId && currentUserId && db) {
      const ref = doc(db, "chat_conversations", conversationId, "typing", currentUserId);
      deleteDoc(ref).catch(() => {});
    }
  }, [enabled, conversationId, currentUserId]);

  return { otherTypingName, reportTyping, clearTyping };
}
