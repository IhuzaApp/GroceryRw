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

  // On authentication, load existing cart item counts
  React.useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/carts')
        .then((res) => res.json())
        .then((data: { carts: Array<{ count?: number }> }) => {
          // Sum distinct item counts from all carts
          const totalCount = data.carts.reduce(
            (sum, c) => sum + (c.count ?? 0),
            0
          );
          setCount(totalCount);
        })
        .catch((err) => console.error('Failed to fetch cart counts:', err));
    }
  }, [status]);

  // Refresh count when cart items change elsewhere
  React.useEffect(() => {
    if (status !== 'authenticated') return;
    const handleCartChanged = () => {
      fetch('/api/carts')
        .then((res) => res.json())
        .then((data: { carts: Array<{ count?: number }> }) => {
          const totalCount = data.carts.reduce(
            (sum, c) => sum + (c.count ?? 0),
            0
          );
          setCount(totalCount);
        })
        .catch((err) => console.error('Failed to refresh cart counts:', err));
    };
    window.addEventListener('cartChanged', handleCartChanged);
    return () => window.removeEventListener('cartChanged', handleCartChanged);
  }, [status]);

  return <CartContext.Provider value={{ count, addItem }}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext); 