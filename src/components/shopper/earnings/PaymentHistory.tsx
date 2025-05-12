import React from "react";
import { Panel, Button } from "rsuite";

interface NextPayout {
  amount: number;
  date: string;
}

interface Payment {
  date: string;
  amount: number;
  status: string;
}

interface PaymentHistoryProps {
  nextPayout: NextPayout;
  payments: Payment[];
  onViewAllPayments: () => void;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  nextPayout,
  payments,
  onViewAllPayments,
}) => {
  return (
    <div>
      <div className="mb-6">
        <h3 className="mb-2 font-medium">Next Payout</h3>
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold">
                ${nextPayout.amount.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">
                Scheduled for {nextPayout.date}
              </div>
            </div>
            <Button appearance="primary">View Details</Button>
          </div>
        </div>
      </div>

      <h3 className="mb-4 font-medium">Payment History</h3>
      <div className="space-y-4">
        {payments.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
          >
            <div>
              <div className="font-medium">Payout</div>
              <div className="text-sm text-gray-500">{item.date}</div>
            </div>
            <div className="text-right">
              <div className="font-medium">${item.amount.toFixed(2)}</div>
              <div className="text-sm text-green-600">{item.status}</div>
            </div>
          </div>
        ))}
      </div>

      <Button
        appearance="primary"
        color="green"
        className="mt-4 w-full"
        onClick={onViewAllPayments}
      >
        View All Payments
      </Button>
    </div>
  );
};

export default PaymentHistory;
