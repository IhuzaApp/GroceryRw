"use client"

import {
  Search,
  Plus,
} from "lucide-react"

interface BusinessHeaderProps {
  className?: string
  onCreateRFQ?: () => void
  onFindSuppliers?: () => void
}

export function BusinessHeader({ 
  className = "", 
  onCreateRFQ,
  onFindSuppliers 
}: BusinessHeaderProps) {
  const handleCreateRFQ = () => {
    if (onCreateRFQ) {
      onCreateRFQ()
    } else {
      console.log("Creating new RFQ")
      // Default action if no handler provided
    }
  }

  const handleFindSuppliers = () => {
    if (onFindSuppliers) {
      onFindSuppliers()
    } else {
      console.log("Finding suppliers")
      // Default action if no handler provided
    }
  }

  return (
    <div className={`relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl p-8 text-white shadow-2xl ${className}`}>
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Business Marketplace</h1>
            <p className="text-green-100 text-lg">Discover suppliers, manage orders, and streamline procurement</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={handleCreateRFQ}
              className="px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white hover:bg-white/30 transition-all duration-300 font-medium"
            >
              <Plus className="mr-2 h-5 w-5 inline" />
              Create RFQ
            </button>
            <button 
              onClick={handleFindSuppliers}
              className="px-6 py-3 bg-white text-green-600 rounded-xl hover:bg-green-50 transition-all duration-300 font-medium shadow-lg"
            >
              <Search className="mr-2 h-5 w-5 inline" />
              Find Suppliers
            </button>
          </div>
        </div>
      </div>
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
    </div>
  )
}
