"use client"

import {
  Star,
  Truck,
  Clock,
} from "lucide-react"

const quotes = [
  {
    id: "QUO-001",
    rfqId: "RFQ-001",
    supplier: {
      name: "Fresh Farm Distributors",
      rating: 4.8,
      location: "California, USA",
      verified: true,
      contact: {
        name: "John Smith",
        email: "john@freshfarm.com",
        phone: "+1 (555) 123-4567",
      },
      company: {
        address: "123 Farm Road, Fresno, CA 93721",
        established: "2015",
        employees: "50-100",
      },
    },
    title: "Weekly Fresh Produce Supply",
    totalPrice: "$2,750",
    deliveryTime: "2-3 days",
    validUntil: "2024-01-25",
    items: [
      {
        id: "item-1",
        name: "Organic Tomatoes",
        category: "Vegetables",
        quantity: 50,
        unit: "lbs",
        unitPrice: 3.5,
        totalPrice: 175.0,
        specifications: "Grade A, vine-ripened",
      },
      {
        id: "item-2",
        name: "Fresh Lettuce",
        category: "Vegetables",
        quantity: 30,
        unit: "heads",
        unitPrice: 2.25,
        totalPrice: 67.5,
        specifications: "Iceberg and Romaine mix",
      },
    ],
    terms: {
      paymentTerms: "Net 30 days",
      deliveryTerms: "FOB Destination",
      warranty: "Quality guarantee for 48 hours",
      minimumOrder: "$500",
    },
    notes: "All produce is certified organic and locally sourced.",
    attachments: ["organic-certificates.pdf"],
    submittedDate: "2024-01-15",
    status: "pending" as const,
  },
]

interface QuotesSectionProps {
  className?: string
  onViewQuoteDetails?: (quote: any) => void
}

export function QuotesSection({ className = "", onViewQuoteDetails }: QuotesSectionProps) {
  const handleCompareSelected = () => {
    console.log("Comparing selected quotes")
    // Handle compare selected logic
  }

  const handleViewDetails = (quote: any) => {
    if (onViewQuoteDetails) {
      onViewQuoteDetails(quote)
    }
  }

  const handleAcceptQuote = (quoteId: string) => {
    console.log("Accepting quote:", quoteId)
    // Handle accept quote logic
  }

  return (
    <div className={`space-y-8 ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between p-8 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Received Quotes</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Review and compare supplier quotes</p>
          </div>
          <button 
            onClick={handleCompareSelected}
            className="px-6 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-green-500 transition-all duration-300 font-medium"
          >
            Compare Selected
          </button>
        </div>
        <div className="p-8">
          <div className="space-y-6">
            {quotes.map((quote) => (
              <div key={quote.id} className="group p-6 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-800 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
                <div className="flex items-center justify-between">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-green-600 transition-colors">{quote.title}</h3>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 dark:from-blue-900 dark:to-cyan-900 dark:text-blue-200">
                        {quote.items.length} items
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">From: <span className="font-semibold text-gray-900 dark:text-white">{quote.supplier.name}</span></p>
                    <div className="flex items-center gap-6 text-sm">
                      <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        </div>
                        <span className="font-semibold">{quote.supplier.rating}</span>
                      </span>
                      <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Truck className="h-4 w-4 text-green-500" />
                        <span className="font-semibold">{quote.deliveryTime}</span>
                      </span>
                      <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span className="font-semibold">Valid until: {quote.validUntil}</span>
                      </span>
                    </div>
                  </div>
                  <div className="text-right space-y-4 ml-6">
                    <div>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{quote.totalPrice}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Quote Value</p>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleViewDetails(quote)}
                        className="px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-green-500 transition-all duration-300 text-sm font-medium"
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => handleAcceptQuote(quote.id)}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-xl"
                      >
                        Accept Quote
                      </button>
                    </div>
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
