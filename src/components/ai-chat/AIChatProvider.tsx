import React, { useState, useEffect } from "react";
import AIChatButton from "./AIChatButton";
import AIChatWindow from "./AIChatWindow";

export default function AIChatProvider() {
  const [isOpen, setIsOpen] = useState(false);

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
