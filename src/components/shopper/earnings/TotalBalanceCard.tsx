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
        className={`group relative overflow-hidden rounded-[2.5rem] p-8 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(16,185,129,0.1)] ${
          isDark
            ? "border border-white/5 bg-gray-900/40 backdrop-blur-2xl shadow-2xl shadow-black/20"
            : "border border-gray-100 bg-white shadow-2xl shadow-gray-200/50"
        }`}
      >
        {/* Background Decorative Glow */}
        <div className={`absolute -right-20 -top-20 h-64 w-64 rounded-full blur-[100px] transition-all duration-700 group-hover:scale-110 ${
          isDark ? "bg-emerald-500/10 group-hover:bg-emerald-500/20" : "bg-emerald-500/5 group-hover:bg-emerald-500/10"
        }`} />

        <div className="relative z-10">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-[1.25rem] shadow-inner transition-transform duration-500 group-hover:-rotate-6 ${
                  isDark
                    ? "bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 ring-1 ring-white/10"
                    : "bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600 ring-1 ring-emerald-100"
                }`}
              >
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className={`text-lg font-black tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                  Wallet Summary
                </h3>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/60">
                  Global Liquidity
                </p>
              </div>
            </div>
            
            <button className={`p-2 rounded-xl transition-all duration-300 ${isDark ? "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white" : "bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-900"}`}>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div>

          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent shadow-[0_0_15px_rgba(16,185,129,0.3)]"></div>
            </div>
          ) : (
            <div className="space-y-8">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 bg-clip-text text-5xl font-black text-transparent tracking-tighter sm:text-6xl">
                    {formatCurrencySync(totalBalance)}
                  </span>
                </div>
                
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ${
                    isDark ? "bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20" : "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100"
                  }`}>
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                    Available: {formatCurrencySync(wallet?.availableBalance || 0)}
                  </div>
                  
                  {wallet && wallet.reservedBalance > 0 && (
                    <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ${
                      isDark ? "bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20" : "bg-amber-50 text-amber-600 ring-1 ring-amber-100"
                    }`}>
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      Reserved: {formatCurrencySync(wallet.reservedBalance)}
                    </div>
                  )}
                </div>
              </div>

              <button
                className={`group/btn relative w-full overflow-hidden rounded-2xl py-5 text-xs font-black uppercase tracking-[0.3em] transition-all duration-300 active:scale-[0.98] ${
                  !wallet || wallet.availableBalance <= 0
                    ? "cursor-not-allowed bg-gray-500/10 text-gray-500 grayscale"
                    : "bg-emerald-500 text-white shadow-[0_10px_25px_rgba(16,185,129,0.3)] hover:bg-emerald-400 hover:shadow-[0_15px_35px_rgba(16,185,129,0.4)]"
                }`}
                disabled={!wallet || wallet.availableBalance <= 0}
                onClick={() => setShowWithdrawModal(true)}
              >
                <span className="relative z-10">Request Payout</span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover/btn:translate-x-full" />
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
