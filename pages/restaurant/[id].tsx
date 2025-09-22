import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import RootLayout from "@components/ui/layout";
import Image from "next/image";
import Link from "next/link";
import { AuthGuard } from "../../src/components/AuthGuard";
import { useCart } from "../../src/context/CartContext";
import { useTheme } from "../../src/context/ThemeContext";
import { formatCurrency } from "../../src/lib/formatCurrency";

interface Restaurant {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  lat: string;
  long: string;
  profile: string;
  verified: boolean;
  created_at: string;
}

interface Dish {
  id: string;
  name: string;
  description: string;
  price: string;
  image?: string;
  ingredients?: string | any; // Can be string or JSON object
  discount?: string;
  quantity: number;
  restaurant_id: string;
  is_active: boolean;
  category?: string;
  promo?: boolean;
  promo_type?: string;
}

interface RestaurantPageProps {
  restaurant: Restaurant;
  dishes?: Dish[];
}

function RestaurantPage({ restaurant, dishes = [] }: RestaurantPageProps) {
  const router = useRouter();
  const { id } = router.query;
  const { addItem } = useCart();
  const { theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [cartItems, setCartItems] = useState<{ [key: string]: number }>({});
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Debug: Log dishes data
  console.log('Restaurant dishes:', dishes);

  // Scroll detection for sticky header
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Get unique categories from dishes with proper error handling
  const categories = ["All", ...Array.from(new Set((dishes || []).map(dish => dish.category || "Other")))];
  
  // Filter dishes by selected category
  const filteredDishes = selectedCategory === "All" 
    ? (dishes || []) 
    : (dishes || []).filter(dish => (dish.category || "Other") === selectedCategory);

  const handleAddToCart = async (dish: Dish) => {
    setIsLoading(true);
    try {
      await addItem(restaurant.id, dish.id, 1);
      setCartItems(prev => ({
        ...prev,
        [dish.id]: (prev[dish.id] || 0) + 1
      }));
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCartTotal = () => {
    return (dishes || []).reduce((total, dish) => {
      const quantity = cartItems[dish.id] || 0;
      let price = parseFloat(dish.price);
      
      // Use happy hour pricing if applicable
      if (getPromoType(dish) === 'happyhour') {
        price = getHappyHourPricing(dish).discountedPrice;
      }
      
      return total + (price * quantity);
    }, 0);
  };

  const getCartItemCount = () => {
    return Object.values(cartItems).reduce((sum, count) => sum + count, 0);
  };

  // Helper function to render ingredients safely
  const renderIngredients = (ingredients: string | any) => {
    if (!ingredients) return null;
    
    // Debug: Log the ingredients structure to understand the format
    if (typeof ingredients === 'object') {
      console.log('Ingredients structure:', ingredients);
    }
    
    if (typeof ingredients === 'string') {
      return ingredients;
    }
    
    if (typeof ingredients === 'object') {
      // If it's an array of ingredients
      if (Array.isArray(ingredients)) {
        return ingredients.map(ingredient => {
          // Handle each ingredient item
          if (typeof ingredient === 'string') {
            return ingredient;
          } else if (typeof ingredient === 'object' && ingredient !== null) {
            // Try to extract meaningful data from the object
            if (ingredient.name) {
              return ingredient.name;
            } else if (ingredient.ingredient) {
              return ingredient.ingredient;
            } else if (ingredient.title) {
              return ingredient.title;
            } else if (ingredient.value) {
              return ingredient.value;
            } else {
              // If it's an object but we don't know its structure, try to get the first string value
              const values = Object.values(ingredient).filter(val => 
                typeof val === 'string' && val.trim() !== ''
              );
              return values.length > 0 ? values[0] : 'Unknown ingredient';
            }
          }
          return String(ingredient);
        }).join(', ');
      }
      
      // If it's a single object with a name property
      if (ingredients.name) {
        return ingredients.name;
      }
      
      // If it's a single object, try to extract meaningful data
      if (typeof ingredients === 'object' && ingredients !== null) {
        if (ingredients.ingredient) {
          return ingredients.ingredient;
        } else if (ingredients.title) {
          return ingredients.title;
        } else if (ingredients.value) {
          return ingredients.value;
        } else {
          // Try to get all string values from the object
          const values = Object.values(ingredients).filter(val => 
            typeof val === 'string' && val.trim() !== ''
          );
          return values.length > 0 ? values.join(', ') : 'Unknown ingredient';
        }
      }
    }
    
    return String(ingredients);
  };

  // Helper function to detect promo type
  const getPromoType = (dish: Dish) => {
    if (!dish.promo) return null;
    
    // Check for buy-one-get-one (BOGO) promo
    if (dish.promo_type === 'bogo' || dish.promo_type === 'plus one') {
      return 'bogo';
    }
    
    // Check for happy hour promo
    if (dish.promo_type === 'happyhour') {
      return 'happyhour';
    }
    
    // Check for discount promo
    if (dish.discount && dish.discount !== "0" && dish.discount !== "0%") {
      return 'discount';
    }
    
    // Default promo (could be other types)
    return 'promo';
  };

  // Helper function to calculate happy hour pricing
  const getHappyHourPricing = (dish: Dish) => {
    if (dish.promo_type !== 'happyhour' || !dish.discount) {
      return { 
        originalPrice: parseFloat(dish.price), 
        discountedPrice: parseFloat(dish.price),
        discountType: 'none',
        discountValue: 0,
        savings: 0
      };
    }

    const originalPrice = parseFloat(dish.price);
    const discount = dish.discount.trim();

    // If discount contains %, it's a percentage discount
    if (discount.includes('%')) {
      const discountPercent = parseFloat(discount.replace('%', ''));
      const discountedPrice = originalPrice * (1 - discountPercent / 100);
      const savings = originalPrice - discountedPrice;
      return { 
        originalPrice, 
        discountedPrice,
        discountType: 'percentage',
        discountValue: discountPercent,
        savings
      };
    } else {
      // No % means fixed amount deduction
      const discountAmount = parseFloat(discount);
      const discountedPrice = Math.max(0, originalPrice - discountAmount);
      const savings = originalPrice - discountedPrice;
      return { 
        originalPrice, 
        discountedPrice,
        discountType: 'fixed',
        discountValue: discountAmount,
        savings
      };
    }
  };

  // Helper function to render promo sticker
  const renderPromoSticker = (dish: Dish) => {
    const promoType = getPromoType(dish);
    
    if (!promoType) return null;
    
    switch (promoType) {
      case 'bogo':
        return (
          <div className="absolute -top-1 -right-1 z-10 animate-pulse rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-2 py-1 text-xs font-bold text-white shadow-lg ring-2 ring-orange-200">
            BOGO
          </div>
        );
      case 'happyhour':
        const pricing = getHappyHourPricing(dish);
        const discountText = pricing.discountType === 'percentage' 
          ? `${pricing.discountValue}% OFF`
          : `$${pricing.discountValue} OFF`;
        return (
          <div className="absolute -top-1 -right-1 z-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 px-2 py-1 text-xs font-bold text-white shadow-lg ring-2 ring-purple-200 animate-pulse">
            <div className="text-center">
              <div className="text-xs">HAPPY HOUR</div>
              <div className="text-xs -mt-0.5">{discountText}</div>
            </div>
          </div>
        );
      case 'discount':
        return (
          <div className="absolute -top-1 -right-1 z-10 rounded-full bg-gradient-to-r from-red-500 to-red-600 px-2 py-1 text-xs font-bold text-white shadow-lg ring-2 ring-red-200">
            {dish.discount}% OFF
          </div>
        );
      case 'promo':
        return (
          <div className="absolute -top-1 -right-1 z-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-2 py-1 text-xs font-bold text-white shadow-lg ring-2 ring-blue-200">
            PROMO
          </div>
        );
      default:
        return null;
    }
  };

  if (!restaurant) {
    return (
      <RootLayout>
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Restaurant not found
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              The restaurant you're looking for doesn't exist.
            </p>
            <Link
              href="/"
              className="mt-4 inline-block rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700"
            >
              Go Back Home
            </Link>
          </div>
        </div>
      </RootLayout>
    );
  }

  return (
    <RootLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 md:ml-20">
        {/* Sticky Header */}
        {isScrolled && (
          <div className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b shadow-lg md:ml-20 transition-all duration-300 ${
            theme === 'dark' 
              ? 'bg-gray-800/95 border-gray-700' 
              : 'bg-white/95 border-gray-200'
          }`}>
            <div className="flex items-center justify-between px-4 py-3">
              {/* Back Button */}
              <Link href="/shops" className={`flex items-center gap-2 transition-colors ${
                theme === 'dark' 
                  ? 'text-gray-200 hover:text-white' 
                  : 'text-gray-800 hover:text-gray-600'
              }`}>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium">Back</span>
              </Link>

              {/* Search Bar */}
              <div className="flex-1 max-w-md mx-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 z-20">
                    <svg className={`h-4 w-4 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search dishes..."
                    className={`w-full rounded-xl py-2 pl-10 pr-4 text-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
                      theme === 'dark'
                        ? 'border border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400 focus:border-blue-400 focus:bg-gray-600 focus:ring-blue-400/20'
                        : 'border border-gray-300 bg-white text-gray-800 placeholder-gray-500 focus:border-blue-500 focus:bg-white focus:ring-blue-200'
                    }`}
                    style={{ textAlign: 'left' }}
                  />
                </div>
              </div>

              {/* Restaurant Name */}
              <div className={`font-semibold truncate max-w-32 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
              }`}>
                {restaurant.name}
              </div>
            </div>
          </div>
        )}

        {/* Restaurant Header */}
        <div className="relative">
          <div className="h-56 w-full overflow-hidden">
            <Image
              src={restaurant.profile || "/assets/images/restaurantImage.webp"}
              alt={restaurant.name}
              fill
              className="object-cover"
              onError={(e) => {
                console.log('Image failed to load, trying fallback');
                const target = e.target as HTMLImageElement;
                target.src = "/assets/images/restaurantImage.webp";
              }}
              onLoad={() => {
                console.log('Restaurant image loaded successfully');
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </div>
          
          {/* Back Button */}
          <Link
            href="/"
            className="absolute left-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-colors hover:bg-white"
          >
            <svg className="h-5 w-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>

          {/* Search Bar */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-full max-w-md px-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 z-20">
                <svg className="h-5 w-5 text-white drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search dishes..."
                className="w-full rounded-2xl border border-white/30 bg-white/20 py-4 pl-12 pr-4 text-sm text-white placeholder-white/80 transition-all duration-200 focus:border-white/50 focus:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-md shadow-xl"
                style={{ textAlign: 'left' }}
              />
            </div>
          </div>

          {/* Restaurant Info */}
          <div className="absolute bottom-0 left-0 right-0 z-10 p-4 text-white">
            <h1 className="text-2xl font-bold">{restaurant.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
                  {restaurant.verified && (
                <div className="flex items-center gap-1">
                  <svg className="h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Verified</span>
                    </div>
                  )}
              <div className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{restaurant.location}</span>
                  </div>
                </div>
              </div>
            </div>

        {/* Main Content */}
        <div className={`relative -mt-2 rounded-t-3xl bg-white dark:bg-gray-800 mx-4 sm:mx-6 lg:mx-8 z-0 transition-all duration-300 ${isScrolled ? 'pt-16' : ''}`}>
          {/* Category Tabs */}
          <div className="sticky top-0 z-10 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="flex space-x-1 overflow-x-auto px-4 py-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items */}
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
                    {restaurant?.name} is working on adding their menu. Check back soon!
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
                          onClick={() => handleAddToCart(dish)}
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

          {/* Cart Bottom Sheet */}
          {getCartItemCount() > 0 && (
            <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="mx-auto flex max-w-md items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <svg className="h-8 w-8 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
                      {getCartItemCount()}
                  </span>
                </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {getCartItemCount()} item{getCartItemCount() !== 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatCurrency(getCartTotal())}
                    </p>
                  </div>
                </div>
                <Link
                  href="/Cart"
                  className="rounded-full bg-green-600 px-6 py-3 font-medium text-white transition-colors hover:bg-green-700"
                >
                  View Cart
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </RootLayout>
  );
}

// Helper function to validate UUID format
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  try {
    const { id } = params as { id: string };

    // Validate that the ID is a proper UUID
    if (!id || !isValidUUID(id)) {
      console.error(`Invalid restaurant ID provided: ${id}. Expected valid UUID format.`);
      return {
        props: {
          restaurant: null,
          dishes: [],
        },
      };
    }

    // Fetch restaurant data
    const restaurantResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/queries/restaurants`);
    const restaurantData = await restaurantResponse.json();
    const restaurant = restaurantData.restaurants?.find((r: Restaurant) => r.id === id) || null;

    // Fetch dishes data for the restaurant
    let dishes: Dish[] = [];
    try {
      const dishesResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/queries/restaurant-dishes?restaurant_id=${id}`);
      const dishesData = await dishesResponse.json();
      dishes = dishesData.dishes || [];
    } catch (dishesError) {
      console.error("Error fetching dishes:", dishesError);
      dishes = [];
    }

    return {
      props: {
        restaurant,
        dishes,
      },
    };
  } catch (error) {
    console.error("Error fetching restaurant data:", error);
    return {
      props: {
        restaurant: null,
        dishes: [],
      },
    };
  }
};

export default RestaurantPage;
