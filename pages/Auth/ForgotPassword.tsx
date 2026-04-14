import React, { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
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
      toast.success("Reset link sent to your email!");
      // router.push(`/Auth/ResetPassword?token=${data.token}`);
    } catch (err: any) {
      console.error("Forgot password error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 ${theme === 'dark' ? 'bg-[#000]' : 'bg-[#fafafa]'}`}>
      <Head>
        <title>Forgot Password | Plas</title>
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
          {isSent ? (
            <div className="text-center animate-in fade-in zoom-in duration-500">
              <div className={`inline-flex items-center justify-center p-4 rounded-3xl mb-8 ${theme === 'dark' ? 'bg-green-500/10' : 'bg-green-50'}`}>
                <Mail className="h-12 w-12 text-green-600" />
              </div>
              <h2 className={`text-3xl font-black tracking-tight mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Check Your Email
              </h2>
              <p className="text-gray-500 font-medium mb-10 leading-relaxed">
                We've sent a secure password reset link and verification code to <span className="text-green-600 font-bold">{email}</span>. Please click the link in the email to continue.
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => setIsSent(false)}
                  className="w-full rounded-2xl bg-green-600 py-4 text-sm font-black text-white hover:bg-green-700 transition-all shadow-xl shadow-green-600/20 active:scale-95"
                >
                  Resend Link
                </button>
                <Link
                  href="/Auth/Login"
                  className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-green-600 transition-colors"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <div className={`inline-flex items-center justify-center p-3 rounded-2xl mb-6 ${theme === 'dark' ? 'bg-green-500/10' : 'bg-green-50'}`}>
                  <ShieldCheck className="h-10 w-10 text-green-600" />
                </div>
                <h2 className={`text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Forgot Password?
                </h2>
                <p className="mt-3 text-sm text-gray-500 font-medium">
                  Don't worry, it happens. Enter your email and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSendResetLink} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="email" className={`block text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
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
                        theme === 'dark'
                          ? 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-500'
                          : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                      } ${error ? 'border-red-500 ring-red-500' : ''}`}
                      required
                    />
                  </div>
                  {error && (
                    <p className="mt-2 text-sm font-bold text-red-500 flex items-center animate-in fade-in slide-in-from-top-1">
                      <span className="mr-1">⚠️</span> {error}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative flex w-full justify-center items-center rounded-2xl bg-green-600 py-4 px-4 text-sm font-black text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-green-600/20 active:scale-[0.98]"
                >
                  {isLoading ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  ) : (
                    <span className="flex items-center">
                      Send Reset Link <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  )}
                </button>
              </form>

              <div className="mt-10 text-center">
                <Link
                  href="/Auth/Login"
                  className="inline-flex items-center text-sm font-bold text-green-600 hover:text-green-500 transition-colors"
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
