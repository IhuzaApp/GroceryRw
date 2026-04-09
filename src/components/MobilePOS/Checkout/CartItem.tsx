import React from "react";
import { Plus, Minus, Trash2 } from "lucide-react";

interface CartItemData {
  id: string;
  name: string;
  price: string | number;
  cartQuantity: number;
  image?: string | null;
  measurement_unit?: string;
}

interface CartItemProps {
  item: CartItemData;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
}

export const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemove }) => {
  const imageUrl = item.image || "/images/groceryPlaceholder.png";

  return (
    <div className="flex items-center gap-4 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-800/50">
      <div className="h-20 w-20 overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-800">
        <img
          src={imageUrl}
          alt={item.name}
          className="h-full w-full object-cover"
          onError={(e: any) => {
            e.target.src = "/images/groceryPlaceholder.png";
          }}
        />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-gray-900 dark:text-white capitalize">{item.name}</h3>
        <p className="text-sm font-black text-green-600">
          {parseFloat(String(item.price)).toLocaleString()} RWF
        </p>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex items-center rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
            <button
              onClick={() => onUpdateQuantity(item.id, -1)}
              className="rounded-lg p-1 transition hover:bg-white dark:hover:bg-gray-700"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center text-sm font-bold">
              {item.cartQuantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.id, 1)}
              className="rounded-lg p-1 transition hover:bg-white dark:hover:bg-gray-700"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => onRemove(item.id)}
            className="rounded-xl bg-red-50 p-2 text-red-500 transition hover:bg-red-100 dark:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
