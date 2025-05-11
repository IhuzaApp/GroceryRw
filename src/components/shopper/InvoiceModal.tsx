import React from "react";
import { Modal, Button, Divider, Loader } from "rsuite";
import { formatCurrency } from "../../lib/formatCurrency";
import { downloadInvoiceAsPdf } from "../../lib/invoiceUtils";

interface InvoiceItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  unit: string;
}

interface InvoiceData {
  invoiceNumber: string;
  orderId: string;
  orderNumber: string;
  customer: string;
  customerEmail: string;
  shop: string;
  shopAddress: string;
  dateCreated: string;
  dateCompleted: string;
  status: string;
  items: InvoiceItem[];
  subtotal: number;
  serviceFee: number;
  deliveryFee: number;
  total: number;
}

interface InvoiceModalProps {
  open: boolean;
  onClose: () => void;
  invoiceData: InvoiceData | null;
  loading: boolean;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({
  open,
  onClose,
  invoiceData,
  loading,
}) => {
  const handleDownload = async () => {
    if (!invoiceData) return;

    try {
      await downloadInvoiceAsPdf(invoiceData);
    } catch (error) {
      console.error("Error downloading invoice:", error);
    }
  };

  if (loading) {
    return (
      <Modal open={open} onClose={onClose} size="md">
        <Modal.Header>
          <Modal.Title>Generating Invoice</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="flex flex-col items-center justify-center py-8">
            <Loader size="lg" content="Generating invoice..." />
          </div>
        </Modal.Body>
      </Modal>
    );
  }

  if (!invoiceData) {
    return (
      <Modal open={open} onClose={onClose} size="md">
        <Modal.Header>
          <Modal.Title>Invoice Error</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="py-4 text-center text-red-600">
            Could not generate invoice. Please try again later.
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onClose} appearance="primary">
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={onClose} size="md">
      <Modal.Header>
        <Modal.Title>Payment Invoice</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="space-y-4 p-2">
          {/* Invoice Header */}
          <div className="border-b pb-3">
            <div className="flex justify-between">
              <div>
                <h2 className="text-lg font-bold">Invoice</h2>
                <p className="text-sm text-gray-600">
                  #{invoiceData.invoiceNumber}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">Order #{invoiceData.orderNumber}</p>
                <p className="text-sm text-gray-600">
                  Status:{" "}
                  <span className="font-medium text-green-600">
                    {invoiceData.status}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Date and Shop Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-600">
                Date Created
              </h3>
              <p className="text-sm">{invoiceData.dateCreated}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">
                Date Completed
              </h3>
              <p className="text-sm">{invoiceData.dateCompleted}</p>
            </div>
          </div>

          {/* Shop and Customer Details */}
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-3">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Shopped At</h3>
              <p className="font-medium">{invoiceData.shop}</p>
              <p className="text-sm text-gray-600">{invoiceData.shopAddress}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Customer</h3>
              <p className="font-medium">{invoiceData.customer}</p>
              <p className="text-sm text-gray-600">
                {invoiceData.customerEmail}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="mt-4">
            <h3 className="mb-2 text-sm font-medium text-gray-600">
              Items Found
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-50 text-left">
                  <tr>
                    <th className="p-2 text-sm font-medium text-gray-600">
                      Item
                    </th>
                    <th className="p-2 text-sm font-medium text-gray-600">
                      Qty
                    </th>
                    <th className="p-2 text-sm font-medium text-gray-600">
                      Unit Price
                    </th>
                    <th className="p-2 text-right text-sm font-medium text-gray-600">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2 text-sm">{item.name}</td>
                      <td className="p-2 text-sm">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="p-2 text-sm">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="p-2 text-right text-sm">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="mt-4 space-y-1 rounded-lg bg-gray-50 p-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Subtotal</span>
              <span className="text-sm">
                {formatCurrency(invoiceData.subtotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Service Fee</span>
              <span className="text-sm">
                {formatCurrency(invoiceData.serviceFee)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Delivery Fee</span>
              <span className="text-sm">
                {formatCurrency(invoiceData.deliveryFee)}
              </span>
            </div>
            <Divider />
            <div className="flex justify-between">
              <span className="font-medium">Total</span>
              <span className="font-medium">
                {formatCurrency(invoiceData.total)}
              </span>
            </div>
          </div>

          {/* Payment Note */}
          <div className="mt-4 rounded-md bg-blue-50 p-3 text-sm text-blue-800">
            <p>
              <strong>Note:</strong> Service fee and delivery fee were added to
              your available wallet balance when you started shopping. The
              payment reflects only the value of found items.
            </p>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleDownload} appearance="primary" color="blue">
          Download Invoice
        </Button>
        <Button onClick={onClose} appearance="subtle">
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default InvoiceModal;
