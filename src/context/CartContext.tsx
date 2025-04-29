import React, { createContext, useState, useContext } from 'react';
import { useSession } from 'next-auth/react';

interface CartContextType {
  count: number;
  addItem: (shopId: string, productId: string, quantity: number) => Promise<void>;
}

const CartContext = createContext<CartContextType>({ count: 0, addItem: async () => {} });

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [count, setCount] = useState(0);
  const { data: session, status } = useSession();

  const addItem = async (shopId: string, productId: string, quantity: number) => {
    if (status !== 'authenticated') {
      throw new Error('User not authenticated');
    }
    // session.user.id is attached in NextAuth callbacks
    const user_id = (session.user as any).id as string;
    const res = await fetch('/api/cart-items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, shop_id: shopId, product_id: productId, quantity }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Add to cart failed');
    }
    setCount(data.count ?? 0);
  };

  // Optionally refresh on session change
  React.useEffect(() => {
    setCount(0);
  }, [status]);

  return <CartContext.Provider value={{ count, addItem }}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext); 