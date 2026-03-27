"use client";

export type PostType = "restaurant" | "supermarket" | "chef" | "business";

export interface Comment {
  id: string;
  user_id?: string; // Add this to identify ownership
  user: {
    name: string;
    avatar: string;
    verified?: boolean;
  };
  text: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
}

export interface BasePost {
  id: string;
  type: PostType;
  creator: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  content: {
    title: string;
    description: string;
    video: string;
    category: string;
  };
  stats: {
    likes: number;
    comments: number;
    views?: number;
  };
  isLiked: boolean;
  isProcessingLike?: boolean;
  commentsList: Comment[];
  shop_id?: string | null;
  restaurant_id?: string | null;
  created_on?: string;
  shopLat?: number;
  shopLng?: number;
  shopAlt?: number;
}

export interface RestaurantPost extends BasePost {
  type: "restaurant";
  restaurant: {
    rating: number;
    reviews: number;
    location: string;
    deliveryTime: string;
    price: number;
  };
}

export interface SupermarketPost extends BasePost {
  type: "supermarket";
  product: {
    price: number;
    originalPrice?: number;
    store: string;
    inStock: boolean;
    discount?: number;
  };
}

export interface ChefPost extends BasePost {
  type: "chef";
  recipe: {
    difficulty: "Easy" | "Medium" | "Hard";
    cookTime: string;
    servings: number;
    youtubeChannel: string;
    subscribers: string;
  };
}

export interface BusinessPost extends BasePost {
  type: "business";
  business: {
    name: string;
    location: string;
    email: string;
    phone: string;
  };
}

export type FoodPost =
  | RestaurantPost
  | SupermarketPost
  | ChefPost
  | BusinessPost;

// Helper to extract YouTube video ID
export const getYouTubeVideoId = (url: string) => {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export const isYouTubeUrl = (url: string) => {
  return url.includes("youtube.com") || url.includes("youtu.be");
};

export const isImageUrl = (url: string) => {
  if (!url) return false;
  const imageExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
    ".svg",
    ".bmp",
  ];
  const baseUrl = url.split("?")[0].toLowerCase();
  return imageExtensions.some((ext) => baseUrl.endsWith(ext));
};

export const isValidMediaUrl = (url: string) => {
  if (!url || typeof url !== "string") return false;

  // Stricter check: URLs shouldn't have spaces (sentences) and must start correctly.
  // This prevents description text (like the Starbucks example) from being used as a media source.
  if (url.trim().includes(" ")) return false;

  const validStarts = ["http://", "https://", "/", "blob:", "data:"];
  return validStarts.some((start) => url.startsWith(start));
};

export const getPostTypeColor = (type: PostType) => {
  switch (type) {
    case "restaurant":
      return "#ff6b35"; // Vibrant orange
    case "supermarket":
      return "#4ade80"; // Bright green
    case "chef":
      return "#3b82f6"; // Blue
    case "business":
      return "#8b5cf6"; // Purple
    default:
      return "#6b7280"; // Gray fallback
  }
};

export const getCategoryColor = (category: string) => {
  const categoryLower = category.toLowerCase();
  switch (categoryLower) {
    case "shopping":
      return "#8b5cf6"; // Purple
    case "organic":
      return "#10b981"; // Emerald
    case "tutorial":
      return "#f59e0b"; // Amber
    case "recipe":
      return "#ef4444"; // Red
    case "food":
      return "#f97316"; // Orange
    case "cooking":
      return "#dc2626"; // Red
    case "delivery":
      return "#06b6d4"; // Cyan
    case "loading":
      return "#6b7280"; // Gray
    default:
      return "#6b7280"; // Gray fallback
  }
};
