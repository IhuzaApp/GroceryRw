import React, { useState, useEffect } from "react";
import { formatCurrencySync } from "../../utils/formatCurrency";
import { Plus, Edit, Trash2, X, Star } from "lucide-react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useHideBottomBar } from "../../context/HideBottomBarContext";

interface ProductRating {
  id: string;
  comment: string | null;
  created_at: string;
  feedback: string | null;
  ratings: string | null;
  user_id: string;
  Users?: { id: string; name: string | null; email: string | null } | null;
}

export interface OtherDetailsOption {
  key: string;
  label: string;
  values: string[];
}

/** Color name -> { bg, text } for chips in product details */
const COLOR_CHIP_STYLES: Record<string, { bg: string; text: string }> = {
  Blue: { bg: "#2563eb", text: "#fff" },
  "Light Blue": { bg: "#7dd3fc", text: "#171717" },
  "Dark Blue": { bg: "#1e3a8a", text: "#fff" },
  Navy: { bg: "#1e3a5f", text: "#fff" },
  Red: { bg: "#dc2626", text: "#fff" },
  Green: { bg: "#16a34a", text: "#fff" },
  "Light Green": { bg: "#86efac", text: "#171717" },
  "Dark Green": { bg: "#14532d", text: "#fff" },
  Yellow: { bg: "#eab308", text: "#171717" },
  Gold: { bg: "#ca8a04", text: "#fff" },
  Orange: { bg: "#ea580c", text: "#fff" },
  Pink: { bg: "#ec4899", text: "#fff" },
  Rose: { bg: "#e11d48", text: "#fff" },
  Black: { bg: "#171717", text: "#fff" },
  White: { bg: "#fafafa", text: "#171717" },
  Gray: { bg: "#6b7280", text: "#fff" },
  Silver: { bg: "#a1a1aa", text: "#171717" },
  Brown: { bg: "#78350f", text: "#fff" },
  Beige: { bg: "#d4b896", text: "#171717" },
  Purple: { bg: "#7c3aed", text: "#fff" },
  Violet: { bg: "#6d28d9", text: "#fff" },
  Lavender: { bg: "#c4b5fd", text: "#171717" },
};
function getColorChipStyle(name: string): { background: string; color: string } | null {
  const key = Object.keys(COLOR_CHIP_STYLES).find((k) => k.toLowerCase() === name.toLowerCase());
  if (!key) return null;
  const s = COLOR_CHIP_STYLES[key];
  return { background: s.bg, color: s.text };
}

interface StoreProductCardProps {
  id: string;
  name: string;
  image: string;
  price: string;
  unit: string;
  measurement_unit?: string;
  description?: string;
  otherDetails?: { options?: OtherDetailsOption[] } | null;
  onAdd: (product: {
    id: string;
    name: string;
    price: string;
    unit: string;
    measurement_unit?: string;
    quantity: number;
    image?: string;
    selectedDetails?: Record<string, string>;
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
  otherDetails,
  onAdd,
  onEdit,
  onDelete,
}: StoreProductCardProps) {
  const options = otherDetails?.options ?? [];
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedDetails, setSelectedDetails] = useState<Record<string, string>>({});
  const [imageError, setImageError] = useState(false);
  const [ratings, setRatings] = useState<ProductRating[]>([]);
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const { setHideBottomBar } = useHideBottomBar();

  // When opening quantity modal, default each option (size, color) to first value
  useEffect(() => {
    if (showQuantityModal && options.length > 0) {
      const defaults: Record<string, string> = {};
      options.forEach((opt) => {
        if (opt.values?.length) defaults[opt.key] = opt.values[0];
      });
      setSelectedDetails(defaults);
    } else if (!showQuantityModal) {
      setSelectedDetails({});
    }
  }, [showQuantityModal, options.length]);

  useEffect(() => {
    if (showDetailsModal || showQuantityModal) {
      setHideBottomBar(true);
      document.body.classList.add("hide-bottom-bar");
    } else {
      setHideBottomBar(false);
      document.body.classList.remove("hide-bottom-bar");
    }
    return () => {
      setHideBottomBar(false);
      document.body.classList.remove("hide-bottom-bar");
    };
  }, [showDetailsModal, showQuantityModal, setHideBottomBar]);

  useEffect(() => {
    if (!showDetailsModal || !id) return;
    setRatingsLoading(true);
    fetch(`/api/queries/product-ratings?productId=${id}`)
      .then((res) => res.json())
      .then((data) => setRatings(data.ratings || []))
      .catch(() => setRatings([]))
      .finally(() => setRatingsLoading(false));
  }, [showDetailsModal, id]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  const handleAdd = () => {
    const details =
      Object.keys(selectedDetails).length > 0 ? selectedDetails : undefined;
    onAdd({
      id,
      name,
      price,
      unit,
      measurement_unit,
      quantity: selectedQuantity,
      image,
      selectedDetails: details,
    });
    setShowQuantityModal(false);
    setSelectedQuantity(1);
    setSelectedDetails({});
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
      {/* Compact Card - Small on mobile (3 per row), full on desktop */}
      <div
        className="group relative cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:border-green-400 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:rounded-2xl sm:shadow-md"
        onClick={() => setShowDetailsModal(true)}
      >
        {/* Image Section - Compact on mobile (5:4), square on larger screens */}
        <div className="relative aspect-[5/4] overflow-hidden bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-700 dark:via-gray-800 dark:to-gray-700 sm:aspect-square">
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

          {/* Unit/measurement badge - e.g. 100/box, kg, piece */}
          {(measurement_unit || unit) && (
            <div className="absolute right-1 top-1 rounded-full bg-gradient-to-r from-green-600/95 to-emerald-600/95 px-1.5 py-0.5 text-[9px] font-bold !text-white shadow-md backdrop-blur-sm sm:right-2 sm:top-2 sm:px-2 sm:py-1 sm:text-[10px]">
              {measurement_unit || unit}
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

        {/* Mobile: Minimal info - Name, Price, Unit, Add button */}
        <div className="p-1.5 sm:hidden">
          <p className="mb-0.5 line-clamp-1 text-[11px] font-semibold leading-tight text-gray-900 dark:text-white">
            {name}
          </p>
          <div className="flex items-center justify-between gap-1">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-green-600 dark:text-green-400">
                {formatCurrencySync(parseFloat(price || "0"))}
              </p>
              {(measurement_unit || unit) && (
                <p className="truncate text-[9px] font-medium text-gray-500 dark:text-gray-400">
                  {measurement_unit || unit}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowQuantityModal(true);
              }}
              className="flex-shrink-0 rounded-md bg-gradient-to-r from-green-500 to-emerald-500 p-1 shadow-md transition-all active:scale-95"
            >
              <Plus className="h-3 w-3 text-white" />
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

      {/* Product Details Modal - Full width on mobile, enough width on desktop */}
      {showDetailsModal && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/70 pt-6 backdrop-blur-md sm:items-center sm:justify-center sm:p-4"
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            className="flex h-[calc(100vh-1.5rem)] w-full max-w-[100vw] flex-col overflow-hidden rounded-t-2xl border-x-0 border-t border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800 sm:h-[85vh] sm:max-h-[88vh] sm:max-w-xl sm:rounded-2xl sm:border-x"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex-shrink-0 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 dark:from-green-900/20 dark:to-emerald-900/20">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1 pr-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Product Details
                  </h3>
                  <p className="mt-0.5 truncate text-sm text-gray-600 dark:text-gray-400">
                    {name}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-shrink-0 rounded-full p-2 text-gray-400 transition-all hover:bg-white/80 hover:text-gray-600 hover:shadow-md dark:hover:bg-gray-700 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="min-h-0 flex-1 overflow-y-auto">
              {/* Product Image */}
              <div className="relative h-48 w-full flex-shrink-0 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 sm:h-52">
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
              <div className="p-4 sm:p-5">
                <div className="space-y-3">
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

                  {/* Description - Always shown for users to read */}
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800/50">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Description
                    </label>
                    <p className="mt-2 min-h-[2.5rem] text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                      {description || "No description available."}
                    </p>
                  </div>

                  {/* Size & Colors (otherDetails) */}
                  {otherDetails?.options && otherDetails.options.length > 0 && (
                    <div className="space-y-3">
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Size & Colors
                      </label>
                      {otherDetails.options.map(
                        (opt) =>
                          opt.values && opt.values.length > 0 && (
                            <div key={opt.key || opt.label}>
                              <p className="mb-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                                {opt.label || opt.key}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {opt.values.map((v) => {
                                  const isColor = (opt.key || "").toLowerCase() === "color";
                                  const colorStyle = isColor ? getColorChipStyle(v) : null;
                                  const isTransparent = isColor && v.toLowerCase() === "transparent";
                                  const chipClass = colorStyle
                                    ? "inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium"
                                    : "inline-flex items-center rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200";
                                  return (
                                    <span
                                      key={v}
                                      className={chipClass}
                                      style={
                                        colorStyle
                                          ? isTransparent
                                            ? { border: "2px solid #d4d4d4", background: "#f5f5f5", color: "#171717" }
                                            : { background: colorStyle.background, color: colorStyle.color }
                                          : undefined
                                      }
                                    >
                                      {v}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )
                      )}
                    </div>
                  )}

                  {/* Ratings & Reviews */}
                  <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                      <Star className="h-4 w-4 text-amber-500" />
                      Reviews {ratings.length > 0 && `(${ratings.length})`}
                    </h4>
                    {ratingsLoading ? (
                      <p className="py-4 text-center text-sm text-gray-500">Loading reviews...</p>
                    ) : ratings.length === 0 ? (
                      <p className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        No reviews yet. Be the first to review!
                      </p>
                    ) : (
                      <div className="space-y-3 max-h-40 overflow-y-auto">
                        {ratings.map((r) => (
                          <div
                            key={r.id}
                            className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-600 dark:bg-gray-800/50"
                          >
                            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                {r.Users?.name || "Anonymous"}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDate(r.created_at)}
                              </span>
                            </div>
                            <div className="mb-1 flex text-amber-500">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <Star
                                  key={i}
                                  className={`h-3.5 w-3.5 ${
                                    i <= (parseFloat(r.ratings || "0") || 0) ? "fill-amber-500" : "fill-gray-200 dark:fill-gray-600"
                                  }`}
                                />
                              ))}
                            </div>
                            {(r.comment || r.feedback) && (
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {r.comment || r.feedback}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer - Add to Cart fixed at bottom */}
            <div className="flex-shrink-0 border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetailsModal(false);
                  setShowQuantityModal(true);
                }}
                className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-3 text-sm font-bold !text-white shadow-lg transition-all duration-200 hover:from-green-600 hover:to-emerald-600 active:scale-[0.98]"
              >
                Add to Cart
              </button>
              {(onEdit || onDelete) && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {onEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit();
                      }}
                      className="flex items-center justify-center gap-2 rounded-xl border-2 border-blue-500 bg-blue-50 px-3 py-2.5 text-sm font-bold text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
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
                      className="flex items-center justify-center gap-2 rounded-xl border-2 border-red-500 bg-red-50 px-3 py-2.5 text-sm font-bold text-red-600 dark:bg-red-900/20 dark:text-red-400"
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
      )}

      {/* Quantity Selection Modal - choose size, color & quantity (store products only) */}
      {showQuantityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-md">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 dark:from-green-900/20 dark:to-emerald-900/20">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {options.length > 0 ? "Choose size, color & quantity" : "Select quantity"}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {name}
                  </p>
                  {options.length > 0 && (
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      Pick size and color, then enter quantity.
                    </p>
                  )}
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
              <div className="mb-6 space-y-5">
                {/* Size & color (when product has options) */}
                {options.length > 0 && (
                  <div className="space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Size & options
                    </p>
                    {options.map((opt) => (
                      <div key={opt.key}>
                        <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {opt.label || opt.key}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {(opt.values || []).map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() =>
                                setSelectedDetails((prev) => ({
                                  ...prev,
                                  [opt.key]: val,
                                }))
                              }
                              className={`rounded-xl border-2 px-3 py-2 text-sm font-medium transition-all ${
                                selectedDetails[opt.key] === val
                                  ? "border-green-500 bg-green-500 text-white dark:bg-green-600"
                                  : "border-gray-200 bg-white text-gray-700 hover:border-green-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:border-green-500"
                              }`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quantity */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Quantity
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
