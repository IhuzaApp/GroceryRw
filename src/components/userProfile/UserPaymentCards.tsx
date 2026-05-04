import React, { useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import AddMoneyModal from "./AddMoneyModal";
import { useHideBottomBar } from "../../context/HideBottomBarContext";
import CryptoJS from "crypto-js";
import { formatCurrencySync } from "../../utils/formatCurrency";
import { authenticatedFetch } from "../../lib/authenticatedFetch";
import Barcode from "react-barcode";
import BarcodeScanner from "../shopper/BarcodeScanner";
import {
  Camera,
  Gift,
  Scissors,
  ShoppingCart,
  ArrowUpRight,
  Wallet,
} from "lucide-react";
import toast from "react-hot-toast";
import { useBusinessWallet } from "../../context/BusinessWalletContext";
import { RequestWithdrawModal } from "../business/RequestWithdrawModal";

// Encryption key - in production, this should be in environment variables
const ENCRYPTION_KEY =
  process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "your-secret-key";

// Types for our data
type RefundType = { amount: string; status: string };
type WalletType = {
  id: string;
  balance: string;
  user_id: string;
  created_at: string;
  updated_at: string;
} | null;
type BalancesType = {
  refunds: RefundType[];
  wallet: WalletType;
};

// Helper function to format RWF
const decryptData = (encryptedText: string) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Decryption error:", error);
    return "****";
  }
};

// Format card number to show only last 4 digits
const formatCardNumber = (encryptedNumber: string) => {
  try {
    const decrypted = decryptData(encryptedNumber);
    const lastFour = decrypted.slice(-4);
    return `**** **** **** ${lastFour}`;
  } catch (error) {
    return "**** **** **** ****";
  }
};

// This function is used for server-side rendering
// To use it, wrap the component with it in your page file
export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    // Get user session from cookies
    const { req } = context;

    // Fetch user data from API
    const userRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || ""}/api/user`,
      {
        headers: {
          cookie: req.headers.cookie || "",
        },
      }
    );
    const userData = await userRes.json();

    if (!userData.user?.id) {
      return {
        props: {
          initialData: {
            userId: null,
            balances: { refunds: [], wallet: null },
          },
        },
      };
    }

    // Fetch refunds
    const refundsRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || ""}/api/queries/refunds`,
      {
        headers: {
          cookie: req.headers.cookie || "",
        },
      }
    );
    const refundsData = await refundsRes.json();

    // Fetch personal wallet balance for all users
    let wallet = null;
    const walletRes = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL || ""
      }/api/queries/personal-wallet-balance`,
      {
        headers: {
          cookie: req.headers.cookie || "",
        },
      }
    );
    const walletData = await walletRes.json();
    wallet = walletData.wallet;

    // Fetch payment cards
    // Deleted by user

    return {
      props: {
        initialData: {
          userId: userData.user.id,
          balances: {
            refunds: refundsData.refunds || [],
            wallet,
          },
        },
      },
    };
  } catch (error) {
    console.error("Server-side fetch error:", error);
    return {
      props: {
        initialData: {
          userId: null,
          balances: { refunds: [], wallet: null },
          error: "Failed to load data",
        },
      },
    };
  }
};

type UserPaymentCardsProps = {
  initialData?: {
    userId: string | null;
    balances: BalancesType;
    error?: string;
  };
};

export default function UserPaymentCards({
  initialData,
}: UserPaymentCardsProps) {
  const [userId, setUserId] = useState<string | null>(
    initialData?.userId || null
  );
  const [loading, setLoading] = useState(
    initialData ? !initialData.userId : true
  );
  const [error, setError] = useState<string | null>(initialData?.error || null);
  const [userPhone, setUserPhone] = useState<string>("");
  const [balances, setBalances] = useState<BalancesType>(
    initialData?.balances || {
      refunds: [],
      wallet: null,
    }
  );
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // Business Wallet
  const {
    walletBalance: businessWalletBalance,
    businessWalletId,
    businessId,
    isLoading: isLoadingBusinessWallet,
    fetchWalletBalance: refreshBusinessWallet,
  } = useBusinessWallet();

  // Loyalty and Scanner state
  const [showScanner, setShowScanner] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);

  const { setHideBottomBar } = useHideBottomBar();

  const handleBarcodeDetected = (barcode: string) => {
    setScannedBarcode(barcode);
    toast.success(`Loyalty Card Digitized! Code: ${barcode}`);
    // Future: Save this code to the user's account in db
  };

  // Fetch user data if not provided by server-side props
  useEffect(() => {
    if (!initialData) {
      fetch("/api/user")
        .then((res) => res.json())
        .then((data) => {
          if (data.user?.id) {
            setUserId(data.user.id);
            setUserPhone(data.user.phone || "");
          }
        })
        .catch((err) => {
          console.error("Failed to load user:", err);
          setError("Failed to load user data");
        });
    }
  }, [initialData]);

  // Fallback to client-side fetching if server-side fails
  useEffect(() => {
    if (!userId) {
      fetch("/api/user")
        .then((res) => res.json())
        .then((data) => {
          if (data.user?.id) {
            setUserId(data.user.id);
            setUserPhone(data.user.phone || "");
          }
        })
        .catch((err) => {
          console.error("Failed to load user:", err);
          setError("Failed to load user data");
        });
    }
  }, [userId]);

  // Fetch balances client-side when userId is available but balances aren't
  useEffect(() => {
    // Skip if we already have data from server-side props
    if (
      (initialData?.balances?.refunds &&
        initialData.balances.refunds.length > 0) ||
      initialData?.balances?.wallet
    )
      return;

    if (!userId || balances.refunds.length > 0 || balances.wallet) return;

    setLoading(true);
    Promise.all([
      // Fetch refunds
      authenticatedFetch("/api/queries/refunds", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => res.json()),

      // Check if user is a shopper
      authenticatedFetch("/api/queries/check-shopper-status", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => res.json()),

      // Fetch payment cards - Deleted
    ])
      .then(([refundsData, shopperData]) => {
        const newBalances = {
          refunds: refundsData.refunds || [],
          wallet: null,
        };

        // Fetch personal wallet balance for all users
        return authenticatedFetch("/api/queries/personal-wallet-balance", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((res) => res.json())
          .then((walletData) => {
            newBalances.wallet = walletData.wallet;
            return newBalances;
          });
      })
      .then((newBalances) => {
        setBalances(newBalances);
        setError(null);
      })
      .catch((err) => {
        console.error("Error fetching balances:", err);
        setError("Failed to load balances");
      })
      .finally(() => setLoading(false));
  }, [userId, balances.refunds.length, balances.wallet, initialData]);

  // Calculate total refund amount
  const totalRefundAmount = balances.refunds.reduce(
    (sum: number, refund: { amount: string }) =>
      sum + parseFloat(refund.amount),
    0
  );

  // Get wallet balance
  const walletBalance =
    balances.wallet && balances.wallet.balance
      ? parseFloat(balances.wallet.balance)
      : 0;

  // Function to refresh wallet balance
  const refreshWalletBalance = async () => {
    try {
      const walletData = await authenticatedFetch(
        "/api/queries/personal-wallet-balance",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      ).then((res) => res.json());

      setBalances((prev) => ({
        ...prev,
        wallet: walletData.wallet,
      }));
    } catch (error) {
      console.error("Error refreshing wallet balance:", error);
    }
  };

  const handleRequestWithdraw = () => {
    if (!businessId) {
      toast.error("Business account not found");
      return;
    }
    if (!businessWalletId) {
      toast.error("Business wallet not found");
      return;
    }
    if (businessWalletBalance <= 0) {
      toast.error("No funds available to withdraw");
      return;
    }
    setShowWithdrawModal(true);
  };

  const handleSubmitWithdraw = async (payload: {
    amount: number;
    verificationImage: string;
    otp: string;
    password: string;
  }) => {
    if (!businessId || !businessWalletId) {
      throw new Error("Business or wallet not found");
    }
    const response = await fetch("/api/mutations/request-withdraw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: String(payload.amount),
        business_id: businessId,
        businessWallet_id: businessWalletId,
        phoneNumber: userPhone || "",
        verification_image: payload.verificationImage,
        otp: payload.otp,
        password: payload.password,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || "Failed to submit request");
    }
    refreshBusinessWallet();
  };

  // Refresh functions
  useEffect(() => {
    if (userId) {
      refreshWalletBalance();
    }
  }, [userId]);

  if (loading) {
    return (
      <>
        <h3 className="mb-4 mt-3 text-lg font-bold">Your Payment Cards</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Refund Card Skeleton */}
          <div className="relative animate-pulse overflow-hidden rounded-xl bg-gradient-to-r from-gray-200 to-gray-300 p-5 shadow-lg">
            <div className="mb-8 flex items-start justify-between">
              <div className="w-1/2">
                <div className="mb-1 h-3 w-20 rounded bg-gray-400"></div>
                <div className="h-4 w-32 rounded bg-gray-400"></div>
              </div>
              <div className="flex items-center">
                <div className="mr-1 h-5 w-8 rounded-sm bg-gray-400"></div>
                <div className="h-5 w-8 rounded-sm bg-gray-400"></div>
              </div>
            </div>

            <div className="mb-6">
              <div className="mb-1 flex items-center">
                <div className="mr-2 h-6 w-10 rounded-sm bg-gray-400"></div>
                <div className="h-6 w-24 rounded bg-gray-400"></div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="mb-1 h-3 w-12 rounded bg-gray-400"></div>
                <div className="h-4 w-16 rounded bg-gray-400"></div>
              </div>
              <div>
                <div className="mb-1 h-3 w-16 rounded bg-gray-400"></div>
                <div className="h-4 w-12 rounded bg-gray-400"></div>
              </div>
              <div className="h-8 w-8 rounded bg-gray-400"></div>
            </div>
          </div>

          {/* Wallet Card Skeleton */}
          <div className="relative animate-pulse overflow-hidden rounded-xl bg-gradient-to-r from-green-100 to-green-200 p-5 shadow-lg">
            <div className="mb-8 flex items-start justify-between">
              <div className="w-1/2">
                <div className="mb-1 h-3 w-24 rounded bg-green-300"></div>
                <div className="h-4 w-32 rounded bg-green-300"></div>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-300"></div>
            </div>

            <div className="mb-6">
              <div className="mb-1 flex items-center">
                <div className="mr-2 h-6 w-10 rounded-sm bg-green-300"></div>
                <div className="h-6 w-28 rounded bg-green-300"></div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="mb-1 h-3 w-12 rounded bg-green-300"></div>
                <div className="h-4 w-16 rounded bg-green-300"></div>
              </div>
              <div>
                <div className="mb-1 h-3 w-16 rounded bg-green-300"></div>
                <div className="h-4 w-12 rounded bg-green-300"></div>
              </div>
              <div className="h-8 w-8 rounded bg-green-300"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return <div>Error loading balances</div>;
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white">
            My Wallet
          </h3>
          <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
            Manage your personal funds and balances.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Premium Dark-Green Accent Wallet Card */}
        <div className="group relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6 text-white shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.3)]">
          {/* Glassmorphic overlay effects */}
          <div className="absolute right-0 top-0 -mr-16 -mt-16 h-40 w-40 rounded-full bg-green-500 opacity-10 blur-3xl transition-all duration-500 group-hover:scale-150 group-hover:bg-green-400 group-hover:opacity-20"></div>
          <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-32 w-32 rounded-full bg-emerald-500 opacity-10 blur-2xl transition-all duration-500 group-hover:opacity-20"></div>

          {/* Top Row: Master/Visa logo equivalent using Green instead of Yellow */}
          <div className="relative z-10 mb-8 flex items-center justify-between">
            <div>
              <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                Current Balance
              </p>
              <h4 className="text-sm font-bold tracking-widest text-gray-300">
                PLAS PAY
              </h4>
            </div>
            {/* Green interlocking shapes replacing yellow */}
            <div className="flex items-center">
              <div className="relative z-20 h-6 w-6 rounded-full bg-green-400 opacity-90 mix-blend-screen shadow-[0_0_10px_rgba(74,222,128,0.5)]"></div>
              <div className="relative z-10 -ml-3 h-6 w-6 rounded-full bg-emerald-500 opacity-90 mix-blend-screen shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
            </div>
          </div>

          {/* Balance Row */}
          <div className="relative z-10 mb-8 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/5 bg-white/10 shadow-inner backdrop-blur-md">
              <img
                className="h-8 w-8 object-contain opacity-90 drop-shadow-md filter"
                src="/assets/images/chip.png"
                alt="Chip"
              />
            </div>
            <p className="font-mono text-3xl font-black tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              {formatCurrencySync(walletBalance)}
            </p>
          </div>

          {/* Bottom Row */}
          <div className="relative z-10 flex items-end justify-between">
            <div>
              <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                Status
              </p>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                </span>
                <p className="text-xs font-extrabold uppercase tracking-widest text-green-400">
                  Active
                </p>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => setShowAddMoneyModal(true)}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all hover:scale-105 hover:from-green-400 hover:to-emerald-500 hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] active:scale-95"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Top Up
            </button>
          </div>
        </div>

        {/* Add Money Modal */}
        <AddMoneyModal
          isOpen={showAddMoneyModal}
          onClose={() => {
            setShowAddMoneyModal(false);
            setHideBottomBar(false);
          }}
          onSuccess={refreshWalletBalance}
          currentBalance={walletBalance}
          walletId={balances.wallet?.id}
          initialPhoneNumber={userPhone}
        />

        {/* Business Wallet Card (Premium Emerald Design) - Show only if exists */}
        {businessWalletId && (
          <div className="group relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6 shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.3)]">
            {/* Glassmorphic overlay effects */}
            <div className="absolute right-0 top-0 -mr-16 -mt-16 h-40 w-40 rounded-full bg-emerald-500 opacity-10 blur-3xl transition-all duration-500 group-hover:scale-150 group-hover:bg-emerald-400 group-hover:opacity-20"></div>
            <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-32 w-32 rounded-full bg-green-500 opacity-10 blur-2xl transition-all duration-500 group-hover:opacity-20"></div>

            {/* Card Content */}
            <div className="relative z-10">
              {/* Card Header */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-12 rounded bg-gradient-to-br from-green-400 to-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.3)]"></div>
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
                    Premium
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="relative z-20 h-6 w-6 rounded-full bg-emerald-400 opacity-90 mix-blend-screen shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                  <div className="relative z-10 -ml-3 h-6 w-6 rounded-full bg-green-500 opacity-90 mix-blend-screen shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                </div>
              </div>

              {/* Chip */}
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-10 w-14 items-center justify-center rounded-xl border border-white/10 bg-white/5 shadow-inner backdrop-blur-md">
                  <img
                    className="h-6 w-6 object-contain opacity-80"
                    src="/assets/images/chip.png"
                    alt="Chip"
                  />
                </div>
                <div className="flex-1">
                  <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                    Available Balance
                  </p>
                  <p className="font-mono text-3xl font-black tracking-tight text-white drop-shadow-md">
                    {isLoadingBusinessWallet ? (
                      <span className="text-xl text-gray-400">Loading...</span>
                    ) : (
                      formatCurrencySync(businessWalletBalance)
                    )}
                  </p>
                </div>
              </div>

              {/* Card Number Pattern */}
              <div className="mb-4 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.5)]"></div>
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.5)]"></div>
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.5)]"></div>
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.5)]"></div>
                <span className="mx-2 text-emerald-500/50">•</span>
                <span className="mx-2 text-emerald-500/50">•</span>
                <span className="mx-2 text-emerald-500/50">•</span>
                <span className="mx-2 text-emerald-500/50">•</span>
                <span className="mx-2 text-emerald-500/50">•</span>
                <span className="mx-2 text-emerald-500/50">•</span>
                <span className="mx-2 text-emerald-500/50">•</span>
                <span className="mx-2 text-emerald-500/50">•</span>
                <span className="ml-auto font-mono text-xs font-bold tracking-widest text-emerald-400">
                  BUSINESS
                </span>
              </div>

              {/* Card Footer */}
              <div className="mt-6 flex items-end justify-between">
                <div>
                  <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                    Card Holder
                  </p>
                  <p className="text-sm font-bold tracking-wide text-gray-200">
                    Business Account
                  </p>
                </div>
                <button
                  onClick={handleRequestWithdraw}
                  disabled={
                    businessWalletBalance <= 0 || isLoadingBusinessWallet
                  }
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-5 py-2 text-xs font-black uppercase tracking-widest text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all hover:scale-105 hover:from-emerald-400 hover:to-green-500 hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] active:scale-95 disabled:pointer-events-none disabled:opacity-50"
                >
                  <ArrowUpRight className="h-4 w-4" />
                  Withdraw
                </button>
              </div>
            </div>
          </div>
        )}

        <RequestWithdrawModal
          isOpen={showWithdrawModal}
          onClose={() => setShowWithdrawModal(false)}
          walletBalance={businessWalletBalance}
          onSubmit={handleSubmitWithdraw}
        />
      </div>

      {/* =========================================================
                             LOYALTY CARDS SECTION
          ========================================================= */}
      <div className="mb-6 mt-12 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white">
            Loyalty & Rewards
          </h3>
          <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
            Digital punch cards and store memberships
          </p>
        </div>
        <button
          disabled
          onClick={() => setShowScanner(true)}
          className="flex cursor-not-allowed items-center gap-2 rounded-xl bg-purple-100 px-4 py-2 text-xs font-bold text-purple-700 opacity-50 transition-colors dark:bg-purple-900/30 dark:text-purple-400"
        >
          <Camera size={16} />
          Scan Card
        </button>
      </div>

      <div className="relative pb-24">
        {/* 'Coming Soon' Overlay */}
        <div className="absolute left-0 top-0 z-20 flex h-full w-full items-center justify-center rounded-[2rem] bg-white/40 backdrop-blur-sm dark:bg-black/40">
          <div className="rounded-2xl border border-white/30 bg-black/60 px-8 py-4 shadow-2xl backdrop-blur-md">
            <h2 className="text-xl font-black uppercase tracking-[0.3em] text-white">
              Launching Soon
            </h2>
          </div>
        </div>

        <div className="pointer-events-none grid grid-cols-1 gap-6 opacity-60 blur-[2px] blur-sm filter transition-all sm:grid-cols-2">
          {/* Default Mock: The Stamp Loyalty Card (Fashion Shop) */}
          <div className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-pink-500 to-rose-600 p-6 text-white shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
                  PUNCH CARD
                </p>
                <h4 className="flex items-center gap-2 text-lg font-bold tracking-widest text-white">
                  <Scissors size={20} />
                  KIGALI FASHION
                </h4>
              </div>
              <div className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-md">
                7 / 10
              </div>
            </div>

            <div className="mb-4">
              <p className="mb-3 text-xs font-medium opacity-90">
                Buy 10 items, get 1 FREE!
              </p>
              <div className="grid grid-cols-5 gap-3">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/30 backdrop-blur-sm transition-all ${
                      i < 7
                        ? "bg-white text-rose-500 shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                        : "bg-transparent text-white/20"
                    }`}
                  >
                    <Gift size={20} className={i < 7 ? "" : "hidden"} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Default Mock: The Barcode Loyalty Card (Supermarket) */}
          <div className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-blue-600 to-indigo-800 p-6 text-white shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl">
            {/* Abstract circles */}
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white opacity-10 blur-xl"></div>

            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
                  MEMBERSHIP
                </p>
                <h4 className="flex items-center gap-2 text-lg font-bold tracking-wide text-white">
                  <ShoppingCart size={20} />
                  SIMBA SUPERMARKET
                </h4>
              </div>
            </div>

            <div className="rounded-xl bg-white p-4 text-center shadow-inner">
              <div className="mx-auto flex justify-center overflow-hidden">
                <div className="mix-blend-multiply">
                  <Barcode
                    value={scannedBarcode || "SM-9048-2831"}
                    width={2}
                    height={50}
                    background="transparent"
                    lineColor="#1e3a8a"
                    displayValue={true}
                    fontSize={14}
                    margin={0}
                  />
                </div>
              </div>
              <p className="mt-2 text-[10px] font-bold text-gray-400">
                Cashier: Scan at checkout
              </p>
            </div>
          </div>
        </div>
      </div>

      {showScanner && (
        <BarcodeScanner
          onBarcodeDetected={handleBarcodeDetected}
          onClose={() => setShowScanner(false)}
        />
      )}
    </>
  );
}
