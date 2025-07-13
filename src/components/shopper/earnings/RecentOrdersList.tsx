import React, { useState } from "react";
import { Button, Loader, Pagination } from "rsuite";
import { useTheme } from "../../../context/ThemeContext";
import { formatCurrencySync } from "../../utils/formatCurrency";

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
  isLoading?: boolean;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  totalOrders?: number;
  currentPage?: number;
  serverPagination?: boolean;
}

const RecentOrdersList: React.FC<RecentOrdersListProps> = ({
  orders,
  isLoading = false,
  pageSize = 5,
  onPageChange,
  totalOrders,
  currentPage: externalCurrentPage,
  serverPagination = false,
}) => {
  const { theme } = useTheme();
  // Local pagination state (used when serverPagination is false)
  const [localCurrentPage, setLocalCurrentPage] = useState(1);

  // Use external or local pagination state
  const currentPage = externalCurrentPage || localCurrentPage;

  // Format currency in RWF
  const formatCurrency = (amount: number) => {
    return formatCurrencySync(amount);
  };

  // Handle pagination change
  const handlePageChange = (page: number) => {
    if (serverPagination && onPageChange) {
      // Let parent component handle pagination (API call)
      onPageChange(page);
    } else {
      // Handle pagination locally
      setLocalCurrentPage(page);
    }
  };

  // Calculate total pages for local pagination
  const totalPages = serverPagination
    ? Math.ceil((totalOrders || 0) / pageSize)
    : Math.ceil(orders.length / pageSize);

  // Get current page items for local pagination
  const displayedOrders = serverPagination
    ? orders
    : orders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div
      className={`mt-8 border-t pt-4 ${
        theme === "dark" ? "border-gray-700" : "border-gray-200"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3
          className={`font-medium ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          Recent Orders
        </h3>
        {!isLoading && orders.length > 0 && (
          <span
            className={`text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {serverPagination
              ? `Showing ${(currentPage - 1) * pageSize + 1}-${Math.min(
                  currentPage * pageSize,
                  totalOrders || 0
                )} of ${totalOrders}`
              : `Showing ${(currentPage - 1) * pageSize + 1}-${Math.min(
                  currentPage * pageSize,
                  orders.length
                )} of ${orders.length}`}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader size="md" content="Loading recent orders..." />
        </div>
      ) : orders.length === 0 ? (
        <div
          className={`rounded-lg p-6 text-center ${
            theme === "dark" ? "bg-gray-800" : "bg-gray-50"
          }`}
        >
          <p className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>
            No recent orders found
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedOrders.map((item, index) => {
            // Calculate service fee and delivery fee if not provided directly
            const serviceFee =
              item.serviceFee !== undefined
                ? item.serviceFee
                : item.amount * 0.6;
            const deliveryFee =
              item.deliveryFee !== undefined
                ? item.deliveryFee
                : item.amount * 0.4;

            return (
              <div
                key={item.id || index}
                className={`flex items-center justify-between rounded-lg p-3 ${
                  theme === "dark"
                    ? "border border-gray-700 bg-gray-800"
                    : "bg-gray-50"
                }`}
              >
                <div>
                  <div
                    className={`font-medium ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {item.store} ({item.items} items)
                  </div>
                  <div
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {item.date}
                    {item.orderNumber && (
                      <span
                        className={`ml-2 text-xs ${
                          theme === "dark" ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
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
                  <div
                    className={`font-medium ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
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

      {/* Pagination controls */}
      {!isLoading && totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination
            prev
            next
            size="sm"
            total={(serverPagination ? totalOrders : orders.length) || 0}
            limit={pageSize}
            activePage={currentPage}
            maxButtons={5}
            onChangePage={handlePageChange}
          />
        </div>
      )}

      {/* Load more button as an alternative to pagination */}
      {!isLoading && !serverPagination && currentPage < totalPages && (
        <Button
          appearance="ghost"
          className="mt-4 w-full"
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Load More Orders
        </Button>
      )}
    </div>
  );
};

export default RecentOrdersList;
