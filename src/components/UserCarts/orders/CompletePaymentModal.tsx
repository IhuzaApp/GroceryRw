import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Notification, toaster, SelectPicker } from "rsuite";
import { formatCurrency } from "../../../lib/formatCurrency";
import { useTheme } from "../../../context/ThemeContext";

interface CompletePaymentModalProps {
  open: boolean;
  onClose: () => void;
  order: any;
  orderType?: string;
  onSuccess?: () => void;
}

export default function CompletePaymentModal({
  open,
  onClose,
  order,
  orderType = "regular",
  onSuccess,
}: CompletePaymentModalProps) {
  const { theme } = useTheme();

  // Selected payment method state
  const [selectedMethod, setSelectedMethod] = useState<string>("momo-new");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Data
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [savedMethods, setSavedMethods] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Structural States
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<
    "idle" | "initiating" | "awaiting_approval" | "success" | "failed"
  >("idle");
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize structural states
  useEffect(() => {
    setIsMounted(true);
    setIsMobile(window.innerWidth < 768);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Fetch initial data
  useEffect(() => {
    if (!open || !order) return;

    if (order?.user?.phone) {
      setPhoneNumber(order.user.phone);
    }

    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        // 1. Check if already paid
        const statusRes = await fetch(
          `/api/orders/transaction-status?orderId=${order.id}`
        );
        const statusData = await statusRes.json();

        if (statusData.isPaid) {
          setProcessingStep("success");
          setIsLoadingData(false);
          return;
        }

        // 2. Fetch Wallet Balance
        const walletRes = await fetch("/api/queries/personal-wallet-balance");
        if (walletRes.ok) {
          const walletData = await walletRes.json();
          if (walletData?.wallet?.balance) {
            setWalletBalance(parseFloat(walletData.wallet.balance));
          }
        }

        // 3. Fetch Saved Methods
        const methodsRes = await fetch("/api/queries/payment-methods");
        if (methodsRes.ok) {
          const methodsData = await methodsRes.json();
          if (methodsData?.paymentMethods) {
            setSavedMethods(
              methodsData.paymentMethods.filter(
                (m: any) =>
                  m.method.toLowerCase().includes("momo") ||
                  m.method.toLowerCase().includes("mtn")
              )
            );
          }
        }
      } catch (err) {
        console.error("Error fetching modal data:", err);
      }
      setIsLoadingData(false);
    };

    fetchData();
  }, [open, order]);

  const formatPhoneForMoMo = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("250")) return cleaned;
    if (cleaned.startsWith("07")) return `25${cleaned}`;
    if (cleaned.startsWith("7")) return `250${cleaned}`;
    return cleaned;
  };

  const handlePay = async () => {
    // A. Wallet Payment
    if (selectedMethod === "wallet") {
      if (walletBalance < order.total) {
        toaster.push(
          <Notification type="error" header="Insufficient Balance">
            Your wallet balance is lower than the order total.
          </Notification>,
          { placement: "topEnd" }
        );
        return;
      }

      setIsProcessing(true);
      setProcessingStep("initiating");

      try {
        const res = await fetch("/api/orders/pay-with-wallet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: order.id, orderType }),
        });
        const data = await res.json();

        if (data.success) {
          setProcessingStep("success");
          toaster.push(
            <Notification type="success" header="Payment Successful!">
              Your order was paid successfully using your Wallet!
            </Notification>,
            { placement: "topEnd", duration: 5000 }
          );
          if (onSuccess) onSuccess();
        } else {
          throw new Error(data.error || "Wallet payment failed");
        }
      } catch (err: any) {
        setProcessingStep("failed");
        setIsProcessing(false);
        toaster.push(
          <Notification type="error" header="Payment Failed">
            {err.message}
          </Notification>,
          { placement: "topEnd" }
        );
      }
      return;
    }

    // B. MoMo Payment
    let targetPhone = phoneNumber;
    if (selectedMethod !== "momo-new") {
      const method = savedMethods.find((m) => m.id === selectedMethod);
      if (method) targetPhone = method.number;
    }

    if (!targetPhone) {
      toaster.push(
        <Notification type="error" header="Phone Number Required">
          Please provide a valid MTN Mobile Money number.
        </Notification>,
        { placement: "topEnd" }
      );
      return;
    }

    const formattedPhone = formatPhoneForMoMo(targetPhone);
    if (
      !formattedPhone.startsWith("25078") &&
      !formattedPhone.startsWith("25079")
    ) {
      toaster.push(
        <Notification type="warning" header="Invalid MTN Number">
          Please enter a valid MTN Rwanda number (078... or 079...).
        </Notification>,
        { placement: "topEnd" }
      );
      return;
    }

    setIsProcessing(true);
    setProcessingStep("initiating");

    try {
      const payload: any = {
        amount: Math.round(order.total),
        currency: "RWF",
        payerNumber: formattedPhone,
        externalId: order.id,
        payerMessage: `Payment for Order ${
          order.OrderID || order.id.substring(0, 8)
        }`,
      };

      if (orderType === "reel") payload.reelOrderId = order.id;
      else if (orderType === "business") payload.businessOrderId = order.id;
      else if (orderType === "restaurant") payload.restaurantOrderId = order.id;
      else payload.orderId = order.id;

      const response = await fetch("/api/momo/request-to-pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.referenceId) {
        setProcessingStep("awaiting_approval");
        const referenceId = data.referenceId;

        // Poll for status
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = setInterval(async () => {
          try {
            const statusRes = await fetch(
              `/api/momo/request-to-pay-status?referenceId=${referenceId}`
            );
            const statusData = await statusRes.json();

            if (statusData.status === "SUCCESSFUL") {
              if (pollIntervalRef.current)
                clearInterval(pollIntervalRef.current);
              setProcessingStep("success");
              toaster.push(
                <Notification type="success" header="Payment Successful!">
                  Your payment was successful. The order is now accepted!
                </Notification>,
                { placement: "topEnd", duration: 5000 }
              );
              if (onSuccess) onSuccess();
            } else if (
              ["FAILED", "REJECTED", "EXPIRED"].includes(statusData.status)
            ) {
              if (pollIntervalRef.current)
                clearInterval(pollIntervalRef.current);
              setProcessingStep("failed");
              setIsProcessing(false);
              toaster.push(
                <Notification type="error" header="Payment Failed">
                  Your MTNMomo prompt expired or was rejected. Please try again.
                </Notification>,
                { placement: "topEnd", duration: 8000 }
              );
            }
          } catch (err) {
            console.error("Polling error:", err);
          }
        }, 3000);

        // Max polling timeout (3 mins)
        setTimeout(() => {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            if (processingStep !== "success") {
              setProcessingStep("failed");
              setIsProcessing(false);
              toaster.push(
                <Notification type="error" header="Payment Timeout">
                  We didn't receive a confirmation in time. Please check your
                  MoMo app.
                </Notification>,
                { placement: "topEnd", duration: 8000 }
              );
            }
          }
        }, 180000);
      } else {
        throw new Error(data.error || "Failed to initiate MoMo prompt.");
      }
    } catch (err: any) {
      setProcessingStep("failed");
      setIsProcessing(false);
      toaster.push(
        <Notification type="error" header="MoMo Request Failed">
          {err.message}
        </Notification>,
        { placement: "topEnd" }
      );
    }
  };

  const handleModalClose = () => {
    if (
      !isProcessing ||
      processingStep === "failed" ||
      processingStep === "success"
    ) {
      onClose();
    }
  };

  const isDark = theme === "dark";

  // Build selectpicker data
  const paymentOptions = [
    { label: `Wallet (${formatCurrency(walletBalance)})`, value: "wallet" },
  ];

  savedMethods.forEach((method) => {
    paymentOptions.push({
      label: `Ending in ...${method.number.slice(-4)} (${method.method})`,
      value: method.id,
    });
  });

  paymentOptions.push({ label: "Use a new MoMo number", value: "momo-new" });

  if (!open || !isMounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[999999] flex items-end justify-center bg-black/70 p-0 backdrop-blur-md sm:items-center sm:p-4">
      <div
        className={`w-full max-w-[550px] rounded-t-2xl border-0 shadow-2xl sm:rounded-2xl ${
          isDark
            ? "bg-gray-800 sm:border-gray-700"
            : "bg-white sm:border-gray-200"
        } sm:border`}
      >
        {/* Header */}
        <div
          className={`flex flex-shrink-0 items-center justify-between border-b p-4 md:p-5 ${
            isDark
              ? "rounded-t-2xl border-gray-700 bg-gray-800 sm:rounded-t-2xl"
              : "rounded-t-2xl border-gray-200 bg-gradient-to-r from-orange-50 to-yellow-50 sm:rounded-t-2xl"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`rounded-full p-2 ${
                isDark ? "bg-orange-600" : "bg-orange-100"
              }`}
            >
              <svg
                className={`h-6 w-6 ${
                  isDark ? "text-white" : "text-orange-600"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h2
                className={`text-xl font-bold ${
                  isDark ? "text-gray-100" : "text-gray-800"
                }`}
              >
                Complete Payment
              </h2>
            </div>
          </div>
          {(!isProcessing ||
            processingStep === "failed" ||
            processingStep === "success") && (
            <button
              onClick={handleModalClose}
              className={`rounded-xl p-2 transition-colors ${
                isDark
                  ? "text-gray-400 hover:bg-gray-700"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
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
          )}
        </div>

        {/* Body */}
        <div
          className={`max-h-[70vh] overflow-y-auto px-6 py-4 sm:px-8 ${
            isDark ? "bg-gray-800" : "bg-white"
          }`}
        >
          {isLoadingData ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500"></div>
              <p className={isDark ? "text-gray-400" : "text-gray-500"}>
                Verifying Order Status...
              </p>
            </div>
          ) : processingStep === "awaiting_approval" ? (
            <div className="py-8 text-center">
              <div className="relative mb-4 inline-block h-20 w-20">
                <span className="absolute inset-0 animate-ping rounded-full border-4 border-yellow-200 opacity-75"></span>
                <span className="relative flex h-full w-full items-center justify-center rounded-full bg-yellow-100">
                  <span className="h-12 w-12 animate-pulse rounded-full bg-yellow-400"></span>
                </span>
              </div>
              <h4
                className={`mb-2 text-lg font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Check your Phone
              </h4>
              <p
                className={`text-sm ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                A push notification has been sent to your MoMo number. Please
                enter your PIN to approve the payment.
              </p>
            </div>
          ) : processingStep === "success" ? (
            <div className="py-6 text-center">
              <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-10 w-10 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h4
                className={`mb-2 text-lg font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Payment Completed!
              </h4>
              <p
                className={`mb-6 text-sm ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                We've received your payment.
              </p>
              <button
                className="w-full rounded-xl bg-green-500 py-3 font-bold text-white shadow-lg transition-colors hover:bg-green-600"
                onClick={onSuccess}
              >
                Continue
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Order Info */}
              <div
                className={`rounded-xl p-4 ${
                  isDark ? "bg-gray-900/50" : "bg-gray-50"
                }`}
              >
                <div className="mb-2 flex justify-between">
                  <span
                    className={`text-sm ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Order ID
                  </span>
                  <span
                    className={`font-semibold ${
                      isDark ? "text-gray-200" : "text-gray-700"
                    }`}
                  >
                    #{order?.OrderID || order?.id?.substring(0, 8)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span
                    className={`text-sm ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Amount Due
                  </span>
                  <span className="text-lg font-bold text-orange-500">
                    {formatCurrency(order?.total || 0)}
                  </span>
                </div>
              </div>

              <div>
                <label
                  className={`mb-2 block text-sm font-semibold ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Select Payment Method
                </label>
                <select
                  value={selectedMethod}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className={`w-full appearance-none rounded-xl border-2 py-3 pl-4 pr-10 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    isDark
                      ? "border-gray-600 bg-gray-700 text-white focus:border-orange-500"
                      : "border-gray-300 bg-white text-gray-900 focus:border-orange-500"
                  }`}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='${
                      isDark ? "%239ca3af" : "%236b7280"
                    }' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: "right 0.5rem center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "1.5em 1.5em",
                  }}
                >
                  {paymentOptions.map((opt, idx) => (
                    <option key={idx} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {selectedMethod === "momo-new" && (
                <div>
                  <label
                    className={`mb-2 block text-sm font-semibold ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    MTN Mobile Money Number
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <span className="font-medium text-gray-500">+250</span>
                    </div>
                    <input
                      type="tel"
                      value={phoneNumber.replace(/^(250|\+250)/, "")}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="78XXXXXXX"
                      className={`w-full rounded-xl border-2 py-3 pl-16 pr-4 outline-none transition duration-200
                         ${
                           isDark
                             ? "border-gray-600 bg-gray-700 text-white focus:border-orange-500"
                             : "border-gray-300 bg-white text-gray-900 focus:border-orange-500"
                         }`}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isLoadingData &&
          processingStep !== "success" &&
          processingStep !== "awaiting_approval" && (
            <div
              className={`flex flex-shrink-0 items-center justify-end gap-3 p-4 md:p-5 ${
                isDark
                  ? "rounded-b-2xl border-t border-gray-700 bg-gray-800 sm:rounded-b-2xl"
                  : "rounded-b-2xl bg-white sm:rounded-b-2xl"
              }`}
            >
              <div className="flex w-full gap-3">
                <button
                  onClick={handlePay}
                  disabled={isProcessing}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 ${
                    isProcessing
                      ? "cursor-not-allowed bg-orange-400"
                      : "bg-orange-500 hover:bg-orange-600 hover:shadow-orange-500/25"
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <svg
                        className="h-5 w-5 animate-spin text-white"
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
                    `Pay ${formatCurrency(order?.total || 0)}`
                  )}
                </button>
              </div>
            </div>
          )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
