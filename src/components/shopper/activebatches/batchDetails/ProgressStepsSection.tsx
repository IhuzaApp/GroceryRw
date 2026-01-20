"use client";

import React from "react";
import { Steps } from "rsuite";
import { OrderDetailsType } from "../../types/order";

interface ProgressStepsSectionProps {
  order: OrderDetailsType;
  currentStep: number;
}

export default function ProgressStepsSection({ order, currentStep }: ProgressStepsSectionProps) {
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