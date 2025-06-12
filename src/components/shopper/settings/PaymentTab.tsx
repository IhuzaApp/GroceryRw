import React from "react";
import { useTheme } from "../../../context/ThemeContext";
import { Button } from "rsuite";

export default function PaymentTab() {
  const { theme } = useTheme();

  return (
    <div className="p-4">
      <h3 className={`mb-4 text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
        Payment Information
      </h3>
      <p className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>
        Configure your payment information here...
      </p>

      <div className={`rounded-lg border p-4 ${
        theme === "dark" ? "border-gray-700" : "border-gray-200"
      }`}>
        <h4 className={`mb-2 font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
          Bank Account
        </h4>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={`block text-sm font-medium ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}>
              Account Name
            </label>
            <input
              type="text"
              className={`mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                theme === "dark"
                  ? "border-gray-700 bg-gray-800 text-white"
                  : "border-gray-300 bg-white text-gray-900"
              }`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}>
              Account Number
            </label>
            <input
              type="text"
              className={`mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                theme === "dark"
                  ? "border-gray-700 bg-gray-800 text-white"
                  : "border-gray-300 bg-white text-gray-900"
              }`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}>
              Bank Name
            </label>
            <input
              type="text"
              className={`mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                theme === "dark"
                  ? "border-gray-700 bg-gray-800 text-white"
                  : "border-gray-300 bg-white text-gray-900"
              }`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}>
              Routing Number
            </label>
            <input
              type="text"
              className={`mt-1 block w-full rounded-md border p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                theme === "dark"
                  ? "border-gray-700 bg-gray-800 text-white"
                  : "border-gray-300 bg-white text-gray-900"
              }`}
            />
          </div>
        </div>

        <Button appearance="primary" color="blue" className="mt-4">
          Save Payment Info
        </Button>
      </div>
    </div>
  );
} 