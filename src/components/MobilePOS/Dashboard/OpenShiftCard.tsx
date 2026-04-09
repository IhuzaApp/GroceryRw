import React from "react";
import { PlayCircle, ClipboardCheck } from "lucide-react";

interface OpenShiftCardProps {
  onOpen: () => void;
  loading?: boolean;
}

export const OpenShiftCard: React.FC<OpenShiftCardProps> = ({ onOpen, loading }) => {
  return (
    <div className="mt-10 duration-500 animate-in fade-in zoom-in-95">
      <div className="rounded-3xl p-8 text-center shadow-2xl border border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400">
          <PlayCircle className="h-12 w-12" />
        </div>
        <h2 className="mb-2 text-2xl font-black">Start Shift</h2>
        <p className="mb-8 text-sm font-medium text-gray-500 dark:text-gray-400">
          To begin your 24-hour shift, you must first record the opening stock balance.
        </p>
        <button
          onClick={onOpen}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 py-4 font-bold text-white shadow-lg shadow-green-600/30 transition hover:bg-green-700 active:scale-95 disabled:opacity-70"
        >
          {loading ? (
            <span>Processing...</span>
          ) : (
            <>
              <ClipboardCheck className="h-5 w-5" />
              Record Opening Stock
            </>
          )}
        </button>
      </div>
    </div>
  );
};
