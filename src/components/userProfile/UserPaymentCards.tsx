import React, { useEffect, useState } from "react";

// Helper function to format RWF
const formatRWF = (amount: string | number) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency: 'RWF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
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
    wallet: null
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
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userId }),
      }).then(res => res.json()),
      
      // Check if user is a shopper
      fetch("/api/queries/check-shopper-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userId }),
      }).then(res => res.json())
    ])
      .then(([refundsData, shopperData]) => {
        const newBalances = {
          refunds: refundsData.refunds || [],
          wallet: null
        };

        // If user is a shopper, fetch their wallet balance
        if (shopperData.shopper?.active) {
          return fetch("/api/queries/wallet-balance", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ shopper_id: userId }),
          })
            .then(res => res.json())
            .then(walletData => {
              newBalances.wallet = walletData.wallet;
              return newBalances;
            });
        }
        return newBalances;
      })
      .then(newBalances => {
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
    (sum: number, refund: { amount: string }) => sum + parseFloat(refund.amount),
    0
  );

  // Get wallet balance
  const walletBalance = balances.wallet?.available_balance 
    ? parseFloat(balances.wallet.available_balance)
    : 0;

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading balances</div>;
  }

  return (
    <>
      <h3 className="mb-4 mt-3 text-lg font-bold">Your Payment Cards</h3>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Purple Refund Card */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-purple-800 p-5 text-white shadow-lg">
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

        {/* Green Wallet Card */}
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
              <p className="font-medium">{balances.wallet ? "ACTIVE" : "NOT A SHOPPER"}</p>
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
      </div>
    </>
  );
}
