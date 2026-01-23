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
  const [paymentReferenceId, setPaymentReferenceId] = useState<string | null>(
    null
  );
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<"momo" | "otp" | "success">(
    "momo"
  );
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if component is mounted (for SSR compatibility)
  useEffect(() => {
    setIsMounted(true);
    // Check if mobile on mount
    setIsMobile(window.innerWidth < 768);

    // Add resize listener
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const formattedCurrency = (amount: number) => {
    return formatCurrencySync(amount);
  };

  // Function to handle payment submission (now just validates and proceeds to OTP)
  const handlePaymentSubmission = async () => {
    if (!momoCode.trim()) {
      setStatusMessage("MoMo code is required");
      setPaymentStatus("failed");
      return;
    }

    // If validation passes, proceed to OTP verification
    setPaymentStatus("processing");
    setStatusMessage("Generating OTP...");

    // Call the original onSubmit to generate OTP
    onSubmit();

    // Move to OTP step after a short delay
    setTimeout(() => {
      setCurrentStep("otp");
      setPaymentStatus("idle");
      setStatusMessage("");
    }, 1000);
  };

  // Function to handle OTP verification
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

    // Call the OTP verification function
    onVerifyOtp();
  };


  // Reset status when modal opens
  useEffect(() => {
    if (open) {
      setPaymentStatus("idle");
      setPaymentReferenceId(null);
      setStatusMessage("");
      // If orderPin is already available, go directly to success
      if (orderPin) {
        setCurrentStep("success");
      } else {
        setCurrentStep("momo");
      }
    }
  }, [open, orderPin]);

  // Watch for orderPin to show success screen
  useEffect(() => {
    if (orderPin && open) {
      setCurrentStep("success");
      setPaymentStatus("success");
    }
  }, [orderPin, open]);

  // Debug log to check button state
  useEffect(() => {
    // Debug logging removed
  }, [momoCode, paymentLoading, paymentStatus]);

  if (!open || !isMounted) return null;

  // Console logs for mobile payment modal
  if (isMobile && open) {
    console.log("🔄 PaymentModal opened on mobile");
    console.log("📋 Order Details:", {
      OrderID: orderId, // Numeric OrderID from database
      id: externalId, // UUID id from database
      orderAmount: orderAmount,
      serviceFee: serviceFee,
      deliveryFee: deliveryFee,
      momoCode: momoCode,
      currentStep: currentStep,
      paymentStatus: paymentStatus
    });
  }

  const modalContent = (
    <div className="fixed inset-0 z-[999999] flex items-end justify-center bg-black/70 backdrop-blur-md p-0 sm:items-center sm:p-4">
      <div
        className={`w-full max-w-[550px] rounded-t-2xl border-0 shadow-2xl sm:rounded-2xl ${
          theme === "dark"
            ? "bg-gray-800 sm:border-gray-700"
            : "bg-white sm:border-gray-200"
        } sm:border`}
      >
        {/* Header */}
        <div
          className={`flex flex-shrink-0 items-center justify-between border-b p-4 md:p-5 ${
            theme === "dark"
              ? "border-gray-700 bg-gray-800"
              : "border-gray-200 bg-gradient-to-r from-green-50 to-blue-50"
          }`}
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
            <div>
              <h2
                className={`text-xl font-bold ${
                  theme === "dark" ? "text-gray-100" : "text-gray-800"
                }`}
              >
                {currentStep === "momo"
                  ? "Process Payment"
                  : currentStep === "otp"
                  ? "Verify OTP"
                  : "Order Complete!"}
              </h2>
              {orderId && (
                <div
                  className={`text-2xl font-bold tracking-wider ${
                    theme === "dark" ? "text-blue-400" : "text-blue-600"
                  }`}
                >
                  Order #{orderId}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className={`rounded-xl p-2 transition-colors ${
                theme === "dark"
                  ? "text-gray-400 hover:bg-gray-700"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
              disabled={paymentStatus === "processing" || otpLoading}
            >
              <svg
                className="h-5 w-5"
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
            </button>
          </div>
        </div>

        {/* Body */}
        <div
          className={`max-h-[70vh] overflow-y-auto px-6 py-4 sm:px-8 ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
        >
          {currentStep === "momo" ? (
            <>
              <div className="space-y-4">
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
              </div>

              {/* Payment Summary */}
              <div
                className={`mt-6 rounded-2xl border-2 p-4 ${
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
              {paymentStatus !== "idle" && paymentStatus !== "success" && (
                <div
                  className={`mt-6 rounded-xl border-l-4 p-4 ${
                    paymentStatus === "failed"
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
                        paymentStatus === "failed"
                          ? theme === "dark"
                            ? "bg-red-600"
                            : "bg-red-100"
                          : theme === "dark"
                          ? "bg-blue-600"
                          : "bg-blue-100"
                      }`}
                    >
                      {paymentStatus === "failed" ? (
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
                        {paymentStatus === "failed"
                          ? "Validation Failed"
                          : "Generating OTP..."}
                      </p>
                      <p className="text-sm opacity-90">{statusMessage}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : currentStep === "otp" ? (
            <>
              {/* OTP Step Content */}

              {/* OTP Input with Square Boxes */}
              <div className="space-y-4">
                <label
                  className={`block text-sm font-semibold ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Enter OTP Code
                </label>

                <div className="flex justify-center gap-4">
                  {[0, 1, 2, 3, 4].map((index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength={1}
                      value={otp[index] || ""}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, ""); // Only allow digits
                        if (value.length <= 1) {
                          const newOtp = otp.split("");
                          newOtp[index] = value;
                          setOtp(newOtp.join(""));

                          // Auto-focus next input
                          if (value && index < 4) {
                            const nextInput = document.getElementById(
                              `otp-${index + 1}`
                            );
                            nextInput?.focus();
                          }
                        }
                      }}
                      onKeyDown={(e) => {
                        // Handle backspace
                        if (e.key === "Backspace" && !otp[index] && index > 0) {
                          const prevInput = document.getElementById(
                            `otp-${index - 1}`
                          );
                          prevInput?.focus();
                        }
                      }}
                      onPaste={(e) => {
                        e.preventDefault();
                        const pastedData = e.clipboardData
                          .getData("text")
                          .replace(/\D/g, ""); // Only digits

                        if (pastedData.length === 5) {
                          // Fill all fields with pasted data
                          setOtp(pastedData);

                          // Focus the last input
                          const lastInput = document.getElementById(`otp-4`);
                          lastInput?.focus();
                        } else if (pastedData.length > 0) {
                          // If pasted data is not exactly 5 digits, fill what we can
                          const newOtp = otp.split("");
                          for (
                            let i = 0;
                            i < Math.min(pastedData.length, 5);
                            i++
                          ) {
                            newOtp[i] = pastedData[i];
                          }
                          setOtp(newOtp.join(""));

                          // Focus the next empty field or the last field
                          const nextEmptyIndex = Math.min(pastedData.length, 4);
                          const nextInput = document.getElementById(
                            `otp-${nextEmptyIndex}`
                          );
                          nextInput?.focus();
                        }
                      }}
                      id={`otp-${index}`}
                      className={`h-16 w-16 rounded-xl border-2 text-center text-2xl font-bold transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        theme === "dark"
                          ? "border-gray-600 bg-gray-700 text-gray-100 focus:border-purple-500"
                          : "border-gray-300 bg-white text-gray-900 focus:border-purple-500"
                      }`}
                      placeholder=""
                    />
                  ))}
                </div>

                <p
                  className={`text-center text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Enter the 5-digit code from the alert popup
                </p>
              </div>

              {/* OTP Status Display */}
              {paymentStatus !== "idle" && paymentStatus !== "success" && (
                <div
                  className={`mt-4 rounded-xl border-l-4 p-3 ${
                    paymentStatus === "failed"
                      ? theme === "dark"
                        ? "border-red-500 bg-red-900/20 text-red-300"
                        : "border-red-500 bg-red-50 text-red-800"
                      : theme === "dark"
                      ? "border-purple-500 bg-purple-900/20 text-purple-300"
                      : "border-purple-500 bg-purple-50 text-purple-800"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`rounded-full p-1 ${
                        paymentStatus === "failed"
                          ? theme === "dark"
                            ? "bg-red-600"
                            : "bg-red-100"
                          : theme === "dark"
                          ? "bg-purple-600"
                          : "bg-purple-100"
                      }`}
                    >
                      {paymentStatus === "failed" ? (
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
                            theme === "dark" ? "text-white" : "text-purple-600"
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
                        {paymentStatus === "failed"
                          ? "OTP Verification Failed"
                          : "Verifying OTP..."}
                      </p>
                      <p className="text-sm opacity-90">{statusMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* OTP Instructions */}
              <div
                className={`mt-4 rounded-xl border-l-4 p-3 ${
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
                    <p className="mb-1 font-semibold">OTP Instructions</p>
                    <p className="text-sm opacity-90">
                      An alert popup should have displayed the OTP. If you
                      missed it, refresh the page and try again. In a production
                      environment, this OTP would be sent to your phone number
                      or email.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Success Step Content - Show Order PIN */}
              <div
                className={`mb-6 rounded-xl border-2 p-6 text-center ${
                  theme === "dark"
                    ? "border-green-600 bg-green-900/20"
                    : "border-green-200 bg-green-50"
                }`}
              >
                <div className="mb-4 flex justify-center">
                  <div
                    className={`rounded-full p-4 ${
                      theme === "dark" ? "bg-green-600" : "bg-green-100"
                    }`}
                  >
                    <svg
                      className={`h-12 w-12 ${
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
                </div>
                <h3
                  className={`mb-2 text-2xl font-bold ${
                    theme === "dark" ? "text-green-300" : "text-green-700"
                  }`}
                >
                  Payment Successful!
                </h3>
                <p
                  className={`mb-6 text-sm ${
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Your order has been placed successfully
                </p>

                {/* Order PIN Display */}
                <div
                  className={`mx-auto mb-4 max-w-sm rounded-2xl border-2 p-6 ${
                    theme === "dark"
                      ? "border-gray-600 bg-gray-800"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  <p
                    className={`mb-3 text-sm font-semibold ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Your Order PIN
                  </p>
                  <div
                    className={`mb-3 rounded-xl p-4 ${
                      theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                    }`}
                  >
                    <p
                      className={`font-mono text-5xl font-bold tracking-widest ${
                        theme === "dark" ? "text-green-400" : "text-green-600"
                      }`}
                    >
                      {orderPin || "00"}
                    </p>
                  </div>
                  <p
                    className={`text-xs ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Please share this PIN with the delivery person to confirm
                    your order delivery
                  </p>
                </div>

                {/* Information Box */}
                <div
                  className={`rounded-xl border-l-4 p-4 text-left ${
                    theme === "dark"
                      ? "border-blue-500 bg-blue-900/20 text-blue-300"
                      : "border-blue-500 bg-blue-50 text-blue-800"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <svg
                      className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
                        theme === "dark" ? "text-blue-400" : "text-blue-600"
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
                    <div className="flex-1">
                      <p className="mb-1 text-sm font-semibold">Important</p>
                      <p className="text-xs">
                        Keep this PIN safe. You will need to share it with the
                        delivery person when they arrive to verify the delivery.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div
          className={`flex flex-shrink-0 items-center justify-end gap-3 border-t p-4 md:p-5 ${
            theme === "dark"
              ? "border-gray-700 bg-gray-800"
              : "border-gray-200 bg-white"
          }`}
        >
          <div className="flex w-full gap-3">
            {currentStep === "momo" ? (
              <>
                <button
                  onClick={handlePaymentSubmission}
                  disabled={
                    !momoCode.trim() ||
                    paymentStatus === "processing" ||
                    paymentLoading
                  }
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-white transition-all duration-200 ${
                    !momoCode.trim() ||
                    paymentStatus === "processing" ||
                    paymentLoading
                      ? "cursor-not-allowed bg-gray-400"
                      : theme === "dark"
                      ? "bg-green-600 shadow-lg hover:bg-green-700 hover:shadow-green-500/25"
                      : "bg-green-600 shadow-lg hover:bg-green-700 hover:shadow-green-500/25"
                  }`}
                >
                  {paymentStatus === "processing" || paymentLoading ? (
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
                      Generating OTP...
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
                  disabled={paymentStatus === "processing"}
                  className={`rounded-xl px-6 py-3 font-semibold transition-all duration-200 ${
                    paymentStatus === "processing"
                      ? "cursor-not-allowed border border-gray-400 text-gray-400"
                      : theme === "dark"
                      ? "border border-gray-600 text-gray-300 hover:bg-gray-700"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Cancel
                </button>
              </>
            ) : currentStep === "otp" ? (
              <>
                <button
                  onClick={handleOtpVerification}
                  disabled={!otp.trim() || otp.length !== 5 || otpLoading}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-white transition-all duration-200 ${
                    !otp.trim() || otp.length !== 5 || otpLoading
                      ? "cursor-not-allowed bg-gray-400"
                      : "bg-green-600 shadow-lg hover:bg-green-700 hover:shadow-green-500/25"
                  }`}
                >
                  {otpLoading ? (
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
                      Verifying...
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
                      Complete Payment
                    </>
                  )}
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default PaymentModal;
