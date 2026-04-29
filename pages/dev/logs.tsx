import React, { useState, useEffect } from "react";
import { Container, Loader, Message, useToaster, IconButton } from "rsuite";
import LogsTable from "@components/logs/LogsTable";
import { GetServerSideProps } from "next";
import Head from "next/head";
import ExitIcon from "@rsuite/icons/Exit";
import ShieldIcon from "@rsuite/icons/Shield";
import LockIcon from "@rsuite/icons/Lock";
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
  const [step, setStep] = useState<"login" | "2fa">("login");
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

      if (data.step === "2fa") {
        setStep("2fa");
        setTempToken(data.tempToken);
        toaster.push(
          <Message type="info">A 2FA code has been sent to your email.</Message>,
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
      <div className="dev-page-container">
        <Head>
          <title>Dev Access | Plasa</title>
        </Head>
        <div className="login-container">
          <div className="premium-card login-card">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-sky-500/10 rounded-full text-sky-400">
                <ShieldIcon style={{ fontSize: 40 }} />
              </div>
            </div>
            <h1 className="login-title">Dev Console</h1>
            <p className="login-subtitle">Secure access for project administrators</p>

            {step === "login" ? (
              <form onSubmit={handleLogin}>
                <div className="input-group">
                  <label className="input-label">Identity</label>
                  <input
                    type="text"
                    className="premium-input"
                    placeholder="Username or Email"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Credentials</label>
                  <div className="relative">
                    <input
                      type="password"
                      className="premium-input"
                      placeholder="Enter your security key"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <LockIcon className="absolute right-3 top-3 text-slate-500" />
                  </div>
                </div>
                <button type="submit" className="premium-button" disabled={loading}>
                  {loading ? <Loader content="Verifying..." /> : "Authenticate"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerify2FA}>
                <label className="input-label text-center">Verify 2FA Code</label>
                <div className="flex justify-center">
                   <input
                    type="text"
                    className="otp-input"
                    maxLength={6}
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    required
                    autoFocus
                    style={{ width: "200px", letterSpacing: "8px" }}
                  />
                </div>
                <p className="text-center text-slate-400 text-xs mb-4">
                  Check your email for a 6-digit code.
                </p>
                <button type="submit" className="premium-button" disabled={loading}>
                  {loading ? <Loader content="Checking..." /> : "Verify & Access"}
                </button>
                <button 
                  type="button" 
                  className="w-full mt-4 text-slate-500 text-sm hover:text-slate-300"
                  onClick={() => setStep("login")}
                >
                  Back to login
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dev-page-container">
      <Head>
        <title>System Logs | Dev Dashboard</title>
      </Head>
      <header className="dashboard-header premium-card m-4">
        <div className="dashboard-title">
          <div className="w-8 h-8 bg-sky-500 rounded flex items-center justify-center text-white font-bold">L</div>
          System Infrastructure Logs
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-bold text-slate-200">{user?.username}</div>
            <div className="text-[10px] text-sky-400 uppercase tracking-widest">{user?.role}</div>
          </div>
          <IconButton 
            icon={<ExitIcon />} 
            onClick={handleLogout}
            appearance="subtle"
            className="hover:bg-red-500/20 text-slate-400 hover:text-red-400"
          />
        </div>
      </header>

      <main className="dashboard-content">
        <div className="premium-card p-6 overflow-hidden">
          <LogsTable initialLogs={initialLogs} initialTotal={initialTotal} />
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
