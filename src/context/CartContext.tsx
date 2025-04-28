import React, { createContext, useState, useContext, useEffect } from 'react';

interface CartContextType {
  count: number;
  addItem: (productId: string, quantity: number) => Promise<void>;
}

const CartContext = createContext<CartContextType>({ count: 0, addItem: async () => {} });

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [count, setCount] = useState(0);

  // Refresh cart items count
  const refreshCart = async () => {
    const cartId = localStorage.getItem('cartId');
    if (!cartId) {
      setCount(0);
      return;
    }
    try {
      const res = await fetch(`/api/cart-items?cart_id=${cartId}`);
      const data = await res.json();
      setCount(data.count ?? 0);
    } catch {
      setCount(0);
    }
  };

  const addItem = async (productId: string, quantity: number) => {
    let cartId = localStorage.getItem('cartId');
    if (!cartId) {
      cartId = crypto.randomUUID();
      localStorage.setItem('cartId', cartId);
    }
    await fetch('/api/cart-items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cart_id: cartId, product_id: productId, quantity }),
    });
    await refreshCart();
  };

  useEffect(() => {
    refreshCart();
  }, []);

  return <CartContext.Provider value={{ count, addItem }}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext); 