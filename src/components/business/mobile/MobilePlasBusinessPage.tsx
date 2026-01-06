"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../../context/AuthContext";
import { MobileServiceList } from "./MobileServiceList";
import { MobileBusinessDashboard } from "./MobileBusinessDashboard";
import { MobileServiceDetail } from "./MobileServiceDetail";
import { MobilePlasBusinessExplorer } from "./MobilePlasBusinessExplorer";

type View = "list" | "dashboard" | "detail";

interface MobilePlasBusinessPageProps {
  initialView?: View;
  serviceId?: string;
}

export function MobilePlasBusinessPage({
  initialView = "list",
  serviceId,
}: MobilePlasBusinessPageProps) {
  const router = useRouter();
  const { isLoggedIn, user, authReady } = useAuth();
  const [currentView, setCurrentView] = useState<View>(initialView);
  const [selectedServiceId, setSelectedServiceId] = useState<
    string | undefined
  >(serviceId);
  const [hasBusinessAccount, setHasBusinessAccount] = useState<boolean | null>(
    null
  );
  const [checkingAccount, setCheckingAccount] = useState(true);
  const [businessAccount, setBusinessAccount] = useState<any>(null);

  // Check if user has business account
  useEffect(() => {
    if (authReady && isLoggedIn) {
      checkBusinessAccount();
    } else if (authReady && !isLoggedIn) {
      setHasBusinessAccount(false);
      setCheckingAccount(false);
    }
  }, [authReady, isLoggedIn]);

  const checkBusinessAccount = async () => {
    try {
      const response = await fetch("/api/queries/check-business-account");
      if (response.ok) {
        const data = await response.json();
        setHasBusinessAccount(data.hasAccount);
        setBusinessAccount(data.account);
      } else {
        setHasBusinessAccount(false);
        setBusinessAccount(null);
      }
    } catch (error) {
      setHasBusinessAccount(false);
      setBusinessAccount(null);
    } finally {
      setCheckingAccount(false);
    }
  };

  const handleServiceClick = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setCurrentView("detail");
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedServiceId(undefined);
  };

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
  };

  // Determine which view to show based on URL params or account status
  useEffect(() => {
    if (!authReady || checkingAccount) return;

    const viewParam = router.query.view as string;
    if (viewParam === "list") {
      setCurrentView("list");
    } else if (viewParam === "dashboard") {
      setCurrentView("dashboard");
    } else if (initialView === "list") {
      // If user has business account, show dashboard by default
      // Otherwise, show service list
      if (hasBusinessAccount) {
        setCurrentView("dashboard");
      } else {
        setCurrentView("list");
      }
    }
  }, [
    hasBusinessAccount,
    initialView,
    router.query.view,
    authReady,
    checkingAccount,
  ]);

  // Show loading while checking account
  if (!authReady || checkingAccount) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-800">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Render based on current view
  if (currentView === "detail") {
    return (
      <MobileServiceDetail
        serviceId={selectedServiceId}
        onBack={hasBusinessAccount ? handleBackToDashboard : handleBackToList}
      />
    );
  }

  if (currentView === "dashboard" && hasBusinessAccount) {
    return (
      <MobileBusinessDashboard
        businessAccount={businessAccount}
        userName={user?.name || "User"}
        userProfilePicture={user?.profilePicture || undefined}
      />
    );
  }

  // Show explorer if user doesn't have business account
  if (!hasBusinessAccount) {
    return (
      <MobilePlasBusinessExplorer
        onAccountCreated={() => {
          checkBusinessAccount();
        }}
      />
    );
  }

  // Default: Show service list (accessible to everyone)
  return (
    <MobileServiceList
      onServiceClick={handleServiceClick}
      hasBusinessAccount={hasBusinessAccount || false}
    />
  );
}
