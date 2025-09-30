"use client"

import {
  FileText,
  ShoppingCart,
  DollarSign,
  Package,
} from "lucide-react"

const stats = [
  {
    title: "Active RFQs",
    value: "12",
    change: "+3",
    icon: FileText,
    color: "text-blue-600",
  },
  {
    title: "Pending Orders",
    value: "8",
    change: "+2",
    icon: ShoppingCart,
    color: "text-orange-600",
  },
  {
    title: "Monthly Spend",
    value: "$18,450",
    change: "+8.2%",
    icon: DollarSign,
    color: "text-green-600",
  },
  {
    title: "Suppliers",
    value: "24",
    change: "+5",
    icon: Package,
    color: "text-purple-600",
  },
]

interface StatsCardsProps {
  className?: string
}

export function StatsCards({ className = "" }: StatsCardsProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {stats.map((stat, index) => (
        <div key={index} className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 dark:border-gray-700 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className={`text-sm font-medium ${stat.color}`}>{stat.change} from last month</p>
            </div>
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color.replace('text-', 'from-').replace('-600', '-100')} to-${stat.color.replace('text-', '').replace('-600', '-200')} dark:from-gray-700 dark:to-gray-600 group-hover:scale-110 transition-transform duration-300`}>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </div>
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent to-gray-50/50 dark:to-gray-700/20 pointer-events-none"></div>
        </div>
      ))}
    </div>
  )
}
