"use client"

import {
  DollarSign,
  ShoppingCart,
  MessageSquare,
  Star,
} from "lucide-react"

const overviewStats = [
  {
    title: "Total Revenue",
    value: "$45,230",
    change: "+12.5%",
    icon: DollarSign,
    color: "text-green-600",
    bgColor: "from-green-100 to-green-200",
  },
  {
    title: "Active Orders",
    value: "23",
    change: "+5",
    icon: ShoppingCart,
    color: "text-blue-600",
    bgColor: "from-blue-100 to-blue-200",
  },
  {
    title: "RFQ Responses",
    value: "18",
    change: "+8",
    icon: MessageSquare,
    color: "text-purple-600",
    bgColor: "from-purple-100 to-purple-200",
  },
  {
    title: "Average Rating",
    value: "4.8",
    change: "+0.2",
    icon: Star,
    color: "text-yellow-600",
    bgColor: "from-yellow-100 to-yellow-200",
  },
]

interface OverviewStatsProps {
  className?: string
}

export function OverviewStats({ className = "" }: OverviewStatsProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {overviewStats.map((stat, index) => (
        <div key={index} className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 dark:border-gray-700 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className={`text-sm font-medium ${stat.color}`}>{stat.change} from last month</p>
            </div>
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.bgColor} dark:from-gray-700 dark:to-gray-600 group-hover:scale-110 transition-transform duration-300`}>
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
