"use client";

import React from "react";
import { Steps } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import { OrderDetailsType } from "../types";

interface OrderProgressStepsProps {
  order: OrderDetailsType;
  currentStep: number;
}

// Custom CSS for green steps
export const greenStepsStyles = `
  .custom-steps-green .rs-steps-item-status-finish .rs-steps-item-icon {
    background-color: transparent !important;
    border-color: #10b981 !important;
    color: #10b981 !important;
  }

  .custom-steps-green .rs-steps-item-status-finish .rs-steps-item-title {
    color: #10b981 !important;
  }

  .custom-steps-green .rs-steps-item-status-process .rs-steps-item-icon {
    background-color: transparent !important;
    border-color: #10b981 !important;
    color: #10b981 !important;
  }

  .custom-steps-green .rs-steps-item-status-process .rs-steps-item-title {
    color: #10b981 !important;
  }

  .custom-steps-green .rs-steps-item-status-wait .rs-steps-item-icon {
    background-color: transparent !important;
    border-color: #d1d5db !important;
    color: #9ca3af !important;
  }

  .custom-steps-green .rs-steps-item-status-wait .rs-steps-item-title {
    color: #6b7280 !important;
  }

  .custom-steps-green .rs-steps-item-status-finish .rs-steps-item-tail::after {
    background-color: #10b981 !important;
  }

  .custom-steps-green .rs-steps-item-status-process .rs-steps-item-tail::after {
    background-color: #10b981 !important;
  }

  .custom-steps-green .rs-steps-item-status-wait .rs-steps-item-tail::after {
    background-color: #e5e7eb !important;
  }

  /* Dark mode support */
  .dark .custom-steps-green .rs-steps-item-status-wait .rs-steps-item-icon {
    background-color: transparent !important;
    border-color: #4b5563 !important;
    color: #6b7280 !important;
  }

  .dark .custom-steps-green .rs-steps-item-status-wait .rs-steps-item-title {
    color: #9ca3af !important;
  }

  .dark .custom-steps-green .rs-steps-item-status-wait .rs-steps-item-tail::after {
    background-color: #374151 !important;
  }
`;

export default function OrderProgressSteps({
  order,
  currentStep,
}: OrderProgressStepsProps) {
  return (
    <div className="hidden rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800 sm:block sm:p-6">
      <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-3">
        <span className="inline-block rounded-full bg-blue-100 p-1.5 sm:p-2">
          <svg
            className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </span>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 sm:text-xl">
          Order Progress
        </h2>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-600 dark:bg-slate-700 sm:p-6">
        <Steps current={currentStep} className="custom-steps-green">
          <Steps.Item
            title="Order Accepted"
            description="Order has been assigned to you"
            status={currentStep >= 0 ? "finish" : "wait"}
          />
          {!(
            order?.reel?.restaurant_id ||
            order?.reel?.user_id ||
            order?.orderType === "restaurant"
          ) && (
            <Steps.Item
              title="Shopping"
              description="Collecting items from the store"
              status={currentStep >= 1 ? "finish" : "wait"}
            />
          )}
          <Steps.Item
            title="On The Way"
            description="Delivering to customer"
            status={currentStep >= 2 ? "finish" : "wait"}
          />
          <Steps.Item
            title="Delivered"
            description="Order completed successfully"
            status={currentStep >= 3 ? "finish" : "wait"}
          />
        </Steps>
      </div>
    </div>
  );
}
