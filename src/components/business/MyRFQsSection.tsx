"use client"

import { useState } from "react"
import {
  Plus,
  DollarSign,
  FileText,
  Clock,
} from "lucide-react"
import { RFQResponsesView } from "./RFQResponsesView"

const activeRFQs = [
  {
    id: "RFQ-001",
    title: "Weekly Fresh Produce Supply",
    category: "Vegetables",
    budget: "$2,000-3,000",
    responses: 8,
    deadline: "2024-01-20",
    status: "Open",
    description: "Looking for reliable supplier for weekly fresh produce delivery",
  },
  {
    id: "RFQ-002",
    title: "Premium Meat Selection",
    category: "Meat",
    budget: "$5,000-8,000",
    responses: 12,
    deadline: "2024-01-25",
    status: "Reviewing",
    description: "High-quality meat products for upscale restaurant chain",
  },
  {
    id: "RFQ-003",
    title: "Dairy Products Bundle",
    category: "Dairy",
    budget: "$1,500-2,500",
    responses: 6,
    deadline: "2024-01-22",
    status: "Open",
    description: "Various dairy products for bakery operations",
  },
]

interface MyRFQsSectionProps {
  className?: string
  onCreateRFQ?: () => void
  onAssignContract?: (contractData: any) => void
  onMessageSupplier?: (supplierId: string) => void
}

export function MyRFQsSection({ className = "", onCreateRFQ, onAssignContract, onMessageSupplier }: MyRFQsSectionProps) {
  const [viewingResponses, setViewingResponses] = useState<string | null>(null)

  const handleCreateRFQ = () => {
    if (onCreateRFQ) {
      onCreateRFQ()
    } else {
      console.log("Creating new RFQ")
    }
  }

  const handleViewResponses = (rfqId: string) => {
    setViewingResponses(rfqId)
  }

  const handleEditRFQ = (rfqId: string) => {
    console.log("Editing RFQ:", rfqId)
    // Handle edit RFQ logic
  }

  const handleAcceptResponse = (responseId: string) => {
    console.log("Accepting response:", responseId)
    // Handle accept response logic
  }

  const handleRejectResponse = (responseId: string) => {
    console.log("Rejecting response:", responseId)
    // Handle reject response logic
  }

  const handleMessageSupplier = (supplierId: string) => {
    if (onMessageSupplier) {
      onMessageSupplier(supplierId)
    } else {
      console.log("Messaging supplier:", supplierId)
    }
  }

  const handleAssignContract = (contractData: any) => {
    if (onAssignContract) {
      onAssignContract(contractData)
    }
    console.log("Contract assigned:", contractData)
  }

  if (viewingResponses) {
    return (
      <RFQResponsesView
        rfqId={viewingResponses}
        onBack={() => setViewingResponses(null)}
        onAcceptResponse={handleAcceptResponse}
        onRejectResponse={handleRejectResponse}
        onMessageSupplier={handleMessageSupplier}
        onAssignContract={handleAssignContract}
      />
    )
  }

  return (
    <div className={`space-y-8 ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between p-8 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My RFQs</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your request for quotes</p>
          </div>
          <button 
            onClick={handleCreateRFQ}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Create New RFQ
          </button>
        </div>
        <div className="p-8">
          <div className="space-y-6">
            {activeRFQs.map((rfq) => (
              <div key={rfq.id} className="group p-6 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-800 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
                <div className="flex items-start justify-between">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-green-600 transition-colors">{rfq.title}</h3>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        rfq.status === "Open" 
                          ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900 dark:to-emerald-900 dark:text-green-200" 
                          : "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 dark:from-blue-900 dark:to-cyan-900 dark:text-blue-200"
                      }`}>
                        {rfq.status}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">{rfq.description}</p>
                    <div className="flex items-center gap-6 text-sm">
                      <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="font-semibold">{rfq.budget}</span>
                      </span>
                      <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <span className="font-semibold">{rfq.responses} responses</span>
                      </span>
                      <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span className="font-semibold">Due: {rfq.deadline}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3 ml-6">
                    <button 
                      onClick={() => handleViewResponses(rfq.id)}
                      className="px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-green-500 transition-all duration-300 text-sm font-medium"
                    >
                      View Responses
                    </button>
                    <button 
                      onClick={() => handleEditRFQ(rfq.id)}
                      className="px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-green-500 transition-all duration-300 text-sm font-medium"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
