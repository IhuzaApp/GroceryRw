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

  const totalBalance = wallet
    ? wallet.availableBalance + wallet.reservedBalance
    : 0;

  return (
    <>
      <div
        className={`rounded-xl p-4 shadow-lg sm:rounded-2xl sm:p-6 ${
          theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        }`}
      >
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-medium opacity-70 sm:text-sm">
            Total Balance
          </h3>
          <button className="hidden text-gray-400 hover:text-gray-600 sm:block">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-6 sm:py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-green-500 border-t-transparent sm:h-8 sm:w-8"></div>
          </div>
        ) : (
          <>
            <div className="mb-3 sm:mb-4">
              <p className="text-2xl font-bold sm:text-3xl">
                {formatCurrencySync(totalBalance)}
              </p>
              <div className="mt-1.5 flex flex-col gap-1 text-xs sm:mt-2 sm:flex-row sm:items-center sm:gap-4 sm:text-sm">
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
                className="w-full rounded-full bg-green-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-2 sm:text-sm"
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
