import UserPendingOrders from "@components/UserCarts/orders/UserPendingOrders";
import RootLayout from "@components/ui/layout";
import Link from "next/link";
import React from "react";

export default function ViewOrderDetailsPage() {
  return (
    <RootLayout>
      <div className="p-4 md:ml-16">
        {/* Adjust ml-* to match your sidebar width */}
        <div className="container mx-auto">
          <UserPendingOrders />
        </div>
      </div>
    </RootLayout>
  );
}
