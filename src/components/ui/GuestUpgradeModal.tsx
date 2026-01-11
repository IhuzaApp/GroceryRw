import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import { useTheme } from "../../context/ThemeContext";

interface GuestUpgradeModalProps {
  open: boolean;
  onClose: () => void;
}

export default function GuestUpgradeModal({
  open,
  onClose,
}: GuestUpgradeModalProps) {
  const { data: session, update } = useSession();
  const { theme } = useTheme();
  const [step, setStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("male");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [devOTP, setDevOTP] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when modal is closed
  const handleClose = () => {
    if (!isLoading) {
      setStep(1);
      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setGender("male");
      setShowPassword(false);
      setOtp("");
      setDevOTP(null);
      // Clean up localStorage
      localStorage.removeItem("pending_upgrade_otp");
      onClose();
    }
  };

  // Handle Escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open && !isLoading) {
        handleClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [open, isLoading]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/send-upgrade-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          gender,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP");
      }

      // Store OTP data in localStorage for verification
      if (data.devOTP) {
        const otpData = {
          otp: data.devOTP,
          email: email.trim().toLowerCase(),
          fullName: fullName.trim(),
          gender,
          password,
          expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
        };
        localStorage.setItem("pending_upgrade_otp", JSON.stringify(otpData));
        
        setDevOTP(data.devOTP);
        
        // Log to browser console
        console.log("=".repeat(60));
        console.log("🔐 OTP VERIFICATION CODE (Browser)");
        console.log("=".repeat(60));
        console.log(`Email: ${email}`);
        console.log(`OTP Code: ${data.devOTP}`);
        console.log(`Expires in: 10 minutes`);
        console.log("=".repeat(60));
        
        toast.success(`OTP sent! Check console (Dev: ${data.devOTP})`, {
          duration: 8000,
        });
      } else {
        toast.success("OTP sent to your email! Please check your inbox.");
      }

      // Move to step 2
      setStep(2);
    } catch (error: any) {
      console.error("Send OTP error:", error);
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);

    try {
      // Get OTP data from localStorage
      const storedDataStr = localStorage.getItem("pending_upgrade_otp");
      
      if (!storedDataStr) {
        throw new Error("OTP not found or expired. Please request a new one.");
      }

      const storedData = JSON.parse(storedDataStr);

      // Check if OTP is expired
      if (Date.now() > storedData.expiresAt) {
        localStorage.removeItem("pending_upgrade_otp");
        throw new Error("OTP has expired. Please request a new one.");
      }

      // Verify OTP
      if (storedData.otp !== otp) {
        throw new Error("Invalid OTP. Please try again.");
      }

      // OTP is valid! Now update the user in the database
      console.log("=".repeat(60));
      console.log("✅ OTP VERIFIED - Updating user in database...");
      console.log("=".repeat(60));

      const upgradeResponse = await fetch("/api/auth/upgrade-guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: storedData.fullName,
          email: storedData.email,
          password: storedData.password,
          gender: storedData.gender,
        }),
      });

      const upgradeData = await upgradeResponse.json();

      if (!upgradeResponse.ok) {
        throw new Error(upgradeData.error || "Failed to upgrade account");
      }

      // Clear localStorage
      localStorage.removeItem("pending_upgrade_otp");

      console.log("=".repeat(60));
      console.log("✅ ACCOUNT UPGRADED SUCCESSFULLY");
      console.log("=".repeat(60));
      console.log(`Name: ${storedData.fullName}`);
      console.log(`Email: ${storedData.email}`);
      console.log(`Gender: ${storedData.gender}`);
      console.log("=".repeat(60));

      toast.success("Account upgraded successfully! 🎉 Refreshing your account...", {
        duration: 2000,
      });

      console.log("=".repeat(60));
      console.log("✅ Upgrade complete! Reloading to refresh session...");
      console.log("=".repeat(60));

      // Close modal
      handleClose();

      // Force a complete page reload to refresh the session
      // This will fetch the updated user data from the database
      setTimeout(() => {
        console.log("Reloading page...");
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error("Verify OTP error:", error);
      toast.error(error.message || "Invalid or expired OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToStep1 = () => {
    setStep(1);
    setOtp("");
    // Keep devOTP and localStorage data so user can resend if needed
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/60 px-0 backdrop-blur-sm md:px-4"
      onClick={(e) => {
        // Close modal when clicking on backdrop
        if (e.target === e.currentTarget && !isLoading) {
          handleClose();
        }
      }}
    >
      <div
        className={`flex h-full w-full flex-col overflow-hidden shadow-2xl md:h-auto md:max-h-[90vh] md:max-w-2xl md:rounded-2xl ${
          theme === "dark"
            ? "border-gray-700 bg-gray-800"
            : "border-gray-200 bg-white"
        } md:border`}
      >
        {/* Header */}
        <div
          className={`flex flex-shrink-0 items-center justify-between border-b p-4 md:p-5 ${
            theme === "dark"
              ? "border-gray-700 bg-gray-800"
              : "border-gray-200 bg-white"
          }`}
        >
          <div>
            <h2
              className={`text-xl font-bold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Become a Plas Member
            </h2>
            <p
              className={`mt-1 text-xs ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Step {step} of 2
            </p>
          </div>
          <button
            onClick={handleClose}
            className={`rounded-xl p-2 transition-colors ${
              theme === "dark"
                ? "text-gray-400 hover:bg-gray-700"
                : "text-gray-500 hover:bg-gray-100"
            }`}
            disabled={isLoading}
            aria-label="Close"
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Info Banner */}
          <div
            className={`mb-6 rounded-xl border-2 p-4 ${
              theme === "dark"
                ? step === 1
                  ? "border-green-800 bg-green-900/20"
                  : "border-green-800 bg-green-900/20"
                : step === 1
                ? "border-green-200 bg-green-50"
                : "border-green-200 bg-green-50"
            }`}
          >
            <div className="flex items-start gap-3">
              <svg
                className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
                  theme === "dark"
                    ? step === 1
                      ? "text-green-400"
                      : "text-green-400"
                    : step === 1
                    ? "text-green-600"
                    : "text-green-600"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {step === 1 ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                )}
              </svg>
              <div className="flex-1">
                <h4
                  className={`mb-1 text-sm font-semibold ${
                    theme === "dark"
                      ? step === 1
                        ? "text-green-300"
                        : "text-blue-300"
                      : step === 1
                      ? "text-green-900"
                      : "text-blue-900"
                  }`}
                >
                  {step === 1
                    ? "🎉 Upgrade Your Account"
                    : "📧 Verify Your Email"}
                </h4>
                <p
                  className={`text-xs ${
                    theme === "dark"
                      ? step === 1
                        ? "text-green-400"
                        : "text-blue-400"
                      : step === 1
                      ? "text-green-700"
                      : "text-blue-700"
                  }`}
                >
                  {step === 1
                    ? "Complete your profile to access all Plas features including business marketplace, saved preferences, and more!"
                    : "We've sent a 6-digit verification code to your email. Please enter it below to complete your account upgrade."}
                </p>
                {step === 2 && devOTP && (
                  <p
                    className={`mt-2 text-xs font-mono font-bold ${
                      theme === "dark" ? "text-yellow-400" : "text-yellow-700"
                    }`}
                  >
                    DEV MODE: Your OTP is {devOTP}
                  </p>
                )}
              </div>
            </div>
          </div>

          {step === 1 ? (
            <form id="upgrade-form" onSubmit={handleSendOTP} className="space-y-5">
            {/* Full Name */}
            <div>
              <label
                className={`mb-2 block text-sm font-semibold ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
                disabled={isLoading}
                className={`w-full rounded-xl border px-4 py-3 text-sm shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                  theme === "dark"
                    ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20"
                    : "border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20"
                }`}
              />
            </div>

            {/* Email Address */}
            <div>
              <label
                className={`mb-2 block text-sm font-semibold ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
                required
                disabled={isLoading}
                className={`w-full rounded-xl border px-4 py-3 text-sm shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                  theme === "dark"
                    ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20"
                    : "border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20"
                }`}
              />
            </div>

            {/* Gender */}
            <div>
              <label
                className={`mb-2 block text-sm font-semibold ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                disabled={isLoading}
                className={`w-full rounded-xl border px-4 py-3 text-sm shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                  theme === "dark"
                    ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20"
                    : "border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20"
                }`}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Password */}
            <div>
              <label
                className={`mb-2 block text-sm font-semibold ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password (min 8 characters)"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  disabled={isLoading}
                  className={`w-full rounded-xl border px-4 py-3 pr-11 text-sm shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                    theme === "dark"
                      ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20"
                      : "border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                    theme === "dark"
                      ? "text-gray-400 hover:text-gray-300"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {showPassword ? (
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
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
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
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              <p
                className={`mt-1 text-xs ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Must be at least 8 characters long
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                className={`mb-2 block text-sm font-semibold ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                autoComplete="new-password"
                required
                disabled={isLoading}
                className={`w-full rounded-xl border px-4 py-3 text-sm shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                  confirmPassword && password !== confirmPassword
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : confirmPassword && password === confirmPassword
                    ? "border-green-500 focus:border-green-500 focus:ring-green-500/20"
                    : theme === "dark"
                    ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20"
                    : "border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20"
                } ${theme === "dark" ? "bg-gray-700 text-white placeholder-gray-400" : "bg-white text-gray-900 placeholder-gray-400"}`}
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-xs text-red-500">
                  Passwords do not match
                </p>
              )}
              {confirmPassword && password === confirmPassword && (
                <p className="mt-1 text-xs text-green-500">
                  Passwords match ✓
                </p>
              )}
            </div>
          </form>
          ) : (
            <form id="verify-otp-form" onSubmit={handleVerifyOTP} className="space-y-5">
              {/* OTP Input */}
              <div>
                <label
                  className={`mb-2 block text-sm font-semibold ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Verification Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 6) {
                      setOtp(value);
                    }
                  }}
                  placeholder="Enter 6-digit code"
                  required
                  maxLength={6}
                  disabled={isLoading}
                  className={`w-full rounded-xl border px-4 py-3 text-center text-2xl font-bold tracking-widest shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                    theme === "dark"
                      ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20"
                      : "border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-green-500 focus:ring-green-500/20"
                  }`}
                />
                <p
                  className={`mt-2 text-xs ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Check your email ({email}) for the verification code
                </p>
              </div>

              {/* Resend OTP */}
              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    // Resend OTP with existing form data
                    handleSendOTP(e as any);
                  }}
                  disabled={isLoading}
                  className={`text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                    theme === "dark"
                      ? "text-green-400 hover:text-green-300"
                      : "text-green-600 hover:text-green-700"
                  }`}
                >
                  Didn't receive the code? Resend OTP
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer - Fixed at bottom on mobile */}
        <div
          className={`sticky bottom-0 flex flex-shrink-0 items-center justify-end gap-3 border-t p-4 md:p-5 ${
            theme === "dark"
              ? "border-gray-700 bg-gray-800"
              : "border-gray-200 bg-white"
          }`}
        >
          {step === 1 ? (
            <>
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 md:px-5 ${
                  theme === "dark"
                    ? "border-2 border-gray-600 bg-gray-700 text-white hover:border-gray-500 hover:bg-gray-600 focus:ring-gray-500"
                    : "border-2 border-gray-300 bg-white text-gray-900 hover:border-gray-400 hover:bg-gray-50 focus:ring-gray-300"
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="upgrade-form"
                disabled={isLoading}
                className="inline-flex flex-1 items-center justify-center rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold !text-white shadow-lg transition-all duration-200 hover:bg-green-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-green-600 disabled:hover:shadow-lg md:flex-none md:px-5"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="mr-2 h-4 w-4 animate-spin !text-white"
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
                    <span className="!text-white">Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <span className="!text-white">Send OTP</span>
                    <svg
                      className="ml-2 h-4 w-4 !text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleBackToStep1}
                disabled={isLoading}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 md:px-5 ${
                  theme === "dark"
                    ? "border-2 border-gray-600 bg-gray-700 text-white hover:border-gray-500 hover:bg-gray-600 focus:ring-gray-500"
                    : "border-2 border-gray-300 bg-white text-gray-900 hover:border-gray-400 hover:bg-gray-50 focus:ring-gray-300"
                }`}
              >
                <svg
                  className="mr-2 inline h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 17l-5-5m0 0l5-5m-5 5h12"
                  />
                </svg>
                Back
              </button>
              <button
                type="submit"
                form="verify-otp-form"
                disabled={isLoading || otp.length !== 6}
                className="inline-flex flex-1 items-center justify-center rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold !text-white shadow-lg transition-all duration-200 hover:bg-green-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-green-600 disabled:hover:shadow-lg md:flex-none md:px-5"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="mr-2 h-4 w-4 animate-spin !text-white"
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
                    <span className="!text-white">Verifying...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="mr-2 h-4 w-4 !text-white"
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
                    <span className="!text-white">Verify & Upgrade</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
