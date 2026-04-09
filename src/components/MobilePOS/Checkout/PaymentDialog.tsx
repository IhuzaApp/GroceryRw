import React from "react";
import { CheckCircle2, X } from "lucide-react";

interface PaymentDialogProps {
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  total: number;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  tin: string;
  setTin: (tin: string) => void;
}

export const PaymentDialog: React.FC<PaymentDialogProps> = ({
  onClose,
  onConfirm,
  loading,
  total,
  paymentMethod,
  setPaymentMethod,
  tin,
  setTin,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 text-gray-900 backdrop-blur-sm dark:text-white sm:p-4">
      <div className="w-full max-w-md rounded-t-[3rem] bg-white p-10 shadow-2xl animate-in slide-in-from-bottom dark:bg-gray-900">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-black">Payment</h2>
          <button
            onClick={onClose}
            className="rounded-full bg-gray-100 p-2 dark:bg-gray-800"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-8 rounded-3xl bg-green-50 p-6 dark:bg-green-500/10">
          <p className="text-xs font-bold uppercase tracking-widest text-green-600">
            Amount Due
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-green-700 dark:text-green-400">
              {total.toLocaleString()}
            </span>
            <span className="text-sm font-bold uppercase text-green-600/60">
              RWF
            </span>
          </div>
        </div>

        <div className="mb-8 space-y-4">
          <label className="block text-left text-xs font-black uppercase tracking-widest text-gray-400">
            Payment Method
          </label>
          <div className="grid grid-cols-3 gap-3">
            {["momo", "cash", "card"].map((method) => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`rounded-2xl border-2 py-4 text-sm font-bold capitalize transition-all ${
                  paymentMethod === method
                    ? "border-green-500 bg-green-50 text-green-600 dark:bg-green-500/10"
                    : "border-gray-100 bg-white text-gray-500 dark:border-gray-800 dark:bg-gray-800"
                }`}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-10 text-left">
          <label className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-400">
            Customer TIN (Optional)
          </label>
          <input
            type="text"
            placeholder="Enter TIN for EBM"
            className="w-full rounded-2xl border-none bg-gray-50 p-4 font-bold focus:ring-2 focus:ring-green-500 dark:bg-gray-800"
            value={tin}
            onChange={(e) => setTin(e.target.value)}
          />
        </div>

        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-3xl bg-green-600 py-5 text-xl font-black text-white shadow-xl shadow-green-600/30 transition hover:bg-green-700 active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <span>Processing...</span>
          ) : (
            <>
              <CheckCircle2 className="h-6 w-6" />
              <span>Confirm & Print</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
