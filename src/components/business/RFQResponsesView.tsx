"use client"

import { useState } from "react"
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
} from "lucide-react"
import { ContractAssignmentModal } from "./ContractAssignmentModal"

interface RFQResponse {
  id: string
  supplierId: string
  supplierName: string
  supplierCompany: string
  supplierRating: number
  supplierReviews: number
  supplierLocation: string
  supplierImage: string
  quoteAmount: number
  currency: string
  deliveryTime: string
  validity: string
  status: "pending" | "accepted" | "rejected" | "negotiating"
  submittedAt: string
  message: string
  attachments: Array<{
    name: string
    type: string
    size: string
    url: string
  }>
  certifications: string[]
  experience: string
  previousClients: string[]
  terms: {
    payment: string
    warranty: string
    delivery: string
    cancellation: string
  }
  contactInfo: {
    name: string
    email: string
    phone: string
    position: string
  }
}

interface RFQDetails {
  id: string
  title: string
  description: string
  category: string
  budget: {
    min: number
    max: number
  }
  location: string
  deadline: string
  status: string
  created: string
  requirements: string[]
}

interface RFQResponsesViewProps {
  rfqId: string
  onBack: () => void
  onAcceptResponse: (responseId: string) => void
  onRejectResponse: (responseId: string) => void
  onMessageSupplier: (supplierId: string) => void
  onAssignContract?: (contractData: any) => void
}

const mockRFQDetails: RFQDetails = {
  id: "RFQ-001",
  title: "Weekly Fresh Produce Supply",
  description: "Looking for reliable supplier for weekly fresh produce delivery to our restaurant chain. We need consistent quality and timely delivery.",
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
    "Flexible payment terms"
  ]
}

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
    message: "We can provide premium organic vegetables with full certification. Our farm has been family-owned for 3 generations and we specialize in restaurant supply chains.",
    attachments: [
      { name: "Certification.pdf", type: "PDF", size: "2.3 MB", url: "#" },
      { name: "Product_Catalog.pdf", type: "PDF", size: "5.1 MB", url: "#" }
    ],
    certifications: ["USDA Organic", "GAP Certified", "ISO 22000"],
    experience: "15 years",
    previousClients: ["Restaurant A", "Hotel B", "Catering C"],
    terms: {
      payment: "Net 30",
      warranty: "100% satisfaction guarantee",
      delivery: "Free delivery within 50 miles",
      cancellation: "24-hour notice required"
    },
    contactInfo: {
      name: "John Smith",
      email: "john@greenvalleyfarms.com",
      phone: "+1 (555) 123-4567",
      position: "Sales Manager"
    }
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
    message: "We offer competitive pricing with excellent quality. Our logistics network ensures fresh delivery and we can customize orders based on your needs.",
    attachments: [
      { name: "Company_Profile.pdf", type: "PDF", size: "1.8 MB", url: "#" },
      { name: "Price_List.xlsx", type: "XLSX", size: "456 KB", url: "#" }
    ],
    certifications: ["USDA Organic", "HACCP"],
    experience: "8 years",
    previousClients: ["Restaurant D", "Café E"],
    terms: {
      payment: "Net 15",
      warranty: "Quality guarantee",
      delivery: "Free delivery",
      cancellation: "48-hour notice"
    },
    contactInfo: {
      name: "Sarah Johnson",
      email: "sarah@freshharvest.com",
      phone: "+1 (555) 987-6543",
      position: "Business Development"
    }
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
    message: "Local supplier with same-day delivery capability. We understand the NYC market and can provide the freshest produce with competitive pricing.",
    attachments: [
      { name: "Local_Certifications.pdf", type: "PDF", size: "1.2 MB", url: "#" },
      { name: "Delivery_Schedule.pdf", type: "PDF", size: "890 KB", url: "#" }
    ],
    certifications: ["USDA Organic", "Local Food", "Sustainable"],
    experience: "12 years",
    previousClients: ["Restaurant F", "Hotel G", "Catering H", "Restaurant I"],
    terms: {
      payment: "Net 30",
      warranty: "Full refund if unsatisfied",
      delivery: "Same-day delivery available",
      cancellation: "Flexible terms"
    },
    contactInfo: {
      name: "Mike Chen",
      email: "mike@urbangarden.com",
      phone: "+1 (555) 456-7890",
      position: "Owner"
    }
  }
]

export function RFQResponsesView({ 
  rfqId, 
  onBack, 
  onAcceptResponse, 
  onRejectResponse, 
  onMessageSupplier,
  onAssignContract
}: RFQResponsesViewProps) {
  const [selectedResponse, setSelectedResponse] = useState<RFQResponse | null>(null)
  const [sortBy, setSortBy] = useState<"price" | "rating" | "submitted">("submitted")
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "accepted" | "rejected">("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [isContractModalOpen, setIsContractModalOpen] = useState(false)
  const [contractResponse, setContractResponse] = useState<RFQResponse | null>(null)

  const filteredResponses = mockResponses
    .filter(response => {
      const matchesSearch = response.supplierCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           response.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === "all" || response.status === filterStatus
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price":
          return a.quoteAmount - b.quoteAmount
        case "rating":
          return b.supplierRating - a.supplierRating
        case "submitted":
          return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        default:
          return 0
      }
    })

  const handleAcceptResponse = (responseId: string) => {
    const response = mockResponses.find(r => r.id === responseId)
    if (response) {
      setContractResponse(response)
      setIsContractModalOpen(true)
    }
  }

  const handleContractAssignment = (contractData: any) => {
    if (onAssignContract) {
      onAssignContract(contractData)
    }
    onAcceptResponse(contractData.rfqId)
    setIsContractModalOpen(false)
    setContractResponse(null)
  }

  const handleRejectResponse = (responseId: string) => {
    onRejectResponse(responseId)
    setSelectedResponse(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "negotiating":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      case "negotiating":
        return <Clock className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">RFQ Responses</h2>
            <p className="text-gray-600 dark:text-gray-400">{mockRFQDetails.title}</p>
          </div>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {filteredResponses.length} responses
        </div>
      </div>

      {/* RFQ Details Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">RFQ Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Budget:</span>
            <p className="text-gray-900 dark:text-white">${mockRFQDetails.budget.min.toLocaleString()} - ${mockRFQDetails.budget.max.toLocaleString()}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Location:</span>
            <p className="text-gray-900 dark:text-white">{mockRFQDetails.location}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Deadline:</span>
            <p className="text-gray-900 dark:text-white">{mockRFQDetails.deadline}</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
          <div key={response.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{response.supplierCompany}</h4>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(response.status)}`}>
                      {getStatusIcon(response.status)}
                      {response.status.charAt(0).toUpperCase() + response.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">by {response.supplierName}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{response.supplierRating}</span>
                      <span>({response.supplierReviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{response.supplierLocation}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(response.submittedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  ${response.quoteAmount.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {response.deliveryTime}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{response.message}</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span>{response.attachments.length} attachments</span>
                <span>•</span>
                <span>{response.certifications.length} certifications</span>
                <span>•</span>
                <span>{response.experience} experience</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedResponse(response)}
                  className="px-4 py-2 text-blue-600 hover:text-blue-700 dark:hover:text-blue-400 border border-blue-300 dark:border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-sm font-medium"
                >
                  View Details
                </button>
                {response.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleAcceptResponse(response.id)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRejectResponse(response.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                    >
                      Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => onMessageSupplier(response.supplierId)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Response Details</h3>
                <button
                  onClick={() => setSelectedResponse(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Supplier Info */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Supplier Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Company:</span>
                      <p className="text-gray-900 dark:text-white">{selectedResponse.supplierCompany}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Contact:</span>
                      <p className="text-gray-900 dark:text-white">{selectedResponse.contactInfo.name}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Email:</span>
                      <p className="text-gray-900 dark:text-white">{selectedResponse.contactInfo.email}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Phone:</span>
                      <p className="text-gray-900 dark:text-white">{selectedResponse.contactInfo.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Quote Details */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Quote Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Amount:</span>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">${selectedResponse.quoteAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Delivery Time:</span>
                      <p className="text-gray-900 dark:text-white">{selectedResponse.deliveryTime}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Validity:</span>
                      <p className="text-gray-900 dark:text-white">{selectedResponse.validity}</p>
                    </div>
                  </div>
                </div>

                {/* Attachments */}
                {selectedResponse.attachments.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Attachments</h4>
                    <div className="space-y-2">
                      {selectedResponse.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{attachment.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{attachment.type} • {attachment.size}</p>
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
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Terms & Conditions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Payment:</span>
                      <p className="text-gray-900 dark:text-white">{selectedResponse.terms.payment}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Warranty:</span>
                      <p className="text-gray-900 dark:text-white">{selectedResponse.terms.warranty}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Delivery:</span>
                      <p className="text-gray-900 dark:text-white">{selectedResponse.terms.delivery}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Cancellation:</span>
                      <p className="text-gray-900 dark:text-white">{selectedResponse.terms.cancellation}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                  {selectedResponse.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleAcceptResponse(selectedResponse.id)}
                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                      >
                        Accept Response
                      </button>
                      <button
                        onClick={() => handleRejectResponse(selectedResponse.id)}
                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                      >
                        Reject Response
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => onMessageSupplier(selectedResponse.supplierId)}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
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
            setIsContractModalOpen(false)
            setContractResponse(null)
          }}
          onAssignContract={handleContractAssignment}
          rfqData={{
            id: rfqId,
            title: mockRFQDetails.title,
            description: mockRFQDetails.description,
            budget: mockRFQDetails.budget
          }}
          supplierData={{
            id: contractResponse.supplierId,
            name: contractResponse.supplierName,
            company: contractResponse.supplierCompany,
            email: contractResponse.contactInfo.email,
            phone: contractResponse.contactInfo.phone
          }}
        />
      )}
    </div>
  )
}
