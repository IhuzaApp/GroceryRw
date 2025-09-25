import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import RootLayout from "@components/ui/layout";
import Image from "next/image";
import Link from "next/link";
import { AuthGuard } from "../../src/components/AuthGuard";
import { useFoodCart } from "../../src/context/FoodCartContext";
import { useTheme } from "../../src/context/ThemeContext";
import { formatCurrency } from "../../src/lib/formatCurrency";
import { RestaurantSearchBar } from "../../src/components/restaurants/RestaurantSearchBar";
import { RestaurantMenuItems } from "../../src/components/restaurants/RestaurantMenuItems";
import { RestaurantBanner } from "../../src/components/restaurants/RestaurantBanner";

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
  preparingTime?: string; // Preparation time as string from database (e.g., "15min", "1hr", "")
}

interface RestaurantPageProps {
  restaurant: Restaurant;
  dishes?: Dish[];
}

function RestaurantPage({ restaurant, dishes = [] }: RestaurantPageProps) {
  const router = useRouter();
  const { id } = router.query;
  const { addItem, getRestaurantCart } = useFoodCart();

  const { theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [cartItems, setCartItems] = useState<{ [key: string]: number }>({});
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Debug: Log dishes data
  // console.log('Restaurant dishes:', dishes);

  // Scroll detection for sticky header (mobile only)
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const isMobile = window.innerWidth < 768; // md breakpoint
      setIsScrolled(scrollTop > 100 && isMobile);
    };

    // Check on mount and resize
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      if (!isMobile) {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    // Initial check
    handleResize();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Search handler
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleAddToCart = async (dish: Dish) => {
    setIsLoading(true);
    try {
      addItem(restaurant, dish, 1);
      setCartItems((prev) => ({
        ...prev,
        [dish.id]: (prev[dish.id] || 0) + 1,
      }));
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCartTotal = () => {
    const restaurantCart = getRestaurantCart(restaurant.id);
    if (restaurantCart) {
      return restaurantCart.totalPrice;
    }

    // Fallback to local cart items calculation
    return (dishes || []).reduce((total, dish) => {
      const quantity = cartItems[dish.id] || 0;
      let price = parseFloat(dish.price);

      // Use happy hour pricing if applicable
      if (getPromoType(dish) === "happyhour") {
        price = getHappyHourPricing(dish).discountedPrice;
      }

      return total + price * quantity;
    }, 0);
  };

  const getCartItemCount = () => {
    const restaurantCart = getRestaurantCart(restaurant.id);
    if (restaurantCart) {
      return restaurantCart.totalItems;
    }

    // Fallback to local cart items calculation
    return Object.values(cartItems).reduce((sum, count) => sum + count, 0);
  };

  // Helper function to render ingredients safely
  const renderIngredients = (ingredients: string | any) => {
    if (!ingredients) return null;

    if (typeof ingredients === "string") {
      return ingredients;
    }

    if (typeof ingredients === "object") {
      // If it's an array of ingredients
      if (Array.isArray(ingredients)) {
        return ingredients
          .map((ingredient) => {
            // Handle each ingredient item
            if (typeof ingredient === "string") {
              return ingredient;
            } else if (typeof ingredient === "object" && ingredient !== null) {
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
                const values = Object.values(ingredient).filter(
                  (val) => typeof val === "string" && val.trim() !== ""
                );
                return values.length > 0 ? values[0] : "Unknown ingredient";
              }
            }
            return String(ingredient);
          })
          .join(", ");
      }

      // If it's a single object with a name property
      if (ingredients.name) {
        return ingredients.name;
      }

      // If it's a single object, try to extract meaningful data
      if (typeof ingredients === "object" && ingredients !== null) {
        if (ingredients.ingredient) {
          return ingredients.ingredient;
        } else if (ingredients.title) {
          return ingredients.title;
        } else if (ingredients.value) {
          return ingredients.value;
        } else {
          // Try to get all string values from the object
          const values = Object.values(ingredients).filter(
            (val) => typeof val === "string" && val.trim() !== ""
          );
          return values.length > 0 ? values.join(", ") : "Unknown ingredient";
        }
      }
    }

    return String(ingredients);
  };

  // Helper function to detect promo type
  const getPromoType = (dish: Dish) => {
    if (!dish.promo) return null;

    // Check for buy-one-get-one (BOGO) promo
    if (dish.promo_type === "bogo" || dish.promo_type === "plus one") {
      return "bogo";
    }

    // Check for happy hour promo
    if (dish.promo_type === "happyhour") {
      return "happyhour";
    }

    // Check for discount promo
    if (dish.discount && dish.discount !== "0" && dish.discount !== "0%") {
      return "discount";
    }

    // Default promo (could be other types)
    return "promo";
  };

  // Get unique categories and promo types from dishes
  const categories = useMemo(() => {
    const dishCategories = Array.from(
      new Set((dishes || []).map((dish) => dish.category || "Other"))
    );
    const promoTypes = Array.from(
      new Set((dishes || []).map((dish) => getPromoType(dish)).filter(Boolean))
    );

    return [
      "All",
      ...promoTypes.map((promo) => `Promo: ${promo}`),
      ...dishCategories,
    ];
  }, [dishes]);

  // Filter dishes by selected category and search query
  const filteredDishes = useMemo(() => {
    return (dishes || []).filter((dish) => {
      const matchesCategory =
        selectedCategory === "All" ||
        (dish.category || "Other") === selectedCategory ||
        (selectedCategory.startsWith("Promo: ") &&
          getPromoType(dish) === selectedCategory.replace("Promo: ", ""));

      const matchesSearch =
        !searchQuery ||
        dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (dish.ingredients &&
          typeof dish.ingredients === "string" &&
          dish.ingredients.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [dishes, selectedCategory, searchQuery]);

  // Helper function to calculate happy hour pricing
  const getHappyHourPricing = (dish: Dish) => {
    if (dish.promo_type !== "happyhour" || !dish.discount) {
      return {
        originalPrice: parseFloat(dish.price),
        discountedPrice: parseFloat(dish.price),
        discountType: "none",
        discountValue: 0,
        savings: 0,
      };
    }

    const originalPrice = parseFloat(dish.price);
    const discount = dish.discount.trim();

    // If discount contains %, it's a percentage discount
    if (discount.includes("%")) {
      const discountPercent = parseFloat(discount.replace("%", ""));
      const discountedPrice = originalPrice * (1 - discountPercent / 100);
      const savings = originalPrice - discountedPrice;
      return {
        originalPrice,
        discountedPrice,
        discountType: "percentage",
        discountValue: discountPercent,
        savings,
      };
    } else {
      // No % means fixed amount deduction
      const discountAmount = parseFloat(discount);
      const discountedPrice = Math.max(0, originalPrice - discountAmount);
      const savings = originalPrice - discountedPrice;
      return {
        originalPrice,
        discountedPrice,
        discountType: "fixed",
        discountValue: discountAmount,
        savings,
      };
    }
  };

  // Helper function to render promo sticker
  const renderPromoSticker = (dish: Dish) => {
    const promoType = getPromoType(dish);

    if (!promoType) return null;

    switch (promoType) {
      case "bogo":
        return (
          <div className="absolute -right-1 -top-1 z-10 animate-pulse rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-2 py-1 text-xs font-bold !text-white shadow-lg ring-2 ring-orange-200">
            BOGO
          </div>
        );
      case "happyhour":
        const pricing = getHappyHourPricing(dish);
        const discountText =
          pricing.discountType === "percentage"
            ? `${pricing.discountValue}% OFF`
            : `$${pricing.discountValue} OFF`;
        return (
          <div className="absolute -right-1 -top-1 z-10 animate-pulse rounded-full bg-gradient-to-r from-purple-500 to-purple-600 px-2 py-1 text-xs font-bold !text-white shadow-lg ring-2 ring-purple-200">
            <div className="text-center">
              <div className="text-xs !text-white">HAPPY HOUR</div>
              <div className="-mt-0.5 text-xs !text-white">{discountText}</div>
            </div>
          </div>
        );
      case "discount":
        return (
          <div className="absolute -right-1 -top-1 z-10 rounded-full bg-gradient-to-r from-red-500 to-red-600 px-2 py-1 text-xs font-bold !text-white shadow-lg ring-2 ring-red-200">
            {dish.discount}% OFF
          </div>
        );
      case "promo":
        return (
          <div className="absolute -right-1 -top-1 z-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-2 py-1 text-xs font-bold !text-white shadow-lg ring-2 ring-blue-200">
            PROMO
          </div>
        );
      default:
        return null;
    }
  };

  // Helper function to get promo button styling
  const getPromoButtonStyle = (
    promoType: string | null,
    isSelected: boolean
  ) => {
    if (!promoType) return "";

    const baseClasses =
      "rounded-full px-4 py-2 text-sm font-medium transition-colors";

    switch (promoType) {
      case "bogo":
        return isSelected
          ? "bg-gradient-to-r from-orange-500 to-orange-600 !text-white shadow-lg"
          : "bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/30";
      case "happyhour":
        return isSelected
          ? "bg-gradient-to-r from-purple-500 to-purple-600 !text-white shadow-lg"
          : "bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/30";
      case "discount":
        return isSelected
          ? "bg-gradient-to-r from-red-500 to-red-600 !text-white shadow-lg"
          : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30";
      case "promo":
        return isSelected
          ? "bg-gradient-to-r from-blue-500 to-blue-600 !text-white shadow-lg"
          : "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30";
      default:
        return isSelected
          ? "bg-green-600 !text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600";
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
          <div
            className={`fixed left-0 right-0 top-0 z-50 border-b shadow-lg backdrop-blur-md transition-all duration-300 md:ml-20 ${
              theme === "dark"
                ? "border-gray-700 bg-gray-800/95"
                : "border-gray-200 bg-white/95"
            }`}
          >
            <div className="flex items-center justify-between px-4 py-3">
              {/* Back Button */}
              <Link
                href="/shops"
                className={`flex items-center gap-2 transition-colors ${
                  theme === "dark"
                    ? "text-gray-200 hover:text-white"
                    : "text-gray-800 hover:text-gray-600"
                }`}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span className="font-medium">Back</span>
              </Link>

              {/* Search Bar */}
              <div className="mx-4 max-w-md flex-1">
                <RestaurantSearchBar
                  placeholder="Search dishes..."
                  onSearch={handleSearch}
                  isSticky={true}
                />
              </div>

              {/* Restaurant Name */}
              <div
                className={`max-w-32 truncate font-semibold ${
                  theme === "dark" ? "text-gray-200" : "text-gray-800"
                }`}
              >
                {restaurant.name}
              </div>
            </div>
          </div>
        )}

        {/* Restaurant Header */}
        <RestaurantBanner restaurant={restaurant} onSearch={handleSearch} />

        {/* Main Content */}
        <div
          className={`relative z-0 -mt-2 rounded-t-3xl bg-white transition-all duration-300 dark:bg-gray-800 ${
            isScrolled ? "pt-16" : ""
          }`}
        >
          {/* Category Tabs */}
          <div className="sticky top-0 z-10 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="flex space-x-1 overflow-x-auto px-4 py-3">
              {categories.map((category) => {
                const isPromo = category.startsWith("Promo: ");
                const promoType = isPromo
                  ? category.replace("Promo: ", "")
                  : null;

                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`flex items-center gap-1 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? isPromo
                          ? getPromoButtonStyle(promoType, true)
                          : "bg-green-600 !text-white"
                        : isPromo
                        ? getPromoButtonStyle(promoType, false)
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    }`}
                  >
                    {isPromo && (
                      <span className="text-xs">
                        {promoType === "bogo" ? (
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                            />
                          </svg>
                        ) : promoType === "happyhour" ? (
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        ) : promoType === "discount" ? (
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                            />
                          </svg>
                        )}
                      </span>
                    )}
                    {category}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Menu Items */}
          <RestaurantMenuItems
            dishes={dishes}
            filteredDishes={filteredDishes}
            cartItems={cartItems}
            isLoading={isLoading}
            restaurantName={restaurant.name}
            onAddToCart={handleAddToCart}
            renderIngredients={renderIngredients}
            renderPromoSticker={renderPromoSticker}
            getPromoType={getPromoType}
            getHappyHourPricing={getHappyHourPricing}
          />
        </div>
      </div>
    </RootLayout>
  );
}

// Helper function to validate UUID format
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  try {
    const { id } = params as { id: string };

    // Validate that the ID is a proper UUID
    if (!id || !isValidUUID(id)) {
      console.error(
        `Invalid restaurant ID provided: ${id}. Expected valid UUID format.`
      );
      return {
        props: {
          restaurant: null,
          dishes: [],
        },
      };
    }

    // Fetch restaurant data
    const restaurantResponse = await fetch(
      `${
        process.env.NEXTAUTH_URL || "http://localhost:3000"
      }/api/queries/restaurants`
    );
    const restaurantData = await restaurantResponse.json();
    const restaurant =
      restaurantData.restaurants?.find((r: Restaurant) => r.id === id) || null;

    // Fetch dishes data for the restaurant
    let dishes: Dish[] = [];
    try {
      const dishesResponse = await fetch(
        `${
          process.env.NEXTAUTH_URL || "http://localhost:3000"
        }/api/queries/restaurant-dishes?restaurant_id=${id}`
      );
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
