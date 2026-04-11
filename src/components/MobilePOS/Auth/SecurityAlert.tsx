import React from "react";
import { ShieldCheck } from "lucide-react";

interface SecurityAlertProps {
  onBack: () => void;
}

export const SecurityAlert: React.FC<SecurityAlertProps> = ({ onBack }) => {
  return (
    <div className="text-gray-900 duration-500 animate-in fade-in slide-in-from-top-2 dark:text-white">
      <div className="mb-6 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-6 text-center shadow-xl">
        <ShieldCheck className="mx-auto mb-3 h-10 w-10 text-yellow-500" />
        <h3 className="mb-2 text-center text-lg font-bold text-yellow-500">
          Security Required
        </h3>
        <p className="text-center text-sm font-medium leading-relaxed text-yellow-600 dark:text-yellow-400">
          Your account does not have Multi-Factor Authentication enabled. Please
          contact your <strong>Shop Administrator</strong> to set up security
          features before using the POS terminal.
        </p>
        <button
          onClick={onBack}
          className="mt-6 w-full text-xs font-bold uppercase tracking-widest text-gray-500 underline decoration-yellow-500/50 underline-offset-4 dark:text-gray-400"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};
