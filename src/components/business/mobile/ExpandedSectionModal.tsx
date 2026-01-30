"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/router";
import {
  FileText,
  ShoppingCart,
  Package,
  Store,
  Briefcase,
  X,
  Calendar,
  MapPin,
  Clock,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  User,
  Phone,
  Mail,
  DollarSign,
  Truck,
  Download,
  Building,
  MessageSquare,
  Package as PackageIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { formatCurrencySync } from "../../../utils/formatCurrency";
import { QuoteSubmissionForm } from "../QuoteSubmissionForm";
import { SubmittedQuoteDetails } from "../SubmittedQuoteDetails";
import { ExpandedSectionModalList } from "./ExpandedSectionModalList";
import {
  QuoteDetailContent,
  OrderDetailContent,
  StoreDetailContent,
  ContractDetailContent,
  ServiceDetailContent,
} from "./ExpandedSectionModalDetail";

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
  onCreateStore?: () => void; // Callback to open create store modal
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
  onCreateStore,
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

                {sectionId === "quotes" && (
                  <QuoteDetailContent
                    selectedItem={selectedItem}
                    quoteActiveTab={quoteActiveTab}
                    setQuoteActiveTab={setQuoteActiveTab}
                  />
                )}


                {sectionId === "orders" && (
                  <OrderDetailContent
                    loadingOrderDetails={loadingOrderDetails}
                    orderDetails={orderDetails}
                  />
                )}

                {sectionId === "services" && (
                  <ServiceDetailContent selectedItem={selectedItem} />
                )}

                {sectionId === "stores" && (
                  <StoreDetailContent
                    selectedItem={selectedItem}
                    storeProducts={storeProducts}
                    loadingProducts={loadingProducts}
                    onEditProduct={handleEditProduct}
                    onDeleteProduct={handleDeleteProduct}
                  />
                )}

                {sectionId === "contracts" && (
                  <ContractDetailContent
                    selectedItem={selectedItem}
                    onViewContract={onViewContract}
                  />
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
      <ExpandedSectionModalList
        sectionId={sectionId}
        title={title}
        Icon={Icon}
        filteredItems={filteredItems}
        loading={loading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        selectedFilter={selectedFilter}
        onFilterSelect={(value) => {
          setSelectedFilter(value);
          setShowFilters(false);
        }}
        filterOptions={filterOptions}
        onItemClick={handleItemClick}
        submittedQuotes={submittedQuotes}
        onViewContract={onViewContract}
        onCreateStore={onCreateStore}
        onClose={onClose}
      />

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
