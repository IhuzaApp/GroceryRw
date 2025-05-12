import React, { useState, useEffect } from "react";
import { formatCurrency } from "../../lib/formatCurrency";
import ProdCategories from "@components/ui/categories";
import Image from "next/image";
import { Input, InputGroup, Button, Badge, Nav } from "rsuite";
import { useCart } from "../../context/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

interface ProductCardProps {
  id: string;
  name: string;
  image: string;
  price: string;
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

  return (
    <>
      {/* Categories Navigation */}
      <div className="sticky top-[73px] z-10 border-b bg-white shadow-sm">
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
                className="px-4 capitalize"
              >
                {category}
              </Nav.Item>
            ))}
          </Nav>
        </div>
      </div>

      {/* Products Grid */}
      <div className="p-4">
        <h2 className="mb-4 text-xl font-bold">
          {activeCategory && activeCategory !== "all"
            ? String(activeCategory).charAt(0).toUpperCase() +
              String(activeCategory).slice(1)
            : "All Products"}
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {loadingProducts
            ? Array(12)
                .fill(0)
                .map((_, idx) => (
                  <div
                    key={idx}
                    className="animate-pulse overflow-hidden rounded-lg bg-white shadow-sm"
                  >
                    <div className="h-40 bg-gray-200" />
                    <div className="space-y-2 p-3">
                      <div className="h-4 w-3/4 rounded bg-gray-200" />
                      <div className="h-3 w-1/2 rounded bg-gray-200" />
                      <div className="h-6 w-1/2 rounded bg-gray-200" />
                    </div>
                  </div>
                ))
            : filteredProducts.map((product: any) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  shopId={shop.id}
                  name={product.name}
                  image={product.image}
                  price={product.price}
                  unit={product.unit}
                  sale={product.sale}
                  originalPrice={product.originalPrice}
                  measurement_unit={product.measurement_unit}
                  quantity={product.quantity}
                />
              ))}
        </div>
      </div>
    </>
  );
}

function ProductCard({
  id,
  shopId,
  name,
  image,
  price,
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
        })
      );
      router.push(
        `/auth/login?redirect=${encodeURIComponent(
          router.asPath
        )}`
      );
      return;
    }
    
    setIsAdding(true);
    const toastId = toast.loading("Adding to cart...");
    
    try {
      await addItem(shopId, id, 1);
      
      // Update toast with success message
      toast.success(
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-medium">1 × {name}</p>
            <p className="text-xs text-gray-500">Added to cart</p>
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
      <div className="overflow-hidden rounded-lg bg-white shadow-sm">
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
          <h3 className="mb-1 font-medium text-gray-900">{name}</h3>
          <p className="mb-2 text-sm text-gray-500">{unit}</p>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-gray-900">
                {formatCurrency(parseFloat(price))}
                {measurement_unit ? ` / ${measurement_unit}` : ""}
              </span>
              {sale && originalPrice && (
                <span className="ml-2 text-sm text-gray-500 line-through">
                  {formatCurrency(parseFloat(originalPrice || "0"))}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                appearance="primary"
                size="sm"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 p-0 text-white hover:bg-green-600"
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
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 p-0 text-gray-700 hover:bg-gray-300"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div 
            className="w-80 rounded-lg bg-white p-6 shadow-lg"
            onKeyDown={(e) => {
              // Enter key submits the form
              if (e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('add-to-cart-btn')?.click();
              }
              // Escape key closes the modal
              if (e.key === 'Escape') {
                setShowModal(false);
              }
              // Up arrow increases quantity
              if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedQuantity(selectedQuantity + 1);
              }
              // Down arrow decreases quantity
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedQuantity(Math.max(1, selectedQuantity - 1));
              }
            }}
          >
            <h3 className="mb-4 text-lg font-bold">Add {name} to Cart</h3>
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">Quantity:</span>
                <div className="flex items-center">
                  <button
                    onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-l border border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200"
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
                    className="h-8 w-16 border-y border-gray-300 p-0 text-center focus:outline-none"
                    onFocus={(e) => e.target.select()}
                    autoFocus
                  />
                  <button
                    onClick={() => setSelectedQuantity(selectedQuantity + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-r border border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>
              </div>
              
              {/* Quick quantity buttons */}
              <div className="mt-2 flex flex-wrap gap-2">
                {[1, 2, 3, 5, 10].map((qty) => (
                  <button
                    key={qty}
                    onClick={() => setSelectedQuantity(qty)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${
                      selectedQuantity === qty
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-300 bg-white text-gray-700"
                    }`}
                  >
                    {qty}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="rounded border px-4 py-2 text-gray-700"
              >
                Cancel
              </button>
              <button
                id="add-to-cart-btn"
                onClick={async () => {
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
                  
                  // Show loading state
                  const toastId = toast.loading("Adding to cart...");
                  
                  try {
                    await addItem(shopId, id, selectedQuantity);
                    
                    // Update toast with success message
                    toast.success(
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                          <svg viewBox="0 0 24 24" className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium">{selectedQuantity} × {name}</p>
                          <p className="text-xs text-gray-500">Added to cart</p>
                        </div>
                      </div>,
                      {
                        id: toastId,
                        duration: 2000,
                      }
                    );
                    
                    setShowModal(false);
                  } catch (err: any) {
                    console.error("Add to cart failed:", err);
                    toast.error(err.message || "Failed to add to cart", {
                      id: toastId,
                    });
                  }
                }}
                className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
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
