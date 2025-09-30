"use client"

import {
  CheckCircle,
  AlertCircle,
  Truck,
} from "lucide-react"

const recentOrders = [
  {
    id: "ORD-001",
    supplier: "Fresh Farm Distributors",
    items: "Organic Vegetables Mix",
    value: "$1,250",
    status: "Delivered",
    deliveryDate: "2024-01-12",
    tracking: "TRK-12345",
  },
  {
    id: "ORD-002",
    supplier: "Premium Meat Co.",
    items: "Prime Beef Selection",
    value: "$3,200",
    status: "In Transit",
    deliveryDate: "2024-01-15",
    tracking: "TRK-12346",
  },
  {
    id: "ORD-003",
    supplier: "Ocean Fresh Seafood",
    items: "Daily Fresh Fish",
    value: "$890",
    status: "Processing",
    deliveryDate: "2024-01-16",
    tracking: "TRK-12347",
  },
]

interface OrdersSectionProps {
  className?: string
}

export function OrdersSection({ className = "" }: OrdersSectionProps) {
  const handleExport = () => {
    console.log("Exporting orders")
    // Handle export logic
  }

  const handleFilter = () => {
    console.log("Filtering orders")
    // Handle filter logic
  }

  const handleTrackOrder = (orderId: string) => {
    console.log("Tracking order:", orderId)
    // Handle track order logic
  }

  return (
    <div className={`space-y-8 ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between p-8 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Order History</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Track and manage your orders</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleExport}
              className="px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-green-500 transition-all duration-300 text-sm font-medium"
            >
              Export
            </button>
            <button 
              onClick={handleFilter}
              className="px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-green-500 transition-all duration-300 text-sm font-medium"
            >
              Filter
            </button>
          </div>
        </div>
        <div className="p-8">
          <div className="space-y-6">
            {recentOrders.map((order) => (
              <div key={order.id} className="group p-6 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-800 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
                <div className="flex items-center justify-between">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg text-gray-900 dark:text-white">{order.id}</span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        order.status === "Delivered"
                          ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900 dark:to-emerald-900 dark:text-green-200"
                          : order.status === "In Transit"
                            ? "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 dark:from-blue-900 dark:to-cyan-900 dark:text-blue-200"
                            : "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 dark:from-yellow-900 dark:to-orange-900 dark:text-yellow-200"
                      }`}>
                        {order.status === "Delivered" && <CheckCircle className="mr-1 h-3 w-3" />}
                        {order.status === "In Transit" && <Truck className="mr-1 h-3 w-3" />}
                        {order.status === "Processing" && <AlertCircle className="mr-1 h-3 w-3" />}
                        {order.status}
                      </span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{order.items}</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      From: <span className="font-semibold">{order.supplier}</span> • Tracking: <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{order.tracking}</span>
                    </p>
                  </div>
                  <div className="text-right space-y-4 ml-6">
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{order.value}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Order Value</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Delivery: <span className="font-semibold">{order.deliveryDate}</span></p>
                      <button 
                        onClick={() => handleTrackOrder(order.id)}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-xl"
                      >
                        Track Order
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
