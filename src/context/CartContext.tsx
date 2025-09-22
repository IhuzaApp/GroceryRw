import React, { createContext, useState, useContext, useEffect } from "react";
import { useSession } from "next-auth/react";

interface CartContextType {
  count: number;
  addItem: (
    shopId: string,
    productId: string,
    quantity: number
  ) => Promise<void>;
}

const CartContext = createContext<CartContextType>({
  count: 0,
  addItem: async () => {},
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [shopCartCount, setShopCartCount] = useState(0);
  const [foodCartCount, setFoodCartCount] = useState(0);
  const { data: session, status } = useSession();
  
  // Combined count from both shop and food carts
  const count = shopCartCount + foodCartCount;
  
  // Debug logging
  useEffect(() => {
    console.log('Cart counts - Shop:', shopCartCount, 'Food:', foodCartCount, 'Total:', count);
  }, [shopCartCount, foodCartCount, count]);

  const addItem = async (
    shopId: string,
    productId: string,
    quantity: number
  ) => {
    if (status !== "authenticated") {
      throw new Error("User not authenticated");
    }
    // session.user.id is attached in NextAuth callbacks
    const user_id = (session.user as any).id as string;
    const res = await fetch("/api/cart-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id,
        shop_id: shopId,
        product_id: productId,
        quantity,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Add to cart failed");
    }
    setShopCartCount(data.count ?? 0);
    // Notify other components that cart has changed
    window.dispatchEvent(new Event("cartChanged"));
  };

  // On authentication, load existing cart item counts
  React.useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/carts")
        .then((res) => res.json())
        .then((data: { carts: Array<{ count?: number }> }) => {
          // Sum distinct item counts from all carts
          const totalCount = data.carts.reduce(
            (sum, c) => sum + (c.count ?? 0),
            0
          );
          setShopCartCount(totalCount);
        })
        .catch((err) => console.error("Failed to fetch cart counts:", err));
    }
  }, [status]);

  // Refresh count when cart items change elsewhere
  React.useEffect(() => {
    if (status !== "authenticated") return;
    const handleCartChanged = () => {
      fetch("/api/carts")
        .then((res) => res.json())
        .then((data: { carts: Array<{ count?: number }> }) => {
          const totalCount = data.carts.reduce(
            (sum, c) => sum + (c.count ?? 0),
            0
          );
          setShopCartCount(totalCount);
        })
        .catch((err) => console.error("Failed to refresh cart counts:", err));
    };
    window.addEventListener("cartChanged", handleCartChanged);
    return () => window.removeEventListener("cartChanged", handleCartChanged);
  }, [status]);

  // Listen for food cart changes
  useEffect(() => {
    const handleFoodCartChanged = () => {
      // Get food cart count from localStorage
      try {
        const foodCartData = JSON.parse(localStorage.getItem('foodCarts') || '{}');
        const foodCarts = foodCartData.restaurants || [];
        const totalFoodItems = foodCarts.reduce((sum: number, restaurant: any) => {
          return sum + (restaurant.totalItems || 0);
        }, 0);
        setFoodCartCount(totalFoodItems);
        console.log('Food cart count updated:', totalFoodItems, 'from restaurants:', foodCarts.length);
      } catch (error) {
        console.error('Error reading food cart from localStorage:', error);
        setFoodCartCount(0);
      }
    };

    // Initial load
    handleFoodCartChanged();

    // Listen for food cart changes
    window.addEventListener('foodCartChanged', handleFoodCartChanged);
    window.addEventListener('storage', handleFoodCartChanged);

    return () => {
      window.removeEventListener('foodCartChanged', handleFoodCartChanged);
      window.removeEventListener('storage', handleFoodCartChanged);
    };
  }, []);

  return (
    <CartContext.Provider value={{ count, addItem }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
