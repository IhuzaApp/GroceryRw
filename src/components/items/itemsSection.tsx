import React, { useState, useEffect } from "react";
import { formatCurrency } from "../../lib/formatCurrency";
import ProdCategories from "@components/ui/categories";
import Image from "next/image";
import { Input, InputGroup, Button, Badge, Nav, Pagination } from "rsuite";
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

export default function ItemsSection({
  activeCategory,
  shop,
  filteredProducts,
  setActiveCategory,
}: any) {
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  // Simulate loading when category changes
  useEffect(() => {
    setLoadingProducts(true);
    const timer = setTimeout(() => setLoadingProducts(false), 300);
    return () => clearTimeout(timer);
  }, [activeCategory]);

  // Extract unique categories from products
  const allCategories: string[] = Array.from(
    new Set(shop.products.map((p: any) => p.category))
  );
  const categories: string[] = ["all", ...allCategories];

  // Use the provided activeCategory and setActiveCategory for filtering

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const searchedProducts = filteredProducts.filter((product: any) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedProducts = searchedProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  return (
    <>
      {/* Categories Navigation */}
      <div className="sticky top-[73px] z-10 border-b bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="overflow-x-auto px-4">
          <Nav
            appearance="subtle"
            activeKey={activeCategory}
            onSelect={(value) => setActiveCategory(value as string)}
          >
            {categories.map((category: string) => (
              <Nav.Item
                key={category}
                eventKey={category}
                className="px-4 capitalize dark:text-gray-200"
              >
                {category}
              </Nav.Item>
            ))}
          </Nav>
        </div>
      </div>

      {/* Products Grid */}
      <div className="p-4">
        <div className="flex flex-col items-baseline justify-between gap-4 md:flex-row">
          <h2 className="text-xl font-bold">
            {activeCategory && activeCategory !== "all"
              ? String(activeCategory).charAt(0).toUpperCase() +
                String(activeCategory).slice(1)
              : "All Products"}
          </h2>
          <div className="w-full md:w-72">
            <InputGroup inside>
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <InputGroup.Addon>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </InputGroup.Addon>
            </InputGroup>
          </div>
        </div>
        <div className="my-4 border-b dark:border-gray-700"></div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {loadingProducts
            ? Array(12)
                .fill(0)
                .map((_, idx) => (
                  <div
                    key={idx}
                    className="animate-pulse overflow-hidden rounded-lg bg-white shadow-sm dark:bg-gray-700"
                  >
                    <div className="h-40 bg-gray-200 dark:bg-gray-600" />
                    <div className="space-y-2 p-3">
                      <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-600" />
                      <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-600" />
                      <div className="h-6 w-1/2 rounded bg-gray-200 dark:bg-gray-600" />
                    </div>
                  </div>
                ))
            : paginatedProducts.map((product: any) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  shopId={shop.id}
                  name={product.name}
                  image={product.image}
                  final_price={product.final_price}
                  unit={product.unit}
                  sale={product.sale}
                  originalPrice={product.originalPrice}
                  measurement_unit={product.measurement_unit}
                  quantity={product.quantity}
                />
              ))}
        </div>
        {searchedProducts.length > productsPerPage && (
          <div className="mt-8 flex justify-center">
            <Pagination
              prev
              next
              size="md"
              total={searchedProducts.length}
              limit={productsPerPage}
              activePage={currentPage}
              onChangePage={setCurrentPage}
            />
          </div>
        )}
      </div>
    </>
  );
}

function ProductCard({
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
            <Badge
              content="SALE"
              className="absolute left-2 top-2 rounded bg-red-500 px-2 py-1 text-xs font-bold text-white"
            />
          )}
          {quantity !== undefined && (
            <Badge
              content={quantity}
              className="absolute right-2 top-2 rounded bg-blue-500 px-2 py-1 text-xs font-bold text-white"
            />
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
                {measurement_unit ? ` / ${measurement_unit}` : ""}
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
                className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 p-0 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
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
                appearance="primary"
                size="sm"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 p-0 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
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
                        : "border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-700"
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
                className="rounded-lg bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
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
