"use client";

import { useState, useRef, useEffect } from "react";
import {
  X,
  Wallet,
  DollarSign,
  Camera,
  AlertCircle,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import { formatCurrencySync } from "../../../utils/formatCurrency";
import { useTheme } from "../../../context/ThemeContext";
import toast from "react-hot-toast";

const STEPS = [
  { id: 1, label: "Amount" },
  { id: 2, label: "Review" },
  { id: 3, label: "Verify" },
  { id: 4, label: "Confirm" },
];

interface WalletType {
  id: string;
  availableBalance: number;
  reservedBalance: number;
}

export interface RequestPayoutPayload {
  amount: number;
  verification_image: string;
  otp: string;
  phoneNumber: string;
}

interface RequestPayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: WalletType | null;
  defaultPhoneNumber?: string;
  onSubmit: (payload: RequestPayoutPayload) => Promise<void>;
}

export function RequestPayoutModal({
  isOpen,
  onClose,
  wallet,
  defaultPhoneNumber = "",
  onSubmit,
}: RequestPayoutModalProps) {
  const { theme } = useTheme();
  const [step, setStep] = useState(1);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withDrawChargesPct, setWithDrawChargesPct] = useState<number>(0);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [verificationImage, setVerificationImage] = useState<string>("");
  const [otp, setOtp] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(defaultPhoneNumber);
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const walletBalance = wallet?.availableBalance ?? 0;

  // Sync default phone when modal opens
  useEffect(() => {
    if (isOpen) setPhoneNumber(defaultPhoneNumber);
  }, [isOpen, defaultPhoneNumber]);

  // Fetch system config for withdraw charges
  useEffect(() => {
    if (!isOpen || step !== 2) return;
    let cancelled = false;
    setConfigLoaded(false);
    fetch("/api/queries/system-configuration")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const config = data.config || {};
        const raw = config.withDrawCharges;
        const pct =
          typeof raw === "number"
            ? raw
            : typeof raw === "string"
              ? parseFloat(raw) || 0
              : 0;
        setWithDrawChargesPct(pct);
        setConfigLoaded(true);
      })
      .catch(() => {
        if (!cancelled) {
          setWithDrawChargesPct(0);
          setConfigLoaded(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, step]);

  // Camera for step 3
  useEffect(() => {
    if (!isOpen || step !== 3) return;
    let stream: MediaStream | null = null;
    const start = async () => {
      setCameraError(null);
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Camera not supported");
        }
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (e) {
        setCameraError(e instanceof Error ? e.message : "Could not access camera");
      }
    };
    start();
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [isOpen, step]);

  const handleAmountChange = (value: string) => {
    const regex = /^\d*\.?\d*$/;
    if (regex.test(value) || value === "") setWithdrawAmount(value);
  };

  const setPercentage = (percentage: number) => {
    if (wallet) setWithdrawAmount((walletBalance * percentage).toFixed(2));
  };

  const amount = parseFloat(withdrawAmount) || 0;
  const chargeAmount = amount * (withDrawChargesPct / 100);
  const netAmount = amount - chargeAmount;
  const remainingBalance = walletBalance - amount;

  const canProceedStep1 =
    amount > 0 && amount <= walletBalance && !isProcessing;
  const canProceedStep2 = configLoaded && !isProcessing;
  const canProceedStep3 = !!verificationImage && !isProcessing;
  const canProceedStep4 =
    otp.length === 6 && otpSent && !isProcessing && phoneNumber.trim() !== "";

  const handleNextStep1 = () => {
    if (!canProceedStep1) return;
    if (amount > walletBalance) {
      toast.error("Insufficient balance");
      return;
    }
    setStep(2);
  };

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth) return;
    const w = video.videoWidth;
    const h = video.videoHeight;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    setVerificationImage(canvas.toDataURL("image/jpeg", 0.85));
  };

  const handleSendOtp = async () => {
    setSendingOtp(true);
    try {
      const res = await fetch("/api/auth/send-withdraw-otp", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      setOtpSent(true);
      const code = data.otp ?? data.devOTP;
      if (code) {
        alert(`Your withdrawal verification code is: ${code}`);
      }
      toast.success("Enter the code below to confirm.");
    } catch (e: any) {
      toast.error(e?.message || "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleConfirm = async () => {
    if (!canProceedStep4) return;
    if (!phoneNumber.trim()) {
      toast.error("Please enter a phone number");
      return;
    }
    try {
      setIsProcessing(true);
      await onSubmit({
        amount,
        verification_image: verificationImage,
        otp,
        phoneNumber: phoneNumber.trim(),
      });
      toast.success("Payout request submitted successfully");
      resetAndClose();
    } catch (e: any) {
      toast.error(e?.message || "Failed to submit payout request");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setWithdrawAmount("");
    setVerificationImage("");
    setOtp("");
    setPhoneNumber(defaultPhoneNumber);
    setOtpSent(false);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isProcessing) resetAndClose();
  };

  if (!isOpen) return null;

  const isDark = theme === "dark";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className={`w-full max-w-md overflow-hidden rounded-2xl shadow-2xl ${
          isDark ? "bg-gray-800" : "bg-white"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between border-b p-4 ${
            isDark ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div>
            <h2
              className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Request Payout
            </h2>
            <p
              className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}
            >
              Step {step} of 4: {STEPS[step - 1].label}
            </p>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            disabled={isProcessing}
            className={`rounded-lg p-1 ${isDark ? "text-gray-400 hover:bg-gray-700 hover:text-gray-300" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"} disabled:opacity-50`}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step indicator */}
        <div
          className={`flex border-b px-4 py-2 ${isDark ? "border-gray-700" : "border-gray-200"}`}
        >
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className={`flex flex-1 items-center justify-center gap-0.5 text-xs ${
                step >= s.id
                  ? "text-green-600 dark:text-green-400"
                  : isDark
                    ? "text-gray-500"
                    : "text-gray-400"
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full ${
                  step > s.id
                    ? "bg-green-500 text-white"
                    : step === s.id
                      ? "border-2 border-green-500 bg-green-50 dark:bg-green-900/20"
                      : isDark
                        ? "bg-gray-700"
                        : "bg-gray-100"
                }`}
              >
                {step > s.id ? (
                  <CheckCircle className="h-3.5 w-3.5 text-white" />
                ) : (
                  s.id
                )}
              </span>
              {i < STEPS.length - 1 && (
                <ChevronRight className="h-3 w-3 opacity-50" />
              )}
            </div>
          ))}
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-6">
          {/* Step 1: Amount */}
          {step === 1 && (
            <div className="space-y-5">
              <div
                className={`rounded-xl border p-4 ${
                  isDark
                    ? "border-green-800 bg-green-900/20"
                    : "border-green-200 bg-green-50"
                }`}
              >
                <div className="mb-1 flex items-center gap-2">
                  <Wallet
                    className={`h-4 w-4 ${isDark ? "text-green-400" : "text-green-600"}`}
                  />
                  <span
                    className={`text-sm font-medium ${isDark ? "text-green-200" : "text-green-900"}`}
                  >
                    Available Balance
                  </span>
                </div>
                <p
                  className={`text-2xl font-bold ${isDark ? "text-green-400" : "text-green-700"}`}
                >
                  {formatCurrencySync(walletBalance)}
                </p>
              </div>
              <div>
                <label
                  className={`mb-2 block text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}
                >
                  Withdrawal Amount *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={withdrawAmount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="0.00"
                    className={`w-full rounded-xl border py-3 pl-10 pr-16 text-lg font-semibold focus:ring-2 focus:ring-green-500 ${
                      isDark
                        ? "border-gray-600 bg-gray-700 text-white focus:border-green-500"
                        : "border-gray-300 text-gray-900 focus:border-green-500"
                    }`}
                    disabled={isProcessing}
                  />
                  <span
                    className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}
                  >
                    RWF
                  </span>
                </div>
              </div>
              <div>
                <label
                  className={`mb-2 block text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}
                >
                  Quick select
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[0.25, 0.5, 0.75, 1].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setPercentage(pct)}
                      disabled={isProcessing || walletBalance <= 0}
                      className={`rounded-lg border-2 py-2.5 text-sm font-semibold transition-all disabled:opacity-50 ${
                        isDark
                          ? "border-gray-600 bg-gray-700 text-gray-300 hover:border-green-500 hover:bg-green-900/20"
                          : "border-gray-200 bg-white text-gray-700 hover:border-green-500 hover:bg-green-50 hover:text-green-700"
                      }`}
                    >
                      {pct === 1 ? "Max" : `${pct * 100}%`}
                    </button>
                  ))}
                </div>
              </div>
              {amount > 0 && (
                <div
                  className={`rounded-xl border p-4 ${isDark ? "border-gray-600 bg-gray-700/50" : "border-gray-200 bg-gray-50"}`}
                >
                  <div
                    className={`flex justify-between text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}
                  >
                    <span>Withdrawal:</span>
                    <span
                      className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
                    >
                      {formatCurrencySync(amount)}
                    </span>
                  </div>
                  <div
                    className={`mt-2 flex justify-between border-t pt-2 ${isDark ? "border-gray-600" : "border-gray-200"}`}
                  >
                    <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                      Remaining:
                    </span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      {formatCurrencySync(remainingBalance)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Review charges & net */}
          {step === 2 && (
            <div className="space-y-5">
              {!configLoaded ? (
                <div
                  className={`py-8 text-center ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  Loading...
                </div>
              ) : (
                <>
                  <div
                    className={`rounded-xl border p-4 ${isDark ? "border-gray-600 bg-gray-700/50" : "border-gray-200 bg-gray-50"}`}
                  >
                    <h3
                      className={`mb-3 text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
                    >
                      Payout summary
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                          Withdrawal amount
                        </span>
                        <span
                          className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}
                        >
                          {formatCurrencySync(amount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                          Withdraw charges ({withDrawChargesPct}%)
                        </span>
                        <span className="font-medium text-red-600 dark:text-red-400">
                          -{formatCurrencySync(chargeAmount)}
                        </span>
                      </div>
                      <div
                        className={`border-t pt-3 ${isDark ? "border-gray-600" : "border-gray-200"}`}
                      >
                        <div className="flex justify-between">
                          <span
                            className={`font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}
                          >
                            You will receive
                          </span>
                          <span className="text-lg font-bold text-green-600 dark:text-green-400">
                            {formatCurrencySync(netAmount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`flex items-start gap-2 rounded-xl border p-3 ${
                      isDark
                        ? "border-blue-800 bg-blue-900/20"
                        : "border-blue-200 bg-blue-50"
                    }`}
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                    <p
                      className={`text-xs ${isDark ? "text-blue-200" : "text-blue-800"}`}
                    >
                      Payout requests are processed within 24 hours. You
                      will need to verify your identity and confirm with an OTP
                      in the next steps.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 3: Face verification */}
          {step === 3 && (
            <div className="space-y-4">
              <p
                className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
              >
                Position your face in the circle and take a photo for
                verification.
              </p>
              {cameraError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
                  {cameraError}
                </div>
              ) : verificationImage ? (
                <div className="relative overflow-hidden rounded-xl bg-black">
                  <img
                    src={verificationImage}
                    alt="Verification"
                    className="aspect-video w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-32 w-32 rounded-full border-4 border-white/60 bg-transparent" />
                  </div>
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setVerificationImage("")}
                      className="rounded-lg bg-black/60 px-4 py-2 text-sm font-medium text-white"
                    >
                      Retake
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
                  <video
                    ref={videoRef}
                    className="h-full w-full object-cover"
                    playsInline
                    muted
                  />
                  <div className="absolute inset-0 flex pointer-events-none items-center justify-center">
                    <div className="h-40 w-40 rounded-full border-4 border-dashed border-green-400/80 bg-transparent" />
                  </div>
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                    <button
                      type="button"
                      onClick={handleCapture}
                      className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-400"
                    >
                      <Camera className="h-4 w-4" />
                      Take picture
                    </button>
                  </div>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}

          {/* Step 4: OTP + phone */}
          {step === 4 && (
            <div className="space-y-4">
              <p
                className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
              >
                A verification code was shown in the popup. Enter it below and
                the phone number where you want to receive the funds.
              </p>

              <div>
                <label
                  className={`mb-2 block text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}
                >
                  Phone number to receive funds *
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. 0781234567"
                  className={`w-full rounded-xl border py-3 px-4 focus:ring-2 focus:ring-green-500 ${
                    isDark
                      ? "border-gray-600 bg-gray-700 text-white focus:border-green-500"
                      : "border-gray-300 text-gray-900 focus:border-green-500"
                  }`}
                  disabled={isProcessing}
                />
              </div>

              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp}
                  className="w-full rounded-xl border-2 border-green-500 bg-green-50 py-3 text-sm font-semibold text-green-800 transition hover:bg-green-100 disabled:opacity-50 dark:bg-green-900/20 dark:text-green-200 dark:hover:bg-green-900/30"
                >
                  {sendingOtp ? "Sending..." : "Send OTP"}
                </button>
              ) : (
                <>
                  <div>
                    <label
                      className={`mb-2 block text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      OTP Code
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                        setOtp(v);
                      }}
                      placeholder="000000"
                      className={`w-full rounded-xl border py-3 px-4 text-center text-2xl font-mono tracking-[0.5em] focus:ring-2 focus:ring-green-500 ${
                        isDark
                          ? "border-gray-600 bg-gray-700 text-white focus:border-green-500"
                          : "border-gray-300 text-gray-900 focus:border-green-500"
                      }`}
                      disabled={isProcessing}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp}
                    className="text-sm text-green-600 hover:underline dark:text-green-400"
                  >
                    Resend OTP
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`flex justify-between gap-3 border-t p-4 ${
            isDark ? "border-gray-700 bg-gray-700/50" : "border-gray-200 bg-gray-50"
          }`}
        >
          {step > 1 && step < 4 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              disabled={isProcessing}
              className={`rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-50 ${
                isDark
                  ? "border-gray-600 text-gray-400 hover:bg-gray-600"
                  : "border-gray-300 text-gray-600 hover:bg-gray-100"
              }`}
            >
              Back
            </button>
          )}
          {step === 1 && (
            <>
              <button
                type="button"
                onClick={resetAndClose}
                disabled={isProcessing}
                className={`rounded-lg border px-4 py-2 text-sm ${
                  isDark
                    ? "border-gray-600 text-gray-400 hover:bg-gray-600"
                    : "border-gray-300 text-gray-600 hover:bg-gray-100"
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleNextStep1}
                disabled={!canProceedStep1}
                className="ml-auto rounded-lg bg-green-500 px-5 py-2 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50"
              >
                Next
              </button>
            </>
          )}
          {step === 2 && (
            <div className="flex w-full justify-end gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={isProcessing}
                className={`rounded-lg border px-4 py-2 text-sm ${
                  isDark
                    ? "border-gray-600 text-gray-400 hover:bg-gray-600"
                    : "border-gray-300 text-gray-600 hover:bg-gray-100"
                }`}
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={!canProceedStep2}
                className="rounded-lg bg-green-500 px-5 py-2 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
          {step === 3 && (
            <div className="flex w-full justify-end gap-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={isProcessing}
                className={`rounded-lg border px-4 py-2 text-sm ${
                  isDark
                    ? "border-gray-600 text-gray-400 hover:bg-gray-600"
                    : "border-gray-300 text-gray-600 hover:bg-gray-100"
                }`}
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                disabled={!canProceedStep3}
                className="rounded-lg bg-green-500 px-5 py-2 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
          {step === 4 && (
            <>
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={isProcessing}
                className={`rounded-lg border px-4 py-2 text-sm ${
                  isDark
                    ? "border-gray-600 text-gray-400 hover:bg-gray-600"
                    : "border-gray-300 text-gray-600 hover:bg-gray-100"
                }`}
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!canProceedStep4}
                className="ml-auto rounded-lg bg-green-500 px-5 py-2 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Submitting...
                  </span>
                ) : (
                  "Confirm payout"
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
