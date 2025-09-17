import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Input,
  InputGroup,
  Message,
  Divider,
} from "rsuite";
import { useTheme } from "../../context/ThemeContext";
import { formatCurrencySync } from "../../utils/formatCurrency";
import { momoTokenManager } from "../../lib/momoTokenManager";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  momoCode: string;
  setMomoCode: (value: string) => void;
  privateKey: string;
  orderAmount: number;
  serviceFee: number;
  deliveryFee: number;
  paymentLoading: boolean;
  payerNumber?: string; // Shopper's phone number for MoMo payment
  externalId?: string; // Order or batch ID for reference
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  onClose,
  onSubmit,
  momoCode,
  setMomoCode,
  privateKey,
  orderAmount,
  serviceFee,
  deliveryFee,
  paymentLoading,
  payerNumber,
  externalId,
}) => {
  const { theme } = useTheme();
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [paymentReferenceId, setPaymentReferenceId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const formattedCurrency = (amount: number) => {
    return formatCurrencySync(amount);
  };

  // Function to handle payment submission (now just validates and proceeds to OTP)
  const handlePaymentSubmission = async () => {
    if (!momoCode.trim()) {
      setStatusMessage('MoMo code is required');
      setPaymentStatus('failed');
      return;
    }

    if (!payerNumber) {
      setStatusMessage('Phone number is required for payment');
      setPaymentStatus('failed');
      return;
    }

    // If validation passes, proceed to OTP verification
    setPaymentStatus('success');
    setStatusMessage('Payment details validated. Proceeding to OTP verification...');
    
    // Call the original onSubmit to proceed to OTP
            setTimeout(() => {
              onSubmit();
    }, 1000);
  };

  // Reset status when modal opens
  useEffect(() => {
    if (open) {
      setPaymentStatus('idle');
      setPaymentReferenceId(null);
      setStatusMessage('');
    }
  }, [open]);

  // Debug log to check button state
  useEffect(() => {
    console.log('PaymentModal button state:', {
      payerNumber,
      paymentLoading,
      paymentStatus,
      isDisabled: !payerNumber || paymentStatus === 'processing' || paymentLoading
    });
    
    // Debug token status
    const tokenInfo = momoTokenManager.getTokenInfo();
    console.log('MoMo Token status:', tokenInfo);
  }, [payerNumber, paymentLoading, paymentStatus]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      className={`${theme === "dark" ? "dark-theme" : ""} rounded-2xl`}
    >
      <Modal.Header
        className={`${
          theme === "dark"
            ? "border-b border-gray-700 bg-gray-800"
            : "border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50"
        } rounded-t-2xl`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`rounded-full p-2 ${
              theme === "dark" ? "bg-green-600" : "bg-green-100"
            }`}
          >
            <svg
              className={`h-6 w-6 ${
                theme === "dark" ? "text-white" : "text-green-600"
              }`}
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
          <Modal.Title
            className={`text-xl font-bold ${
              theme === "dark" ? "text-gray-100" : "text-gray-800"
            }`}
          >
            Process Payment
          </Modal.Title>
        </div>
      </Modal.Header>
      <Modal.Body
        className={`${
          theme === "dark" ? "bg-gray-800 text-gray-100" : "bg-white"
        } px-6 py-6`}
      >
        <div
          className={`mb-6 rounded-xl border-l-4 p-4 ${
            theme === "dark"
              ? "border-blue-500 bg-blue-900/20 text-blue-300"
              : "border-blue-500 bg-blue-50 text-blue-800"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`rounded-full p-1 ${
                theme === "dark" ? "bg-blue-600" : "bg-blue-100"
              }`}
            >
              <svg
                className={`h-4 w-4 ${
                  theme === "dark" ? "text-white" : "text-blue-600"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="mb-1 font-semibold">Secure Payment Processing</p>
              <p className="text-sm opacity-90">
                Your payment is processed securely through our trusted payment
                gateway. Enter your MoMo code to complete the transaction
                safely.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* MoMo Code Input */}
          <div className="space-y-2">
            <label
              className={`block text-sm font-semibold ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              MoMo Code
            </label>
            <div className="relative">
              <div
                className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3`}
              >
                <svg
                  className={`h-5 w-5 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
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
              <input
                type="text"
                value={momoCode}
                onChange={(e) => setMomoCode(e.target.value)}
                placeholder="Enter your MoMo code"
                className={`w-full rounded-xl border-2 py-3 pl-10 pr-4 transition-all focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  theme === "dark"
                    ? "border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400 focus:border-green-500"
                    : "border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-green-500"
                }`}
              />
            </div>
          </div>

          {/* Private Key Input */}
          <div className="space-y-2">
            <label
              className={`block text-sm font-semibold ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Private Key (Auto-generated)
            </label>
            <div className="relative">
              <div
                className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3`}
              >
                <svg
                  className={`h-5 w-5 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={privateKey}
                disabled
                className={`w-full rounded-xl border-2 py-3 pl-10 pr-4 transition-all ${
                  theme === "dark"
                    ? "cursor-not-allowed border-gray-600 bg-gray-700 text-gray-400"
                    : "cursor-not-allowed border-gray-300 bg-gray-50 text-gray-500"
                }`}
              />
            </div>
            <p
              className={`text-xs ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              This is a one-time key for this transaction. Keep it for your
              records.
            </p>
          </div>
        </div>

        {/* Payment Summary */}
        <div
          className={`mt-8 rounded-2xl border-2 p-6 ${
            theme === "dark"
              ? "border-green-600 bg-green-900/20"
              : "border-green-200 bg-green-50"
          }`}
        >
          <div className="mb-4 flex items-center gap-3">
            <div
              className={`rounded-full p-2 ${
                theme === "dark" ? "bg-green-600" : "bg-green-100"
              }`}
            >
              <svg
                className={`h-5 w-5 ${
                  theme === "dark" ? "text-white" : "text-green-600"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h4
              className={`text-lg font-bold ${
                theme === "dark" ? "text-gray-100" : "text-gray-800"
              }`}
            >
              Payment Summary
            </h4>
          </div>

          <div
            className={`flex items-center justify-between rounded-xl p-4 ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div>
              <p
                className={`text-sm font-medium ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Total Amount to be Paid
              </p>
              <p
                className={`text-xs ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                For found items only
              </p>
            </div>
            <div
              className={`text-2xl font-bold ${
                theme === "dark" ? "text-green-400" : "text-green-600"
              }`}
            >
              {formattedCurrency(orderAmount)}
            </div>
          </div>
        </div>

        {/* Payment Status Display */}
        {paymentStatus !== 'idle' && (
          <div
            className={`mt-6 rounded-xl border-l-4 p-4 ${
              paymentStatus === 'success'
                ? theme === "dark"
                  ? "border-green-500 bg-green-900/20 text-green-300"
                  : "border-green-500 bg-green-50 text-green-800"
                : paymentStatus === 'failed'
                ? theme === "dark"
                  ? "border-red-500 bg-red-900/20 text-red-300"
                  : "border-red-500 bg-red-50 text-red-800"
                : theme === "dark"
                ? "border-blue-500 bg-blue-900/20 text-blue-300"
                : "border-blue-500 bg-blue-50 text-blue-800"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`rounded-full p-1 ${
                  paymentStatus === 'success'
                    ? theme === "dark" ? "bg-green-600" : "bg-green-100"
                    : paymentStatus === 'failed'
                    ? theme === "dark" ? "bg-red-600" : "bg-red-100"
                    : theme === "dark" ? "bg-blue-600" : "bg-blue-100"
                }`}
              >
                {paymentStatus === 'success' ? (
                  <svg
                    className={`h-4 w-4 ${
                      theme === "dark" ? "text-white" : "text-green-600"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : paymentStatus === 'failed' ? (
                  <svg
                    className={`h-4 w-4 ${
                      theme === "dark" ? "text-white" : "text-red-600"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className={`h-4 w-4 animate-spin ${
                      theme === "dark" ? "text-white" : "text-blue-600"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
              </div>
              <div>
                <p className="mb-1 font-semibold">
                  {paymentStatus === 'success' ? 'Payment Successful' : 
                   paymentStatus === 'failed' ? 'Payment Failed' : 
                   'Payment Processing'}
                </p>
                <p className="text-sm opacity-90">
                  {statusMessage}
                </p>
                {paymentReferenceId && (
                  <p className="text-xs mt-2 opacity-75">
                    Reference ID: {paymentReferenceId}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Warning Message */}
        <div
          className={`mt-6 rounded-xl border-l-4 p-4 ${
            theme === "dark"
              ? "border-yellow-500 bg-yellow-900/20 text-yellow-300"
              : "border-yellow-500 bg-yellow-50 text-yellow-800"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`rounded-full p-1 ${
                theme === "dark" ? "bg-yellow-600" : "bg-yellow-100"
              }`}
            >
              <svg
                className={`h-4 w-4 ${
                  theme === "dark" ? "text-white" : "text-yellow-600"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div>
              <p className="mb-1 font-semibold">Payment Instructions</p>
              <p className="text-sm opacity-90">
                Enter your MoMo code and click "Verify & Proceed to OTP" to continue. 
                After OTP verification, the MoMo payment will be initiated automatically.
              </p>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer
        className={`${
          theme === "dark"
            ? "border-t border-gray-700 bg-gray-800"
            : "border-t border-gray-200 bg-gray-50"
        } rounded-b-2xl px-6 py-4`}
      >
        <div className="flex w-full gap-3">
          {paymentStatus === 'success' ? (
            <button
              onClick={onClose}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-white transition-all duration-200 ${
                theme === "dark"
                  ? "bg-green-600 shadow-lg hover:bg-green-700 hover:shadow-green-500/25"
                  : "bg-green-600 shadow-lg hover:bg-green-700 hover:shadow-green-500/25"
              }`}
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
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Payment Complete - Close
            </button>
          ) : (
            <>
          <button
                onClick={handlePaymentSubmission}
                disabled={!payerNumber || !momoCode.trim() || paymentStatus === 'processing' || paymentLoading}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-white transition-all duration-200 ${
                  !payerNumber || !momoCode.trim() || paymentStatus === 'processing' || paymentLoading
                ? "cursor-not-allowed bg-gray-400"
                : theme === "dark"
                ? "bg-green-600 shadow-lg hover:bg-green-700 hover:shadow-green-500/25"
                : "bg-green-600 shadow-lg hover:bg-green-700 hover:shadow-green-500/25"
            }`}
          >
                {paymentStatus === 'processing' || paymentLoading ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                    Processing...
              </>
            ) : (
              <>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                    Verify & Proceed to OTP
              </>
            )}
          </button>
          <button
            onClick={onClose}
                disabled={paymentStatus === 'processing'}
            className={`rounded-xl px-6 py-3 font-semibold transition-all duration-200 ${
                  paymentStatus === 'processing'
                    ? "cursor-not-allowed border border-gray-400 text-gray-400"
                    : theme === "dark"
                ? "border border-gray-600 text-gray-300 hover:bg-gray-700"
                : "border border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            Cancel
          </button>
            </>
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default PaymentModal;
