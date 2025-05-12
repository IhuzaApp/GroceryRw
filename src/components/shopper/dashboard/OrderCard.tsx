"use client";

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
  rawCreatedAt?: number;
  minutesAgo?: number;
  priorityLevel?: number;
}

function getBadgeColor(order: Order): string {
  const minutesAgo = order.minutesAgo || 0;

  if (minutesAgo < 10) {
    return "bg-blue-100 text-blue-800";
  } else if (minutesAgo < 60) {
    return "bg-green-100 text-green-800";
  } else if (minutesAgo < 24 * 60) {
    return "bg-orange-100 text-orange-800";
  } else {
    return "bg-purple-100 text-purple-800";
  }
}

function getPriorityLabel(
  priorityLevel: number
): { text: string; class: string } | null {
  if (!priorityLevel || priorityLevel <= 1) return null;

  switch (priorityLevel) {
    case 5:
      return {
        text: "CRITICAL",
        class: "bg-red-600 text-white",
      };
    case 4:
      return {
        text: "HIGH PRIORITY",
        class: "bg-orange-500 text-white",
      };
    case 3:
      return {
        text: "PRIORITY",
        class: "bg-yellow-500 text-white",
      };
    case 2:
      return {
        text: "LOW PRIORITY",
        class: "bg-blue-500 text-white",
      };
    default:
      return null;
  }
}

export default function OrderCard({ order }: { order: Order }) {
  const badgeColorClass = getBadgeColor(order);
  const priorityInfo = getPriorityLabel(order.priorityLevel || 0);

  return (
    <Panel
      shaded
      bordered
      bodyFill
      className={`overflow-hidden ${
        order.priorityLevel && order.priorityLevel >= 4
          ? "border-2 border-red-500"
          : ""
      }`}
    >
      {priorityInfo && (
        <div
          className={`py-1 text-center text-xs font-bold ${priorityInfo.class}`}
        >
          {priorityInfo.text}
        </div>
      )}
      <div className="p-4">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold">{order.shopName}</h3>
            <p className="text-sm text-gray-500">{order.shopAddress}</p>
          </div>
          <Badge
            content={order.createdAt}
            className={`rounded px-2 py-1 text-xs font-medium ${badgeColorClass}`}
          />
        </div>

        <div className="mb-3 flex items-center text-sm text-gray-600">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="mr-1 h-4 w-4"
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
            className="mr-1 h-4 w-4"
          >
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          <span>Items: {order.items}</span>
        </div>

        <div className="mb-4 flex items-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="mr-1 h-4 w-4 text-gray-500"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span className="text-sm text-gray-500">
            Deliver to: {order.customerAddress}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Estimated Earnings</p>
            <p className="text-lg font-bold text-green-600">
              {order.estimatedEarnings}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={`/shopper/order/${order.id}`}>
              <Button appearance="ghost" className="text-gray-700">
                View Details
              </Button>
            </Link>
            <Button
              appearance="primary"
              className={`${
                order.priorityLevel && order.priorityLevel >= 4
                  ? "bg-red-500"
                  : "bg-green-500"
              } text-white`}
              onClick={() => {
                window.location.href = `/shopper/order/${order.id}?action=accept`;
              }}
            >
              Accept Order
            </Button>
          </div>
        </div>
      </div>
    </Panel>
  );
}
