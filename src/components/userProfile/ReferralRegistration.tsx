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
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpVerified, setOtpVerified] = useState(false);
  const digitRefs = [
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
  ];

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

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/user");
        const data = await response.json();
        if (data.user) {
          setFormData((prev) => ({
            ...prev,
            name: data.user.name || "",
            email: data.user.email || "",
            phone: data.user.phone || prev.phone,
          }));
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUserData();
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
      const response = await fetch("/api/referrals/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formData.phone }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send OTP");
      }

      setShowOTPModal(true);
      toast.success("Verification code sent!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);

    // Auto-focus next input
    if (value && index < 5) {
      digitRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      digitRefs[index - 1].current?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const code = otpDigits.join("");
    if (code.length !== 6) {
      toast.error("Please enter the 6-digit OTP code");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/referrals/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: formData.phone,
          code: code,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "OTP verification failed");
      }

      setOtpVerified(true);
      setShowOTPModal(false);
      toast.success("Phone number verified!");
      setStep(2);
    } catch (error: any) {
      toast.error(error.message || "OTP verification failed. Please try again.");
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
                disabled // Pull information for user from the database cause we already have them
                className="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 text-sm text-gray-500 placeholder-gray-400 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
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
                {!otpVerified && (
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={loading || !formData.phone}
                    className="rounded-xl bg-green-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {!otpVerified ? "Verify" : "Change"}
                  </button>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {!otpVerified
                  ? "We'll send a verification code to this number"
                  : "Phone number verified successfully"}
              </p>
            </div>

            {/* OTP Modal */}
            {showOTPModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <div
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                  onClick={() => setShowOTPModal(false)}
                />

                {/* Modal Content */}
                <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-gray-800">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-center text-white">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
                      <svg
                        className="h-8 w-8 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold">Verify Phone</h3>
                    <p className="mt-1 text-sm text-green-50/80">
                      Enter the 6-digit code sent to
                      <span className="block font-semibold">
                        {formData.phone}
                      </span>
                    </p>
                  </div>

                  <div className="p-8">
                    <div className="mb-8 flex justify-between gap-2">
                      {otpDigits.map((digit, index) => (
                        <input
                          key={index}
                          ref={digitRefs[index]}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) =>
                            handleDigitChange(index, e.target.value)
                          }
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          className="h-12 w-full rounded-xl border-2 border-gray-200 bg-gray-50 text-center text-xl font-bold text-gray-900 transition-all focus:border-green-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-green-500/10 dark:border-gray-700 dark:bg-gray-700 dark:text-white dark:focus:border-green-500"
                        />
                      ))}
                    </div>

                    <div className="space-y-4">
                      <button
                        type="button"
                        onClick={handleVerifyOTP}
                        disabled={loading || otpDigits.join("").length !== 6}
                        className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {loading ? "Verifying..." : "Verify Code"}
                      </button>

                      <button
                        type="button"
                        onClick={handleSendOTP}
                        disabled={loading}
                        className="text-primary-600 hover:text-primary-700 w-full text-center text-sm font-medium transition-colors dark:text-green-400 dark:hover:text-green-300"
                      >
                        Didn't receive code? Resend
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowOTPModal(false)}
                        className="w-full text-center text-sm font-medium text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
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
                disabled // Pull information for user from the database cause we already have them
                className="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 text-sm text-gray-500 placeholder-gray-400 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
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
                  <span className="text-gray-600 dark:text-gray-400">
                    Name:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formData.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Phone:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formData.phone}
                  </span>
                </div>
                {formData.email && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Email:
                    </span>
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
                <li>
                  • Your application will be reviewed (usually within 24 hours)
                </li>
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
