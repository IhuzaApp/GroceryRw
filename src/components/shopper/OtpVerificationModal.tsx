import React from "react";
import {
  Modal,
  Button,
  Form,
  Message,
} from "rsuite";

interface OtpVerificationModalProps {
  open: boolean;
  onClose: () => void;
  onVerify: () => void;
  otp: string;
  setOtp: (value: string) => void;
  loading: boolean;
}

const OtpVerificationModal: React.FC<OtpVerificationModalProps> = ({
  open,
  onClose,
  onVerify,
  otp,
  setOtp,
  loading,
}) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Modal.Header>
        <Modal.Title>Enter OTP</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form fluid>
          <Form.Group>
            <Form.ControlLabel>One-Time Password (OTP)</Form.ControlLabel>
            <Form.Control
              name="otp"
              value={otp}
              onChange={value => setOtp(value)}
            />
            <Form.HelpText>
              Please enter the 5-digit OTP shown in the alert popup.
            </Form.HelpText>
          </Form.Group>
          
          <Message type="info" className="mb-3">
            <p><strong>IMPORTANT:</strong> An alert popup should have displayed the OTP. If you missed it, refresh the page and try again.</p>
            <p>In a production environment, this OTP would be sent to your phone number or email.</p>
          </Message>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button 
          onClick={onVerify} 
          appearance="primary" 
          color="green"
          loading={loading}
        >
          Verify OTP
        </Button>
        <Button onClick={onClose} appearance="subtle">
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default OtpVerificationModal; 