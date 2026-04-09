import React from "react";
import { StopCircle, ClipboardCheck } from "lucide-react";

interface CloseShiftModalProps {
  onCancel: () => void;
  onSubmit: () => void;
  loading?: boolean;
  openingStock: string;
  totalItems: number;
  totalSales: number;
  duration: string;
  closingStockInput: string;
}

export const CloseShiftModal: React.FC<CloseShiftModalProps> = ({
  onCancel,
  onSubmit,
  loading,
  openingStock,
  totalItems,
  totalSales,
  duration,
  closingStockInput,
}) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-0 text-gray-900 backdrop-blur-sm dark:text-white sm:p-4">
      <div className="w-full max-w-md rounded-t-[3rem] bg-white p-10 shadow-2xl animate-in slide-in-from-bottom dark:bg-gray-900">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400">
          <StopCircle className="h-12 w-12" />
        </div>

        <h2 className="mb-2 text-center text-3xl font-black tracking-tight">
          Closing Shift
        </h2>

        {/* Accurate Shift Summary */}
        <div className="mb-8 space-y-3 rounded-2xl bg-gray-50 p-6 text-left dark:bg-gray-800/50">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Opening Stock</span>
            <span className="font-black">
              {parseFloat(openingStock).toLocaleString()} RWF
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Items Processed</span>
            <span className="font-black">{totalItems} Items</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Session Total Sales</span>
            <span className="font-black text-green-600">
              {totalSales.toLocaleString()} RWF
            </span>
          </div>
          <div className="mt-2 flex justify-between border-t border-gray-100 pt-3 text-xs font-bold uppercase tracking-widest text-gray-400 dark:border-gray-700">
            <span>Shift Duration</span>
            <span>{duration}</span>
          </div>
        </div>

        {/* Closing Stock Input */}
        <div className="mb-8">
          <label className="mb-2 block text-left text-xs font-black uppercase tracking-widest text-gray-400">
            Closing Stock Balance
          </label>
          <input
            type="number"
            value={closingStockInput}
            readOnly
            className="w-full rounded-2xl border-none bg-gray-50 p-4 text-center text-lg font-black opacity-80 placeholder:text-gray-300 dark:bg-gray-800"
          />
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={onSubmit}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-[2rem] bg-green-600 py-5 text-lg font-black text-white shadow-xl shadow-green-600/30 transition hover:bg-green-700 active:scale-95 disabled:opacity-70"
          >
            {loading ? (
              <span>Processing...</span>
            ) : (
              <>
                <ClipboardCheck className="h-6 w-6" />
                <span>Save & Log Out</span>
              </>
            )}
          </button>

          <button
            onClick={onCancel}
            className="w-full rounded-[2rem] py-4 font-bold text-gray-500 transition hover:bg-gray-100 active:scale-95 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
