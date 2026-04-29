import React, { useState, useEffect } from "react";
import { Loader, Message, useToaster } from "rsuite";
import LogsTable from "@components/logs/LogsTable";
import { GetServerSideProps } from "next";
import Head from "next/head";
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
  initialUser
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
            {data.step === "setup-2fa" ? "2FA setup required. Check your email for the code." : "A 2FA code has been sent to your email."}
          </Message>,
          { placement: "topCenter" }
        );
      } else {
        setAuthenticated(true);
        setUser(data.user);
      }
    } catch (err: any) {
      toaster.push(<Message type="error">{err.message}</Message>, { placement: "topCenter" });
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
      toaster.push(<Message type="success">Welcome back, {data.user.username || "Admin"}</Message>);
    } catch (err: any) {
      toaster.push(<Message type="error">{err.message}</Message>, { placement: "topCenter" });
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
      <div className="min-h-screen flex bg-white">
        <Head>
          <title>Dev Access | Plasa</title>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        </Head>

        {/* Left Panel - Branding */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-16"
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)"
          }}>
          {/* Animated background orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-20"
              style={{ background: "radial-gradient(circle, #8b5cf6, transparent 70%)" }} />
            <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full opacity-20"
              style={{ background: "radial-gradient(circle, #a855f7, transparent 70%)" }} />
            <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full opacity-10"
              style={{ background: "radial-gradient(circle, #d8b4fe, transparent 70%)" }} />
          </div>

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "40px 40px"
            }} />

          {/* Logo */}
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-lg">
                P
              </div>
              <div>
                <div className="text-white font-black text-lg tracking-tight leading-none">Plasa</div>
                <div className="text-purple-300 text-[10px] font-bold uppercase tracking-widest">Dev Console</div>
              </div>
            </div>
          </div>

          {/* Center content */}
          <div className="relative z-10 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-white/70 text-[11px] font-bold uppercase tracking-wider">Systems Operational</span>
              </div>
              <h2 className="text-5xl font-black text-white leading-tight tracking-tighter">
                Infrastructure<br />
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg, #c084fc, #f0abfc)" }}>
                  Command Center
                </span>
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
                Real-time system observability and log management for Plasa&apos;s core infrastructure.
              </p>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3">
              {["Live Error Stream", "Slack Alerts", "2FA Secured", "Auto Cleanup"].map(f => (
                <div key={f} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[11px] text-white/60 font-bold">
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom footer */}
          <div className="relative z-10 text-slate-600 text-xs font-bold">
            © {new Date().getFullYear()} Plasa Technologies · All rights reserved
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-16 bg-white">
          <div className="w-full max-w-[400px] space-y-8">

            {step === "login" ? (
              <>
                {/* Header */}
                <div className="space-y-2">
                  <div className="lg:hidden flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-black text-sm">P</div>
                    <span className="font-black text-slate-900 text-sm">Dev Console</span>
                  </div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome back</h1>
                  <p className="text-slate-400 text-sm font-medium">Sign in to access the infrastructure dashboard.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Identity</label>
                    <input
                      type="text"
                      placeholder="Username or email"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                      disabled={loading}
                      className="w-full h-14 px-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-900 font-semibold text-sm placeholder:text-slate-300 focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Security Key</label>
                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="w-full h-14 px-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-900 font-semibold text-sm placeholder:text-slate-300 focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 rounded-2xl font-black text-sm text-white transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{ background: loading ? "#64748b" : "linear-gradient(135deg, #7c3aed, #8b5cf6)" }}
                  >
                    {loading ? (
                      <><Loader size="sm" /> Verifying Identity...</>
                    ) : (
                      <>Authenticate <span className="text-purple-200">→</span></>
                    )}
                  </button>
                </form>

                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-100"></div>
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Secure Access</span>
                  <div className="h-px flex-1 bg-slate-100"></div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 text-xs">🔒</div>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Two-factor authentication is mandatory for all project developers.
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* 2FA / Setup Header */}
                <div className="space-y-2">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4"
                    style={{ background: step === "setup-2fa" ? "#fef3c7" : "#ede9fe" }}>
                    {step === "setup-2fa" ? "🛡️" : "📱"}
                  </div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                    {step === "setup-2fa" ? "Enable 2FA" : "Verify Identity"}
                  </h1>
                  <p className="text-slate-400 text-sm font-medium">
                    {step === "setup-2fa"
                      ? "Your account requires mandatory two-factor authentication. Enter the code we sent to your email to activate it."
                      : "A 6-digit verification code was sent to your registered email address."}
                  </p>
                </div>

                <form onSubmit={handleVerify2FA} className="space-y-6">
                  {/* OTP Boxes */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Verification Code</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      required
                      autoFocus
                      className="w-full h-16 text-center text-3xl font-black tracking-[0.5em] bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-900 placeholder:text-slate-200 focus:outline-none focus:border-purple-500 focus:bg-white transition-all font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length < 6}
                    className="w-full h-14 rounded-2xl font-black text-sm text-white transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{ background: loading ? "#64748b" : step === "setup-2fa" ? "linear-gradient(135deg, #d97706, #f59e0b)" : "linear-gradient(135deg, #7c3aed, #8b5cf6)" }}
                  >
                    {loading ? (
                      <><Loader size="sm" /> Verifying...</>
                    ) : (
                      step === "setup-2fa" ? "Activate 2FA & Access →" : "Verify & Enter Console →"
                    )}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={() => { setStep("login"); setOtp(""); }}
                  className="w-full text-center text-sm text-slate-400 font-bold hover:text-slate-600 transition-colors"
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
    <div className="dev-page-container flex flex-col items-center p-4 sm:p-8 md:p-12">
      <Head>
        <title>System Logs | Dev Dashboard</title>
      </Head>

      <main className="w-full max-w-7xl">
        <LogsTable 
          initialLogs={initialLogs} 
          initialTotal={initialTotal} 
          user={user} 
          onLogout={handleLogout}
        />
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
