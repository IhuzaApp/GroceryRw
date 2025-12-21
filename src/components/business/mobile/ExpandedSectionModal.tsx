"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Search,
  FileText,
  ShoppingCart,
  Package,
  Store,
  Briefcase,
  X,
  Calendar,
  MapPin,
  Clock,
  Eye,
  Edit,
  Filter,
  ChevronDown,
  Image as ImageIcon,
  Trash2,
  CheckCircle,
  XCircle,
  User,
  Phone,
  Mail,
  DollarSign,
  Truck,
  CreditCard,
  Download,
  Building,
  MessageSquare,
  Star,
  AlertCircle,
  Package as PackageIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { formatCurrencySync } from "../../../utils/formatCurrency";

interface ExpandedSectionModalProps {
  sectionId: string;
  onClose: () => void;
  data: {
    rfqs: any[];
    quotes: any[];
    orders: any[];
    services: any[];
    stores: any[];
    contracts: any[];
  };
  loading: boolean;
  businessAccount?: any;
  router: any;
  onEditProduct?: (product: any, storeId: string) => void; // Callback to open edit modal
}

export function ExpandedSectionModal({
  sectionId,
  onClose,
  data,
  loading,
  businessAccount,
  router,
  onEditProduct,
}: ExpandedSectionModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [storeProducts, setStoreProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);
  const [quoteActiveTab, setQuoteActiveTab] = useState("overview");

  const sectionTitles: Record<string, string> = {
    rfqs: "My RFQs",
    quotes: "Quotes",
    orders: "Orders",
    services: "Services",
    stores: "Stores",
    contracts: "Contracts",
  };

  const sectionIcons: Record<string, any> = {
    rfqs: FileText,
    quotes: ShoppingCart,
    orders: Package,
    services: Briefcase,
    stores: Store,
    contracts: FileText,
  };

  const Icon = sectionIcons[sectionId] || FileText;
  const title = sectionTitles[sectionId] || "Details";
  const allItems = data[sectionId as keyof typeof data] || [];

  // Filter options based on section
  const filterOptions = useMemo(() => {
    if (sectionId === "rfqs") {
      return [
        { value: "all", label: "All RFQs" },
        { value: "open", label: "Open" },
        { value: "closed", label: "Closed" },
      ];
    }
    if (sectionId === "quotes") {
      return [
        { value: "all", label: "All Quotes" },
        { value: "pending", label: "Pending" },
        { value: "accepted", label: "Accepted" },
        { value: "rejected", label: "Rejected" },
      ];
    }
    if (sectionId === "orders") {
      return [
        { value: "all", label: "All Orders" },
        { value: "pending", label: "Pending" },
        { value: "active", label: "Active" },
        { value: "completed", label: "Completed" },
      ];
    }
    if (sectionId === "contracts") {
      return [
        { value: "all", label: "All Contracts" },
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ];
    }
    return [{ value: "all", label: "All" }];
  }, [sectionId]);

  // Filter and search items
  const filteredItems = useMemo(() => {
    let filtered = [...allItems];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((item) => {
        if (sectionId === "rfqs") {
          return (
            item.title?.toLowerCase().includes(term) ||
            item.description?.toLowerCase().includes(term) ||
            item.category?.toLowerCase().includes(term)
          );
        }
        if (sectionId === "quotes") {
          return (
            item.rfq?.title?.toLowerCase().includes(term) ||
            item.message?.toLowerCase().includes(term) ||
            item.qouteAmount?.toString().includes(term)
          );
        }
        if (sectionId === "orders") {
          return item.id?.toLowerCase().includes(term);
        }
        if (sectionId === "services") {
          return (
            item.name?.toLowerCase().includes(term) ||
            item.Description?.toLowerCase().includes(term)
          );
        }
        if (sectionId === "stores") {
          return (
            item.name?.toLowerCase().includes(term) ||
            item.description?.toLowerCase().includes(term)
          );
        }
        if (sectionId === "contracts") {
          return item.id?.toLowerCase().includes(term);
        }
        return true;
      });
    }

    // Apply status filter
    if (selectedFilter !== "all") {
      filtered = filtered.filter((item) => {
        if (sectionId === "rfqs") {
          return selectedFilter === "open" ? item.open : !item.open;
        }
        if (sectionId === "quotes" || sectionId === "orders" || sectionId === "contracts") {
          return item.status?.toLowerCase() === selectedFilter.toLowerCase();
        }
        return true;
      });
    }

    return filtered;
  }, [allItems, searchTerm, selectedFilter, sectionId]);

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    setIsEditing(false);
    setQuoteActiveTab("overview"); // Reset tab when opening quote details
    // If it's a store, fetch products
    if (sectionId === "stores" && item.id) {
      fetchStoreProducts(item.id);
    } else if (sectionId === "orders" && item.id) {
      fetchOrderDetails(item.id);
    } else {
      setStoreProducts([]);
      setOrderDetails(null);
    }
  };

  const fetchStoreProducts = async (storeId: string) => {
    setLoadingProducts(true);
    try {
      const response = await fetch(`/api/queries/business-products?store_id=${storeId}`);
      if (response.ok) {
        const data = await response.json();
        setStoreProducts(data.products || []);
      }
    } catch (error) {
      console.error("Error fetching store products:", error);
      setStoreProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchOrderDetails = async (orderId: string) => {
    setLoadingOrderDetails(true);
    try {
      // Fetch from business-product-orders API (same as OrdersSection uses)
      const response = await fetch("/api/queries/business-product-orders");
      if (response.ok) {
        const data = await response.json();
        // Find the order with matching ID
        const order = data.orders?.find((o: any) => o.id === orderId);
        if (order) {
          setOrderDetails(order);
        } else {
          toast.error("Order not found");
          setOrderDetails(null);
        }
      } else {
        toast.error("Failed to load order details");
        setOrderDetails(null);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast.error("Failed to load order details");
      setOrderDetails(null);
    } finally {
      setLoadingOrderDetails(false);
    }
  };

  const handleBackToList = () => {
    setSelectedItem(null);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    setIsEditing(false);
  };

  const handleEditProduct = (product: any) => {
    if (onEditProduct && selectedItem) {
      // Close this modal and open edit modal
      onClose();
      onEditProduct(product, selectedItem.id);
    }
  };


  const handleDeleteProduct = async (product: any) => {
    if (!window.confirm(`Are you sure you want to disable "${product.name}"?`)) {
      return;
    }

    try {
      const response = await fetch("/api/mutations/update-business-product", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: product.id,
          name: product.name,
          description: product.Description || "",
          image: product.Image || "",
          price: product.price,
          unit: product.unit || "",
          status: "inactive", // Disable the product
          minimumOrders: product.minimumOrders || "0",
          maxOrders: product.maxOrders || "",
          delveryArea: product.delveryArea || "",
          store_id: selectedItem.id,
        }),
      });

      if (response.ok) {
        toast.success("Product disabled successfully");
        // Refresh products
        fetchStoreProducts(selectedItem.id);
      } else {
        toast.error("Failed to disable product");
      }
    } catch (error) {
      console.error("Error disabling product:", error);
      toast.error("Failed to disable product");
    }
  };

  // If viewing/editing an item
  if (selectedItem) {
    return (
      <div
        className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex flex-col"
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100vw",
          height: "100vh",
        }}
      >
        <div
          className="bg-white dark:bg-gray-800 rounded-t-3xl mt-[5vh] flex flex-col h-[92vh] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Item Detail Header */}
          <div className="bg-white dark:bg-gray-800 px-5 py-4 flex items-center justify-between rounded-t-3xl border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToList}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors active:scale-95"
              >
                <X className="h-5 w-5" />
              </button>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">View Details</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">{title}</p>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors active:scale-95"
              >
                <Edit className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Item Detail Content */}
          <div className="flex-1 overflow-y-auto pb-24 p-5">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedItem.title || selectedItem.name || ""}
                    className="w-full rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    defaultValue={selectedItem.description || selectedItem.Description || ""}
                    rows={4}
                    className="w-full rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleBackToList}
                    className="flex-1 px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {sectionId === "rfqs" && (
                  <>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                      <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                        {selectedItem.title || `RFQ #${selectedItem.id?.slice(0, 8)}`}
                      </h4>
                      <span
                        className={`inline-block px-3 py-1 rounded-md text-xs font-semibold ${
                          selectedItem.open
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                            : "bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {selectedItem.open ? "Open" : "Closed"}
                      </span>
                    </div>
                    {selectedItem.description && (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                        <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</h5>
                        <p className="text-gray-600 dark:text-gray-400">{selectedItem.description}</p>
                      </div>
                    )}
                    {selectedItem.category && (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                        <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Category</h5>
                        <p className="text-gray-600 dark:text-gray-400">{selectedItem.category}</p>
                      </div>
                    )}
                    {selectedItem.location && (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                        <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Location</h5>
                        <p className="text-gray-600 dark:text-gray-400">{selectedItem.location}</p>
                      </div>
                    )}
                  </>
                )}

                {sectionId === "quotes" && (() => {
                  // Transform quote data similar to desktop version
                  const transformQuote = (quote: any) => {
                    const attachments = [
                      quote.attachement,
                      quote.attachment_1,
                      quote.attachment_2,
                    ].filter((att) => att && att.trim() !== "");

                    const rfqRequester = quote.bussines_RFQ?.business_account;
                    const myBusiness = quote.business_account;
                    const rfq = quote.bussines_RFQ || quote.businessRfq || quote.rfq;

                    const getValue = (value: any, defaultValue: string = "") => {
                      if (value === null || value === undefined || value === "") {
                        return defaultValue;
                      }
                      return String(value);
                    };

                    const formatDate = (dateString: string) => {
                      if (!dateString) return "Not specified";
                      const date = new Date(dateString);
                      return date.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                    };

                    const formatCurrency = (amount: string, currency: string) => {
                      try {
                        return new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: currency || "RWF",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        }).format(parseFloat(amount));
                      } catch {
                        return `${amount} ${currency || "RWF"}`;
                      }
                    };

                    return {
                      id: quote.id,
                      title: getValue(rfq?.title, "RFQ Quote"),
                      description: getValue(rfq?.description),
                      category: getValue(rfq?.category),
                      location: getValue(rfq?.location),
                      minBudget: getValue(rfq?.min_budget),
                      maxBudget: getValue(rfq?.max_budget),
                      responseDate: getValue(rfq?.response_date),
                      urgencyLevel: getValue(rfq?.urgency_level),
                      estimatedQuantity: getValue(rfq?.estimated_quantity),
                      expectedDeliveryDate: getValue(rfq?.expected_delivery_date),
                      requirements: rfq?.requirements || null,
                      notes: getValue(rfq?.notes),
                      rfqContactName: getValue(rfq?.contact_name),
                      rfqEmail: getValue(rfq?.email),
                      rfqPhone: getValue(rfq?.phone),
                      rfqCreatedAt: getValue(rfq?.created_at),
                      totalPrice: quote.qouteAmount ? formatCurrency(quote.qouteAmount, quote.currency) : "N/A",
                      currency: quote.currency || "RWF",
                      deliveryTime: quote.delivery_time || "Not specified",
                      validUntil: quote.quote_validity || "Not specified",
                      status: quote.status || "pending",
                      submittedDate: formatDate(quote.created_at),
                      updatedDate: formatDate(quote.updated_at),
                      quoteMessage: quote.message || "",
                      attachments: attachments,
                      rfqRequester: {
                        name: getValue(
                          rfqRequester?.business_name || rfq?.contact_name,
                          "Unknown Business"
                        ),
                        email: getValue(rfqRequester?.business_email || rfq?.email),
                        phone: getValue(rfqRequester?.business_phone || rfq?.phone),
                        location: getValue(rfqRequester?.business_location || rfq?.location),
                        accountType: getValue(rfqRequester?.account_type),
                        status: getValue(rfqRequester?.status),
                        id: getValue(rfqRequester?.id),
                      },
                      myBusiness: {
                        name: myBusiness?.business_name || "Unknown Business",
                        email: myBusiness?.business_email || "",
                        phone: myBusiness?.business_phone || "",
                        location: myBusiness?.business_location || "",
                        accountType: myBusiness?.account_type || "",
                        status: myBusiness?.status || "",
                        id: myBusiness?.id || "",
                      },
                      terms: {
                        paymentTerms: getValue(quote.PaymentTerms, "Not specified"),
                        deliveryTerms: getValue(quote.DeliveryTerms, "Not specified"),
                        warranty: getValue(quote.warrantly, "Not specified"),
                        cancellationTerms: getValue(quote.cancellatioinTerms, "Not specified"),
                      },
                    };
                  };

                  const quote = transformQuote(selectedItem);

                  const downloadAttachment = (base64String: string, index: number) => {
                    try {
                      const [mimeType, base64Data] = base64String.split(",");
                      const byteCharacters = atob(base64Data);
                      const byteNumbers = new Array(byteCharacters.length);
                      for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                      }
                      const byteArray = new Uint8Array(byteNumbers);
                      const blob = new Blob([byteArray], {
                        type: mimeType.split(":")[1].split(";")[0],
                      });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = `quote-attachment-${index + 1}.${
                        blob.type.includes("pdf") ? "pdf" : "jpg"
                      }`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                    } catch (error) {
                      console.error("Error downloading attachment:", error);
                    }
                  };

                  return (
                    <>
                      {/* Header */}
                      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-5 py-4 mb-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="mb-3 flex items-center gap-3">
                              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 shadow-md">
                                <FileText className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h2 className="text-lg font-bold leading-tight text-gray-900 dark:text-white line-clamp-2">
                                  {quote.title}
                                </h2>
                              </div>
                            </div>
                            <div className="ml-14 flex items-center gap-2 rounded-xl bg-gray-50 dark:bg-gray-700/50 px-3 py-2 border border-gray-200 dark:border-gray-600">
                              <Building className="h-4 w-4 flex-shrink-0 text-gray-600 dark:text-gray-400" />
                              <span className="truncate text-sm font-semibold text-gray-700 dark:text-gray-300">
                                {quote.rfqRequester?.name || "Unknown Business"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Tabs */}
                      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 px-5 pb-3 pt-0 shadow-sm mb-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="scrollbar-hide flex space-x-2 overflow-x-auto pb-2">
                          {[
                            { id: "overview", label: "Overview", icon: FileText, shortLabel: "Overview" },
                            { id: "rfq", label: "RFQ Details", icon: FileText, shortLabel: "RFQ" },
                            { id: "requester", label: "RFQ Requester", icon: Building, shortLabel: "Requester" },
                            { id: "quote", label: "My Quote", icon: DollarSign, shortLabel: "Quote" },
                            { id: "terms", label: "Terms & Conditions", icon: FileText, shortLabel: "Terms" },
                          ].map((tab) => (
                            <button
                              key={tab.id}
                              onClick={() => setQuoteActiveTab(tab.id)}
                              className={`group flex flex-shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-200 active:scale-95 ${
                                quoteActiveTab === tab.id
                                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/40"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                              }`}
                              style={
                                quoteActiveTab === tab.id ? { color: "#ffffff" } : undefined
                              }
                            >
                              <tab.icon
                                className="h-4 w-4 transition-transform duration-200"
                                style={
                                  quoteActiveTab === tab.id ? { color: "#ffffff" } : undefined
                                }
                              />
                              <span
                                className="whitespace-nowrap"
                                style={
                                  quoteActiveTab === tab.id ? { color: "#ffffff" } : undefined
                                }
                              >
                                {tab.shortLabel}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Tab Content */}
                      <div className="px-5 pb-4 space-y-4">
                        {quoteActiveTab === "overview" && (
                          <div className="space-y-4 -mx-5 px-5">
                            <div className="grid grid-cols-1 gap-4">
                              {/* Quote Summary */}
                              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-5 py-4 dark:from-green-900/20 dark:to-emerald-900/20">
                                  <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                                    <DollarSign className="h-5 w-5 text-green-600" />
                                    Quote Summary
                                  </h3>
                                </div>
                                <div className="space-y-4 p-5">
                                  <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 p-4 dark:from-green-900/20 dark:to-emerald-900/20">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                        Total Price
                                      </span>
                                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {quote.totalPrice}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                                      <span className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                                        <Truck className="h-4 w-4 text-green-600" />
                                        Delivery Time
                                      </span>
                                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {quote.deliveryTime}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                                      <span className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                                        <Calendar className="h-4 w-4 text-orange-500" />
                                        Valid Until
                                      </span>
                                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {quote.validUntil}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                        Currency
                                      </span>
                                      <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-600 dark:text-gray-300">
                                        {quote.currency}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                        Status
                                      </span>
                                      <span
                                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                          quote.status === "accepted"
                                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                            : quote.status === "rejected"
                                            ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                                        }`}
                                      >
                                        {quote.status?.charAt(0).toUpperCase() +
                                          quote.status?.slice(1) || "Pending"}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                        Submitted
                                      </span>
                                      <span className="text-xs text-gray-700 dark:text-gray-300">
                                        {quote.submittedDate}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* RFQ Requester Quick Info */}
                              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
                                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-5 py-4 dark:from-blue-900/20 dark:to-cyan-900/20">
                                  <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                                    <Building className="h-5 w-5 text-blue-600" />
                                    RFQ Requester
                                  </h3>
                                </div>
                                <div className="space-y-4 p-5">
                                  <div className="flex items-center gap-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-700/50">
                                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md">
                                      <Building className="h-7 w-7 text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <h4 className="truncate font-bold text-gray-900 dark:text-white">
                                        {quote.rfqRequester?.name || "Unknown Business"}
                                      </h4>
                                      <div className="mt-1 flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                                        <span className="truncate">
                                          {quote.rfqRequester?.location || "Not specified"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="space-y-2.5">
                                    <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                        <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                      </div>
                                      <span className="truncate text-sm text-gray-700 dark:text-gray-300">
                                        {quote.rfqRequester?.email || "Not provided"}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                                        <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                                      </div>
                                      <span className="truncate text-sm text-gray-700 dark:text-gray-300">
                                        {quote.rfqRequester?.phone || "Not provided"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Quote Message */}
                            {quote.quoteMessage && (
                              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-5 py-4 dark:from-purple-900/20 dark:to-pink-900/20">
                                  <h3 className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
                                    <MessageSquare className="h-5 w-5 text-purple-600" />
                                    Quote Message
                                  </h3>
                                </div>
                                <div className="p-5">
                                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                                    {quote.quoteMessage}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Attachments */}
                            {quote.attachments && quote.attachments.length > 0 && (
                              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
                                <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-4 dark:from-amber-900/20 dark:to-orange-900/20">
                                  <h3 className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
                                    <FileText className="h-5 w-5 text-amber-600" />
                                    Attachments ({quote.attachments.length})
                                  </h3>
                                </div>
                                <div className="space-y-2.5 p-5">
                                  {quote.attachments.map(
                                    (attachment: string, index: number) => (
                                      <button
                                        key={index}
                                        onClick={() => downloadAttachment(attachment, index)}
                                        className="flex w-full items-center justify-between rounded-xl border-2 border-gray-200 bg-gray-50 p-4 transition-all duration-200 hover:border-green-300 hover:bg-green-50 active:scale-95 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-green-700 dark:hover:bg-green-900/20"
                                      >
                                        <div className="flex items-center gap-3">
                                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                          </div>
                                          <span className="font-medium text-gray-700 dark:text-gray-300">
                                            Attachment {index + 1}
                                          </span>
                                        </div>
                                        <Download className="h-5 w-5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                                      </button>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {quoteActiveTab === "rfq" && (
                          <div className="space-y-4 -mx-5 px-5">
                            <div className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
                              <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                                RFQ Details
                              </h3>
                              <div className="space-y-6">
                                <div className="grid grid-cols-1 gap-6">
                                  <div className="space-y-4">
                                    <div>
                                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Title:
                                      </span>
                                      <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                                        {quote.title}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Description:
                                      </span>
                                      <p className="mt-1 whitespace-pre-wrap text-sm text-gray-900 dark:text-white">
                                        {quote.description || "Not provided"}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Category:
                                      </span>
                                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                        {quote.category || "Not specified"}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Location:
                                      </span>
                                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                        {quote.location || "Not specified"}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="space-y-4">
                                    <div>
                                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Budget Range:
                                      </span>
                                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                        {quote.minBudget && quote.maxBudget
                                          ? `${formatCurrencySync(
                                              parseFloat(quote.minBudget)
                                            )} - ${formatCurrencySync(
                                              parseFloat(quote.maxBudget)
                                            )}`
                                          : quote.minBudget
                                          ? `Min: ${formatCurrencySync(
                                              parseFloat(quote.minBudget)
                                            )}`
                                          : quote.maxBudget
                                          ? `Max: ${formatCurrencySync(
                                              parseFloat(quote.maxBudget)
                                            )}`
                                          : "Not specified"}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Response Deadline:
                                      </span>
                                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                        {quote.responseDate
                                          ? new Date(quote.responseDate).toLocaleDateString("en-US", {
                                              year: "numeric",
                                              month: "long",
                                              day: "numeric",
                                            })
                                          : "Not specified"}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Expected Delivery:
                                      </span>
                                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                        {quote.expectedDeliveryDate
                                          ? new Date(quote.expectedDeliveryDate).toLocaleDateString("en-US", {
                                              year: "numeric",
                                              month: "long",
                                              day: "numeric",
                                            })
                                          : "Not specified"}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Urgency Level:
                                      </span>
                                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                        {quote.urgencyLevel || "Not specified"}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Estimated Quantity:
                                      </span>
                                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                        {quote.estimatedQuantity || "Not specified"}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                {quote.notes && (
                                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                      Additional Notes:
                                    </span>
                                    <p className="mt-2 whitespace-pre-wrap text-sm text-gray-900 dark:text-white">
                                      {quote.notes}
                                    </p>
                                  </div>
                                )}
                                {quote.requirements && (
                                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                      Requirements:
                                    </span>
                                    <div className="mt-2 text-sm text-gray-900 dark:text-white">
                                      {typeof quote.requirements === "string" ? (
                                        <p className="whitespace-pre-wrap">{quote.requirements}</p>
                                      ) : Array.isArray(quote.requirements) ? (
                                        <ul className="list-inside list-disc space-y-1">
                                          {quote.requirements.map((req: any, idx: number) => (
                                            <li key={idx}>
                                              {typeof req === "string" ? req : JSON.stringify(req)}
                                            </li>
                                          ))}
                                        </ul>
                                      ) : (
                                        <p>{JSON.stringify(quote.requirements)}</p>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {quoteActiveTab === "requester" && (
                          <div className="space-y-4 -mx-5 px-5">
                            <div className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
                              <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                                RFQ Requester Company Information
                              </h3>
                              <div className="space-y-6">
                                <div className="grid grid-cols-1 gap-6">
                                  <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-900 dark:text-white">
                                      Company Details
                                    </h4>
                                    <div className="space-y-3">
                                      <div>
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                          Business Name:
                                        </span>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                          {quote.rfqRequester?.name || "Not provided"}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                          Account Type:
                                        </span>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                          {quote.rfqRequester?.accountType || "Not specified"}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                          Status:
                                        </span>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                          {quote.rfqRequester?.status || "Not specified"}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-900 dark:text-white">
                                      Contact Information
                                    </h4>
                                    <div className="space-y-3">
                                      <div>
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                          Email:
                                        </span>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                          {quote.rfqRequester?.email || quote.rfqEmail || "Not provided"}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                          Phone:
                                        </span>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                          {quote.rfqRequester?.phone || quote.rfqPhone || "Not provided"}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                          Location:
                                        </span>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                          {quote.rfqRequester?.location || quote.location || "Not provided"}
                                        </p>
                                      </div>
                                      {quote.rfqContactName && (
                                        <div>
                                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Contact Person:
                                          </span>
                                          <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                            {quote.rfqContactName}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {quoteActiveTab === "quote" && (
                          <div className="space-y-4">
                            <div className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
                              <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                                My Quote Details
                              </h3>
                              <div className="space-y-6">
                                <div className="grid grid-cols-1 gap-6">
                                  <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-900 dark:text-white">
                                      Quote Information
                                    </h4>
                                    <div className="space-y-3">
                                      <div>
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                          Quote Amount:
                                        </span>
                                        <p className="mt-1 text-lg font-bold text-green-600">
                                          {quote.totalPrice}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                          Currency:
                                        </span>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                          {quote.currency}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                          Delivery Time:
                                        </span>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                          {quote.deliveryTime}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                          Quote Validity:
                                        </span>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                          {quote.validUntil}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-900 dark:text-white">
                                      Status & Dates
                                    </h4>
                                    <div className="space-y-3">
                                      <div>
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                          Status:
                                        </span>
                                        <p
                                          className={`mt-1 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                            quote.status === "accepted"
                                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                              : quote.status === "rejected"
                                              ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                                              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                                          }`}
                                        >
                                          {quote.status?.charAt(0).toUpperCase() +
                                            quote.status?.slice(1) || "Pending"}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                          Submitted Date:
                                        </span>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                          {quote.submittedDate || "Not available"}
                                        </p>
                                      </div>
                                      {quote.updatedDate &&
                                        quote.updatedDate !== quote.submittedDate && (
                                          <div>
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                              Last Updated:
                                            </span>
                                            <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                              {quote.updatedDate}
                                            </p>
                                          </div>
                                        )}
                                    </div>
                                  </div>
                                </div>
                                {quote.quoteMessage && (
                                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                      Quote Message:
                                    </span>
                                    <p className="mt-2 whitespace-pre-wrap text-sm text-gray-900 dark:text-white">
                                      {quote.quoteMessage}
                                    </p>
                                  </div>
                                )}
                                {quote.attachments && quote.attachments.length > 0 && (
                                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                      Attachments ({quote.attachments.length}):
                                    </span>
                                    <div className="mt-3 space-y-2">
                                      {quote.attachments.map(
                                        (attachment: string, index: number) => (
                                          <button
                                            key={index}
                                            onClick={() => downloadAttachment(attachment, index)}
                                            className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                                          >
                                            <div className="flex items-center gap-2">
                                              <FileText className="h-4 w-4 text-gray-400" />
                                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                                Attachment {index + 1}
                                              </span>
                                            </div>
                                            <Download className="h-4 w-4 text-gray-400" />
                                          </button>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {quoteActiveTab === "terms" && (
                          <div className="space-y-4 -mx-5 px-5">
                            <div className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
                              <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                                Terms & Conditions
                              </h3>
                              <div className="space-y-6">
                                <div className="grid grid-cols-1 gap-6">
                                  <div className="space-y-4">
                                    <div>
                                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Payment Terms:
                                      </span>
                                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                        {quote.terms?.paymentTerms || "Not specified"}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Delivery Terms:
                                      </span>
                                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                        {quote.terms?.deliveryTerms || "Not specified"}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="space-y-4">
                                    <div>
                                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Warranty:
                                      </span>
                                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                        {quote.terms?.warranty || "Not specified"}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Cancellation Terms:
                                      </span>
                                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                        {quote.terms?.cancellationTerms || "Not specified"}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}

                {sectionId === "orders" && (
                  <>
                    {loadingOrderDetails ? (
                      <div className="flex items-center justify-center py-16">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
                          <p className="text-gray-600 dark:text-gray-400">Loading order details...</p>
                        </div>
                      </div>
                    ) : orderDetails ? (
                      <>
                        {/* Order Header - Premium Design */}
                        <div className="bg-gradient-to-br from-green-800 via-green-700 to-emerald-800 dark:from-green-900 dark:via-green-800 dark:to-emerald-900 rounded-2xl p-5 mb-4 shadow-xl relative overflow-hidden">
                          {/* Decorative Pattern */}
                          <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -ml-12 -mb-12"></div>
                          </div>
                          
                          <div className="relative z-10">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                                    <ShoppingCart className="h-6 w-6 text-white" style={{ color: "#ffffff" }} />
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#ffffff" }}>
                                      Order ID
                                    </p>
                                    <h4 className="font-bold text-2xl mt-1 font-mono" style={{ color: "#ffffff" }}>
                                      {orderDetails.allProducts?.[0]?.query_id ||
                                        orderDetails.query_id ||
                                        orderDetails.orderId ||
                                        orderDetails.id?.slice(0, 8) ||
                                        "N/A"}
                                    </h4>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm" style={{ color: "#ffffff" }}>
                                  <Calendar className="h-4 w-4" style={{ color: "#ffffff" }} />
                                  <span>
                                    {orderDetails.created_at
                                      ? new Date(orderDetails.created_at).toLocaleString()
                                      : "Date not available"}
                                  </span>
                                </div>
                              </div>
                              <span
                                className={`px-4 py-2 rounded-xl text-xs font-bold shadow-lg ${
                                  orderDetails.status === "completed" || orderDetails.status === "Delivered"
                                    ? "bg-green-500"
                                    : orderDetails.status === "pending" || orderDetails.status === "Pending"
                                    ? "bg-yellow-500"
                                    : orderDetails.status === "cancelled" || orderDetails.status === "Cancelled"
                                    ? "bg-red-500"
                                    : "bg-blue-500"
                                }`}
                                style={{ color: "#ffffff" }}
                              >
                                {orderDetails.status?.toUpperCase() || "ACTIVE"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Customer Information - Enhanced Design */}
                        {orderDetails.orderedBy && (
                          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 mb-4 border-2 border-gray-200 dark:border-gray-700 shadow-lg">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30">
                                <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                              </div>
                              <h5 className="font-bold text-lg text-gray-900 dark:text-white">
                                Customer Information
                              </h5>
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                <div className="p-2 rounded-lg bg-white dark:bg-gray-600">
                                  <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                    Name
                                  </p>
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                                    {orderDetails.orderedBy.name || "N/A"}
                                  </p>
                                </div>
                              </div>
                              {orderDetails.orderedBy.email && (
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                  <div className="p-2 rounded-lg bg-white dark:bg-gray-600">
                                    <Mail className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                      Email
                                    </p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5 truncate">
                                      {orderDetails.orderedBy.email}
                                    </p>
                                  </div>
                                </div>
                              )}
                              {orderDetails.orderedBy.phone && (
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                  <div className="p-2 rounded-lg bg-white dark:bg-gray-600">
                                    <Phone className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                      Phone
                                    </p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                                      {orderDetails.orderedBy.phone}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Order Items */}
                        {orderDetails.Order_Items && orderDetails.Order_Items.length > 0 && (
                          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                            <h5 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                              <Package className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                              Order Items ({orderDetails.Order_Items.length})
                            </h5>
                            <div className="space-y-3">
                              {orderDetails.Order_Items.map((item: any, index: number) => (
                                <div
                                  key={item.id || index}
                                  className="flex gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600"
                                >
                                  {item.product?.image || item.product?.ProductName?.image ? (
                                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600 flex-shrink-0">
                                      <img
                                        src={item.product.image || item.product.ProductName?.image}
                                        alt={item.product?.ProductName?.name || "Product"}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          e.currentTarget.style.display = "none";
                                          e.currentTarget.nextElementSibling?.classList.remove("hidden");
                                        }}
                                      />
                                      <Package className="h-8 w-8 text-gray-400 hidden" />
                                    </div>
                                  ) : (
                                    <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                                      <Package className="h-8 w-8 text-gray-400" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <h6 className="font-semibold text-gray-900 dark:text-white mb-1">
                                      {item.product?.ProductName?.name || item.product?.name || "Product"}
                                    </h6>
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Qty: {item.quantity}
                                      </span>
                                      <span className="text-sm font-bold text-green-600 dark:text-green-400">
                                        {item.price || item.product?.price || "0"} RF
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Delivery Address - Enhanced Design */}
                        {orderDetails.deliveryAddress && (
                          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 mb-4 border-2 border-gray-200 dark:border-gray-700 shadow-lg">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-3 rounded-xl bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30">
                                <MapPin className="h-6 w-6 text-red-600 dark:text-red-400" />
                              </div>
                              <h5 className="font-bold text-lg text-gray-900 dark:text-white">
                                Delivery Address
                              </h5>
                            </div>
                            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white leading-relaxed">
                                {orderDetails.deliveryAddress}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Order Summary - Premium Design */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 mb-4 border-2 border-gray-200 dark:border-gray-700 shadow-lg">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 shadow-md">
                              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <h5 className="font-bold text-lg text-gray-900 dark:text-white">
                              Order Summary
                            </h5>
                          </div>
                          <div className="space-y-3">
                            {orderDetails.service_fee && (
                              <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 shadow-sm">
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                  Service Fee
                                </span>
                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                  {formatCurrencySync(parseFloat(orderDetails.service_fee.toString()))}
                                </span>
                              </div>
                            )}
                            {orderDetails.transportation_fee && (
                              <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 shadow-sm">
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                  Transportation Fee
                                </span>
                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                  {formatCurrencySync(parseFloat(orderDetails.transportation_fee.toString()))}
                                </span>
                              </div>
                            )}
                            <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-4 mt-4">
                              <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg">
                                <span className="text-base font-bold" style={{ color: "#ffffff" }}>Total Amount</span>
                                <span className="text-2xl font-bold" style={{ color: "#ffffff" }}>
                                  {orderDetails.value
                                    ? formatCurrencySync(parseFloat(orderDetails.value.toString()))
                                    : formatCurrencySync(0)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Delivery Information - Enhanced Design */}
                        {(orderDetails.deliveryDate || orderDetails.deliveryTime || orderDetails.comment) && (
                          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 mb-4 border-2 border-gray-200 dark:border-gray-700 shadow-lg">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30">
                                <Truck className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                              </div>
                              <h5 className="font-bold text-lg text-gray-900 dark:text-white">
                                Delivery Information
                              </h5>
                            </div>
                            <div className="space-y-3">
                              {orderDetails.deliveryDate && (
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                  <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                                  <div className="flex-1">
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                      Delivery Date
                                    </p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                                      {orderDetails.deliveryDate}
                                    </p>
                                  </div>
                                </div>
                              )}
                              {orderDetails.deliveryTime && (
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                  <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                                  <div className="flex-1">
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                      Delivery Time
                                    </p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                                      {orderDetails.deliveryTime}
                                    </p>
                                  </div>
                                </div>
                              )}
                              {orderDetails.comment && (
                                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                                    Order Comment
                                  </p>
                                  <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {orderDetails.comment}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Store Information - Enhanced Design */}
                        {orderDetails.store && (
                          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border-2 border-gray-200 dark:border-gray-700 shadow-lg">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
                                <Store className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                              </div>
                              <h5 className="font-bold text-lg text-gray-900 dark:text-white">
                                Store Information
                              </h5>
                            </div>
                            <div className="space-y-3">
                              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                                  Store Name
                                </p>
                                <p className="text-base font-bold text-gray-900 dark:text-white">
                                  {orderDetails.store}
                                </p>
                              </div>
                              {orderDetails.store_image && (
                                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                  <img
                                    src={orderDetails.store_image}
                                    alt={orderDetails.store}
                                    className="w-full h-32 rounded-lg object-cover"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Shopper Information */}
                        {orderDetails.shopper && (
                          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border-2 border-gray-200 dark:border-gray-700 shadow-lg">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30">
                                <Truck className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                              </div>
                              <h5 className="font-bold text-lg text-gray-900 dark:text-white">
                                Assigned Shopper
                              </h5>
                            </div>
                            <div className="space-y-3">
                              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                                  Shopper Name
                                </p>
                                <p className="text-base font-bold text-gray-900 dark:text-white">
                                  {orderDetails.shopper.name || "Not assigned"}
                                </p>
                              </div>
                              {orderDetails.shopper.phone && (
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                  <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                  <div className="flex-1">
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                                      Phone
                                    </p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                      {orderDetails.shopper.phone}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-16">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <Package className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                          Order details not found
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Unable to load order details
                        </p>
                      </div>
                    )}
                  </>
                )}

                {sectionId === "services" && (
                  <>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                      <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                        {selectedItem.name}
                      </h4>
                      {selectedItem.price && (
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                          {selectedItem.price} {selectedItem.unit ? `/ ${selectedItem.unit}` : ""}
                        </p>
                      )}
                    </div>
                    {selectedItem.Description && (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                        <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</h5>
                        <p className="text-gray-600 dark:text-gray-400">{selectedItem.Description}</p>
                      </div>
                    )}
                  </>
                )}

                {sectionId === "stores" && (
                  <>
                    {/* Store Header - Minimal */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 mb-4 border border-green-200 dark:border-green-800/50">
                      <div className="flex items-center gap-3">
                        {selectedItem.image && (
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-white dark:bg-gray-700 flex-shrink-0">
                            <img
                              src={selectedItem.image}
                              alt={selectedItem.name || "Store"}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                e.currentTarget.nextElementSibling?.classList.remove("hidden");
                              }}
                            />
                            <Store className="h-8 w-8 text-gray-400 hidden" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                            {selectedItem.name || "Store"}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {storeProducts.length} {storeProducts.length === 1 ? "product" : "products"}
                          </p>
                        </div>
                        {selectedItem.is_active !== undefined && (
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                              selectedItem.is_active
                                ? "bg-green-500 text-white"
                                : "bg-gray-500 text-white"
                            }`}
                          >
                            {selectedItem.is_active ? "Active" : "Inactive"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Products Grid - Main Focus */}
                    {loadingProducts ? (
                      <div className="flex items-center justify-center py-16">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
                          <p className="text-gray-600 dark:text-gray-400">Loading products...</p>
                        </div>
                      </div>
                    ) : storeProducts.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <Package className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                          No products found
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          This store doesn't have any products yet
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {storeProducts.map((product: any) => (
                          <div
                            key={product.id}
                            className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:border-green-400 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-green-600"
                          >
                            {/* Image Section */}
                            <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
                              {product.Image || product.image ? (
                                <img
                                  src={product.Image || product.image}
                                  alt={product.name}
                                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                                  <Package className="h-10 w-10 text-gray-300" />
                                </div>
                              )}

                              {/* Status Badge */}
                              {product.status && (
                                <span
                                  className={`absolute left-2 top-2 flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold shadow-sm ${
                                    product.status === "active"
                                      ? "bg-green-500"
                                      : "bg-gray-500"
                                  }`}
                                  style={{ color: "#ffffff" }}
                                >
                                  {product.status === "active" ? (
                                    <CheckCircle className="h-2 w-2" style={{ color: "#ffffff" }} />
                                  ) : (
                                    <XCircle className="h-2 w-2" style={{ color: "#ffffff" }} />
                                  )}
                                  <span style={{ color: "#ffffff" }}>
                                    {product.status === "active" ? "Active" : "Inactive"}
                                  </span>
                                </span>
                              )}

                              {/* Edit Button Overlay */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditProduct(product);
                                }}
                                className="absolute right-2 top-2 rounded-lg bg-white/90 p-1.5 text-green-600 shadow-md backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-white hover:text-green-700 dark:bg-gray-800/90 dark:text-green-400 dark:hover:bg-gray-800"
                                title="Edit product"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            {/* Content Section */}
                            <div className="flex flex-1 flex-col p-3">
                              {/* Product Name */}
                              <h3 className="mb-1.5 line-clamp-2 flex-1 text-xs font-semibold leading-tight text-gray-900 dark:text-white">
                                {product.name}
                              </h3>

                              {/* Price and Unit */}
                              <div className="mb-2 flex items-baseline gap-1">
                                <span className="text-sm font-bold text-green-600 dark:text-green-500">
                                  {product.price}
                                </span>
                                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                  / {product.unit || "unit"}
                                </span>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex gap-2 mt-auto justify-center">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditProduct(product);
                                  }}
                                  className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center transition-all hover:bg-blue-600 active:scale-95 shadow-sm hover:shadow-md"
                                  style={{ color: "#ffffff" }}
                                  title="Edit"
                                >
                                  <Edit className="h-4 w-4" style={{ color: "#ffffff", stroke: "#ffffff" }} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteProduct(product);
                                  }}
                                  className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center transition-all hover:bg-red-600 active:scale-95 shadow-sm hover:shadow-md"
                                  style={{ color: "#ffffff" }}
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" style={{ color: "#ffffff", stroke: "#ffffff" }} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {sectionId === "contracts" && (
                  <>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                      <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                        Contract #{selectedItem.id?.slice(0, 8) || "N/A"}
                      </h4>
                      <span
                        className={`inline-block px-3 py-1 rounded-md text-xs font-semibold ${
                          selectedItem.status === "active"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                            : "bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {selectedItem.status || "Active"}
                      </span>
                    </div>
                    {selectedItem.created_at && (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                        <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Created Date</h5>
                        <p className="text-gray-600 dark:text-gray-400">
                          {new Date(selectedItem.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex flex-col"
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
      }}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-t-3xl mt-[5vh] flex flex-col h-[92vh] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 px-5 py-4 flex items-center justify-between rounded-t-3xl border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
              <Icon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">{filteredItems.length} items</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors active:scale-95"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
          <div className="flex gap-2 mb-2">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder={`Search ${title.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-full bg-white dark:bg-gray-700 px-4 py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 shadow-sm border border-gray-200 dark:border-gray-600"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all ${
                showFilters || selectedFilter !== "all"
                  ? "bg-green-500 text-white shadow-md"
                  : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
              }`}
            >
              <Filter className="h-4 w-4 inline mr-1" />
              Filter
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="flex flex-wrap gap-2 mt-2">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSelectedFilter(option.value);
                    setShowFilters(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedFilter === option.value
                      ? "bg-green-500 text-white shadow-md"
                      : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-24">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center space-y-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading {title}...</p>
              </div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <Icon className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 font-semibold text-lg mb-1">
                No {title.toLowerCase()} found
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {searchTerm || selectedFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : sectionId === "rfqs"
                  ? "Create your first RFQ to get started"
                  : sectionId === "quotes"
                  ? "No quotes submitted yet"
                  : sectionId === "orders"
                  ? "No orders found"
                  : sectionId === "services"
                  ? "No services available"
                  : sectionId === "stores"
                  ? "No stores created yet"
                  : "No contracts found"}
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {sectionId === "rfqs" &&
                filteredItems.map((rfq: any) => (
                  <RFQCard key={rfq.id} rfq={rfq} onView={handleItemClick} />
                ))}
              {sectionId === "quotes" &&
                filteredItems.map((quote: any) => (
                  <QuoteCard key={quote.id} quote={quote} onView={handleItemClick} />
                ))}
              {sectionId === "orders" &&
                filteredItems.map((order: any) => (
                  <OrderCard key={order.id} order={order} onView={handleItemClick} />
                ))}
              {sectionId === "services" &&
                filteredItems.map((service: any) => (
                  <ServiceCard key={service.id} service={service} onView={handleItemClick} />
                ))}
              {sectionId === "stores" &&
                filteredItems.map((store: any) => (
                  <StoreCard key={store.id} store={store} onView={handleItemClick} />
                ))}
              {sectionId === "contracts" &&
                filteredItems.map((contract: any) => (
                  <ContractCard key={contract.id} contract={contract} onView={handleItemClick} />
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Individual Card Components
function RFQCard({ rfq, onView }: { rfq: any; onView: (item: any) => void }) {
  return (
    <div
      onClick={() => onView(rfq)}
      className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600 cursor-pointer hover:shadow-md hover:border-green-300 dark:hover:border-green-600 transition-all active:scale-[0.98]"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-bold text-gray-900 dark:text-white text-base flex-1">
          {rfq.title || `RFQ #${rfq.id.slice(0, 8)}`}
        </h4>
        <span
          className={`px-2.5 py-1 rounded-md text-xs font-semibold ml-2 ${
            rfq.open
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
              : "bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400"
          }`}
        >
          {rfq.open ? "Open" : "Closed"}
        </span>
      </div>
      {rfq.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{rfq.description}</p>
      )}
      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        {rfq.category && (
          <span className="flex items-center gap-1">
            <Briefcase className="h-3 w-3" />
            {rfq.category}
          </span>
        )}
        {rfq.location && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {rfq.location}
          </span>
        )}
        {rfq.response_date && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(rfq.response_date).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}

function QuoteCard({ quote, onView }: { quote: any; onView: (item: any) => void }) {
  const attachments = [
    quote.attachement,
    quote.attachment_1,
    quote.attachment_2,
  ].filter((att) => att && att.trim() !== "");

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not specified";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: string, currency: string) => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency || "RWF",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(parseFloat(amount));
    } catch {
      return `${amount} ${currency || "RWF"}`;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || "pending";
    switch (statusLower) {
      case "accepted":
        return {
          icon: CheckCircle,
          className:
            "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md shadow-green-500/30",
          text: "Accepted",
        };
      case "rejected":
        return {
          icon: XCircle,
          className:
            "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-md shadow-red-500/30",
          text: "Rejected",
        };
      default:
        return {
          icon: Clock,
          className:
            "bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-md shadow-yellow-500/30",
          text: "Pending",
        };
    }
  };

  const statusBadge = getStatusBadge(quote.status);
  const StatusIcon = statusBadge.icon;
  const rfqTitle = quote.bussines_RFQ?.title || quote.rfq?.title || `RFQ #${quote.businessRfq_id?.slice(0, 8)}`;
  const rfqRequesterName = quote.bussines_RFQ?.business_account?.business_name || "Unknown Business";

  return (
    <div
      onClick={() => onView(quote)}
      className="group relative overflow-hidden rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white via-gray-50 to-white p-5 shadow-md transition-all duration-300 hover:border-green-400 hover:shadow-xl hover:shadow-green-500/20 dark:border-gray-700 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 dark:hover:border-green-600 cursor-pointer active:scale-[0.97]"
    >
      {/* Decorative gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/0 via-emerald-50/0 to-teal-50/0 transition-opacity duration-300 group-hover:from-green-50/50 group-hover:via-emerald-50/30 group-hover:to-teal-50/50 dark:group-hover:from-green-900/10 dark:group-hover:via-emerald-900/5 dark:group-hover:to-teal-900/10 pointer-events-none"></div>
      
      <div className="relative flex flex-col gap-4">
        {/* Header Section */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold leading-tight text-gray-900 transition-colors group-hover:text-green-600 dark:text-white line-clamp-2">
                  {rfqTitle}
                </h3>
              </div>
            </div>
            
            {/* RFQ Requester */}
            <div className="ml-12 flex items-center gap-2 rounded-lg bg-gray-100/80 px-3 py-1.5 dark:bg-gray-700/50">
              <Building className="h-3.5 w-3.5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
              <span className="truncate text-xs font-semibold text-gray-700 dark:text-gray-300">
                {rfqRequesterName}
              </span>
            </div>
          </div>

          {/* Status and Attachments Badges */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold shadow-sm ${statusBadge.className}`}
            >
              <StatusIcon className="h-3.5 w-3.5" />
              {statusBadge.text}
            </span>
            {attachments.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 px-3 py-1.5 text-[11px] font-bold text-white shadow-md shadow-blue-500/30">
                <FileText className="h-3 w-3" />
                {attachments.length}
              </span>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="ml-12 grid grid-cols-1 gap-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 p-3 dark:from-gray-700/30 dark:to-gray-800/30">
          {quote.delivery_time && (
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30">
                <Truck className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Delivery</p>
                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{quote.delivery_time}</p>
              </div>
            </div>
          )}
          {quote.quote_validity && (
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30">
                <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Valid Until</p>
                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{quote.quote_validity}</p>
              </div>
            </div>
          )}
          {quote.bussines_RFQ?.location && (
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30">
                <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Location</p>
                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{quote.bussines_RFQ.location}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Price and Action */}
        <div className="flex items-center justify-between gap-3 rounded-xl border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white pt-4 dark:border-gray-700 dark:from-gray-800/50 dark:to-gray-800">
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {quote.qouteAmount ? formatCurrency(quote.qouteAmount, quote.currency) : "N/A"}
              </p>
              {quote.currency && (
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {quote.currency}
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <Calendar className="h-3 w-3 text-gray-400" />
              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                {quote.created_at ? formatDate(quote.created_at) : "Not specified"}
              </p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView(quote);
            }}
            className="flex flex-shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-green-500/30 transition-all duration-300 hover:from-green-600 hover:to-emerald-600 hover:shadow-xl hover:shadow-green-500/40 active:scale-95"
          >
            <Eye className="h-4 w-4" />
            <span>View</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderCard({ order, onView }: { order: any; onView: (item: any) => void }) {
  // Get query_id from order items if available
  const queryId = order.allProducts?.[0]?.query_id || order.query_id || null;
  
  return (
    <div
      onClick={() => onView(order)}
      className="group bg-white dark:bg-gray-800 rounded-2xl p-4 border-2 border-gray-200 dark:border-gray-600 cursor-pointer hover:shadow-xl hover:border-green-400 dark:hover:border-green-600 transition-all duration-300 active:scale-[0.98]"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30">
              <ShoppingCart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white text-base">
                {queryId || order.OrderID || order.id?.slice(0, 8) || "N/A"}
              </h4>
              {queryId && (
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                  Query ID
                </p>
              )}
            </div>
          </div>
          {order.created_at && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 ml-10">
              <Calendar className="h-3 w-3" />
              {new Date(order.created_at).toLocaleDateString()}
            </div>
          )}
        </div>
        <span
          className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-md ${
            order.status === "completed"
              ? "bg-green-500 text-white"
              : order.status === "pending"
              ? "bg-yellow-500 text-white"
              : order.status === "cancelled"
              ? "bg-red-500 text-white"
              : "bg-blue-500 text-white"
          }`}
        >
          {order.status?.toUpperCase() || "ACTIVE"}
        </span>
      </div>
      
      {order.total && (
        <div className="flex items-center justify-between pt-3 mt-3 border-t-2 border-gray-200 dark:border-gray-700">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Total:</span>
          <span className="text-lg font-bold text-green-600 dark:text-green-400">
            {formatCurrencySync(parseFloat(order.total || "0"))}
          </span>
        </div>
      )}
      
      <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <Eye className="h-3.5 w-3.5" />
        <span className="font-medium">Tap to view details</span>
      </div>
    </div>
  );
}

function ServiceCard({ service, onView }: { service: any; onView: (item: any) => void }) {
  return (
    <div
      onClick={() => onView(service)}
      className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600 cursor-pointer hover:shadow-md hover:border-green-300 dark:hover:border-green-600 transition-all active:scale-[0.98]"
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center flex-shrink-0">
          <Package className="h-6 w-6 text-gray-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 dark:text-white text-base mb-1">{service.name}</h4>
          {service.price && (
            <p className="text-sm font-semibold text-green-600 dark:text-green-400 mb-1">
              {service.price} {service.unit ? `/ ${service.unit}` : ""}
            </p>
          )}
          {service.Description && (
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{service.Description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StoreCard({ store, onView }: { store: any; onView: (item: any) => void }) {
  return (
    <div
      onClick={() => onView(store)}
      className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600 cursor-pointer hover:shadow-md hover:border-green-300 dark:hover:border-green-600 transition-all active:scale-[0.98]"
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center flex-shrink-0">
          <Store className="h-6 w-6 text-gray-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 dark:text-white text-base mb-1">{store.name || "Store"}</h4>
          {store.description && (
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{store.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ContractCard({ contract, onView }: { contract: any; onView: (item: any) => void }) {
  return (
    <div
      onClick={() => onView(contract)}
      className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600 cursor-pointer hover:shadow-md hover:border-green-300 dark:hover:border-green-600 transition-all active:scale-[0.98]"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-bold text-gray-900 dark:text-white text-base flex-1">
          Contract #{contract.id?.slice(0, 8) || "N/A"}
        </h4>
        <span
          className={`px-2.5 py-1 rounded-md text-xs font-semibold ml-2 ${
            contract.status === "active"
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
              : "bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400"
          }`}
        >
          {contract.status || "Active"}
        </span>
      </div>
      {contract.created_at && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          <Calendar className="h-3 w-3 inline mr-1" />
          {new Date(contract.created_at).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
