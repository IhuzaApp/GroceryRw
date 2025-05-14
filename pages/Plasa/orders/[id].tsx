"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ShopperLayout from "../../../src/components/shopper/ShopperLayout";
import { Panel, Loader, Button, Divider, Timeline, Tag } from "rsuite";
import { formatCurrency } from "../../../src/lib/formatCurrency";
import Link from "next/link";
import { toast } from "react-hot-toast";

// Define interface for order data
interface OrderDetails {
  id: string;
  shopName: string;
  shopAddress: string;
  customerAddress: string;
  items: any[];
  createdAt: string;
  status: string;
  total: number;
  estimatedEarnings: number;
  shopLatitude?: number;
  shopLongitude?: number;
  customerLatitude?: number;
  customerLongitude?: number;
}

export default function OrderDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  useEffect(() => {
    // Only fetch data when ID is available
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const fetchOrderDetails = async () => {
    setIsLoading(true);
    try {
      // Fetch order details from API
      const response = await fetch(`/api/shopper/orderDetails?id=${id}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch order details");
      }
      
      const data = await response.json();
      
      if (data.success) {
        setOrderDetails(data.order);
      } else {
        toast.error(data.error || "Failed to load order details");
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast.error("Failed to load order details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptOrder = async () => {
    if (!id) return;
    
    setIsAccepting(true);
    try {
      const response = await fetch("/api/shopper/assignOrder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: id }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success("Order assigned successfully!");
        // Refresh order details
        fetchOrderDetails();
      } else if (data.error === "no_wallet") {
        toast.error("You need a wallet to accept batches");
        
        try {
          // Create wallet automatically
          const walletResponse = await fetch("/api/queries/createWallet", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
          
          const walletData = await walletResponse.json();
          
          if (walletData.success) {
            toast.success("Wallet created. Trying to accept the batch again...");
            
            // Try again after wallet creation
            setTimeout(async () => {
              const retryResponse = await fetch("/api/shopper/assignOrder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: id }),
              });
              
              const retryData = await retryResponse.json();
              
              if (retryData.success) {
                toast.success("Order assigned successfully!");
                fetchOrderDetails();
              } else {
                toast.error(retryData.error || "Failed to assign order");
              }
              
              setIsAccepting(false);
            }, 1000);
            
            return;
          } else {
            toast.error("Failed to create wallet");
          }
        } catch (walletError) {
          console.error("Error creating wallet:", walletError);
          toast.error("Failed to create wallet");
        }
      } else {
        toast.error(data.error || "Failed to assign order");
      }
    } catch (error) {
      console.error("Error accepting order:", error);
      toast.error("Failed to accept order");
    } finally {
      setIsAccepting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return "orange";
      case "ASSIGNED":
        return "blue";
      case "SHOPPING":
        return "cyan";
      case "DELIVERING":
        return "yellow";
      case "DELIVERED":
        return "green";
      case "CANCELLED":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <ShopperLayout>
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="mb-4 flex items-center">
          <Link href="/">
            <Button appearance="link">
              <span className="flex items-center">
                <span className="mr-1">←</span> Back to Available Batches
              </span>
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader content="Loading order details..." />
          </div>
        ) : !orderDetails ? (
          <Panel shaded bordered bodyFill className="mx-auto max-w-3xl">
            <div className="p-8 text-center">
              <h2 className="mb-4 text-xl font-semibold">Order Not Found</h2>
              <p className="mb-4 text-gray-600">
                The order you're looking for could not be found or you don't have permission to view it.
              </p>
              <Link href="/">
                <Button appearance="primary" color="green">
                  Return to Available Batches
                </Button>
              </Link>
            </div>
          </Panel>
        ) : (
          <div className="mx-auto max-w-3xl">
            <Panel shaded bordered bodyFill className="mb-4">
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h1 className="text-2xl font-bold">Order #{orderDetails.id.substring(0, 8)}</h1>
                  <Tag color={getStatusColor(orderDetails.status)}>
                    {orderDetails.status}
                  </Tag>
                </div>

                <Divider />

                <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="mb-2 text-lg font-semibold">Shop Information</h3>
                    <p className="font-medium">{orderDetails.shopName}</p>
                    <p className="text-gray-600">{orderDetails.shopAddress}</p>
                  </div>

                  <div>
                    <h3 className="mb-2 text-lg font-semibold">Customer Information</h3>
                    <p className="text-gray-600">{orderDetails.customerAddress}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="mb-4 text-lg font-semibold">Order Items</h3>
                  {orderDetails.items && orderDetails.items.length > 0 ? (
                    <div className="rounded border">
                      <table className="w-full text-left">
                        <thead className="border-b bg-gray-50">
                          <tr>
                            <th className="px-4 py-2">Item</th>
                            <th className="px-4 py-2">Quantity</th>
                            <th className="px-4 py-2">Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orderDetails.items.map((item, index) => (
                            <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                              <td className="px-4 py-3">{item.name}</td>
                              <td className="px-4 py-3">{item.quantity}</td>
                              <td className="px-4 py-3">{formatCurrency(item.price)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500">No items information available</p>
                  )}
                </div>

                <div className="mb-6 rounded border bg-gray-50 p-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Total Order Amount:</span>
                    <span className="font-bold">{formatCurrency(orderDetails.total)}</span>
                  </div>
                  <div className="mt-2 flex justify-between text-green-600">
                    <span className="font-medium">Estimated Earnings:</span>
                    <span className="font-bold">{formatCurrency(orderDetails.estimatedEarnings)}</span>
                  </div>
                </div>

                {orderDetails.status === "PENDING" && (
                  <div className="flex justify-end">
                    <Button
                      appearance="primary"
                      color="green"
                      size="lg"
                      onClick={handleAcceptOrder}
                      disabled={isAccepting}
                    >
                      {isAccepting ? (
                        <div className="flex items-center">
                          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                          Accepting...
                        </div>
                      ) : (
                        "Accept Batch"
                      )}
                    </Button>
                  </div>
                )}
                
                {orderDetails.status === "ASSIGNED" && (
                  <div className="flex justify-end space-x-4">
                    <Button appearance="ghost" color="red">
                      Cancel Batch
                    </Button>
                    <Button appearance="primary" color="blue">
                      Start Shopping
                    </Button>
                  </div>
                )}
              </div>
            </Panel>
          </div>
        )}
      </div>
    </ShopperLayout>
  );
} 