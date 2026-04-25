import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "../../context/ThemeContext";
import { formatCurrencySync } from "../../utils/formatCurrency";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  momoCode: string;
  setMomoCode: (value: string) => void;
  orderAmount: number;
  serviceFee: number;
  deliveryFee: number;
  paymentLoading: boolean;
  externalId?: string; // Order or batch ID for reference
  orderId?: number; // Numeric OrderID from database
  orderPin?: string; // Generated order PIN to display
  // OTP related props
  otp: string;
  setOtp: (value: string) => void;
  otpLoading: boolean;
  onVerifyOtp: () => void;
  generatedOtp: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  onClose,
  onSubmit,
  momoCode,
  setMomoCode,
  orderAmount,
  serviceFee,
  deliveryFee,
  paymentLoading,
  externalId,
  orderId,
  orderPin,
  otp,
  setOtp,
  otpLoading,
  onVerifyOtp,
  generatedOtp,
}) => {
  const { theme } = useTheme();
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "failed"
  >("idle");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<"momo" | "otp" | "success">(
    "momo"
  );
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const formattedCurrency = (amount: number) => {
    return formatCurrencySync(amount);
  };

  const handlePaymentSubmission = async () => {
    if (!momoCode.trim()) {
      setStatusMessage("MoMo code is required");
      setPaymentStatus("failed");
      return;
    }

    setPaymentStatus("processing");
    setStatusMessage("Generating OTP...");
    onSubmit();

    setTimeout(() => {
      setCurrentStep("otp");
      setPaymentStatus("idle");
      setStatusMessage("");
    }, 1000);
  };

  const handleOtpVerification = () => {
    if (!otp.trim()) {
      setStatusMessage("OTP is required");
      setPaymentStatus("failed");
      return;
    }

    if (otp.length !== 5) {
      setStatusMessage("OTP must be 5 digits");
      setPaymentStatus("failed");
      return;
    }

    onVerifyOtp();
  };

  useEffect(() => {
    if (open) {
      setPaymentStatus("idle");
      setStatusMessage("");
      if (orderPin) {
        setCurrentStep("success");
      } else {
        setCurrentStep("momo");
      }
    }
  }, [open, orderPin]);

  useEffect(() => {
    if (orderPin && open) {
      setCurrentStep("success");
      setPaymentStatus("success");
    }
  }, [orderPin, open]);

  if (!open || !isMounted) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-[500px] overflow-hidden rounded-t-[2.5rem] shadow-2xl transition-all duration-300 sm:rounded-[3rem] border`}
        style={{ 
          backgroundColor: 'var(--bg-primary)',
          borderColor: theme === "dark" ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Gradient */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-10 pb-6 sm:px-10">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/20">
              <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={currentStep === "success" ? "M5 13l4 4L19 7" : "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"} />
              </svg>
            </div>
            <div>
              <h2 className={`text-2xl font-black tracking-tight ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                {currentStep === "momo" ? "Payment" : currentStep === "otp" ? "Security" : "Success"}
              </h2>
              <p className={`text-sm font-bold ${theme === "dark" ? "text-emerald-400" : "text-emerald-600"}`}>
                {currentStep === "success" ? "Order Complete" : `Order #${orderId || "---"}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95 ${
              theme === "dark" ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"
            }`}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-10 sm:px-10">
          {currentStep === "momo" ? (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className={`text-xs font-black uppercase tracking-widest ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                  Store Merchant Code (Auto-populated)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={momoCode}
                    readOnly
                    placeholder="Merchant Code Not Found"
                    className={`w-full rounded-2xl border-2 py-5 px-6 text-xl font-bold tracking-tight transition-all opacity-70 cursor-not-allowed`}
                    style={{ 
                      backgroundColor: 'var(--bg-secondary)', 
                      color: 'var(--text-primary)',
                      borderColor: theme === "dark" ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                    }}
                  />
                </div>
              </div>

              <div 
                className="rounded-[2.5rem] p-8 border-2"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: theme === "dark" ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                }}
              >
                <div className="flex flex-col items-center text-center">
                  <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">AMOUNT TO PAY</p>
                  <h3 className={`text-5xl font-black tracking-tighter ${theme === "dark" ? "text-emerald-400" : "text-emerald-600"}`}>
                    {formattedCurrency(orderAmount)}
                  </h3>
                  <p className="mt-4 text-xs font-bold text-gray-400">Total amount for verified items</p>
                </div>
              </div>
            </div>
          ) : currentStep === "otp" ? (
            <div className="space-y-8">
              <div className="text-center">
                <p className={`text-sm font-bold ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                  Enter the 5-digit security code sent to you
                </p>
              </div>

              <div className="flex justify-between gap-3">
                {[0, 1, 2, 3, 4].map((index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={otp[index] || ""}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      if (val.length <= 1) {
                        const newOtp = otp.split("");
                        newOtp[index] = val;
                        setOtp(newOtp.join(""));
                        if (val && index < 4) {
                          document.getElementById(`otp-${index + 1}`)?.focus();
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otp[index] && index > 0) {
                        document.getElementById(`otp-${index - 1}`)?.focus();
                      }
                    }}
                    className={`h-16 w-full rounded-2xl border-2 text-center text-2xl font-black transition-all focus:border-emerald-500`}
                    style={{ 
                      backgroundColor: 'var(--bg-secondary)', 
                      color: 'var(--text-primary)',
                      borderColor: theme === "dark" ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                    }}
                  />
                ))}
              </div>

              <div className={`rounded-2xl p-4 border-2 bg-emerald-500/5 border-emerald-500/10 text-center`}>
                <p className="text-xs font-bold text-emerald-600">
                  Checking SMS and Email for verification...
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-8 text-center">
              <div className="flex justify-center">
                <div className="h-24 w-24 rounded-full bg-emerald-100 flex items-center justify-center">
                  <svg className="h-12 w-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className={`text-3xl font-black tracking-tight ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  Payment Confirmed
                </h3>
                <p className="mt-2 text-sm font-bold text-gray-500">Share this PIN with the delivery person</p>
              </div>
              
              <div className={`rounded-[2.5rem] p-10 border-2`} style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'rgba(16,185,129,0.2)' }}>
                <span className="text-xs font-black text-gray-500 uppercase tracking-[0.3em]">ORDER PIN</span>
                <div className={`mt-4 font-mono text-6xl font-black tracking-[0.2em] ${theme === "dark" ? "text-emerald-400" : "text-emerald-600"}`}>
                  {orderPin || "---"}
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {statusMessage && (
            <div className="mt-6 rounded-2xl border-2 border-red-500/10 bg-red-500/5 p-4 text-center text-red-500 text-xs font-bold">
              {statusMessage}
            </div>
          )}
        </div>

        {/* Footer */}
        <div 
          className="p-6 sm:p-10 border-t flex gap-4" 
          style={{ 
            backgroundColor: 'var(--bg-secondary)', 
            borderTopColor: theme === "dark" ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' 
          }}
        >
          {currentStep !== "success" && (
            <button
              onClick={onClose}
              className={`flex-1 rounded-2xl py-4 font-black tracking-tight transition-all active:scale-95 border`}
              style={{ 
                backgroundColor: 'var(--bg-primary)', 
                color: 'var(--text-secondary)',
                borderColor: theme === "dark" ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
              }}
            >
              CANCEL
            </button>
          )}
          
          {currentStep === "momo" ? (
            <button
              onClick={handlePaymentSubmission}
              disabled={!momoCode.trim() || paymentStatus === "processing"}
              className={`flex-[2] rounded-2xl py-4 font-black tracking-tight shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${
                momoCode.trim() && paymentStatus !== "processing"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-emerald-600/30 hover:scale-[1.02]"
                  : "bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
              }`}
            >
              {paymentStatus === "processing" ? "GENERATING OTP..." : "REQUEST OTP"}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          ) : currentStep === "otp" ? (
            <button
              onClick={handleOtpVerification}
              disabled={otp.length !== 5 || otpLoading}
              className={`flex-[2] rounded-2xl py-4 font-black tracking-tight shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${
                otp.length === 5 && !otpLoading
                  ? "bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-emerald-600/30 hover:scale-[1.02]"
                  : "bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
              }`}
            >
              {otpLoading ? "VERIFYING..." : "COMPLETE PAYMENT"}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 rounded-2xl py-4 font-black tracking-tight shadow-xl transition-all active:scale-95 bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-emerald-600/30"
            >
              DONE
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default PaymentModal;
