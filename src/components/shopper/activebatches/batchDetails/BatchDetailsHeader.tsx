"use client";

import React from "react";
import { useRouter } from "next/router";
import { Button } from "rsuite";
import { OrderDetailsType } from "../types";

interface BatchDetailsHeaderProps {
  order: OrderDetailsType;
}

export default function BatchDetailsHeader({ order }: BatchDetailsHeaderProps) {
  const router = useRouter();

  const getStatusTag = (status: string) => {
    const statusConfig = {
      accepted: { color: "orange", label: "Accepted" },
      shopping: { color: "blue", label: "Shopping" },
      on_the_way: { color: "purple", label: "On The Way" },
      delivered: { color: "green", label: "Delivered" },
      cancelled: { color: "red", label: "Cancelled" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      color: "gray",
      label: status,
    };

    return (
      <span
        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium sm:px-3 sm:py-1.5 sm:text-sm ${
          config.color === "green"
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
            : config.color === "orange"
            ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
            : config.color === "blue"
            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
            : config.color === "purple"
            ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
            : config.color === "red"
            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
            : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
        }`}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div
      className={`px-0 py-2 text-gray-900 dark:text-gray-100 sm:p-6`}
    >
      <div className="flex flex-row items-center justify-between gap-2 px-3 sm:gap-4 sm:px-0">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
          <Button
            appearance="link"
            onClick={() => router.back()}
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
              {order.orderType === "reel"
                ? "Reel Batch"
                : "Regular Batch"}{" "}
            </span>
            {order.orderType === "reel"
              ? "Reel Batch"
              : "Regular Batch"}{" "}
            #
            {(order as any).orderIDs &&
            (order as any).orderIDs.length > 1
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