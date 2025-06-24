"use client"

import React, { useState, useRef, useEffect } from "react"
import RootLayout from "@components/ui/layout"
import { useTheme } from "../../src/context/ThemeContext"
import VideoReel from "../../src/components/Reels/VideoReel"
import CommentsDrawer from "../../src/components/Reels/CommentsDrawer"

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
    video: string
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
      title: "Fresh Fruit Shopping Experience",
      description: "Join us for a delightful shopping experience as we explore fresh fruits and vegetables. Watch how we select the best produce for our customers.",
      video: "/assets/Videos/coverr-shopping-for-fresh-fruits-1080p.mp4",
      category: "Shopping",
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
      title: "Organic Produce Selection",
      description: "Discover our premium organic selection. From farm to table, we ensure the highest quality for your healthy lifestyle.",
      video: "/assets/Videos/coverr-shopping-for-fresh-fruits-1080p.mp4",
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
      title: "Cooking with Fresh Ingredients",
      description: "Learn how to cook amazing dishes using fresh, locally sourced ingredients. Simple techniques, incredible results!",
      video: "/assets/Videos/coverr-shopping-for-fresh-fruits-1080p.mp4",
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
]

export default function FoodReelsApp() {
  const { theme } = useTheme()
  const [posts, setPosts] = useState(foodPosts)
  const [showComments, setShowComments] = useState(false)
  const [activePostId, setActivePostId] = useState<string | null>(null)
  const [visiblePostIndex, setVisiblePostIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  // Intersection Observer to detect which post is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0')
            setVisiblePostIndex(index)
          }
        })
      },
      {
        threshold: 0.5,
        rootMargin: '-10% 0px -10% 0px'
      }
    )

    const posts = containerRef.current?.querySelectorAll('[data-index]')
    posts?.forEach((post) => observer.observe(post))

    return () => observer.disconnect()
  }, [])

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
  }

  const addComment = (postId: string, commentText: string) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      user: {
        name: "you",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      text: commentText,
      timestamp: "now",
      likes: 0,
      isLiked: false,
    }

    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              commentsList: [newComment, ...post.commentsList],
              stats: {
                ...post.stats,
                comments: post.stats.comments + 1,
              },
            }
          : post,
      ),
    )
  }

  const handleShare = (postId: string) => {
    console.log('Sharing post:', postId)
  }

  const activePost = posts.find((post) => post.id === activePostId)

  // Mobile layout - full screen without navbar/sidebar
  if (isMobile) {
    return (
      <div className={`h-screen bg-black transition-colors duration-200 ${theme === "dark" ? "bg-gray-900" : "bg-black"}`}>
        <div 
          ref={containerRef}
          style={{ height: "100vh", overflowY: "auto" }}
        >
          <div style={{ scrollSnapType: "y mandatory" }}>
            {posts.map((post, index) => (
              <div key={post.id} data-index={index}>
                <VideoReel
                  post={post}
                  isVisible={visiblePostIndex === index}
                  onLike={toggleLike}
                  onComment={openComments}
                  onShare={handleShare}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Comments Drawer */}
        {activePost && (
          <CommentsDrawer
            open={showComments}
            onClose={closeComments}
            comments={activePost.commentsList}
            commentCount={activePost.stats.comments}
            postId={activePost.id}
            onToggleCommentLike={toggleCommentLike}
            onAddComment={addComment}
          />
        )}
      </div>
    )
  }

  // Desktop layout - with normal page alignment
  return (
    <RootLayout>
      <div className={`container mx-auto p-4 transition-colors duration-200 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
        <div 
          ref={containerRef}
          style={{ height: "calc(100vh - 200px)", overflowY: "auto" }}
        >
          <div style={{ scrollSnapType: "y mandatory" }}>
            {posts.map((post, index) => (
              <div key={post.id} data-index={index}>
                <VideoReel
                  post={post}
                  isVisible={visiblePostIndex === index}
                  onLike={toggleLike}
                  onComment={openComments}
                  onShare={handleShare}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Comments Drawer */}
        {activePost && (
          <CommentsDrawer
            open={showComments}
            onClose={closeComments}
            comments={activePost.commentsList}
            commentCount={activePost.stats.comments}
            postId={activePost.id}
            onToggleCommentLike={toggleCommentLike}
            onAddComment={addComment}
          />
        )}
      </div>
    </RootLayout>
  )
}
