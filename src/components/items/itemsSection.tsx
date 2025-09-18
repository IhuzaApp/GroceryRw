import React, { useState, useEffect } from "react";
import { Input, InputGroup, Nav } from "rsuite";
import ProductCard from "./ProductCard";

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
  const productsPerPage = 30;

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
              Showing {paginatedProducts.length} of {searchedProducts.length} products
            </p>
          </div>
        </div>
        {/* Products Grid */}
        <div className="grid grid-cols-4 gap-2 transition-all duration-300 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-10">
          {loadingProducts
            ? Array(30)
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
                <div
                  key={product.id}
                  id={`product-${product.id}`}
                  className={`transition-all duration-300 ${
                    highlightProductId === product.id 
                      ? 'shadow-2xl shadow-yellow-500/50 transform scale-105 rounded-xl' 
                      : ''
                  }`}
                >
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
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Load More Products</span>
              <span className="text-xs opacity-75">
                ({Math.min(productsPerPage, searchedProducts.length - displayedProducts)} more)
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
