"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button, Panel, Badge, Loader } from "rsuite"
import "rsuite/dist/rsuite.min.css"

export default function ActiveBatches() {
  const [isLoading, setIsLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  // Mock active orders data
  const activeOrders = [
    {
      id: "ORD-1234",
      status: "accepted",
      shopName: "FreshMart",
      shopAddress: "123 Market St, Mesa, AZ",
      customerName: "John Smith",
      customerAddress: "456 Pine Ave, Mesa, AZ",
      items: 8,
      total: "$45.67",
      estimatedEarnings: "$12.50",
      createdAt: "Today at 2:15 PM",
    },
    {
      id: "ORD-5678",
      status: "picked",
      shopName: "GreenGrocer",
      shopAddress: "789 Oak Rd, Mesa, AZ",
      customerName: "Sarah Johnson",
      customerAddress: "101 Maple Dr, Mesa, AZ",
      items: 12,
      total: "$78.90",
      estimatedEarnings: "$15.75",
      createdAt: "Today at 1:30 PM",
    },
  ]

  return (
    <div className={`min-h-screen bg-gray-50 ${isMobile ? "pb-16" : ""}`}>
      {/* Main Content */}
      <main className="p-4 max-w-1xl mx-auto">
        {/* Page Title - Desktop Only */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Active Orders</h1>
          <Button appearance="ghost">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader content="Loading orders..." />
          </div>
        ) : activeOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeOrders.map((order) => (
              <ActiveOrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-8 text-center border">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-8 h-8 text-gray-400"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12h8" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">No Active Orders</h3>
            <p className="text-gray-500 mb-4">You don't have any active orders at the moment.</p>
            <Link href="/shopper">
              <Button appearance="primary" className="bg-green-500 text-white">
                Find Orders
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}

function ActiveOrderCard({ order }: { order: any }) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return <Badge content="Accepted" className="bg-blue-100 text-blue-800 font-medium text-xs px-2 py-1 rounded" />
      case "picked":
        return (
          <Badge content="Picked Up" className="bg-orange-100 text-orange-800 font-medium text-xs px-2 py-1 rounded" />
        )
      case "at_customer":
        return (
          <Badge
            content="At Customer"
            className="bg-purple-100 text-purple-800 font-medium text-xs px-2 py-1 rounded"
          />
        )
      default:
        return null
    }
  }

  const getNextActionButton = (status: string) => {
    switch (status) {
      case "accepted":
        return (
          <Link href={`/shopper/order/${order.id}`}>
            <Button appearance="primary" className="bg-green-500 text-white">
              Start Shopping
            </Button>
          </Link>
        )
      case "picked":
        return (
          <Link href={`/shopper/order/${order.id}`}>
            <Button appearance="primary" className="bg-green-500 text-white">
              Navigate to Customer
            </Button>
          </Link>
        )
      case "at_customer":
        return (
          <Link href={`/shopper/order/${order.id}`}>
            <Button appearance="primary" className="bg-green-500 text-white">
              Confirm Delivery
            </Button>
          </Link>
        )
      default:
        return (
          <Link href={`/shopper/order/${order.id}`}>
            <Button appearance="ghost">View Details</Button>
          </Link>
        )
    }
  }

  return (
    <Panel shaded bordered bodyFill className="overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center">
              <h3 className="font-bold text-lg">{order.id}</h3>
              {getStatusBadge(order.status)}
            </div>
            <p className="text-sm text-gray-500 mt-1">{order.createdAt}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-green-600">{order.estimatedEarnings}</p>
            <p className="text-xs text-gray-500">{order.items} items</p>
          </div>
        </div>

        <div className="flex items-center mb-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-4 h-4 text-green-600"
            >
              <path d="M3 3h18v18H3zM16 8h.01M8 16h.01M16 16h.01" />
            </svg>
          </div>
          <div>
            <p className="font-medium">{order.shopName}</p>
            <p className="text-xs text-gray-500">{order.shopAddress}</p>
          </div>
        </div>

        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-4 h-4 text-blue-600"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <div>
            <p className="font-medium">{order.customerName}</p>
            <p className="text-xs text-gray-500">{order.customerAddress}</p>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Link href={`/shopper/order/${order.id}`}>
            <Button appearance="ghost">View Details</Button>
          </Link>
          {getNextActionButton(order.status)}
        </div>
      </div>
    </Panel>
  )
}
