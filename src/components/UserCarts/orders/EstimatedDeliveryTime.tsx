import React from "react";

interface EstimatedDeliveryTimeProps {
  estimatedDelivery: string;
  status: string;
}

const EstimatedDeliveryTime: React.FC<EstimatedDeliveryTimeProps> = ({
  estimatedDelivery,
  status,
}) => {
  if (!estimatedDelivery) {
    return <span className="text-gray-500">No delivery time available</span>;
  }

  const now = new Date();
  const est = new Date(estimatedDelivery);
  const diffMs = est.getTime() - now.getTime();
  let text: string;
  let isLate = false;

  // Format the absolute time for display
  const absoluteTime = est.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  // If order is already delivered, show Delivered label
  if (status === "delivered") {
    return (
      <div className="flex items-center rounded-lg bg-green-50 p-3 text-green-700">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="mr-2 h-5 w-5"
        >
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <div>
          <div className="font-bold">Delivered Successfully</div>
          <div className="text-sm">Your order was delivered on {absoluteTime}</div>
        </div>
      </div>
    );
  }

  if (diffMs >= 0) {
    // Time remaining
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      text = `Delivery in ${days} day${days > 1 ? "s" : ""}${
        hours > 0 ? ` ${hours}h` : ""
      }`;
    } else if (hours > 0) {
      text = `Delivery in ${hours}h${mins > 0 ? ` ${mins}m` : ""}`;
    } else {
      text = `Delivery in ${mins} minute${mins !== 1 ? "s" : ""}`;
    }
    
    return (
      <div className="flex items-center rounded-lg bg-blue-50 p-3 text-blue-700">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="mr-2 h-5 w-5"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <div>
          <div className="font-bold">{text}</div>
          <div className="text-sm">Expected on {absoluteTime}</div>
        </div>
      </div>
    );
  } else {
    // Past due
    const lateMs = -diffMs;
    const days = Math.floor(lateMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (lateMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const mins = Math.floor((lateMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      text = `Delayed by ${days} day${days > 1 ? "s" : ""}${
        hours > 0 ? ` ${hours}h` : ""
      }`;
    } else if (hours > 0) {
      text = `Delayed by ${hours}h${mins > 0 ? ` ${mins}m` : ""}`;
    } else {
      text = `Delayed by ${mins} minute${mins !== 1 ? "s" : ""}`;
    }
    
    return (
      <div className="flex items-center rounded-lg bg-red-50 p-3 text-red-700">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="mr-2 h-5 w-5"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <div>
          <div className="font-bold">{text}</div>
          <div className="text-sm">Expected on {absoluteTime}</div>
        </div>
      </div>
    );
  }
};

export default EstimatedDeliveryTime;
