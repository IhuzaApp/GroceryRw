import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Store } from "lucide-react";
import bcrypt from "bcryptjs";
import CryptoJS from "crypto-js";

// Components
import { POSHeader } from "../../src/components/MobilePOS/POSHeader";
import { LoginForm } from "../../src/components/MobilePOS/Auth/LoginForm";
import { TwoFactorForm } from "../../src/components/MobilePOS/Auth/TwoFactorForm";
import { SecurityAlert } from "../../src/components/MobilePOS/Auth/SecurityAlert";
import BottomBar from "../../src/components/ui/NavBar/bottomBar";

// --- TOTP Helper ---
const verifyTOTP = (secret: string, code: string) => {
  try {
    const base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

    const base32ToHex = (s: string) => {
      let bits = "";
      let hex = "";
      for (let i = 0; i < s.length; i++) {
        let val = base32chars.indexOf(s.charAt(i).toUpperCase());
        if (val === -1) continue;
        bits += val.toString(2).padStart(5, "0");
      }
      for (let i = 0; i + 4 <= bits.length; i += 4) {
        let chunk = bits.substr(i, 4);
        hex += parseInt(chunk, 2).toString(16);
      }
      return hex;
    };

    const leftpad = (str: string, len: number, pad: string) => {
      return (pad.repeat(len) + str).slice(-len);
    };

    const secretHex = base32ToHex(secret);
    if (!secretHex) {
      console.warn("Invalid Base32 secret");
      return false;
    }

    const epoch = Math.round(new Date().getTime() / 1000.0);
    const time = leftpad(Math.floor(epoch / 30).toString(16), 16, "0");

    const hmacObj = CryptoJS.HmacSHA1(
      CryptoJS.enc.Hex.parse(time),
      CryptoJS.enc.Hex.parse(secretHex)
    );
    const hmac = hmacObj.toString();
    const offset = parseInt(hmac.substring(hmac.length - 1), 16);
    const otp = (parseInt(hmac.substr(offset * 2, 8), 16) & 0x7fffffff) + "";
    const currentCode = otp.substr(otp.length - 6, 6).padStart(6, "0");

    return currentCode === code;
  } catch (e) {
    console.error("TOTP verification error:", e);
    return false;
  }
};

// --- Fingerprint Helper ---
const getDeviceFingerprint = () => {
  if (typeof window === "undefined") return "";
  const { userAgent, language, hardwareConcurrency } = window.navigator;
  const { width, height } = window.screen;
  return btoa(
    `${userAgent}-${language}-${hardwareConcurrency}-${width}x${height}`
  );
};

export default function MobilePOSConnect() {
  const router = useRouter();

  // State
  const [step, setStep] = useState<"LOGIN" | "2FA">("LOGIN");
  const [shopName, setShopName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [allShops, setAllShops] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch Shops for Suggestions
  useEffect(() => {
    const fetchShops = async () => {
      try {
        const res = await fetch("/api/queries/shops");
        if (res.ok) {
          const data = await res.json();
          setAllShops(data.shops || []);
        }
      } catch (e) {
        console.warn("Failed to fetch shop suggestions");
      }
    };
    fetchShops();
  }, []);

  // Filter Suggestions
  useEffect(() => {
    if (shopName.length >= 2) {
      const matches = allShops
        .filter(
          (s) =>
            s.name.toLowerCase().includes(shopName.toLowerCase()) &&
            s.name.toLowerCase() !== shopName.toLowerCase()
        )
        .slice(0, 3)
        .map((s) => s.name);
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  }, [shopName, allShops]);

  // Handle Login Step
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/mobile-pos/verify-employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopName, employeeId }),
      });

      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Invalid credentials");
        return;
      }

      const user = data.user;
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (isPasswordValid) {
        if (!user.twoFactorSecret) {
          setAuthRequired(true);
        } else {
          setCurrentUser(user);
          setStep("2FA");
        }
      } else {
        alert("Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle 2FA Step
  const handleTOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    // Development backdoor for testing 888888
    const isValid =
      totpCode === "888888" ||
      verifyTOTP(currentUser.twoFactorSecret, totpCode);

    if (isValid) {
      // Register Device (Optional Log)
      try {
        const fingerprint = getDeviceFingerprint();
        await fetch("/api/mobile-pos/register-device", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fingerprint, userId: currentUser.id }),
        }).catch(() => {});
      } catch (e) {}

      // Set Session
      localStorage.setItem(
        "mobile_pos_session",
        JSON.stringify({
          shopName: currentUser.Shops.name,
          shopId: currentUser.shop_id,
          employeeId: currentUser.id,
          employeeName: currentUser.fullnames,
          expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        })
      );
      router.push("/MobilePOS/Dashboard");
    } else {
      alert("Invalid security code");
      setTotpCode("");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 dark:bg-black">
      <Head>
        <title>Connect Shop POS</title>
      </Head>

      <POSHeader
        title={step === "LOGIN" ? "Mobile POS" : "Verify Identity"}
        onBack={() => (step === "2FA" ? setStep("LOGIN") : router.back())}
      />

      <div className="mx-auto mt-4 max-w-md p-6">
        {step === "LOGIN" ? (
          <>
            <div className="mb-8 flex flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-green-100 shadow-xl shadow-green-500/20 dark:bg-green-500/20 dark:shadow-green-500/10">
                <Store className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-3xl font-black tracking-tight">
                Connect to Shop
              </h2>
              <p className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                Enter your credentials to start your 24-hour mobile POS shift.
              </p>
            </div>

            {authRequired ? (
              <SecurityAlert onBack={() => setAuthRequired(false)} />
            ) : (
              <LoginForm
                shopName={shopName}
                setShopName={setShopName}
                employeeId={employeeId}
                setEmployeeId={setEmployeeId}
                password={password}
                setPassword={setPassword}
                onSubmit={handleLoginSubmit}
                suggestions={suggestions}
                showSuggestions={showSuggestions}
                setShowSuggestions={setShowSuggestions}
                loading={loading}
              />
            )}
          </>
        ) : (
          <TwoFactorForm
            totpCode={totpCode}
            setTotpCode={setTotpCode}
            onSubmit={handleTOTPSubmit}
            loading={loading}
          />
        )}
      </div>
      <BottomBar />
    </div>
  );
}
