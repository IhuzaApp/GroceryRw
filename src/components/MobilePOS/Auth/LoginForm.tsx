import React from "react";
import { Store, UserCheck, ShieldCheck } from "lucide-react";

interface LoginFormProps {
  shopName: string;
  setShopName: (val: string) => void;
  employeeId: string;
  setEmployeeId: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  suggestions: string[];
  showSuggestions: boolean;
  setShowSuggestions: (val: boolean) => void;
  loading?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  shopName,
  setShopName,
  employeeId,
  setEmployeeId,
  password,
  setPassword,
  onSubmit,
  suggestions,
  showSuggestions,
  setShowSuggestions,
  loading,
}) => {
  const inputClasses =
    "w-full rounded-2xl border-none bg-gray-50 py-5 pl-5 pr-12 text-lg font-bold shadow-sm transition focus:ring-2 focus:ring-green-500 dark:bg-gray-800";

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 text-gray-900 duration-500 animate-in fade-in slide-in-from-bottom-4 dark:text-white"
    >
      <div className="relative z-10">
        <input
          type="text"
          placeholder="Shop Name"
          value={shopName}
          onChange={(e) => {
            setShopName(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          className={inputClasses}
          required
        />
        <Store className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute left-0 top-[calc(100%+4px)] z-50 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl duration-300 animate-in fade-in slide-in-from-top-2 dark:border-gray-700 dark:bg-gray-800">
            <div className="bg-gray-50/50 px-4 py-2 text-left dark:bg-gray-900/50">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                Suggested Shops
              </span>
            </div>
            {suggestions.map((sug, idx) => (
              <button
                key={idx}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setShopName(sug);
                  setShowSuggestions(false);
                }}
                className={`flex w-full items-center gap-3 px-5 py-3 text-left transition hover:bg-green-50 dark:hover:bg-green-900/20 ${
                  idx !== suggestions.length - 1
                    ? "border-b border-gray-100 dark:border-gray-700/50"
                    : ""
                }`}
              >
                <Store className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {sug}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="relative">
        <input
          type="text"
          placeholder="Employee ID"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          className={inputClasses}
          required
        />
        <UserCheck className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
      </div>
      <div className="relative">
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClasses}
          required
        />
        <ShieldCheck className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-2xl bg-green-600 py-5 text-xl font-black text-white shadow-xl shadow-green-600/30 transition hover:bg-green-700 active:scale-95 disabled:opacity-50"
      >
        {loading ? "Processing..." : "Continue"}
      </button>
    </form>
  );
};
