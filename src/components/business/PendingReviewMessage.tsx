"use client";

import { AlertTriangle, Clock, Mail, MessageCircle } from "lucide-react";

interface PendingReviewMessageProps {
  /** Compact layout for mobile / small screens */
  compact?: boolean;
  /** Email where we'll send confirmation and any requests (Users table for personal, business_accounts for business) */
  contactEmail?: string | null;
}

interface RejectedAccountMessageProps {
  /** Compact layout for mobile / small screens */
  compact?: boolean;
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

export function RejectedAccountMessage({ compact = false }: RejectedAccountMessageProps) {
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
            compact ? "mb-4 py-2" : "mb-6 py-3"
          }`}
        >
          <MessageCircle className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
          <span className="text-sm text-gray-700 dark:text-gray-200">
            If you believe this is a mistake, please report back for your account
            to be re-evaluated.
          </span>
        </div>
      </div>
    </div>
  );
}
