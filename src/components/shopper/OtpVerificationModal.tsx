import React from "react";
import { Modal, Button, Form, Message } from "rsuite";

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
    <Modal open={open} onClose={onClose} size="xs">
      <Modal.Header>
        <Modal.Title className="text-xl font-bold">
          Secure Verification
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="space-y-6 py-2">
          <div className="text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <svg
                className="h-8 w-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0112 20c4.478 0 8.268-2.943 9.542-7m-1.274-4.057A10.034 10.034 0 0122 12c0 1.268-.236 2.483-.667 3.601M22 12c0-4.478-2.943-8.268-7-9.542m-4.057 1.274A10.034 10.034 0 0112 2c-1.268 0-2.483.236-3.601.667m0 4.018A10.033 10.033 0 0112 6c1.268 0 2.483.236 3.601.667m-7.202 12.133l-.067.044m4.577-13.633l-.067.044M3 20c.535-1.1 1.058-2.11 1.62-3.033"
                />
              </svg>
            </div>
            <h4 className="mt-4 text-lg font-semibold">Verify Your Identity</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              We've sent a 5-digit code to your registered phone number via SMS.
            </p>
          </div>

          <div className="flex justify-center gap-3">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className={`flex h-12 w-10 items-center justify-center rounded-lg border-2 text-xl font-bold transition-all duration-200 ${
                  otp.length === index
                    ? "border-green-500 ring-2 ring-green-500/20"
                    : otp.length > index
                    ? "border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                {otp[index] || ""}
              </div>
            ))}
            <input
              autoFocus
              className="absolute inset-0 z-10 h-full w-full cursor-default opacity-0"
              maxLength={5}
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 5))
              }
            />
          </div>

          <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20">
            <div className="flex gap-3">
              <svg
                className="h-5 w-5 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-xs text-blue-800 dark:text-blue-300">
                <p className="font-semibold">Didn't receive the code?</p>
                <p className="mt-1">
                  Check your network connection or try requesting a new code
                  after 60 seconds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="flex justify-center gap-2 border-t pt-4">
        <Button
          onClick={onVerify}
          appearance="primary"
          color="green"
          loading={loading}
          disabled={otp.length !== 5}
          className="w-full rounded-xl py-2.5 font-bold"
        >
          Verify & Proceed
        </Button>
        <Button
          onClick={onClose}
          appearance="subtle"
          className="w-full rounded-xl py-2.5"
        >
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default OtpVerificationModal;
