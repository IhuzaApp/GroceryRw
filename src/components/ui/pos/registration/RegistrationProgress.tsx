"use client";

import React from "react";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Check,
  RefreshCw,
  LucideIcon,
} from "lucide-react";

interface Step {
  id: number;
  title: string;
  icon: LucideIcon;
}

interface RegistrationProgressProps {
  registrationSubStep: number;
  mutationError: string | null;
  lastFailedStep: number | null;
  registrationSteps: Step[];
  onRetry: (startAt: number) => void;
}

export default function RegistrationProgress({
  registrationSubStep,
  mutationError,
  lastFailedStep,
  registrationSteps,
  onRetry,
}: RegistrationProgressProps) {
  return (
    <div className="mx-auto w-full max-w-lg overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-2xl md:p-12">
      <div className="mb-10 text-center">
        <div className="mb-8 flex justify-center">
          {registrationSubStep >= 8 ? (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#00c596]/10 text-[#00c596]">
              <CheckCircle className="h-14 w-14" />
            </div>
          ) : mutationError ? (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-50 text-red-500">
              <AlertCircle className="h-14 w-14" />
            </div>
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#022C22]/5 text-[#022C22]">
              <Loader2 className="h-14 w-14 animate-spin" />
            </div>
          )}
        </div>
        <h3 className="mb-3 text-3xl font-extrabold text-[#022C22]">
          {registrationSubStep >= 8
            ? "All Set!"
            : mutationError
            ? "Setup Halted"
            : "Setting Up Your Workspace"}
        </h3>
        <p className="mx-auto max-w-sm font-medium text-gray-500">
          {registrationSubStep >= 8
            ? "Welcome to the future of retail management. Redirecting to your dashboard..."
            : mutationError
            ? "We encountered an issue during setup. You can retry the failed step below."
            : "Please wait while we configure your business environment safely."}
        </p>
      </div>

      <div className="space-y-4">
        {registrationSteps
          .filter((_, idx) =>
            registrationSubStep < 8
              ? idx + 1 === (lastFailedStep || registrationSubStep)
              : true
          )
          .map((s, idx) => {
            const subIdx =
              registrationSubStep < 8
                ? lastFailedStep || registrationSubStep
                : idx + 1;
            const isDone = registrationSubStep >= 8;
            const isActive = registrationSubStep < 8;
            const isError = mutationError && subIdx === lastFailedStep;

            return (
              <div
                key={s.id}
                className={`flex items-center gap-4 rounded-2xl border p-4 transition-all duration-500 ${
                  isError
                    ? "border-red-200 bg-red-50"
                    : isActive
                    ? "translate-x-1 border-[#022C22] bg-[#022C22]/5 shadow-md shadow-[#022C22]/5"
                    : isDone
                    ? "border-gray-100 opacity-60"
                    : "border-transparent opacity-30"
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-500 ${
                    isDone
                      ? "bg-[#00c596] text-white"
                      : isError
                      ? "bg-red-500 text-white"
                      : isActive
                      ? "animate-pulse bg-[#022C22] text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {isDone ? (
                    <Check className="h-5 w-5" />
                  ) : isError ? (
                    <AlertCircle className="h-5 w-5" />
                  ) : (
                    <s.icon className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1">
                  <div
                    className={`text-sm font-bold transition-all duration-500 ${
                      isError
                        ? "text-red-700"
                        : isActive
                        ? "text-[#022C22]"
                        : isDone
                        ? "text-gray-600"
                        : "text-gray-400"
                    }`}
                  >
                    {s.title}
                  </div>
                  {isActive && !mutationError && (
                    <div className="mt-0.5 animate-pulse text-[10px] font-medium text-[#022C22]/60">
                      Processing secure transaction...
                    </div>
                  )}
                  {isError && (
                    <div className="mt-1 text-[10px] font-medium text-red-500">
                      {mutationError}
                    </div>
                  )}
                </div>
                {isActive && !mutationError && (
                  <Loader2 className="h-4 w-4 animate-spin text-[#022C22]" />
                )}
              </div>
            );
          })}
      </div>

      {mutationError && (
        <button
          onClick={() => onRetry(lastFailedStep || 1)}
          className="mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-red-600 font-bold text-white shadow-lg transition-all hover:bg-red-700 active:scale-95"
        >
          <RefreshCw className="h-5 w-5" />
          Retry Step {lastFailedStep}
        </button>
      )}

      {registrationSubStep < 8 && !mutationError && (
        <div className="mt-8 animate-pulse text-center text-[10px] font-bold uppercase tracking-widest text-[#00c596]">
          Data Integrity Guaranteed • 100% Secure
        </div>
      )}
    </div>
  );
}
