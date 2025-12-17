import React, { useState, useEffect, useCallback } from "react";
import { formatCurrency } from "../../lib/formatCurrency";
import toast from "react-hot-toast";
import ReferralRegistration from "./ReferralRegistration";

interface ReferralData {
  code: string;
  totalReferrals: number;
  totalEarnings: number;
  activeReferrals: number;
  referrals: Array<{
    id: string;
    name: string;
    email: string;
    joinedDate: string;
    totalSpent: number;
    status: "active" | "pending";
  }>;
}

// Dummy data generator
const generateDummyReferrals = (code: string): ReferralData => {
  const dummyReferrals = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      joinedDate: "2025-12-10",
      totalSpent: 45000,
      status: "active" as const,
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      joinedDate: "2025-12-08",
      totalSpent: 32000,
      status: "active" as const,
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike@example.com",
      joinedDate: "2025-12-05",
      totalSpent: 28000,
      status: "pending" as const,
    },
    {
      id: "4",
      name: "Sarah Williams",
      email: "sarah@example.com",
      joinedDate: "2025-12-01",
      totalSpent: 15000,
      status: "active" as const,
    },
  ];

  const totalEarnings = dummyReferrals.reduce(
    (sum, ref) => sum + ref.totalSpent * 0.05, // 5% commission
    0
  );

  return {
    code,
    totalReferrals: dummyReferrals.length,
    totalEarnings,
    activeReferrals: dummyReferrals.filter((r) => r.status === "active").length,
    referrals: dummyReferrals,
  };
};

export default function UserReferral() {
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  // Fetch real referral data from API
  const fetchReferralData = useCallback(async (referralCode: string) => {
    try {
      const response = await fetch("/api/referrals/get-data");
      const result = await response.json();

      if (result.success && result.referralCode) {
        // Use real data from API if available
        const realData: ReferralData = {
          code: result.referralCode,
          totalReferrals: result.totalReferrals || 0,
          totalEarnings: result.totalEarnings || 0,
          activeReferrals: result.activeReferrals || 0,
          referrals: result.referrals || [],
        };
        setReferralData(realData);
        // Store in localStorage for caching
        localStorage.setItem("user_referral_code", result.referralCode);
        localStorage.setItem("user_referral_data", JSON.stringify(realData));
      } else {
        // Fallback to dummy data if API doesn't have stats yet
        const fallbackData = generateDummyReferrals(referralCode);
        setReferralData(fallbackData);
        localStorage.setItem("user_referral_code", referralCode);
        localStorage.setItem("user_referral_data", JSON.stringify(fallbackData));
      }
    } catch (error) {
      console.error("Error fetching referral data:", error);
      // Fallback to dummy data on error
      const fallbackData = generateDummyReferrals(referralCode);
      setReferralData(fallbackData);
      localStorage.setItem("user_referral_code", referralCode);
      localStorage.setItem("user_referral_data", JSON.stringify(fallbackData));
    }
  }, []);

  // Check if user is registered for referral program
  useEffect(() => {
    const checkRegistration = async () => {
      try {
        // Check if user has registered
        const response = await fetch("/api/referrals/check-status");
        const result = await response.json();

        if (result.registered && result.approved) {
          // User is registered and approved
          setIsRegistered(true);
          setShowRegistration(false);
          
          // Use referral code from API
          const referralCode = result.referralCode;
          
          if (referralCode) {
            // Fetch real data from API
            await fetchReferralData(referralCode);
          } else {
            // No code from API, show error
            setIsRegistered(false);
            setShowRegistration(true);
          }
        } else if (result.registered && !result.approved) {
          // User registered but pending approval - don't show anything
          setIsRegistered(false);
          setShowRegistration(false);
        } else {
          // User not registered - show registration form
          setIsRegistered(false);
          setShowRegistration(true);
        }
      } catch (error) {
        console.error("Error checking referral status:", error);
        // If API fails, check localStorage as fallback
        const existingCode = localStorage.getItem("user_referral_code");
        if (existingCode) {
          setIsRegistered(true);
          setShowRegistration(false);
          const existingData = localStorage.getItem("user_referral_data");
          if (existingData) {
            try {
              const data = JSON.parse(existingData);
              setReferralData(data);
            } catch {
              // If data is corrupted, fetch from API or generate new
              await fetchReferralData(existingCode);
            }
          } else {
            // No data but have code, fetch from API
            await fetchReferralData(existingCode);
          }
        } else {
          setIsRegistered(false);
          setShowRegistration(true);
        }
      } finally {
        setLoading(false);
      }
    };

    checkRegistration();
  }, [fetchReferralData]);

  const generateNewReferral = () => {
    // Generate a unique referral code (8 characters)
    const code = `REF${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const data = generateDummyReferrals(code);

    // Store in localStorage for security (one code per browser/device)
    localStorage.setItem("user_referral_code", code);
    localStorage.setItem("user_referral_data", JSON.stringify(data));

    setReferralData(data);
  };

  const copyToClipboard = () => {
    if (!referralData) return;

    const referralLink = `${window.location.origin}/signup?ref=${referralData.code}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareReferral = () => {
    if (!referralData) return;

    const referralLink = `${window.location.origin}/signup?ref=${referralData.code}`;
    const shareText = `Join me on this amazing platform! Use my referral code: ${referralData.code}\n${referralLink}`;

    if (navigator.share) {
      navigator.share({
        title: "Referral Code",
        text: shareText,
        url: referralLink,
      }).catch(() => {
        // Fallback to copy if share fails
        copyToClipboard();
      });
    } else {
      copyToClipboard();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  // Show registration form if not registered
  if (showRegistration) {
    return (
      <div>
        <ReferralRegistration
          onSuccess={async () => {
            setShowRegistration(false);
            // Recheck status after registration
            setLoading(true);
            try {
              const response = await fetch("/api/referrals/check-status");
              const result = await response.json();
              
              if (result.registered && result.approved) {
                setIsRegistered(true);
                // Fetch real data if approved
                if (result.referralCode) {
                  await fetchReferralData(result.referralCode);
                }
              } else if (result.registered && !result.approved) {
                setIsRegistered(false);
                setShowRegistration(false);
              }
            } catch (error) {
              console.error("Error rechecking status:", error);
            } finally {
              setLoading(false);
            }
          }}
        />
      </div>
    );
  }

  // If registered but not approved, show pending message
  if (!isRegistered && !showRegistration) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-800 dark:bg-yellow-900/20">
          <div className="flex items-center gap-4">
            <svg
              className="h-12 w-12 text-yellow-600 dark:text-yellow-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-200">
                Application Under Review
              </h3>
              <p className="mt-2 text-sm text-yellow-800 dark:text-yellow-300">
                Your referral program application is being reviewed. You'll be
                notified once it's approved.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If we reach here and still no data, something went wrong
  // This should rarely happen, but provide a fallback
  if (!referralData && isRegistered) {
    // Try to generate data one more time as fallback
    const fallbackCode = localStorage.getItem("user_referral_code") || `REF${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const fallbackData = generateDummyReferrals(fallbackCode);
    localStorage.setItem("user_referral_code", fallbackCode);
    localStorage.setItem("user_referral_data", JSON.stringify(fallbackData));
    setReferralData(fallbackData);
    
    // Return loading state while data is being set
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!referralData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          Unable to load referral data
        </p>
        <button
          onClick={() => {
            setShowRegistration(true);
            setIsRegistered(false);
          }}
          className="mt-4 rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600"
        >
          Register for Referral Program
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Referral Program
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Invite friends and earn rewards! Get 5% commission on every purchase
          your referrals make.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Total Referrals */}
        <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 shadow-sm dark:border-gray-700 dark:from-blue-900/20 dark:to-blue-800/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Referrals
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {referralData.totalReferrals}
              </p>
            </div>
            <div className="rounded-full bg-blue-500/10 p-3">
              <svg
                className="h-6 w-6 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Active Referrals */}
        <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-green-50 to-green-100/50 p-6 shadow-sm dark:border-gray-700 dark:from-green-900/20 dark:to-green-800/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Referrals
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {referralData.activeReferrals}
              </p>
            </div>
            <div className="rounded-full bg-green-500/10 p-3">
              <svg
                className="h-6 w-6 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Earnings */}
        <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-purple-50 to-purple-100/50 p-6 shadow-sm dark:border-gray-700 dark:from-purple-900/20 dark:to-purple-800/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Earnings
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(referralData.totalEarnings)}
              </p>
            </div>
            <div className="rounded-full bg-purple-500/10 p-3">
              <svg
                className="h-6 w-6 text-purple-600 dark:text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Code Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Your Referral Code
          </h3>
          <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
            Share this code with your friends to start earning!
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex-1">
            <div className="flex items-center gap-2 rounded-md border-2 border-dashed border-gray-300 bg-gray-50 px-2.5 py-1.5 dark:border-gray-600 dark:bg-gray-700/50">
              <div className="flex-1">
                <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                  Referral Code
                </p>
                <p className="mt-0.5 text-base font-bold text-gray-900 dark:text-white">
                  {referralData.code}
                </p>
              </div>
              <button
                onClick={copyToClipboard}
                className="rounded-md bg-gray-200 p-1 transition-colors hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500"
              >
                {copied ? (
                  <svg
                    className="h-3.5 w-3.5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-3.5 w-3.5 text-gray-600 dark:text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex gap-1.5">
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Copy Link
            </button>
            <button
              onClick={shareReferral}
              className="flex items-center gap-1 rounded-md bg-gradient-to-r from-green-500 to-emerald-600 px-2.5 py-1.5 text-xs font-medium !text-white shadow-sm transition-all hover:scale-105 hover:shadow active:scale-95"
            >
              <svg
                className="h-3.5 w-3.5 !text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              <span className="!text-white">Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Referrals List */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Your Referrals ({referralData.referrals.length})
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            People who signed up using your referral code
          </p>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {referralData.referrals.map((referral) => (
            <div
              key={referral.id}
              className="px-6 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 text-white">
                    <span className="text-lg font-semibold">
                      {referral.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {referral.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {referral.email}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Joined: {new Date(referral.joinedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="mb-1">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        referral.status === "active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                      }`}
                    >
                      {referral.status === "active" ? "Active" : "Pending"}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(referral.totalSpent)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Commission: {formatCurrency(referral.totalSpent * 0.05)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Section */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-200">
              How It Works
            </h4>
            <ul className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-300">
              <li>• Share your referral code with friends</li>
              <li>• They sign up using your code</li>
              <li>• You earn 5% commission on their purchases</li>
              <li>• Earnings are added to your wallet automatically</li>
              <li>• One referral code per user (security feature)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
