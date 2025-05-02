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

export default function UserPayment() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
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

  useEffect(() => {
    fetchPaymentMethods();
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
          <Button appearance="primary" color="green" onClick={handleSave}>
            Save
          </Button>
          <Button onClick={() => setShowModal(false)} appearance="subtle">
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
