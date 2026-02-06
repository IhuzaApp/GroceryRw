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
import { formatCurrencySync } from "../../utils/formatCurrency";
import toast from "react-hot-toast";

const STEPS = [
  { id: 1, label: "Amount" },
  { id: 2, label: "Review" },
  { id: 3, label: "Verify" },
  { id: 4, label: "Confirm" },
];

interface RequestWithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletBalance: number;
  onSubmit: (payload: {
    amount: number;
    verificationImage: string;
    otp: string;
  }) => Promise<void>;
}

export function RequestWithdrawModal({
  isOpen,
  onClose,
  walletBalance,
  onSubmit,
}: RequestWithdrawModalProps) {
  const [step, setStep] = useState(1);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withDrawChargesPct, setWithDrawChargesPct] = useState<number>(0);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [verificationImage, setVerificationImage] = useState<string>("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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
    setWithdrawAmount((walletBalance * percentage).toFixed(2));
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
    otp.length === 6 && otpSent && !isProcessing;

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
        // Show OTP in a popup on screen (same as PaymentModal)
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
    try {
      setIsProcessing(true);
      await onSubmit({
        amount,
        verificationImage,
        otp,
      });
      toast.success("Withdrawal request submitted successfully");
      resetAndClose();
    } catch (e: any) {
      toast.error(e?.message || "Failed to submit withdrawal request");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setWithdrawAmount("");
    setVerificationImage("");
    setOtp("");
    setOtpSent(false);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isProcessing) resetAndClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Request Withdrawal
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Step {step} of 4: {STEPS[step - 1].label}
            </p>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            disabled={isProcessing}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex border-b border-gray-200 px-4 py-2 dark:border-gray-700">
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className={`flex flex-1 items-center justify-center gap-0.5 text-xs ${
                step >= s.id
                  ? "text-yellow-600 dark:text-yellow-400"
                  : "text-gray-400 dark:text-gray-500"
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full ${
                  step > s.id
                    ? "bg-yellow-500 text-black"
                    : step === s.id
                      ? "border-2 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                      : "bg-gray-100 dark:bg-gray-700"
                }`}
              >
                {step > s.id ? <CheckCircle className="h-3.5 w-3.5" /> : s.id}
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
              <div className="rounded-xl border border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50 p-4 dark:border-yellow-800 dark:from-yellow-900/20 dark:to-amber-900/20">
                <div className="mb-1 flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-900 dark:text-yellow-200">
                    Available Balance
                  </span>
                </div>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                  {formatCurrencySync(walletBalance)}
                </p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Withdrawal Amount *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={withdrawAmount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-16 text-lg font-semibold focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    disabled={isProcessing}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500 dark:text-gray-400">
                    RWF
                  </span>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Quick select
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[0.25, 0.5, 0.75, 1].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setPercentage(pct)}
                      disabled={isProcessing || walletBalance <= 0}
                      className="rounded-lg border-2 border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-700 transition-all hover:border-yellow-500 hover:bg-yellow-50 hover:text-yellow-700 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:border-yellow-500 dark:hover:bg-yellow-900/20"
                    >
                      {pct === 1 ? "Max" : `${pct * 100}%`}
                    </button>
                  ))}
                </div>
              </div>
              {amount > 0 && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700/50">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Withdrawal:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrencySync(amount)}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 dark:border-gray-600">
                    <span className="text-gray-600 dark:text-gray-400">Remaining:</span>
                    <span className="font-bold text-yellow-600 dark:text-yellow-400">
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
                <div className="py-8 text-center text-gray-500">Loading...</div>
              ) : (
                <>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700/50">
                    <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                      Withdrawal summary
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Withdrawal amount</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatCurrencySync(amount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Withdraw charges ({withDrawChargesPct}%)
                        </span>
                        <span className="font-medium text-red-600 dark:text-red-400">
                          -{formatCurrencySync(chargeAmount)}
                        </span>
                      </div>
                      <div className="border-t border-gray-200 pt-3 dark:border-gray-600">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            You will receive
                          </span>
                          <span className="text-lg font-bold text-green-600 dark:text-green-400">
                            {formatCurrencySync(netAmount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      Withdrawal requests are processed within 1–3 business days. You will need to
                      verify your identity and confirm with an OTP in the next steps.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 3: Face verification */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Position your face in the circle and take a photo for verification.
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
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="h-40 w-40 rounded-full border-4 border-dashed border-yellow-400/80 bg-transparent" />
                  </div>
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                    <button
                      type="button"
                      onClick={handleCapture}
                      className="flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-400"
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

          {/* Step 4: OTP */}
          {step === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                A verification code was shown in the popup. Enter it below to confirm your withdrawal.
              </p>
              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp}
                  className="w-full rounded-xl border-2 border-yellow-500 bg-yellow-50 py-3 text-sm font-semibold text-yellow-800 transition hover:bg-yellow-100 disabled:opacity-50 dark:bg-yellow-900/20 dark:text-yellow-200 dark:hover:bg-yellow-900/30"
                >
                  {sendingOtp ? "Sending..." : "Send OTP"}
                </button>
              ) : (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                      className="w-full rounded-xl border border-gray-300 py-3 px-4 text-center text-2xl font-mono tracking-[0.5em] focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      disabled={isProcessing}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp}
                    className="text-sm text-yellow-600 hover:underline dark:text-yellow-400"
                  >
                    Resend OTP
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between gap-3 border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50">
          {step > 1 && step < 4 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              disabled={isProcessing}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-600"
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
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleNextStep1}
                disabled={!canProceedStep1}
                className="ml-auto rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 px-5 py-2 text-sm font-medium text-black disabled:opacity-50"
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
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={!canProceedStep2}
                className="rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 px-5 py-2 text-sm font-medium text-black disabled:opacity-50"
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
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                disabled={!canProceedStep3}
                className="rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 px-5 py-2 text-sm font-medium text-black disabled:opacity-50"
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
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!canProceedStep4}
                className="ml-auto rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 px-5 py-2 text-sm font-medium text-black disabled:opacity-50"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                    Submitting...
                  </span>
                ) : (
                  "Confirm withdrawal"
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
