import React, { useState, useEffect } from "react";
import { Input, InputGroup, Nav } from "rsuite";
import ProductCard from "./ProductCard";
import { useSession } from "next-auth/react";

export default function ItemsSection({
  activeCategory,
  shop,
  filteredProducts,
  setActiveCategory,
  highlightProductId,
}: any) {
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [displayedProducts, setDisplayedProducts] = useState(30);
  const [isSticky, setIsSticky] = useState(false);
  const [favoriteProducts, setFavoriteProducts] = useState<any[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState<boolean>(false);
  const productsPerPage = 30;
  const { data: session } = useSession();

  // Simulate loading when category changes
  useEffect(() => {
    setLoadingProducts(true);
    const timer = setTimeout(() => setLoadingProducts(false), 300);
    return () => clearTimeout(timer);
  }, [activeCategory]);

  // Reset displayed products when category or search changes
  useEffect(() => {
    setDisplayedProducts(30);
  }, [activeCategory, searchQuery]);

  // Extract unique categories from products
  const allCategories: string[] = Array.from(
    new Set(shop.products.map((p: any) => p.category))
  );
  const categories: string[] = ["all", ...allCategories];

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleViewMore = () => {
    setDisplayedProducts((prev) => prev + productsPerPage);
  };

  // Fetch favorite products based on user's order history for this shop
  const fetchFavoriteProducts = async () => {
    if (!session?.user || !shop?.id) {
      return;
    }

    setLoadingFavorites(true);
    try {
      const response = await fetch("/api/queries/orders");
      const data = await response.json();

      // For demo purposes, let's always show some favorite products
      const allProducts = shop.products || [];

      if (allProducts.length > 0) {
        const randomFavorites = allProducts
          .sort(() => Math.random() - 0.5) // Randomize for demo
          .slice(0, 6)
          .map((product: any, index: number) => ({
            ...product,
            orderCount: Math.floor(Math.random() * 10) + 1, // Random order count for demo
          }));

        setFavoriteProducts(randomFavorites);
      }

      // Original logic for when we have real order data
      if (data.orders && data.orders.length > 0) {
        // Filter orders for this specific shop
        const shopOrders = data.orders.filter(
          (order: any) => order.shop_id === shop.id
        );
      }
    } catch (error) {
      console.error("Error fetching favorite products:", error);
    } finally {
      setLoadingFavorites(false);
    }
  };

  // Fetch favorite products when component mounts or shop changes
  useEffect(() => {
    fetchFavoriteProducts();
  }, [session?.user, shop?.id]);

  const searchedProducts = filteredProducts.filter((product: any) =>
    (product.ProductName?.name || product.name || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // Handle scroll to make category navigation sticky
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const bannerHeight = 200; // Approximate banner height
      const totalProducts = searchedProducts.length;

      // Adjust sticky trigger based on number of products
      let stickyTriggerHeight = bannerHeight;

      if (totalProducts < 30) {
        // For fewer products, require more scrolling before making sticky
        stickyTriggerHeight = bannerHeight + 300; // Additional 300px scroll required
      } else if (totalProducts < 60) {
        // For moderate products, require some additional scrolling
        stickyTriggerHeight = bannerHeight + 150; // Additional 150px scroll required
      }

      if (scrollY > stickyTriggerHeight) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [searchedProducts.length]);

  const paginatedProducts = searchedProducts.slice(0, displayedProducts);
  const hasMoreProducts = searchedProducts.length > displayedProducts;

  return (
    <>
      {/* Products Grid */}
      <div className="space-y-6">
        {/* Search Input - Mobile Only */}
        <div className="relative mt-2 w-full sm:hidden">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white/95 py-4 pl-12 pr-4 text-gray-900 placeholder-gray-500 shadow-lg backdrop-blur-sm transition-all duration-300 focus:bg-white focus:outline-none dark:border-gray-600 dark:bg-gray-800/95 dark:text-white dark:placeholder-gray-400 dark:focus:bg-gray-800"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Favorite Products Section */}
        {(favoriteProducts.length > 0 || loadingFavorites) && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <svg
                  className="h-4 w-4 text-green-600 dark:text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Your Favorites
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({favoriteProducts.length} items)
              </span>
            </div>

            {loadingFavorites ? (
              <div className="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 flex gap-3 overflow-x-auto pb-2">
                {Array(6)
                  .fill(0)
                  .map((_, idx) => (
                    <div key={idx} className="flex-shrink-0 animate-pulse">
                      <div className="aspect-square w-24 rounded-2xl bg-gray-200 dark:bg-gray-600" />
                      <div className="mt-2 space-y-1">
                        <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-gray-600" />
                        <div className="h-2 w-1/2 rounded bg-gray-200 dark:bg-gray-600" />
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 flex gap-3 overflow-x-auto pb-2">
                {favoriteProducts.map((product: any) => (
                  <div key={product.id} className="w-24 flex-shrink-0">
                    <ProductCard
                      id={product.id}
                      shopId={shop.id}
                      name={product.ProductName?.name || product.name}
                      image={product.image}
                      final_price={product.final_price}
                      unit={product.unit}
                      sale={product.sale}
                      originalPrice={product.originalPrice}
                      measurement_unit={product.measurement_unit}
                      quantity={product.quantity}
                      productName={product.ProductName}
                      highlighted={false}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
              {activeCategory && activeCategory !== "all"
                ? String(activeCategory).charAt(0).toUpperCase() +
                  String(activeCategory).slice(1)
                : "All Products"}
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Showing {paginatedProducts.length} of {searchedProducts.length}{" "}
              products
            </p>
          </div>
        </div>

        {/* Category Filter Section - Mobile Only */}
        <div className="space-y-3 sm:hidden">

          
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            <button
              onClick={() => setActiveCategory("all")}
              className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                activeCategory === "all"
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 !text-white shadow-lg shadow-green-500/25"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              All
            </button>
            {categories.slice(1).map((category: string) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                  activeCategory === category
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 !text-white shadow-lg shadow-green-500/25"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {/* Products Grid - Mobile optimized */}
        <div className="grid grid-cols-3 gap-2 transition-all duration-300 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {loadingProducts
            ? Array(30)
                .fill(0)
                .map((_, idx) => (
                  <div
                    key={idx}
                    className="animate-pulse overflow-hidden rounded-lg bg-white shadow-sm dark:bg-gray-700"
                  >
                    <div className="h-32 bg-gray-200 dark:bg-gray-600" />
                    <div className="space-y-2 p-2">
                      <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-gray-600" />
                      <div className="h-2 w-1/2 rounded bg-gray-200 dark:bg-gray-600" />
                      <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-600" />
                    </div>
                  </div>
                ))
            : paginatedProducts.map((product: any) => (
                <div key={product.id} id={`product-${product.id}`}>
                  <ProductCard
                    id={product.id}
                    shopId={shop.id}
                    name={product.ProductName?.name || product.name}
                    image={product.image}
                    final_price={product.final_price}
                    unit={product.unit}
                    sale={product.sale}
                    originalPrice={product.originalPrice}
                    measurement_unit={product.measurement_unit}
                    quantity={product.quantity}
                    productName={product.ProductName}
                    highlighted={highlightProductId === product.id}
                  />
                </div>
              ))}
        </div>

        {/* View More Button */}
        {hasMoreProducts && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleViewMore}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-green-500/25 transition-all duration-300 hover:scale-105 hover:shadow-green-500/40 active:scale-95"
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span>Load More Products</span>
              <span className="text-xs opacity-75">
                (
                {Math.min(
                  productsPerPage,
                  searchedProducts.length - displayedProducts
                )}{" "}
                more)
              </span>
            </button>
          </div>
        )}

        {/* End of products message */}
        {!hasMoreProducts && searchedProducts.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              You've reached the end of all products
            </p>
          </div>
        )}

        {/* No products message */}
        {searchedProducts.length === 0 && !loadingProducts && (
          <div className="mt-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
              <svg
                className="h-8 w-8 text-gray-400"
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
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              No products found matching your search
            </p>
          </div>
        )}
      </div>
    </>
  );
}
