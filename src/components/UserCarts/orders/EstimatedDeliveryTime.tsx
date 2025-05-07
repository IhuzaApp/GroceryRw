import React from 'react';

interface EstimatedDeliveryTimeProps {
  estimatedDelivery: string;
  status: string;
}

const EstimatedDeliveryTime: React.FC<EstimatedDeliveryTimeProps> = ({ estimatedDelivery, status }) => {
  const now = new Date();
  const est = new Date(estimatedDelivery);
  const diffMs = est.getTime() - now.getTime();
  let text: string;
  let isLate = false;

  // If order is already delivered, show Delivered label
  if (status === 'delivered') {
    return <span className="text-green-600 font-bold">Delivered</span>;
  }

  if (diffMs >= 0) {
    // Time remaining
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) {
      text = `In ${days} day${days > 1 ? 's' : ''}${hours > 0 ? ` ${hours}h` : ''}`;
    } else if (hours > 0) {
      text = `In ${hours}h${mins > 0 ? ` ${mins}m` : ''}`;
    } else {
      text = `In ${mins}m`;
    }
  } else {
    // Past due
    const lateMs = -diffMs;
    const days = Math.floor(lateMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((lateMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((lateMs % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) {
      text = `Exceeded by ${days} day${days > 1 ? 's' : ''}${hours > 0 ? ` ${hours}h` : ''}`;
    } else if (hours > 0) {
      text = `Exceeded by ${hours}h${mins > 0 ? ` ${mins}m` : ''}`;
    } else {
      text = `Exceeded by ${mins}m`;
    }
    isLate = true;
  }

  return <span className={isLate ? 'text-red-500 font-bold' : ''}>{text}</span>;
};

export default EstimatedDeliveryTime; 