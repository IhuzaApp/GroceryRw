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
            <Button
              appearance="primary"
              size="sm"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 p-0 text-white"
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
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-80 rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-bold">Add {name} to Cart</h3>
            <div className="mb-4 flex items-center">
              <span className="mr-2">Quantity:</span>
              <input
                type="number"
                min={1}
                value={selectedQuantity}
                onChange={(e) =>
                  setSelectedQuantity(
                    Math.max(1, parseInt(e.target.value, 10) || 1)
                  )
                }
                className="w-16 rounded border p-1"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="rounded border px-4 py-2 text-gray-700"
              >
                Cancel
              </button>
              <button
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
                  try {
                    await addItem(shopId, id, selectedQuantity);
                    toast.success("Added to cart");
                    setShowModal(false);
                  } catch (err: any) {
                    console.error("Add to cart failed:", err);
                    toast.error(err.message || "Failed to add to cart");
                  }
                }}
                className="rounded bg-green-500 px-4 py-2 text-white"
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
