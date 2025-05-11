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
  const formattedCurrency = (amount: number) => {
    return `RWF ${amount.toLocaleString()}`;
  };

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <Modal.Header>
        <Modal.Title>Process Payment</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Message type="info" className="mb-4">
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
            <Form.ControlLabel>MoMo Code</Form.ControlLabel>
            <Form.Control
              name="momoCode"
              value={momoCode}
              onChange={(value) => setMomoCode(value)}
              placeholder="Enter your MoMo code"
            />
          </Form.Group>

          <Form.Group>
            <Form.ControlLabel>Private Key (Auto-generated)</Form.ControlLabel>
            <InputGroup>
              <Input value={privateKey} disabled />
            </InputGroup>
            <Form.HelpText>
              This is a one-time key for this transaction. Keep it for your
              records.
            </Form.HelpText>
          </Form.Group>

          <Divider />

          <div className="mb-4">
            <h4 className="mb-2 font-medium">Payment Summary</h4>
            <div className="flex justify-between">
              <span>Value of Found Items:</span>
              <span className="font-medium">
                {formattedCurrency(orderAmount)}
              </span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Service Fee (You Earn):</span>
              <span className="font-medium">
                {formattedCurrency(serviceFee)}
              </span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Delivery Fee (You Earn):</span>
              <span className="font-medium">
                {formattedCurrency(deliveryFee)}
              </span>
            </div>
            <Divider />
            <div className="flex justify-between font-bold">
              <span>Total Earnings:</span>
              <span>{formattedCurrency(serviceFee + deliveryFee)}</span>
            </div>
          </div>

          <Message type="warning" className="mb-3">
            After clicking &quot;Proceed&quot;, you&apos;ll receive an OTP in a
            popup alert. You&apos;ll need to enter this OTP to complete the
            payment process.
          </Message>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          appearance="primary"
          color="green"
          onClick={onSubmit}
          loading={paymentLoading}
          disabled={!momoCode}
        >
          Proceed
        </Button>
        <Button onClick={onClose} appearance="subtle">
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PaymentModal;
