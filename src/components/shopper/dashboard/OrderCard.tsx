"use client"

import React from "react";
import Link from "next/link";
import { Button, Panel, Badge } from "rsuite";
import "rsuite/dist/rsuite.min.css";

interface Order {
  id: string;
  shopName: string;
  shopAddress: string;
  customerAddress: string;
  distance: string;
  items: number;
  total: string;
  estimatedEarnings: string;
  createdAt: string;
}

export default function OrderCard({ order }: { order: Order }) {
  return (
    <Panel shaded bordered bodyFill className="overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-lg">{order.shopName}</h3>
            <p className="text-sm text-gray-500">{order.shopAddress}</p>
          </div>
          <Badge
            content={order.createdAt}
            className="bg-green-100 text-green-800 font-medium text-xs px-2 py-1 rounded"
          />
        </div>

        <div className="flex items-center text-sm text-gray-600 mb-3">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="w-4 h-4 mr-1"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span className="mr-3">Distance: {order.distance}</span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="w-4 h-4 mr-1"
          >
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          <span>Items: {order.items}</span>
        </div>

        <div className="flex items-center mb-4">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="w-4 h-4 mr-1 text-gray-500"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span className="text-sm text-gray-500">
            Deliver to: {order.customerAddress}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Estimated Earnings</p>
            <p className="font-bold text-green-600 text-lg">
              {order.estimatedEarnings}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={`/shopper/order/${order.id}`}>
              <Button appearance="ghost" className="text-gray-700">
                View Details
              </Button>
            </Link>
            <Button appearance="primary" className="bg-green-500 text-white">
              Accept Order
            </Button>
          </div>
        </div>
      </div>
    </Panel>
  );
} 