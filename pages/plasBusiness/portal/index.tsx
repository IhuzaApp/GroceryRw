"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import RootLayout from "../../../src/components/ui/layout";
import { useAuth } from "../../../src/context/AuthContext";
import PlasBusinessGuestView from "../../../src/components/business/PlasBusinessGuestView";
import { PortalSkeleton } from "../../../src/components/business/PortalSkeleton";
import { useTheme } from "../../../src/context/ThemeContext";
import { DesktopPortal } from "../../../src/components/business/DesktopPortal";
import { MobilePortal } from "../../../src/components/business/MobilePortal";
import QuoteDetailsModal from "../quote-details-modal";
import { CreateRFQForm } from "../../../src/components/business/CreateRFQForm";
import { ContractDetailDrawer } from "../../../src/components/business/ContractDetailDrawer";
import { getOrCreateBusinessConversation } from "../../../src/services/chatService";
import toast from "react-hot-toast";

export default function PlasBusinessPage() {
  const { role, isLoggedIn, authReady } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isCreateRFQOpen, setIsCreateRFQOpen] = useState(false);
  const [hasBusinessAccount, setHasBusinessAccount] = useState<boolean | null>(
    null
  );
  const [checkingAccount, setCheckingAccount] = useState(true);
  const [businessAccount, setBusinessAccount] = useState<any>(null);
  const [rfqCreated, setRfqCreated] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [isContractDrawerOpen, setIsContractDrawerOpen] = useState(false);

  // Redirect shoppers away from this page
  useEffect(() => {
    if (authReady && isLoggedIn && role === "shopper") {
      router.push("/Plasa");
    }
  }, [role, isLoggedIn, authReady, router]);

  // Check if user has business account
  useEffect(() => {
    if (authReady && isLoggedIn && role !== "shopper") {
      checkBusinessAccount();
    }
  }, [authReady, isLoggedIn, role]);

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

  const handleAccountCreated = () => {
    setHasBusinessAccount(true);
    checkBusinessAccount();
  };

  const handleMessageSupplier = async (
    supplierId: string,
    rfqId?: string,
    title?: string
  ) => {
    if (!businessAccount?.id) {
      toast.error("Please ensure your business account is fully set up");
      return;
    }

    try {
      const conversationId = await getOrCreateBusinessConversation(
        businessAccount.id,
        supplierId,
        rfqId,
        title
      );
      router.push(
        `/Messages?conversationId=${conversationId}&collection=business_conversations`
      );
    } catch (error) {
      console.error("Error starting business conversation:", error);
      toast.error("Failed to start conversation. Please try again.");
    }
  };

  const handleRFQSubmit = async (rfqData: any) => {
    setRfqCreated((prev: boolean) => !prev);
  };

  const handleAcceptQuote = (quoteId: string) => {
    setIsQuoteModalOpen(false);
    toast.success("Quote accepted successfully!");
  };

  const handleRejectQuote = (quoteId: string) => {
    setIsQuoteModalOpen(false);
  };

  // Show loading while auth is being determined
  if (!authReady || (isLoggedIn && checkingAccount)) {
    return (
      <RootLayout>
        <div className="min-h-screen bg-[var(--bg-primary)] md:ml-16">
          <div className="max-w-8xl container mx-auto">
            <PortalSkeleton />
          </div>
        </div>
      </RootLayout>
    );
  }

  // Redirect to login if not authenticated
  if (!isLoggedIn) {
    router.replace("/Auth/Login");
    return null;
  }

  // Don't render for shoppers
  if (role === "shopper") {
    return null;
  }

  // Show guest view if user doesn't have business account
  if (!hasBusinessAccount) {
    return (
      <RootLayout>
        <PlasBusinessGuestView onAccountCreated={handleAccountCreated} />
      </RootLayout>
    );
  }

  return (
    <RootLayout>
      <div className="min-h-screen bg-[var(--bg-primary)]">
        {/* Desktop View */}
        <div className="hidden md:block md:ml-16">
          <div className="max-w-8xl container mx-auto px-4 py-8">
            <DesktopPortal
              selectedQuote={selectedQuote}
              setSelectedQuote={setSelectedQuote}
              isQuoteModalOpen={isQuoteModalOpen}
              setIsQuoteModalOpen={setIsQuoteModalOpen}
              isCreateRFQOpen={isCreateRFQOpen}
              setIsCreateRFQOpen={setIsCreateRFQOpen}
              router={router}
              businessAccount={businessAccount}
              rfqCreated={rfqCreated}
              setRfqCreated={setRfqCreated}
              setSelectedContractId={setSelectedContractId}
              setIsContractDrawerOpen={setIsContractDrawerOpen}
            />
          </div>
        </div>

        {/* Mobile View */}
        <div className="md:hidden min-h-screen pb-24 relative overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
            <img 
              src="/assets/images/auth/login_bg.png" 
              className="w-full h-full object-cover" 
              alt="" 
            />
          </div>
          
          <MobilePortal
            selectedQuote={selectedQuote}
            setSelectedQuote={setSelectedQuote}
            isQuoteModalOpen={isQuoteModalOpen}
            setIsQuoteModalOpen={setIsQuoteModalOpen}
            isCreateRFQOpen={isCreateRFQOpen}
            setIsCreateRFQOpen={setIsCreateRFQOpen}
            router={router}
            businessAccount={businessAccount}
            rfqCreated={rfqCreated}
            setRfqCreated={setRfqCreated}
            theme={theme}
            setSelectedContractId={setSelectedContractId}
            setIsContractDrawerOpen={setIsContractDrawerOpen}
          />
        </div>
      </div>

      <QuoteDetailsModal
        quote={selectedQuote}
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        onAccept={handleAcceptQuote}
        onReject={handleRejectQuote}
        onMessage={handleMessageSupplier}
      />

      <CreateRFQForm
        isOpen={isCreateRFQOpen}
        onClose={() => setIsCreateRFQOpen(false)}
        onSubmit={handleRFQSubmit}
        businessAccount={businessAccount}
      />

      <ContractDetailDrawer
        isOpen={isContractDrawerOpen}
        onClose={() => {
          setIsContractDrawerOpen(false);
          setSelectedContractId(null);
        }}
        contractId={selectedContractId}
        businessAccount={businessAccount}
      />
    </RootLayout>
  );
}
