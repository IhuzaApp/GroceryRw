import React from "react";
import { Button, Loader } from "rsuite";

interface Order {
  id: string;
  orderNumber?: string;
  date: string;
  store: string;
  items: number;
  amount: number;
  serviceFee?: number;
  deliveryFee?: number;
  tip?: number;
  minutesTaken?: number;
}

interface RecentOrdersListProps {
  orders: Order[];
  onViewAllOrders: () => void;
  isLoading?: boolean;
}

const RecentOrdersList: React.FC<RecentOrdersListProps> = ({
  orders,
  onViewAllOrders,
  isLoading = false,
}) => {
  // Format currency in RWF
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="mt-8 border-t pt-4">
      <h3 className="mb-4 font-medium">Recent Orders</h3>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader size="md" content="Loading recent orders..." />
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-lg bg-gray-50 p-6 text-center">
          <p className="text-gray-500">No recent orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((item, index) => {
            // Calculate service fee and delivery fee if not provided directly
            const serviceFee = item.serviceFee !== undefined ? item.serviceFee : (item.amount * 0.6);
            const deliveryFee = item.deliveryFee !== undefined ? item.deliveryFee : (item.amount * 0.4);
            
            return (
              <div
                key={item.id || index}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
              >
                <div>
                  <div className="font-medium">
                    {item.store} ({item.items} items)
                  </div>
                  <div className="text-sm text-gray-500">
                    {item.date}
                    {item.orderNumber && (
                      <span className="ml-2 text-xs text-gray-400">
                        Order #{item.orderNumber}
                      </span>
                    )}
                  </div>
                  {item.minutesTaken && (
                    <div className="text-xs text-blue-500">
                      Completed in {item.minutesTaken} min
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {formatCurrency(serviceFee)}
                  </div>
                  <div className="text-sm text-blue-600">
                    Delivery: {formatCurrency(deliveryFee)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Button
        appearance="primary"
        className="mt-4 w-full"
        onClick={onViewAllOrders}
      >
        View All Orders
      </Button>
    </div>
  );
};

export default RecentOrdersList;
