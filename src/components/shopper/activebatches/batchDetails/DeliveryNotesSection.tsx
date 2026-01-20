"use client";

interface DeliveryNotesSectionProps {
  order: any;
  activeTab: string;
}

export default function DeliveryNotesSection({
  order,
  activeTab,
}: DeliveryNotesSectionProps) {
  if (!(order.deliveryNotes || order.deliveryNote)) {
    return null;
  }

  return (
    <div
      className={`${
        activeTab === "details" ? "block" : "hidden sm:block"
      } mt-3`}
    >
      <div className="mb-3 flex items-center gap-2 px-3 sm:mb-4 sm:gap-3 sm:px-0">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 sm:text-xl">
          Delivery Notes
        </h2>
      </div>
      <div className="mx-3 rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-700 dark:bg-amber-900/20 sm:mx-0 sm:p-4">
        <div className="flex gap-2">
          <svg
            className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm text-amber-900 dark:text-amber-100 sm:text-base">
            {order.deliveryNotes || order.deliveryNote}
          </p>
        </div>
      </div>
    </div>
  );
}
