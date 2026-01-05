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
import { QuoteSubmissionForm } from "../QuoteSubmissionForm";
import { SubmittedQuoteDetails } from "../SubmittedQuoteDetails";

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
    rfqOpportunities?: any[];
  };
  loading: boolean;
  businessAccount?: any;
  router: any;
  onEditProduct?: (product: any, storeId: string) => void; // Callback to open edit modal
  initialSelectedItem?: any; // Item to auto-select when modal opens
  onMessageCustomer?: (customerId: string) => void;
  onSubmitQuote?: (rfq: any) => void;
  onViewQuote?: (rfq: any) => void;
  onViewContract?: (contractId: string) => void; // Callback to view contract details
}

export function ExpandedSectionModal({
  sectionId,
  onClose,
  data,
  loading,
  businessAccount,
  router,
  onEditProduct,
  initialSelectedItem,
  onMessageCustomer,
  onSubmitQuote,
  onViewQuote,
  onViewContract,
}: ExpandedSectionModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<any>(
    initialSelectedItem || null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [storeProducts, setStoreProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);
  const [quoteActiveTab, setQuoteActiveTab] = useState("overview");
  const [submittedQuotes, setSubmittedQuotes] = useState<Record<string, any>>(
    {}
  );
  const [isQuoteFormOpen, setIsQuoteFormOpen] = useState(false);
  const [selectedRFQForQuote, setSelectedRFQForQuote] = useState<any>(null);
  const [isQuoteDetailsOpen, setIsQuoteDetailsOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [isOpeningQuoteForm, setIsOpeningQuoteForm] = useState(false);

  const sectionTitles: Record<string, string> = {
    rfqs: "My RFQs",
    "rfq-opportunities": "RFQ Opportunities",
    quotes: "Quotes",
    orders: "Orders",
    services: "Services",
    stores: "Stores",
    contracts: "Contracts",
  };

  const sectionIcons: Record<string, any> = {
    rfqs: FileText,
    "rfq-opportunities": FileText,
    quotes: ShoppingCart,
    orders: Package,
    services: Briefcase,
    stores: Store,
    contracts: FileText,
  };

  const Icon = sectionIcons[sectionId] || FileText;
  const title = sectionTitles[sectionId] || "Details";
  const allItems =
    sectionId === "rfq-opportunities"
      ? data.rfqOpportunities || []
      : data[sectionId as keyof typeof data] || [];

  // Filter options based on section
  const filterOptions = useMemo(() => {
    if (sectionId === "rfqs") {
      return [
        { value: "all", label: "All RFQs" },
        { value: "open", label: "Open" },
        { value: "closed", label: "Closed" },
      ];
    }
    if (sectionId === "rfq-opportunities") {
      return [
        { value: "all", label: "All Opportunities" },
        { value: "open", label: "Open" },
        { value: "closed", label: "Closed" },
        { value: "urgent", label: "Urgent" },
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
        if (sectionId === "rfqs" || sectionId === "rfq-opportunities") {
          return (
            item.title?.toLowerCase().includes(term) ||
            item.description?.toLowerCase().includes(term) ||
            item.category?.toLowerCase().includes(term) ||
            item.location?.toLowerCase().includes(term) ||
            item.business_account?.business_name?.toLowerCase().includes(term)
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
        if (sectionId === "rfqs" || sectionId === "rfq-opportunities") {
          if (selectedFilter === "open") {
            return item.open;
          } else if (selectedFilter === "closed") {
            return !item.open;
          } else if (
            selectedFilter === "urgent" &&
            sectionId === "rfq-opportunities"
          ) {
            // Check if deadline is within 3 days
            if (item.response_date) {
              const deadline = new Date(item.response_date);
              const today = new Date();
              const diffTime = deadline.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              return diffDays > 0 && diffDays <= 3;
            }
            return false;
          }
          return selectedFilter === "open" ? item.open : !item.open;
        }
        if (
          sectionId === "quotes" ||
          sectionId === "orders" ||
          sectionId === "contracts"
        ) {
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
      const response = await fetch(
        `/api/queries/business-products?store_id=${storeId}`
      );
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

  // Auto-select initial item when it's provided
  useEffect(() => {
    if (initialSelectedItem && !selectedItem) {
      handleItemClick(initialSelectedItem);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSelectedItem]);

  // Check for existing quotes when RFQ opportunities are loaded
  useEffect(() => {
    if (sectionId === "rfq-opportunities" && allItems.length > 0) {
      checkExistingQuotes();
    }
  }, [sectionId, allItems]);

  // Clear loading state when quote form opens
  useEffect(() => {
    if (isQuoteFormOpen) {
      setIsOpeningQuoteForm(false);
    }
  }, [isQuoteFormOpen]);

  const checkExistingQuotes = async () => {
    const quotePromises = allItems.map(async (rfq: any) => {
      try {
        const response = await fetch(
          `/api/queries/user-rfq-quote?rfqId=${rfq.id}`
        );
        if (response.ok) {
          const data = await response.json();
          return { rfqId: rfq.id, quote: data.quote };
        }
      } catch (error) {
        console.error(`Error checking quote for RFQ ${rfq.id}:`, error);
      }
      return { rfqId: rfq.id, quote: null };
    });

    const results = await Promise.all(quotePromises);
    const quotesMap: Record<string, any> = {};
    results.forEach(({ rfqId, quote }) => {
      if (quote) {
        quotesMap[rfqId] = quote;
      }
    });
    setSubmittedQuotes(quotesMap);
  };

  const handleShareQuote = async (rfq: any) => {
    const existingQuote = submittedQuotes[rfq.id];
    if (existingQuote) {
      setSelectedRFQForQuote(rfq);
      setSelectedQuote(existingQuote);
      setIsQuoteDetailsOpen(true);
    } else {
      // Show loading state
      setIsOpeningQuoteForm(true);
      // Close the expanded modal to allow quote form to be full screen
      setSelectedItem(null);
      setSelectedRFQForQuote(rfq);
      // Small delay to ensure smooth transition
      setTimeout(() => {
        setIsQuoteFormOpen(true);
        setIsOpeningQuoteForm(false);
      }, 100);
    }
  };

  const handleQuoteSubmitted = () => {
    toast.success("Quote submitted successfully!");
    setIsQuoteFormOpen(false);
    setSelectedRFQForQuote(null);
    checkExistingQuotes();
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
    if (
      !window.confirm(`Are you sure you want to disable "${product.name}"?`)
    ) {
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
        className="fixed inset-0 z-[9999] flex flex-col bg-black/50 backdrop-blur-sm"
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
          className="mt-[5vh] flex h-[92vh] flex-col rounded-t-3xl bg-white shadow-2xl dark:bg-gray-800"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Item Detail Header */}
          <div className="flex items-center justify-between rounded-t-3xl border-b border-gray-200 bg-white px-5 py-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToList}
                className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 active:scale-95 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  View Details
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {title}
                </p>
              </div>
            </div>
            {!isEditing && sectionId !== "rfq-opportunities" && (
              <button
                onClick={handleEdit}
                className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 active:scale-95 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Edit className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Item Detail Content */}
          <div className="flex-1 overflow-y-auto p-5 pb-24">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Title
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedItem.title || selectedItem.name || ""}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    defaultValue={
                      selectedItem.description || selectedItem.Description || ""
                    }
                    rows={4}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleBackToList}
                    className="flex-1 rounded-lg bg-gray-200 px-4 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {sectionId === "rfqs" && (
                  <>
                    <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700">
                      <h4 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                        {selectedItem.title ||
                          `RFQ #${selectedItem.id?.slice(0, 8)}`}
                      </h4>
                      <span
                        className={`inline-block rounded-md px-3 py-1 text-xs font-semibold ${
                          selectedItem.open
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {selectedItem.open ? "Open" : "Closed"}
                      </span>
                    </div>
                    {selectedItem.description && (
                      <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700">
                        <h5 className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
                          Description
                        </h5>
                        <p className="text-gray-600 dark:text-gray-400">
                          {selectedItem.description}
                        </p>
                      </div>
                    )}
                    {selectedItem.category && (
                      <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700">
                        <h5 className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
                          Category
                        </h5>
                        <p className="text-gray-600 dark:text-gray-400">
                          {selectedItem.category}
                        </p>
                      </div>
                    )}
                    {selectedItem.location && (
                      <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700">
                        <h5 className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
                          Location
                        </h5>
                        <p className="text-gray-600 dark:text-gray-400">
                          {selectedItem.location}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {sectionId === "rfq-opportunities" && (
                  <>
                    <div className="mb-4 rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4 dark:border-green-800/50 dark:from-green-900/20 dark:to-emerald-900/20">
                      <div className="mb-3 flex items-start justify-between">
                        <h4 className="flex-1 text-lg font-bold text-gray-900 dark:text-white">
                          {selectedItem.title ||
                            `RFQ #${selectedItem.id?.slice(0, 8)}`}
                        </h4>
                        <span
                          className={`ml-2 rounded-md px-3 py-1 text-xs font-semibold ${
                            selectedItem.open
                              ? "bg-green-500 text-white"
                              : "bg-gray-500 text-white"
                          }`}
                          style={{ color: "#ffffff" }}
                        >
                          {selectedItem.open ? "Open" : "Closed"}
                        </span>
                      </div>
                      {selectedItem.business_account?.business_name && (
                        <div className="mb-2 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <Building className="h-4 w-4" />
                          <span>
                            {selectedItem.business_account.business_name}
                          </span>
                        </div>
                      )}
                    </div>

                    {selectedItem.description && (
                      <div className="mb-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-700">
                        <h5 className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
                          Description
                        </h5>
                        <p className="text-gray-600 dark:text-gray-400">
                          {selectedItem.description}
                        </p>
                      </div>
                    )}

                    <div className="mb-4 grid grid-cols-2 gap-3">
                      {selectedItem.category && (
                        <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700">
                          <h5 className="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
                            Category
                          </h5>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {selectedItem.category}
                          </p>
                        </div>
                      )}
                      {selectedItem.location && (
                        <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700">
                          <h5 className="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
                            Location
                          </h5>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {selectedItem.location}
                          </p>
                        </div>
                      )}
                    </div>

                    {(selectedItem.min_budget || selectedItem.max_budget) && (
                      <div className="mb-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-700">
                        <h5 className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
                          Budget
                        </h5>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          {selectedItem.min_budget && selectedItem.max_budget
                            ? `${formatCurrencySync(
                                parseFloat(selectedItem.min_budget)
                              )} - ${formatCurrencySync(
                                parseFloat(selectedItem.max_budget)
                              )}`
                            : selectedItem.min_budget
                            ? `${formatCurrencySync(
                                parseFloat(selectedItem.min_budget)
                              )}+`
                            : selectedItem.max_budget
                            ? `Up to ${formatCurrencySync(
                                parseFloat(selectedItem.max_budget)
                              )}`
                            : "Not specified"}
                        </p>
                      </div>
                    )}

                    {selectedItem.response_date && (
                      <div className="mb-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-700">
                        <h5 className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
                          Response Deadline
                        </h5>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {new Date(
                            selectedItem.response_date
                          ).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-col gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
                      <button
                        onClick={() => handleShareQuote(selectedItem)}
                        disabled={isOpeningQuoteForm}
                        className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 font-semibold text-white transition-colors ${
                          submittedQuotes[selectedItem.id]
                            ? "bg-blue-500 hover:bg-blue-600"
                            : "bg-green-500 hover:bg-green-600"
                        } ${
                          isOpeningQuoteForm
                            ? "cursor-not-allowed opacity-75"
                            : ""
                        }`}
                        style={{ color: "#ffffff" }}
                      >
                        {isOpeningQuoteForm ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            <span>Opening...</span>
                          </>
                        ) : submittedQuotes[selectedItem.id] ? (
                          "View Quote"
                        ) : (
                          "Submit Quote"
                        )}
                      </button>
                      {onMessageCustomer && (
                        <button
                          onClick={() => {
                            const customerId =
                              selectedItem.business_account?.id ||
                              selectedItem.id;
                            onMessageCustomer(customerId);
                          }}
                          className="w-full rounded-lg bg-purple-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-purple-600"
                          style={{ color: "#ffffff" }}
                        >
                          Message Customer
                        </button>
                      )}
                    </div>
                  </>
                )}

                {sectionId === "quotes" &&
                  (() => {
                    // Transform quote data similar to desktop version
                    const transformQuote = (quote: any) => {
                      const attachments = [
                        quote.attachement,
                        quote.attachment_1,
                        quote.attachment_2,
                      ].filter((att) => att && att.trim() !== "");

                      const rfqRequester = quote.bussines_RFQ?.business_account;
                      const myBusiness = quote.business_account;
                      const rfq =
                        quote.bussines_RFQ || quote.businessRfq || quote.rfq;

                      const getValue = (
                        value: any,
                        defaultValue: string = ""
                      ) => {
                        if (
                          value === null ||
                          value === undefined ||
                          value === ""
                        ) {
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

                      const formatCurrency = (
                        amount: string,
                        currency: string
                      ) => {
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
                        expectedDeliveryDate: getValue(
                          rfq?.expected_delivery_date
                        ),
                        requirements: rfq?.requirements || null,
                        notes: getValue(rfq?.notes),
                        rfqContactName: getValue(rfq?.contact_name),
                        rfqEmail: getValue(rfq?.email),
                        rfqPhone: getValue(rfq?.phone),
                        rfqCreatedAt: getValue(rfq?.created_at),
                        totalPrice: quote.qouteAmount
                          ? formatCurrency(quote.qouteAmount, quote.currency)
                          : "N/A",
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
                          email: getValue(
                            rfqRequester?.business_email || rfq?.email
                          ),
                          phone: getValue(
                            rfqRequester?.business_phone || rfq?.phone
                          ),
                          location: getValue(
                            rfqRequester?.business_location || rfq?.location
                          ),
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
                          paymentTerms: getValue(
                            quote.PaymentTerms,
                            "Not specified"
                          ),
                          deliveryTerms: getValue(
                            quote.DeliveryTerms,
                            "Not specified"
                          ),
                          warranty: getValue(quote.warrantly, "Not specified"),
                          cancellationTerms: getValue(
                            quote.cancellatioinTerms,
                            "Not specified"
                          ),
                        },
                      };
                    };

                    const quote = transformQuote(selectedItem);

                    const downloadAttachment = (
                      base64String: string,
                      index: number
                    ) => {
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
                        <div className="-mx-5 border-b border-gray-200 bg-white px-5 py-4 dark:border-gray-700 dark:bg-gray-800">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="mb-3 flex items-center gap-3">
                                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-md dark:from-gray-700 dark:to-gray-600">
                                  <FileText className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h2 className="line-clamp-2 text-lg font-bold leading-tight text-gray-900 dark:text-white">
                                    {quote.title}
                                  </h2>
                                </div>
                              </div>
                              <div className="ml-14 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-600 dark:bg-gray-700/50">
                                <Building className="h-4 w-4 flex-shrink-0 text-gray-600 dark:text-gray-400" />
                                <span className="truncate text-sm font-semibold text-gray-700 dark:text-gray-300">
                                  {quote.rfqRequester?.name ||
                                    "Unknown Business"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Tabs */}
                        <div className="sticky top-0 z-10 -mx-5 border-b border-gray-200 bg-white px-5 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                          <div className="scrollbar-hide flex space-x-2 overflow-x-auto pb-2">
                            {[
                              {
                                id: "overview",
                                label: "Overview",
                                icon: FileText,
                                shortLabel: "Overview",
                              },
                              {
                                id: "rfq",
                                label: "RFQ Details",
                                icon: FileText,
                                shortLabel: "RFQ",
                              },
                              {
                                id: "requester",
                                label: "RFQ Requester",
                                icon: Building,
                                shortLabel: "Requester",
                              },
                              {
                                id: "quote",
                                label: "My Quote",
                                icon: DollarSign,
                                shortLabel: "Quote",
                              },
                              {
                                id: "terms",
                                label: "Terms & Conditions",
                                icon: FileText,
                                shortLabel: "Terms",
                              },
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
                                  quoteActiveTab === tab.id
                                    ? { color: "#ffffff" }
                                    : undefined
                                }
                              >
                                <tab.icon
                                  className="h-4 w-4 transition-transform duration-200"
                                  style={
                                    quoteActiveTab === tab.id
                                      ? { color: "#ffffff" }
                                      : undefined
                                  }
                                />
                                <span
                                  className="whitespace-nowrap"
                                  style={
                                    quoteActiveTab === tab.id
                                      ? { color: "#ffffff" }
                                      : undefined
                                  }
                                >
                                  {tab.shortLabel}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Tab Content */}
                        <div className="space-y-4 pb-4">
                          {quoteActiveTab === "overview" && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 gap-4">
                                {/* Quote Summary */}
                                <div className="overflow-hidden rounded-none border-x-0 border-b border-t-0 border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
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
                                          {quote.status
                                            ?.charAt(0)
                                            .toUpperCase() +
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
                                          {quote.rfqRequester?.name ||
                                            "Unknown Business"}
                                        </h4>
                                        <div className="mt-1 flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                                          <span className="truncate">
                                            {quote.rfqRequester?.location ||
                                              "Not specified"}
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
                                          {quote.rfqRequester?.email ||
                                            "Not provided"}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                                          <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                                        </div>
                                        <span className="truncate text-sm text-gray-700 dark:text-gray-300">
                                          {quote.rfqRequester?.phone ||
                                            "Not provided"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Quote Message */}
                              {quote.quoteMessage && (
                                <div className="overflow-hidden rounded-none border-x-0 border-b border-t-0 border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
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
                              {quote.attachments &&
                                quote.attachments.length > 0 && (
                                  <div className="overflow-hidden rounded-none border-x-0 border-b border-t-0 border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
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
                                            onClick={() =>
                                              downloadAttachment(
                                                attachment,
                                                index
                                              )
                                            }
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
                            <div className="space-y-4">
                              <div className="rounded-none border-x-0 border-b border-t-0 border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
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
                                            ? new Date(
                                                quote.responseDate
                                              ).toLocaleDateString("en-US", {
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
                                            ? new Date(
                                                quote.expectedDeliveryDate
                                              ).toLocaleDateString("en-US", {
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
                                          {quote.urgencyLevel ||
                                            "Not specified"}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                          Estimated Quantity:
                                        </span>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                          {quote.estimatedQuantity ||
                                            "Not specified"}
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
                                        {typeof quote.requirements ===
                                        "string" ? (
                                          <p className="whitespace-pre-wrap">
                                            {quote.requirements}
                                          </p>
                                        ) : Array.isArray(
                                            quote.requirements
                                          ) ? (
                                          <ul className="list-inside list-disc space-y-1">
                                            {quote.requirements.map(
                                              (req: any, idx: number) => (
                                                <li key={idx}>
                                                  {typeof req === "string"
                                                    ? req
                                                    : JSON.stringify(req)}
                                                </li>
                                              )
                                            )}
                                          </ul>
                                        ) : (
                                          <p>
                                            {JSON.stringify(quote.requirements)}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {quoteActiveTab === "requester" && (
                            <div className="space-y-4">
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
                                            {quote.rfqRequester?.name ||
                                              "Not provided"}
                                          </p>
                                        </div>
                                        <div>
                                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Account Type:
                                          </span>
                                          <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                            {quote.rfqRequester?.accountType ||
                                              "Not specified"}
                                          </p>
                                        </div>
                                        <div>
                                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Status:
                                          </span>
                                          <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                            {quote.rfqRequester?.status ||
                                              "Not specified"}
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
                                            {quote.rfqRequester?.email ||
                                              quote.rfqEmail ||
                                              "Not provided"}
                                          </p>
                                        </div>
                                        <div>
                                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Phone:
                                          </span>
                                          <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                            {quote.rfqRequester?.phone ||
                                              quote.rfqPhone ||
                                              "Not provided"}
                                          </p>
                                        </div>
                                        <div>
                                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Location:
                                          </span>
                                          <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                            {quote.rfqRequester?.location ||
                                              quote.location ||
                                              "Not provided"}
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
                              <div className="rounded-none border-x-0 border-b border-t-0 border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
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
                                            {quote.status
                                              ?.charAt(0)
                                              .toUpperCase() +
                                              quote.status?.slice(1) ||
                                              "Pending"}
                                          </p>
                                        </div>
                                        <div>
                                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Submitted Date:
                                          </span>
                                          <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                            {quote.submittedDate ||
                                              "Not available"}
                                          </p>
                                        </div>
                                        {quote.updatedDate &&
                                          quote.updatedDate !==
                                            quote.submittedDate && (
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
                                  {quote.attachments &&
                                    quote.attachments.length > 0 && (
                                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                          Attachments (
                                          {quote.attachments.length}):
                                        </span>
                                        <div className="mt-3 space-y-2">
                                          {quote.attachments.map(
                                            (
                                              attachment: string,
                                              index: number
                                            ) => (
                                              <button
                                                key={index}
                                                onClick={() =>
                                                  downloadAttachment(
                                                    attachment,
                                                    index
                                                  )
                                                }
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
                            <div className="-mx-5 space-y-4 px-5">
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
                                          {quote.terms?.paymentTerms ||
                                            "Not specified"}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                          Delivery Terms:
                                        </span>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                          {quote.terms?.deliveryTerms ||
                                            "Not specified"}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="space-y-4">
                                      <div>
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                          Warranty:
                                        </span>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                          {quote.terms?.warranty ||
                                            "Not specified"}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                          Cancellation Terms:
                                        </span>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                          {quote.terms?.cancellationTerms ||
                                            "Not specified"}
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
                      <div className="animate-pulse space-y-4">
                        {/* Order Header Skeleton */}
                        <div className="relative mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 p-5 dark:from-gray-700 dark:to-gray-800">
                          <div className="mb-4 flex items-start justify-between">
                            <div className="flex-1 space-y-3">
                              <div className="h-6 w-32 rounded bg-gray-300 dark:bg-gray-600"></div>
                              <div className="h-8 w-48 rounded bg-gray-300 dark:bg-gray-600"></div>
                              <div className="h-4 w-40 rounded bg-gray-300 dark:bg-gray-600"></div>
                            </div>
                            <div className="h-8 w-24 rounded-xl bg-gray-300 dark:bg-gray-600"></div>
                          </div>
                        </div>

                        {/* Customer Information Skeleton */}
                        <div className="mb-4 rounded-2xl border-2 border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                          <div className="mb-4 flex items-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
                            <div className="h-6 w-40 rounded bg-gray-200 dark:bg-gray-700"></div>
                          </div>
                          <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                              <div
                                key={i}
                                className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50"
                              >
                                <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-600"></div>
                                <div className="flex-1 space-y-2">
                                  <div className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-600"></div>
                                  <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-600"></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Order Items Skeleton */}
                        <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                          <div className="mb-3 h-6 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
                          <div className="space-y-3">
                            {[1, 2].map((i) => (
                              <div
                                key={i}
                                className="flex gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700/50"
                              >
                                <div className="h-16 w-16 rounded-lg bg-gray-200 dark:bg-gray-600"></div>
                                <div className="flex-1 space-y-2">
                                  <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-600"></div>
                                  <div className="flex items-center justify-between">
                                    <div className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-600"></div>
                                    <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-600"></div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Order Summary Skeleton */}
                        <div className="mb-4 rounded-2xl border-2 border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                          <div className="mb-4 flex items-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
                            <div className="h-6 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
                          </div>
                          <div className="space-y-3">
                            {[1, 2].map((i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50"
                              >
                                <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-600"></div>
                                <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-600"></div>
                              </div>
                            ))}
                            <div className="mt-4 border-t-2 border-gray-200 pt-4 dark:border-gray-700">
                              <div className="flex items-center justify-between rounded-xl bg-gray-200 p-4 dark:bg-gray-700">
                                <div className="h-5 w-28 rounded bg-gray-300 dark:bg-gray-600"></div>
                                <div className="h-6 w-32 rounded bg-gray-300 dark:bg-gray-600"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : orderDetails ? (
                      <>
                        {/* Order Header - Premium Design */}
                        <div className="relative mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-green-800 via-green-700 to-emerald-800 p-5 shadow-xl dark:from-green-900 dark:via-green-800 dark:to-emerald-900">
                          {/* Decorative Pattern */}
                          <div className="absolute inset-0 opacity-10">
                            <div className="absolute right-0 top-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-white"></div>
                            <div className="absolute bottom-0 left-0 -mb-12 -ml-12 h-24 w-24 rounded-full bg-white"></div>
                          </div>

                          <div className="relative z-10">
                            <div className="mb-4 flex items-start justify-between">
                              <div className="flex-1">
                                <div className="mb-2 flex items-center gap-2">
                                  <div className="rounded-xl bg-white/20 p-2 backdrop-blur-sm">
                                    <ShoppingCart
                                      className="h-6 w-6 text-white"
                                      style={{ color: "#ffffff" }}
                                    />
                                  </div>
                                  <div>
                                    <p
                                      className="text-xs font-semibold uppercase tracking-wide"
                                      style={{ color: "#ffffff" }}
                                    >
                                      Order ID
                                    </p>
                                    <h4
                                      className="mt-1 font-mono text-2xl font-bold"
                                      style={{ color: "#ffffff" }}
                                    >
                                      {orderDetails.allProducts?.[0]
                                        ?.query_id ||
                                        orderDetails.query_id ||
                                        orderDetails.orderId ||
                                        orderDetails.id?.slice(0, 8) ||
                                        "N/A"}
                                    </h4>
                                  </div>
                                </div>
                                <div
                                  className="flex items-center gap-2 text-sm"
                                  style={{ color: "#ffffff" }}
                                >
                                  <Calendar
                                    className="h-4 w-4"
                                    style={{ color: "#ffffff" }}
                                  />
                                  <span>
                                    {orderDetails.created_at
                                      ? new Date(
                                          orderDetails.created_at
                                        ).toLocaleString()
                                      : "Date not available"}
                                  </span>
                                </div>
                              </div>
                              <span
                                className={`rounded-xl px-4 py-2 text-xs font-bold shadow-lg ${
                                  orderDetails.status === "completed" ||
                                  orderDetails.status === "Delivered"
                                    ? "bg-green-500"
                                    : orderDetails.status === "pending" ||
                                      orderDetails.status === "Pending"
                                    ? "bg-yellow-500"
                                    : orderDetails.status === "cancelled" ||
                                      orderDetails.status === "Cancelled"
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
                          <div className="mb-4 rounded-2xl border-2 border-gray-200 bg-white p-5 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                            <div className="mb-4 flex items-center gap-3">
                              <div className="rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 p-3 dark:from-blue-900/30 dark:to-indigo-900/30">
                                <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                              </div>
                              <h5 className="text-lg font-bold text-gray-900 dark:text-white">
                                Customer Information
                              </h5>
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                                <div className="rounded-lg bg-white p-2 dark:bg-gray-600">
                                  <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                                    Name
                                  </p>
                                  <p className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">
                                    {orderDetails.orderedBy.name || "N/A"}
                                  </p>
                                </div>
                              </div>
                              {orderDetails.orderedBy.email && (
                                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                                  <div className="rounded-lg bg-white p-2 dark:bg-gray-600">
                                    <Mail className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                                      Email
                                    </p>
                                    <p className="mt-0.5 truncate text-sm font-semibold text-gray-900 dark:text-white">
                                      {orderDetails.orderedBy.email}
                                    </p>
                                  </div>
                                </div>
                              )}
                              {orderDetails.orderedBy.phone && (
                                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                                  <div className="rounded-lg bg-white p-2 dark:bg-gray-600">
                                    <Phone className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                                      Phone
                                    </p>
                                    <p className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">
                                      {orderDetails.orderedBy.phone}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Order Items */}
                        {orderDetails.Order_Items &&
                          orderDetails.Order_Items.length > 0 && (
                            <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                              <h5 className="mb-3 flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                                <Package className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                Order Items ({orderDetails.Order_Items.length})
                              </h5>
                              <div className="space-y-3">
                                {orderDetails.Order_Items.map(
                                  (item: any, index: number) => (
                                    <div
                                      key={item.id || index}
                                      className="flex gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700/50"
                                    >
                                      {item.product?.image ||
                                      item.product?.ProductName?.image ? (
                                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-600">
                                          <img
                                            src={
                                              item.product.image ||
                                              item.product.ProductName?.image
                                            }
                                            alt={
                                              item.product?.ProductName?.name ||
                                              "Product"
                                            }
                                            className="h-full w-full object-cover"
                                            onError={(e) => {
                                              e.currentTarget.style.display =
                                                "none";
                                              e.currentTarget.nextElementSibling?.classList.remove(
                                                "hidden"
                                              );
                                            }}
                                          />
                                          <Package className="hidden h-8 w-8 text-gray-400" />
                                        </div>
                                      ) : (
                                        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-600">
                                          <Package className="h-8 w-8 text-gray-400" />
                                        </div>
                                      )}
                                      <div className="min-w-0 flex-1">
                                        <h6 className="mb-1 font-semibold text-gray-900 dark:text-white">
                                          {item.product?.ProductName?.name ||
                                            item.product?.name ||
                                            "Product"}
                                        </h6>
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm text-gray-600 dark:text-gray-400">
                                            Qty: {item.quantity}
                                          </span>
                                          <span className="text-sm font-bold text-green-600 dark:text-green-400">
                                            {item.price ||
                                              item.product?.price ||
                                              "0"}{" "}
                                            RF
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {/* Delivery Address - Enhanced Design */}
                        {orderDetails.deliveryAddress && (
                          <div className="mb-4 rounded-2xl border-2 border-gray-200 bg-white p-5 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                            <div className="mb-4 flex items-center gap-3">
                              <div className="rounded-xl bg-gradient-to-br from-red-100 to-pink-100 p-3 dark:from-red-900/30 dark:to-pink-900/30">
                                <MapPin className="h-6 w-6 text-red-600 dark:text-red-400" />
                              </div>
                              <h5 className="text-lg font-bold text-gray-900 dark:text-white">
                                Delivery Address
                              </h5>
                            </div>
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700/50">
                              <p className="text-sm font-semibold leading-relaxed text-gray-900 dark:text-white">
                                {orderDetails.deliveryAddress}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Order Summary - Premium Design */}
                        <div className="mb-4 rounded-2xl border-2 border-gray-200 bg-white p-5 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                          <div className="mb-4 flex items-center gap-3">
                            <div className="rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 p-3 shadow-md dark:from-green-900/30 dark:to-emerald-900/30">
                              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <h5 className="text-lg font-bold text-gray-900 dark:text-white">
                              Order Summary
                            </h5>
                          </div>
                          <div className="space-y-3">
                            {orderDetails.service_fee && (
                              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 shadow-sm dark:bg-gray-700/50">
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                  Service Fee
                                </span>
                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                  {formatCurrencySync(
                                    parseFloat(
                                      orderDetails.service_fee.toString()
                                    )
                                  )}
                                </span>
                              </div>
                            )}
                            {orderDetails.transportation_fee && (
                              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 shadow-sm dark:bg-gray-700/50">
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                  Transportation Fee
                                </span>
                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                  {formatCurrencySync(
                                    parseFloat(
                                      orderDetails.transportation_fee.toString()
                                    )
                                  )}
                                </span>
                              </div>
                            )}
                            <div className="mt-4 border-t-2 border-gray-200 pt-4 dark:border-gray-700">
                              <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 p-4 shadow-lg">
                                <span
                                  className="text-base font-bold"
                                  style={{ color: "#ffffff" }}
                                >
                                  Total Amount
                                </span>
                                <span
                                  className="text-2xl font-bold"
                                  style={{ color: "#ffffff" }}
                                >
                                  {orderDetails.value
                                    ? formatCurrencySync(
                                        parseFloat(
                                          orderDetails.value.toString()
                                        )
                                      )
                                    : formatCurrencySync(0)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Delivery Information - Enhanced Design */}
                        {(orderDetails.deliveryDate ||
                          orderDetails.deliveryTime ||
                          orderDetails.comment) && (
                          <div className="mb-4 rounded-2xl border-2 border-gray-200 bg-white p-5 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                            <div className="mb-4 flex items-center gap-3">
                              <div className="rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 p-3 dark:from-orange-900/30 dark:to-amber-900/30">
                                <Truck className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                              </div>
                              <h5 className="text-lg font-bold text-gray-900 dark:text-white">
                                Delivery Information
                              </h5>
                            </div>
                            <div className="space-y-3">
                              {orderDetails.deliveryDate && (
                                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                                  <Calendar className="h-5 w-5 flex-shrink-0 text-orange-600 dark:text-orange-400" />
                                  <div className="flex-1">
                                    <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                                      Delivery Date
                                    </p>
                                    <p className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">
                                      {orderDetails.deliveryDate}
                                    </p>
                                  </div>
                                </div>
                              )}
                              {orderDetails.deliveryTime && (
                                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                                  <Clock className="h-5 w-5 flex-shrink-0 text-orange-600 dark:text-orange-400" />
                                  <div className="flex-1">
                                    <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                                      Delivery Time
                                    </p>
                                    <p className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">
                                      {orderDetails.deliveryTime}
                                    </p>
                                  </div>
                                </div>
                              )}
                              {orderDetails.comment && (
                                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                                  <p className="mb-1 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
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
                          <div className="rounded-2xl border-2 border-gray-200 bg-white p-5 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                            <div className="mb-4 flex items-center gap-3">
                              <div className="rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 p-3 dark:from-purple-900/30 dark:to-pink-900/30">
                                <Store className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                              </div>
                              <h5 className="text-lg font-bold text-gray-900 dark:text-white">
                                Store Information
                              </h5>
                            </div>
                            <div className="space-y-3">
                              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                                <p className="mb-1 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                                  Store Name
                                </p>
                                <p className="text-base font-bold text-gray-900 dark:text-white">
                                  {orderDetails.store}
                                </p>
                              </div>
                              {orderDetails.store_image && (
                                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                                  <img
                                    src={orderDetails.store_image}
                                    alt={orderDetails.store}
                                    className="h-32 w-full rounded-lg object-cover"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Shopper Information */}
                        {orderDetails.shopper && (
                          <div className="rounded-2xl border-2 border-gray-200 bg-white p-5 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                            <div className="mb-4 flex items-center gap-3">
                              <div className="rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 p-3 dark:from-cyan-900/30 dark:to-blue-900/30">
                                <Truck className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                              </div>
                              <h5 className="text-lg font-bold text-gray-900 dark:text-white">
                                Assigned Shopper
                              </h5>
                            </div>
                            <div className="space-y-3">
                              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                                <p className="mb-1 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                                  Shopper Name
                                </p>
                                <p className="text-base font-bold text-gray-900 dark:text-white">
                                  {orderDetails.shopper.name || "Not assigned"}
                                </p>
                              </div>
                              {orderDetails.shopper.phone && (
                                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                                  <Phone className="h-4 w-4 flex-shrink-0 text-gray-500" />
                                  <div className="flex-1">
                                    <p className="mb-1 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
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
                      <div className="py-16 text-center">
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                          <Package className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
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
                    <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700">
                      <h4 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                        {selectedItem.name}
                      </h4>
                      {selectedItem.price && (
                        <p className="mb-2 text-2xl font-bold text-green-600 dark:text-green-400">
                          {selectedItem.price}{" "}
                          {selectedItem.unit ? `/ ${selectedItem.unit}` : ""}
                        </p>
                      )}
                    </div>
                    {selectedItem.Description && (
                      <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700">
                        <h5 className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
                          Description
                        </h5>
                        <p className="text-gray-600 dark:text-gray-400">
                          {selectedItem.Description}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {sectionId === "stores" && (
                  <>
                    {/* Store Header - Minimal */}
                    <div className="mb-4 rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4 dark:border-green-800/50 dark:from-green-900/20 dark:to-emerald-900/20">
                      <div className="flex items-center gap-3">
                        {selectedItem.image && (
                          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-white dark:bg-gray-700">
                            <img
                              src={selectedItem.image}
                              alt={selectedItem.name || "Store"}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                e.currentTarget.nextElementSibling?.classList.remove(
                                  "hidden"
                                );
                              }}
                            />
                            <Store className="hidden h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h4 className="mb-1 text-lg font-bold text-gray-900 dark:text-white">
                            {selectedItem.name || "Store"}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {storeProducts.length}{" "}
                            {storeProducts.length === 1
                              ? "product"
                              : "products"}
                          </p>
                        </div>
                        {selectedItem.is_active !== undefined && (
                          <span
                            className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
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
                      <div className="grid animate-pulse grid-cols-2 gap-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div
                            key={i}
                            className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                          >
                            {/* Image Skeleton */}
                            <div className="aspect-square w-full bg-gray-200 dark:bg-gray-700"></div>
                            {/* Content Skeleton */}
                            <div className="flex flex-1 flex-col space-y-2 p-3">
                              <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
                              <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
                              <div className="mt-2 flex items-baseline gap-1">
                                <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
                                <div className="h-3 w-12 rounded bg-gray-200 dark:bg-gray-700"></div>
                              </div>
                              <div className="mt-auto flex justify-center gap-2 pt-2">
                                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : storeProducts.length === 0 ? (
                      <div className="py-16 text-center">
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                          <Package className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
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
                                    <CheckCircle
                                      className="h-2 w-2"
                                      style={{ color: "#ffffff" }}
                                    />
                                  ) : (
                                    <XCircle
                                      className="h-2 w-2"
                                      style={{ color: "#ffffff" }}
                                    />
                                  )}
                                  <span style={{ color: "#ffffff" }}>
                                    {product.status === "active"
                                      ? "Active"
                                      : "Inactive"}
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
                              <div className="mt-auto flex justify-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditProduct(product);
                                  }}
                                  className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 shadow-sm transition-all hover:bg-blue-600 hover:shadow-md active:scale-95"
                                  style={{ color: "#ffffff" }}
                                  title="Edit"
                                >
                                  <Edit
                                    className="h-4 w-4"
                                    style={{
                                      color: "#ffffff",
                                      stroke: "#ffffff",
                                    }}
                                  />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteProduct(product);
                                  }}
                                  className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 shadow-sm transition-all hover:bg-red-600 hover:shadow-md active:scale-95"
                                  style={{ color: "#ffffff" }}
                                  title="Delete"
                                >
                                  <Trash2
                                    className="h-4 w-4"
                                    style={{
                                      color: "#ffffff",
                                      stroke: "#ffffff",
                                    }}
                                  />
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
                    <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700">
                      <h4 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                        Contract #{selectedItem.id?.slice(0, 8) || "N/A"}
                      </h4>
                      <span
                        className={`inline-block rounded-md px-3 py-1 text-xs font-semibold ${
                          selectedItem.status === "active"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {selectedItem.status || "Active"}
                      </span>
                    </div>
                    {selectedItem.created_at && (
                      <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700">
                        <h5 className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
                          Created Date
                        </h5>
                        <p className="text-gray-600 dark:text-gray-400">
                          {new Date(
                            selectedItem.created_at
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {selectedItem.title && (
                      <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700">
                        <h5 className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
                          Title
                        </h5>
                        <p className="text-gray-600 dark:text-gray-400">
                          {selectedItem.title}
                        </p>
                      </div>
                    )}
                    {selectedItem.supplierCompany && (
                      <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700">
                        <h5 className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
                          Supplier
                        </h5>
                        <p className="text-gray-600 dark:text-gray-400">
                          {selectedItem.supplierCompany}
                        </p>
                      </div>
                    )}
                    {onViewContract && selectedItem.id && (
                      <div className="mt-4">
                        <button
                          onClick={() => {
                            onViewContract(selectedItem.id);
                          }}
                          className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-green-700 active:scale-95 dark:bg-green-700 dark:hover:bg-green-800"
                        >
                          <Eye className="h-5 w-5" />
                          View Full Contract
                        </button>
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
      className="fixed inset-0 z-[9999] flex flex-col bg-black/50 backdrop-blur-sm"
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
        className="mt-[5vh] flex h-[92vh] flex-col rounded-t-3xl bg-white shadow-2xl dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between rounded-t-3xl border-b border-gray-200 bg-white px-5 py-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gray-100 p-2 dark:bg-gray-700">
              <Icon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {title}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {filteredItems.length} items
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 active:scale-95 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-600 dark:bg-gray-700/50">
          <div className="mb-2 flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={`Search ${title.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-full border border-gray-200 bg-white px-4 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:ring-offset-gray-800"
              />
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`rounded-full px-4 py-2.5 text-sm font-semibold transition-all ${
                showFilters || selectedFilter !== "all"
                  ? "bg-green-500 text-white shadow-md"
                  : "border border-gray-200 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              <Filter className="mr-1 inline h-4 w-4" />
              Filter
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-2 flex flex-wrap gap-2">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSelectedFilter(option.value);
                    setShowFilters(false);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    selectedFilter === option.value
                      ? "bg-green-500 text-white shadow-md"
                      : "border border-gray-200 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
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
            <div className="animate-pulse space-y-3 p-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="h-5 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
                      <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                    <div className="h-6 w-16 rounded-md bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
                    <div className="h-3 w-5/6 rounded bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                  <div className="mt-3 flex gap-4">
                    <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
                    <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                <Icon className="h-10 w-10 text-gray-400" />
              </div>
              <p className="mb-1 text-lg font-semibold text-gray-600 dark:text-gray-400">
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
                  : sectionId === "rfq-opportunities"
                  ? "No RFQ opportunities available"
                  : "No contracts found"}
              </p>
            </div>
          ) : (
            <div className="space-y-3 p-4">
              {sectionId === "rfqs" &&
                filteredItems.map((rfq: any) => (
                  <RFQCard key={rfq.id} rfq={rfq} onView={handleItemClick} />
                ))}
              {sectionId === "rfq-opportunities" &&
                filteredItems.map((rfq: any) => (
                  <RFQOpportunityCard
                    key={rfq.id}
                    rfq={rfq}
                    onView={handleItemClick}
                    submittedQuotes={submittedQuotes}
                  />
                ))}
              {sectionId === "quotes" &&
                filteredItems.map((quote: any) => (
                  <QuoteCard
                    key={quote.id}
                    quote={quote}
                    onView={handleItemClick}
                  />
                ))}
              {sectionId === "orders" &&
                filteredItems.map((order: any) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onView={handleItemClick}
                  />
                ))}
              {sectionId === "services" &&
                filteredItems.map((service: any) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onView={handleItemClick}
                  />
                ))}
              {sectionId === "stores" &&
                filteredItems.map((store: any) => (
                  <StoreCard
                    key={store.id}
                    store={store}
                    onView={handleItemClick}
                  />
                ))}
              {sectionId === "contracts" &&
                filteredItems.map((contract: any) => (
                  <ContractCard
                    key={contract.id}
                    contract={contract}
                    onView={
                      onViewContract
                        ? () => {
                            // Directly open the contract drawer, matching desktop behavior
                            onViewContract(contract.id);
                          }
                        : handleItemClick
                    }
                  />
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Quote Submission Form - Full screen on mobile */}
      {isQuoteFormOpen && selectedRFQForQuote && (
        <div className="fixed inset-0 z-[10001]">
          <QuoteSubmissionForm
            isOpen={isQuoteFormOpen}
            onClose={() => {
              setIsQuoteFormOpen(false);
              setSelectedRFQForQuote(null);
              setIsOpeningQuoteForm(false);
            }}
            rfqId={selectedRFQForQuote.id}
            rfqTitle={selectedRFQForQuote.title}
            onSuccess={handleQuoteSubmitted}
          />
        </div>
      )}

      {/* Submitted Quote Details - Full screen on mobile */}
      {isQuoteDetailsOpen && selectedQuote && selectedRFQForQuote && (
        <div className="fixed inset-0 z-[10001]">
          <SubmittedQuoteDetails
            isOpen={isQuoteDetailsOpen}
            onClose={() => {
              setIsQuoteDetailsOpen(false);
              setSelectedQuote(null);
              setSelectedRFQForQuote(null);
            }}
            quote={selectedQuote}
            rfqTitle={selectedRFQForQuote.title || "RFQ"}
          />
        </div>
      )}
    </div>
  );
}

// Individual Card Components
function RFQCard({ rfq, onView }: { rfq: any; onView: (item: any) => void }) {
  return (
    <div
      onClick={() => onView(rfq)}
      className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all hover:border-green-300 hover:shadow-md active:scale-[0.98] dark:border-gray-600 dark:bg-gray-800 dark:hover:border-green-600"
    >
      <div className="mb-2 flex items-start justify-between">
        <h4 className="flex-1 text-base font-bold text-gray-900 dark:text-white">
          {rfq.title || `RFQ #${rfq.id.slice(0, 8)}`}
        </h4>
        <span
          className={`ml-2 rounded-md px-2.5 py-1 text-xs font-semibold ${
            rfq.open
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-400"
          }`}
        >
          {rfq.open ? "Open" : "Closed"}
        </span>
      </div>
      {rfq.description && (
        <p className="mb-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
          {rfq.description}
        </p>
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

function QuoteCard({
  quote,
  onView,
}: {
  quote: any;
  onView: (item: any) => void;
}) {
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
  const rfqTitle =
    quote.bussines_RFQ?.title ||
    quote.rfq?.title ||
    `RFQ #${quote.businessRfq_id?.slice(0, 8)}`;
  const rfqRequesterName =
    quote.bussines_RFQ?.business_account?.business_name || "Unknown Business";

  return (
    <div
      onClick={() => onView(quote)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white via-gray-50 to-white p-5 shadow-md transition-all duration-300 hover:border-green-400 hover:shadow-xl hover:shadow-green-500/20 active:scale-[0.97] dark:border-gray-700 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 dark:hover:border-green-600"
    >
      {/* Decorative gradient overlay on hover */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-green-50/0 via-emerald-50/0 to-teal-50/0 transition-opacity duration-300 group-hover:from-green-50/50 group-hover:via-emerald-50/30 group-hover:to-teal-50/50 dark:group-hover:from-green-900/10 dark:group-hover:via-emerald-900/5 dark:group-hover:to-teal-900/10"></div>

      <div className="relative flex flex-col gap-4">
        {/* Header Section */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-2 text-base font-bold leading-tight text-gray-900 transition-colors group-hover:text-green-600 dark:text-white">
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
          <div className="flex flex-shrink-0 flex-col items-end gap-2">
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
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                  Delivery
                </p>
                <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">
                  {quote.delivery_time}
                </p>
              </div>
            </div>
          )}
          {quote.quote_validity && (
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30">
                <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                  Valid Until
                </p>
                <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">
                  {quote.quote_validity}
                </p>
              </div>
            </div>
          )}
          {quote.bussines_RFQ?.location && (
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30">
                <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                  Location
                </p>
                <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">
                  {quote.bussines_RFQ.location}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Price and Action */}
        <div className="flex items-center justify-between gap-3 rounded-xl border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white pt-4 dark:border-gray-700 dark:from-gray-800/50 dark:to-gray-800">
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {quote.qouteAmount
                  ? formatCurrency(quote.qouteAmount, quote.currency)
                  : "N/A"}
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
                {quote.created_at
                  ? formatDate(quote.created_at)
                  : "Not specified"}
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

function OrderCard({
  order,
  onView,
}: {
  order: any;
  onView: (item: any) => void;
}) {
  // Get query_id from order items if available
  const queryId = order.allProducts?.[0]?.query_id || order.query_id || null;

  return (
    <div
      onClick={() => onView(order)}
      className="group cursor-pointer rounded-2xl border-2 border-gray-200 bg-white p-4 transition-all duration-300 hover:border-green-400 hover:shadow-xl active:scale-[0.98] dark:border-gray-600 dark:bg-gray-800 dark:hover:border-green-600"
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <div className="rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 p-2 dark:from-blue-900/30 dark:to-indigo-900/30">
              <ShoppingCart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="text-base font-bold text-gray-900 dark:text-white">
                {queryId || order.OrderID || order.id?.slice(0, 8) || "N/A"}
              </h4>
              {queryId && (
                <p className="font-mono text-xs text-gray-500 dark:text-gray-400">
                  Query ID
                </p>
              )}
            </div>
          </div>
          {order.created_at && (
            <div className="ml-10 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="h-3 w-3" />
              {new Date(order.created_at).toLocaleDateString()}
            </div>
          )}
        </div>
        <span
          className={`rounded-xl px-3 py-1.5 text-xs font-bold shadow-md ${
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
        <div className="mt-3 flex items-center justify-between border-t-2 border-gray-200 pt-3 dark:border-gray-700">
          <span className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
            Total:
          </span>
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

function ServiceCard({
  service,
  onView,
}: {
  service: any;
  onView: (item: any) => void;
}) {
  return (
    <div
      onClick={() => onView(service)}
      className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all hover:border-green-300 hover:shadow-md active:scale-[0.98] dark:border-gray-600 dark:bg-gray-800 dark:hover:border-green-600"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700">
          <Package className="h-6 w-6 text-gray-500" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="mb-1 text-base font-bold text-gray-900 dark:text-white">
            {service.name}
          </h4>
          {service.price && (
            <p className="mb-1 text-sm font-semibold text-green-600 dark:text-green-400">
              {service.price} {service.unit ? `/ ${service.unit}` : ""}
            </p>
          )}
          {service.Description && (
            <p className="line-clamp-2 text-xs text-gray-600 dark:text-gray-400">
              {service.Description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function StoreCard({
  store,
  onView,
}: {
  store: any;
  onView: (item: any) => void;
}) {
  return (
    <div
      onClick={() => onView(store)}
      className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all hover:border-green-300 hover:shadow-md active:scale-[0.98] dark:border-gray-600 dark:bg-gray-800 dark:hover:border-green-600"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700">
          <Store className="h-6 w-6 text-gray-500" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="mb-1 text-base font-bold text-gray-900 dark:text-white">
            {store.name || "Store"}
          </h4>
          {store.description && (
            <p className="line-clamp-2 text-xs text-gray-600 dark:text-gray-400">
              {store.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ContractCard({
  contract,
  onView,
}: {
  contract: any;
  onView: (item: any) => void;
}) {
  const statusColors: Record<string, string> = {
    active:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    pending:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    waiting_for_supplier:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    completed:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    terminated: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    expired: "bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-400",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    draft: "bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-400",
  };

  const statusColor =
    statusColors[contract.status?.toLowerCase() || "active"] ||
    statusColors.active;

  return (
    <div
      onClick={() => onView(contract)}
      className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all hover:border-green-300 hover:shadow-md active:scale-[0.98] dark:border-gray-600 dark:bg-gray-800 dark:hover:border-green-600"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-base font-bold text-gray-900 dark:text-white">
            {contract.title || `Contract #${contract.id?.slice(0, 8) || "N/A"}`}
          </h4>
          {contract.supplierCompany && (
            <p className="mt-1 truncate text-sm text-gray-600 dark:text-gray-400">
              {contract.supplierCompany}
            </p>
          )}
        </div>
        <span
          className={`ml-2 flex-shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold ${statusColor}`}
        >
          {contract.status?.replace("_", " ") || "Active"}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
        {contract.created_at && (
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{new Date(contract.created_at).toLocaleDateString()}</span>
          </div>
        )}
        {contract.totalValue && (
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            <span>
              {formatCurrencySync(contract.totalValue)}{" "}
              {contract.currency || "RWF"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function RFQOpportunityCard({
  rfq,
  onView,
  submittedQuotes,
}: {
  rfq: any;
  onView: (item: any) => void;
  submittedQuotes: Record<string, any>;
}) {
  const minBudget = rfq.min_budget ? parseFloat(rfq.min_budget) : 0;
  const maxBudget = rfq.max_budget ? parseFloat(rfq.max_budget) : 0;
  const budgetDisplay =
    minBudget > 0 && maxBudget > 0
      ? `${formatCurrencySync(minBudget)} - ${formatCurrencySync(maxBudget)}`
      : minBudget > 0
      ? `${formatCurrencySync(minBudget)}+`
      : maxBudget > 0
      ? `Up to ${formatCurrencySync(maxBudget)}`
      : "Not specified";

  // Calculate urgency
  const today = new Date();
  const deadline = rfq.response_date ? new Date(rfq.response_date) : null;
  const isUrgent =
    deadline &&
    deadline.getTime() - today.getTime() < 3 * 24 * 60 * 60 * 1000 &&
    deadline > today;
  const isClosed = deadline && deadline < today;
  const status = isClosed ? "Closed" : isUrgent ? "Urgent" : "Open";

  const postedBy =
    rfq.business_account?.business_name ||
    rfq.contact_name ||
    "Unknown Business";

  // Calculate days until deadline
  const getDaysUntilDeadline = () => {
    if (!deadline) return null;
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = getDaysUntilDeadline();

  return (
    <div
      onClick={() => onView(rfq)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white via-gray-50 to-white p-5 shadow-md transition-all duration-300 hover:border-green-400 hover:shadow-xl hover:shadow-green-500/20 active:scale-[0.97] dark:border-gray-700 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 dark:hover:border-green-600"
    >
      {/* Decorative gradient overlay on hover */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-green-50/0 via-emerald-50/0 to-teal-50/0 transition-opacity duration-300 group-hover:from-green-50/50 group-hover:via-emerald-50/30 group-hover:to-teal-50/50 dark:group-hover:from-green-900/10 dark:group-hover:via-emerald-900/5 dark:group-hover:to-teal-900/10"></div>

      <div className="relative flex flex-col gap-4">
        {/* Header Section */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                <FileText
                  className="h-5 w-5 text-white"
                  style={{ color: "#ffffff", stroke: "#ffffff" }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="line-clamp-2 text-base font-bold leading-tight text-gray-900 transition-colors group-hover:text-green-600 dark:text-white">
                  {rfq.title || `RFQ #${rfq.id?.slice(0, 8)}`}
                </h4>
              </div>
            </div>

            {/* Posted By */}
            <div className="mb-2 ml-12 flex items-center gap-2 rounded-lg bg-gray-100/80 px-3 py-1.5 dark:bg-gray-700/50">
              <Building className="h-3.5 w-3.5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
              <span className="truncate text-xs font-semibold text-gray-700 dark:text-gray-300">
                {postedBy}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex flex-shrink-0 flex-col items-end gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold shadow-sm ${
                status === "Urgent"
                  ? "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-md shadow-red-500/30"
                  : status === "Closed"
                  ? "bg-gray-500 text-white"
                  : "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md shadow-green-500/30"
              }`}
              style={
                status !== "Urgent" && status !== "Closed"
                  ? { color: "#ffffff" }
                  : undefined
              }
            >
              {status === "Urgent" && (
                <AlertCircle className="h-3 w-3" style={{ color: "#ffffff" }} />
              )}
              {status}
            </span>
            {submittedQuotes[rfq.id] && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 px-3 py-1.5 text-[11px] font-bold text-white shadow-md shadow-blue-500/30"
                style={{ color: "#ffffff" }}
              >
                <CheckCircle
                  className="h-3 w-3"
                  style={{ color: "#ffffff", stroke: "#ffffff" }}
                />
                <span style={{ color: "#ffffff" }}>Quote Sent</span>
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {rfq.description && (
          <p className="ml-12 line-clamp-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            {rfq.description}
          </p>
        )}

        {/* Details Grid */}
        <div className="ml-12 grid grid-cols-1 gap-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 p-3 dark:from-gray-700/30 dark:to-gray-800/30">
          {rfq.category && (
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30">
                <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                  Category
                </p>
                <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">
                  {rfq.category}
                </p>
              </div>
            </div>
          )}
          {rfq.location && (
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
                <MapPin className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                  Location
                </p>
                <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">
                  {rfq.location}
                </p>
              </div>
            </div>
          )}
          {rfq.response_date && (
            <div className="flex items-center gap-2.5">
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                  isUrgent
                    ? "bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30"
                    : "bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30"
                }`}
              >
                <Calendar
                  className={`h-4 w-4 ${
                    isUrgent
                      ? "text-red-600 dark:text-red-400"
                      : "text-orange-600 dark:text-orange-400"
                  }`}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                  Deadline
                </p>
                <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">
                  {new Date(rfq.response_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  {daysLeft !== null && daysLeft > 0 && (
                    <span
                      className={`ml-1 ${
                        isUrgent
                          ? "font-bold text-red-600 dark:text-red-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      ({daysLeft} {daysLeft === 1 ? "day" : "days"} left)
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Budget and Action */}
        <div className="flex items-center justify-between gap-3 rounded-xl border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white pt-4 dark:border-gray-700 dark:from-gray-800/50 dark:to-gray-800">
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {budgetDisplay}
              </p>
            </div>
            <p className="mt-1 text-[10px] font-medium text-gray-500 dark:text-gray-400">
              Budget Range
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView(rfq);
            }}
            className="flex flex-shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-green-500/30 transition-all duration-300 hover:from-green-600 hover:to-emerald-600 hover:shadow-xl hover:shadow-green-500/40 active:scale-95"
            style={{ color: "#ffffff" }}
          >
            <Eye
              className="h-4 w-4"
              style={{ color: "#ffffff", stroke: "#ffffff" }}
            />
            <span style={{ color: "#ffffff" }}>View</span>
          </button>
        </div>
      </div>
    </div>
  );
}
