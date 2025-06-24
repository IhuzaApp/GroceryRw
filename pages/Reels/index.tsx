"use client"

import React, { useState } from "react"
import RootLayout from "@components/ui/layout"
import { useTheme } from "../../src/context/ThemeContext"
import { Panel, Button, Avatar, Badge, Input, Drawer } from "rsuite"
import Image from "next/image"

// Inline SVGs for icons
const HeartIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

const MessageIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

const ShareIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16,6 12,2 8,6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
)

const ShoppingCartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
)

const StarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
  </svg>
)

const MapPinIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

const ClockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </svg>
)

const DollarSignIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
)

const StoreIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9,22 9,12 15,12 15,22" />
  </svg>
)

const YoutubeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75,15.02 15.5,11.75 9.75,8.48" />
  </svg>
)

const BookOpenIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
)

const ChefHatIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
    <line x1="6" y1="17" x2="18" y2="17" />
  </svg>
)

const PackageIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="16.5" y1="9.4" x2="7.55" y2="4.24" />
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27,6.96 12,12.01 20.73,6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
)

const UtensilsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
    <path d="M7 2v20" />
    <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Z" />
  </svg>
)

const XIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const SendIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22,2 15,22 11,13 2,9" />
  </svg>
)

type PostType = "restaurant" | "supermarket" | "chef"

interface Comment {
  id: string
  user: {
    name: string
    avatar: string
    verified?: boolean
  }
  text: string
  timestamp: string
  likes: number
  isLiked: boolean
  replies?: Comment[]
}

interface BasePost {
  id: string
  type: PostType
  creator: {
    name: string
    avatar: string
    verified: boolean
  }
  content: {
    title: string
    description: string
    image: string
    category: string
  }
  stats: {
    likes: number
    comments: number
    views?: number
  }
  isLiked: boolean
  commentsList: Comment[]
}

interface RestaurantPost extends BasePost {
  type: "restaurant"
  restaurant: {
    rating: number
    reviews: number
    location: string
    deliveryTime: string
    price: number
  }
}

interface SupermarketPost extends BasePost {
  type: "supermarket"
  product: {
    price: number
    originalPrice?: number
    store: string
    inStock: boolean
    discount?: number
  }
}

interface ChefPost extends BasePost {
  type: "chef"
  recipe: {
    difficulty: "Easy" | "Medium" | "Hard"
    cookTime: string
    servings: number
    youtubeChannel: string
    subscribers: string
  }
}

type FoodPost = RestaurantPost | SupermarketPost | ChefPost

const mockComments: Comment[] = [
  {
    id: "1",
    user: {
      name: "foodie_sarah",
      avatar: "/placeholder.svg?height=32&width=32",
      verified: true,
    },
    text: "This looks absolutely amazing! 😍 Can't wait to try it!",
    timestamp: "2h",
    likes: 24,
    isLiked: false,
  },
  {
    id: "2",
    user: {
      name: "mike_eats",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    text: "Just ordered this yesterday and it was incredible! Highly recommend 👌",
    timestamp: "4h",
    likes: 12,
    isLiked: true,
  },
  {
    id: "3",
    user: {
      name: "chef_anna",
      avatar: "/placeholder.svg?height=32&width=32",
      verified: true,
    },
    text: "The technique shown here is perfect! Great job on the presentation 🔥",
    timestamp: "6h",
    likes: 45,
    isLiked: false,
  },
  {
    id: "4",
    user: {
      name: "hungry_student",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    text: "Is this available for delivery in downtown area?",
    timestamp: "8h",
    likes: 3,
    isLiked: false,
  },
  {
    id: "5",
    user: {
      name: "taste_tester",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    text: "The price is so reasonable for the quality! Will definitely visit this place soon 💯",
    timestamp: "12h",
    likes: 18,
    isLiked: false,
  },
]

const foodPosts: FoodPost[] = [
  {
    id: "1",
    type: "restaurant",
    creator: {
      name: "Bella Italia",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: true,
    },
    content: {
      title: "Truffle Pasta Carbonara",
      description: "Creamy carbonara with black truffle, pancetta, and fresh parmesan. A classic Italian comfort dish.",
      image: "/placeholder.svg?height=600&width=400",
      category: "Italian",
    },
    stats: {
      likes: 1247,
      comments: 89,
    },
    restaurant: {
      rating: 4.8,
      reviews: 156,
      location: "0.8 miles away",
      deliveryTime: "25-35 min",
      price: 24.99,
    },
    isLiked: false,
    commentsList: mockComments,
  },
  {
    id: "2",
    type: "supermarket",
    creator: {
      name: "Fresh Market",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: true,
    },
    content: {
      title: "Organic Avocados",
      description:
        "Premium organic Hass avocados, perfectly ripe and ready to eat. Great for toast, salads, and smoothies.",
      image: "/placeholder.svg?height=600&width=400",
      category: "Organic",
    },
    stats: {
      likes: 892,
      comments: 45,
    },
    product: {
      price: 3.99,
      originalPrice: 5.99,
      store: "Fresh Market Downtown",
      inStock: true,
      discount: 33,
    },
    isLiked: true,
    commentsList: mockComments.slice(0, 3),
  },
  {
    id: "3",
    type: "chef",
    creator: {
      name: "Chef Marco",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: true,
    },
    content: {
      title: "Perfect Homemade Pizza Dough",
      description:
        "Learn the secret to making restaurant-quality pizza dough at home. Simple ingredients, amazing results!",
      image: "/placeholder.svg?height=600&width=400",
      category: "Tutorial",
    },
    stats: {
      likes: 3421,
      comments: 234,
      views: 45600,
    },
    recipe: {
      difficulty: "Medium",
      cookTime: "2 hours",
      servings: 4,
      youtubeChannel: "@ChefMarcoKitchen",
      subscribers: "2.3M",
    },
    isLiked: false,
    commentsList: mockComments,
  },
  {
    id: "4",
    type: "supermarket",
    creator: {
      name: "GreenGrocer",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: false,
    },
    content: {
      title: "Wild Salmon Fillets",
      description:
        "Fresh wild-caught salmon fillets, sustainably sourced. Perfect for grilling, baking, or pan-searing.",
      image: "/placeholder.svg?height=600&width=400",
      category: "Seafood",
    },
    stats: {
      likes: 567,
      comments: 23,
    },
    product: {
      price: 18.99,
      store: "GreenGrocer Market",
      inStock: true,
    },
    isLiked: false,
    commentsList: mockComments.slice(1, 4),
  },
  {
    id: "5",
    type: "chef",
    creator: {
      name: "Chef Sarah",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: true,
    },
    content: {
      title: "5-Minute Chocolate Mug Cake",
      description:
        "Craving chocolate cake but don't want to bake a whole cake? This microwave mug cake is your answer!",
      image: "/placeholder.svg?height=600&width=400",
      category: "Dessert",
    },
    stats: {
      likes: 8934,
      comments: 456,
      views: 123400,
    },
    recipe: {
      difficulty: "Easy",
      cookTime: "5 min",
      servings: 1,
      youtubeChannel: "@SarahsBaking",
      subscribers: "1.8M",
    },
    isLiked: true,
    commentsList: mockComments,
  },
]

export default function FoodReelsApp() {
  const { theme } = useTheme()
  const [posts, setPosts] = useState(foodPosts)
  const [showComments, setShowComments] = useState(false)
  const [activePostId, setActivePostId] = useState<string | null>(null)
  const [newComment, setNewComment] = useState("")

  const toggleLike = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              stats: {
                ...post.stats,
                likes: post.isLiked ? post.stats.likes - 1 : post.stats.likes + 1,
              },
            }
          : post,
      ),
    )
  }

  const toggleCommentLike = (postId: string, commentId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              commentsList: post.commentsList.map((comment) =>
                comment.id === commentId
                  ? {
                      ...comment,
                      isLiked: !comment.isLiked,
                      likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
                    }
                  : comment,
              ),
            }
          : post,
      ),
    )
  }

  const openComments = (postId: string) => {
    setActivePostId(postId)
    setShowComments(true)
  }

  const closeComments = () => {
    setShowComments(false)
    setActivePostId(null)
    setNewComment("")
  }

  const addComment = () => {
    if (!newComment.trim() || !activePostId) return

    const newCommentObj: Comment = {
      id: Date.now().toString(),
      user: {
        name: "you",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      text: newComment,
      timestamp: "now",
      likes: 0,
      isLiked: false,
    }

    setPosts(
      posts.map((post) =>
        post.id === activePostId
          ? {
              ...post,
              commentsList: [newCommentObj, ...post.commentsList],
              stats: {
                ...post.stats,
                comments: post.stats.comments + 1,
              },
            }
          : post,
      ),
    )

    setNewComment("")
  }

  const activePost = posts.find((post) => post.id === activePostId)

  const getPostTypeIcon = (type: PostType) => {
    switch (type) {
      case "restaurant":
        return <UtensilsIcon />
      case "supermarket":
        return <PackageIcon />
      case "chef":
        return <ChefHatIcon />
    }
  }

  const getPostTypeColor = (type: PostType) => {
    switch (type) {
      case "restaurant":
        return "orange"
      case "supermarket":
        return "green"
      case "chef":
        return "blue"
    }
  }

  const renderBottomActions = (post: FoodPost) => {
    switch (post.type) {
      case "restaurant":
        const restaurantPost = post as RestaurantPost
        return (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <StarIcon />
                <span style={{ color: "#fff", fontWeight: "bold" }}>{restaurantPost.restaurant.rating}</span>
                <span style={{ color: "#fff", opacity: 0.7, fontSize: "14px" }}>({restaurantPost.restaurant.reviews} reviews)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <DollarSignIcon />
                <span style={{ color: "#fff", fontWeight: "bold", fontSize: "18px" }}>${restaurantPost.restaurant.price}</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12, color: "#fff", opacity: 0.8, fontSize: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <MapPinIcon />
                <span>{restaurantPost.restaurant.location}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <ClockIcon />
                <span>{restaurantPost.restaurant.deliveryTime}</span>
              </div>
            </div>
            <Button appearance="primary" color="orange" style={{ width: "100%", padding: "12px", borderRadius: "25px", fontWeight: "bold" }}>
              <ShoppingCartIcon />
              <span style={{ marginLeft: 8 }}>Order Now</span>
            </Button>
          </div>
        )

      case "supermarket":
        const supermarketPost = post as SupermarketPost
        return (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#fff", fontWeight: "bold", fontSize: "20px" }}>${supermarketPost.product.price}</span>
                {supermarketPost.product.originalPrice && (
                  <>
                    <span style={{ color: "#fff", opacity: 0.6, textDecoration: "line-through", fontSize: "14px" }}>${supermarketPost.product.originalPrice}</span>
                    <Badge color="red" style={{ fontSize: "12px" }}>{supermarketPost.product.discount}% OFF</Badge>
                  </>
                )}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, color: "#fff", opacity: 0.8, fontSize: "14px" }}>
              <StoreIcon />
              <span>{supermarketPost.product.store}</span>
              <Badge color={supermarketPost.product.inStock ? "green" : "red"} style={{ fontSize: "12px" }}>
                {supermarketPost.product.inStock ? "In Stock" : "Out of Stock"}
              </Badge>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Button appearance="primary" color="blue" style={{ flex: 1, padding: "12px", borderRadius: "25px", fontWeight: "bold" }}>
                <StoreIcon />
                <span style={{ marginLeft: 8 }}>Visit Store</span>
              </Button>
              <Button appearance="primary" color="green" style={{ flex: 1, padding: "12px", borderRadius: "25px", fontWeight: "bold" }}>
                <ShoppingCartIcon />
                <span style={{ marginLeft: 8 }}>Add to Cart</span>
              </Button>
            </div>
          </div>
        )

      case "chef":
        const chefPost = post as ChefPost
        return (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12, color: "#fff", opacity: 0.9, fontSize: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <ClockIcon />
                <span>{chefPost.recipe.cookTime}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span>👥 {chefPost.recipe.servings} servings</span>
              </div>
              <Badge style={{ color: "#fff", border: "1px solid #fff", opacity: 0.3 }}>
                {chefPost.recipe.difficulty}
              </Badge>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, color: "#fff", opacity: 0.8, fontSize: "14px" }}>
              <YoutubeIcon />
              <span>{chefPost.recipe.youtubeChannel}</span>
              <span>• {chefPost.recipe.subscribers} subscribers</span>
            </div>
            {chefPost.stats.views && (
              <div style={{ color: "#fff", opacity: 0.7, fontSize: "14px", marginBottom: 12 }}>{chefPost.stats.views.toLocaleString()} views</div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <Button appearance="primary" color="red" style={{ flex: 1, padding: "12px", borderRadius: "25px", fontWeight: "bold" }}>
                <YoutubeIcon />
                <span style={{ marginLeft: 8 }}>Watch on YouTube</span>
              </Button>
              <Button appearance="primary" color="blue" style={{ flex: 1, padding: "12px", borderRadius: "25px", fontWeight: "bold" }}>
                <BookOpenIcon />
                <span style={{ marginLeft: 8 }}>Get Recipe</span>
              </Button>
            </div>
          </div>
        )
    }
  }

  return (
    <RootLayout>
      <div className={`h-screen bg-black transition-colors duration-200 ${theme === "dark" ? "bg-gray-900" : "bg-black"}`}>
        <div style={{ height: "100vh", overflowY: "auto" }}>
          <div style={{ scrollSnapType: "y mandatory" }}>
            {posts.map((post) => (
              <div
                key={post.id}
                style={{
                  position: "relative",
                  height: "100vh",
                  width: "100%",
                  scrollSnapAlign: "start",
                  border: "none",
                  borderRadius: 0,
                  overflow: "hidden",
                }}
              >
                {/* Background Image */}
                <div style={{ position: "absolute", inset: 0 }}>
                  <Image
                    src={post.content.image || "/placeholder.svg"}
                    alt={post.content.title}
                    fill
                    style={{ objectFit: "cover" }}
                    priority
                  />
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent, rgba(0,0,0,0.3))"
                  }} />
                </div>

                {/* Top Header */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Avatar circle size="md" src={post.creator.avatar || "/placeholder.svg"} alt={post.creator.name} style={{ border: "2px solid white" }} />
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ color: "#fff", fontWeight: 600, fontSize: "14px" }}>{post.creator.name}</span>
                        {post.creator.verified && (
                          <div style={{ width: 16, height: 16, backgroundColor: "#3b82f6", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ color: "#fff", fontSize: "12px" }}>✓</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Badge color={getPostTypeColor(post.type)} style={{ border: "1px solid", opacity: 0.3 }}>
                      {getPostTypeIcon(post.type)}
                      <span style={{ marginLeft: 4, textTransform: "capitalize" }}>{post.type}</span>
                    </Badge>
                    <Badge style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "#fff", border: "none" }}>
                      {post.content.category}
                    </Badge>
                  </div>
                </div>

                {/* Right Side Actions */}
                <div style={{ position: "absolute", right: 16, bottom: 160, display: "flex", flexDirection: "column", gap: 24, zIndex: 10 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Button
                      appearance="ghost"
                      size="lg"
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        backgroundColor: post.isLiked ? "#ef4444" : "rgba(255,255,255,0.2)",
                        backdropFilter: "blur(4px)",
                        border: "none",
                        color: "#fff"
                      }}
                      onClick={() => toggleLike(post.id)}
                    >
                      <HeartIcon filled={post.isLiked} />
                    </Button>
                    <span style={{ color: "#fff", fontSize: "12px", marginTop: 4, fontWeight: 500 }}>
                      {post.stats.likes > 999 ? `${(post.stats.likes / 1000).toFixed(1)}k` : post.stats.likes}
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Button
                      appearance="ghost"
                      size="lg"
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        backgroundColor: "rgba(255,255,255,0.2)",
                        backdropFilter: "blur(4px)",
                        border: "none",
                        color: "#fff"
                      }}
                      onClick={() => openComments(post.id)}
                    >
                      <MessageIcon />
                    </Button>
                    <span style={{ color: "#fff", fontSize: "12px", marginTop: 4, fontWeight: 500 }}>{post.stats.comments}</span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Button
                      appearance="ghost"
                      size="lg"
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        backgroundColor: "rgba(255,255,255,0.2)",
                        backdropFilter: "blur(4px)",
                        border: "none",
                        color: "#fff"
                      }}
                    >
                      <ShareIcon />
                    </Button>
                  </div>
                </div>

                {/* Bottom Content */}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 16, zIndex: 10 }}>
                  <div style={{ marginBottom: 16 }}>
                    <h2 style={{ color: "#fff", fontSize: "20px", fontWeight: "bold", marginBottom: 8 }}>{post.content.title}</h2>
                    <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "14px", marginBottom: 16, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{post.content.description}</p>
                  </div>

                  {renderBottomActions(post)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comments Drawer */}
        <Drawer
          open={showComments}
          onClose={closeComments}
          placement="bottom"
          size="80%"
          style={{ borderRadius: "24px 24px 0 0" }}
        >
          <Drawer.Header>
            <Drawer.Title style={{ fontSize: "18px", fontWeight: 600 }}>
              {activePost?.stats.comments} Comments
            </Drawer.Title>
            <Button appearance="ghost" size="sm" onClick={closeComments}>
              <XIcon />
            </Button>
          </Drawer.Header>

          <Drawer.Body style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            {/* Comments List */}
            <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {activePost?.commentsList.map((comment) => (
                  <div key={comment.id} style={{ display: "flex", gap: 12 }}>
                    <Avatar circle size="sm" src={comment.user.avatar || "/placeholder.svg"} alt={comment.user.name} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ backgroundColor: "#f3f4f6", borderRadius: "16px", padding: "8px 12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                          <span style={{ fontWeight: 600, fontSize: "14px" }}>{comment.user.name}</span>
                          {comment.user.verified && (
                            <div style={{ width: 12, height: 12, backgroundColor: "#3b82f6", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <span style={{ color: "#fff", fontSize: "10px" }}>✓</span>
                            </div>
                          )}
                        </div>
                        <p style={{ fontSize: "14px", color: "#374151" }}>{comment.text}</p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 4, paddingLeft: 12 }}>
                        <span style={{ fontSize: "12px", color: "#6b7280" }}>{comment.timestamp}</span>
                        <button
                          style={{ fontSize: "12px", color: "#6b7280", border: "none", background: "none", cursor: "pointer" }}
                          onClick={() => toggleCommentLike(activePost.id, comment.id)}
                        >
                          {comment.likes > 0 && (
                            <span style={{ color: comment.isLiked ? "#ef4444" : "#6b7280", fontWeight: comment.isLiked ? 500 : 400 }}>
                              {comment.likes} {comment.likes === 1 ? "like" : "likes"}
                            </span>
                          )}
                        </button>
                        <button style={{ fontSize: "12px", color: "#6b7280", border: "none", background: "none", cursor: "pointer" }}>Reply</button>
                      </div>
                    </div>
                    <Button
                      appearance="ghost"
                      size="sm"
                      style={{ width: 24, height: 24, flexShrink: 0 }}
                      onClick={() => toggleCommentLike(activePost.id, comment.id)}
                    >
                      <HeartIcon filled={comment.isLiked} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Comment Input */}
            <div style={{ padding: 16, borderTop: "1px solid #e5e7eb", backgroundColor: "#fff" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar circle size="sm" src="/placeholder.svg?height=32&width=32" alt="You" />
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
                  <Input
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={setNewComment}
                    style={{ flex: 1, border: "none", backgroundColor: "#f3f4f6", borderRadius: "20px", padding: "8px 16px" }}
                    onKeyPress={(e) => e.key === "Enter" && addComment()}
                  />
                  <Button
                    size="sm"
                    appearance="primary"
                    color="blue"
                    style={{ width: 32, height: 32, borderRadius: "50%", padding: 0 }}
                    onClick={addComment}
                    disabled={!newComment.trim()}
                  >
                    <SendIcon />
                  </Button>
                </div>
              </div>
            </div>
          </Drawer.Body>
        </Drawer>
      </div>
    </RootLayout>
  )
}
