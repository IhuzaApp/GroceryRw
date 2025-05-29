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
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">Payment Methods</h3>
          <Button
            appearance="primary"
            color="green"
            onClick={handleAdd}
            size="sm"
          >
            Add Payment Method
          </Button>
        </div>
        <div className="space-y-4">
          {paymentMethods.map((pm) => (
            <Panel bordered className="relative" key={pm.id}>
              {pm.is_default && (
                <Tag className="absolute right-2 top-2 border-green-200 bg-green-100 text-green-600">
                  Default
                </Tag>
              )}
              <div className="flex items-center">
                <div
                  className={`mr-3 flex h-8 w-12 items-center justify-center rounded ${getMethodBg(
                    pm.method
                  )}`}
                >
                  {pm.method}
                </div>
                <div>
                  <h4 className="font-bold">
                    {`${pm.method} ending in ${pm.number.slice(-4)}`}
                  </h4>
                  <p className="text-sm text-gray-600">Expires {pm.validity}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button appearance="ghost" size="sm">
                  Edit
                </Button>
                <Button appearance="ghost" color="red" size="sm">
                  Delete
                </Button>
                {!pm.is_default && (
                  <Button
                    appearance="ghost"
                    color="green"
                    size="sm"
                    onClick={() => handleSetDefault(pm.id)}
                  >
                    Set as Default
                  </Button>
                )}
              </div>
            </Panel>
          ))}
        </div>
      </div>

      {/* Payment Cards Section */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">Payment Cards</h3>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {paymentCards.map((card) => (
            <div
              key={card.id}
              className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-500 to-green-700 p-5 text-white shadow-lg transition-shadow duration-200 hover:shadow-xl"
            >
              <div className="absolute right-0 top-0 -mr-10 -mt-10 h-20 w-20 rounded-full bg-white opacity-5"></div>
              <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-16 w-16 rounded-full bg-white opacity-5"></div>

              <div className="mb-8 flex items-start justify-between">
                <div>
                  <p className="mb-1 text-xs opacity-80">Payment Card</p>
                  <h4 className="font-bold">{card.name}</h4>
                </div>
                {card.image ? (
                  <img
                    src={card.image}
                    alt="Card"
                    className="h-10 w-10 rounded-full border-2 border-white object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-400">
                    <svg
                      className="h-6 w-6 text-white"
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
              </div>

              <div className="mb-6">
                <div className="mb-1 flex items-center">
                  <div className="mr-2">
                    <img
                      className="h-12 w-12"
                      src="/assets/images/chip.png"
                      alt="Chip"
                    />
                  </div>
                  <p className="font-mono text-xl tracking-widest">
                    {formatCardNumber(card.number)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-xs opacity-80">Card Holder</p>
                  <p className="font-medium uppercase">{card.name}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs opacity-80">Expires</p>
                  <p className="font-medium">{card.expiry_date}</p>
                </div>
                <div className="flex flex-col items-end">
                  <p className="mb-1 text-xs opacity-80">Type</p>
                  <div className="flex items-center space-x-1">
                    {card.number.startsWith("4") ? (
                      <img
                        src="/assets/images/visa.png"
                        alt="Visa"
                        className="h-8"
                      />
                    ) : card.number.startsWith("5") ? (
                      <img
                        src="/assets/images/mastercard.png"
                        alt="Mastercard"
                        className="h-8"
                      />
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-8 w-8 opacity-80"
                      >
                        <rect x="2" y="5" width="20" height="14" rx="2" />
                        <path d="M2 10h20" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>

              <div className="absolute bottom-3 right-3">
                <p className="text-xs font-bold opacity-70">
                  {new Date(card.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
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
          <Button onClick={handleSave} appearance="primary" color="green">
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
