import React from "react";
import { Modal, Button } from "rsuite";
import Image from "next/image";
import { formatCurrency } from "../../lib/formatCurrency";
import { OrderItem } from "../../types/order";

interface ProductImageModalProps {
  open: boolean;
  onClose: () => void;
  selectedImage: string | null;
  selectedProductName: string | null;
  currentOrderItem: OrderItem | null;
}

function safePrice(item: OrderItem | null): number {
  if (!item) return 0;
  const fromFinal = Number((item.product as any)?.final_price);
  const fromItem = Number(item.price);
  const value = Number.isFinite(fromFinal) ? fromFinal : Number.isFinite(fromItem) ? fromItem : 0;
  return Number.isFinite(value) ? value : 0;
}

export default function ProductImageModal({
  open,
  onClose,
  selectedImage,
  selectedProductName,
  currentOrderItem,
}: ProductImageModalProps) {
  const product = currentOrderItem?.product as any;
  const selectedDetails = product?.selectedDetails;
  const isBusinessOrder =
    selectedDetails &&
    typeof selectedDetails === "object" &&
    Object.keys(selectedDetails).length > 0;

  return (
    <Modal open={open} onClose={onClose} size="md">
      <Modal.Header className="border-b bg-gray-100">
        <Modal.Title className="text-xl font-semibold text-gray-800">
          {selectedProductName}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {selectedImage && currentOrderItem && (
          <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
            {/* Left: Product Image */}
            <div className="flex justify-center">
              <Image
                src={selectedImage}
                alt={selectedProductName || "Product"}
                width={300}
                height={300}
                className="max-h-[300px] rounded-lg object-contain shadow-md"
              />
            </div>

            {/* Right: Product Details */}
            <div className="space-y-4 text-left">
              <h3 className="text-lg font-bold text-gray-800">
                {currentOrderItem.product.ProductName?.name ||
                  product?.name ||
                  "Unknown Product"}
              </h3>

              {isBusinessOrder ? (
                /* Business order: only selected details (size, color, etc.), unit, quantity, price */
                <div className="space-y-3 border-t pt-4">
                  {Object.entries(selectedDetails).map(([key, value]) => (
                    <div key={key}>
                      <span className="text-sm font-medium capitalize text-gray-600">
                        {key.replace(/_/g, " ")}:{" "}
                      </span>
                      <span className="text-sm text-gray-800">{String(value)}</span>
                    </div>
                  ))}
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Unit:{" "}
                    </span>
                    <span className="text-sm text-gray-800">
                      {product?.measurement_type ||
                        product?.measurement_unit ||
                        "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Quantity:{" "}
                    </span>
                    <span className="text-sm text-gray-800">
                      {currentOrderItem.quantity}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Price:{" "}
                    </span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(safePrice(currentOrderItem))}
                    </span>
                  </div>
                </div>
              ) : (
                /* Regular order: description, category, unit, price */
                <>
                  <div>
                    <h4 className="text-sm font-medium text-gray-600">
                      Description
                    </h4>
                    <p className="text-sm text-gray-700">
                      {currentOrderItem.product.description || "—"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-t pt-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-600">
                        Category
                      </h4>
                      <p className="text-sm text-gray-700">
                        {currentOrderItem.product.category || "—"}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-600">
                        Unit
                      </h4>
                      <p className="text-sm text-gray-700">
                        {currentOrderItem.product.measurement_unit || "—"}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <h4 className="text-sm font-medium text-gray-600">
                        Price
                      </h4>
                      <p className="font-bold text-green-600">
                        {formatCurrency(safePrice(currentOrderItem))}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onClose} appearance="primary">
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
