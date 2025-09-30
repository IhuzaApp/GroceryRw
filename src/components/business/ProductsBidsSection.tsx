"use client"

import { useState } from "react"
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  Calendar,
  TrendingUp,
} from "lucide-react"

const mockProducts = [
  {
    id: "1",
    name: "Organic Vegetables Package",
    description: "Fresh organic vegetables sourced locally",
    price: "$299",
    category: "Food & Beverage",
    status: "Active",
    bids: 12,
    views: 156,
    lastUpdated: "2 hours ago",
  },
  {
    id: "2",
    name: "Office Supplies Bundle",
    description: "Complete office supplies package for small businesses",
    price: "$199",
    category: "Office Supplies",
    status: "Draft",
    bids: 0,
    views: 23,
    lastUpdated: "1 day ago",
  },
  {
    id: "3",
    name: "Cleaning Services",
    description: "Professional cleaning services for commercial spaces",
    price: "$150/hour",
    category: "Services",
    status: "Active",
    bids: 8,
    views: 89,
    lastUpdated: "3 hours ago",
  },
]

const mockBids = [
  {
    id: "1",
    productName: "Organic Vegetables Package",
    bidderName: "Green Farms Ltd",
    bidAmount: "$320",
    status: "Pending",
    submittedAt: "2 hours ago",
    message: "We can provide premium organic vegetables with certification",
  },
  {
    id: "2",
    productName: "Office Supplies Bundle",
    bidderName: "Office Solutions Inc",
    bidAmount: "$180",
    status: "Accepted",
    submittedAt: "1 day ago",
    message: "Bulk discount available for long-term contracts",
  },
  {
    id: "3",
    productName: "Cleaning Services",
    bidderName: "CleanPro Services",
    bidAmount: "$140/hour",
    status: "Rejected",
    submittedAt: "3 days ago",
    message: "Professional cleaning with eco-friendly products",
  },
]

export function ProductsBidsSection() {
  const [activeSubTab, setActiveSubTab] = useState("products")

  const handleCreateProduct = () => {
    console.log("Creating new product")
  }

  const handleEditProduct = (productId: string) => {
    console.log("Editing product:", productId)
  }

  const handleDeleteProduct = (productId: string) => {
    console.log("Deleting product:", productId)
  }

  const handleViewProduct = (productId: string) => {
    console.log("Viewing product:", productId)
  }

  const handleAcceptBid = (bidId: string) => {
    console.log("Accepting bid:", bidId)
  }

  const handleRejectBid = (bidId: string) => {
    console.log("Rejecting bid:", bidId)
  }

  const handleMessageBidder = (bidderId: string) => {
    console.log("Messaging bidder:", bidderId)
  }

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-2">
        <div className="flex space-x-2">
          {[
            { id: "products", label: "My Products", icon: Package },
            { id: "bids", label: "Received Bids", icon: TrendingUp },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeSubTab === tab.id
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Tab */}
      {activeSubTab === "products" && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">My Products & Services</h3>
            <button
              onClick={handleCreateProduct}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </button>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockProducts.map((product) => (
              <div key={product.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{product.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{product.description}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                        {product.category}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        product.status === "Active" 
                          ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                          : "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300"
                      }`}>
                        {product.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{product.price}</span>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        {product.bids} bids
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {product.views} views
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Updated {product.lastUpdated}</span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleViewProduct(product.id)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </button>
                    <button
                      onClick={() => handleEditProduct(product.id)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bids Tab */}
      {activeSubTab === "bids" && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Received Bids</h3>
          
          <div className="space-y-4">
            {mockBids.map((bid) => (
              <div key={bid.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{bid.productName}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">by {bid.bidderName}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{bid.message}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{bid.bidAmount}</div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      bid.status === "Accepted" 
                        ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                        : bid.status === "Rejected"
                        ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
                        : "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300"
                    }`}>
                      {bid.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <span>Submitted {bid.submittedAt}</span>
                </div>

                {bid.status === "Pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptBid(bid.id)}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                    >
                      Accept Bid
                    </button>
                    <button
                      onClick={() => handleRejectBid(bid.id)}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                    >
                      Reject Bid
                    </button>
                    <button
                      onClick={() => handleMessageBidder(bid.id)}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                      Message
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
