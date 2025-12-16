import React, { useState, useEffect } from "react";
import {
  Panel,
  Tag,
  Button,
  Modal,
  Form,
  Checkbox,
  SelectPicker,
} from "rsuite";
import toast from "react-hot-toast";
import CryptoJS from "crypto-js";

// Encryption key - in production, this should be in environment variables
const ENCRYPTION_KEY =
  process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "your-secret-key";

// Helper to map methods to background colors
const getMethodBg = (method: string) => {
  switch (method.toLowerCase()) {
    case "visa":
      return "bg-blue-600";
    case "mastercard":
    case "mc":
      return "bg-orange-500";
    case "mtn momo":
      return "bg-yellow-500 text-black";
    default:
      return "bg-gray-500";
  }
};

// Format card number to show only last 4 digits
const formatCardNumber = (encryptedNumber: string) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedNumber, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    const lastFour = decrypted.slice(-4);
    return `**** **** **** ${lastFour}`;
  } catch (error) {
    return "**** **** **** ****";
  }
};

interface PaymentMethod {
  id: string;
  user_id: string;
  method: string;
  names: string;
  number: string;
  CCV: string;
  validity: string;
  is_default: boolean;
}

interface PaymentCard {
  id: string;
  number: string;
  name: string;
  expiry_date: string;
  image: string | null;
  created_at: string;
}

export default function UserPayment() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentCards, setPaymentCards] = useState<PaymentCard[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formValue, setFormValue] = useState<any>({
    method: "",
    names: "",
    number: "",
    CCV: "",
    validity: "",
    is_default: false,
  });

  const fetchPaymentMethods = async () => {
    try {
      const res = await fetch("/api/queries/payment-methods");
      const { paymentMethods } = await res.json();
      console.log("Fetched payment methods:", paymentMethods);
      setPaymentMethods(paymentMethods);
    } catch (err) {
      console.error("Error loading payment methods:", err);
    }
  };

  const fetchPaymentCards = async () => {
    try {
      const res = await fetch("/api/queries/payment-cards");
      const data = await res.json();
      setPaymentCards(data.paymentCards || []);
    } catch (err) {
      console.error("Error loading payment cards:", err);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
    fetchPaymentCards();
  }, []);

  const handleAdd = () => {
    setFormValue({
      method: "",
      names: "",
      number: "",
      CCV: "",
      validity: "",
      is_default: false,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    const { method, names, number, CCV, validity, is_default } = formValue;
    const isMomo = method === "MTN Momo";
    if (!method || !names || !number || (!isMomo && (!CCV || !validity))) {
      toast.error("Please fill out all required fields");
      return;
    }
    try {
      const res = await fetch("/api/queries/payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValue),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(
          errorData?.error || `Request failed with status ${res.status}`
        );
      }
      const { paymentMethod } = await res.json();
      setShowModal(false);
      fetchPaymentMethods();
      toast.success("Payment method added!");
    } catch (err) {
      console.error("Error saving payment method:", err);
      toast.error("Failed to save payment method");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch("/api/queries/payment-methods", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_default: true }),
      });
      const data = await res.json().catch(() => null);
      console.log("PUT /api/queries/payment-methods", res.status, data);
      if (!res.ok) {
        throw new Error(
          data?.error || `Request failed with status ${res.status}`
        );
      }
      toast.success("Default payment method updated!");
      fetchPaymentMethods();
    } catch (err: any) {
      console.error("Error updating default method:", err);
      toast.error(err.message || "Failed to update default payment method");
    }
  };

  return (
    <>
      {/* Payment Methods Section */}
      <div className="mb-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Payment Methods
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage your payment methods
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="inline-flex items-center rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-2.5 text-sm font-semibold !text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 active:scale-95"
          >
            <svg
              className="mr-2 h-5 w-5 !text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Payment Method
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {paymentMethods.map((pm) => (
            <div
              key={pm.id}
              className={`group relative overflow-hidden rounded-xl border-2 p-5 shadow-md transition-all duration-300 hover:shadow-xl ${
                pm.is_default
                  ? "border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-600"
                  : "border-gray-200 bg-white hover:border-green-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-green-600"
              }`}
            >
              {/* Default Badge */}
              {pm.is_default && (
                <div className="absolute right-3 top-3">
                  <span className="inline-flex items-center rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-1 text-xs font-semibold !text-white shadow-lg">
                    <svg
                      className="mr-1 h-3 w-3 !text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="!text-white">Default</span>
                  </span>
                </div>
              )}

              {/* Payment Method Icon */}
              <div
                className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl text-sm font-bold !text-white shadow-lg transition-transform duration-300 group-hover:scale-110 ${getMethodBg(
                  pm.method
                )}`}
              >
                {pm.method === "Visa" ? (
                  <span className="text-lg">VISA</span>
                ) : pm.method === "Mastercard" || pm.method === "MC" ? (
                  <span className="text-lg">MC</span>
                ) : (
                  <span className="text-xs">MTN</span>
                )}
              </div>

              {/* Card Details */}
              <div className="mb-4">
                <h4 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                  {pm.method}
                </h4>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Ending in {pm.number.slice(-4)}
                  </p>
                  {pm.validity && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Expires {pm.validity}
                    </p>
                  )}
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {pm.names}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                {!pm.is_default && (
                  <button
                    className="group flex flex-1 items-center justify-center rounded-xl border-2 border-green-500 bg-white px-4 py-2.5 text-xs font-semibold text-green-600 shadow-sm transition-all duration-200 hover:scale-105 hover:border-green-600 hover:bg-gradient-to-r hover:from-green-500 hover:to-emerald-600 hover:shadow-md hover:!text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 dark:border-green-400 dark:bg-gray-800 dark:text-green-400 dark:hover:border-green-500 dark:hover:from-green-600 dark:hover:to-emerald-600 dark:hover:!text-white"
                    onClick={() => handleSetDefault(pm.id)}
                  >
                    <svg
                      className="mr-2 h-4 w-4 transition-colors group-hover:!text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="transition-colors group-hover:!text-white">
                      Set Default
                    </span>
                  </button>
                )}
                <button
                  className="group flex flex-1 items-center justify-center rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:scale-105 hover:border-gray-400 hover:bg-gray-50 hover:shadow-md active:scale-95 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-700"
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit
                </button>
                <button
                  className="group flex flex-1 items-center justify-center rounded-xl border-2 border-red-300 bg-white px-4 py-2.5 text-xs font-semibold text-red-600 shadow-sm transition-all duration-200 hover:scale-105 hover:border-red-500 hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 hover:shadow-md hover:!text-white active:scale-95 dark:border-red-600 dark:bg-gray-800 dark:text-red-400 dark:hover:border-red-500 dark:hover:from-red-600 dark:hover:to-red-700 dark:hover:!text-white"
                >
                  <svg
                    className="mr-2 h-4 w-4 transition-colors group-hover:!text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  <span className="transition-colors group-hover:!text-white">
                    Delete
                  </span>
                </button>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-green-200/30 to-emerald-200/30 blur-xl dark:from-green-800/20 dark:to-emerald-800/20" />
              <div className="absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-gradient-to-br from-blue-200/30 to-cyan-200/30 blur-xl dark:from-blue-800/20 dark:to-cyan-800/20" />
            </div>
          ))}
        </div>
        {paymentMethods.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            <p className="mt-4 text-lg font-semibold text-gray-600 dark:text-gray-400">
              No payment methods
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
              Add your first payment method to get started
            </p>
          </div>
        )}
      </div>

      {/* Payment Cards Section */}
      <div className="mb-8">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Payment Cards
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Your saved payment cards
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {paymentCards.map((card) => {
            const isVisa = card.number.startsWith("4");
            const isMastercard = card.number.startsWith("5");
            return (
              <div
                key={card.id}
                className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-5 shadow-md transition-all duration-300 hover:border-green-300 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800 dark:hover:border-green-600"
              >
                {/* Card Type Badge */}
                <div className="absolute right-3 top-3">
                  <div
                    className={`flex h-8 w-12 items-center justify-center rounded-lg text-xs font-bold !text-white shadow-lg ${
                      isVisa
                        ? "bg-gradient-to-br from-blue-600 to-blue-700"
                        : isMastercard
                        ? "bg-gradient-to-br from-orange-500 to-red-600"
                        : "bg-gradient-to-br from-gray-500 to-gray-600"
                    }`}
                  >
                    {isVisa ? "VISA" : isMastercard ? "MC" : "CARD"}
                  </div>
                </div>

                {/* Card Image or Icon */}
                {card.image ? (
                  <div className="mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border-2 border-gray-200 shadow-md dark:border-gray-700">
                    <img
                      src={card.image}
                      alt="Card"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-gray-400 to-gray-500 shadow-lg">
                    <svg
                      className="h-8 w-8 !text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                  </div>
                )}

                {/* Card Details */}
                <div className="mb-4">
                  <h4 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                    {card.name}
                  </h4>
                  <div className="space-y-1">
                    <p className="font-mono text-sm text-gray-600 dark:text-gray-300">
                      {formatCardNumber(card.number)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Expires {card.expiry_date}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <button
                    className="group flex flex-1 items-center justify-center rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:scale-105 hover:border-gray-400 hover:bg-gray-50 hover:shadow-md active:scale-95 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-700"
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit
                  </button>
                  <button
                    className="group flex flex-1 items-center justify-center rounded-xl border-2 border-red-300 bg-white px-4 py-2.5 text-xs font-semibold text-red-600 shadow-sm transition-all duration-200 hover:scale-105 hover:border-red-500 hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 hover:shadow-md hover:!text-white active:scale-95 dark:border-red-600 dark:bg-gray-800 dark:text-red-400 dark:hover:border-red-500 dark:hover:from-red-600 dark:hover:to-red-700 dark:hover:!text-white"
                  >
                    <svg
                      className="mr-2 h-4 w-4 transition-colors group-hover:!text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    <span className="transition-colors group-hover:!text-white">
                      Delete
                    </span>
                  </button>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-green-200/30 to-emerald-200/30 blur-xl dark:from-green-800/20 dark:to-emerald-800/20" />
                <div className="absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-gradient-to-br from-blue-200/30 to-cyan-200/30 blur-xl dark:from-blue-800/20 dark:to-cyan-800/20" />
              </div>
            );
          })}
        </div>
        {paymentCards.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            <p className="mt-4 text-lg font-semibold text-gray-600 dark:text-gray-400">
              No payment cards
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
              Add your first payment card to get started
            </p>
          </div>
        )}
      </div>

      {/* Add Payment Method Modal */}
      <Modal size="sm" open={showModal} onClose={() => setShowModal(false)}>
        <Modal.Header>
          <Modal.Title>Add Payment Method</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form fluid formValue={formValue} onChange={setFormValue}>
            <Form.Group>
              <Form.ControlLabel>Method</Form.ControlLabel>
              <select
                name="method"
                value={formValue.method}
                onChange={(e) =>
                  setFormValue({ ...formValue, method: e.target.value })
                }
                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
              >
                <option value="">Select Payment Method</option>
                <option value="Visa">Visa</option>
                <option value="Mastercard">Mastercard</option>
                <option value="MTN Momo">MTN Momo</option>
              </select>
            </Form.Group>
            <Form.Group>
              <Form.ControlLabel>
                {formValue.method === "MTN Momo"
                  ? "Name on the number"
                  : "Name on Card"}
              </Form.ControlLabel>
              <Form.Control name="names" />
            </Form.Group>
            <Form.Group>
              <Form.ControlLabel>Number</Form.ControlLabel>
              <Form.Control name="number" />
            </Form.Group>
            {formValue.method !== "MTN Momo" && (
              <>
                <Form.Group>
                  <Form.ControlLabel>CCV</Form.ControlLabel>
                  <Form.Control name="CCV" />
                </Form.Group>
                <Form.Group>
                  <Form.ControlLabel>Validity (MM/YYYY)</Form.ControlLabel>
                  <Form.Control name="validity" />
                </Form.Group>
              </>
            )}
            <Form.Group>
              <Form.ControlLabel>Set as Default</Form.ControlLabel>
              <Form.Control name="is_default" accepter={Checkbox} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setShowModal(false)} appearance="subtle">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            appearance="primary"
            color="green"
            className="dark:!bg-green-600 dark:!text-white dark:hover:!bg-green-700"
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
