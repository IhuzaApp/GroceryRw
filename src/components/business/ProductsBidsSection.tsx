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
  Tag,
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

const mockServiceRequests = [
  {
    id: "1",
    serviceName: "Corporate Catering Package",
    requesterName: "ABC Corporation",
    requestedBudget: `${formatCurrencySync(5000)}`,
    status: "Pending",
    submittedAt: "2 hours ago",
    message:
      "We are looking for corporate catering services for our annual company meeting next month. Need to accommodate 100 employees with dietary restrictions.",
    eventDate: "2024-03-15",
    eventType: "Corporate Meeting",
    estimatedGuests: 100,
    location: "Downtown Conference Center",
    contact: "+1-555-0123",
    email: "contact@abccorp.com",
  },
  {
    id: "2",
    serviceName: "Wedding Catering Service",
    requesterName: "Sarah & John Wedding",
    requestedBudget: `${formatCurrencySync(8000)}`,
    status: "Accepted",
    submittedAt: "1 day ago",
    message:
      "Planning a wedding reception for 150 guests in June. Looking for farm-to-table catering with vegetarian and vegan options. Need tastings scheduled.",
    eventDate: "2024-06-20",
    eventType: "Wedding Reception",
    estimatedGuests: 150,
    location: "Garden Venue",
    contact: "+1-555-0456",
    email: "sarah.john@email.com",
  },
  {
    id: "3",
    serviceName: "Fresh Grocery Delivery",
    requesterName: "Green Restaurant Group",
    requestedBudget: `${formatCurrencySync(2000)}/month`,
    status: "Rejected",
    submittedAt: "3 days ago",
    message:
      "Looking for weekly grocery delivery service for our 3 restaurant locations. Need fresh produce, dairy, and dry goods delivered every Monday morning.",
    eventDate: "Ongoing",
    eventType: "Restaurant Supply",
    estimatedGuests: null,
    location: "3 locations across the city",
    contact: "+1-555-0789",
    email: "procurement@greenrestaurant.com",
  },
  {
    id: "4",
    serviceName: "Corporate Catering Package",
    requesterName: "Tech Solutions Inc.",
    requestedBudget: `${formatCurrencySync(12000)}`,
    status: "Pending",
    submittedAt: "4 hours ago",
    message:
      "Need catering for our quarterly all-hands meeting. Approximately 200 employees with various dietary needs. Prefer buffet style with modern presentation.",
    eventDate: "2024-04-10",
    eventType: "Company Meeting",
    estimatedGuests: 200,
    location: "Tech Solutions HQ",
    contact: "+1-555-0321",
    email: "events@techsolutions.com",
  },
];

export function ProductsBidsSection() {
  const [activeSubTab, setActiveSubTab] = useState("products");
  const [selectedServiceRequest, setSelectedServiceRequest] = useState<any>(null);
  const [isServiceRequestModalOpen, setIsServiceRequestModalOpen] = useState(false);
  const [isCreateServiceOpen, setIsCreateServiceOpen] = useState(false);
  const [isServiceDetailsOpen, setIsServiceDetailsOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
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
        const idResponse = await fetch(
          "/api/queries/generate-product-query-id",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "service" }),
          }
        );
        const idData = await idResponse.json();
        if (!idResponse.ok) {
          throw new Error(idData.error || "Failed to generate query ID");
        }
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
      } else if (
        typeof serviceData.image === "string" &&
        serviceData.image.startsWith("data:")
      ) {
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
        console.error("Service creation error:", errorData);
        toast.error(
          errorData.message || errorData.error || "Failed to save service"
        );
      }
    } catch (error: any) {
      console.error("Error saving service:", error);
      toast.error(error.message || "Failed to save service");
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

  const handleViewServiceRequest = (serviceRequest: any) => {
    setSelectedServiceRequest(serviceRequest);
    setIsServiceRequestModalOpen(true);
  };

  const handleEditServiceRequest = (requestId: string) => {
    console.log("Editing service request:", requestId);
  };

  const handleAcceptServiceRequest = (requestId: string) => {
    console.log("Accepting service request:", requestId);
  };

  const handleRejectServiceRequest = (requestId: string) => {
    console.log("Rejecting service request:", requestId);
  };

  const handleMessageRequester = (requesterId: string) => {
    console.log("Messaging requester:", requesterId);
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
            { id: "service-requests", label: "Received Service Requests", icon: TrendingUp },
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
              <tab.icon
                className="h-4 w-4"
                style={
                  activeSubTab === tab.id ? { color: "#ffffff" } : undefined
                }
              />
              <span
                style={
                  activeSubTab === tab.id ? { color: "#ffffff" } : undefined
                }
              >
                {tab.label}
              </span>
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
            <div className="py-12 text-center">
              <Briefcase className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="mb-2 text-lg text-gray-500 dark:text-gray-400">
                No services yet
              </p>
              <p className="mb-6 text-sm text-gray-400 dark:text-gray-500">
                Add your first service to get started
              </p>
              <button
                onClick={handleCreateService}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
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
                            {service.maxOrders &&
                              ` | Max: ${service.maxOrders} ${
                                service.unit || ""
                              }`}
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
                          {service.speciality
                            .split(", ")
                            .map((specialty: string, index: number) => (
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
                        onClick={() => {
                          setSelectedService(service);
                          setIsServiceDetailsOpen(true);
                        }}
                        className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-green-100 px-3 py-2 text-sm text-green-700 transition-colors hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </button>
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

      {/* Service Requests Tab */}
      {activeSubTab === "service-requests" && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Received Service Requests
          </h3>

          <div className="space-y-4">
            {mockServiceRequests.map((serviceRequest) => (
              <div
                key={serviceRequest.id}
                className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {serviceRequest.serviceName}
                      </h4>
                      <span className="rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-600 dark:bg-purple-900 dark:text-purple-300">
                        {serviceRequest.eventType}
                      </span>
                    </div>
                    <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                      Requested by <span className="font-medium">{serviceRequest.requesterName}</span>
                    </p>
                    <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
                      {serviceRequest.message}
                    </p>

                    {/* Request Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                      {serviceRequest.eventDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Event: {serviceRequest.eventDate}</span>
                        </div>
                      )}
                      {serviceRequest.estimatedGuests && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{serviceRequest.estimatedGuests} guests</span>
                        </div>
                      )}
                      {serviceRequest.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{serviceRequest.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="mb-1 text-2xl font-bold text-gray-900 dark:text-white">
                      {serviceRequest.requestedBudget}
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        serviceRequest.status === "Accepted"
                          ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                          : serviceRequest.status === "Rejected"
                          ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
                          : "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300"
                      }`}
                    >
                      {serviceRequest.status}
                    </span>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {serviceRequest.contact}
                    </div>
                  </div>
                </div>

                <div className="mb-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>Submitted {serviceRequest.submittedAt}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewServiceRequest(serviceRequest)}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </button>

                  {serviceRequest.status === "Pending" && (
                    <>
                      <button
                        onClick={() => handleAcceptServiceRequest(serviceRequest.id)}
                        className="flex-1 rounded-lg bg-green-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600"
                        style={{ color: "#ffffff" }}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectServiceRequest(serviceRequest.id)}
                        className="flex-1 rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => handleMessageRequester(serviceRequest.id)}
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

      {/* Service Request Details Modal */}
      {isServiceRequestModalOpen && selectedServiceRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl dark:bg-gray-800">
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Service Request Details
                </h3>
                <button
                  onClick={() => setIsServiceRequestModalOpen(false)}
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
                {/* Requester Info */}
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                  <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
                    {selectedServiceRequest.requesterName}
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                    {selectedServiceRequest.eventDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Event Date: {selectedServiceRequest.eventDate}</span>
                      </div>
                    )}
                    {selectedServiceRequest.estimatedGuests && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>Guests: {selectedServiceRequest.estimatedGuests}</span>
                      </div>
                    )}
                    {selectedServiceRequest.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>Location: {selectedServiceRequest.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span>Contact: {selectedServiceRequest.contact}</span>
                    </div>
                    {selectedServiceRequest.email && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs">Email: {selectedServiceRequest.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Service Request Details */}
                <div>
                  <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
                    Request Information
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Service:
                      </span>
                      <span className="font-medium">
                        {selectedServiceRequest.serviceName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Requested Budget:
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        {selectedServiceRequest.requestedBudget}
                      </span>
                    </div>
                    {selectedServiceRequest.eventType && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Event Type:
                        </span>
                        <span className="font-medium">
                          {selectedServiceRequest.eventType}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Status:
                      </span>
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          selectedServiceRequest.status === "Accepted"
                            ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                            : selectedServiceRequest.status === "Rejected"
                            ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
                            : "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300"
                        }`}
                      >
                        {selectedServiceRequest.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Submitted:
                      </span>
                      <span>{selectedServiceRequest.submittedAt}</span>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
                    Message from Requester
                  </h4>
                  <p className="rounded-lg bg-gray-50 p-3 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                    {selectedServiceRequest.message}
                  </p>
                </div>

                {/* Actions */}
                {selectedServiceRequest.status === "Pending" && (
                  <div className="flex gap-3 border-t border-gray-200 pt-4 dark:border-gray-600">
                    <button
                      onClick={() => {
                        handleAcceptServiceRequest(selectedServiceRequest.id);
                        setIsServiceRequestModalOpen(false);
                      }}
                      className="flex-1 rounded-lg bg-green-500 px-4 py-2 font-medium text-white transition-colors hover:bg-green-600"
                      style={{ color: "#ffffff" }}
                    >
                      Accept Request
                    </button>
                    <button
                      onClick={() => {
                        handleRejectServiceRequest(selectedServiceRequest.id);
                        setIsServiceRequestModalOpen(false);
                      }}
                      className="flex-1 rounded-lg bg-red-500 px-4 py-2 font-medium text-white transition-colors hover:bg-red-600"
                    >
                      Reject Request
                    </button>
                    <button
                      onClick={() => {
                        handleMessageRequester(selectedServiceRequest.id);
                        setIsServiceRequestModalOpen(false);
                      }}
                      className="flex-1 rounded-lg bg-blue-500 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-600"
                    >
                      Message Requester
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

      {/* Service Details Modal */}
      {isServiceDetailsOpen && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-2xl dark:bg-gray-800">
            <div className="flex flex-col">
              {/* Header */}
              <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-6 w-6 text-blue-500" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Service Details
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setIsServiceDetailsOpen(false);
                    setSelectedService(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
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

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* Service Name & Status */}
                  <div>
                    <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                      {selectedService.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-medium ${
                          selectedService.status === "active"
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300"
                        }`}
                      >
                        {selectedService.status === "active"
                          ? "Active"
                          : "Inactive"}
                      </span>
                      {selectedService.query_id && (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                          ID: {selectedService.query_id}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Price
                    </span>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrencySync(
                          parseFloat(selectedService.price || "0")
                        )}
                      </span>
                      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                        / {selectedService.unit || "unit"}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {selectedService.Description && (
                    <div>
                      <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Description
                      </h4>
                      <div
                        className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        dangerouslySetInnerHTML={{
                          __html: selectedService.Description,
                        }}
                        style={{
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      />
                    </div>
                  )}

                  {/* Service Details Grid */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {selectedService.minimumOrders && (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50">
                        <div className="mb-1 flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            Minimum Orders
                          </span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {selectedService.minimumOrders}{" "}
                          {selectedService.unit || ""}
                        </p>
                      </div>
                    )}

                    {selectedService.maxOrders && (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50">
                        <div className="mb-1 flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            Maximum Orders
                          </span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {selectedService.maxOrders}{" "}
                          {selectedService.unit || ""}
                        </p>
                      </div>
                    )}

                    {selectedService.delveryArea && (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50">
                        <div className="mb-1 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            Delivery Area
                          </span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {selectedService.delveryArea}
                        </p>
                      </div>
                    )}

                    {selectedService.speciality && (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50">
                        <div className="mb-2 flex items-center gap-2">
                          <Tag className="h-4 w-4 text-gray-500" />
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            Specialities
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {selectedService.speciality
                            .split(", ")
                            .map((specialty: string, index: number) => (
                              <span
                                key={index}
                                className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                              >
                                {specialty}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Service Image */}
                  {selectedService.Image && (
                    <div>
                      <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Service Image/Attachment
                      </h4>
                      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                        <img
                          src={selectedService.Image}
                          alt={selectedService.name}
                          className="h-auto max-h-96 w-full object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                <div class="flex items-center justify-center p-8 bg-gray-100 dark:bg-gray-700">
                                  <span class="text-gray-500 dark:text-gray-400">Document/Image not available</span>
                                </div>
                              `;
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-shrink-0 items-center justify-end gap-3 border-t border-gray-200 p-6 dark:border-gray-700">
                <button
                  onClick={() => {
                    setIsServiceDetailsOpen(false);
                    setSelectedService(null);
                  }}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setIsServiceDetailsOpen(false);
                    handleEditService(selectedService);
                  }}
                  className="rounded-lg bg-blue-500 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-600"
                  style={{ color: "#ffffff" }}
                >
                  Edit Service
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
