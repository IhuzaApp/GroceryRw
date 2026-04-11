import React from "react";
import { Fingerprint } from "lucide-react";

interface TwoFactorFormProps {
  totpCode: string;
  setTotpCode: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
}

export const TwoFactorForm: React.FC<TwoFactorFormProps> = ({
  totpCode,
  setTotpCode,
  onSubmit,
  loading,
}) => {
  return (
    <div className="text-gray-900 duration-500 animate-in fade-in slide-in-from-bottom-4 dark:text-white">
      <div className="mb-8 flex flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-green-100 text-green-600 shadow-xl shadow-green-500/10 dark:bg-green-500/20 dark:text-green-400">
          <Fingerprint className="h-12 w-12" />
        </div>
        <h2 className="text-3xl font-black tracking-tight">Two-Factor</h2>
        <p className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
          Enter the security code from your authenticator app to authorize this
          terminal.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <input
          type="text"
          placeholder="000000"
          maxLength={6}
          value={totpCode}
          onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
          className="w-full rounded-[2rem] border-none bg-gray-50 py-8 text-center text-4xl font-black tracking-[1rem] shadow-sm transition focus:ring-2 focus:ring-green-500 dark:bg-gray-800"
          autoFocus
          required
        />

        <button
          type="submit"
          disabled={loading || totpCode.length < 6}
          className="w-full rounded-2xl bg-green-600 py-5 text-xl font-black text-white shadow-xl shadow-green-600/30 transition hover:bg-green-700 active:scale-95 disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify & Connect"}
        </button>
      </form>
    </div>
  );
};
