import React, { useState, useEffect } from "react";
import { Loader, Message, useToaster } from "rsuite";
import LogsTable from "@components/logs/LogsTable";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import "./logs.css";

interface SystemLog {
  id: string;
  type: string;
  message: string;
  component: string;
  details: any;
  timestamp: string;
}

interface LogsPageProps {
  initialLogs: SystemLog[];
  initialTotal: number;
  initialAuthenticated: boolean;
  initialUser: any;
}

const LogsPage: React.FC<LogsPageProps> = ({
  initialLogs,
  initialTotal,
  initialAuthenticated,
  initialUser,
}) => {
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const [user, setUser] = useState(initialUser);
  const [step, setStep] = useState<"login" | "2fa" | "setup-2fa">("login");
  const [loading, setLoading] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [tempToken, setTempToken] = useState("");
  const toaster = useToaster();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/project-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", identifier, password }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Login failed");

      if (data.step === "2fa" || data.step === "setup-2fa") {
        setStep(data.step);
        setTempToken(data.tempToken);
        toaster.push(
          <Message type="info">
            {data.step === "setup-2fa"
              ? "2FA setup required. Check your email for the code."
              : "A 2FA code has been sent to your email."}
          </Message>,
          { placement: "topCenter" }
        );
      } else {
        setAuthenticated(true);
        setUser(data.user);
      }
    } catch (err: any) {
      toaster.push(<Message type="error">{err.message}</Message>, {
        placement: "topCenter",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/project-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify-2fa", code: otp, tempToken }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Verification failed");

      setAuthenticated(true);
      setUser(data.user);
      toaster.push(
        <Message type="success">
          Welcome back, {data.user.username || "Admin"}
        </Message>
      );
    } catch (err: any) {
      toaster.push(<Message type="error">{err.message}</Message>, {
        placement: "topCenter",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/project-user", { method: "DELETE" });
    setAuthenticated(false);
    setUser(null);
    setStep("login");
    setIdentifier("");
    setPassword("");
    setOtp("");
  };

  if (!authenticated) {
    return (
      <div className="flex min-h-screen bg-white">
        <Head>
          <title>Dev Access | Plas</title>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
            rel="stylesheet"
          />
        </Head>

        {/* Left Panel - Branding */}
        <div
          className="relative hidden flex-col justify-between overflow-hidden p-16 lg:flex lg:w-1/2"
          style={{
            background:
              "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)",
          }}
        >
          {/* Animated background orbs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
              className="absolute right-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full opacity-20"
              style={{
                background: "radial-gradient(circle, #8b5cf6, transparent 70%)",
              }}
            />
            <div
              className="absolute bottom-[-10%] left-[-10%] h-[400px] w-[400px] rounded-full opacity-20"
              style={{
                background: "radial-gradient(circle, #a855f7, transparent 70%)",
              }}
            />
            <div
              className="absolute left-[30%] top-[40%] h-[300px] w-[300px] rounded-full opacity-10"
              style={{
                background: "radial-gradient(circle, #d8b4fe, transparent 70%)",
              }}
            />
          </div>

          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          {/* Logo */}
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/10 shadow-lg">
                <Image
                  src="/assets/logos/plasIcon.png"
                  alt="Plas Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div>
                <div className="text-lg font-black leading-none tracking-tight text-white">
                  Plas
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-purple-300">
                  Dev Console
                </div>
              </div>
            </div>
          </div>

          {/* Center content */}
          <div className="relative z-10 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1">
                <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400"></div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/70">
                  Systems Operational
                </span>
              </div>
              <h2 className="text-5xl font-black leading-tight tracking-tighter text-white">
                Infrastructure
                <br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: "linear-gradient(90deg, #c084fc, #f0abfc)",
                  }}
                >
                  Command Center
                </span>
              </h2>
              <p className="max-w-sm text-lg leading-relaxed text-slate-400">
                Real-time system observability and log management for
                Plas&apos;s core infrastructure.
              </p>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3">
              {[
                "Live Error Stream",
                "Slack Alerts",
                "2FA Secured",
                "Auto Cleanup",
              ].map((f) => (
                <div
                  key={f}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-bold text-white/60"
                >
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom footer */}
          <div className="relative z-10 text-xs font-bold text-slate-600">
            © {new Date().getFullYear()} Plas Technologies · All rights reserved
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="flex flex-1 flex-col items-center justify-center bg-white p-8 sm:p-16">
          <div className="w-full max-w-[400px] space-y-8">
            {step === "login" ? (
              <>
                {/* Header */}
                <div className="space-y-2">
                  <div className="mb-6 flex items-center gap-2 lg:hidden">
                    <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-purple-50">
                      <Image
                        src="/assets/logos/plasIcon.png"
                        alt="Plas Logo"
                        width={32}
                        height={32}
                        className="object-contain"
                      />
                    </div>
                    <span className="text-sm font-black text-slate-900">
                      Plas Dev Console
                    </span>
                  </div>
                  <h1 className="text-3xl font-black tracking-tight text-slate-900">
                    Welcome back
                  </h1>
                  <p className="text-sm font-medium text-slate-400">
                    Sign in to access the infrastructure dashboard.
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                      Identity
                    </label>
                    <input
                      type="text"
                      placeholder="Username or email"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                      disabled={loading}
                      className="h-14 w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 text-sm font-semibold text-slate-900 transition-all placeholder:text-slate-300 focus:border-purple-500 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                      Security Key
                    </label>
                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="h-14 w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 text-sm font-semibold text-slate-900 transition-all placeholder:text-slate-300 focus:border-purple-500 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-sm font-black text-white transition-all active:scale-95 disabled:opacity-60"
                    style={{
                      background: loading
                        ? "#64748b"
                        : "linear-gradient(135deg, #9256f9ff, #8b5cf6)",
                    }}
                  >
                    {loading ? (
                      <>
                        <Loader size="sm" /> Verifying Identity...
                      </>
                    ) : (
                      <>
                        Authenticate <span className="text-purple-200">→</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-100"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                    Secure Access
                  </span>
                  <div className="h-px flex-1 bg-slate-100"></div>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-xs text-emerald-600">
                    🔒
                  </div>
                  <p className="text-[11px] font-medium text-slate-400">
                    Two-factor authentication is mandatory for all project
                    developers.
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* 2FA / Setup Header */}
                <div className="space-y-2">
                  <div
                    className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
                    style={{
                      background: step === "setup-2fa" ? "#fef3c7" : "#ede9fe",
                    }}
                  >
                    {step === "setup-2fa" ? "🛡️" : "📱"}
                  </div>
                  <h1 className="text-3xl font-black tracking-tight text-slate-900">
                    {step === "setup-2fa" ? "Enable 2FA" : "Verify Identity"}
                  </h1>
                  <p className="text-sm font-medium text-slate-400">
                    {step === "setup-2fa"
                      ? "Your account requires mandatory two-factor authentication. Enter the code we sent to your email to activate it."
                      : "A 6-digit verification code was sent to your registered email address."}
                  </p>
                </div>

                <form onSubmit={handleVerify2FA} className="space-y-6">
                  {/* OTP Boxes */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="000000"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, ""))
                      }
                      required
                      autoFocus
                      className="h-16 w-full rounded-2xl border-2 border-slate-100 bg-slate-50 text-center font-mono text-3xl font-black tracking-[0.5em] text-slate-900 transition-all placeholder:text-slate-200 focus:border-purple-500 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length < 6}
                    className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-sm font-black text-white transition-all active:scale-95 disabled:opacity-60"
                    style={{
                      background: loading
                        ? "#64748b"
                        : step === "setup-2fa"
                        ? "linear-gradient(135deg, #d97706, #f59e0b)"
                        : "linear-gradient(135deg, #7c3aed, #8b5cf6)",
                    }}
                  >
                    {loading ? (
                      <>
                        <Loader size="sm" /> Verifying...
                      </>
                    ) : step === "setup-2fa" ? (
                      "Activate 2FA & Access →"
                    ) : (
                      "Verify & Enter Console →"
                    )}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={() => {
                    setStep("login");
                    setOtp("");
                  }}
                  className="w-full text-center text-sm font-bold text-slate-400 transition-colors hover:text-slate-600"
                >
                  ← Back to sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen flex-col bg-slate-50"
      style={{
        backgroundImage:
          "radial-gradient(at 0% 0%, rgba(124, 58, 237, 0.04) 0px, transparent 50%)",
      }}
    >
      <Head>
        <title>System Logs | Dev Dashboard</title>
      </Head>

      <main className="flex-1 p-3 sm:p-6 md:p-10">
        <div className="mx-auto max-w-7xl">
          <LogsTable
            initialLogs={initialLogs}
            initialTotal={initialTotal}
            user={user}
            onLogout={handleLogout}
          />
        </div>
      </main>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req } = context;
  const token = req.cookies.project_admin_session;

  let authenticated = false;
  let user = null;

  if (token) {
    try {
      const jwt = require("jsonwebtoken");
      const JWT_SECRET = process.env.NEXTAUTH_SECRET || "dev-secret-key";
      user = jwt.verify(token, JWT_SECRET);
      authenticated = true;
    } catch (e) {
      // Token invalid
    }
  }

  try {
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const host = req.headers.host || "localhost:3000";
    const baseUrl = `${protocol}://${host}`;

    // Only fetch logs if authenticated to save resources
    let initialLogs = [];
    let initialTotal = 0;

    if (authenticated) {
      const response = await fetch(`${baseUrl}/api/logs/read`);
      if (response.ok) {
        const data = await response.json();
        initialLogs = data.logs;
        initialTotal = data.total;
      }
    }

    return {
      props: {
        initialLogs,
        initialTotal,
        initialAuthenticated: authenticated,
        initialUser: user,
      },
    };
  } catch (error) {
    console.error("Error in getServerSideProps:", error);
    return {
      props: {
        initialLogs: [],
        initialTotal: 0,
        initialAuthenticated: authenticated,
        initialUser: user,
      },
    };
  }
};

export default LogsPage;
