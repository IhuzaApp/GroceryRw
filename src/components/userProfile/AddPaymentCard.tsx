import React, { useState, useCallback, useRef } from "react";
import Webcam from "react-webcam";
import CryptoJS from "crypto-js";
import { toast } from "react-hot-toast";

// Encryption key - in production, this should be in environment variables
const ENCRYPTION_KEY =
  process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "your-secret-key";

type AddPaymentCardProps = {
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
  existingCard?: {
    id: string;
    name: string;
    number: string;
    expiry_date: string;
    image: string | null;
  };
};

const AddPaymentCard: React.FC<AddPaymentCardProps> = ({
  userId,
  onClose,
  onSuccess,
  existingCard,
}) => {
  // Encrypt sensitive data
  const encryptData = (text: string) => {
    return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
  };

  // Decrypt sensitive data
  const decryptData = (encryptedText: string) => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error("Decryption error:", error);
      return "";
    }
  };

  const [cardForm, setCardForm] = useState({
    cardNumber: existingCard ? decryptData(existingCard.number) : "",
    cardHolder: existingCard ? existingCard.name : "",
    expiryDate: existingCard ? existingCard.expiry_date : "",
    cvv: "",
  });
  const [showCamera, setShowCamera] = useState(false);
  const [cardImage, setCardImage] = useState<string | null>(
    existingCard?.image || null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const webcamRef = useRef<Webcam | null>(null);

  // Handle card image capture
  const handleCapture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCardImage(imageSrc);
      setShowCamera(false);
    }
  }, [webcamRef]);

  // Validate card details
  const validateForm = () => {
    if (!/^\d{16}$/.test(cardForm.cardNumber.replace(/\s/g, ""))) {
      setError("Invalid card number");
      return false;
    }
    if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(cardForm.expiryDate)) {
      setError("Invalid expiry date (MM/YY)");
      return false;
    }
    if (!/^\d{3,4}$/.test(cardForm.cvv)) {
      setError("Invalid CVV");
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    const toastId = toast.loading(
      existingCard ? "Updating card..." : "Adding card..."
    );

    try {
      // Encrypt sensitive data
      const encryptedNumber = encryptData(cardForm.cardNumber);
      const encryptedCVV = encryptData(cardForm.cvv);

      const endpoint = existingCard
        ? "/api/mutations/update-payment-card"
        : "/api/mutations/add-payment-card";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          variables: {
            user_id: userId,
            ...(existingCard && { card_id: existingCard.id }),
            number: encryptedNumber,
            name: cardForm.cardHolder,
            expiry_date: cardForm.expiryDate,
            cvv: encryptedCVV,
            image: cardImage,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process card");
      }

      toast.success(
        existingCard
          ? "Card updated successfully!"
          : "Card added successfully!",
        { id: toastId }
      );
      onSuccess();
      onClose();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      console.error("Error processing card:", err);
      setError(errorMessage);
      toast.error(errorMessage, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">
            {existingCard ? "Update Payment Card" : "Add Payment Card"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {showCamera ? (
          <div className="mb-4">
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="rounded-lg"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCamera(false)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCapture}
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 dark:!bg-green-600 dark:!text-white dark:hover:!bg-green-700"
              >
                Capture
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Card Number
              </label>
              <input
                type="text"
                value={cardForm.cardNumber}
                onChange={(e) =>
                  setCardForm({
                    ...cardForm,
                    cardNumber: e.target.value
                      .replace(/\D/g, "")
                      .replace(/(\d{4})/g, "$1 ")
                      .trim(),
                  })
                }
                className="w-full rounded-md border border-gray-300 p-2 focus:border-green-500 focus:outline-none"
                placeholder="1234 5678 9012 3456"
                maxLength={19}
              />
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Card Holder Name
              </label>
              <input
                type="text"
                value={cardForm.cardHolder}
                onChange={(e) =>
                  setCardForm({ ...cardForm, cardHolder: e.target.value })
                }
                className="w-full rounded-md border border-gray-300 p-2 focus:border-green-500 focus:outline-none"
                placeholder="John Doe"
              />
            </div>

            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Expiry Date
                </label>
                <input
                  type="text"
                  value={cardForm.expiryDate}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 4) {
                      const month = value.slice(0, 2);
                      const year = value.slice(2);
                      setCardForm({
                        ...cardForm,
                        expiryDate:
                          value.length > 2 ? `${month}/${year}` : month,
                      });
                    }
                  }}
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-green-500 focus:outline-none"
                  placeholder="MM/YY"
                  maxLength={5}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  CVV
                </label>
                <input
                  type="password"
                  value={cardForm.cvv}
                  onChange={(e) =>
                    setCardForm({
                      ...cardForm,
                      cvv: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-green-500 focus:outline-none"
                  placeholder="123"
                  maxLength={4}
                />
              </div>
            </div>

            <div className="mb-4">
              <button
                type="button"
                onClick={() => setShowCamera(true)}
                className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Take Card Photo
              </button>
              {cardImage && (
                <div className="mt-2">
                  <img
                    src={cardImage}
                    alt="Card"
                    className="h-40 w-64 rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setCardImage(null)}
                    className="mt-2 text-sm text-red-600 hover:text-red-700"
                  >
                    Remove photo
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 dark:!bg-green-600 dark:!text-white dark:hover:!bg-green-700"
              >
                {loading
                  ? existingCard
                    ? "Updating..."
                    : "Adding..."
                  : existingCard
                  ? "Update Card"
                  : "Add Card"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddPaymentCard;
