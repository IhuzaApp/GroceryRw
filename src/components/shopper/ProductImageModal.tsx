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

export default function ProductImageModal({
  open,
  onClose,
  selectedImage,
  selectedProductName,
  currentOrderItem,
}: ProductImageModalProps) {
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
              {/* Product Name */}
              <h3 className="text-lg font-bold text-gray-800">
                {currentOrderItem.product.name}
              </h3>

              {/* Description */}
              <div>
                <h4 className="text-sm font-medium text-gray-600">
                  Description
                </h4>
                <p className="text-sm text-gray-700">
                  {currentOrderItem.product.description ||
                    "No description available for this product."}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                {/* Category */}
                <div>
                  <h4 className="text-sm font-medium text-gray-600">
                    Category
                  </h4>
                  <p className="text-sm text-gray-700">
                    {currentOrderItem.product.category || "General"}
                  </p>
                </div>

                {/* Measurement Unit */}
                <div>
                  <h4 className="text-sm font-medium text-gray-600">Unit</h4>
                  <p className="text-sm text-gray-700">
                    {currentOrderItem.product.measurement_unit || "Each"}
                  </p>
                </div>

                {/* Price */}
                <div className="col-span-2">
                  <h4 className="text-sm font-medium text-gray-600">Price</h4>
                  <p className="font-bold text-green-600">
                    {formatCurrency(currentOrderItem.product.price)}
                  </p>
                </div>
              </div>
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
