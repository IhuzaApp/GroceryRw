import React, { useState } from "react";
import ProdCategories from "@components/ui/categories";
import Image from "next/image";
import { Input, InputGroup, Button, Badge, Nav } from "rsuite";

interface ProductCardProps {
  name: string;
  image: string;
  price: string;
  unit: string;
  sale?: boolean;
  originalPrice?: string;
}

export default function ItemsSection({
  activeCategory,
  shop,
  filteredProducts,
  setActiveCategory,
}: any) {
  const [categorySelected, setCategorySelected] = useState("Popular");
  const [selectedShop, setSelectedShop] = useState<any>(null); // Store selected shop

  const shopCategories = ["Super Market", "Bakery"];
  const showShops = shopCategories.includes(categorySelected);

  return (
    <>
      {/* Categories Navigation */}
      <div className="sticky top-[73px] z-10 border-b bg-white shadow-sm">
        <div className="overflow-x-auto px-4">
          <Nav
            appearance="subtle"
            activeKey={activeCategory}
            onSelect={setActiveCategory}
          >
            {shop.categories.map((category: any) => (
              <Nav.Item key={category.id} className="px-4">
                {category.name}
              </Nav.Item>
            ))}
          </Nav>
        </div>
      </div>

      {/* Products Grid */}
      <div className="p-4">
        <h2 className="mb-4 text-xl font-bold">
          {activeCategory !== "all"
            ? "All Products"
            : shop.categories.find((c: any) => c.id === activeCategory)?.name}
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((product: any) => (
            <ProductCard
              key={product.id}
              name={product.name}
              image={product.image}
              price={product.price}
              unit={product.unit}
              sale={product.sale}
              originalPrice={product.originalPrice}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function ProductCard({
  name,
  image,
  price,
  unit,
  sale,
  originalPrice,
}: ProductCardProps) {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
      <div className="relative">
        <Image
          src={image || "/placeholder.svg"}
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
      </div>
      <div className="p-3">
        <h3 className="mb-1 font-medium text-gray-900">{name}</h3>
        <p className="mb-2 text-sm text-gray-500">{unit}</p>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold text-gray-900">{price}</span>
            {sale && originalPrice && (
              <span className="ml-2 text-sm text-gray-500 line-through">
                {originalPrice}
              </span>
            )}
          </div>
          <Button
            appearance="primary"
            size="sm"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 p-0 text-white"
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
  );
}
