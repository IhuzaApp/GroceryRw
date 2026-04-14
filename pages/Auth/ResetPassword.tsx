import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { Lock, Key, ArrowLeft, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useTheme } from "../../src/context/ThemeContext";

export default function ResetPassword() {
  const router = useRouter();
  const { email: queryEmail } = router.query;
  const { theme } = useTheme();

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // If we have an email in the query but no OTP, we might want to auto-focus OTP field
  }, [queryEmail]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp.trim() || otp.length !== 6) {
      toast.error("Please enter the 6-digit verification code");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: queryEmail,
          otp,
          newPassword,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setIsSuccess(true);
      toast.success("Password reset successfully!");
      
      // Auto-redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/Auth/Login");
      }, 3000);
    } catch (err: any) {
      console.error("Reset password error:", err);
      toast.error(err.message || "Invalid code or session expired.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={`min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 ${theme === 'dark' ? 'bg-[#000]' : 'bg-[#fafafa]'}`}>
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="flex justify-center mb-10 text-green-500">
            <CheckCircle2 className="h-20 w-20" />
          </div>
          <h2 className={`text-4xl font-black tracking-tight mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Password Updated!
          </h2>
          <p className="text-gray-500 font-medium mb-10">
            Your password has been successfully reset. You will be redirected to the login page momentarily.
          </p>
          <Link
            href="/Auth/Login"
            className="inline-flex items-center justify-center rounded-2xl bg-green-600 py-4 px-12 text-sm font-black text-white hover:bg-green-700 transition-all shadow-xl shadow-green-600/20 active:scale-95"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 ${theme === 'dark' ? 'bg-[#000]' : 'bg-[#fafafa]'}`}>
      <Head>
        <title>Reset Password | Plas</title>
      </Head>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/assets/logos/PlasLogoPNG.png"
            alt="Plas Logo"
            width={180}
            height={70}
            className={`object-contain ${theme === 'dark' ? 'brightness-0 invert' : ''}`}
          />
        </div>

        <div className={`py-10 px-6 sm:px-10 rounded-[32px] shadow-2xl ${theme === 'dark' ? 'bg-[#0a0a0a] border border-gray-900 shadow-black' : 'bg-white border border-gray-100 shadow-gray-200/50'}`}>
          <div className="text-center mb-10">
            <h2 className={`text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              New Password
            </h2>
            <p className="mt-3 text-sm text-gray-500 font-medium">
              Resetting password for <span className="text-green-600">{queryEmail}</span>
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-6">
            {/* OTP Input */}
            <div className="space-y-2">
              <label htmlFor="otp" className={`block text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
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
                  className={`block w-full rounded-2xl border py-4 pl-12 pr-4 text-sm tracking-[5px] font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    theme === 'dark'
                      ? 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-500'
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                  }`}
                  required
                />
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label htmlFor="p1" className={`block text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
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
                    theme === 'dark'
                      ? 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-500'
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-2">
              <label htmlFor="p2" className={`block text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
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
                    theme === 'dark'
                      ? 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-500'
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                  }`}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center items-center rounded-2xl bg-green-600 py-4 px-4 text-sm font-black text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-green-600/20 active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              ) : (
                "Update Password"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link
              href="/Auth/Login"
              className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-green-600 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Cancel reset
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
