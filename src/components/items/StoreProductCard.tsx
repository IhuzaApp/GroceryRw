import React, { useState } from "react";
import { formatCurrencySync } from "../../utils/formatCurrency";
import { Plus, Edit, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";

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
  onEdit?: (productId: string) => void;
  onDelete?: (productId: string) => void;
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
  onEdit,
  onDelete,
}: StoreProductCardProps) {
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);

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
    setShowQuantityModal(false);
    setSelectedQuantity(1);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(id);
      setShowDetailsModal(false);
    }
  };

  const handleDelete = async () => {
    if (onDelete) {
      if (window.confirm(`Are you sure you want to disable "${name}"?`)) {
        try {
          await onDelete(id);
          toast.success("Product disabled successfully");
          setShowDetailsModal(false);
        } catch (error) {
          toast.error("Failed to disable product");
        }
      }
    }
  };

  return (
    <>
      {/* Compact Card - Small on mobile, 2 per row */}
      <div
        className="group relative cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md transition-all duration-300 hover:border-green-400 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:rounded-2xl"
        onClick={() => setShowDetailsModal(true)}
      >
        {/* Image Section - Smaller on mobile */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-700 dark:via-gray-800 dark:to-gray-700">
          <img
            src={
              imageError
                ? "/images/groceryPlaceholder.png"
                : image || "/images/groceryPlaceholder.png"
            }
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              if (!imageError) {
                setImageError(true);
                e.currentTarget.src = "/images/groceryPlaceholder.png";
              }
            }}
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent transition-opacity duration-300 group-hover:from-black/50" />

          {/* Measurement unit badge - Desktop only */}
          {measurement_unit && (
            <div className="absolute right-2 top-2 hidden rounded-full bg-gradient-to-r from-green-600 to-emerald-600 px-2 py-1 text-[10px] font-bold !text-white shadow-lg backdrop-blur-sm sm:block">
              {measurement_unit}
            </div>
          )}

          {/* Product Name Badge - Desktop only */}
          <div className="absolute bottom-0 left-0 right-0 hidden p-2 sm:block md:p-3">
            <div className="rounded-lg bg-black/60 px-2.5 py-1.5 backdrop-blur-md md:px-3 md:py-2">
              <h3 className="line-clamp-2 text-xs font-bold leading-tight !text-white drop-shadow-lg md:text-sm">
                {name}
              </h3>
            </div>
          </div>
        </div>

        {/* Mobile: Minimal info - Name, Price, Add button */}
        <div className="p-2 sm:hidden">
          <p className="mb-1 line-clamp-1 text-xs font-semibold text-gray-900 dark:text-white">
            {name}
          </p>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-green-600 dark:text-green-400">
              {formatCurrencySync(parseFloat(price || "0"))}
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowQuantityModal(true);
              }}
              className="flex-shrink-0 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 p-1.5 shadow-md transition-all active:scale-95"
            >
              <Plus className="h-3.5 w-3.5 text-white" />
            </button>
          </div>
        </div>

        {/* Desktop: Full info */}
        <div className="hidden bg-transparent p-3 sm:block md:p-4">
          <div className="mb-2 flex items-center gap-1">
            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 sm:text-xs">
              per
            </span>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300 sm:text-xs">
              {unit}
            </span>
          </div>

          <div className="mb-2 sm:mb-3">
            <span className="text-sm font-bold leading-none text-green-600 dark:text-green-400 sm:text-base">
              {formatCurrencySync(parseFloat(price || "0"))}
            </span>
          </div>

          {description && (
            <div className="mb-3">
              <p className="line-clamp-2 text-xs text-gray-600 dark:text-gray-400">
                {description}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowQuantityModal(true);
            }}
            className="relative z-10 w-full rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-2 text-xs font-bold !text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:from-green-600 hover:to-emerald-600 active:scale-[0.98] sm:px-4 sm:py-2.5 sm:text-sm"
          >
            Add to Cart
          </button>
        </div>
      </div>

      {/* Product Details Modal */}
      {showDetailsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-md"
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 dark:from-green-900/20 dark:to-emerald-900/20">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Product Details
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {name}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="rounded-full p-2 text-gray-400 transition-all hover:bg-white/80 hover:text-gray-600 hover:shadow-md dark:hover:bg-gray-700 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Product Image */}
            <div className="relative h-64 w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
              <img
                src={
                  imageError
                    ? "/images/groceryPlaceholder.png"
                    : image || "/images/groceryPlaceholder.png"
                }
                alt={name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  if (!imageError) {
                    setImageError(true);
                    e.currentTarget.src = "/images/groceryPlaceholder.png";
                  }
                }}
              />
            </div>

            {/* Product Info */}
            <div className="p-6">
              <div className="mb-4 space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Product Name
                  </label>
                  <p className="mt-1 text-base font-bold text-gray-900 dark:text-white">
                    {name}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Price
                    </label>
                    <p className="mt-1 text-lg font-bold text-green-600 dark:text-green-400">
                      {formatCurrencySync(parseFloat(price || "0"))}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Unit
                    </label>
                    <p className="mt-1 text-base font-semibold text-gray-900 dark:text-white">
                      {unit}
                    </p>
                  </div>
                </div>

                {measurement_unit && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Measurement Unit
                    </label>
                    <p className="mt-1 text-base font-semibold text-gray-900 dark:text-white">
                      {measurement_unit}
                    </p>
                  </div>
                )}

                {description && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Description
                    </label>
                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                      {description}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetailsModal(false);
                    setShowQuantityModal(true);
                  }}
                  className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-3 text-sm font-bold !text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-green-600 hover:to-emerald-600 active:scale-95"
                >
                  Add to Cart
                </button>

                {(onEdit || onDelete) && (
                  <div className="grid grid-cols-2 gap-3">
                    {onEdit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit();
                        }}
                        className="flex items-center justify-center gap-2 rounded-xl border-2 border-blue-500 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-600 transition-all hover:bg-blue-100 active:scale-95 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete();
                        }}
                        className="flex items-center justify-center gap-2 rounded-xl border-2 border-red-500 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition-all hover:bg-red-100 active:scale-95 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                      >
                        <Trash2 className="h-4 w-4" />
                        Disable
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quantity Selection Modal */}
      {showQuantityModal && (
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
                  onClick={() => setShowQuantityModal(false)}
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
                            ? "scale-105 border-green-500 bg-gradient-to-r from-green-500 to-emerald-500 !text-white shadow-lg shadow-green-500/30"
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
                  onClick={() => setShowQuantityModal(false)}
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
