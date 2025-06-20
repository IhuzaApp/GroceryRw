import React from "react";
import { Modal, Button, InputNumber, Form } from "rsuite";
import { OrderItem } from "../../types/order";
import { useTheme } from "../../context/ThemeContext";

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
  const { theme } = useTheme();

  if (!currentItem) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      className={theme === "dark" ? "bg-gray-900" : ""}
    >
      <Modal.Header className={theme === "dark" ? "bg-gray-800" : ""}>
        <Modal.Title className={theme === "dark" ? "text-gray-100" : ""}>
          Confirm Quantity Found
        </Modal.Title>
      </Modal.Header>
      <Modal.Body
        className={theme === "dark" ? "bg-gray-900 text-gray-100" : ""}
      >
        <div className="mb-4">
          <p className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>
            How many units of {currentItem.product.name} did you find?
          </p>
          <p
            className={`text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Requested quantity: {currentItem.quantity}
          </p>
        </div>
        <Form>
          <Form.Group>
            <Form.ControlLabel
              className={theme === "dark" ? "text-gray-300" : ""}
            >
              Found Quantity
            </Form.ControlLabel>
            <InputNumber
              value={foundQuantity}
              onChange={(value) => setFoundQuantity(value || 0)}
              min={0}
              max={currentItem.quantity}
              className={theme === "dark" ? "bg-gray-800 text-gray-100" : ""}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer className={theme === "dark" ? "bg-gray-800" : ""}>
        <Button
          appearance="subtle"
          onClick={onClose}
          className={theme === "dark" ? "text-gray-300" : ""}
        >
          Cancel
        </Button>
        <Button
          appearance="primary"
          onClick={onConfirm}
          disabled={foundQuantity === 0}
        >
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
