"use client"

import {
  Package,
  FileText,
  ShoppingCart,
  Truck,
  BarChart3,
  Briefcase,
  Search,
  DollarSign,
  MessageSquare,
  Star,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import RootLayout from "../../src/components/ui/layout"
import { useAuth } from "../../src/context/AuthContext"
import { QuoteDetailsModal } from "./quote-details-modal"
import { BusinessHeader } from "../../src/components/business/BusinessHeader"
import { StatsCards } from "../../src/components/business/StatsCards"
import { SuppliersSection } from "../../src/components/business/SuppliersSection"
import { MyRFQsSection } from "../../src/components/business/MyRFQsSection"
import { QuotesSection } from "../../src/components/business/QuotesSection"
import { OrdersSection } from "../../src/components/business/OrdersSection"
import { ContractsSection } from "../../src/components/business/ContractsSection"
import { ProductsBidsSection } from "../../src/components/business/ProductsBidsSection"
import { RFQOpportunitiesSection } from "../../src/components/business/RFQOpportunitiesSection"
import { CreateRFQForm } from "../../src/components/business/CreateRFQForm"
import { ContractsManagement } from "../../src/components/business/ContractsManagement"

// Data moved to individual components

export default function PlasBusinessPage() {
  const { role, isLoggedIn, authReady } = useAuth()
  const router = useRouter()
  const [selectedQuote, setSelectedQuote] = useState<any>(null)
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)
  const [isCreateRFQOpen, setIsCreateRFQOpen] = useState(false)

  // Redirect shoppers away from this page
  useEffect(() => {
    if (authReady && isLoggedIn && role === "shopper") {
      router.push("/Plasa")
    }
  }, [role, isLoggedIn, authReady, router])

  // Show loading while auth is being determined
  if (!authReady) {
    return (
      <RootLayout>
        <div className="flex h-screen w-full items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-16 w-16 animate-spin rounded-full border-b-4 border-t-4 border-green-800"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </RootLayout>
    )
  }

  // Don't render for shoppers
  if (isLoggedIn && role === "shopper") {
    return null
  }

  return (
    <RootLayout>
      <div className="min-h-screen  via-white to-gray-100 dark:from-gray-900 ">
        <div className="container mx-auto px-4 py-8">
          <BuyerDashboardContent 
            selectedQuote={selectedQuote}
            setSelectedQuote={setSelectedQuote}
            isQuoteModalOpen={isQuoteModalOpen}
            setIsQuoteModalOpen={setIsQuoteModalOpen}
            isCreateRFQOpen={isCreateRFQOpen}
            setIsCreateRFQOpen={setIsCreateRFQOpen}
            router={router}
          />
        </div>
      </div>
    </RootLayout>
  )
}

function BuyerDashboardContent({ 
  selectedQuote, 
  setSelectedQuote, 
  isQuoteModalOpen, 
  setIsQuoteModalOpen,
  isCreateRFQOpen,
  setIsCreateRFQOpen,
  router
}: {
  selectedQuote: any
  setSelectedQuote: (quote: any) => void
  isQuoteModalOpen: boolean
  setIsQuoteModalOpen: (open: boolean) => void
  isCreateRFQOpen: boolean
  setIsCreateRFQOpen: (open: boolean) => void
  router: any
}) {
  const [activeTab, setActiveTab] = useState("overview")
  const [isServiceProvider, setIsServiceProvider] = useState(true) // This should come from user data/API

  const handleViewQuoteDetails = (quote: any) => {
    setSelectedQuote(quote)
    setIsQuoteModalOpen(true)
  }

  const handleAcceptQuote = (quoteId: string) => {
    console.log("Accepting quote:", quoteId)
    setIsQuoteModalOpen(false)
  }

  const handleRejectQuote = (quoteId: string) => {
    console.log("Rejecting quote:", quoteId)
    setIsQuoteModalOpen(false)
  }

  const handleMessageQuoteSupplier = (supplierId: string) => {
    console.log("Messaging quote supplier:", supplierId)
    router.push(`/plasBusiness/BusinessChats?supplier=${supplierId}`)
  }

  const handleMessageContractSupplier = (supplierId: string) => {
    console.log("Messaging contract supplier:", supplierId)
    router.push(`/plasBusiness/BusinessChats?supplier=${supplierId}`)
  }

  const handleCreateRFQ = () => {
    setIsCreateRFQOpen(true)
  }

  const handleRFQSubmit = (rfqData: any) => {
    console.log("RFQ created:", rfqData)
    // Here you would typically send the data to your API
  }

  const handleAssignContract = (contractData: any) => {
    console.log("Contract assigned:", contractData)
    // Here you would typically send the contract data to your API
  }

  const handleViewContract = (contractId: string) => {
    console.log("Viewing contract:", contractId)
    // Handle view contract logic
  }

  const handleEditContract = (contractId: string) => {
    console.log("Editing contract:", contractId)
    // Handle edit contract logic
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <BusinessHeader 
        onCreateRFQ={handleCreateRFQ}
        onFindSuppliers={() => console.log("Finding suppliers")}
      />

      {/* Stats Cards */}
      <StatsCards />

      {/* Main Content Tabs */}
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-2">
          <div className="flex space-x-2 overflow-x-auto">
            {[
              // Service Provider tabs (only visible if user is approved service provider)
              ...(isServiceProvider ? [
                { id: "overview", label: "Overview", icon: BarChart3 },
                { id: "products-bids", label: "Products/Bids", icon: Briefcase },
                { id: "rfq-opportunities", label: "RFQ Opportunities", icon: Search },
                { id: "orders", label: "Orders", icon: Truck },
                { id: "business-chats", label: "Business Chats", icon: MessageSquare },
              ] : []),
              // Regular buyer tabs
              { id: "suppliers", label: "Suppliers", icon: Package },
              { id: "rfqs", label: "My RFQs", icon: FileText },
              { id: "quotes", label: "Quotes", icon: ShoppingCart },
              { id: "contracts", label: "Contracts", icon: FileText }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === "business-chats") {
                    window.location.href = "/plasBusiness/BusinessChats"
                    return
                  }
                  setActiveTab(tab.id)
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg transform scale-105"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Service Provider Tabs */}
        {isServiceProvider && activeTab === "overview" && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Business Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">$45,230</p>
                    <p className="text-sm font-medium text-green-600">+12.5% from last month</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-green-100 to-green-200 dark:from-gray-700 dark:to-gray-600">
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Orders</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">23</p>
                    <p className="text-sm font-medium text-blue-600">+5 from last month</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-gray-700 dark:to-gray-600">
                    <ShoppingCart className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">RFQ Responses</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">18</p>
                    <p className="text-sm font-medium text-purple-600">+8 from last month</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 dark:from-gray-700 dark:to-gray-600">
                    <MessageSquare className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Rating</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">4.8</p>
                    <p className="text-sm font-medium text-yellow-600">+0.2 from last month</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-gray-700 dark:to-gray-600">
                    <Star className="h-8 w-8 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {isServiceProvider && activeTab === "products-bids" && <ProductsBidsSection />}

        {isServiceProvider && activeTab === "rfq-opportunities" && <RFQOpportunitiesSection onMessageCustomer={handleMessageQuoteSupplier} />}

        {/* Regular Buyer Tabs */}
        {activeTab === "suppliers" && <SuppliersSection />}

        {activeTab === "rfqs" && <MyRFQsSection onCreateRFQ={handleCreateRFQ} onAssignContract={handleAssignContract} onMessageSupplier={handleMessageQuoteSupplier} />}

        {activeTab === "quotes" && <QuotesSection onViewQuoteDetails={handleViewQuoteDetails} />}

        {activeTab === "orders" && <OrdersSection />}

        {activeTab === "contracts" && (
          <ContractsManagement
            onViewContract={handleViewContract}
            onEditContract={handleEditContract}
            onMessageSupplier={handleMessageContractSupplier}
          />
        )}
      </div>

      <QuoteDetailsModal
        quote={selectedQuote}
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        onAccept={handleAcceptQuote}
        onReject={handleRejectQuote}
        onMessage={handleMessageQuoteSupplier}
      />

      <CreateRFQForm
        isOpen={isCreateRFQOpen}
        onClose={() => setIsCreateRFQOpen(false)}
        onSubmit={handleRFQSubmit}
      />
    </div>
  )
}