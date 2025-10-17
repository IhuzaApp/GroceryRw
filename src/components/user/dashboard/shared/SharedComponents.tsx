import { useState } from "react";
import { Data } from "../../../../types";

// Helper Components
export const CategoryIcon = ({ category }: { category: string }) => {
  const icons: { [key: string]: string } = {
    "Super Market": "🛒",
    "Public Markets": "🏪",
    Bakeries: "🥖",
    Butchers: "🥩",
    Delicatessen: "🥪",
    "Organic Shops": "🌿",
    "Specialty Foods": "🍱",
    Restaurant: "🍽️",
  };

  return (
    <div className="text-3xl transition-transform duration-300 group-hover:scale-110">
      {icons[category] || "🏪"}
    </div>
  );
};

export const MobileCategoryDropdown = ({
  categories,
  selectedCategory,
  onSelect,
  onClear,
}: {
  categories: any[];
  selectedCategory: string | null;
  onSelect: (id: string) => void;
  onClear: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
      >
        <span>
          {selectedCategory
            ? categories.find((c) => c.id === selectedCategory)?.name
            : "Select Category"}
        </span>
        <svg
          className={`h-5 w-5 transform transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          {selectedCategory && (
            <button
              onClick={() => {
                onClear();
                setIsOpen(false);
              }}
              className="w-full border-b border-gray-200 px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 dark:border-gray-700 dark:text-red-400 dark:hover:bg-gray-700"
            >
              Clear Selection
            </button>
          )}
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                onSelect(category.id);
                setIsOpen(false);
              }}
              className={`flex w-full items-center space-x-3 px-4 py-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${
                selectedCategory === category.id
                  ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  : "text-gray-700 dark:text-gray-200"
              }`}
            >
              <CategoryIcon category={category.name} />
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Helper Functions
export function getShopImageUrl(imageUrl: string | undefined): string {
  if (!imageUrl) return "/images/shop-placeholder.jpg";

  // Handle relative paths (like "profile.png")
  if (imageUrl && !imageUrl.startsWith("/") && !imageUrl.startsWith("http")) {
    return "/images/shop-placeholder.jpg";
  }

  // If it's a relative path starting with /, it's likely a valid local image
  if (imageUrl.startsWith("/")) {
    // Check if the image exists in the expected location
    // Handle common cases where images might be in different directories
    const commonImageMappings: { [key: string]: string } = {
      "publicMarket.jpg": "/assets/images/publicMarket.jpg",
      "backeryImage.jpg": "/assets/images/backeryImage.jpg",
      "Bakery.webp": "/assets/images/Bakery.webp",
      "Butcher.webp": "/assets/images/Butcher.webp",
      "delicatessen.jpeg": "/assets/images/delicatessen.jpeg",
      "OrganicShop.jpg": "/assets/images/OrganicShop.jpg",
      "shopping.jpg": "/assets/images/shopping.jpg",
      "shopsImage.jpg": "/assets/images/shopsImage.jpg",
      "superMarkets.jpg": "/assets/images/superMarkets.jpg",
    };

    // Check if this is a known image that might be in the assets directory
    for (const [filename, correctPath] of Object.entries(commonImageMappings)) {
      if (imageUrl.includes(filename)) {
        return correctPath;
      }
    }

    return imageUrl;
  }

  // For external URLs, check if they're valid
  if (imageUrl.startsWith("http")) {
    // Allow all external URLs except example.com
    if (imageUrl.includes("example.com")) {
      return "/images/shop-placeholder.jpg";
    }
    return imageUrl;
  }

  // Fallback to placeholder
  return "/images/shop-placeholder.jpg";
}

export function ShopSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border shadow-sm dark:border-gray-700">
      <div className="h-48 w-full bg-gray-100 dark:bg-gray-800"></div>
      <div className="p-4">
        <div className="mb-2 h-6 w-3/4 rounded bg-gray-100 dark:bg-gray-700"></div>
        <div className="h-4 w-full rounded bg-gray-100 dark:bg-gray-700"></div>
        <div className="mt-2 h-4 w-2/3 rounded bg-gray-100 dark:bg-gray-700"></div>
      </div>
    </div>
  );
}

// Helper function to get all categories including restaurants
export function getAllCategories(data: Data) {
  return [
    ...(data?.categories || []),
    // Add Restaurant category if restaurants exist
    ...(data?.restaurants && data.restaurants.length > 0
      ? [
          {
            id: "restaurant-category",
            name: "Restaurant",
            description: "Restaurants and dining",
            created_at: new Date().toISOString(),
            image: "",
            is_active: true,
          },
        ]
      : []),
  ];
}
