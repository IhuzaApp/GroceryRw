"use client"

import {
  FileText,
} from "lucide-react"

interface ContractsSectionProps {
  className?: string
}

export function ContractsSection({ className = "" }: ContractsSectionProps) {
  const handleViewAcceptedQuotes = () => {
    console.log("Viewing accepted quotes")
    // Handle view accepted quotes logic
  }

  return (
    <div className={`space-y-8 ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-8 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Active Contracts</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your supplier contracts</p>
        </div>
        <div className="p-8">
          <div className="text-center py-16">
            <div className="relative">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-2xl flex items-center justify-center">
                <FileText className="h-12 w-12 text-gray-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">0</span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No active contracts yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Contracts will appear here once quotes are accepted</p>
            <button 
              onClick={handleViewAcceptedQuotes}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
            >
              View Accepted Quotes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
