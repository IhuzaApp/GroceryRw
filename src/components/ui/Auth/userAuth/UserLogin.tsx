import Link from "next/link";
import React, { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useAuth } from "../../../../context/AuthContext";
import {
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  LogIn,
  User,
  Lock,
} from "lucide-react";
import { useTheme } from "../../../../context/ThemeContext";

export default function UserLogin({ onSuccess }: { onSuccess?: () => void }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const router = useRouter();
  const { theme } = useTheme();
  // capture redirect param if any
  const { redirect } = router.query as { redirect?: string };
  const { login } = useAuth();
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      setIsSuccess(false);
      setProgress(0);
    }
  }, [status]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation checks
    if (!identifier.trim()) {
      setError("Please enter your email, username, or phone number");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password");
      return;
    }

    setIsLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        identifier: identifier.trim(),
        password: password.trim(),
      });

      if (res?.error) {
        // Handle specific error messages
        if (res.error === "CredentialsSignin") {
          setError("Invalid email, username, phone, or password");
        } else if (res.error === "No user found") {
          setError("No account found with this information");
        } else if (res.error === "Invalid credentials") {
          setError("Invalid password");
        } else {
          setError(res.error);
        }
      } else if (res?.ok) {
        // mark as logged in in AuthContext
        login();
        setIsSuccess(true);
        if (onSuccess) onSuccess();

        // Redirect after a short delay for a "smooth" feel
        const redirectUrl = redirect || "/";
        setTimeout(() => {
          router.push(redirectUrl);
        }, 2200); // Slightly longer to allow progress bar to finish
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signIn("google", { callbackUrl: redirect || "/" });
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError("Failed to sign in with Google");
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

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 duration-500 animate-in fade-in bg-black/60 backdrop-blur-md">
        <div className="w-full max-w-sm text-center">
          <div className="mb-10 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 scale-[1.5] animate-pulse rounded-full bg-white/20 blur-2xl" />
              <img
                src="/assets/logos/PlasLogoPNG.png"
                alt="Plas Logo"
                className="relative z-10 h-20 sm:h-24 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] animate-pulse"
              />
            </div>
          </div>

          <h2 className="mb-2 text-4xl font-black tracking-tight text-white drop-shadow-md">
            Welcome Back!
          </h2>
          <p className="mb-12 font-medium text-gray-200 drop-shadow-sm">
            Signing you in. Preparing your dashboard...
          </p>

          <div className="space-y-4">
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="absolute inset-y-0 left-0 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm font-bold text-white drop-shadow-sm">
              <span>{progress < 100 ? "Security Check..." : "Ready!"}</span>
              <span>{progress}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
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

      <form onSubmit={handleLogin} className="space-y-4 lg:space-y-6">
        {/* Email/Username/Phone Input */}
        <div className="space-y-2">
          <label
            htmlFor="identifier"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Email, Username, or Phone Number
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="identifier"
              type="text"
              placeholder="Email, username, or phone"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="block w-full rounded-xl border border-gray-300 py-3 pl-10 pr-3 text-gray-900 placeholder-gray-500 transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-green-400 dark:focus:ring-green-400"
              autoComplete="username"
              required
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-2">
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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-xl border border-gray-300 py-3 pl-10 pr-12 text-gray-900 placeholder-gray-500 transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-green-400 dark:focus:ring-green-400"
              autoComplete="current-password"
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

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-green-600 transition-colors duration-200 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
            >
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <Link
              href="/Auth/ForgotPassword"
              className="font-medium text-green-600 transition-colors duration-200 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="group relative flex w-full justify-center rounded-xl border border-transparent bg-green-600 px-4 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-800"
        >
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <LogIn className="h-5 w-5 text-white/70" />
            )}
          </span>
          {isLoading ? "Signing in..." : "Sign in"}
        </button>

        {/* Divider */}
        <div className="relative">
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
          onClick={handleGoogleSignIn}
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
          Sign in with Google
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
          Sign in with Apple
        </button>
      </form>
    </div>
  );
}
