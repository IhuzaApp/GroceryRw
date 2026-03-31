import React, { useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import AddMoneyModal from "./AddMoneyModal";
import { useHideBottomBar } from "../../context/HideBottomBarContext";
import CryptoJS from "crypto-js";
import { formatCurrencySync } from "../../utils/formatCurrency";
import { authenticatedFetch } from "../../lib/authenticatedFetch";

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
  const { setHideBottomBar } = useHideBottomBar();

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
      <div className="mb-4 mt-3 flex items-center justify-between">
        <h3 className="text-lg font-bold">Your Wallet</h3>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Purple Refund Card */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-gray-600 to-gray-800 p-5 text-white shadow-lg [&_h1]:!text-white [&_h2]:!text-white [&_h3]:!text-white [&_h4]:!text-white [&_h5]:!text-white [&_h6]:!text-white [&_p]:!text-white [&_span]:!text-white">
          <div className="absolute right-0 top-0 -mr-10 -mt-10 h-20 w-20 rounded-full bg-white opacity-5"></div>
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-16 w-16 rounded-full bg-white opacity-5"></div>

          <div className="mb-8 flex items-start justify-between">
            <div>
              <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest opacity-80">
                Wallet Balance
              </p>
              <h4 className="text-base font-black uppercase tracking-tight tracking-tighter">
                My Wallet
              </h4>
            </div>
            <div className="flex items-center">
              <div className="mr-1 h-5 w-8 rounded-sm bg-yellow-400"></div>
              <div className="h-5 w-8 rounded-sm bg-yellow-500 opacity-70"></div>
            </div>
          </div>

          <div className="mb-6">
            <div className="mb-1 flex items-center">
              <div className="mr-2 h-6 w-10 rounded-sm bg-opacity-30">
                <img
                  className="-mt-3 h-12 w-12"
                  src="/assets/images/chip.png"
                  alt=""
                />
              </div>
              <p className="font-mono text-base font-black tracking-wider">
                {formatCurrencySync(walletBalance)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest opacity-80">
                Last Updated
              </p>
              <p className="text-xs font-black">Today</p>
            </div>
            <div className="text-right">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-8 w-8 opacity-80"
              >
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <path d="M2 10h20" />
              </svg>
            </div>
          </div>

          {/* Add Money Button */}
          <div className="mt-4">
            <button
              onClick={() => setShowAddMoneyModal(true)}
              className="w-full rounded-lg border border-white/10 bg-white/20 px-4 py-2 text-xs font-black uppercase tracking-widest !text-white shadow-lg backdrop-blur-sm transition-all hover:scale-[1.02] hover:bg-white/30 active:scale-95"
            >
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Money
              </span>
            </button>
          </div>

          <div className="absolute bottom-3 right-3">
            <p className="text-xs font-bold uppercase opacity-70">
              PERSONAL USE ONLY
            </p>
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
      </div>
    </>
  );
}
