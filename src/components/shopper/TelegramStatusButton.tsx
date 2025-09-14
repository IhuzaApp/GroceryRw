"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "rsuite";
import { authenticatedFetch } from "@lib/authenticatedFetch";

interface Shopper {
  id: string;
  user_id: string;
  full_name: string;
  telegram_id: string | null;
  status: string;
}

interface TelegramStatusButtonProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "outline" | "ghost";
  showIcon?: boolean;
}

export default function TelegramStatusButton({
  className = "",
  size = "md",
  variant = "primary",
  showIcon = true,
}: TelegramStatusButtonProps) {
  const { data: session } = useSession();
  const [shopper, setShopper] = useState<Shopper | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Get user ID from session
  const userId = session?.user?.id;

  // Fetch shopper details
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchShopperDetails = async () => {
      try {
        const response = await authenticatedFetch("/api/telegram/bot-update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "get_by_user_id",
            userId: userId,
          }),
        });

        const result = await response.json();

        if (result.success && result.shopper) {
          setShopper(result.shopper);
        } else {
          setShopper(null);
        }
      } catch (error) {
        console.error("Error fetching shopper details:", error);
        setShopper(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShopperDetails();
  }, [userId]);

  const handleTelegramConnect = async () => {
    if (!userId) {
      console.error("No user ID available");
      return;
    }

    setIsConnecting(true);

    try {
      // First, ensure the shopper record exists and get the shopper ID
      const response = await authenticatedFetch(
        "/api/telegram/ensure-shopper",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userId,
          }),
        }
      );

      const result = await response.json();

      if (result.success && result.shopper) {
        const shopperId = result.shopper.id;

        // Create Telegram bot deep link with the shopper ID
        const telegramBotLink = `https://t.me/PlaseraBot?start=${shopperId}`;

        // Open Telegram bot link in new tab
        window.open(telegramBotLink, "_blank", "noopener,noreferrer");

        console.log(
          `✅ Telegram connection initiated for shopper: ${shopperId}`
        );
      } else {
        console.error("Failed to ensure shopper record:", result.error);
        alert("Failed to connect Telegram. Please try again.");
      }
    } catch (error) {
      console.error("Error connecting to Telegram:", error);
      alert("Error connecting to Telegram. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleTelegramDisconnect = async () => {
    if (!shopper) return;

    setIsDisconnecting(true);

    try {
      const response = await authenticatedFetch("/api/telegram/bot-update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "remove_telegram_id",
          shopperId: shopper.id,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setShopper((prev) => (prev ? { ...prev, telegram_id: null } : null));
        console.log("✅ Telegram disconnected successfully");
      } else {
        console.error("Failed to disconnect Telegram:", result.error);
        alert("Failed to disconnect Telegram. Please try again.");
      }
    } catch (error) {
      console.error("Error disconnecting from Telegram:", error);
      alert("Error disconnecting from Telegram. Please try again.");
    } finally {
      setIsDisconnecting(false);
    }
  };

  // Determine button appearance based on variant
  const getButtonAppearance = () => {
    switch (variant) {
      case "outline":
        return "ghost";
      case "ghost":
        return "subtle";
      default:
        return "primary";
    }
  };

  // Determine button size classes
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "px-2 py-1 text-sm";
      case "lg":
        return "px-4 py-3 text-lg";
      default:
        return "px-3 py-2";
    }
  };

  // Determine icon size
  const getIconSize = () => {
    switch (size) {
      case "sm":
        return "h-4 w-4";
      case "lg":
        return "h-6 w-6";
      default:
        return "h-5 w-5";
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <Button
        appearance={getButtonAppearance()}
        disabled
        loading
        className={`flex items-center rounded-md ${getSizeClasses()} ${className}`}
      >
        {showIcon && (
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={`mr-2 ${getIconSize()}`}
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06-.01.13-.02.2z" />
          </svg>
        )}
        Loading...
      </Button>
    );
  }

  // Show connected state
  if (shopper?.telegram_id) {
    return (
      <Button
        appearance="ghost"
        onClick={handleTelegramDisconnect}
        disabled={isDisconnecting}
        loading={isDisconnecting}
        className={`flex items-center rounded-md ${getSizeClasses()} text-green-600 hover:text-green-700 ${className}`}
      >
        {showIcon && (
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={`mr-2 ${getIconSize()}`}
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06-.01.13-.02.2z" />
          </svg>
        )}
        {isDisconnecting ? "Disconnecting..." : "Connected"}
      </Button>
    );
  }

  // Show disconnected state (connect button)
  return (
    <Button
      appearance={getButtonAppearance()}
      onClick={handleTelegramConnect}
      disabled={!userId || isConnecting}
      loading={isConnecting}
      className={`flex items-center rounded-md ${getSizeClasses()} ${className}`}
    >
      {showIcon && (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`mr-2 ${getIconSize()}`}
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06-.01.13-.02.2z" />
        </svg>
      )}
      {isConnecting ? "Connecting..." : "Connect Telegram"}
    </Button>
  );
}