import React from "react";
import { useTheme } from "../../../context/ThemeContext";
import { Button } from "rsuite";

export default function PaymentTab() {
  const { theme } = useTheme();

  return (
    <div className="p-8">
      <h3
        className={`mb-2 text-xl font-bold ${
          theme === "dark" ? "text-white" : "text-gray-900"
        }`}
      >
        Payment Information
      </h3>
      <p
        className={`mb-8 text-sm ${
          theme === "dark" ? "text-gray-400" : "text-gray-600"
        }`}
      >
        Configure your payment information here...
      </p>

      <div className="p-6">
        <h4
          className={`mb-6 text-lg font-semibold ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          Bank Account
        </h4>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label
              className={`mb-2 block text-sm font-medium ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Account Name
            </label>
            <input
              type="text"
              placeholder="Enter account name"
              className={`block w-full rounded-lg border px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                theme === "dark"
                  ? "border-gray-700 bg-gray-900/50 text-white placeholder-gray-500 focus:bg-gray-900"
                  : "border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:bg-white"
              }`}
            />
          </div>
          <div>
            <label
              className={`mb-2 block text-sm font-medium ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Account Number
            </label>
            <input
              type="text"
              placeholder="Enter account number"
              className={`block w-full rounded-lg border px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                theme === "dark"
                  ? "border-gray-700 bg-gray-900/50 text-white placeholder-gray-500 focus:bg-gray-900"
                  : "border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:bg-white"
              }`}
            />
          </div>
          <div>
            <label
              className={`mb-2 block text-sm font-medium ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Bank Name
            </label>
            <input
              type="text"
              placeholder="Enter bank name"
              className={`block w-full rounded-lg border px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                theme === "dark"
                  ? "border-gray-700 bg-gray-900/50 text-white placeholder-gray-500 focus:bg-gray-900"
                  : "border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:bg-white"
              }`}
            />
          </div>
          <div>
            <label
              className={`mb-2 block text-sm font-medium ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Routing Number
            </label>
            <input
              type="text"
              placeholder="Enter routing number"
              className={`block w-full rounded-lg border px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                theme === "dark"
                  ? "border-gray-700 bg-gray-900/50 text-white placeholder-gray-500 focus:bg-gray-900"
                  : "border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:bg-white"
              }`}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            appearance="primary"
            color="blue"
            className="px-6 py-2 font-medium"
          >
            Save Payment Info
          </Button>
        </div>
      </div>
    </div>
  );
}
