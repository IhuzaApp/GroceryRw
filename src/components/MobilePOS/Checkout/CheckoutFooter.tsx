import React from "react";
import { ArrowRight } from "lucide-react";

interface CheckoutFooterProps {
  subtotal: number;
  tax: number;
  total: number;
  onProceed: () => void;
  disabled?: boolean;
}

export const CheckoutFooter: React.FC<CheckoutFooterProps> = ({
  subtotal,
  tax,
  total,
  onProceed,
  disabled
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-100 bg-white/90 p-6 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/80">
      <div className="mx-auto max-w-md space-y-4">
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-gray-400">
            <span>Subtotal</span>
            <span>{subtotal.toLocaleString()} RWF</span>
          </div>
          <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-gray-400">
            <span>VAT (18%) Included</span>
            <span>{tax.toLocaleString()} RWF</span>
          </div>
          <div className="flex justify-between text-2xl font-black pt-2">
            <span>Total</span>
            <span className="text-green-600">{total.toLocaleString()} RWF</span>
          </div>
        </div>
        <button
          onClick={onProceed}
          disabled={disabled}
          className="flex w-full items-center justify-center gap-3 rounded-3xl bg-green-600 py-5 text-xl font-black text-white shadow-xl shadow-green-600/30 transition hover:bg-green-700 active:scale-95 disabled:opacity-50"
        >
          <span>Proceed to Payment</span>
          <ArrowRight className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};
