import React, { useEffect, useState } from "react";

// Helper function to format RWF
const formatRWF = (amount: string | number) => {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount);
};

export default function UserPaymentCards() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [balances, setBalances] = useState<{
    refunds: Array<{ amount: string; status: string }>;
    wallet: { available_balance: string; reserved_balance: string } | null;
  }>({
    refunds: [],
    wallet: null,
  });

  // Get user ID from session
  useEffect(() => {
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
  }, []);

  // Fetch balances when userId is available
  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    Promise.all([
      // Fetch refunds
      fetch("/api/queries/refunds", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      }).then((res) => res.json()),

      // Check if user is a shopper
      fetch("/api/queries/check-shopper-status", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      }).then((res) => res.json()),
    ])
      .then(([refundsData, shopperData]) => {
        const newBalances = {
          refunds: refundsData.refunds || [],
          wallet: null,
        };

        // If user is a shopper, fetch their wallet balance
        if (shopperData.shopper?.active) {
          return fetch("/api/queries/wallet-balance", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            }
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
  }, [userId]);

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

    console.log(balances);
    

  if (loading) {
    return (
      <>
        <h3 className="mb-4 mt-3 text-lg font-bold">Your Payment Cards</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Refund Card Skeleton */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-gray-200 to-gray-300 p-5 shadow-lg animate-pulse">
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
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-100 to-green-200 p-5 shadow-lg animate-pulse">
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
      <h3 className="mb-4 mt-3 text-lg font-bold">Your Payment Cards</h3>
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
                {formatRWF(totalRefundAmount)}
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
                  {formatRWF(walletBalance)}
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

        {/* Message when wallet is not available */}
        {!balances.wallet && (
          <div className="flex h-full items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-5 text-gray-500">
            <div className="text-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="mx-auto h-12 w-12 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 15v2m0 0v2m0-2h2m-2 0H9m4-9H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium">No Wallet Available</h3>
              <p className="mt-1 text-sm">Wallet balance is only available for shoppers</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
