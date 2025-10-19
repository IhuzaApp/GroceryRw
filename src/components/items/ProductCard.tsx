import React, { useState } from "react";
import { formatCurrency } from "../../lib/formatCurrency";
import Image from "next/image";
import { Button } from "rsuite";
import { useCart } from "../../context/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

interface ProductCardProps {
  id: string;
  name: string;
  image: string;
  final_price: string;
  unit: string;
  sale?: boolean;
  originalPrice?: string;
  measurement_unit?: string;
  quantity?: number;
  shopId: string;
  highlighted?: boolean;
  productName?: {
    id: string;
    name: string;
    description?: string;
    barcode?: string;
    sku?: string;
    image?: string;
  };
}

export default function ProductCard({
  id,
  shopId,
  name,
  image,
  final_price,
  unit,
  sale,
  originalPrice,
  measurement_unit,
  quantity,
  highlighted,
  productName,
}: ProductCardProps) {
  const { addItem } = useCart();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isModalTransitioning, setIsModalTransitioning] = useState(false);

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (status === "loading") return;
    if (status === "unauthenticated") {
      localStorage.setItem(
        "pendingCartAction",
        JSON.stringify({
          shopId,
          productId: id,
          quantity: 1,
          price: final_price, // Add price to pending action
        })
      );
      router.push(`/auth/login?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }

    setIsAdding(true);
    const toastId = toast.loading("Adding to cart...");

    try {
      await addItem(shopId, id, 1);

      // Update toast with success message
      toast.success(
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 text-green-500 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-medium">1 × {name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Added to cart
            </p>
          </div>
        </div>,
        {
          id: toastId,
          duration: 2000,
        }
      );
    } catch (err: any) {
      console.error("Quick add to cart failed:", err);
      toast.error(err.message || "Failed to add to cart", {
        id: toastId,
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <>
      <div
        className={`cursor-pointer overflow-hidden transition-all duration-300 ease-in-out ${
          highlighted
            ? "scale-105 transform shadow-2xl shadow-yellow-500/50"
            : ""
        }`}
        onClick={(e) => {
          // Only open details modal if not clicking on a button and not transitioning
          if (
            !(e.target as HTMLElement).closest("button") &&
            !isModalTransitioning
          ) {
            setShowDetailsModal(true);
          }
        }}
      >
        <div className="relative aspect-square overflow-hidden rounded-2xl shadow-lg ring-1 ring-gray-200/50 dark:ring-gray-700/50">
          <Image
            src={
              productName?.image ||
              image ||
              "https://www.thedailymeal.com/img/gallery/you-should-think-twice-about-bagging-your-own-groceries-at-the-store/intro-1681220544.jpg"
            }
            alt={name}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
          {sale && (
            <div className="absolute left-1 top-1 rounded bg-red-500 px-1.5 py-0.5 text-xs font-bold !text-white">
              SALE
            </div>
          )}
          {measurement_unit && (
            <div className="absolute top-1 right-1 rounded bg-gray-800 px-1.5 py-0.5 text-xs font-bold !text-white">
              {measurement_unit}
            </div>
          )}
          
          {/* Cart Buttons Overlay on Product Image */}
          <div className="absolute bottom-2 right-2 flex gap-2">
            <Button
              appearance="primary"
              size="sm"
              className="flex h-8 w-8 items-center justify-center rounded-full border-0 !bg-green-500 p-0 !text-white hover:!bg-green-600 shadow-lg"
              onClick={handleQuickAdd}
              disabled={isAdding}
            >
              {isAdding ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-4 w-4"
                >
                  <path d="M3 6h19l-3 10H6L3 6z" />
                  <path d="M8 18a2 2 0 100 4 2 2 0 000-4z" />
                  <path d="M19 18a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
              )}
            </Button>
            <Button
              appearance="subtle"
              size="sm"
              className="flex h-8 w-8 items-center justify-center rounded-full border-0 !bg-green-100 p-0 !text-green-700 hover:!bg-green-200 dark:!bg-gray-700 dark:!text-gray-300 dark:hover:!bg-gray-600 shadow-lg"
              onClick={() => {
                setShowModal(true);
                setSelectedQuantity(1);
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </Button>
          </div>
        </div>
        <div className="p-1.5 sm:p-2 bg-transparent">
          <h3 className="mb-1 line-clamp-2 text-xs font-medium text-gray-600 dark:text-gray-400 sm:text-sm">
            {name}
          </h3>
          <p className="mb-1 text-xs text-gray-500 dark:text-gray-400 sm:mb-2">
            {unit}
          </p>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-gray-900 dark:text-white sm:text-base">
                {formatCurrency(parseFloat(final_price || "0"))}
              </span>
              {sale && originalPrice && (
                <span className="ml-1 text-xs text-gray-500 line-through dark:text-gray-400">
                  {formatCurrency(parseFloat(originalPrice || "0"))}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div
            className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800"
            onKeyDown={(e) => {
              // Enter key submits the form
              if (e.key === "Enter") {
                e.preventDefault();
                document.getElementById("add-to-cart-btn")?.click();
              }
              // Escape key closes the modal
              if (e.key === "Escape") {
                setShowModal(false);
              }
              // Up arrow increases quantity
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedQuantity(selectedQuantity + 1);
              }
              // Down arrow decreases quantity
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedQuantity(Math.max(1, selectedQuantity - 1));
              }
            }}
          >
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Add {name} to Cart
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="-mr-2 -mt-2 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="my-6">
              <div className="mb-4 space-y-3">
                <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enter Quantity
                </span>
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
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-center text-lg font-semibold text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-400 dark:focus:ring-green-400/20"
                    placeholder="1"
                    onFocus={(e) => e.target.select()}
                    autoFocus
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {unit}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick quantity buttons */}
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {[1, 2, 3, 5, 10].map((qty) => (
                  <button
                    key={qty}
                    onClick={() => setSelectedQuantity(qty)}
                    className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                      selectedQuantity === qty
                        ? "border-green-600 bg-green-100 text-green-800 dark:border-green-500 dark:bg-green-500/20 dark:text-green-300"
                        : "border-green-300 bg-green-50 text-green-700 hover:bg-green-100 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    {qty}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowModal(false);
                }}
                className="rounded-lg bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 transition-colors hover:bg-green-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                id="add-to-cart-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  if (status === "loading") return;
                  if (status === "unauthenticated") {
                    localStorage.setItem(
                      "pendingCartAction",
                      JSON.stringify({
                        shopId,
                        productId: id,
                        quantity: selectedQuantity,
                      })
                    );
                    router.push(
                      `/auth/login?redirect=${encodeURIComponent(
                        router.asPath
                      )}`
                    );
                    return;
                  }

                  // Immediately close the modal to allow the user to continue shopping
                  setShowModal(false);

                  // Show loading toast and handle add-to-cart in the background
                  const toastId = toast.loading("Adding to cart...");
                  addItem(shopId, id, selectedQuantity)
                    .then(() => {
                      toast.success(
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                            <svg
                              viewBox="0 0 24 24"
                              className="h-4 w-4 text-green-500 dark:text-green-400"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium">
                              {selectedQuantity} × {name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Added to cart
                            </p>
                          </div>
                        </div>,
                        {
                          id: toastId,
                          duration: 2000,
                        }
                      );
                    })
                    .catch((err: any) => {
                      console.error("Add to cart failed:", err);
                      toast.error(err.message || "Failed to add to cart", {
                        id: toastId,
                      });
                    });
                }}
                className="rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-green-500/20 transition-colors hover:bg-green-700"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Product Details
              </h2>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetailsModal(false);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
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
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Product Image */}
                <div className="space-y-4">
                  <div className="relative overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-700">
                    <Image
                      src={
                        image ||
                        "https://www.thedailymeal.com/img/gallery/you-should-think-twice-about-bagging-your-own-groceries-at-the-store/intro-1681220544.jpg"
                      }
                      alt={name}
                      width={300}
                      height={300}
                      className="h-48 w-full object-cover md:h-56"
                    />
                    {sale && (
                      <div className="absolute left-4 top-4 rounded-lg bg-red-500 px-3 py-1 text-sm font-bold text-white">
                        SALE
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Information */}
                <div className="space-y-4">
                  {/* Product Name */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {productName?.name || name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {unit}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(parseFloat(final_price || "0"))}
                    </span>
                    {sale && originalPrice && (
                      <span className="text-base text-gray-500 line-through dark:text-gray-400">
                        {formatCurrency(parseFloat(originalPrice || "0"))}
                      </span>
                    )}
                  </div>

                  {/* Product Description */}
                  {productName?.description && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Description
                      </label>
                      <p className="mt-2 text-sm leading-relaxed text-gray-900 dark:text-white">
                        {productName.description}
                      </p>
                    </div>
                  )}

                  {/* Product Details */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          SKU
                        </label>
                        <p className="break-all text-xs text-gray-900 dark:text-white">
                          {productName?.sku || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          Measurement Unit
                        </label>
                        <p className="text-xs text-gray-900 dark:text-white">
                          {measurement_unit || "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Barcode Section */}
                    {productName?.barcode && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          Barcode
                        </label>
                        <div className="mt-1 flex items-center gap-2">
                          <div className="flex-1 rounded border border-gray-200 bg-gray-50 p-2 text-center font-mono text-xs dark:border-gray-600 dark:bg-gray-700">
                            {productName.barcode}
                          </div>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(
                                productName.barcode || ""
                              );
                              toast.success("Barcode copied to clipboard!");
                            }}
                            className="rounded bg-gray-100 p-2 text-gray-600 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h2m8 0h2a2 2 0 012 2v8a2 2 0 01-2 2h-2m-8 0V8a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2H8z"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsModalTransitioning(true);
                        setShowDetailsModal(false);
                        setTimeout(() => {
                          setShowModal(true);
                          setSelectedQuantity(1);
                          setIsModalTransitioning(false);
                        }, 100);
                      }}
                      className="flex flex-1 items-center justify-center rounded bg-green-600 px-3 py-2 text-white shadow-sm shadow-green-500/20 transition-colors hover:bg-green-700"
                      title="Add to Cart"
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
                          strokeWidth={2}
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0L17 18m0 0l2.5-5M17 18H9"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickAdd(e);
                      }}
                      className="flex items-center justify-center rounded border border-gray-300 bg-white px-3 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      title="Quick Add"
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
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
