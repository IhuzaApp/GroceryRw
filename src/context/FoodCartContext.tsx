import React, { createContext, useState, useContext, useEffect } from "react";

export interface FoodCartItem {
  id: string;
  name: string;
  description: string;
  price: string;
  image?: string;
  quantity: number;
  restaurant_id: string;
  restaurant_name: string;
  category?: string;
  promo?: boolean;
  promo_type?: string;
  discount?: string;
  ingredients?: string | any;
  preparingTime?: string; // Preparation time as string from database (e.g., "15min", "1hr", "")
}

export interface FoodCartRestaurant {
  id: string;
  name: string;
  logo?: string;
  latitude: string;
  longitude: string;
  items: FoodCartItem[];
  totalItems: number;
  totalPrice: number;
}

interface FoodCartContextType {
  restaurants: FoodCartRestaurant[];
  totalItems: number;
  totalPrice: number;
  addItem: (restaurant: any, dish: any, quantity?: number) => void;
  removeItem: (restaurantId: string, dishId: string) => void;
  updateQuantity: (restaurantId: string, dishId: string, quantity: number) => void;
  clearCart: () => void;
  clearRestaurant: (restaurantId: string) => void;
  getRestaurantCart: (restaurantId: string) => FoodCartRestaurant | null;
  checkAndClearExpiredSession: () => void;
}

const FoodCartContext = createContext<FoodCartContextType>({
  restaurants: [],
  totalItems: 0,
  totalPrice: 0,
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  clearRestaurant: () => {},
  getRestaurantCart: () => null,
  checkAndClearExpiredSession: () => {},
});

const FOOD_CART_STORAGE_KEY = "foodCarts";
const FOOD_CART_SESSION_DURATION = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

export const FoodCartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [restaurants, setRestaurants] = useState<FoodCartRestaurant[]>([]);

  // Load cart from localStorage on mount with session expiration check
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem(FOOD_CART_STORAGE_KEY);
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          
          // Check if cart session has expired (2 hours)
          if (parsedCart.timestamp && Date.now() - parsedCart.timestamp > FOOD_CART_SESSION_DURATION) {
            // Session expired, clear the cart
            localStorage.removeItem(FOOD_CART_STORAGE_KEY);
            setRestaurants([]);
            return;
          }
          
          // Session is still valid, load the cart
          setRestaurants(parsedCart.restaurants || []);
        }
      } catch (error) {
        console.error("Error loading food cart from localStorage:", error);
        // Clear corrupted data
        localStorage.removeItem(FOOD_CART_STORAGE_KEY);
        setRestaurants([]);
      }
    };

    loadCart();
  }, []);

  // Save cart to localStorage whenever restaurants change with timestamp
  useEffect(() => {
    try {
      const cartData = {
        restaurants,
        timestamp: Date.now(), // Add current timestamp for session tracking
      };
      localStorage.setItem(FOOD_CART_STORAGE_KEY, JSON.stringify(cartData));
    } catch (error) {
      console.error("Error saving food cart to localStorage:", error);
    }
  }, [restaurants]);

  // Calculate totals
  const totalItems = restaurants.reduce((sum, restaurant) => sum + restaurant.totalItems, 0);
  const totalPrice = restaurants.reduce((sum, restaurant) => sum + restaurant.totalPrice, 0);

  // Helper function to calculate restaurant totals
  const calculateRestaurantTotals = (items: FoodCartItem[]) => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => {
      let price = parseFloat(item.price);
      
      // Apply discount if applicable
      if (item.discount && item.discount !== "0" && item.discount !== "0%") {
        if (item.discount.includes('%')) {
          const discountPercent = parseFloat(item.discount.replace('%', ''));
          price = price * (1 - discountPercent / 100);
        } else {
          const discountAmount = parseFloat(item.discount);
          price = Math.max(0, price - discountAmount);
        }
      }
      
      return sum + (price * item.quantity);
    }, 0);
    
    return { totalItems, totalPrice };
  };

  const addItem = (restaurant: any, dish: any, quantity: number = 1) => {
    setRestaurants(prevRestaurants => {
      const existingRestaurantIndex = prevRestaurants.findIndex(r => r.id === restaurant.id);
      

              const newItem: FoodCartItem = {
                id: dish.id,
                name: dish.name,
                description: dish.description,
                price: dish.price,
                image: dish.image,
                quantity: quantity,
                restaurant_id: restaurant.id,
                restaurant_name: restaurant.name,
                category: dish.category,
                promo: dish.promo,
                promo_type: dish.promo_type,
                discount: dish.discount,
                ingredients: dish.ingredients,
                preparingTime: dish.preparingTime,
              };

      if (existingRestaurantIndex >= 0) {
        // Restaurant exists, check if dish already exists
        const existingDishIndex = prevRestaurants[existingRestaurantIndex].items.findIndex(
          item => item.id === dish.id
        );

        let updatedItems;
        if (existingDishIndex >= 0) {
          // Dish exists, update quantity
          updatedItems = [...prevRestaurants[existingRestaurantIndex].items];
          updatedItems[existingDishIndex] = {
            ...updatedItems[existingDishIndex],
            quantity: updatedItems[existingDishIndex].quantity + quantity,
          };
        } else {
          // New dish, add to items
          updatedItems = [...prevRestaurants[existingRestaurantIndex].items, newItem];
        }

        const { totalItems, totalPrice } = calculateRestaurantTotals(updatedItems);
        
        const updatedRestaurants = [...prevRestaurants];
        updatedRestaurants[existingRestaurantIndex] = {
          ...updatedRestaurants[existingRestaurantIndex],
          items: updatedItems,
          totalItems,
          totalPrice,
        };

        return updatedRestaurants;
      } else {
        // New restaurant
        const { totalItems, totalPrice } = calculateRestaurantTotals([newItem]);
        
        const newRestaurant: FoodCartRestaurant = {
          id: restaurant.id,
          name: restaurant.name,
          logo: restaurant.profile,
          latitude: restaurant.lat,
          longitude: restaurant.long,
          items: [newItem],
          totalItems,
          totalPrice,
        };

        return [...prevRestaurants, newRestaurant];
      }
    });
    
    // Dispatch event to notify other components
    setTimeout(() => {
      window.dispatchEvent(new Event('foodCartChanged'));
    }, 10);
  };

  const removeItem = (restaurantId: string, dishId: string) => {
    setRestaurants(prevRestaurants => {
      const restaurantIndex = prevRestaurants.findIndex(r => r.id === restaurantId);
      if (restaurantIndex === -1) return prevRestaurants;

      const updatedItems = prevRestaurants[restaurantIndex].items.filter(
        item => item.id !== dishId
      );

      if (updatedItems.length === 0) {
        // Remove entire restaurant if no items left
        return prevRestaurants.filter(r => r.id !== restaurantId);
      }

      const { totalItems, totalPrice } = calculateRestaurantTotals(updatedItems);
      
      const updatedRestaurants = [...prevRestaurants];
      updatedRestaurants[restaurantIndex] = {
        ...updatedRestaurants[restaurantIndex],
        items: updatedItems,
        totalItems,
        totalPrice,
      };

      return updatedRestaurants;
    });
    
    // Dispatch event to notify other components
    setTimeout(() => {
      window.dispatchEvent(new Event('foodCartChanged'));
    }, 10);
  };

  const updateQuantity = (restaurantId: string, dishId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(restaurantId, dishId);
      return;
    }

    setRestaurants(prevRestaurants => {
      const restaurantIndex = prevRestaurants.findIndex(r => r.id === restaurantId);
      if (restaurantIndex === -1) return prevRestaurants;

      const updatedItems = prevRestaurants[restaurantIndex].items.map(item =>
        item.id === dishId ? { ...item, quantity } : item
      );

      const { totalItems, totalPrice } = calculateRestaurantTotals(updatedItems);
      
      const updatedRestaurants = [...prevRestaurants];
      updatedRestaurants[restaurantIndex] = {
        ...updatedRestaurants[restaurantIndex],
        items: updatedItems,
        totalItems,
        totalPrice,
      };

      return updatedRestaurants;
    });
    
    // Dispatch event to notify other components
    setTimeout(() => {
      window.dispatchEvent(new Event('foodCartChanged'));
    }, 10);
  };

  const clearCart = () => {
    setRestaurants([]);
    // Clear localStorage completely
    localStorage.removeItem(FOOD_CART_STORAGE_KEY);
    // Dispatch event to notify other components
    setTimeout(() => {
      window.dispatchEvent(new Event('foodCartChanged'));
    }, 10);
  };

  const clearRestaurant = (restaurantId: string) => {
    setRestaurants(prevRestaurants => 
      prevRestaurants.filter(r => r.id !== restaurantId)
    );
    // Dispatch event to notify other components
    setTimeout(() => {
      window.dispatchEvent(new Event('foodCartChanged'));
    }, 10);
  };

  const getRestaurantCart = (restaurantId: string) => {
    return restaurants.find(r => r.id === restaurantId) || null;
  };

  const checkAndClearExpiredSession = () => {
    try {
      const savedCart = localStorage.getItem(FOOD_CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        
        // Check if cart session has expired (2 hours)
        if (parsedCart.timestamp && Date.now() - parsedCart.timestamp > FOOD_CART_SESSION_DURATION) {
          // Session expired, clear the cart
          localStorage.removeItem(FOOD_CART_STORAGE_KEY);
          setRestaurants([]);
          return true; // Session was expired and cleared
        }
      }
      return false; // Session is still valid or no cart exists
    } catch (error) {
      console.error("Error checking session expiration:", error);
      // Clear corrupted data
      localStorage.removeItem(FOOD_CART_STORAGE_KEY);
      setRestaurants([]);
      return true; // Session was cleared due to error
    }
  };

  return (
    <FoodCartContext.Provider
      value={{
        restaurants,
        totalItems,
        totalPrice,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        clearRestaurant,
        getRestaurantCart,
        checkAndClearExpiredSession,
      }}
    >
      {children}
    </FoodCartContext.Provider>
  );
};

export const useFoodCart = () => useContext(FoodCartContext);
