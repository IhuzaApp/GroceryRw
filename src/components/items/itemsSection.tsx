import React, { useState, useEffect } from "react";
import { Input, InputGroup, Nav, Pagination } from "rsuite";
import ProductCard from "./ProductCard";

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
