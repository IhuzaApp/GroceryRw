import React, { useState, useEffect, useCallback } from "react";
import { Button, Modal, Radio } from "rsuite";
import { formatCurrencySync } from "../../../utils/formatCurrency";

interface PaymentMethod {
  id: string;
  method: string;
  names: string;
  number: string;
  is_default: boolean;
}

interface PaymentMethodSelectorProps {
  totalAmount: number;
  onSelect: (method: {
    type: "refund" | "card" | "momo";
    id?: string;
    number?: string;
  }) => void;
}

export default function PaymentMethodSelector({
  totalAmount,
  onSelect,
}: PaymentMethodSelectorProps) {
  const [show, setShow] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [refundBalance, setRefundBalance] = useState(0);

  const fetchPaymentMethods = useCallback(async () => {
    try {
      const response = await fetch("/api/queries/payment-methods");
      const data = await response.json();
      setPaymentMethods(data.paymentMethods || []);

      // Find and select the default payment method
      const defaultMethod = data.paymentMethods?.find(
        (m: PaymentMethod) => m.is_default
      );
      if (defaultMethod) {
        setSelectedMethod(defaultMethod.id);
        onSelect({
          type:
            defaultMethod.method.toLowerCase() === "mtn momo" ? "momo" : "card",
          id: defaultMethod.id,
          number: defaultMethod.number,
        });
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    }
  }, [onSelect]);

  const fetchRefundBalance = useCallback(async () => {
    try {
      const response = await fetch("/api/queries/refunds");
      const data = await response.json();
      setRefundBalance(parseFloat(data.totalAmount || "0"));
    } catch (error) {
      console.error("Error fetching refund balance:", error);
    }
  }, []);

  useEffect(() => {
    fetchPaymentMethods();
    fetchRefundBalance();
  }, [fetchPaymentMethods, fetchRefundBalance]);

  const handleOpen = () => setShow(true);
  const handleClose = () => setShow(false);

  const handleSelect = () => {
    if (!selectedMethod) return;

    if (selectedMethod === "refund") {
      onSelect({ type: "refund" });
    } else {
      const method = paymentMethods.find((m) => m.id === selectedMethod);
      if (method) {
        onSelect({
          type: method.method.toLowerCase() === "mtn momo" ? "momo" : "card",
          id: method.id,
          number: method.number,
        });
      }
    }
    handleClose();
  };

  const canUseRefund = refundBalance >= totalAmount;

  const handleRadioChange = (value: any) => {
    if (typeof value === "string") {
      setSelectedMethod(value);
    }
  };

  const formatPaymentNumber = (method: string, number: string) => {
    if (method.toLowerCase() === "mtn momo") {
      return `•••• ${number.slice(-3)}`;
    }
    return `•••• ${number.slice(-4)}`;
  };

  return (
    <>
      <Button color="green" appearance="link" size="sm" onClick={handleOpen}>
        Change
      </Button>

      <Modal open={show} onClose={handleClose} size="sm">
        <Modal.Header>
          <Modal.Title>Select Payment Method</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            {/* Refund Option */}
            <div className="rounded-lg border p-4">
              <Radio
                value="refund"
                checked={selectedMethod === "refund"}
                onChange={handleRadioChange}
                disabled={!canUseRefund}
              >
                <div className="ml-2">
                  <div className="font-medium">Use Refund Balance</div>
                  <div className="text-sm text-gray-600">
                    Available: {formatCurrencySync(refundBalance)}
                    {!canUseRefund && (
                      <span className="ml-2 text-red-500">
                        (Insufficient balance)
                      </span>
                    )}
                  </div>
                </div>
              </Radio>
            </div>

            {/* Saved Payment Methods */}
            {paymentMethods.length > 0 && (
              <div className="space-y-2">
                <div className="font-medium text-gray-700">
                  Saved Payment Methods
                </div>
                {paymentMethods.map((method) => (
                  <div key={method.id} className="rounded-lg border p-4">
                    <Radio
                      value={method.id}
                      checked={selectedMethod === method.id}
                      onChange={handleRadioChange}
                    >
                      <div className="ml-2">
                        <div className="font-medium">{method.method}</div>
                        <div className="text-sm text-gray-600">
                          {formatPaymentNumber(method.method, method.number)}
                        </div>
                      </div>
                    </Radio>
                  </div>
                ))}
              </div>
            )}

            {paymentMethods.length === 0 && !canUseRefund && (
              <div className="text-center text-gray-500">
                No payment methods available
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleClose} appearance="subtle">
            Cancel
          </Button>
          <Button
            onClick={handleSelect}
            appearance="primary"
            disabled={!selectedMethod}
          >
            Select
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
