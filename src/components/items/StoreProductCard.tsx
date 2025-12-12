import React, { useState } from "react";
import { formatCurrencySync } from "../../utils/formatCurrency";
import Image from "next/image";

interface StoreProductCardProps {
  id: string;
  name: string;
  image: string;
  price: string;
  unit: string;
  measurement_unit?: string;
  description?: string;
  onAdd: (product: {
    id: string;
    name: string;
    price: string;
    unit: string;
    measurement_unit?: string;
    quantity: number;
    image?: string;
  }) => void;
}

export default function StoreProductCard({
  id,
  name,
  image,
  price,
  unit,
  measurement_unit,
  description,
  onAdd,
}: StoreProductCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const handleAdd = () => {
    onAdd({
      id,
      name,
      price,
      unit,
      measurement_unit,
      quantity: selectedQuantity,
      image,
    });
    setShowModal(false);
    setSelectedQuantity(1);
  };

  return (
    <>
      <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-green-500/10 dark:border-gray-700 dark:bg-gray-800 dark:hover:shadow-green-500/20" onClick={(e) => e.stopPropagation()}>
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/0 via-emerald-50/0 to-green-50/0 transition-all duration-300 group-hover:from-green-50/50 group-hover:via-emerald-50/30 group-hover:to-green-50/50 dark:group-hover:from-green-900/10 dark:group-hover:via-emerald-900/5 dark:group-hover:to-green-900/10" />
        
        {/* Image Section */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-700 dark:via-gray-800 dark:to-gray-700">
          <Image
            src={image || "/images/groceryPlaceholder.png"}
            alt={name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-black/0 transition-opacity duration-300 group-hover:from-black/60" />
          
          {/* Measurement unit badge - top right */}
          {measurement_unit && (
            <div className="absolute right-2 top-2 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 px-2 py-1 text-[10px] font-bold !text-white shadow-lg backdrop-blur-sm transition-transform duration-200 group-hover:scale-110">
              {measurement_unit}
            </div>
          )}
          
          {/* Product Name Badge - bottom overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
            <div className="rounded-lg bg-black/60 backdrop-blur-md px-2.5 py-1.5 sm:px-3 sm:py-2">
              <h3 className="line-clamp-2 text-xs font-bold leading-tight !text-white drop-shadow-lg sm:text-sm">
                {name}
              </h3>
            </div>
          </div>
          
          {/* Shine effect on hover */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
        </div>
        
        {/* Content Section */}
        <div className="relative bg-transparent p-3 sm:p-4">
          {/* Unit */}
          <div className="mb-2 flex items-center gap-1">
            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 sm:text-xs">
              per
            </span>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300 sm:text-xs">
              {unit}
            </span>
          </div>
          
          {/* Price - On its own line */}
          <div className="mb-3">
            <span className="text-xs font-bold leading-none text-green-600 dark:text-green-400 sm:text-sm">
              {formatCurrencySync(parseFloat(price || "0"))}
            </span>
          </div>
          
          {/* Add Button - Full Width at Bottom */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowModal(true);
            }}
            className="relative z-10 w-full rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-2 text-xs font-bold !text-white shadow-md shadow-green-500/30 transition-all duration-200 hover:scale-[1.02] hover:from-green-600 hover:to-emerald-600 hover:shadow-lg hover:shadow-green-500/50 active:scale-[0.98] sm:px-4 sm:py-2.5 sm:text-sm"
          >
            <span className="whitespace-nowrap">Add to Cart</span>
          </button>
        </div>
        
        {/* Border glow on hover */}
        <div className="absolute inset-0 rounded-2xl border-2 border-green-500/0 transition-all duration-300 group-hover:border-green-500/30" />
      </div>

      {/* Quantity Selection Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-md">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 dark:from-green-900/20 dark:to-emerald-900/20">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Select Quantity
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {name}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-full p-2 text-gray-400 transition-all hover:bg-white/80 hover:text-gray-600 hover:shadow-md dark:hover:bg-gray-700 dark:hover:text-gray-300"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">

              <div className="mb-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Enter Quantity
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={999}
                      value={selectedQuantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1;
                        setSelectedQuantity(Math.max(1, Math.min(999, value)));
                      }}
                      className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-4 text-center text-2xl font-bold text-gray-900 transition-all focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-400"
                      placeholder="1"
                      onFocus={(e) => e.target.select()}
                      autoFocus
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                      <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">
                        {measurement_unit || unit}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick quantity buttons */}
                <div>
                  <p className="mb-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                    Quick Select
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 5, 10].map((qty) => (
                      <button
                        key={qty}
                        onClick={() => setSelectedQuantity(qty)}
                        className={`rounded-xl border-2 px-4 py-2.5 text-sm font-bold transition-all duration-200 ${
                          selectedQuantity === qty
                            ? "border-green-500 bg-gradient-to-r from-green-500 to-emerald-500 !text-white shadow-lg shadow-green-500/30 scale-105"
                            : "border-gray-200 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50 hover:shadow-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:border-green-500 dark:hover:bg-green-900/20"
                        }`}
                      >
                        {qty}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 hover:shadow-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-3 text-sm font-bold !text-white shadow-lg shadow-green-500/30 transition-all duration-200 hover:scale-105 hover:from-green-600 hover:to-emerald-600 hover:shadow-xl hover:shadow-green-500/40 active:scale-95"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

