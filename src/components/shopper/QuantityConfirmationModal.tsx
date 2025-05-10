import React from "react";
import { Modal, Button } from "rsuite";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    image: string;
    price: number;
    description?: string;
    measurement_unit?: string;
    category?: string;
    quantity?: number;
  };
  found?: boolean;
  foundQuantity?: number;
}

interface QuantityConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  currentItem: OrderItem | null;
  foundQuantity: number;
  setFoundQuantity: (quantity: number) => void;
  onConfirm: () => void;
}

export default function QuantityConfirmationModal({
  open,
  onClose,
  currentItem,
  foundQuantity,
  setFoundQuantity,
  onConfirm,
}: QuantityConfirmationModalProps) {
  if (!currentItem) return null;

  return (
    <Modal open={open} onClose={onClose} size="xs">
      <Modal.Header className="border-b bg-gray-100">
        <Modal.Title className="text-lg font-semibold text-gray-800">
          Confirm Quantity Found
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-md font-medium text-gray-800">
              {currentItem.product.name}
            </h3>
            <p className="text-sm text-gray-600">
              Customer requested: {currentItem.quantity}{" "}
              {currentItem.product.measurement_unit || "items"}
            </p>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              How many did you find? (Max: {currentItem.quantity})
            </label>
            <div className="flex items-center justify-center">
              <button
                className="rounded-l-md border bg-gray-100 px-3 py-1 hover:bg-gray-200"
                onClick={() => setFoundQuantity(Math.max(1, foundQuantity - 1))}
                disabled={foundQuantity <= 1}
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max={currentItem.quantity}
                value={foundQuantity}
                onChange={(e) => {
                  const newValue = parseInt(e.target.value) || 1;
                  if (newValue > currentItem.quantity) {
                    // Show visual feedback that this exceeds the maximum
                    e.target.classList.add("bg-red-50");
                    setTimeout(
                      () => e.target.classList.remove("bg-red-50"),
                      500
                    );
                  }
                  setFoundQuantity(
                    Math.min(currentItem.quantity, Math.max(1, newValue))
                  );
                }}
                className="w-16 border-b border-t py-1 text-center"
              />
              <button
                className="rounded-r-md border bg-gray-100 px-3 py-1 hover:bg-gray-200"
                onClick={() =>
                  setFoundQuantity(
                    Math.min(currentItem.quantity, foundQuantity + 1)
                  )
                }
                disabled={foundQuantity >= currentItem.quantity}
              >
                +
              </button>
            </div>
            {foundQuantity === currentItem.quantity ? (
              <p className="mt-2 text-center text-xs text-green-600">
                All items will be marked as found
              </p>
            ) : (
              <p className="mt-2 text-center text-xs text-orange-600">
                {foundQuantity} of {currentItem.quantity} items will be marked
                as found
              </p>
            )}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onClose} appearance="subtle">
          Cancel
        </Button>
        <Button onClick={onConfirm} appearance="primary" color="green">
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
