import React, { useState } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { formatCurrencySync } from "../../../utils/formatCurrency";
import { Modal, Button, Input, Loader } from "rsuite";
import { logger } from "../../../utils/logger";

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
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (wallet && amount > wallet.availableBalance) {
      alert("Insufficient balance");
      return;
    }

    try {
      setIsProcessing(true);
      if (onWithdraw) {
        await onWithdraw(amount);
      }
      setShowWithdrawModal(false);
      setWithdrawAmount("");
    } catch (error) {
      logger.error("Error processing withdrawal", "TotalBalanceCard", error);
      alert("Failed to process withdrawal. Please try again.");
    } finally {
      setIsProcessing(false);
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
            <Loader size="md" />
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
                className="flex-1 rounded-full bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!wallet || wallet.availableBalance <= 0}
                onClick={() => setShowWithdrawModal(true)}
              >
                Request Payout
              </button>
              <button 
                className={`flex-1 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  theme === "dark"
                    ? "border-gray-600 hover:bg-gray-700"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => setShowWithdrawModal(true)}
                disabled={!wallet || wallet.availableBalance <= 0}
              >
                Withdraw
              </button>
            </div>
          </>
        )}
      </div>

      {/* Withdraw Modal */}
      <Modal 
        open={showWithdrawModal} 
        onClose={() => !isProcessing && setShowWithdrawModal(false)}
        size="sm"
      >
        <Modal.Header>
          <Modal.Title>Request Payout</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Available Balance
              </label>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrencySync(wallet?.availableBalance || 0)}
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Withdrawal Amount
              </label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={withdrawAmount}
                onChange={(value) => setWithdrawAmount(value)}
                disabled={isProcessing}
              />
              <div className="mt-2 flex gap-2">
                <button
                  className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium hover:bg-gray-200"
                  onClick={() => setWithdrawAmount(String((wallet?.availableBalance || 0) * 0.25))}
                  disabled={isProcessing}
                >
                  25%
                </button>
                <button
                  className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium hover:bg-gray-200"
                  onClick={() => setWithdrawAmount(String((wallet?.availableBalance || 0) * 0.5))}
                  disabled={isProcessing}
                >
                  50%
                </button>
                <button
                  className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium hover:bg-gray-200"
                  onClick={() => setWithdrawAmount(String((wallet?.availableBalance || 0) * 0.75))}
                  disabled={isProcessing}
                >
                  75%
                </button>
                <button
                  className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium hover:bg-gray-200"
                  onClick={() => setWithdrawAmount(String(wallet?.availableBalance || 0))}
                  disabled={isProcessing}
                >
                  100%
                </button>
              </div>
            </div>

            {wallet && parseFloat(withdrawAmount) > 0 && (
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="flex justify-between text-sm">
                  <span>Withdrawal Amount:</span>
                  <span className="font-semibold">
                    {formatCurrencySync(parseFloat(withdrawAmount))}
                  </span>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span>Remaining Balance:</span>
                  <span className="font-semibold">
                    {formatCurrencySync(wallet.availableBalance - parseFloat(withdrawAmount))}
                  </span>
                </div>
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            onClick={handleWithdraw} 
            appearance="primary"
            color="green"
            disabled={isProcessing || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
            loading={isProcessing}
          >
            {isProcessing ? "Processing..." : "Confirm Withdrawal"}
          </Button>
          <Button 
            onClick={() => setShowWithdrawModal(false)} 
            appearance="subtle"
            disabled={isProcessing}
          >
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default TotalBalanceCard;
