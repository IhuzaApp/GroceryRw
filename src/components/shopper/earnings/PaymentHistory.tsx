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
  onViewAllPayments
}) => {
  return (
    <div>
      <div className="mb-6">
        <h3 className="font-medium mb-2">Next Payout</h3>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-lg font-bold">${nextPayout.amount.toFixed(2)}</div>
              <div className="text-sm text-gray-500">Scheduled for {nextPayout.date}</div>
            </div>
            <Button appearance="primary">View Details</Button>
          </div>
        </div>
      </div>

      <h3 className="font-medium mb-4">Payment History</h3>
      <div className="space-y-4">
        {payments.map((item, index) => (
          <div
            key={index}
            className="flex justify-between items-center p-4 border border-gray-200 rounded-lg"
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

      <Button appearance="primary" color="green" className="w-full mt-4" onClick={onViewAllPayments}>
        View All Payments
      </Button>
    </div>
  );
};

export default PaymentHistory; 