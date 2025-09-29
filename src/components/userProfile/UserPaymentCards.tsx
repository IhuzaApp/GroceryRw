import React, { useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import AddPaymentCard from "./AddPaymentCard";
import CryptoJS from "crypto-js";
import { formatCurrencySync } from "../../utils/formatCurrency";
import { authenticatedFetch } from "../../lib/authenticatedFetch";

// Encryption key - in production, this should be in environment variables
const ENCRYPTION_KEY =
  process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "your-secret-key";

// Types for our data
type RefundType = { amount: string; status: string };
type WalletType = {
  available_balance: string;
  reserved_balance: string;
} | null;
type PaymentCardType = {
  id: string;
  number: string;
  name: string;
  expiry_date: string;
  image: string | null;
  created_at: string;
};
type BalancesType = {
  refunds: RefundType[];
  wallet: WalletType;
  paymentCards: PaymentCardType[];
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
            balances: { refunds: [], wallet: null, paymentCards: [] },
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

    // Check if user is a shopper
    const shopperRes = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL || ""
      }/api/queries/check-shopper-status`,
      {
        headers: {
          cookie: req.headers.cookie || "",
        },
      }
    );
    const shopperData = await shopperRes.json();

    let wallet = null;

    // If user is a shopper, fetch their wallet balance
    if (shopperData.shopper?.active) {
      const walletRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || ""}/api/queries/wallet-balance`,
        {
          headers: {
            cookie: req.headers.cookie || "",
          },
        }
      );
      const walletData = await walletRes.json();
      wallet = walletData.wallet;
    }

    // Fetch payment cards
    const paymentCardsRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || ""}/api/queries/payment-cards`,
      {
        headers: {
          cookie: req.headers.cookie || "",
        },
      }
    );
    const paymentCardsData = await paymentCardsRes.json();

    return {
      props: {
        initialData: {
          userId: userData.user.id,
          balances: {
            refunds: refundsData.refunds || [],
            wallet,
            paymentCards: paymentCardsData.paymentCards || [],
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
          balances: { refunds: [], wallet: null, paymentCards: [] },
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
  const [balances, setBalances] = useState<BalancesType>(
    initialData?.balances || {
      refunds: [],
      wallet: null,
      paymentCards: [],
    }
  );
  const [showAddCard, setShowAddCard] = useState(false);

  // Fetch user data if not provided by server-side props
  useEffect(() => {
    if (!initialData) {
      fetch("/api/user")
        .then((res) => res.json())
        .then((data) => {
          if (data.user?.id) {
            setUserId(data.user.id);
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

      // Fetch payment cards
      authenticatedFetch("/api/queries/payment-cards", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => res.json()),
    ])
      .then(([refundsData, shopperData, paymentCardsData]) => {
        const newBalances = {
          refunds: refundsData.refunds || [],
          wallet: null,
          paymentCards: paymentCardsData.paymentCards || [],
        };

        // If user is a shopper, fetch their wallet balance
        if (shopperData.shopper?.active) {
          return authenticatedFetch("/api/queries/wallet-balance", {
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
        }
        return newBalances;
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
  const walletBalance = balances.wallet?.available_balance
    ? parseFloat(balances.wallet.available_balance)
    : 0;

  // Fetch payment cards
  const fetchPaymentCards = async () => {
    try {
      const response = await fetch("/api/queries/payment-cards");
      const data = await response.json();
      setBalances((prev) => ({
        ...prev,
        paymentCards: data.paymentCards || [],
      }));
    } catch (err) {
      console.error("Error fetching payment cards:", err);
    }
  };

  // Handle add card success
  const handleAddCardSuccess = () => {
    fetchPaymentCards();
    setShowAddCard(false);
  };

  useEffect(() => {
    if (userId) {
      fetchPaymentCards();
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
        <h3 className="text-lg font-bold">Your Payment Cards</h3>
        {balances.paymentCards.length > 0 && (
          <button
            onClick={() => setShowAddCard(true)}
            className="inline-flex items-center rounded-md bg-green-50 px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-100 dark:!bg-green-600 dark:!text-white dark:hover:!bg-green-700"
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            Update Card
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Purple Refund Card */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-gray-600 to-gray-800 p-5 text-white shadow-lg">
          <div className="absolute right-0 top-0 -mr-10 -mt-10 h-20 w-20 rounded-full bg-white opacity-5"></div>
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-16 w-16 rounded-full bg-white opacity-5"></div>

          <div className="mb-8 flex items-start justify-between">
            <div>
              <p className="mb-1 text-xs opacity-80">Refund Balance</p>
              <h4 className="font-bold">PENDING REFUNDS</h4>
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
              <p className="font-mono text-lg tracking-wider">
                {formatCurrencySync(totalRefundAmount)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-xs opacity-80">Status</p>
              <p className="font-medium">PENDING</p>
            </div>
            <div>
              <p className="mb-1 text-xs opacity-80">Last Updated</p>
              <p className="font-medium">Today</p>
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

          <div className="absolute bottom-3 right-3">
            <p className="text-xs font-bold opacity-70">REFUNDS ONLY</p>
          </div>
        </div>

        {/* Green Wallet Card - Only show for shoppers */}
        {balances.wallet && (
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-500 to-green-700 p-5 text-white shadow-lg">
            <div className="absolute right-0 top-0 -mr-10 -mt-10 h-20 w-20 rounded-full bg-white opacity-5"></div>
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-16 w-16 rounded-full bg-white opacity-5"></div>

            <div className="mb-8 flex items-start justify-between">
              <div>
                <p className="mb-1 text-xs opacity-80">Available Balance</p>
                <h4 className="font-bold">WALLET BALANCE</h4>
              </div>
              <div className="flex items-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-10 w-10 text-blue-600"
                >
                  <path d="M10 13.802l-3.38-3.38-1.42 1.42 4.8 4.8 9.19-9.19-1.41-1.41z" />
                  <path d="M19.03 7.39l.97-.97c.29-.29.29-.77 0-1.06l-1.06-1.06c-.29-.29-.77-.29-1.06 0l-.97.97 2.12 2.12z" />
                </svg>
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
                <p className="font-mono text-lg tracking-wider">
                  {formatCurrencySync(walletBalance)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-xs opacity-80">Status</p>
                <p className="font-medium">ACTIVE</p>
              </div>
              <div>
                <p className="mb-1 text-xs opacity-80">Last Updated</p>
                <p className="font-medium">Today</p>
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

            <div className="absolute bottom-3 right-3">
              <p className="text-xs font-bold opacity-70">AVAILABLE BALANCE</p>
            </div>
          </div>
        )}

        {/* Payment Cards */}
        {balances.paymentCards.map((card) => (
          <div
            key={card.id}
            className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-500 to-green-700 p-5 text-white shadow-lg transition-shadow duration-200 hover:shadow-xl"
          >
            <div className="absolute right-0 top-0 -mr-10 -mt-10 h-20 w-20 rounded-full bg-white opacity-5"></div>
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-16 w-16 rounded-full bg-white opacity-5"></div>

            <div className="mb-8 flex items-start justify-between">
              <div>
                <p className="mb-1 text-xs opacity-80">Payment Card</p>
                <h4 className="font-bold">{card.name}</h4>
              </div>
              {card.image ? (
                <img
                  src={card.image}
                  alt="Card"
                  className="h-10 w-10 rounded-full border-2 border-white object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-400">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
              )}
            </div>

            <div className="mb-6">
              <div className="mb-1 flex items-center">
                <div className="mr-2">
                  <img
                    className="h-12 w-12"
                    src="/assets/images/chip.png"
                    alt="Chip"
                  />
                </div>
                <p className="font-mono text-xl tracking-widest">
                  {formatCardNumber(card.number)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-xs opacity-80">Card Holder</p>
                <p className="font-medium uppercase">{card.name}</p>
              </div>
              <div>
                <p className="mb-1 text-xs opacity-80">Expires</p>
                <p className="font-medium">{card.expiry_date}</p>
              </div>
              <div className="flex flex-col items-end">
                <p className="mb-1 text-xs opacity-80">Type</p>
                <div className="flex items-center space-x-1">
                  {card.number.startsWith("4") ? (
                    <img
                      src="/assets/images/visa.png"
                      alt="Visa"
                      className="h-8"
                    />
                  ) : card.number.startsWith("5") ? (
                    <img
                      src="/assets/images/mastercard.png"
                      alt="Mastercard"
                      className="h-8"
                    />
                  ) : (
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
                  )}
                </div>
              </div>
            </div>

            <div className="absolute bottom-3 right-3">
              <p className="text-xs font-bold opacity-70">
                {new Date(card.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}

        {/* Show large Add Card button only when no cards exist */}
        {balances.paymentCards.length === 0 && (
          <div
            onClick={() => setShowAddCard(true)}
            className="flex h-full cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-5 text-gray-500 transition-colors duration-200 hover:border-green-300 hover:text-green-500"
          >
            <div className="text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mx-auto h-12 w-12 text-gray-400 group-hover:text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium">Add Payment Card</h3>
              <p className="mt-1 text-sm">
                Add your card for contactless NFC payments
              </p>
              <button
                className="mt-4 inline-flex items-center rounded-md bg-green-50 px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-100 dark:!bg-green-600 dark:!text-white dark:hover:!bg-green-700"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddCard(true);
                }}
              >
                <svg
                  className="mr-2 h-4 w-4"
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
                Add Card
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Update Card Modal */}
      {showAddCard && userId && (
        <AddPaymentCard
          userId={userId}
          onClose={() => setShowAddCard(false)}
          onSuccess={handleAddCardSuccess}
          existingCard={balances.paymentCards[0]}
        />
      )}
    </>
  );
}
