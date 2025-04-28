import React, { useState } from "react";
import ProdCategories from "@components/ui/categories";
import Image from "next/image";
import { Input, InputGroup, Button, Badge, Nav, Modal, InputNumber } from "rsuite";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/router";

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
              <Nav.Item key={category} eventKey={category} className="px-4 capitalize">
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
            ? String(activeCategory).charAt(0).toUpperCase() + String(activeCategory).slice(1)
            : "All Products"}
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((product: any) => (
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
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="relative">
          <Image
            src={image || "https://www.thedailymeal.com/img/gallery/you-should-think-twice-about-bagging-your-own-groceries-at-the-store/intro-1681220544.jpg"}
            alt={name}
            width={150}
            height={150}
            className="w-full object-cover"
          />
          {sale && (
            <Badge
              content="SALE"
              className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold"
            />
          )}
          {quantity !== undefined && (
            <Badge
              content={quantity}
              className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold"
            />
          )}
        </div>
        <div className="p-3">
          <h3 className="font-medium text-gray-900 mb-1">{name}</h3>
          <p className="text-sm text-gray-500 mb-2">{unit}</p>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-gray-900">
                ${price}
                {measurement_unit ? ` / ${measurement_unit}` : ""}
              </span>
              {sale && originalPrice && (
                <span className="ml-2 text-sm text-gray-500 line-through">{originalPrice}</span>
              )}
            </div>
            <Button
              appearance="primary"
              size="sm"
              className="bg-green-500 text-white h-8 w-8 p-0 flex items-center justify-center rounded-full"
              onClick={() => { setShowModal(true); setSelectedQuantity(1); }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <Modal.Header>
          <Modal.Title>Add {name} to Cart</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="flex items-center">
            <span className="mr-2">Quantity:</span>
            <InputNumber
              min={1}
              value={selectedQuantity}
              onChange={(val) => {
                const v = typeof val === 'number' ? val : parseInt(val as string, 10) || 1;
                setSelectedQuantity(v);
              }}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => {
              if (!isLoggedIn) {
                // Save pending action and redirect to login
                localStorage.setItem(
                  'pendingCartAction',
                  JSON.stringify({ shopId, productId: id, quantity: selectedQuantity })
                );
                router.push(`/Auth/Login?redirect=${router.asPath}`);
              } else {
                addItem(id, selectedQuantity);
                setShowModal(false);
              }
            }}
            appearance="primary"
          >
            Add to Cart
          </Button>
          <Button onClick={() => setShowModal(false)} appearance="subtle">
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
