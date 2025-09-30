"use client"

import { useState } from "react"
import {
  Search,
  Filter,
  Eye,
  MessageSquare,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  MapPin,
  User,
} from "lucide-react"

const mockRFQOpportunities = [
  {
    id: "1",
    title: "Office Furniture Supply",
    description: "Looking for complete office furniture setup for new office space",
    budget: "$15,000 - $25,000",
    category: "Furniture",
    location: "New York, NY",
    postedBy: "TechStart Inc",
    postedAt: "2 hours ago",
    deadline: "Dec 15, 2024",
    status: "Open",
    responses: 8,
    isInterested: false,
  },
  {
    id: "2",
    title: "IT Equipment Procurement",
    description: "Need laptops, desktops, and networking equipment for 50 employees",
    budget: "$50,000 - $75,000",
    category: "Technology",
    location: "San Francisco, CA",
    postedBy: "Digital Solutions Ltd",
    postedAt: "5 hours ago",
    deadline: "Dec 20, 2024",
    status: "Open",
    responses: 12,
    isInterested: true,
  },
  {
    id: "3",
    title: "Cleaning Services Contract",
    description: "Monthly cleaning services for commercial building",
    budget: "$3,000 - $5,000/month",
    category: "Services",
    location: "Chicago, IL",
    postedBy: "Property Management Co",
    postedAt: "1 day ago",
    deadline: "Dec 10, 2024",
    status: "Open",
    responses: 15,
    isInterested: false,
  },
  {
    id: "4",
    title: "Marketing Materials Design",
    description: "Design and print marketing materials for product launch",
    budget: "$8,000 - $12,000",
    category: "Marketing",
    location: "Austin, TX",
    postedBy: "Creative Agency",
    postedAt: "2 days ago",
    deadline: "Dec 8, 2024",
    status: "Urgent",
    responses: 6,
    isInterested: true,
  },
]

interface RFQOpportunitiesSectionProps {
  onMessageCustomer?: (customerId: string) => void
}

export function RFQOpportunitiesSection({ onMessageCustomer }: RFQOpportunitiesSectionProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedRFQ, setSelectedRFQ] = useState<any>(null)
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)

  const categories = ["all", "Furniture", "Technology", "Services", "Marketing", "Office Supplies"]

  const filteredRFQs = mockRFQOpportunities.filter(rfq => {
    const matchesSearch = rfq.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rfq.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || rfq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleViewRFQ = (rfq: any) => {
    setSelectedRFQ(rfq)
    setIsQuoteModalOpen(true)
  }

  const handleShareQuote = (rfqId: string) => {
    console.log("Sharing quote for RFQ:", rfqId)
  }

  const handleAcceptRFQ = (rfqId: string) => {
    console.log("Accepting RFQ:", rfqId)
  }

  const handleMessageCustomer = (customerId: string) => {
    if (onMessageCustomer) {
      onMessageCustomer(customerId)
    } else {
      console.log("Messaging customer:", customerId)
    }
  }

  const handleToggleInterest = (rfqId: string) => {
    console.log("Toggling interest for RFQ:", rfqId)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">RFQ Opportunities</h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {filteredRFQs.length} opportunities found
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search RFQ opportunities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* RFQ Opportunities List */}
      <div className="space-y-4">
        {filteredRFQs.map((rfq) => (
          <div key={rfq.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{rfq.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    rfq.status === "Urgent" 
                      ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
                      : "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                  }`}>
                    {rfq.status}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-3">{rfq.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-medium">{rfq.budget}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4" />
                    <span>{rfq.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <User className="h-4 w-4" />
                    <span>{rfq.postedBy}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{rfq.budget}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {rfq.responses} responses
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Posted {rfq.postedAt}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Deadline: {rfq.deadline}</span>
                </div>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                  {rfq.category}
                </span>
              </div>
              
              <button
                onClick={() => handleToggleInterest(rfq.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  rfq.isInterested
                    ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-green-100 hover:text-green-600"
                }`}
              >
                {rfq.isInterested ? "Interested" : "Mark Interest"}
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleViewRFQ(rfq)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                <Eye className="h-4 w-4" />
                View Details
              </button>
              <button
                onClick={() => handleShareQuote(rfq.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                <CheckCircle className="h-4 w-4" />
                Share Quote
              </button>
              <button
                onClick={() => handleAcceptRFQ(rfq.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium"
              >
                <CheckCircle className="h-4 w-4" />
                Accept
              </button>
              <button
                onClick={() => handleMessageCustomer(rfq.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
              >
                <MessageSquare className="h-4 w-4" />
                Message
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Quote Modal */}
      {isQuoteModalOpen && selectedRFQ && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">RFQ Details</h3>
                <button
                  onClick={() => setIsQuoteModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{selectedRFQ.title}</h4>
                  <p className="text-gray-600 dark:text-gray-400">{selectedRFQ.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Budget:</span>
                    <p className="text-gray-600 dark:text-gray-400">{selectedRFQ.budget}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Location:</span>
                    <p className="text-gray-600 dark:text-gray-400">{selectedRFQ.location}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Posted By:</span>
                    <p className="text-gray-600 dark:text-gray-400">{selectedRFQ.postedBy}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Deadline:</span>
                    <p className="text-gray-600 dark:text-gray-400">{selectedRFQ.deadline}</p>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => handleShareQuote(selectedRFQ.id)}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                  >
                    Share Quote
                  </button>
                  <button
                    onClick={() => handleMessageCustomer(selectedRFQ.id)}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    Message Customer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
