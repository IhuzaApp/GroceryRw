import React, { useState } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { formatCurrencySync } from "../../../utils/formatCurrency";
import {
  RequestPayoutModal,
  type RequestPayoutPayload,
} from "./RequestPayoutModal";
import { logErrorToSlack } from "../../../lib/slackErrorReporter";

interface Wallet {
  id: string;
  availableBalance: number;
  reservedBalance: number;
}

interface TotalBalanceCardProps {
  wallet: Wallet | null;
  isLoading?: boolean;
  defaultPhoneNumber?: string;
  onWithdraw?: (payload: RequestPayoutPayload) => Promise<void>;
}

const TotalBalanceCard: React.FC<TotalBalanceCardProps> = ({
  wallet,
  isLoading = false,
  defaultPhoneNumber = "",
  onWithdraw,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const handleWithdraw = async (payload: RequestPayoutPayload) => {
    if (!onWithdraw) return;

    try {
      await onWithdraw(payload);
    } catch (error) {
      void logErrorToSlack("TotalBalanceCard.handleWithdraw", error, {
        walletId: wallet?.id,
      });
      throw error;
    }
  };

  const totalBalance = wallet
    ? wallet.availableBalance + wallet.reservedBalance
    : 0;

  return (
    <>
      <div
        className={`group relative overflow-hidden rounded-[2rem] p-6 transition-all duration-500 hover:shadow-2xl ${
          isDark 
            ? "bg-white/5 border border-white/10 hover:bg-white/[0.08]" 
            : "bg-white border border-black/5 shadow-xl hover:shadow-emerald-500/10"
        }`}
      >
        {/* Background Decorative Glow */}
        <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl transition-opacity group-hover:opacity-100 opacity-50" />

        <div className="relative z-10">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-100 text-emerald-600"
              }`}>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest opacity-60">
                Total Balance
              </h3>
            </div>
            <button className={`${isDark ? "text-white/20 hover:text-white/60" : "text-black/20 hover:text-black/60"} transition-colors`}>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <p className="bg-gradient-to-br from-emerald-400 to-teal-500 bg-clip-text text-4xl font-black text-transparent sm:text-5xl">
                  {formatCurrencySync(totalBalance)}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                    isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600"
                  }`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Available: {formatCurrencySync(wallet?.availableBalance || 0)}
                  </div>
                  {wallet && wallet.reservedBalance > 0 && (
                    <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                      isDark ? "bg-amber-500/10 text-amber-400" : "bg-amber-50 text-amber-600"
                    }`}>
                      Reserved: {formatCurrencySync(wallet.reservedBalance)}
                    </div>
                  )}
                </div>
              </div>

              <button
                className={`w-full rounded-2xl py-4 text-sm font-black uppercase tracking-widest transition-all duration-300 active:scale-95 ${
                  !wallet || wallet.availableBalance <= 0
                    ? "bg-gray-500/20 text-gray-500 cursor-not-allowed"
                    : isDark
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400"
                    : "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500"
                }`}
                disabled={!wallet || wallet.availableBalance <= 0}
                onClick={() => setShowWithdrawModal(true)}
              >
                Request Payout
              </button>
            </div>
          )}
        </div>
      </div>

      <RequestPayoutModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        wallet={wallet}
        defaultPhoneNumber={defaultPhoneNumber}
        onSubmit={handleWithdraw}
      />
    </>
  );
};

export default TotalBalanceCard;
