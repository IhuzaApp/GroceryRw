"use client";

import React from "react";
import { useFCMNotifications } from "../../hooks/useFCMNotifications";

export default function FCMStatusIndicator() {
  const { isInitialized, hasPermission } = useFCMNotifications();

  // Hide in production - notifications work silently
  return null;
}
