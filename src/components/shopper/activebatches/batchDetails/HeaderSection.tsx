"use client";

import React from "react";
import { Button } from "rsuite";
import { OrderDetailsType } from "../../types/order";

interface HeaderSectionProps {
  order: OrderDetailsType;
  getStatusTag: (status: string) => React.ReactNode;
  onBack: () => void;
}

export default function HeaderSection({
  order,
  getStatusTag,
  onBack,
}: HeaderSectionProps) {
  return (
    <div
      className={`sticky top-0 z-40 border-b border-gray-200 bg-white px-0 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 sm:relative sm:top-auto sm:z-auto sm:border-b-0 sm:bg-transparent sm:p-6`}
    >
      <div className="flex flex-row items-center justify-between gap-2 px-3 sm:gap-4 sm:px-0">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
          <Button
            appearance="link"
            onClick={onBack}
            className="flex flex-shrink-0 items-center px-0 text-base text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 sm:text-base"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="mr-1 h-5 w-5 sm:mr-2 sm:h-5 sm:w-5"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="h-5 w-px flex-shrink-0 bg-gray-300 dark:bg-gray-600 sm:h-6"></div>
          <h1 className="min-w-0 truncate text-base font-bold text-gray-900 dark:text-gray-100 sm:text-2xl">
            <span className="hidden sm:inline">
              {order.orderType === "reel" ? "Reel Batch" : "Regular Batch"}{" "}
            </span>
            {order.orderType === "reel" ? "Reel Batch" : "Regular Batch"} #
            {(order as any).orderIDs && (order as any).orderIDs.length > 1
              ? (order as any).orderIDs.join(" & ")
              : order.OrderID || order.id.slice(0, 8)}
          </h1>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
          {getStatusTag(order.status)}
        </div>
      </div>
    </div>
  );
}
