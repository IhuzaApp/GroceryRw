import Link from "next/link";
import React, { useState } from "react";
import { Checkbox, Button } from "rsuite";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { useAuth } from "../../../../context/AuthContext";

export default function UserLogin() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  // capture redirect param if any
  const { redirect } = router.query as { redirect?: string };
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await signIn("credentials", {
        redirect: false,
        identifier,
        password,
      });
      if (res?.error) {
        toast.error(res.error);
      } else {
        // mark as logged in in AuthContext
        login();
        toast.success("Logged in successfully!");
        router.push(redirect || "/");
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    }
  };
  return (
    <form onSubmit={handleLogin}>
      <div className="mb-4">
        <label
          htmlFor="identifier"
          className="mb-2 block text-gray-700 dark:text-gray-300"
        >
          Email, Username, or Phone Number
        </label>
        <input
          id="identifier"
          type="text"
          placeholder="Enter your email, username, or phone number"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="w-full rounded-none border border-gray-300 px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          required
        />
      </div>

      <div className="mb-6">
        <label
          htmlFor="password"
          className="mb-2 block text-gray-700 dark:text-gray-300"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-none border border-gray-300 px-3 py-2 pr-10 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {showPassword ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Checkbox
            checked={rememberMe}
            onChange={(_, checked) => setRememberMe(checked)}
            className="text-sm text-gray-600"
          >
            Remember me
          </Checkbox>
        </div>
        <Link
          href="/auth/forgot-password"
          className="text-sm text-green-600 hover:text-green-800"
        >
          Forgot password?
        </Link>
      </div>

      <Button
        appearance="primary"
        type="submit"
        className="mb-4 w-full rounded-md bg-green-500 py-3 text-white hover:bg-green-600"
      >
        Sign in
      </Button>

      <Button
        appearance="default"
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border py-3"
      >
        <svg viewBox="0 0 24 24" width="18" height="18">
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
      </Button>
    </form>
  );
}
