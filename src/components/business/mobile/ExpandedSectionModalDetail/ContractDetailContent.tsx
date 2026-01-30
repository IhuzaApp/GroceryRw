"use client";

import { Eye } from "lucide-react";

interface ContractDetailContentProps {
  selectedItem: any;
  onViewContract?: (contractId: string) => void;
}

export function ContractDetailContent({
  selectedItem,
  onViewContract,
}: ContractDetailContentProps) {
  return (
    <>
      <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700">
        <h4 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
          Contract #{selectedItem.id?.slice(0, 8) || "N/A"}
        </h4>
        <span
          className={`inline-block rounded-md px-3 py-1 text-xs font-semibold ${
            selectedItem.status === "active"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-400"
          }`}
        >
          {selectedItem.status || "Active"}
        </span>
      </div>
      {selectedItem.created_at && (
        <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700">
          <h5 className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
            Created Date
          </h5>
          <p className="text-gray-600 dark:text-gray-400">
            {new Date(selectedItem.created_at).toLocaleDateString()}
          </p>
        </div>
      )}
      {selectedItem.title && (
        <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700">
          <h5 className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
            Title
          </h5>
          <p className="text-gray-600 dark:text-gray-400">
            {selectedItem.title}
          </p>
        </div>
      )}
      {selectedItem.supplierCompany && (
        <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700">
          <h5 className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
            Supplier
          </h5>
          <p className="text-gray-600 dark:text-gray-400">
            {selectedItem.supplierCompany}
          </p>
        </div>
      )}
      {onViewContract && selectedItem.id && (
        <div className="mt-4">
          <button
            onClick={() => onViewContract(selectedItem.id)}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-green-700 active:scale-95 dark:bg-green-700 dark:hover:bg-green-800"
          >
            <Eye className="h-5 w-5" />
            View Full Contract
          </button>
        </div>
      )}
    </>
  );
}
