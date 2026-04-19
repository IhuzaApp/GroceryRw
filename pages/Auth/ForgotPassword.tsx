import React, { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { Mail, ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { useTheme } from "../../src/context/ThemeContext";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send reset code");
      }

      setIsSent(true);
      // toast.success("Reset link sent to your email!");
    } catch (err: any) {
      console.error("Forgot password error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`flex min-h-screen flex-col justify-center px-4 py-12 sm:px-6 lg:px-8 ${
        theme === "dark" ? "bg-[#000]" : "bg-[#fafafa]"
      }`}
    >
      <Head>
        <title>Forgot Password | Plas</title>
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
          {isSent ? (
            <div className="text-center duration-500 animate-in fade-in zoom-in">
              <div
                className={`mb-8 inline-flex items-center justify-center rounded-3xl p-4 ${
                  theme === "dark" ? "bg-green-500/10" : "bg-green-50"
                }`}
              >
                <Mail className="h-12 w-12 text-green-600" />
              </div>
              <h2
                className={`mb-4 text-3xl font-black tracking-tight ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Check Your Email
              </h2>
              <p className="mb-10 font-medium leading-relaxed text-gray-500">
                We've sent a secure password reset link and verification code to{" "}
                <span className="font-bold text-green-600">{email}</span>.
                Please click the link in the email to continue.
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => setIsSent(false)}
                  className="w-full rounded-2xl bg-green-600 py-4 text-sm font-black text-white shadow-xl shadow-green-600/20 transition-all hover:bg-green-700 active:scale-95"
                >
                  Resend Link
                </button>
                <Link
                  href="/Auth/Login"
                  className="inline-flex items-center text-sm font-bold text-gray-500 transition-colors hover:text-green-600"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-10 text-center">
                <div
                  className={`mb-6 inline-flex items-center justify-center rounded-2xl p-3 ${
                    theme === "dark" ? "bg-green-500/10" : "bg-green-50"
                  }`}
                >
                  <ShieldCheck className="h-10 w-10 text-green-600" />
                </div>
                <h2
                  className={`text-3xl font-black tracking-tight ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  Forgot Password?
                </h2>
                <p className="mt-3 text-sm font-medium text-gray-500">
                  Don't worry, it happens. Enter your email and we'll send you a
                  link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSendResetLink} className="space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className={`block text-sm font-semibold ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      placeholder="Enter your registered email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`block w-full rounded-2xl border py-4 pl-12 pr-4 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        theme === "dark"
                          ? "border-gray-700 bg-gray-800/50 text-white placeholder-gray-500"
                          : "border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400"
                      } ${error ? "border-red-500 ring-red-500" : ""}`}
                      required
                    />
                  </div>
                  {error && (
                    <p className="mt-2 flex items-center text-sm font-bold text-red-500 animate-in fade-in slide-in-from-top-1">
                      <span className="mr-1">⚠️</span> {error}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative flex w-full items-center justify-center rounded-2xl bg-green-600 px-4 py-4 text-sm font-black text-white shadow-xl shadow-green-600/20 transition-all duration-200 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <span className="flex items-center">
                      Send Reset Link{" "}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  )}
                </button>
              </form>

              <div className="mt-10 text-center">
                <Link
                  href="/Auth/Login"
                  className="inline-flex items-center text-sm font-bold text-green-600 transition-colors hover:text-green-500"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
