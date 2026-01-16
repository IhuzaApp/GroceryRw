import React, { useState } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { formatCurrencySync } from "../../../utils/formatCurrency";
import { RequestPayoutModal } from "./RequestPayoutModal";

interface Wallet {
  id: string;
  availableBalance: number;
  reservedBalance: number;
}

interface TotalBalanceCardProps {
  wallet: Wallet | null;
  isLoading?: boolean;
  onWithdraw?: (amount: number) => Promise<void>;
}

const TotalBalanceCard: React.FC<TotalBalanceCardProps> = ({
  wallet,
  isLoading = false,
  onWithdraw,
}) => {
  const { theme } = useTheme();
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const handleWithdraw = async (amount: number) => {
    if (onWithdraw) {
      await onWithdraw(amount);
    }
  };

  const totalBalance = wallet ? wallet.availableBalance + wallet.reservedBalance : 0;

  return (
    <>
      <div
        className={`rounded-2xl p-6 shadow-lg ${
          theme === "dark"
            ? "bg-gray-800 text-white"
            : "bg-white text-gray-900"
        }`}
      >
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-medium opacity-70">Total Balance</h3>
          <button className="text-gray-400 hover:text-gray-600">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-3xl font-bold">
                {formatCurrencySync(totalBalance)}
              </p>
              <div className="mt-2 flex items-center gap-4 text-sm">
                <span className="text-green-500">
                  Available: {formatCurrencySync(wallet?.availableBalance || 0)}
                </span>
                {wallet && wallet.reservedBalance > 0 && (
                  <span className="text-yellow-500">
                    Reserved: {formatCurrencySync(wallet.reservedBalance)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                className="w-full rounded-full bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!wallet || wallet.availableBalance <= 0}
                onClick={() => setShowWithdrawModal(true)}
              >
                Request Payout
              </button>
            </div>
          </>
        )}
      </div>

      {/* Request Payout Modal */}
      <RequestPayoutModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        wallet={wallet}
        onSubmit={handleWithdraw}
      />
    </>
  );
};

export default TotalBalanceCard;
