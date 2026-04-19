import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import {
  CheckCircle2,
  AlertCircle,
  UserPlus,
  Phone,
  ShieldCheck,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
} from "lucide-react";
import { useTheme } from "../../../../context/ThemeContext";

interface UserRegistrationProps {
  isOtpSent?: boolean;
  setIsOtpSent?: (val: boolean) => void;
  onSuccess?: () => void;
}

export default function UserRegistration({
  isOtpSent: externalIsOtpSent,
  setIsOtpSent: externalSetIsOtpSent,
  onSuccess,
}: UserRegistrationProps) {
  const [internalIsOtpSent, setInternalIsOtpSent] = useState(false);

  // Use external state if provided, otherwise fallback to internal
  const isOtpSent =
    externalIsOtpSent !== undefined ? externalIsOtpSent : internalIsOtpSent;
  const setIsOtpSent = externalSetIsOtpSent || setInternalIsOtpSent;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("male");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const [otp, setOtp] = useState("");
  const router = useRouter();
  const { theme } = useTheme();
  const { redirect } = router.query as { redirect?: string };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation checks
    setError("");
    if (!name.trim()) {
      setError("Please enter your full name");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }
    if (!phone.trim()) {
      setError("Please enter your phone number");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!agreeTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/send-registration-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone, gender }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send verification code");
      }
      setIsOtpSent(true);
      setError(""); // Clear any previous errors
    } catch (err: any) {
      console.error("OTP send error:", err);
      setError(
        err.message || "Failed to send verification code. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    setError("");
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/verify-registration-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }

      setIsSuccess(true);
      if (onSuccess) onSuccess();

      // Redirect after delay for smooth transition
      const targetPath = redirect
        ? `/Auth/Login?redirect=${encodeURIComponent(redirect)}`
        : "/Auth/Login";

      setTimeout(() => {
        router.push(targetPath);
      }, 2200); // Slightly longer to allow progress bar to finish
    } catch (err: any) {
      console.error("Verification error:", err);
      setError(err.message || "Invalid or expired code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await signIn("google", { callbackUrl: redirect || "/" });
    } catch (err) {
      console.error("Google sign-up error:", err);
      setError("Failed to sign up with Google");
    }
  };

  useEffect(() => {
    if (isSuccess) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 2;
        });
      }, 30);
      return () => clearInterval(interval);
    }
  }, [isSuccess]);

  return isSuccess ? (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 duration-500 animate-in fade-in ${
        theme === "dark" ? "bg-[#000]" : "bg-white"
      }`}
    >
      <div className="w-full max-w-sm text-center">
        <div className="mb-10 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 scale-[2.5] animate-pulse rounded-full bg-green-500/20 blur-3xl" />
            <CheckCircle2 className="relative z-10 h-24 w-24 text-green-500" />
          </div>
        </div>

        <h2
          className={`mb-2 text-4xl font-black tracking-tight ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          Account Created!
        </h2>
        <p className="mb-12 font-medium text-gray-500">
          Verification successful. Finalizing your account setup...
        </p>

        <div className="space-y-4">
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
            <div
              className="absolute inset-y-0 left-0 bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)] transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-sm font-bold">
            <span className="text-green-500">
              {progress < 100 ? "Setting things up..." : "Ready!"}
            </span>
            <span
              className={theme === "dark" ? "text-gray-400" : "text-gray-600"}
            >
              {progress}%
            </span>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="space-y-6">
      {error && (
        <div className="duration-300 animate-in fade-in slide-in-from-top-1">
          <div
            className={`flex items-start space-x-3 rounded-2xl border p-4 ${
              theme === "dark"
                ? "border-red-500/20 bg-red-500/10 text-red-400"
                : "border-red-100 bg-red-50 text-red-600"
            }`}
          >
            <AlertCircle className="mt-0.5 h-5 w-5" />
            <div className="text-sm font-bold">{error}</div>
          </div>
        </div>
      )}

      <form
        onSubmit={isOtpSent ? handleVerifyOtp : handleRegister}
        className="space-y-4"
      >
        {!isOtpSent ? (
          <>
            {/* Full Name Input */}
            <div className="space-y-1">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Full Name
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-3 text-gray-900 placeholder-gray-500 transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-green-400 dark:focus:ring-green-400"
                  required
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-3 text-gray-900 placeholder-gray-500 transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-green-400 dark:focus:ring-green-400"
                  required
                />
              </div>
            </div>

            {/* Phone Number Input */}
            <div className="space-y-1">
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Phone Number
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-3 text-gray-900 placeholder-gray-500 transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-green-400 dark:focus:ring-green-400"
                  required
                />
              </div>
            </div>

            {/* Gender Selection */}
            <div className="space-y-1">
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Gender
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="block w-full rounded-xl border border-gray-300 px-3 py-2.5 text-gray-900 transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-400 dark:focus:ring-green-400"
                required
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-12 text-gray-900 placeholder-gray-500 transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-green-400 dark:focus:ring-green-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition-colors duration-200 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <ShieldCheck className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-3 text-gray-900 placeholder-gray-500 transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-green-400 dark:focus:ring-green-400"
                  required
                />
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-center">
              <input
                id="agreeTerms"
                name="agreeTerms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-green-600 transition-colors duration-200 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <label
                htmlFor="agreeTerms"
                className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
              >
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="text-green-600 hover:text-green-500"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-green-600 hover:text-green-500"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={isLoading || !agreeTerms}
              className="group relative flex w-full justify-center rounded-xl border border-transparent bg-green-600 px-4 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-800"
            >
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <UserPlus className="h-5 w-5 text-white/70" />
                )}
              </span>
              {isLoading ? "Sending Code..." : "Create Account"}
            </button>

            {/* Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500 dark:bg-[#171717] dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleSignUp}
              className="inline-flex w-full justify-center rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800"
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign up with Google
            </button>

            {/* Apple Sign In Button */}
            <button
              type="button"
              onClick={() => signIn("apple", { callbackUrl: redirect || "/" })}
              className="mt-3 inline-flex w-full justify-center rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 dark:border-gray-600 dark:bg-black dark:text-gray-200 dark:hover:bg-gray-900 dark:focus:ring-offset-gray-800"
            >
              <svg className="mr-2 h-5 w-5 fill-current" viewBox="0 0 384 512">
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.1-44.6-35.9-2.8-74.3 22.7-93.1 22.7-18.9 0-50.5-22.1-79.6-21.5-38.3.7-73.4 22.1-93.5 56.6-40.4 69.2-10.4 171.7 28.5 228.3 19 27.5 41.5 58.7 71.9 57.5 29.1-1.3 40.5-19.1 75.3-19.1 34.7 0 45.4 19.1 75.6 18.6 31.4-.5 50.8-30.2 69.6-57.5 21.6-31.4 30.6-61.9 31.1-63.5-.7-.3-59.2-22.6-58.8-92.7zM245.5 107.5c16.1-19.6 27-46.7 24-73.8-23.4 1-52.1 15.6-69.2 35.2-13.8 15.6-26.7 43.6-22.9 69.7 26.2 2 52.1-11.5 68.1-31.1z" />
              </svg>
              Sign up with Apple
            </button>
          </>
        ) : (
          <>
            <div className="space-y-4 text-center">
              <div className="mb-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Verification code sent to
                  <br />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {phone}
                  </span>
                </p>
              </div>

              <div className="space-y-4 text-left">
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Verification Code
                </label>
                <div className="relative">
                  {/* Hidden real input for accessibility and mobile keyboard */}
                  <input
                    id="otp"
                    type="text"
                    maxLength={6}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    className="absolute inset-0 z-10 h-full w-full cursor-default opacity-0"
                    autoFocus
                    required
                  />

                  {/* Premium Grid UI */}
                  <div className="grid grid-cols-6 gap-2">
                    {[...Array(6)].map((_, index) => (
                      <div
                        key={index}
                        className={`flex h-12 items-center justify-center rounded-xl border-2 text-2xl font-bold transition-all duration-200 ${
                          otp.length === index
                            ? "border-green-500 ring-2 ring-green-500/20 dark:border-green-400"
                            : otp.length > index
                            ? "border-gray-300 bg-gray-50/50 dark:border-gray-600 dark:bg-gray-800/50"
                            : "border-gray-200 dark:border-gray-700"
                        } ${
                          otp[index]
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-400"
                        }`}
                      >
                        {otp[index] || (otp.length === index ? "•" : "")}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="group relative flex w-full justify-center rounded-xl border border-transparent bg-green-600 px-4 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-800"
              >
                {isLoading ? "Verifying..." : "Verify & Create Account"}
              </button>

              <button
                type="button"
                onClick={() => setIsOtpSent(false)}
                className="text-sm font-medium text-green-600 hover:text-green-500 dark:text-green-400"
              >
                ← Back to Registration
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
