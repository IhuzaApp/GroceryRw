import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useAuth } from "../../hooks/useAuth";
import AIChatButton from "./AIChatButton";
import AIChatWindow from "./AIChatWindow";
import { useHideBottomBar } from "../../context/HideBottomBarContext";

export default function AIChatProvider() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const { isGuest } = useAuth();
  const { hideFloatingUI } = useHideBottomBar();

  const isStoreOrCheckout =
    router.pathname === "/stores/[id]" ||
    router.pathname === "/stores/[id]/checkout" ||
    router.pathname === "/Myprofile" ||
    router.pathname === "/plasBusiness/store/[storeId]";

  const hideOnMobile = isStoreOrCheckout || hideFloatingUI;

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
  };

  // Close chat on escape key (hook must run unconditionally)
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // Don't show AI chat for logged-out users or guests (after all hooks)
  if (!session?.user || isGuest) {
    return null;
  }

  return (
    <>
      <AIChatButton onClick={toggleChat} hideOnMobile={hideOnMobile} />
      <AIChatWindow isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
