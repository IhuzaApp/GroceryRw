"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import RootLayout from "../../../src/components/ui/layout";
import { Smartphone, CheckCircle, XCircle, Loader2 } from "lucide-react";

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_TIME_MS = 3 * 60 * 1000; // 3 minutes

export default function PaymentPendingPage() {
  const router = useRouter();
  const { id: storeId, orderId, referenceId } = router.query;

  const [status, setStatus] = useState<"pending" | "success" | "failed">(
    "pending"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pollStatus = useCallback(async () => {
    if (!referenceId || typeof referenceId !== "string") return;

    try {
      const res = await fetch(
        `/api/momo/request-to-pay-status?referenceId=${referenceId}`
      );
      const data = await res.json();

      if (data.status === "SUCCESSFUL") {
        // Notify Slack now that MoMo payment is confirmed
        if (orderId && typeof orderId === "string") {
          try {
            await fetch("/api/orders/notify-momo-paid", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId }),
            });
          } catch (_) {
            // Non-blocking; notification failure shouldn't block success state
          }
        }
        setStatus("success");
        return;
      }

      if (
        data.status === "FAILED" ||
        data.status === "REJECTED" ||
        data.status === "EXPIRED"
      ) {
        setStatus("failed");
        setErrorMessage(
          data.reason || data.message || "Payment was not completed."
        );
        return;
      }
    } catch (_) {
      // Keep polling on network error
    }
  }, [referenceId, orderId]);

  useEffect(() => {
    if (!storeId || !referenceId || typeof referenceId !== "string") return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      if (Date.now() - startTime > MAX_POLL_TIME_MS) {
        clearInterval(interval);
        setStatus("failed");
        setErrorMessage(
          "Payment timed out. Please check your phone and try again."
        );
        return;
      }
      pollStatus();
    }, POLL_INTERVAL_MS);

    pollStatus();
    return () => clearInterval(interval);
  }, [storeId, referenceId, pollStatus]);

  useEffect(() => {
    if (status === "success" && storeId && typeof storeId === "string") {
      const t = setTimeout(() => {
        router.replace(`/stores/${storeId}?orderSuccess=true`);
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [status, storeId, router]);

  const handleBackToStore = () => {
    if (storeId && typeof storeId === "string") {
      router.push(`/stores/${storeId}`);
    } else {
      router.push("/");
    }
  };

  if (!storeId || !referenceId) {
    return (
      <RootLayout>
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 text-sm text-emerald-600 hover:underline"
          >
            Go home
          </button>
        </div>
      </RootLayout>
    );
  }

  return (
    <RootLayout>
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 dark:bg-gray-900 md:ml-16">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-800">
          {status === "pending" && (
            <>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <Loader2 className="h-10 w-10 animate-spin text-amber-600" />
              </div>
              <h1 className="mt-6 text-center text-xl font-semibold text-gray-900 dark:text-white">
                Waiting for MoMo payment
              </h1>
              <p className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
                Open your MoMo app and approve the payment request on your
                phone.
              </p>
              <div className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-gray-50 px-4 py-3 dark:bg-gray-700">
                <Smartphone className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Check your phone • Polling every 3 seconds
                </span>
              </div>
              <button
                onClick={handleBackToStore}
                className="mt-8 w-full rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel and go back
              </button>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <CheckCircle className="h-12 w-12 text-emerald-600" />
              </div>
              <h1 className="mt-6 text-center text-xl font-semibold text-gray-900 dark:text-white">
                Payment successful!
              </h1>
              <p className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
                Redirecting you to your order...
              </p>
            </>
          )}

          {status === "failed" && (
            <>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
              <h1 className="mt-6 text-center text-xl font-semibold text-gray-900 dark:text-white">
                Payment incomplete
              </h1>
              <p className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
                {errorMessage ||
                  "The payment was not completed. You can try again from the store."}
              </p>
              <button
                onClick={handleBackToStore}
                className="mt-8 w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Back to store
              </button>
            </>
          )}
        </div>
      </div>
    </RootLayout>
  );
}
