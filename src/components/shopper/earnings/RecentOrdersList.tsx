import React from "react";
import { Button } from "rsuite";

interface Order {
  date: string;
  store: string;
  items: number;
  amount: number;
  tip: number;
}

interface RecentOrdersListProps {
  orders: Order[];
  onViewAllOrders: () => void;
}

const RecentOrdersList: React.FC<RecentOrdersListProps> = ({
  orders,
  onViewAllOrders,
}) => {
  return (
    <div className="mt-8 border-t pt-4">
      <h3 className="mb-4 font-medium">Recent Orders</h3>
      <div className="space-y-4">
        {orders.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
          >
            <div>
              <div className="font-medium">
                {item.store} ({item.items} items)
              </div>
              <div className="text-sm text-gray-500">{item.date}</div>
            </div>
            <div className="text-right">
              <div className="font-medium">
                ${(item.amount + item.tip).toFixed(2)}
              </div>
              <div className="text-sm text-green-600">
                Tip: ${item.tip.toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>

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
