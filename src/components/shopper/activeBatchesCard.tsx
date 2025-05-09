"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button, Panel, Badge, Loader, toaster, Message } from "rsuite"
import "rsuite/dist/rsuite.min.css"
import { useAuth } from "../../context/AuthContext"

// Define interfaces for order data
interface Order {
  id: string;
  status: string;
  createdAt: string;
  shopName: string;
  shopAddress: string;
  shopLat: number;
  shopLng: number;
  customerName: string;
  customerAddress: string;
  customerLat: number;
  customerLng: number;
  items: number;
  total: number;
  estimatedEarnings: string;
}

interface ActiveBatchesProps {
  initialOrders?: Order[];
  initialError?: string | null;
}

export default function ActiveBatches({ initialOrders = [], initialError = null }: ActiveBatchesProps) {
  const { role } = useAuth()
  const [isLoading, setIsLoading] = useState(!initialOrders.length)
  const [isMobile, setIsMobile] = useState(false)
  const [activeOrders, setActiveOrders] = useState<Order[]>(initialOrders)
  const [error, setError] = useState<string | null>(initialError)
  const fetchedRef = useRef(false)

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

  // Only fetch orders client-side if we don't have them from server-side
  useEffect(() => {
    // Skip fetching if we already have data or already attempted a fetch
    if (initialOrders.length > 0 || fetchedRef.current) {
      return;
    }
    
    // Skip if not a shopper
    if (role !== 'shopper') {
      setIsLoading(false);
      return;
    }
    
    // Set flag to prevent multiple fetches
    fetchedRef.current = true;
    
    const controller = new AbortController();
    const signal = controller.signal;
    
    async function fetchActiveBatches() {
      setIsLoading(true)
      setError(null)
      
      try {
        const response = await fetch('http://localhost:3003/api/shopper/activeBatches', {
          signal,
          headers: {
            'Content-Type': 'application/json',
          }
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch active batches')
        }
        
        const data = await response.json()
        setActiveOrders(data)
      } catch (err) {
        // Don't set error if it was canceled
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        
        console.error('Error fetching active batches:', err)
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
        setError(errorMessage)
        toaster.push(
          <Message showIcon type="error" header="Error">
            Failed to load active batches.
          </Message>,
          { placement: 'topEnd' }
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchActiveBatches()
    
    return () => {
      controller.abort();
    }
  }, [role, initialOrders.length])

  return (
    <div className={`min-h-screen bg-gray-50 ${isMobile ? "pb-16" : ""}`}>
      {/* Main Content */}
      <main className="p-4 max-w-1xl mx-auto">
        {/* Page Title - Desktop Only */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Active Batches</h1>
          <button className="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 p-4 rounded-lg border border-red-200 text-red-600">
            {error}
          </div>
        )}

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
            <h3 className="text-lg font-medium mb-2">No Active Batches</h3>
            <p className="text-gray-500 mb-4">You don't have any active batches at the moment.</p>
            <Link href="/Plasa">
              <button className="px-4 py-2 bg-[#125C13] text-white rounded-md hover:bg-[#0A400B] transition-colors font-medium">
                Find Orders
              </button>
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
          <Link href={`/Plasa/active-batches/batch/${order.id}`}>
            <button className="px-4 py-2 bg-[#125C13] text-white rounded-md hover:bg-[#0A400B] transition-colors font-medium">
              Start Shopping
            </button>
          </Link>
        )
      case "picked":
      case "shopping":
        return (
          <Link href={`/Plasa/active-batches/batch/${order.id}`}>
            <button className="px-4 py-2 bg-[#125C13] text-white rounded-md hover:bg-[#0A400B] transition-colors font-medium">
              View Details
            </button>
          </Link>
        )
      case "at_customer":
      case "on_the_way":
        return (
          <Link href={`/Plasa/active-batches/batch/${order.id}`}>
            <button className="px-4 py-2 bg-[#125C13] text-white rounded-md hover:bg-[#0A400B] transition-colors font-medium">
              Confirm Delivery
            </button>
          </Link>
        )
      default:
        return (
          <Link href={`/Plasa/active-batches/batch/${order.id}`}>
            <button className="px-4 py-2 bg-[#125C13] text-white rounded-md hover:bg-[#0A400B] transition-colors font-medium">
              View Details
            </button>
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
          <a 
            href={`https://maps.google.com/?q=${order.customerLat},${order.customerLng}`} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button appearance="ghost" className="flex items-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-4 h-4 mr-1"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Directions
            </Button>
          </a>
          {getNextActionButton(order.status)}
        </div>
      </div>
    </Panel>
  )
}
