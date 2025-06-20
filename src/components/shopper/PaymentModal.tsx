import React from "react";
import {
  Modal,
  Button,
  Form,
  Input,
  InputGroup,
  Message,
  Divider,
} from "rsuite";
import { useTheme } from "../../context/ThemeContext";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  momoCode: string;
  setMomoCode: (value: string) => void;
  privateKey: string;
  orderAmount: number;
  serviceFee: number;
  deliveryFee: number;
  paymentLoading: boolean;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  onClose,
  onSubmit,
  momoCode,
  setMomoCode,
  privateKey,
  orderAmount,
  serviceFee,
  deliveryFee,
  paymentLoading,
}) => {
  const { theme } = useTheme();

  const formattedCurrency = (amount: number) => {
    return `RWF ${amount.toLocaleString()}`;
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      className={theme === "dark" ? "dark-theme" : ""}
    >
      <Modal.Header>
        <Modal.Title className={theme === "dark" ? "text-gray-100" : ""}>
          Process Payment
        </Modal.Title>
      </Modal.Header>
      <Modal.Body
        className={theme === "dark" ? "bg-gray-800 text-gray-100" : ""}
      >
        <Message
          type="info"
          className={`mb-4 ${
            theme === "dark" ? "bg-blue-900/20 text-blue-300" : ""
          }`}
        >
          <p>
            <strong>IMPORTANT: This is a demo payment flow.</strong>
          </p>
          <p>
            In production, this would connect to a payment provider. For this
            demo, just enter any MoMo code.
          </p>
        </Message>

        <Form fluid>
          <Form.Group>
            <Form.ControlLabel
              className={theme === "dark" ? "text-gray-300" : ""}
            >
              MoMo Code
            </Form.ControlLabel>
            <Form.Control
              name="momoCode"
              value={momoCode}
              onChange={(value) => setMomoCode(value)}
              placeholder="Enter your MoMo code"
              className={
                theme === "dark"
                  ? "border-gray-600 bg-gray-700 text-gray-100"
                  : ""
              }
            />
          </Form.Group>

          <Form.Group>
            <Form.ControlLabel
              className={theme === "dark" ? "text-gray-300" : ""}
            >
              Private Key (Auto-generated)
            </Form.ControlLabel>
            <InputGroup>
              <Input
                value={privateKey}
                disabled
                className={
                  theme === "dark"
                    ? "border-gray-600 bg-gray-700 text-gray-100"
                    : ""
                }
              />
            </InputGroup>
            <Form.HelpText className={theme === "dark" ? "text-gray-400" : ""}>
              This is a one-time key for this transaction. Keep it for your
              records.
            </Form.HelpText>
          </Form.Group>

          <Divider className={theme === "dark" ? "border-gray-700" : ""} />

          <div className="mb-4">
            <h4
              className={`mb-2 font-medium ${
                theme === "dark" ? "text-gray-100" : ""
              }`}
            >
              Payment Summary
            </h4>
            <div
              className={`flex justify-between ${
                theme === "dark" ? "text-gray-300" : ""
              }`}
            >
              <span>Value of Found Items:</span>
              <span className="font-medium">
                {formattedCurrency(orderAmount)}
              </span>
            </div>
            <div
              className={`flex justify-between ${
                theme === "dark" ? "text-green-400" : "text-green-600"
              }`}
            >
              <span>Service Fee (You Earn):</span>
              <span className="font-medium">
                {formattedCurrency(serviceFee)}
              </span>
            </div>
            <div
              className={`flex justify-between ${
                theme === "dark" ? "text-green-400" : "text-green-600"
              }`}
            >
              <span>Delivery Fee (You Earn):</span>
              <span className="font-medium">
                {formattedCurrency(deliveryFee)}
              </span>
            </div>
            <Divider className={theme === "dark" ? "border-gray-700" : ""} />
            <div
              className={`flex justify-between font-bold ${
                theme === "dark" ? "text-gray-100" : ""
              }`}
            >
              <span>Total Earnings:</span>
              <span className={theme === "dark" ? "text-green-400" : ""}>
                {formattedCurrency(serviceFee + deliveryFee)}
              </span>
            </div>
          </div>

          <Message
            type="warning"
            className={`mb-3 ${
              theme === "dark" ? "bg-yellow-900/20 text-yellow-300" : ""
            }`}
          >
            After clicking &quot;Proceed&quot;, you&apos;ll receive an OTP in a
            popup alert. You&apos;ll need to enter this OTP to complete the
            payment process.
          </Message>
        </Form>
      </Modal.Body>
      <Modal.Footer
        className={
          theme === "dark" ? "border-t border-gray-700 bg-gray-800" : ""
        }
      >
        <Button
          appearance="primary"
          color="green"
          onClick={onSubmit}
          loading={paymentLoading}
          disabled={!momoCode}
          className={theme === "dark" ? "bg-green-600 hover:bg-green-700" : ""}
        >
          Proceed
        </Button>
        <Button
          onClick={onClose}
          appearance="subtle"
          className={theme === "dark" ? "text-gray-300 hover:bg-gray-700" : ""}
        >
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PaymentModal;
