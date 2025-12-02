"use client";

import { Star, Truck, Clock } from "lucide-react";
import { formatCurrencySync } from "../../utils/formatCurrency";

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
    totalPrice: formatCurrencySync(2750),
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
      minimumOrder: formatCurrencySync(500),
    },
    notes: "All produce is certified organic and locally sourced.",
    attachments: ["organic-certificates.pdf"],
    submittedDate: "2024-01-15",
    status: "pending" as const,
  },
];

interface QuotesSectionProps {
  className?: string;
  onViewQuoteDetails?: (quote: any) => void;
}

export function QuotesSection({
  className = "",
  onViewQuoteDetails,
}: QuotesSectionProps) {
  const handleCompareSelected = () => {
    console.log("Comparing selected quotes");
    // Handle compare selected logic
  };

  const handleViewDetails = (quote: any) => {
    if (onViewQuoteDetails) {
      onViewQuoteDetails(quote);
    }
  };

  const handleAcceptQuote = (quoteId: string) => {
    console.log("Accepting quote:", quoteId);
    // Handle accept quote logic
  };

  return (
    <div className={`space-y-8 ${className}`}>
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white p-8 dark:border-gray-700 dark:from-gray-700 dark:to-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Received Quotes
            </h2>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Review and compare supplier quotes
            </p>
          </div>
          <button
            onClick={handleCompareSelected}
            className="rounded-xl border-2 border-gray-200 px-6 py-3 font-medium text-gray-700 transition-all duration-300 hover:border-green-500 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Compare Selected
          </button>
        </div>
        <div className="p-8">
          <div className="space-y-6">
            {quotes.map((quote) => (
              <div
                key={quote.id}
                className="group rounded-2xl border-2 border-gray-100 bg-gradient-to-r from-white to-gray-50 p-6 transition-all duration-300 hover:border-green-200 hover:shadow-lg dark:border-gray-700 dark:from-gray-800 dark:to-gray-700 dark:hover:border-green-800"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-green-600 dark:text-white">
                        {quote.title}
                      </h3>
                      <span className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 px-3 py-1 text-xs font-bold text-blue-800 dark:from-blue-900 dark:to-cyan-900 dark:text-blue-200">
                        {quote.items.length} items
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      From:{" "}
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {quote.supplier.name}
                      </span>
                    </p>
                    <div className="flex items-center gap-6 text-sm">
                      <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        </div>
                        <span className="font-semibold">
                          {quote.supplier.rating}
                        </span>
                      </span>
                      <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Truck className="h-4 w-4 text-green-500" />
                        <span className="font-semibold">
                          {quote.deliveryTime}
                        </span>
                      </span>
                      <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span className="font-semibold">
                          Valid until: {quote.validUntil}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="ml-6 space-y-4 text-right">
                    <div>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {quote.totalPrice}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Total Quote Value
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleViewDetails(quote)}
                        className="rounded-xl border-2 border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-300 hover:border-green-500 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleAcceptQuote(quote.id)}
                        className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all duration-300 hover:from-green-600 hover:to-emerald-600 hover:shadow-xl"
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
  );
}
