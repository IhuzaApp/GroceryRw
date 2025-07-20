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
}: ProductCardProps) {
  const { addItem } = useCart();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

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
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg shadow-black/5 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10 dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-400/10 dark:hover:shadow-gray-300/15">
        <div className="relative">
          <Image
            src={
              image ||
              "https://www.thedailymeal.com/img/gallery/you-should-think-twice-about-bagging-your-own-groceries-at-the-store/intro-1681220544.jpg"
            }
            alt={name}
            width={150}
            height={150}
            className="w-full object-cover"
          />
                      {sale && (
              <div className="absolute left-2 top-2 rounded bg-red-500 px-2 py-1 text-xs font-bold !text-white">
                SALE
              </div>
            )}
            {quantity !== undefined && (
              <div className="absolute right-2 top-2  rounded-full bg-purple-500 px-2 py-1 text-xs font-bold !text-white">
               {measurement_unit}
              </div>
            )}
        </div>
        <div className="p-3">
          <h3 className="mb-1 font-medium text-gray-900 dark:text-gray-100">
            {name}
          </h3>
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
            {unit}
          </p>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(parseFloat(final_price || "0"))}
            
              </span>
              {sale && originalPrice && (
                <span className="ml-2 text-sm text-gray-500 line-through dark:text-gray-400">
                  {formatCurrency(parseFloat(originalPrice || "0"))}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                appearance="primary"
                size="sm"
                className="!bg-green-500 !text-white hover:!bg-green-600 dark:!bg-green-600 dark:hover:!bg-green-700 flex h-8 w-8 items-center justify-center rounded-full p-0 border-0"
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
                className="!bg-green-100 !text-green-700 hover:!bg-green-200 dark:!bg-gray-700 dark:!text-gray-300 dark:hover:!bg-gray-600 flex h-8 w-8 items-center justify-center rounded-full p-0 border-0"
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
              <div className="mb-4 flex items-center justify-between">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  Quantity
                </span>
                <div className="flex items-center rounded-lg border border-gray-300 dark:border-gray-600">
                  <button
                    onClick={() =>
                      setSelectedQuantity(Math.max(1, selectedQuantity - 1))
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-l-lg text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={selectedQuantity}
                    onChange={(e) =>
                      setSelectedQuantity(
                        Math.max(1, parseInt(e.target.value, 10) || 1)
                      )
                    }
                    className="h-10 w-16 border-x border-gray-300 p-0 text-center font-semibold text-gray-800 focus:outline-none dark:border-gray-600 dark:bg-gray-700/50 dark:text-white"
                    onFocus={(e) => e.target.select()}
                    autoFocus
                  />
                  <button
                    onClick={() => setSelectedQuantity(selectedQuantity + 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-r-lg text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                  >
                    +
                  </button>
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
                onClick={() => setShowModal(false)}
                className="rounded-lg bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 transition-colors hover:bg-green-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                id="add-to-cart-btn"
                onClick={() => {
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
    </>
  );
} 