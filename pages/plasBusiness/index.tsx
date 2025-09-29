"use client"

import {
  Search,
  Filter,
  Plus,
  Star,
  MapPin,
  Clock,
  DollarSign,
  Package,
  FileText,
  ShoppingCart,
  Truck,
  CheckCircle,
  AlertCircle,
  Eye,
  MessageSquare,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import RootLayout from "../../src/components/ui/layout"
import { useAuth } from "../../src/context/AuthContext"
import { QuoteDetailsModal } from "./quote-details-modal"

const stats = [
  {
    title: "Active RFQs",
    value: "12",
    change: "+3",
    icon: FileText,
    color: "text-blue-600",
  },
  {
    title: "Pending Orders",
    value: "8",
    change: "+2",
    icon: ShoppingCart,
    color: "text-orange-600",
  },
  {
    title: "Monthly Spend",
    value: "$18,450",
    change: "+8.2%",
    icon: DollarSign,
    color: "text-green-600",
  },
  {
    title: "Suppliers",
    value: "24",
    change: "+5",
    icon: Package,
    color: "text-purple-600",
  },
]

const suppliers = [
  {
    id: "SUP-001",
    name: "Fresh Farm Distributors",
    category: "Vegetables & Fruits",
    rating: 4.8,
    location: "California, USA",
    minOrder: "$500",
    deliveryTime: "2-3 days",
    verified: true,
    specialties: ["Organic", "Local", "Seasonal"],
    image: "/idyllic-farm.png",
  },
  {
    id: "SUP-002",
    name: "Premium Meat Co.",
    category: "Meat & Poultry",
    rating: 4.9,
    location: "Texas, USA",
    minOrder: "$1,000",
    deliveryTime: "1-2 days",
    verified: true,
    specialties: ["Premium", "Grass-fed", "Halal"],
    image: "/meat.jpg",
  },
  {
    id: "SUP-003",
    name: "Ocean Fresh Seafood",
    category: "Seafood",
    rating: 4.7,
    location: "Maine, USA",
    minOrder: "$750",
    deliveryTime: "1 day",
    verified: true,
    specialties: ["Fresh", "Sustainable", "Wild-caught"],
    image: "/assorted-seafood-display.png",
  },
]

const activeRFQs = [
  {
    id: "RFQ-001",
    title: "Weekly Fresh Produce Supply",
    category: "Vegetables",
    budget: "$2,000-3,000",
    responses: 8,
    deadline: "2024-01-20",
    status: "Open",
    description: "Looking for reliable supplier for weekly fresh produce delivery",
  },
  {
    id: "RFQ-002",
    title: "Premium Meat Selection",
    category: "Meat",
    budget: "$5,000-8,000",
    responses: 12,
    deadline: "2024-01-25",
    status: "Reviewing",
    description: "High-quality meat products for upscale restaurant chain",
  },
  {
    id: "RFQ-003",
    title: "Dairy Products Bundle",
    category: "Dairy",
    budget: "$1,500-2,500",
    responses: 6,
    deadline: "2024-01-22",
    status: "Open",
    description: "Various dairy products for bakery operations",
  },
]

const recentOrders = [
  {
    id: "ORD-001",
    supplier: "Fresh Farm Distributors",
    items: "Organic Vegetables Mix",
    value: "$1,250",
    status: "Delivered",
    deliveryDate: "2024-01-12",
    tracking: "TRK-12345",
  },
  {
    id: "ORD-002",
    supplier: "Premium Meat Co.",
    items: "Prime Beef Selection",
    value: "$3,200",
    status: "In Transit",
    deliveryDate: "2024-01-15",
    tracking: "TRK-12346",
  },
  {
    id: "ORD-003",
    supplier: "Ocean Fresh Seafood",
    items: "Daily Fresh Fish",
    value: "$890",
    status: "Processing",
    deliveryDate: "2024-01-16",
    tracking: "TRK-12347",
  },
]

const quotes = [
  {
    id: "QUO-001",
    rfqId: "RFQ-001",
    supplier: {
      name: "Fresh Farm Distributors",
      rating: 4.8,
      location: "California, USA",
      verified: true,
      contact: {
        name: "John Smith",
        email: "john@freshfarm.com",
        phone: "+1 (555) 123-4567",
      },
      company: {
        address: "123 Farm Road, Fresno, CA 93721",
        established: "2015",
        employees: "50-100",
      },
    },
    title: "Weekly Fresh Produce Supply",
    totalPrice: "$2,750",
    deliveryTime: "2-3 days",
    validUntil: "2024-01-25",
    items: [
      {
        id: "item-1",
        name: "Organic Tomatoes",
        category: "Vegetables",
        quantity: 50,
        unit: "lbs",
        unitPrice: 3.5,
        totalPrice: 175.0,
        specifications: "Grade A, vine-ripened",
      },
      {
        id: "item-2",
        name: "Fresh Lettuce",
        category: "Vegetables",
        quantity: 30,
        unit: "heads",
        unitPrice: 2.25,
        totalPrice: 67.5,
        specifications: "Iceberg and Romaine mix",
      },
    ],
    terms: {
      paymentTerms: "Net 30 days",
      deliveryTerms: "FOB Destination",
      warranty: "Quality guarantee for 48 hours",
      minimumOrder: "$500",
    },
    notes: "All produce is certified organic and locally sourced.",
    attachments: ["organic-certificates.pdf"],
    submittedDate: "2024-01-15",
    status: "pending" as const,
  },
]

export default function PlasBusinessPage() {
  const { role, isLoggedIn, authReady } = useAuth()
  const router = useRouter()
  const [selectedQuote, setSelectedQuote] = useState<any>(null)
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)

  // Redirect shoppers away from this page
  useEffect(() => {
    if (authReady && isLoggedIn && role === "shopper") {
      router.push("/Plasa")
    }
  }, [role, isLoggedIn, authReady, router])

  // Show loading while auth is being determined
  if (!authReady) {
    return (
      <RootLayout>
        <div className="flex h-screen w-full items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-16 w-16 animate-spin rounded-full border-b-4 border-t-4 border-green-800"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </RootLayout>
    )
  }

  // Don't render for shoppers
  if (isLoggedIn && role === "shopper") {
    return null
  }

  return (
    <RootLayout>
      <div className="min-h-screen  via-white to-gray-100 dark:from-gray-900 ">
        <div className="container mx-auto px-4 py-8">
          <BuyerDashboardContent 
            selectedQuote={selectedQuote}
            setSelectedQuote={setSelectedQuote}
            isQuoteModalOpen={isQuoteModalOpen}
            setIsQuoteModalOpen={setIsQuoteModalOpen}
          />
        </div>
      </div>
    </RootLayout>
  )
}

function BuyerDashboardContent({ 
  selectedQuote, 
  setSelectedQuote, 
  isQuoteModalOpen, 
  setIsQuoteModalOpen 
}: {
  selectedQuote: any
  setSelectedQuote: (quote: any) => void
  isQuoteModalOpen: boolean
  setIsQuoteModalOpen: (open: boolean) => void
}) {
  const [activeTab, setActiveTab] = useState("suppliers")

  const handleViewQuoteDetails = (quote: any) => {
    setSelectedQuote(quote)
    setIsQuoteModalOpen(true)
  }

  const handleAcceptQuote = (quoteId: string) => {
    console.log("Accepting quote:", quoteId)
    setIsQuoteModalOpen(false)
  }

  const handleRejectQuote = (quoteId: string) => {
    console.log("Rejecting quote:", quoteId)
    setIsQuoteModalOpen(false)
  }

  const handleMessageSupplier = (supplierId: string) => {
    console.log("Messaging supplier:", supplierId)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Business Marketplace</h1>
              <p className="text-green-100 text-lg">Discover suppliers, manage orders, and streamline procurement</p>
            </div>
            <div className="flex gap-4">
              <button className="px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white hover:bg-white/30 transition-all duration-300 font-medium">
                <Plus className="mr-2 h-5 w-5 inline" />
                Create RFQ
              </button>
              <button className="px-6 py-3 bg-white text-green-600 rounded-xl hover:bg-green-50 transition-all duration-300 font-medium shadow-lg">
                <Search className="mr-2 h-5 w-5 inline" />
                Find Suppliers
              </button>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 dark:border-gray-700 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className={`text-sm font-medium ${stat.color}`}>{stat.change} from last month</p>
              </div>
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color.replace('text-', 'from-').replace('-600', '-100')} to-${stat.color.replace('text-', '').replace('-600', '-200')} dark:from-gray-700 dark:to-gray-600 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </div>
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent to-gray-50/50 dark:to-gray-700/20 pointer-events-none"></div>
          </div>
        ))}
      </div>

      {/* Main Content Tabs */}
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-2">
          <div className="flex space-x-2">
            {[
              { id: "suppliers", label: "Suppliers", icon: Package },
              { id: "rfqs", label: "My RFQs", icon: FileText },
              { id: "quotes", label: "Quotes", icon: ShoppingCart },
              { id: "orders", label: "Orders", icon: Truck },
              { id: "contracts", label: "Contracts", icon: FileText }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg transform scale-105"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "suppliers" && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                    <input 
                      placeholder="Search suppliers by name, category, or location..." 
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 placeholder-gray-400"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="relative">
                    <select className="appearance-none px-4 py-4 pr-8 border-2 border-gray-200 dark:border-gray-600 rounded-2xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 min-w-[140px]">
                      <option>Category</option>
                      <option>Vegetables</option>
                      <option>Meat & Poultry</option>
                      <option>Seafood</option>
                      <option>Dairy</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <div className="relative">
                    <select className="appearance-none px-4 py-4 pr-8 border-2 border-gray-200 dark:border-gray-600 rounded-2xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 min-w-[120px]">
                      <option>Location</option>
                      <option>Local</option>
                      <option>Regional</option>
                      <option>National</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <button className="px-6 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-green-500 transition-all duration-300 font-medium flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    More Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Supplier Listings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {suppliers.map((supplier) => (
                <div key={supplier.id} className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100 dark:border-gray-700 hover:-translate-y-2">
                  <div className="flex items-start space-x-6">
                    <div className="relative">
                      <img
                        src={supplier.image || "/placeholder.svg"}
                        alt={supplier.name}
                        className="h-20 w-20 rounded-2xl object-cover shadow-md group-hover:scale-110 transition-transform duration-300"
                      />
                      {supplier.verified && (
                        <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-xl text-gray-900 dark:text-white group-hover:text-green-600 transition-colors">{supplier.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{supplier.category}</p>
                        </div>
                        {supplier.verified && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900 dark:to-emerald-900 dark:text-green-200">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Verified
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white">{supplier.rating}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-green-500" />
                          <span className="text-gray-600 dark:text-gray-400">{supplier.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span className="text-gray-600 dark:text-gray-400">{supplier.deliveryTime}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {supplier.specialties.map((specialty, index) => (
                          <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 dark:from-gray-700 dark:to-gray-600 dark:text-gray-300 hover:from-green-100 hover:to-emerald-100 hover:text-green-700 transition-all duration-300">
                            {specialty}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Min Order: <span className="text-green-600 font-bold">{supplier.minOrder}</span></span>
                        </div>
                        <div className="flex gap-3">
                          <button className="px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-green-500 transition-all duration-300 text-sm font-medium flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            View
                          </button>
                          <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-xl flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Contact
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "rfqs" && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="flex items-center justify-between p-8 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-800">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My RFQs</h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your request for quotes</p>
                </div>
                <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create New RFQ
                </button>
              </div>
              <div className="p-8">
                <div className="space-y-6">
                  {activeRFQs.map((rfq) => (
                    <div key={rfq.id} className="group p-6 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-800 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
                      <div className="flex items-start justify-between">
                        <div className="space-y-4 flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-green-600 transition-colors">{rfq.title}</h3>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                              rfq.status === "Open" 
                                ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900 dark:to-emerald-900 dark:text-green-200" 
                                : "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 dark:from-blue-900 dark:to-cyan-900 dark:text-blue-200"
                            }`}>
                              {rfq.status}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400">{rfq.description}</p>
                          <div className="flex items-center gap-6 text-sm">
                            <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <DollarSign className="h-4 w-4 text-green-500" />
                              <span className="font-semibold">{rfq.budget}</span>
                            </span>
                            <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <FileText className="h-4 w-4 text-blue-500" />
                              <span className="font-semibold">{rfq.responses} responses</span>
                            </span>
                            <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <Clock className="h-4 w-4 text-orange-500" />
                              <span className="font-semibold">Due: {rfq.deadline}</span>
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-3 ml-6">
                          <button className="px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-green-500 transition-all duration-300 text-sm font-medium">
                            View Responses
                          </button>
                          <button className="px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-green-500 transition-all duration-300 text-sm font-medium">
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "quotes" && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="flex items-center justify-between p-8 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-800">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Received Quotes</h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">Review and compare supplier quotes</p>
                </div>
                <button className="px-6 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-green-500 transition-all duration-300 font-medium">
                  Compare Selected
                </button>
              </div>
              <div className="p-8">
                <div className="space-y-6">
                  {quotes.map((quote) => (
                    <div key={quote.id} className="group p-6 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-800 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="space-y-4 flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-green-600 transition-colors">{quote.title}</h3>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 dark:from-blue-900 dark:to-cyan-900 dark:text-blue-200">
                              {quote.items.length} items
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400">From: <span className="font-semibold text-gray-900 dark:text-white">{quote.supplier.name}</span></p>
                          <div className="flex items-center gap-6 text-sm">
                            <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <div className="flex items-center">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              </div>
                              <span className="font-semibold">{quote.supplier.rating}</span>
                            </span>
                            <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <Truck className="h-4 w-4 text-green-500" />
                              <span className="font-semibold">{quote.deliveryTime}</span>
                            </span>
                            <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <Clock className="h-4 w-4 text-orange-500" />
                              <span className="font-semibold">Valid until: {quote.validUntil}</span>
                            </span>
                          </div>
                        </div>
                        <div className="text-right space-y-4 ml-6">
                          <div>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">{quote.totalPrice}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Quote Value</p>
                          </div>
                          <div className="flex gap-3">
                            <button 
                              onClick={() => handleViewQuoteDetails(quote)}
                              className="px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-green-500 transition-all duration-300 text-sm font-medium"
                            >
                              View Details
                            </button>
                            <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-xl">
                              Accept Quote
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="flex items-center justify-between p-8 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-800">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Order History</h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">Track and manage your orders</p>
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-green-500 transition-all duration-300 text-sm font-medium">
                    Export
                  </button>
                  <button className="px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-green-500 transition-all duration-300 text-sm font-medium">
                    Filter
                  </button>
                </div>
              </div>
              <div className="p-8">
                <div className="space-y-6">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="group p-6 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-800 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="space-y-4 flex-1">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-lg text-gray-900 dark:text-white">{order.id}</span>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                              order.status === "Delivered"
                                ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900 dark:to-emerald-900 dark:text-green-200"
                                : order.status === "In Transit"
                                  ? "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 dark:from-blue-900 dark:to-cyan-900 dark:text-blue-200"
                                  : "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 dark:from-yellow-900 dark:to-orange-900 dark:text-yellow-200"
                            }`}>
                              {order.status === "Delivered" && <CheckCircle className="mr-1 h-3 w-3" />}
                              {order.status === "In Transit" && <Truck className="mr-1 h-3 w-3" />}
                              {order.status === "Processing" && <AlertCircle className="mr-1 h-3 w-3" />}
                              {order.status}
                            </span>
                          </div>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">{order.items}</p>
                          <p className="text-gray-600 dark:text-gray-400">
                            From: <span className="font-semibold">{order.supplier}</span> • Tracking: <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{order.tracking}</span>
                          </p>
                        </div>
                        <div className="text-right space-y-4 ml-6">
                          <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{order.value}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Order Value</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Delivery: <span className="font-semibold">{order.deliveryDate}</span></p>
                            <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-xl">
                              Track Order
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "contracts" && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-8 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-800">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Active Contracts</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your supplier contracts</p>
              </div>
              <div className="p-8">
                <div className="text-center py-16">
                  <div className="relative">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-2xl flex items-center justify-center">
                      <FileText className="h-12 w-12 text-gray-400" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">0</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No active contracts yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Contracts will appear here once quotes are accepted</p>
                  <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl">
                    View Accepted Quotes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <QuoteDetailsModal
        quote={selectedQuote}
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        onAccept={handleAcceptQuote}
        onReject={handleRejectQuote}
        onMessage={handleMessageSupplier}
      />
    </div>
  )
}