"use client";

import React, { useState, useRef, useEffect } from "react";
import RootLayout from "@components/ui/layout";
import { useTheme } from "../../src/context/ThemeContext";
import { useSession } from "next-auth/react";
import ReelPlaceholder from "@components/Reels/ReelPlaceholder";
import MobileReelsView from "../../src/components/Reels/MobileReelsView";
import DesktopReelsView from "../../src/components/Reels/DesktopReelsView";

// Inline SVGs for icons
const HeartIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const MessageIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const ShareIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16,6 12,2 8,6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
);

const ShoppingCartIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const StarIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
  </svg>
);

const MapPinIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const ClockIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </svg>
);

const DollarSignIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const StoreIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9,22 9,12 15,12 15,22" />
  </svg>
);

const YoutubeIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75,15.02 15.5,11.75 9.75,8.48" />
  </svg>
);

const BookOpenIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const ChefHatIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
    <line x1="6" y1="17" x2="18" y2="17" />
  </svg>
);

const PackageIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="16.5" y1="9.4" x2="7.55" y2="4.24" />
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27,6.96 12,12.01 20.73,6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const UtensilsIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
    <path d="M7 2v20" />
    <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Z" />
  </svg>
);

const XIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SendIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22,2 15,22 11,13 2,9" />
  </svg>
);

type PostType = "restaurant" | "supermarket" | "chef";

interface Comment {
  id: string;
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

interface BasePost {
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
  commentsList: Comment[];
  shop_id?: string | null;
  restaurant_id?: string | null;
}

interface RestaurantPost extends BasePost {
  type: "restaurant";
  restaurant: {
    rating: number;
    reviews: number;
    location: string;
    deliveryTime: string;
    price: number;
  };
}

interface SupermarketPost extends BasePost {
  type: "supermarket";
  product: {
    price: number;
    originalPrice?: number;
    store: string;
    inStock: boolean;
    discount?: number;
  };
}

interface ChefPost extends BasePost {
  type: "chef";
  recipe: {
    difficulty: "Easy" | "Medium" | "Hard";
    cookTime: string;
    servings: number;
    youtubeChannel: string;
    subscribers: string;
  };
}

type FoodPost = RestaurantPost | SupermarketPost | ChefPost;

// Database interface for API response
interface DatabaseReel {
  id: string;
  category: string;
  created_on: string;
  description: string;
  isLiked: boolean;
  likes: string;
  restaurant_id: string | null;
  title: string;
  type: string;
  user_id: string;
  video_url: string;
  delivery_time: string | null;
  Price: string | null;
  Product: any;
  Shops: {
    name: string;
    address?: string;
    id: string;
    image?: string;
    description?: string;
  } | null;
  User: {
    email: string;
    gender: string;
    id: string;
    is_active: boolean;
    name: string;
    created_at: string;
    role: string;
    phone: string;
    profile_picture: string;
  } | null;
  Restaurant: {
    created_at: string;
    email: string;
    id: string;
    lat: number;
    location: string;
    long: number;
    name: string;
    phone: string;
    profile: string;
    verified: boolean;
  } | null;
  Reels_comments: Array<{
    user_id: string;
    text: string;
    reel_id: string;
    likes: string;
    isLiked: boolean;
    id: string;
    created_on: string;
    User: {
      gender: string;
      email: string;
      name: string;
      phone: string;
      role: string;
      profile_picture?: string;
    } | null;
  }>;
  reel_likes: Array<{
    created_at: string;
    id: string;
    reel_id: string;
    user_id: string;
  }>;
}

// Format timestamp to relative time
const formatTimestamp = (timestamp: string): string => {
  const now = new Date();
  const commentTime = new Date(timestamp);
  const diffInMinutes = Math.floor(
    (now.getTime() - commentTime.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) return "now";
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
  return `${Math.floor(diffInMinutes / 1440)}d`;
};

// Check if current user has liked a reel
const checkUserLikeStatus = (
  reelLikes: Array<{ user_id: string }>,
  currentUserId: string
): boolean => {
  return reelLikes.some((like) => like.user_id === currentUserId);
};

// Cache configuration
const CACHE_KEY = "reels_cache";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const MAX_CACHE_AGE = 30 * 60 * 1000; // 30 minutes maximum cache age

interface CachedReels {
  data: FoodPost[];
  timestamp: number;
  lastFetch: number;
  version: string;
}

export default function FoodReelsApp() {
  const { theme } = useTheme();
  const { data: session } = useSession();
  const [posts, setPosts] = useState<FoodPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [isRefreshingComments, setIsRefreshingComments] = useState(false);
  const [visiblePostIndex, setVisiblePostIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [optimisticComments, setOptimisticComments] = useState<{
    [postId: string]: Comment[];
  }>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullToRefresh, setPullToRefresh] = useState({
    isPulling: false,
    startY: 0,
    currentY: 0,
  });

  // Cache utility functions
  const getCachedReels = (): CachedReels | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const parsedCache: CachedReels = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is still valid
      if (now - parsedCache.timestamp > MAX_CACHE_AGE) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      return parsedCache;
    } catch (error) {
      console.error("Error reading cache:", error);
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
  };

  const setCachedReels = (data: FoodPost[]): void => {
    try {
      // Create a compressed version of the data with only essential fields
      const compressedData = data.map((post) => ({
        id: post.id,
        type: post.type,
        creator: {
          name: post.creator.name,
          avatar: post.creator.avatar,
          verified: post.creator.verified,
        },
        content: {
          title: post.content.title,
          description: post.content.description,
          video: post.content.video,
          category: post.content.category,
        },
        stats: {
          likes: post.stats.likes,
          comments: post.stats.comments,
        },
        isLiked: post.isLiked,
        // Only store essential type-specific data
        ...(post.type === "restaurant" && {
          restaurant: {
            rating: post.restaurant.rating,
            reviews: post.restaurant.reviews,
            location: post.restaurant.location,
            deliveryTime: post.restaurant.deliveryTime,
            price: post.restaurant.price,
          },
        }),
        ...(post.type === "supermarket" && {
          product: {
            price: post.product.price,
            originalPrice: post.product.originalPrice,
            store: post.product.store,
            inStock: post.product.inStock,
            discount: post.product.discount,
          },
        }),
        ...(post.type === "chef" && {
          recipe: {
            difficulty: post.recipe.difficulty,
            cookTime: post.recipe.cookTime,
            servings: post.recipe.servings,
            youtubeChannel: post.recipe.youtubeChannel,
            subscribers: post.recipe.subscribers,
          },
        }),
      }));

      const cacheData: CachedReels = {
        data: compressedData as FoodPost[],
        timestamp: Date.now(),
        lastFetch: Date.now(),
        version: "1.0",
      };

      const serialized = JSON.stringify(cacheData);

      // Check if data is too large for localStorage
      if (serialized.length > 4 * 1024 * 1024) {
        // 4MB limit
        console.warn("Cache data too large, skipping cache save");
        return;
      }

      localStorage.setItem(CACHE_KEY, serialized);
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === "QuotaExceededError"
      ) {
        console.warn(
          "localStorage quota exceeded, clearing old cache and retrying"
        );
        // Clear old cache and try again
        try {
          localStorage.removeItem(CACHE_KEY);
          // Try with even more compressed data
          const minimalData = data.slice(0, 10).map((post) => ({
            id: post.id,
            type: post.type,
            creator: {
              name: post.creator.name,
              avatar: post.creator.avatar,
              verified: post.creator.verified,
            },
            content: {
              title: post.content.title,
              description: post.content.description,
              video: post.content.video,
              category: post.content.category,
            },
            stats: { likes: post.stats.likes, comments: post.stats.comments },
            isLiked: post.isLiked,
          }));

          const minimalCache: CachedReels = {
            data: minimalData as FoodPost[],
            timestamp: Date.now(),
            lastFetch: Date.now(),
            version: "1.0",
          };

          localStorage.setItem(CACHE_KEY, JSON.stringify(minimalCache));
        } catch (retryError) {
          console.error("Failed to save even minimal cache:", retryError);
        }
      } else {
        console.error("Error saving cache:", error);
      }
    }
  };

  const shouldRefreshCache = (cached: CachedReels): boolean => {
    const now = Date.now();
    return now - cached.lastFetch > CACHE_DURATION;
  };

  // Clean up old cache entries to free up space
  const cleanupOldCache = (): void => {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(
        (key) => key.startsWith("reels_") || key.startsWith("cache_")
      );

      // Remove old cache entries (older than 1 hour)
      cacheKeys.forEach((key) => {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const parsed = JSON.parse(data);
            if (
              parsed.timestamp &&
              Date.now() - parsed.timestamp > 60 * 60 * 1000
            ) {
              localStorage.removeItem(key);
            }
          }
        } catch (e) {
          // Remove corrupted cache entries
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error("Error cleaning up cache:", error);
    }
  };

  // Convert database reel to FoodPost format with current user's like status
  const convertDatabaseReelToFoodPost = (dbReel: DatabaseReel): FoodPost => {
    const currentUserId = session?.user?.id;
    const userHasLiked = currentUserId
      ? checkUserLikeStatus(dbReel.reel_likes, currentUserId)
      : false;

    // Convert comments
    const commentsList: Comment[] = dbReel.Reels_comments.map((comment) => ({
      id: comment.id,
      user: {
        name: comment.User?.name || "Plas Reel Agent",
        avatar:
          comment.User?.profile_picture ||
          "/placeholder.svg?height=32&width=32",
        verified:
          comment.User?.role === "admin" ||
          comment.User?.role === "verified" ||
          false,
      },
      text: comment.text,
      timestamp: formatTimestamp(comment.created_on),
      likes: parseInt(comment.likes || "0"),
      isLiked: comment.isLiked,
    }));

    // Base post structure
    const basePost: BasePost = {
      id: dbReel.id,
      type: dbReel.type as PostType,
      creator: {
        name: dbReel.User?.name || "Plas Reel Agent",
        avatar:
          dbReel.User?.profile_picture || "/placeholder.svg?height=40&width=40",
        verified:
          dbReel.User?.role === "admin" ||
          dbReel.User?.role === "verified" ||
          false,
      },
      content: {
        title: dbReel.title,
        description: dbReel.description,
        video: dbReel.video_url,
        category: dbReel.category,
      },
      stats: {
        likes: dbReel.reel_likes.length, // Use actual likes count from reel_likes
        comments: dbReel.Reels_comments.length,
      },
      isLiked: userHasLiked, // Use actual user like status
      commentsList,
      shop_id: dbReel.shop_id || null,
      restaurant_id: dbReel.restaurant_id || null,
    };

    // Helper function to extract string value
    const extractStringValue = (value: any): string | null => {
      if (!value) return null;
      if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
      }
      if (typeof value === 'object' && value !== null) {
        if (value.value && typeof value.value === 'string') {
          const trimmed = value.value.trim();
          return trimmed.length > 0 ? trimmed : null;
        }
        if (value.text && typeof value.text === 'string') {
          const trimmed = value.text.trim();
          return trimmed.length > 0 ? trimmed : null;
        }
        if (value.name && typeof value.name === 'string') {
          const trimmed = value.name.trim();
          return trimmed.length > 0 ? trimmed : null;
        }
        try {
          const str = value.toString();
          if (str && str !== '[object Object]' && typeof str === 'string') {
            const trimmed = str.trim();
            return trimmed.length > 0 ? trimmed : null;
          }
        } catch (e) {}
        const keys = Object.keys(value);
        for (const key of keys) {
          if (typeof value[key] === 'string') {
            const trimmed = value[key].trim();
            if (trimmed.length > 0) return trimmed;
          }
        }
      }
      return null;
    };

    // Convert based on type
    switch (dbReel.type) {
      case "restaurant":
        // Try Restaurant location first, then fallback to Shops address if restaurant_id is null
        let restaurantLocation = null;
        
        if (dbReel.Restaurant?.location) {
          restaurantLocation = extractStringValue(dbReel.Restaurant.location);
        }
        
        // If no restaurant location but we have a shop_id, try using Shops address
        if (!restaurantLocation && dbReel.Shops) {
          restaurantLocation = extractStringValue(dbReel.Shops.address) || extractStringValue(dbReel.Shops.name);
        }
        
        const finalLocation = restaurantLocation || "Location information unavailable";
        
        return {
          ...basePost,
          type: "restaurant",
          restaurant: {
            rating: 4.5,
            reviews: 100,
            location: finalLocation,
            deliveryTime: dbReel.delivery_time || "30-45 min",
            price: parseFloat(dbReel.Price || "0"),
          },
        } as RestaurantPost;

      case "supermarket":
        const product = dbReel.Product || {};
        
        // Try multiple sources for store information, in order of preference:
        let storeName: string | null = null;
        
        // 1. Try Shops relationship (if shop_id exists and Shops is loaded)
        if (dbReel.Shops) {
          storeName = extractStringValue(dbReel.Shops.name) || extractStringValue(dbReel.Shops.address);
        }
        
        // 2. Try Product JSON field for store information (some reels might store it there)
        if (!storeName && product && typeof product === 'object') {
          storeName = extractStringValue(product.store) || 
                     extractStringValue(product.storeName) || 
                     extractStringValue(product.shopName) ||
                     extractStringValue(product.shop);
        }
        
        // 3. Try Restaurant name/location if we have restaurant_id instead of shop_id
        if (!storeName && dbReel.Restaurant) {
          storeName = extractStringValue(dbReel.Restaurant.name) || extractStringValue(dbReel.Restaurant.location);
        }
        
        // 4. Last resort - check if description or title contains store info
        if (!storeName) {
          const description = extractStringValue(dbReel.description);
          const title = extractStringValue(dbReel.title);
          if (description && description.length < 100) {
            storeName = description;
          } else if (title && title.length < 50) {
            storeName = title;
          }
        }
        
        const finalStoreName = storeName || "Store information unavailable";
        
        return {
          ...basePost,
          type: "supermarket",
          product: {
            price: parseFloat(dbReel.Price || "0"),
            originalPrice: product.originalPrice || undefined,
            store: finalStoreName,
            inStock: product.inStock !== false,
            discount: product.discount || undefined,
          },
        } as SupermarketPost;

      case "chef":
        const recipe = dbReel.Product || {};
        return {
          ...basePost,
          type: "chef",
          recipe: {
            difficulty: recipe.difficulty || "Medium",
            cookTime: recipe.cookTime || "1 hour",
            servings: recipe.servings || 4,
            youtubeChannel: recipe.youtubeChannel || "@ChefChannel",
            subscribers: recipe.subscribers || "1M",
          },
        } as ChefPost;

      case "shop":
      case "store":
        // Handle shop/store type reels - similar to supermarket
        const shopProduct = dbReel.Product || {};
        
        // Try multiple sources for store information
        let shopStoreName: string | null = null;
        
        // 1. Try Shops relationship
        if (dbReel.Shops) {
          shopStoreName = extractStringValue(dbReel.Shops.name) || extractStringValue(dbReel.Shops.address);
        }
        
        // 2. Try Product JSON field
        if (!shopStoreName && shopProduct) {
          shopStoreName = extractStringValue(shopProduct.store) || 
                         extractStringValue(shopProduct.storeName) || 
                         extractStringValue(shopProduct.shopName) ||
                         extractStringValue(shopProduct.shop);
        }
        
        // 3. Try Restaurant name/location
        if (!shopStoreName && dbReel.Restaurant) {
          shopStoreName = extractStringValue(dbReel.Restaurant.name) || extractStringValue(dbReel.Restaurant.location);
        }
        
        // 4. If we have shop_id but no Shops data
        if (!shopStoreName && dbReel.shop_id) {
          shopStoreName = "Store information available (loading...)";
        }
        
        const finalShopStoreName = shopStoreName || "Store information unavailable";
        
        return {
          ...basePost,
          type: "supermarket" as PostType, // Map shop/store to supermarket type for display
          product: {
            price: parseFloat(dbReel.Price || "0"),
            originalPrice: shopProduct.originalPrice || undefined,
            store: finalShopStoreName,
            inStock: shopProduct.inStock !== false,
            discount: shopProduct.discount || undefined,
          },
        } as SupermarketPost;

      default:
        return basePost as FoodPost;
    }
  };

  // Fetch reels from database with caching
  useEffect(() => {
    const fetchReels = async (forceRefresh: boolean = false) => {
      try {
        // Clean up old cache entries first
        cleanupOldCache();

        // Check cache first
        const cached = getCachedReels();

        if (cached && !forceRefresh) {
          console.log("Loading reels from cache");
          setPosts(cached.data);
          setLoading(false);

          // Check if we need to refresh in background
          if (shouldRefreshCache(cached)) {
            console.log("Cache is stale, refreshing in background");
            fetchReelsFromAPI(true); // Background refresh
          }
          return;
        }

        // No cache or force refresh - fetch from API
        await fetchReelsFromAPI(false);
      } catch (err) {
        console.error("Error in fetchReels:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch reels");
        setLoading(false);
      }
    };

    const fetchReelsFromAPI = async (isBackgroundRefresh: boolean = false) => {
      try {
        if (!isBackgroundRefresh) {
          setLoading(true);
          setError(null);
        } else {
          setIsRefreshing(true);
        }

        const response = await fetch("/api/queries/reels");
        if (!response.ok) {
          throw new Error("Failed to fetch reels");
        }

        const data = await response.json();
        const convertedPosts = data.reels.map((reel: DatabaseReel) =>
          convertDatabaseReelToFoodPost(reel)
        );

        // Update state first
        setPosts(convertedPosts);

        // Try to update cache, but don't fail if it doesn't work
        try {
          setCachedReels(convertedPosts);
        } catch (cacheError) {
          console.warn(
            "Failed to update cache, continuing without cache:",
            cacheError
          );
        }

        if (isBackgroundRefresh) {
          console.log("Background refresh completed");
        }
      } catch (err) {
        console.error("Error fetching reels from API:", err);
        if (!isBackgroundRefresh) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch reels"
          );
        }
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    };

    fetchReels();
  }, [session?.user?.id]);

  // Manual refresh function
  const refreshReels = async () => {
    try {
      setIsRefreshing(true);
      setError(null);

        const response = await fetch("/api/queries/reels");
        if (!response.ok) {
          throw new Error("Failed to fetch reels");
        }

        const data = await response.json();
        const convertedPosts = data.reels.map((reel: DatabaseReel) =>
          convertDatabaseReelToFoodPost(reel)
        );

      // Update state first for immediate UI update
      setPosts(convertedPosts);

      // Try to update cache, but don't fail if it doesn't work
      try {
        setCachedReels(convertedPosts);
      } catch (cacheError) {
        console.warn(
          "Failed to update cache, continuing without cache:",
          cacheError
        );
      }
    } catch (err) {
      console.error("Error refreshing reels:", err);
      setError(err instanceof Error ? err.message : "Failed to refresh reels");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Enhanced scroll handling for TikTok-style navigation
  useEffect(() => {
    if (!containerRef.current || posts.length === 0) return;

    const container = containerRef.current;
    let isScrolling = false;
    let scrollTimeout: NodeJS.Timeout;
    let lastScrollTime = 0;

    const scrollToVideo = (index: number, smooth: boolean = true) => {
      if (index < 0 || index >= posts.length) return;

      const targetElement = container.children[index] as HTMLElement;
      if (targetElement) {
        if (smooth) {
          // Smooth scrolling for desktop
          targetElement.scrollIntoView({ behavior: "smooth" });
        } else {
          // Instant snap for mobile
          container.style.scrollBehavior = "auto";
          targetElement.scrollIntoView({ behavior: "auto" });
          setTimeout(() => {
            container.style.scrollBehavior = "smooth";
          }, 100);
        }
        setVisiblePostIndex(index);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      // Different behavior for mobile vs desktop
      if (isMobile) {
        // Mobile: TikTok-style behavior
        e.preventDefault();

        const now = Date.now();
        if (isScrolling || now - lastScrollTime < 150) return;

        isScrolling = true;
        lastScrollTime = now;

        const currentIndex = visiblePostIndex;
        let nextIndex = currentIndex;

        if (e.deltaY > 0 && currentIndex < posts.length - 1) {
          nextIndex = currentIndex + 1;
        } else if (e.deltaY < 0 && currentIndex > 0) {
          nextIndex = currentIndex - 1;
        }

        if (nextIndex !== currentIndex) {
          scrollToVideo(nextIndex, false); // Instant snap for mobile
        }

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          isScrolling = false;
        }, 200);
      } else {
        // Desktop: More natural scrolling with scroll-snap
        const currentIndex = visiblePostIndex;
        let nextIndex = currentIndex;

        // Only handle large scroll deltas to prevent over-sensitivity
        if (Math.abs(e.deltaY) > 50) {
          if (e.deltaY > 0 && currentIndex < posts.length - 1) {
            nextIndex = currentIndex + 1;
          } else if (e.deltaY < 0 && currentIndex > 0) {
            nextIndex = currentIndex - 1;
          }

          if (nextIndex !== currentIndex) {
            scrollToVideo(nextIndex, true); // Smooth scrolling for desktop
          }
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Desktop keyboard navigation
      if (isMobile) return;

      // Don't handle navigation if user is typing in an input field
      const activeElement = document.activeElement;
      const isTyping = activeElement && (
        activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA" ||
        activeElement.getAttribute("contenteditable") === "true" ||
        activeElement.closest("input") ||
        activeElement.closest("textarea") ||
        activeElement.closest("[contenteditable='true']")
      );

      // For space key, only handle navigation if not typing
      if (e.key === " " && isTyping) {
        return;
      }

      const currentIndex = visiblePostIndex;
      let nextIndex = currentIndex;

      switch (e.key) {
        case "ArrowDown":
        case "PageDown":
        case " ": // Spacebar
          e.preventDefault();
          if (currentIndex < posts.length - 1) {
            nextIndex = currentIndex + 1;
          }
          break;
        case "ArrowUp":
        case "PageUp":
          e.preventDefault();
          if (currentIndex > 0) {
            nextIndex = currentIndex - 1;
          }
          break;
        case "Home":
          e.preventDefault();
          nextIndex = 0;
          break;
        case "End":
          e.preventDefault();
          nextIndex = posts.length - 1;
          break;
        default:
          return;
      }

      if (nextIndex !== currentIndex) {
        scrollToVideo(nextIndex, true);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (!isMobile) return;

      const touch = e.touches[0];
      container.dataset.touchStartY = touch.clientY.toString();
      container.dataset.touchStartTime = Date.now().toString();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (
        !isMobile ||
        !container.dataset.touchStartY ||
        !container.dataset.touchStartTime
      )
        return;

      const touchEndY = e.changedTouches[0].clientY;
      const touchStartY = parseInt(container.dataset.touchStartY);
      const touchStartTime = parseInt(container.dataset.touchStartTime);
      const touchDuration = Date.now() - touchStartTime;
      const deltaY = touchStartY - touchEndY;
      const threshold = 30;

      // Check for pull-to-refresh (swipe down from top)
      if (deltaY < -80 && visiblePostIndex === 0 && touchDuration > 200) {
        // Pull to refresh triggered
        refreshReels();
        setPullToRefresh({ isPulling: false, startY: 0, currentY: 0 });
        return;
      }

      if (Math.abs(deltaY) > threshold && touchDuration < 500) {
        const currentIndex = visiblePostIndex;
        let nextIndex = currentIndex;

        if (deltaY > 0 && currentIndex < posts.length - 1) {
          nextIndex = currentIndex + 1;
        } else if (deltaY < 0 && currentIndex > 0) {
          nextIndex = currentIndex - 1;
        }

        if (nextIndex !== currentIndex) {
          scrollToVideo(nextIndex, false);
        }
      }

      delete container.dataset.touchStartY;
      delete container.dataset.touchStartTime;
    };

    // Add event listeners
    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    // Desktop keyboard navigation
    if (!isMobile) {
      container.addEventListener("keydown", handleKeyDown);
      container.setAttribute("tabindex", "0"); // Make container focusable for keyboard events
    }

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("keydown", handleKeyDown);
      clearTimeout(scrollTimeout);
    };
  }, [posts.length, visiblePostIndex, isMobile]);

  // Check if mobile on mount and resize with debouncing
  useEffect(() => {
    const checkIfMobile = () => {
      const newIsMobile = window.innerWidth < 768;
      if (newIsMobile !== isMobile) {
        console.log(
          `Screen size changed: ${newIsMobile ? "mobile" : "desktop"}`
        );
        setIsMobile(newIsMobile);
        // Reset visible post index when switching layouts
        setVisiblePostIndex(0);
      }
    };

    checkIfMobile();

    // Debounced resize handler
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkIfMobile, 100);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [isMobile]);

  // Intersection Observer to detect which post is visible
  useEffect(() => {
    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(
              entry.target.getAttribute("data-index") || "0"
            );
            setVisiblePostIndex(index);
          }
        });
      },
      {
        threshold: isMobile ? 0.3 : 0.5, // Different thresholds for mobile vs desktop
        rootMargin: isMobile ? "-10% 0px -10% 0px" : "-20% 0px -20% 0px",
      }
    );

    observerRef.current = observer;

    const posts = containerRef.current.querySelectorAll("[data-index]");

    posts.forEach((post) => {
      observer.observe(post);
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [posts.length, isMobile]); // Re-run when posts change or mobile state changes

  const toggleLike = async (postId: string) => {
    // Check if user is logged in
    if (!session?.user) {
      alert("Please log in to like videos");
      return;
    }

    try {
      const currentPost = posts.find((post: FoodPost) => post.id === postId);
      if (!currentPost) return;

      const isCurrentlyLiked = currentPost.isLiked;

      // Immediately update UI for instant feedback
      setPosts(
        posts.map((post: FoodPost) =>
          post.id === postId
            ? {
                ...post,
                isLiked: !isCurrentlyLiked,
                stats: {
                  ...post.stats,
                  likes: isCurrentlyLiked
                    ? Math.max(0, post.stats.likes - 1)
                    : post.stats.likes + 1,
                },
              }
            : post
        )
      );

      // Process backend request in background
      const method = isCurrentlyLiked ? "DELETE" : "POST";

      fetch("/api/queries/reel-likes", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reel_id: postId,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            console.error("Error toggling like:", response.status);
            // Optionally revert UI if backend fails
            // For now, we'll keep the optimistic update
          }
        })
        .catch((error) => {
          console.error("Error toggling like:", error);
          // Optionally revert UI if backend fails
          // For now, we'll keep the optimistic update
        });
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const toggleCommentLike = async (postId: string, commentId: string) => {
    // Check if user is logged in
    if (!session?.user) {
      alert("Please log in to like comments");
      return;
    }

    try {
      const response = await fetch("/api/queries/reel-comments", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comment_id: commentId,
          action: "toggle_like",
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setPosts(
          posts.map((post: FoodPost) =>
            post.id === postId
              ? {
                  ...post,
                  commentsList: post.commentsList.map((comment: Comment) =>
                    comment.id === commentId
                      ? {
                          ...comment,
                          isLiked: result.isLiked,
                          likes: parseInt(result.likes),
                        }
                      : comment
                  ),
                }
              : post
          )
        );
      }
    } catch (error) {
      console.error("Error toggling comment like:", error);
    }
  };

  const addComment = async (postId: string, commentText: string) => {
    // Check if user is logged in
    if (!session?.user) {
      alert("Please log in to add comments");
      return;
    }

    try {
      // Create optimistic comment for immediate UI update
      const optimisticComment: Comment = {
        id: `temp-${Date.now()}`,
        user: {
          name: session?.user?.name || "You",
          avatar: session?.user?.image || "/placeholder.svg?height=32&width=32",
          verified: false,
        },
        text: commentText,
        timestamp: "now",
        likes: 0,
        isLiked: false,
      };

      // Add to optimisticComments state
      setOptimisticComments((prev) => ({
        ...prev,
        [postId]: [optimisticComment, ...(prev[postId] || [])],
      }));

      // Optimistic update - add comment immediately to UI
      setPosts(
        posts.map((post: FoodPost) =>
          post.id === postId
            ? {
                ...post,
                stats: {
                  ...post.stats,
                  comments: post.stats.comments + 1,
                },
              }
            : post
        )
      );

      // Make API call to add comment
      const response = await fetch("/api/queries/reel-comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reel_id: postId,
          text: commentText,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      const result = await response.json();

      if (result.success && result.comment) {
        // Remove optimistic comment
        setOptimisticComments((prev) => ({
          ...prev,
          [postId]: (prev[postId] || []).filter(
            (c) => c.id !== optimisticComment.id
          ),
        }));
        // Optionally, you can trigger a refetch here for extra safety
        await refetchComments(postId);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      // Remove optimistic comment on error
      setOptimisticComments((prev) => ({
        ...prev,
        [postId]: (prev[postId] || []).filter((c) => !c.id.startsWith("temp-")),
      }));
      setPosts(
        posts.map((post: FoodPost) =>
          post.id === postId
            ? {
                ...post,
                stats: {
                  ...post.stats,
                  comments: Math.max(0, post.stats.comments - 1),
                },
              }
            : post
        )
      );
      alert("Failed to add comment. Please try again.");
    }
  };

  // Function to refetch comments for a specific post
  const refetchComments = async (postId: string) => {
    try {
      setIsRefreshingComments(true);
      const response = await fetch(
        `/api/queries/reel-comments?reel_id=${postId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }

      const data = await response.json();

      // Convert database comments to frontend format
      const commentsList: Comment[] = data.comments.map((comment: any) => ({
        id: comment.id,
        user: {
          name: comment.User.name,
          avatar:
            comment.User.profile_picture ||
            "/placeholder.svg?height=32&width=32",
          verified:
            comment.User.role === "admin" || comment.User.role === "verified",
        },
        text: comment.text,
        timestamp: formatTimestamp(comment.created_on),
        likes: parseInt(comment.likes || "0"),
        isLiked: comment.isLiked,
      }));

      // Merge optimistic comments (if any)
      const mergedComments = [
        ...(optimisticComments[postId] || []),
        ...commentsList.filter(
          (c) =>
            !(optimisticComments[postId] || []).some(
              (o) => o.text === c.text && o.user.name === c.user.name
            )
        ),
      ];

      // Update posts with fresh comment data
      setPosts(
        posts.map((post: FoodPost) =>
          post.id === postId
            ? {
                ...post,
                commentsList: mergedComments,
                stats: {
                  ...post.stats,
                  comments: mergedComments.length,
                },
              }
            : post
        )
      );
    } catch (error) {
      console.error("Error refetching comments:", error);
    } finally {
      setIsRefreshingComments(false);
    }
  };

  // Enhanced openComments function with comment refetching
  const openComments = async (postId: string) => {
    // Check if user is logged in
    if (!session?.user) {
      alert("Please log in to view comments");
      return;
    }

    console.log("Opening comments for post:", postId);
    setActivePostId(postId);
    setShowComments(true);

    // Refetch comments when opening to ensure we have the latest data
    await refetchComments(postId);

    console.log("Comments state after opening:", {
      postId,
      showComments: true,
    });
  };

  // Set up periodic comment refresh when comments are open
  useEffect(() => {
    if (!showComments || !activePostId) return;

    const refreshInterval = setInterval(() => {
      refetchComments(activePostId);
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(refreshInterval);
  }, [showComments, activePostId]);

  // Automatically set active post and load comments for desktop view
  useEffect(() => {
    if (isMobile) return; // Only for desktop
    
    if (posts.length > 0 && visiblePostIndex >= 0 && visiblePostIndex < posts.length) {
      const currentPost = posts[visiblePostIndex];
      if (currentPost && currentPost.id) {
        // Always update activePostId for desktop to show comments sidebar
        setActivePostId(currentPost.id);
        // Auto-fetch comments for the visible post on desktop if user is logged in
        if (session?.user) {
          refetchComments(currentPost.id);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visiblePostIndex, posts.length, isMobile, session?.user?.id]);

  const closeComments = () => {
    console.log("Closing comments");
    setShowComments(false);
    setActivePostId(null);
  };

  const handleShare = (postId: string) => {
    // Check if user is logged in
    if (!session?.user) {
      alert("Please log in to share videos");
      return;
    }

    console.log("Sharing post:", postId);
  };

  // On desktop, always use visible post for comments; on mobile, use activePostId (from clicking comment icon)
  const activePostForComments = isMobile 
    ? posts.find((post: FoodPost) => post.id === activePostId)
    : (posts.length > 0 && visiblePostIndex >= 0 && visiblePostIndex < posts.length 
        ? posts[visiblePostIndex] 
        : null);
  
  const activePost = activePostForComments;
  const mergedActiveComments = activePost
    ? [
        ...(optimisticComments[activePost.id] || []),
        ...(activePost.commentsList || []).filter(
          (c) =>
            !(optimisticComments[activePost.id] || []).some(
              (o) => o.text === c.text && o.user.name === c.user.name
            )
        ),
      ]
    : [];

  if (loading) {
    return (
      <RootLayout>
        <div className="flex h-screen w-full items-center justify-center  md:p-4">
          <div className="relative h-full w-full overflow-hidden md:max-w-sm md:rounded-2xl md:shadow-2xl">
            <ReelPlaceholder />
            <ReelPlaceholder />
            <ReelPlaceholder />
          </div>
        </div>
      </RootLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={`flex min-h-screen items-center justify-center ${
          theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
        }`}
      >
        <div className="text-center">
          <p className="mb-4 text-red-500">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <div
        className={`flex min-h-screen items-center justify-center ${
          theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
        }`}
      >
        <div className="text-center">
          <p className="mb-4 text-gray-500">No reels available</p>
          <p className="text-sm text-gray-400">
            Check back later for new content
          </p>
        </div>
      </div>
    );
  }

  // Render mobile or desktop view
  if (isMobile) {
    return (
      <MobileReelsView
        posts={posts}
        visiblePostIndex={visiblePostIndex}
        setVisiblePostIndex={setVisiblePostIndex}
        containerRef={containerRef}
        isAuthenticated={!!session?.user}
        activePost={activePost}
        showComments={showComments}
        openComments={openComments}
        closeComments={closeComments}
        mergedActiveComments={mergedActiveComments}
        toggleCommentLike={toggleCommentLike}
        addComment={addComment}
        isRefreshingComments={isRefreshingComments}
        toggleLike={toggleLike}
        handleShare={handleShare}
        isRefreshing={isRefreshing}
      />
    );
  }

  return (
    <DesktopReelsView
      posts={posts}
      visiblePostIndex={visiblePostIndex}
      setVisiblePostIndex={setVisiblePostIndex}
      containerRef={containerRef}
      isAuthenticated={!!session?.user}
      mergedActiveComments={mergedActiveComments}
      toggleCommentLike={toggleCommentLike}
      addComment={addComment}
      isRefreshingComments={isRefreshingComments}
      toggleLike={toggleLike}
      handleShare={handleShare}
      isRefreshing={isRefreshing}
      theme={theme}
    />
  );
}
