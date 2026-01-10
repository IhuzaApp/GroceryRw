import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAuth } from "../../hooks/useAuth";
import AIChatButton from "./AIChatButton";
import AIChatWindow from "./AIChatWindow";

export default function AIChatProvider() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const { isGuest } = useAuth();

  // Don't show AI chat for logged-out users or guests
  if (!session?.user || isGuest) {
    return null;
  }

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
  };

  // Close chat on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  return (
    <>
      <AIChatButton onClick={toggleChat} />
      <AIChatWindow isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
