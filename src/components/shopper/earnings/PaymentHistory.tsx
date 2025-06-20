import React, { useState } from "react";
import { Panel, Button, Tag, Pagination } from "rsuite";
import { useTheme } from "../../../context/ThemeContext";

interface Wallet {
  id: string;
  availableBalance: number;
  reservedBalance: number;
}

interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  description: string;
  date: string;
  time?: string;
  orderId?: string | null;
  orderNumber?: number | null;
}

interface PaymentHistoryProps {
  wallet: Wallet | null;
  transactions: Transaction[];
  onViewAllPayments: () => void;
  isLoading?: boolean;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  wallet,
  transactions,
  onViewAllPayments,
  isLoading = false,
}) => {
  const { theme } = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Calculate pagination
  const totalPages = Math.ceil(transactions.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentTransactions = transactions.slice(startIndex, endIndex);

  // Determine tag color based on transaction type
  const getTagColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "payment":
        return "green";
      case "deposit":
        return "blue";
      case "withdrawal":
        return "orange";
      case "refund":
        return "violet";
      default:
        return "cyan";
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Next payout is the available balance
  const nextPayoutAmount = wallet?.availableBalance || 0;
  const nextPayoutDate = new Date();
  nextPayoutDate.setDate(nextPayoutDate.getDate() + 7); // Next payout in 7 days
  const formattedNextPayoutDate = nextPayoutDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      <div className="mb-6">
        <h3
          className={`mb-2 font-medium ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          Next Payout
        </h3>
        <div
          className={`rounded-lg border p-4 ${
            theme === "dark"
              ? "border-green-700 bg-green-900/20"
              : "border-green-200 bg-green-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div
                className={`text-lg font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {formatCurrency(nextPayoutAmount)}
              </div>
              <div
                className={`text-sm ${
                  theme === "dark" ? "text-gray-300" : "text-gray-500"
                }`}
              >
                Available for withdrawal
              </div>
              <div
                className={`mt-1 text-xs ${
                  theme === "dark" ? "text-gray-400" : "text-gray-400"
                }`}
              >
                Next automatic payout on {formattedNextPayoutDate}
              </div>
            </div>
            <Button appearance="primary">Request Payout</Button>
          </div>
        </div>
      </div>

      <h3
        className={`mb-4 font-medium ${
          theme === "dark" ? "text-white" : "text-gray-900"
        }`}
      >
        Transaction History
      </h3>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <p className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>
            Loading transaction history...
          </p>
        </div>
      ) : transactions.length === 0 ? (
        <div
          className={`rounded-lg border p-6 text-center ${
            theme === "dark"
              ? "border-gray-700 bg-gray-800"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <p className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>
            No transaction history available yet
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentTransactions.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between rounded-lg border p-4 ${
                theme === "dark"
                  ? "border-gray-700 bg-gray-800"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div>
                <div
                  className={`font-medium ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {item.description ||
                    item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  <Tag color={getTagColor(item.type)} className="ml-2">
                    {item.type}
                  </Tag>
                </div>
                <div
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {item.date}
                </div>
                {item.orderId && (
                  <div
                    className={`text-xs ${
                      theme === "dark" ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    Order: #{item.orderNumber || "Unknown"}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div
                  className={`font-medium ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {item.type.toLowerCase() === "withdrawal" ? "-" : "+"}
                  {formatCurrency(item.amount)}
                </div>
                <div
                  className={`text-sm ${
                    item.status.toLowerCase() === "completed"
                      ? "text-green-600"
                      : item.status.toLowerCase() === "pending"
                      ? "text-orange-500"
                      : item.status.toLowerCase() === "failed"
                      ? "text-red-500"
                      : theme === "dark"
                      ? "text-gray-400"
                      : "text-gray-500"
                  }`}
                >
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && transactions.length > pageSize && (
        <div className="mt-4 flex items-center justify-between">
          <div
            className={`text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Showing {startIndex + 1}-{Math.min(endIndex, transactions.length)}{" "}
            of {transactions.length} transactions
          </div>
          <Pagination
            size="sm"
            total={transactions.length}
            limit={pageSize}
            activePage={currentPage}
            maxButtons={3}
            onChangePage={setCurrentPage}
          />
        </div>
      )}

      <Button
        appearance="primary"
        color="green"
        className="mt-4 w-full"
        onClick={onViewAllPayments}
      >
        View All Transactions
      </Button>
    </div>
  );
};

export default PaymentHistory;
