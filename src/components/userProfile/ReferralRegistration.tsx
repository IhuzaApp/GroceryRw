import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface ReferralRegistrationProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

export default function ReferralRegistration({
  onSuccess,
  onClose,
}: ReferralRegistrationProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [deviceFingerprint, setDeviceFingerprint] = useState<string>("");

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });

  // OTP verification
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);

  // Get device fingerprint on mount
  useEffect(() => {
    const getFingerprint = async () => {
      try {
        // Simple fingerprint using available browser APIs
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.textBaseline = "top";
          ctx.font = "14px Arial";
          ctx.fillText("Device fingerprint", 2, 2);
        }
        const canvasHash = canvas.toDataURL();

        const fingerprint = btoa(
          JSON.stringify({
            screen: `${window.screen.width}x${window.screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
            platform: navigator.platform,
            userAgent: navigator.userAgent,
            canvas: canvasHash.substring(0, 50),
            hardwareConcurrency: navigator.hardwareConcurrency || 0,
          })
        ).substring(0, 32);

        setDeviceFingerprint(fingerprint);
      } catch (error) {
        // Fallback fingerprint
        setDeviceFingerprint(
          btoa(
            `${navigator.userAgent}-${window.screen.width}-${window.screen.height}`
          ).substring(0, 32)
        );
      }
    };

    getFingerprint();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSendOTP = async () => {
    if (!formData.phone || formData.phone.length < 9) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setLoading(true);
    try {
      // Simulate OTP sending (replace with actual API call)
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setOtpSent(true);
      toast.success("OTP sent to your phone");
    } catch (error) {
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast.error("Please enter the 6-digit OTP code");
      return;
    }

    setLoading(true);
    try {
      // Simulate OTP verification (replace with actual API call)
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // For demo: accept any 6-digit code starting with 1
      if (otpCode.startsWith("1")) {
        setOtpVerified(true);
        toast.success("Phone number verified!");
        setStep(2);
      } else {
        toast.error("Invalid OTP code. Please try again.");
      }
    } catch (error) {
      toast.error("OTP verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otpVerified) {
      toast.error("Please verify your phone number first");
      return;
    }

    setLoading(true);
    try {
      // Check for duplicates
      const duplicateCheck = await fetch("/api/referrals/check-duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: formData.phone,
          email: formData.email,
          deviceFingerprint: deviceFingerprint,
        }),
      });

      const duplicateResult = await duplicateCheck.json();

      if (duplicateResult.isDuplicate) {
        toast.error(duplicateResult.reason || "Account already exists");
        return;
      }

      // Submit registration
      const response = await fetch("/api/referrals/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email || "",
          deviceFingerprint: deviceFingerprint,
          phoneVerified: true,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Registration failed");
      }

      toast.success(
        "Registration submitted! Your application is under review."
      );
      
      // Trigger a recheck of referral status after successful registration
      // This will cause the parent component to refresh and show pending status
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 500);
    } catch (error: any) {
      toast.error(error.message || "Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Join Referral Program
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Earn money by referring friends! Complete the form below to get
          started.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold ${
            step >= 1
              ? "bg-green-500 text-white"
              : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
          }`}
        >
          1
        </div>
        <div
          className={`h-1 flex-1 ${
            step >= 2 ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"
          }`}
        />
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold ${
            step >= 2
              ? "bg-green-500 text-white"
              : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
          }`}
        >
          2
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:border-green-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="0781234567"
                  required
                  maxLength={10}
                  className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:border-green-500"
                />
                {!otpSent ? (
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={loading || !formData.phone}
                    className="rounded-xl bg-green-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Send OTP
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={loading}
                    className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Resend
                  </button>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                We'll send a verification code to this number
              </p>
            </div>

            {otpSent && !otpVerified && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                <label className="mb-2 block text-sm font-medium text-blue-900 dark:text-blue-200">
                  Enter OTP Code <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="123456"
                    maxLength={6}
                    className="flex-1 rounded-lg border border-blue-300 bg-white px-4 py-2 text-center text-lg font-semibold tracking-widest text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-blue-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOTP}
                    disabled={loading || otpCode.length !== 6}
                    className="rounded-lg bg-blue-500 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Verify
                  </button>
                </div>
                <p className="mt-2 text-xs text-blue-700 dark:text-blue-300">
                  Enter the 6-digit code sent to {formData.phone}
                </p>
              </div>
            )}

            {otpVerified && (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                <svg
                  className="h-5 w-5 text-green-600 dark:text-green-400"
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
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  Phone number verified!
                </span>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email (Optional)
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:border-green-500"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                For important updates and notifications
              </p>
            </div>

            {otpVerified && (
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 font-semibold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg active:scale-95"
              >
                Continue
              </button>
            )}
          </div>
        )}

        {/* Step 2: Review & Submit */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Review Info */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50">
              <h4 className="mb-3 font-semibold text-gray-900 dark:text-white">
                Review Your Information
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Name:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formData.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formData.phone}
                  </span>
                </div>
                {formData.email && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Email:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formData.email}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Info Box */}
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
              <h4 className="mb-2 font-semibold text-blue-900 dark:text-blue-200">
                What happens next?
              </h4>
              <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-300">
                <li>• Your application will be reviewed (usually within 24 hours)</li>
                <li>• You'll receive a notification once approved</li>
                <li>• Your unique referral code will be generated</li>
                <li>• Start earning 5% commission on referrals!</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 font-semibold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
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
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  "Submit Application"
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
