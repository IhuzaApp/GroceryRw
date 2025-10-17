"use client";

import { useState } from "react";
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  Calendar,
  TrendingUp,
  ChefHat,
  Utensils,
  ShoppingCart,
  Star,
  Clock,
  Users,
  MapPin,
} from "lucide-react";

const mockProducts = [
  {
    id: "1",
    name: "Corporate Catering Package",
    description:
      "Complete catering service for corporate events, meetings, and conferences",
    price: "$45/person",
    category: "Catering Services",
    status: "Active",
    bids: 8,
    views: 234,
    lastUpdated: "2 hours ago",
    rating: 4.8,
    minOrder: 20,
    maxOrder: 500,
    deliveryArea: "Downtown & Surrounding Areas",
    specialties: ["Corporate Events", "Meetings", "Conferences"],
  },
  {
    id: "2",
    name: "Wedding Catering Service",
    description:
      "Premium wedding catering with customizable menus and professional service",
    price: "$65/person",
    category: "Catering Services",
    status: "Active",
    bids: 15,
    views: 456,
    lastUpdated: "1 day ago",
    rating: 4.9,
    minOrder: 50,
    maxOrder: 300,
    deliveryArea: "City-wide",
    specialties: ["Weddings", "Receptions", "Anniversaries"],
  },
  {
    id: "3",
    name: "Fresh Grocery Delivery",
    description:
      "Daily fresh grocery delivery service for restaurants and cafes",
    price: "$200/week",
    category: "Grocery Services",
    status: "Active",
    bids: 12,
    views: 189,
    lastUpdated: "3 hours ago",
    rating: 4.7,
    minOrder: 1,
    maxOrder: 10,
    deliveryArea: "All Areas",
    specialties: ["Fresh Produce", "Daily Delivery", "Restaurant Supply"],
  },
  {
    id: "4",
    name: "Event Catering - Buffet Style",
    description: "Buffet-style catering for large events and celebrations",
    price: "$35/person",
    category: "Catering Services",
    status: "Draft",
    bids: 0,
    views: 67,
    lastUpdated: "2 days ago",
    rating: 4.6,
    minOrder: 30,
    maxOrder: 200,
    deliveryArea: "Metro Area",
    specialties: ["Buffet", "Large Events", "Celebrations"],
  },
  {
    id: "5",
    name: "Organic Grocery Box",
    description:
      "Weekly organic grocery subscription box for health-conscious customers",
    price: "$89/week",
    category: "Grocery Services",
    status: "Active",
    bids: 6,
    views: 123,
    lastUpdated: "4 hours ago",
    rating: 4.8,
    minOrder: 1,
    maxOrder: 5,
    deliveryArea: "City-wide",
    specialties: ["Organic", "Subscription", "Health Food"],
  },
];

const mockBids = [
  {
    id: "1",
    productName: "Corporate Catering Package",
    bidderName: "Elite Catering Co.",
    bidAmount: "$42/person",
    status: "Pending",
    submittedAt: "2 hours ago",
    message:
      "We can provide premium corporate catering with 15% discount for bulk orders. Our team has 10+ years experience in corporate events.",
    rating: 4.9,
    experience: "10+ years",
    specialties: ["Corporate Events", "Fine Dining"],
    deliveryTime: "2-3 days notice",
    contact: "+1-555-0123",
  },
  {
    id: "2",
    productName: "Wedding Catering Service",
    bidderName: "Garden Fresh Catering",
    bidAmount: "$60/person",
    status: "Accepted",
    submittedAt: "1 day ago",
    message:
      "Specializing in farm-to-table wedding catering with locally sourced ingredients. We can accommodate dietary restrictions and custom menus.",
    rating: 4.8,
    experience: "8+ years",
    specialties: ["Weddings", "Farm-to-Table", "Custom Menus"],
    deliveryTime: "1-2 weeks notice",
    contact: "+1-555-0456",
  },
  {
    id: "3",
    productName: "Fresh Grocery Delivery",
    bidderName: "Metro Grocery Supply",
    bidAmount: "$180/week",
    status: "Rejected",
    submittedAt: "3 days ago",
    message:
      "We offer daily fresh grocery delivery with competitive pricing and reliable service. Can provide bulk discounts for long-term contracts.",
    rating: 4.5,
    experience: "5+ years",
    specialties: ["Bulk Supply", "Daily Delivery", "Competitive Pricing"],
    deliveryTime: "Same day",
    contact: "+1-555-0789",
  },
  {
    id: "4",
    productName: "Corporate Catering Package",
    bidderName: "City Catering Solutions",
    bidAmount: "$48/person",
    status: "Pending",
    submittedAt: "4 hours ago",
    message:
      "Professional catering service with modern presentation and excellent customer service. We can handle events from 20 to 500 people.",
    rating: 4.7,
    experience: "12+ years",
    specialties: [
      "Large Events",
      "Modern Presentation",
      "Professional Service",
    ],
    deliveryTime: "3-5 days notice",
    contact: "+1-555-0321",
  },
];

export function ProductsBidsSection() {
  const [activeSubTab, setActiveSubTab] = useState("products");
  const [selectedBid, setSelectedBid] = useState<any>(null);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);

  const handleCreateProduct = () => {
    console.log("Creating new product");
  };

  const handleEditProduct = (productId: string) => {
    console.log("Editing product:", productId);
  };

  const handleDeleteProduct = (productId: string) => {
    console.log("Deleting product:", productId);
  };

  const handleViewProduct = (productId: string) => {
    console.log("Viewing product:", productId);
  };

  const handleViewBid = (bid: any) => {
    setSelectedBid(bid);
    setIsBidModalOpen(true);
  };

  const handleEditBid = (bidId: string) => {
    console.log("Editing bid:", bidId);
  };

  const handleAcceptBid = (bidId: string) => {
    console.log("Accepting bid:", bidId);
  };

  const handleRejectBid = (bidId: string) => {
    console.log("Rejecting bid:", bidId);
  };

  const handleMessageBidder = (bidderId: string) => {
    console.log("Messaging bidder:", bidderId);
  };

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="rounded-xl border border-gray-100 bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex space-x-2">
          {[
            { id: "products", label: "My Products", icon: Package },
            { id: "bids", label: "Received Bids", icon: TrendingUp },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 ${
                activeSubTab === tab.id
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
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
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              My Products & Services
            </h3>
            <button
              onClick={handleCreateProduct}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-white shadow-lg transition-all duration-300 hover:from-green-600 hover:to-emerald-600"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </button>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockProducts.map((product) => (
              <div
                key={product.id}
                className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      {product.category === "Catering Services" ? (
                        <ChefHat className="h-5 w-5 text-orange-500" />
                      ) : (
                        <ShoppingCart className="h-5 w-5 text-green-500" />
                      )}
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {product.name}
                      </h4>
                    </div>
                    <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                      {product.description}
                    </p>
                    <div className="mb-3 flex items-center gap-2">
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                        {product.category}
                      </span>
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          product.status === "Active"
                            ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                            : "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300"
                        }`}
                      >
                        {product.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {product.price}
                    </span>
                    <div className="flex items-center gap-1 text-sm text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="font-medium">{product.rating}</span>
                    </div>
                  </div>

                  {/* Service Details */}
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>
                        Min: {product.minOrder} | Max: {product.maxOrder}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{product.deliveryArea}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {product.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Updated {product.lastUpdated}</span>
                    <div className="flex items-center gap-4">
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

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleViewProduct(product.id)}
                      className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </button>
                    <button
                      onClick={() => handleEditProduct(product.id)}
                      className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-blue-100 px-3 py-2 text-sm text-blue-700 transition-colors hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
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
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Received Bids
          </h3>

          <div className="space-y-4">
            {mockBids.map((bid) => (
              <div
                key={bid.id}
                className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {bid.productName}
                      </h4>
                      <div className="flex items-center gap-1 text-sm text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="font-medium">{bid.rating}</span>
                      </div>
                    </div>
                    <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                      by <span className="font-medium">{bid.bidderName}</span>
                    </p>
                    <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
                      {bid.message}
                    </p>

                    {/* Bidder Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{bid.experience}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{bid.deliveryTime}</span>
                      </div>
                    </div>

                    {/* Specialties */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {bid.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="mb-1 text-2xl font-bold text-gray-900 dark:text-white">
                      {bid.bidAmount}
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        bid.status === "Accepted"
                          ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                          : bid.status === "Rejected"
                          ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
                          : "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300"
                      }`}
                    >
                      {bid.status}
                    </span>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {bid.contact}
                    </div>
                  </div>
                </div>

                <div className="mb-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>Submitted {bid.submittedAt}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewBid(bid)}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </button>

                  {bid.status === "Pending" && (
                    <>
                      <button
                        onClick={() => handleAcceptBid(bid.id)}
                        className="flex-1 rounded-lg bg-green-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectBid(bid.id)}
                        className="flex-1 rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => handleMessageBidder(bid.id)}
                    className="flex-1 rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
                  >
                    Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bid Details Modal */}
      {isBidModalOpen && selectedBid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl dark:bg-gray-800">
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Bid Details
                </h3>
                <button
                  onClick={() => setIsBidModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Bidder Info */}
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                  <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
                    {selectedBid.bidderName}
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>Rating: {selectedBid.rating}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Experience: {selectedBid.experience}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Delivery: {selectedBid.deliveryTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span>Contact: {selectedBid.contact}</span>
                    </div>
                  </div>
                </div>

                {/* Bid Details */}
                <div>
                  <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
                    Bid Information
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Product:
                      </span>
                      <span className="font-medium">
                        {selectedBid.productName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Bid Amount:
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        {selectedBid.bidAmount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Status:
                      </span>
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          selectedBid.status === "Accepted"
                            ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                            : selectedBid.status === "Rejected"
                            ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
                            : "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300"
                        }`}
                      >
                        {selectedBid.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Submitted:
                      </span>
                      <span>{selectedBid.submittedAt}</span>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
                    Message from Bidder
                  </h4>
                  <p className="rounded-lg bg-gray-50 p-3 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                    {selectedBid.message}
                  </p>
                </div>

                {/* Specialties */}
                <div>
                  <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
                    Specialties
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedBid.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                {selectedBid.status === "Pending" && (
                  <div className="flex gap-3 border-t border-gray-200 pt-4 dark:border-gray-600">
                    <button
                      onClick={() => {
                        handleAcceptBid(selectedBid.id);
                        setIsBidModalOpen(false);
                      }}
                      className="flex-1 rounded-lg bg-green-500 px-4 py-2 font-medium text-white transition-colors hover:bg-green-600"
                    >
                      Accept Bid
                    </button>
                    <button
                      onClick={() => {
                        handleRejectBid(selectedBid.id);
                        setIsBidModalOpen(false);
                      }}
                      className="flex-1 rounded-lg bg-red-500 px-4 py-2 font-medium text-white transition-colors hover:bg-red-600"
                    >
                      Reject Bid
                    </button>
                    <button
                      onClick={() => {
                        handleMessageBidder(selectedBid.id);
                        setIsBidModalOpen(false);
                      }}
                      className="flex-1 rounded-lg bg-blue-500 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-600"
                    >
                      Message Bidder
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
