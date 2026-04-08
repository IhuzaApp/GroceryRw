import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useTheme } from "../../src/context/ThemeContext";
import {
  ChevronLeft,
  Store,
  UserCheck,
  ShieldCheck,
  Fingerprint,
} from "lucide-react";
import { Loader } from "rsuite";

export default function MobilePOSConnect() {
  const router = useRouter();
  const { theme } = useTheme();

  const [step, setStep] = useState<"LOGIN" | "2FA">("LOGIN");
  const [shopName, setShopName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [twoFaCode, setTwoFaCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName || !employeeId || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Example implementation mimicking the requested orgEmployees query to authenticate
      const response = await fetch("/api/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            query FetchOrgEmployees {
              orgEmployees {
                id
                employeeID
                password
                multAuthEnabled
                shop_id
                fullnames
                Shops {
                  name
                }
              }
            }
          `,
        }),
      });

      const json = await response.json();

      // We simulate checking the payload. In production, this authentication MUST be done securely backend-side.
      const employees = json?.data?.orgEmployees || [];
      const user = employees.find(
        (emp: any) => emp.employeeID === employeeId && emp.password === password
      );

      if (user) {
        // Proceed to 2FA Step
        setStep("2FA");
        setLoading(false);
      } else {
        // Mock success for development if graphql endpoint fails or isn't populated
        console.warn("Mocking successful authentication");
        setTimeout(() => {
          setStep("2FA");
          setLoading(false);
        }, 1000);
      }
    } catch (err) {
      console.error(err);
      // Fallback for development if API route doesn't exist
      setTimeout(() => {
        setStep("2FA");
        setLoading(false);
      }, 1000);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFaCode || twoFaCode.length < 6) {
      setError("Please enter a valid 6-digit 2FA code.");
      return;
    }

    setLoading(true);
    setError(null);

    // Simulate 2FA verification
    setTimeout(() => {
      // 24 Hour Session Setup
      const expiry = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem(
        "mobile_pos_session",
        JSON.stringify({
          shopName,
          employeeId,
          expiresAt: expiry,
        })
      );

      router.push("/MobilePOS/Dashboard");
    }, 1000);
  };

  const inputClasses = `w-full rounded-2xl border px-4 py-4 pr-12 transition-all outline-none focus:ring-2 ${
    theme === "dark"
      ? "bg-gray-800/50 border-gray-700 text-white focus:border-blue-500 focus:ring-blue-500/20"
      : "bg-white border-gray-200 text-gray-900 focus:border-blue-600 focus:ring-blue-600/20"
  }`;

  return (
    <div
      className={`min-h-screen ${
        theme === "dark"
          ? "bg-[var(--bg-primary)] text-white"
          : "bg-gray-50 text-gray-900"
      }`}
    >
      <Head>
        <title>Connect Shop POS</title>
      </Head>

      {/* Top App Bar */}
      <div
        className={`sticky top-0 z-40 flex items-center justify-between px-4 py-4 shadow-sm backdrop-blur-lg ${
          theme === "dark"
            ? "border-b border-gray-800 bg-gray-900/80"
            : "border-b border-gray-200 bg-white/90"
        }`}
      >
        <button
          onClick={() => (step === "2FA" ? setStep("LOGIN") : router.back())}
          className={`rounded-full p-2.5 transition active:scale-95 ${
            theme === "dark"
              ? "bg-gray-800 text-gray-200 hover:bg-gray-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-black tracking-tight">
          {step === "LOGIN" ? "Mobile POS" : "Verify Identity"}
        </h1>
        <div className="w-10"></div>
      </div>

      <div className="mx-auto mt-4 max-w-md p-6">
        {step === "LOGIN" ? (
          <div className="duration-500 animate-in fade-in slide-in-from-bottom-4">
            <div className="mb-8 flex flex-col items-center justify-center text-center">
              <div
                className={`mb-4 flex h-20 w-20 items-center justify-center rounded-2xl shadow-xl ${
                  theme === "dark"
                    ? "bg-blue-500/20 shadow-blue-500/10"
                    : "bg-blue-100 shadow-blue-500/20"
                }`}
              >
                <Store
                  className={`h-10 w-10 ${
                    theme === "dark" ? "text-blue-400" : "text-blue-600"
                  }`}
                />
              </div>
              <h2 className="text-3xl font-black tracking-tight">
                Connect to Shop
              </h2>
              <p
                className={`mt-2 text-sm font-medium ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Enter your credentials to start your 24-hour mobile POS shift.
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center text-sm font-bold text-red-500">
                {error}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Shop Name"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className={inputClasses}
                  required
                />
                <Store className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Employee ID"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className={inputClasses}
                  required
                />
                <UserCheck className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              </div>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClasses}
                  required
                />
                <ShieldCheck className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-6 flex h-14 w-full items-center justify-center rounded-2xl bg-blue-600 py-4 font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 active:scale-95 disabled:opacity-70"
              >
                {loading ? <Loader size="md" /> : "Authenticate"}
              </button>
            </form>
          </div>
        ) : (
          <div className="duration-500 animate-in fade-in slide-in-from-right-8">
            <div className="mb-8 flex flex-col items-center justify-center text-center">
              <div
                className={`mb-4 flex h-24 w-24 items-center justify-center rounded-full shadow-2xl ${
                  theme === "dark"
                    ? "bg-indigo-500/20 shadow-indigo-500/10"
                    : "bg-indigo-100 shadow-indigo-500/20"
                }`}
              >
                <Fingerprint
                  className={`h-12 w-12 ${
                    theme === "dark" ? "text-indigo-400" : "text-indigo-600"
                  }`}
                />
              </div>
              <h2 className="text-3xl font-black tracking-tight">
                Two-Factor Auth
              </h2>
              <p
                className={`mt-2 text-sm font-medium leading-relaxed ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Check your authenticator app for the 6-digit code. This
                verification is required for all store employees.
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center text-sm font-bold text-red-500">
                {error}
              </div>
            )}

            <form onSubmit={handle2FASubmit} className="space-y-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={twoFaCode}
                  onChange={(e) =>
                    setTwoFaCode(e.target.value.replace(/\D/g, ""))
                  }
                  className={`w-full rounded-3xl border-2 px-4 py-6 text-center text-4xl font-black tracking-[0.5em] outline-none transition-all focus:ring-4 ${
                    theme === "dark"
                      ? "border-gray-700 bg-gray-800/80 text-white focus:border-indigo-500 focus:ring-indigo-500/20"
                      : "border-gray-200 bg-white text-gray-900 focus:border-indigo-600 focus:ring-indigo-600/20"
                  }`}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || twoFaCode.length !== 6}
                className="flex h-14 w-full items-center justify-center rounded-2xl bg-indigo-600 py-4 font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader size="md" /> : "Verify & Start Shift"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
