import React from 'react';
import Image from 'next/image';
import { formatCurrency } from '../../lib/formatCurrency';

interface Dish {
  id: string;
  name: string;
  description: string;
  price: string;
  image?: string;
  ingredients?: string | any;
  discount?: string;
  quantity: number;
  restaurant_id: string;
  is_active: boolean;
  category?: string;
  promo?: boolean;
  promo_type?: string;
}

interface RestaurantMenuItemsProps {
  dishes: Dish[];
  filteredDishes: Dish[];
  cartItems: { [key: string]: number };
  isLoading: boolean;
  restaurantName: string;
  onAddToCart: (dish: Dish) => void;
  renderIngredients: (ingredients: any) => string;
  renderPromoSticker: (dish: Dish) => React.ReactNode;
  getPromoType: (dish: Dish) => string | null;
  getHappyHourPricing: (dish: Dish) => { originalPrice: number; discountedPrice: number; savings: number };
  getCartItemCount: () => number;
}

export const RestaurantMenuItems: React.FC<RestaurantMenuItemsProps> = ({
  dishes,
  filteredDishes,
  cartItems,
  isLoading,
  restaurantName,
  onAddToCart,
  renderIngredients,
  renderPromoSticker,
  getPromoType,
  getHappyHourPricing,
  getCartItemCount
}) => {
  return (
    <div className={`px-4 py-6 ${getCartItemCount() > 0 ? 'pb-24' : ''}`}>
      <div className="space-y-4">
        {!dishes || dishes.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
              <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Menu Coming Soon</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {restaurantName} is working on adding their menu. Check back soon!
            </p>
          </div>
        ) : filteredDishes.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
              <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No items found</h3>
            <p className="text-gray-600 dark:text-gray-400">No dishes available in this category.</p>
          </div>
        ) : (
          filteredDishes.map((dish) => (
            <div key={dish.id} className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-700">
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={dish.image || "/images/groceryPlaceholder.png"}
                  alt={dish.name}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
                {renderPromoSticker(dish)}
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{dish.name}</h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {dish.description}
                  </p>
                  {dish.ingredients && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                      Ingredients: {renderIngredients(dish.ingredients)}
                    </p>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getPromoType(dish) === 'happyhour' ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(getHappyHourPricing(dish).discountedPrice)}
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            {formatCurrency(getHappyHourPricing(dish).originalPrice)}
                          </span>
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                          You save {formatCurrency(getHappyHourPricing(dish).savings)}!
                        </div>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(parseFloat(dish.price))}
                      </span>
                    )}
                    {getPromoType(dish) === 'bogo' && (
                      <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                        Buy 1 Get 1 Free
                      </span>
                    )}
                    {getPromoType(dish) === 'happyhour' && (
                      <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                        Happy Hour
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => onAddToCart(dish)}
                    disabled={isLoading || !dish.is_active}
                    className="rounded-full bg-green-600 p-2 text-white transition-colors hover:bg-green-700 disabled:bg-gray-400"
                  >
                    {cartItems[dish.id] ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold">{cartItems[dish.id]}</span>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RestaurantMenuItems;
