import React, { useState, useEffect } from "react";
import { Input, InputGroup, Nav } from "rsuite";
import ProductCard from "./ProductCard";

export default function ItemsSection({
  activeCategory,
  shop,
  filteredProducts,
  setActiveCategory,
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
      {/* Sticky Navigation with Header and Search */}
      <div
        className={`${
          isSticky ? "fixed left-0 right-0 top-12 z-50" : "relative"
        } border-b bg-white shadow-sm transition-all duration-500 ease-in-out dark:border-gray-700 dark:bg-gray-800 ${
          isSticky ? "shadow-lg backdrop-blur-sm" : ""
        }`}
      >
        <div className="p-2 sm:p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-baseline md:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <h2 className="text-lg font-bold transition-all duration-300 sm:text-xl">
                {activeCategory && activeCategory !== "all"
                  ? String(activeCategory).charAt(0).toUpperCase() +
                    String(activeCategory).slice(1)
                  : "All Products"}
              </h2>
              <span className="text-xs text-gray-500 transition-all duration-300 dark:text-gray-400 sm:text-sm">
                Showing {paginatedProducts.length} of {searchedProducts.length}{" "}
                products
              </span>
            </div>
            <div className="w-full md:w-72">
              <InputGroup inside>
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="text-sm sm:text-base"
                />
                <InputGroup.Addon>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 sm:h-5 sm:w-5"
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
        </div>
        <div className="overflow-x-auto px-2 sm:px-4">
          <Nav
            appearance="subtle"
            activeKey={activeCategory}
            onSelect={(value) => setActiveCategory(value as string)}
            className="flex-nowrap"
          >
            {categories.map((category: string) => (
              <Nav.Item
                key={category}
                eventKey={category}
                className="whitespace-nowrap px-2 text-sm capitalize dark:text-gray-200 sm:px-4 sm:text-base"
              >
                {category}
              </Nav.Item>
            ))}
          </Nav>
        </div>
      </div>

      {/* Products Grid */}
      <div
        className={`p-2 transition-all duration-500 ease-in-out sm:p-4 ${
          isSticky ? "pt-24" : "pt-0"
        }`}
      >
        <div className="my-4 border-b dark:border-gray-700"></div>
        <div className="grid grid-cols-2 gap-2 transition-all duration-300 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
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
                <ProductCard
                  key={product.id}
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
                />
              ))}
        </div>

        {/* View More Button */}
        {hasMoreProducts && (
          <div className="mt-6 flex justify-center px-2 sm:mt-8 sm:px-0">
            <button
              onClick={handleViewMore}
              className="flex w-full items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm text-white shadow-sm shadow-green-500/20 transition-all duration-300 ease-in-out hover:scale-105 hover:bg-green-700 active:scale-95 dark:bg-green-600 dark:hover:bg-green-700 sm:w-auto sm:px-6 sm:py-3 sm:text-base"
            >
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
              <span className="hidden sm:inline">View More</span>
              <span className="sm:hidden">Load More</span>
              <span className="text-xs sm:text-sm">
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
