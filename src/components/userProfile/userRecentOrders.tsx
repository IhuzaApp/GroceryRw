import React from "react";
import { Tag, Button, Avatar } from "rsuite";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function UserRecentOrders({ filter }: any) {
  const pathname = usePathname();
  const isPendingOrdersPage = pathname === "/CurrentPendingOrders";

  const user = {
    fullName: "Jane Doe",
    email: "janedoe@example.com",
    avatarUrl: "https://via.placeholder.com/40",
  };

  return (
    <>
      <h3 className="mb-4 text-lg font-bold">Orders</h3>

      {[1, 2, 3, 4, 5].map((order) => (
        <div
          key={order}
          className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-md"
        >
          {/* User Profile */}
          <div className="mb-4 flex items-center gap-3">
            <Avatar circle src={user.avatarUrl} alt={user.fullName} />
            <div>
              <div className="font-semibold">{user.fullName}</div>
              <div className="text-sm text-gray-500">{user.email}</div>
            </div>
          </div>

          {/* Order Info */}
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
            <Link href={"/CurrentPendingOrders/viewOrderDetails"} passHref>
              <Button appearance="ghost" size="sm">
                View Details
              </Button>
            </Link>

            {!isPendingOrdersPage && (
              <Button appearance="ghost" size="sm">
                Reorder
              </Button>
            )}
          </div>
        </div>
      ))}

      <div className="mt-4 text-center">
        <Button appearance="link">View All Orders</Button>
      </div>
    </>
  );
}
