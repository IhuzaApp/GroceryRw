"use client";

import { useState } from "react";
import { AlertTriangle, Clock, Mail, MessageCircle, Send } from "lucide-react";
import toast from "react-hot-toast";

interface PendingReviewMessageProps {
  /** Compact layout for mobile / small screens */
  compact?: boolean;
  /** Email where we'll send confirmation and any requests (Users table for personal, business_accounts for business) */
  contactEmail?: string | null;
}

interface RejectedAccountMessageProps {
  /** Compact layout for mobile / small screens */
  compact?: boolean;
  /** Business account ID to include in support request (optional) */
  businessAccountId?: string | null;
}

export function PendingReviewMessage({
  compact = false,
  contactEmail,
}: PendingReviewMessageProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center ${
        compact ? "min-h-[60vh] px-4 py-8" : "min-h-[70vh] px-6 py-12"
      }`}
    >
      <div
        className={`mx-auto max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800 ${
          compact ? "p-5" : "p-8"
        }`}
      >
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
        <h1
          className={`mb-3 text-center font-semibold text-gray-900 dark:text-white ${
            compact ? "text-lg" : "text-xl"
          }`}
        >
          Account under review
        </h1>
        <p className="mb-4 text-center text-gray-600 dark:text-gray-300">
          Support will be reviewing the details you shared. If we need anything
          from you, we will contact you.
        </p>
        <p className="mb-4 text-center text-sm font-medium text-gray-700 dark:text-gray-200">
          This process usually takes up to 24 hours.
        </p>
        {contactEmail ? (
          <div
            className={`mb-4 flex items-center justify-center gap-2 rounded-lg bg-gray-50 px-4 py-3 dark:bg-gray-700/50 ${
              compact ? "py-2" : ""
            }`}
          >
            <Mail className="h-5 w-5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              You will also get an email at{" "}
              <strong className="text-gray-800 dark:text-gray-200">
                {contactEmail}
              </strong>{" "}
              — this is where we&apos;ll send your confirmation or any requests.
            </span>
          </div>
        ) : null}
        <div
          className={`mt-6 flex items-center justify-center gap-2 rounded-lg bg-gray-50 px-4 py-3 dark:bg-gray-700/50 ${
            compact ? "mt-4 py-2" : ""
          }`}
        >
          <MessageCircle className="h-5 w-5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            You&apos;ll get access to your dashboard once your account is approved.
          </span>
        </div>
      </div>
    </div>
  );
}

export function RejectedAccountMessage({
  compact = false,
  businessAccountId,
}: RejectedAccountMessageProps) {
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Please enter a message.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/support/rejected-account-support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          priority,
          ...(businessAccountId && { businessAccountId }),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Failed to send request.");
        return;
      }
      toast.success(data.message || "Request sent to support.");
      setMessage("");
      setShowForm(false);
    } catch {
      toast.error("Failed to send request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center ${
        compact ? "min-h-[60vh] px-4 py-8" : "min-h-[70vh] px-6 py-12"
      }`}
    >
      <div
        className={`mx-auto max-w-lg rounded-2xl border border-red-200 bg-white p-6 shadow-lg dark:border-red-900/50 dark:bg-gray-800 ${
          compact ? "p-5" : "p-8"
        }`}
      >
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <h1
          className={`mb-3 text-center font-semibold text-gray-900 dark:text-white ${
            compact ? "text-lg" : "text-xl"
          }`}
        >
          Account disabled
        </h1>
        <p className="mb-4 text-center text-gray-600 dark:text-gray-300">
          Your account has been disabled due to violating Plas regulation rules
          and platform misuse.
        </p>
        <div
          className={`flex items-center justify-center gap-2 rounded-lg bg-amber-50 px-4 py-3 dark:bg-amber-900/20 ${
            compact ? "mb-4 py-2" : "mb-4 py-3"
          }`}
        >
          <MessageCircle className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
          <span className="text-sm text-gray-700 dark:text-gray-200">
            If you believe this is a mistake, please report back for your account
            to be re-evaluated.
          </span>
        </div>

        {!showForm ? (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
            >
              <MessageCircle className="h-4 w-4" />
              Contact support
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className={`mt-4 space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700/50 ${
              compact ? "p-3" : ""
            }`}
          >
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Explain why you believe this is a mistake or ask for re-evaluation..."
              rows={4}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
              disabled={submitting}
            />
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value as "low" | "medium" | "high")
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              disabled={submitting}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send to support
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                disabled={submitting}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
