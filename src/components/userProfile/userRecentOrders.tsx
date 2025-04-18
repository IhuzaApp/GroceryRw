import React from "react";
import { Tag, Button } from "rsuite";

export default function UserRecentOrders() {
  return (
    <>
      <h3 className="mb-4 text-lg font-bold">Recent Orders</h3>

      {[1, 2, 3].map((order) => (
        <div key={order} className="mb-4 rounded-lg border p-4">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <span className="font-bold">
                Order #{Math.floor(Math.random() * 10000)}
              </span>
              <span className="ml-4 text-sm text-gray-500">
                April {10 + order}, 2025
              </span>
            </div>
            <Tag
              color="green"
              className="border-green-200 bg-green-100 text-green-600"
            >
              Delivered
            </Tag>
          </div>
          <div className="mb-3 flex justify-between text-sm text-gray-600">
            <span>5 items</span>
            <span className="font-bold">$78.35</span>
          </div>
          <div className="flex gap-2">
            <Button appearance="ghost" size="sm">
              View Details
            </Button>
            <Button appearance="ghost" size="sm">
              Reorder
            </Button>
          </div>
        </div>
      ))}

      <div className="mt-4 text-center">
        <Button appearance="link">View All Orders</Button>
      </div>
    </>
  );
}
