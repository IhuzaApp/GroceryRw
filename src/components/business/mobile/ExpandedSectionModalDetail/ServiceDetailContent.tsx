"use client";

interface ServiceDetailContentProps {
  selectedItem: any;
}

export function ServiceDetailContent({
  selectedItem,
}: ServiceDetailContentProps) {
  return (
    <>
      <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700">
        <h4 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
          {selectedItem.name}
        </h4>
        {selectedItem.price && (
          <p className="mb-2 text-2xl font-bold text-green-600 dark:text-green-400">
            {selectedItem.price}{" "}
            {selectedItem.unit ? `/ ${selectedItem.unit}` : ""}
          </p>
        )}
      </div>
      {selectedItem.Description && (
        <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700">
          <h5 className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
            Description
          </h5>
          <p className="text-gray-600 dark:text-gray-400">
            {selectedItem.Description}
          </p>
        </div>
      )}
    </>
  );
}
