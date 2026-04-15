import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { Lock, Key, ArrowLeft, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useTheme } from "../../src/context/ThemeContext";

export default function ResetPassword() {
  const router = useRouter();
  const { token } = router.query;
  const { theme } = useTheme();

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // If we have a token in the query, we can assume the session is valid for now
  }, [token]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!otp.trim() || otp.length !== 6) {
      setError("Please enter the 6-digit verification code");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          otp,
          newPassword,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setIsSuccess(true);
      // toast.success("Password reset successfully!");

      // Auto-redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/Auth/Login");
      }, 3000);
    } catch (err: any) {
      console.error("Reset password error:", err);
      setError(err.message || "Invalid code or session expired.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div
        className={`flex min-h-screen flex-col justify-center px-4 py-12 sm:px-6 lg:px-8 ${
          theme === "dark" ? "bg-[#000]" : "bg-[#fafafa]"
        }`}
      >
        <div className="text-center duration-500 animate-in fade-in zoom-in sm:mx-auto sm:w-full sm:max-w-md">
          <div className="mb-10 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 scale-150 animate-pulse rounded-full bg-green-500/20 blur-2xl" />
              <CheckCircle2 className="relative z-10 h-20 w-20 text-green-500" />
            </div>
          </div>
          <h2
            className={`mb-4 text-4xl font-black tracking-tight ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Password Updated!
          </h2>
          <p className="mx-auto mb-10 max-w-sm font-medium text-gray-500">
            Your password has been successfully reset. We're taking you back to
            the login page in just a moment.
          </p>
          <Link
            href="/Auth/Login"
            className="inline-flex items-center justify-center rounded-2xl bg-green-600 px-12 py-4 text-sm font-black text-white shadow-xl shadow-green-600/20 transition-all hover:bg-green-700 active:scale-95"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // Handle Missing or Invalid Token
  if (!token && router.isReady) {
    return (
      <div
        className={`flex min-h-screen flex-col justify-center px-4 py-12 sm:px-6 lg:px-8 ${
          theme === "dark" ? "bg-[#000]" : "bg-[#fafafa]"
        }`}
      >
        <div className="text-center sm:mx-auto sm:w-full sm:max-w-md">
          <div
            className={`mb-8 inline-flex items-center justify-center rounded-3xl p-6 ${
              theme === "dark" ? "bg-red-500/10" : "bg-red-50"
            }`}
          >
            <Lock className="h-12 w-12 text-red-600" />
          </div>
          <h2
            className={`mb-4 text-4xl font-black tracking-tight ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Session Invalid
          </h2>
          <p className="mx-auto mb-12 max-w-sm font-medium text-gray-500">
            This password reset link is invalid, expired, or has already been
            used. Please request a new one.
          </p>
          <Link
            href="/Auth/ForgotPassword"
            className="inline-flex items-center justify-center rounded-2xl bg-gray-900 px-12 py-4 text-sm font-black text-white shadow-xl transition-all hover:opacity-90 active:scale-95 dark:bg-white dark:text-black"
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex min-h-screen flex-col justify-center px-4 py-12 sm:px-6 lg:px-8 ${
        theme === "dark" ? "bg-[#000]" : "bg-[#fafafa]"
      }`}
    >
      <Head>
        <title>Reset Password | Plas</title>
      </Head>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Image
            src="/assets/logos/PlasLogoPNG.png"
            alt="Plas Logo"
            width={180}
            height={70}
            className={`object-contain ${
              theme === "dark" ? "brightness-0 invert" : ""
            }`}
          />
        </div>

        <div
          className={`rounded-[32px] px-6 py-10 shadow-2xl sm:px-10 ${
            theme === "dark"
              ? "border border-gray-900 bg-[#0a0a0a] shadow-black"
              : "border border-gray-100 bg-white shadow-gray-200/50"
          }`}
        >
          <div className="mb-10 text-center">
            <h2
              className={`text-3xl font-black tracking-tight ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              New Password
            </h2>
            <p className="mt-3 text-sm font-medium text-gray-500">
              Enter the verification code sent to your email to set a new
              password.
            </p>
          </div>

          {error && (
            <div className="mb-6 duration-300 animate-in fade-in zoom-in">
              <div className="flex items-start space-x-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-600">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="text-sm font-bold">Verification Error</p>
                  <p className="text-xs font-medium opacity-90">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-6">
            {/* OTP Input */}
            <div className="space-y-2">
              <label
                htmlFor="otp"
                className={`block text-sm font-semibold ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Verification Code
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="otp"
                  type="text"
                  maxLength={6}
                  placeholder="6-digit code from your email"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className={`block w-full rounded-2xl border py-4 pl-12 pr-4 text-sm font-bold tracking-[5px] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    theme === "dark"
                      ? "border-gray-700 bg-gray-800/50 text-white placeholder-gray-500"
                      : "border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400"
                  }`}
                  required
                />
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label
                htmlFor="p1"
                className={`block text-sm font-semibold ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                New Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="p1"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`block w-full rounded-2xl border py-4 pl-12 pr-12 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    theme === "dark"
                      ? "border-gray-700 bg-gray-800/50 text-white placeholder-gray-500"
                      : "border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400"
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 transition-colors hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-2">
              <label
                htmlFor="p2"
                className={`block text-sm font-semibold ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Confirm New Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="p2"
                  type="password"
                  placeholder="Re-type your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`block w-full rounded-2xl border py-4 pl-12 pr-4 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    theme === "dark"
                      ? "border-gray-700 bg-gray-800/50 text-white placeholder-gray-500"
                      : "border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400"
                  }`}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full items-center justify-center rounded-2xl bg-green-600 px-4 py-4 text-sm font-black text-white shadow-xl shadow-green-600/20 transition-all duration-200 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                "Update Password"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link
              href="/Auth/Login"
              className="inline-flex items-center text-sm font-bold text-gray-500 transition-colors hover:text-green-600"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Cancel reset
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
