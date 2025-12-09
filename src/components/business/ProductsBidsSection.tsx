"use client";

import { useState, useEffect } from "react";
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
  Briefcase,
  Loader2,
} from "lucide-react";
import { CreateProductForm } from "./CreateProductForm";
import { formatCurrencySync } from "../../utils/formatCurrency";
import toast from "react-hot-toast";

const mockProducts = [
  {
    id: "1",
    name: "Corporate Catering Package",
    description:
      "Complete catering service for corporate events, meetings, and conferences",
    price: `${formatCurrencySync(45)}/person`,
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
    price: `${formatCurrencySync(65)}/person`,
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
    price: `${formatCurrencySync(200)}/week`,
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
    price: `${formatCurrencySync(35)}/person`,
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
    price: `${formatCurrencySync(89)}/week`,
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
    bidAmount: `${formatCurrencySync(42)}/person`,
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
    bidAmount: `${formatCurrencySync(60)}/person`,
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
    bidAmount: `${formatCurrencySync(180)}/week`,
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
    bidAmount: `${formatCurrencySync(48)}/person`,
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
  const [isCreateServiceOpen, setIsCreateServiceOpen] = useState(false);
  const [businessAccount, setBusinessAccount] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [isBusinessAccount, setIsBusinessAccount] = useState(false);

  useEffect(() => {
    fetchBusinessAccount();
  }, []);

  useEffect(() => {
    if (activeSubTab === "products" && isBusinessAccount) {
      fetchServices();
    }
  }, [activeSubTab, isBusinessAccount]);

  const fetchBusinessAccount = async () => {
    try {
      const response = await fetch("/api/queries/check-business-account");
      if (response.ok) {
        const data = await response.json();
        if (data.hasAccount && data.account) {
          setBusinessAccount(data.account);
          setIsBusinessAccount(data.account.accountType === "business");
        }
      }
    } catch (error) {
      console.error("Error fetching business account:", error);
    }
  };

  const fetchServices = async () => {
    try {
      setLoadingServices(true);
      const response = await fetch("/api/queries/business-services");
      if (response.ok) {
        const data = await response.json();
        setServices(data.services || []);
      } else {
        toast.error("Failed to load services");
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Failed to load services");
    } finally {
      setLoadingServices(false);
    }
  };

  const handleCreateService = () => {
    setEditingService(null);
    setIsCreateServiceOpen(true);
  };


  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleServiceSubmit = async (serviceData: any) => {
    try {
      // Generate query ID first (only for new services)
      let queryId = "";
      if (!editingService) {
        const idResponse = await fetch("/api/queries/generate-product-query-id");
        const idData = await idResponse.json();
        queryId = idData.queryId;
      } else {
        queryId = editingService.query_id || "";
      }

      // Extract numeric price from formatted price (e.g., "$45/person" -> "45")
      let priceValue = serviceData.price || "0";
      if (typeof priceValue === "string") {
        // Remove currency symbols and extract number
        priceValue = priceValue.replace(/[^0-9.]/g, "");
      }

      // Convert image to base64 if provided
      let imageBase64 = "";
      if (serviceData.image && serviceData.image instanceof File) {
        imageBase64 = await convertFileToBase64(serviceData.image);
      } else if (typeof serviceData.image === "string" && serviceData.image.startsWith("data:")) {
        imageBase64 = serviceData.image;
      } else if (editingService?.Image) {
        // Keep existing image if editing and no new image provided
        imageBase64 = editingService.Image;
      }

      const payload = {
        name: serviceData.name,
        description: serviceData.description || "",
        price: priceValue,
        unit: serviceData.priceUnit || "service",
        query_id: queryId,
        store_id: null, // Services don't have store_id
        Plasbusiness_id: businessAccount?.id,
        status: serviceData.status === "Active" ? "active" : "inactive",
        minimumOrders: serviceData.minOrder || "0",
        maxOrders: serviceData.maxOrder || "",
        delveryArea: serviceData.deliveryArea || "",
        speciality: Array.isArray(serviceData.specialties)
          ? serviceData.specialties.filter((s: string) => s.trim()).join(", ")
          : serviceData.specialties || "",
        image: imageBase64,
      };

      const url = editingService
        ? "/api/mutations/update-business-product"
        : "/api/mutations/create-business-product";
      const method = editingService ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          ...(editingService && { product_id: editingService.id }),
        }),
      });

      if (response.ok) {
        toast.success(editingService ? "Service updated!" : "Service created!");
        setIsCreateServiceOpen(false);
        setEditingService(null);
        fetchServices();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to save service");
      }
    } catch (error) {
      console.error("Error saving service:", error);
      toast.error("Failed to save service");
    }
  };

  const handleEditService = (service: any) => {
    setEditingService(service);
    setIsCreateServiceOpen(true);
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
            ...(isBusinessAccount
              ? [{ id: "products", label: "My Services", icon: Briefcase }]
              : []),
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
              style={activeSubTab === tab.id ? { color: "#ffffff" } : undefined}
            >
              <tab.icon className="h-4 w-4" style={activeSubTab === tab.id ? { color: "#ffffff" } : undefined} />
              <span style={activeSubTab === tab.id ? { color: "#ffffff" } : undefined}>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Services Tab (renamed from Products) */}
      {activeSubTab === "products" && isBusinessAccount && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              My Services
            </h3>
            <button
              onClick={handleCreateService}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-white shadow-lg transition-all duration-300 hover:from-green-600 hover:to-emerald-600"
              style={{ color: "#ffffff" }}
            >
              <Plus className="h-4 w-4" style={{ color: "#ffffff" }} />
              <span style={{ color: "#ffffff" }}>Add Service</span>
            </button>
          </div>

          {/* Services Grid */}
          {loadingServices ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-green-500" />
              <span className="ml-3 text-gray-600 dark:text-gray-400">
                Loading services...
              </span>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                No services yet
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">
                Add your first service to get started
              </p>
              <button
                onClick={handleCreateService}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                style={{ color: "#ffffff" }}
              >
                <Plus className="h-5 w-5" style={{ color: "#ffffff" }} />
                <span style={{ color: "#ffffff" }}>Add Service</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-blue-500" />
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {service.name}
                        </h4>
                      </div>
                      {service.Description && (
                        <div 
                          className="mb-3 text-sm text-gray-600 dark:text-gray-400"
                          dangerouslySetInnerHTML={{ __html: service.Description }}
                        />
                      )}
                      <div className="mb-3 flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            service.status === "active"
                              ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                              : "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300"
                          }`}
                        >
                          {service.status === "active" ? "Active" : "Inactive"}
                        </span>
                        {service.query_id && (
                          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                            ID: {service.query_id}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrencySync(parseFloat(service.price || "0"))}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        / {service.unit || "unit"}
                      </span>
                    </div>

                    {/* Service Details */}
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      {service.minimumOrders && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>
                            Min: {service.minimumOrders} {service.unit || ""}
                            {service.maxOrders && ` | Max: ${service.maxOrders} ${service.unit || ""}`}
                          </span>
                        </div>
                      )}
                      {service.delveryArea && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{service.delveryArea}</span>
                        </div>
                      )}
                      {service.speciality && (
                        <div className="flex flex-wrap gap-1">
                          {service.speciality.split(", ").map((specialty: string, index: number) => (
                            <span
                              key={index}
                              className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleEditService(service)}
                        className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-blue-100 px-3 py-2 text-sm text-blue-700 transition-colors hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(service.id)}
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
          )}
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
                        style={{ color: "#ffffff" }}
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
                      style={{ color: "#ffffff" }}
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

      {/* Create/Edit Service Modal */}
      <CreateProductForm
        isOpen={isCreateServiceOpen}
        onClose={() => {
          setIsCreateServiceOpen(false);
          setEditingService(null);
        }}
        onSubmit={handleServiceSubmit}
        editingProduct={editingService}
        isService={true}
      />
    </div>
  );
}
