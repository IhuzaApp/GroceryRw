"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Star,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Building,
  Award,
  TrendingUp,
  Filter,
  Search,
  SortAsc,
  Loader2,
} from "lucide-react";
import { ContractAssignmentModal } from "./ContractAssignmentModal";
import { formatCurrencySync } from "../../utils/formatCurrency";
import toast from "react-hot-toast";

interface RFQResponse {
  id: string;
  supplierId: string;
  supplierName: string;
  supplierCompany: string;
  supplierRating: number;
  supplierReviews: number;
  supplierLocation: string;
  supplierImage: string;
  quoteAmount: number;
  currency: string;
  deliveryTime: string;
  validity: string;
  status: "pending" | "accepted" | "rejected" | "negotiating";
  submittedAt: string;
  message: string;
  attachments: Array<{
    name: string;
    type: string;
    size: string;
    url: string;
  }>;
  certifications: string[];
  experience: string;
  previousClients: string[];
  terms: {
    payment: string;
    warranty: string;
    delivery: string;
    cancellation: string;
  };
  contactInfo: {
    name: string;
    email: string;
    phone: string;
    position: string;
  };
}

interface RFQDetails {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: {
    min: number;
    max: number;
  };
  location: string;
  deadline: string;
  status: string;
  created: string;
  requirements: string[];
}

interface RFQResponsesViewProps {
  rfqId: string;
  onBack: () => void;
  onAcceptResponse: (responseId: string) => void;
  onRejectResponse: (responseId: string) => void;
  onMessageSupplier: (supplierId: string) => void;
  onAssignContract?: (contractData: any) => void;
}

const mockRFQDetails: RFQDetails = {
  id: "RFQ-001",
  title: "Weekly Fresh Produce Supply",
  description:
    "Looking for reliable supplier for weekly fresh produce delivery to our restaurant chain. We need consistent quality and timely delivery.",
  category: "Vegetables",
  budget: { min: 2000, max: 3000 },
  location: "New York, NY",
  deadline: "2024-01-20",
  status: "Open",
  created: "2024-01-10",
  requirements: [
    "Organic certification required",
    "Weekly delivery schedule",
    "Temperature-controlled transportation",
    "Quality guarantee",
    "Flexible payment terms",
  ],
};

const mockResponses: RFQResponse[] = [
  {
    id: "RESP-001",
    supplierId: "SUP-001",
    supplierName: "John Smith",
    supplierCompany: "Green Valley Farms",
    supplierRating: 4.8,
    supplierReviews: 127,
    supplierLocation: "California, USA",
    supplierImage: "/api/placeholder/40/40",
    quoteAmount: 2800,
    currency: "USD",
    deliveryTime: "3-5 business days",
    validity: "30 days",
    status: "pending",
    submittedAt: "2024-01-15T10:30:00Z",
    message:
      "We can provide premium organic vegetables with full certification. Our farm has been family-owned for 3 generations and we specialize in restaurant supply chains.",
    attachments: [
      { name: "Certification.pdf", type: "PDF", size: "2.3 MB", url: "#" },
      { name: "Product_Catalog.pdf", type: "PDF", size: "5.1 MB", url: "#" },
    ],
    certifications: ["USDA Organic", "GAP Certified", "ISO 22000"],
    experience: "15 years",
    previousClients: ["Restaurant A", "Hotel B", "Catering C"],
    terms: {
      payment: "Net 30",
      warranty: "100% satisfaction guarantee",
      delivery: "Free delivery within 50 miles",
      cancellation: "24-hour notice required",
    },
    contactInfo: {
      name: "John Smith",
      email: "john@greenvalleyfarms.com",
      phone: "+1 (555) 123-4567",
      position: "Sales Manager",
    },
  },
  {
    id: "RESP-002",
    supplierId: "SUP-002",
    supplierName: "Sarah Johnson",
    supplierCompany: "Fresh Harvest Co.",
    supplierRating: 4.6,
    supplierReviews: 89,
    supplierLocation: "Texas, USA",
    supplierImage: "/api/placeholder/40/40",
    quoteAmount: 2650,
    currency: "USD",
    deliveryTime: "2-4 business days",
    validity: "45 days",
    status: "pending",
    submittedAt: "2024-01-16T14:20:00Z",
    message:
      "We offer competitive pricing with excellent quality. Our logistics network ensures fresh delivery and we can customize orders based on your needs.",
    attachments: [
      { name: "Company_Profile.pdf", type: "PDF", size: "1.8 MB", url: "#" },
      { name: "Price_List.xlsx", type: "XLSX", size: "456 KB", url: "#" },
    ],
    certifications: ["USDA Organic", "HACCP"],
    experience: "8 years",
    previousClients: ["Restaurant D", "Café E"],
    terms: {
      payment: "Net 15",
      warranty: "Quality guarantee",
      delivery: "Free delivery",
      cancellation: "48-hour notice",
    },
    contactInfo: {
      name: "Sarah Johnson",
      email: "sarah@freshharvest.com",
      phone: "+1 (555) 987-6543",
      position: "Business Development",
    },
  },
  {
    id: "RESP-003",
    supplierId: "SUP-003",
    supplierName: "Mike Chen",
    supplierCompany: "Urban Garden Supply",
    supplierRating: 4.9,
    supplierReviews: 203,
    supplierLocation: "New York, NY",
    supplierImage: "/api/placeholder/40/40",
    quoteAmount: 2950,
    currency: "USD",
    deliveryTime: "1-2 business days",
    validity: "60 days",
    status: "accepted",
    submittedAt: "2024-01-14T09:15:00Z",
    message:
      "Local supplier with same-day delivery capability. We understand the NYC market and can provide the freshest produce with competitive pricing.",
    attachments: [
      {
        name: "Local_Certifications.pdf",
        type: "PDF",
        size: "1.2 MB",
        url: "#",
      },
      { name: "Delivery_Schedule.pdf", type: "PDF", size: "890 KB", url: "#" },
    ],
    certifications: ["USDA Organic", "Local Food", "Sustainable"],
    experience: "12 years",
    previousClients: ["Restaurant F", "Hotel G", "Catering H", "Restaurant I"],
    terms: {
      payment: "Net 30",
      warranty: "Full refund if unsatisfied",
      delivery: "Same-day delivery available",
      cancellation: "Flexible terms",
    },
    contactInfo: {
      name: "Mike Chen",
      email: "mike@urbangarden.com",
      phone: "+1 (555) 456-7890",
      position: "Owner",
    },
  },
];

export function RFQResponsesView({
  rfqId,
  onBack,
  onAcceptResponse,
  onRejectResponse,
  onMessageSupplier,
  onAssignContract,
}: RFQResponsesViewProps) {
  const [selectedResponse, setSelectedResponse] = useState<RFQResponse | null>(
    null
  );
  const [sortBy, setSortBy] = useState<"price" | "rating" | "submitted">(
    "submitted"
  );
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "accepted" | "rejected"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [contractResponse, setContractResponse] = useState<RFQResponse | null>(
    null
  );
  const [rfqDetails, setRfqDetails] = useState<RFQDetails | null>(null);
  const [responses, setResponses] = useState<RFQResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRFQData();
  }, [rfqId]);

  const fetchRFQData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/queries/rfq-details-and-responses?rfq_id=${rfqId}`
      );
      if (response.ok) {
        const data = await response.json();

        // Transform RFQ details
        const rfq = data.rfq;
        const requirements = rfq.requirements
          ? typeof rfq.requirements === "string"
            ? JSON.parse(rfq.requirements)
            : Array.isArray(rfq.requirements)
            ? rfq.requirements
            : []
          : [];

        const transformedRFQ: RFQDetails = {
          id: rfq.id,
          title: rfq.title || "Untitled RFQ",
          description: rfq.description || "",
          category: rfq.category || "General",
          budget: {
            min: rfq.min_budget ? parseFloat(rfq.min_budget) : 0,
            max: rfq.max_budget ? parseFloat(rfq.max_budget) : 0,
          },
          location: rfq.location || "Not specified",
          deadline: rfq.response_date || "",
          status: rfq.open ? "Open" : "Closed",
          created: rfq.created_at,
          requirements: requirements,
        };
        setRfqDetails(transformedRFQ);

        // Transform responses
        const transformedResponses: RFQResponse[] = (data.responses || []).map(
          (quote: any) => {
            const attachments = [];
            if (quote.attachement)
              attachments.push({
                name: "Attachment 1",
                type: "PDF",
                size: "N/A",
                url: quote.attachement,
              });
            if (quote.attachment_1)
              attachments.push({
                name: "Attachment 2",
                type: "PDF",
                size: "N/A",
                url: quote.attachment_1,
              });
            if (quote.attachment_2)
              attachments.push({
                name: "Attachment 3",
                type: "PDF",
                size: "N/A",
                url: quote.attachment_2,
              });

            return {
              id: quote.id,
              supplierId: quote.respond_business_id,
              supplierName:
                quote.business_account?.Users?.name ||
                quote.business_account?.business_name ||
                "Unknown",
              supplierCompany:
                quote.business_account?.business_name || "Unknown Company",
              supplierRating: 4.5, // Default - can be enhanced with actual ratings
              supplierReviews: 0, // Default - can be enhanced with actual reviews
              supplierLocation:
                quote.business_account?.business_location || "Not specified",
              supplierImage:
                quote.business_account?.face_image ||
                "/images/shop-placeholder.jpg",
              quoteAmount: parseFloat(quote.qouteAmount || "0"),
              currency: quote.currency || "RWF",
              deliveryTime: quote.delivery_time || "Not specified",
              validity: quote.quote_validity || "Not specified",
              status: (quote.status || "pending") as
                | "pending"
                | "accepted"
                | "rejected"
                | "negotiating",
              submittedAt: quote.created_at,
              message: quote.message || "",
              attachments: attachments,
              certifications: [], // Can be enhanced later
              experience: "", // Can be enhanced later
              previousClients: [], // Can be enhanced later
              terms: {
                payment: quote.PaymentTerms || "Not specified",
                warranty: quote.warrantly || "Not specified",
                delivery: quote.DeliveryTerms || "Not specified",
                cancellation: quote.cancellatioinTerms || "Not specified",
              },
              contactInfo: {
                name:
                  quote.business_account?.Users?.name ||
                  quote.business_account?.business_name ||
                  "N/A",
                email:
                  quote.business_account?.business_email ||
                  quote.business_account?.Users?.email ||
                  "N/A",
                phone:
                  quote.business_account?.business_phone ||
                  quote.business_account?.Users?.phone ||
                  "N/A",
                position: "Contact",
              },
            };
          }
        );
        setResponses(transformedResponses);
      } else {
        const errorData = await response.json();
        toast.error("Failed to load RFQ details");
      }
    } catch (error) {
      console.error("Error fetching RFQ data:", error);
      toast.error("Failed to load RFQ details");
    } finally {
      setLoading(false);
    }
  };

  const filteredResponses = responses
    .filter((response) => {
      const matchesSearch =
        response.supplierCompany
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        response.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "all" || response.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price":
          return a.quoteAmount - b.quoteAmount;
        case "rating":
          return b.supplierRating - a.supplierRating;
        case "submitted":
          return (
            new Date(b.submittedAt).getTime() -
            new Date(a.submittedAt).getTime()
          );
        default:
          return 0;
      }
    });

  const handleAcceptResponse = (responseId: string) => {
    const response = responses.find((r) => r.id === responseId);
    if (response) {
      setContractResponse(response);
      setIsContractModalOpen(true);
    }
  };

  const handleContractAssignment = (contractData: any) => {
    if (onAssignContract) {
      onAssignContract(contractData);
    }
    onAcceptResponse(contractData.rfqId);
    setIsContractModalOpen(false);
    setContractResponse(null);
  };

  const handleRejectResponse = (responseId: string) => {
    onRejectResponse(responseId);
    setSelectedResponse(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "negotiating":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      case "negotiating":
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">
          Loading RFQ details...
        </span>
      </div>
    );
  }

  if (!rfqDetails) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-600 dark:text-gray-400">RFQ not found</p>
        <button
          onClick={onBack}
          className="mt-4 rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600"
          style={{ color: "#ffffff" }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onBack}
            className="rounded-lg p-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 sm:p-2"
          >
            <ArrowLeft className="h-4 w-4 text-gray-600 dark:text-gray-400 sm:h-5 sm:w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl md:text-2xl">
              RFQ Responses
            </h2>
            <p className="truncate text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
              {rfqDetails.title}
            </p>
          </div>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
          {filteredResponses.length} responses
        </div>
      </div>

      {/* RFQ Details Summary */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          RFQ Details
        </h3>
        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Budget:
            </span>
            <p className="text-gray-900 dark:text-white">
              {rfqDetails.budget.min > 0 && rfqDetails.budget.max > 0
                ? `${formatCurrencySync(
                    rfqDetails.budget.min
                  )} - ${formatCurrencySync(rfqDetails.budget.max)}`
                : rfqDetails.budget.min > 0
                ? `${formatCurrencySync(rfqDetails.budget.min)}+`
                : rfqDetails.budget.max > 0
                ? `Up to ${formatCurrencySync(rfqDetails.budget.max)}`
                : "Not specified"}
            </p>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Location:
            </span>
            <p className="text-gray-900 dark:text-white">
              {rfqDetails.location}
            </p>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Deadline:
            </span>
            <p className="text-gray-900 dark:text-white">
              {rfqDetails.deadline
                ? new Date(rfqDetails.deadline).toLocaleDateString()
                : "Not specified"}
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:px-3 sm:py-2 sm:text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:px-3 sm:py-2 sm:text-sm"
            >
              <option value="submitted">Sort by Date</option>
              <option value="price">Sort by Price</option>
              <option value="rating">Sort by Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Responses List */}
      <div className="space-y-4">
        {filteredResponses.map((response) => (
          <div
            key={response.id}
            className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:p-6"
          >
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 sm:h-12 sm:w-12">
                  <User className="h-5 w-5 text-gray-500 sm:h-6 sm:w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h4 className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                      {response.supplierCompany}
                    </h4>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium sm:text-xs ${getStatusColor(
                        response.status
                      )}`}
                    >
                      {getStatusIcon(response.status)}
                      {response.status.charAt(0).toUpperCase() +
                        response.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                    by {response.supplierName}
                  </p>
                  <div className="mt-2 flex flex-col gap-1.5 text-xs text-gray-500 dark:text-gray-400 sm:flex-row sm:items-center sm:gap-4 sm:text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 flex-shrink-0 text-yellow-500 sm:h-4 sm:w-4" />
                      <span>{response.supplierRating}</span>
                      <span>({response.supplierReviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
                      <span className="truncate">{response.supplierLocation}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
                      <span>
                        {new Date(response.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50 sm:flex-col sm:items-end sm:justify-start sm:bg-transparent sm:p-0 dark:sm:bg-transparent">
                <div className="text-left sm:text-right">
                  <div className="text-lg font-bold text-gray-900 dark:text-white sm:mb-1 sm:text-xl md:text-2xl">
                    ${response.quoteAmount.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                    {response.deliveryTime}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="line-clamp-2 text-xs leading-relaxed text-gray-700 dark:text-gray-300 sm:line-clamp-none sm:text-sm">
                {response.message}
              </p>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between sm:border-0 sm:pt-0">
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 sm:gap-2 sm:text-sm">
                <span>{response.attachments.length} attachments</span>
                <span className="hidden sm:inline">•</span>
                <span>{response.certifications.length} certifications</span>
                <span className="hidden sm:inline">•</span>
                <span>{response.experience} experience</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedResponse(response)}
                  className="flex-1 rounded-lg border border-blue-300 px-2.5 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 active:scale-95 dark:border-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 sm:flex-none sm:px-3 sm:py-2 sm:text-sm"
                >
                  <span className="hidden sm:inline">View Details</span>
                  <span className="sm:hidden">View</span>
                </button>
                {response.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleAcceptResponse(response.id)}
                      className="flex-1 rounded-lg bg-green-500 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-600 active:scale-95 sm:flex-none sm:px-3 sm:py-2 sm:text-sm"
                      style={{ color: "#ffffff" }}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRejectResponse(response.id)}
                      className="flex-1 rounded-lg bg-red-500 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-600 active:scale-95 sm:flex-none sm:px-3 sm:py-2 sm:text-sm"
                    >
                      Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => onMessageSupplier(response.supplierId)}
                  className="flex-1 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800 active:scale-95 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200 sm:flex-none sm:px-3 sm:py-2 sm:text-sm"
                >
                  Message
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Response Detail Modal */}
      {selectedResponse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-gray-800">
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Response Details
                </h3>
                <button
                  onClick={() => setSelectedResponse(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Supplier Info */}
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                  <h4 className="mb-3 font-semibold text-gray-900 dark:text-white">
                    Supplier Information
                  </h4>
                  <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Company:
                      </span>
                      <p className="text-gray-900 dark:text-white">
                        {selectedResponse.supplierCompany}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Contact:
                      </span>
                      <p className="text-gray-900 dark:text-white">
                        {selectedResponse.contactInfo.name}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Email:
                      </span>
                      <p className="text-gray-900 dark:text-white">
                        {selectedResponse.contactInfo.email}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Phone:
                      </span>
                      <p className="text-gray-900 dark:text-white">
                        {selectedResponse.contactInfo.phone}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quote Details */}
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                  <h4 className="mb-3 font-semibold text-gray-900 dark:text-white">
                    Quote Details
                  </h4>
                  <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Amount:
                      </span>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${selectedResponse.quoteAmount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Delivery Time:
                      </span>
                      <p className="text-gray-900 dark:text-white">
                        {selectedResponse.deliveryTime}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Validity:
                      </span>
                      <p className="text-gray-900 dark:text-white">
                        {selectedResponse.validity}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Attachments */}
                {selectedResponse.attachments.length > 0 && (
                  <div>
                    <h4 className="mb-3 font-semibold text-gray-900 dark:text-white">
                      Attachments
                    </h4>
                    <div className="space-y-2">
                      {selectedResponse.attachments.map((attachment, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {attachment.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {attachment.type} • {attachment.size}
                              </p>
                            </div>
                          </div>
                          <button className="text-blue-600 hover:text-blue-700 dark:hover:text-blue-400">
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Terms */}
                <div>
                  <h4 className="mb-3 font-semibold text-gray-900 dark:text-white">
                    Terms & Conditions
                  </h4>
                  <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Payment:
                      </span>
                      <p className="text-gray-900 dark:text-white">
                        {selectedResponse.terms.payment}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Warranty:
                      </span>
                      <p className="text-gray-900 dark:text-white">
                        {selectedResponse.terms.warranty}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Delivery:
                      </span>
                      <p className="text-gray-900 dark:text-white">
                        {selectedResponse.terms.delivery}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Cancellation:
                      </span>
                      <p className="text-gray-900 dark:text-white">
                        {selectedResponse.terms.cancellation}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 border-t border-gray-200 pt-4 dark:border-gray-600">
                  {selectedResponse.status === "pending" && (
                    <>
                      <button
                        onClick={() =>
                          handleAcceptResponse(selectedResponse.id)
                        }
                        className="flex-1 rounded-lg bg-green-500 px-4 py-2 font-medium text-white transition-colors hover:bg-green-600"
                        style={{ color: "#ffffff" }}
                      >
                        Accept Response
                      </button>
                      <button
                        onClick={() =>
                          handleRejectResponse(selectedResponse.id)
                        }
                        className="flex-1 rounded-lg bg-red-500 px-4 py-2 font-medium text-white transition-colors hover:bg-red-600"
                      >
                        Reject Response
                      </button>
                    </>
                  )}
                  <button
                    onClick={() =>
                      onMessageSupplier(selectedResponse.supplierId)
                    }
                    className="flex-1 rounded-lg bg-blue-500 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-600"
                  >
                    Message Supplier
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contract Assignment Modal */}
      {contractResponse && (
        <ContractAssignmentModal
          isOpen={isContractModalOpen}
          onClose={() => {
            setIsContractModalOpen(false);
            setContractResponse(null);
          }}
          onAssignContract={handleContractAssignment}
          rfqData={{
            id: rfqId,
            title: rfqDetails.title,
            description: rfqDetails.description,
            budget: rfqDetails.budget,
          }}
          supplierData={{
            id: contractResponse.supplierId,
            name: contractResponse.supplierName,
            company: contractResponse.supplierCompany,
            email: contractResponse.contactInfo.email,
            phone: contractResponse.contactInfo.phone,
          }}
        />
      )}
    </div>
  );
}
