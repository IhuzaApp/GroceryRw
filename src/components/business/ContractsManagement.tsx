"use client"

import { useState } from "react"
import {
  FileText,
  Calendar,
  DollarSign,
  User,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Eye,
  Edit,
  MessageSquare,
  TrendingUp,
  Filter,
  Search,
  SortAsc,
} from "lucide-react"

interface Contract {
  id: string
  contractId: string
  title: string
  supplierName: string
  supplierCompany: string
  supplierId: string
  contractType: string
  status: "draft" | "pending" | "active" | "completed" | "terminated" | "expired"
  startDate: string
  endDate: string
  totalValue: number
  currency: string
  paymentSchedule: string
  progress: number
  deliverables: Array<{
    id: string
    description: string
    dueDate: string
    value: number
    status: "pending" | "in-progress" | "completed" | "overdue"
  }>
  lastActivity: string
  created: string
  signedByClient: boolean
  signedBySupplier: boolean
  nextPayment?: {
    amount: number
    dueDate: string
  }
}

interface ContractsManagementProps {
  className?: string
  onViewContract: (contractId: string) => void
  onEditContract: (contractId: string) => void
  onMessageSupplier: (supplierId: string) => void
}

const mockContracts: Contract[] = [
  {
    id: "1",
    contractId: "CONTRACT-001",
    title: "Weekly Fresh Produce Supply",
    supplierName: "John Smith",
    supplierCompany: "Green Valley Farms",
    supplierId: "SUP-001",
    contractType: "Supply Contract",
    status: "active",
    startDate: "2024-01-15",
    endDate: "2024-12-15",
    totalValue: 156000,
    currency: "USD",
    paymentSchedule: "Monthly",
    progress: 75,
    deliverables: [
      { id: "1", description: "Weekly produce delivery", dueDate: "2024-01-22", value: 3000, status: "completed" },
      { id: "2", description: "Quality assurance report", dueDate: "2024-01-25", value: 500, status: "in-progress" },
      { id: "3", description: "Monthly inventory report", dueDate: "2024-02-01", value: 200, status: "pending" },
    ],
    lastActivity: "2024-01-20",
    created: "2024-01-10",
    signedByClient: true,
    signedBySupplier: true,
    nextPayment: {
      amount: 13000,
      dueDate: "2024-02-01"
    }
  },
  {
    id: "2",
    contractId: "CONTRACT-002",
    title: "Office Equipment Maintenance",
    supplierName: "Sarah Johnson",
    supplierCompany: "TechFix Solutions",
    supplierId: "SUP-002",
    contractType: "Service Agreement",
    status: "pending",
    startDate: "2024-02-01",
    endDate: "2024-08-01",
    totalValue: 24000,
    currency: "USD",
    paymentSchedule: "Quarterly",
    progress: 0,
    deliverables: [
      { id: "1", description: "Initial equipment assessment", dueDate: "2024-02-05", value: 2000, status: "pending" },
      { id: "2", description: "Monthly maintenance schedule", dueDate: "2024-02-15", value: 1500, status: "pending" },
    ],
    lastActivity: "2024-01-18",
    created: "2024-01-15",
    signedByClient: true,
    signedBySupplier: false,
  },
  {
    id: "3",
    contractId: "CONTRACT-003",
    title: "Marketing Campaign Development",
    supplierName: "Mike Chen",
    supplierCompany: "Creative Agency Pro",
    supplierId: "SUP-003",
    contractType: "Consulting Agreement",
    status: "completed",
    startDate: "2023-10-01",
    endDate: "2023-12-31",
    totalValue: 45000,
    currency: "USD",
    paymentSchedule: "Milestone-based",
    progress: 100,
    deliverables: [
      { id: "1", description: "Brand strategy development", dueDate: "2023-10-15", value: 15000, status: "completed" },
      { id: "2", description: "Campaign materials", dueDate: "2023-11-30", value: 20000, status: "completed" },
      { id: "3", description: "Performance report", dueDate: "2023-12-31", value: 10000, status: "completed" },
    ],
    lastActivity: "2023-12-31",
    created: "2023-09-20",
    signedByClient: true,
    signedBySupplier: true,
  }
]

const statusColors = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  terminated: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  expired: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
}

const statusIcons = {
  draft: <FileText className="h-4 w-4" />,
  pending: <Clock className="h-4 w-4" />,
  active: <CheckCircle className="h-4 w-4" />,
  completed: <CheckCircle className="h-4 w-4" />,
  terminated: <XCircle className="h-4 w-4" />,
  expired: <AlertCircle className="h-4 w-4" />,
}

export function ContractsManagement({ 
  className = "", 
  onViewContract, 
  onEditContract, 
  onMessageSupplier 
}: ContractsManagementProps) {
  const [sortBy, setSortBy] = useState<"date" | "value" | "status" | "progress">("date")
  const [filterStatus, setFilterStatus] = useState<"all" | "draft" | "pending" | "active" | "completed" | "terminated" | "expired">("all")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredContracts = mockContracts
    .filter(contract => {
      const matchesSearch = contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           contract.supplierCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           contract.contractId.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === "all" || contract.status === filterStatus
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "value":
          return b.totalValue - a.totalValue
        case "status":
          return a.status.localeCompare(b.status)
        case "progress":
          return b.progress - a.progress
        case "date":
        default:
          return new Date(b.created).getTime() - new Date(a.created).getTime()
      }
    })

  const getDeliverableStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "in-progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500"
    if (progress >= 60) return "bg-blue-500"
    if (progress >= 40) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Contract Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage your business contracts and agreements</p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {filteredContracts.length} contracts
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search contracts..."
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
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="terminated">Terminated</option>
              <option value="expired">Expired</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="date">Sort by Date</option>
              <option value="value">Sort by Value</option>
              <option value="status">Sort by Status</option>
              <option value="progress">Sort by Progress</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contracts List */}
      <div className="space-y-4">
        {filteredContracts.map((contract) => (
          <div key={contract.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{contract.title}</h3>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColors[contract.status]}`}>
                    {statusIcons[contract.status]}
                    {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {contract.contractType} • {contract.supplierCompany}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{contract.startDate} - {contract.endDate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span>${contract.totalValue.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{contract.paymentSchedule}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  ${contract.totalValue.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {contract.progress}% complete
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span>Progress</span>
                <span>{contract.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(contract.progress)}`}
                  style={{ width: `${contract.progress}%` }}
                />
              </div>
            </div>

            {/* Deliverables */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Deliverables</h4>
              <div className="space-y-2">
                {contract.deliverables.slice(0, 2).map((deliverable) => (
                  <div key={deliverable.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 truncate flex-1 mr-2">
                      {deliverable.description}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        ${deliverable.value.toLocaleString()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getDeliverableStatusColor(deliverable.status)}`}>
                        {deliverable.status}
                      </span>
                    </div>
                  </div>
                ))}
                {contract.deliverables.length > 2 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    +{contract.deliverables.length - 2} more deliverables
                  </p>
                )}
              </div>
            </div>

            {/* Next Payment */}
            {contract.nextPayment && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-700 dark:text-blue-300 font-medium">Next Payment</span>
                  <div className="text-right">
                    <div className="font-semibold text-blue-900 dark:text-blue-100">
                      ${contract.nextPayment.amount.toLocaleString()}
                    </div>
                    <div className="text-blue-600 dark:text-blue-400">
                      Due {contract.nextPayment.dueDate}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span>Last activity: {contract.lastActivity}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <span>Client:</span>
                  {contract.signedByClient ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <span>Supplier:</span>
                  {contract.signedBySupplier ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onViewContract(contract.id)}
                  className="px-3 py-1 text-blue-600 hover:text-blue-700 dark:hover:text-blue-400 border border-blue-300 dark:border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-sm font-medium"
                >
                  <Eye className="h-4 w-4 inline mr-1" />
                  View
                </button>
                <button
                  onClick={() => onEditContract(contract.id)}
                  className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  <Edit className="h-4 w-4 inline mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => onMessageSupplier(contract.supplierId)}
                  className="px-3 py-1 text-green-600 hover:text-green-700 dark:hover:text-green-400 border border-green-300 dark:border-green-600 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-sm font-medium"
                >
                  <MessageSquare className="h-4 w-4 inline mr-1" />
                  Message
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredContracts.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No contracts found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || filterStatus !== "all" 
              ? "Try adjusting your search or filter criteria."
              : "You don't have any contracts yet. Create your first contract by accepting an RFQ response."
            }
          </p>
        </div>
      )}
    </div>
  )
}
