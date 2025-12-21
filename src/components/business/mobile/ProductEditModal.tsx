"use client";

import { useState, useRef } from "react";
import {
  X,
  Package,
  Image as ImageIcon,
  CheckCircle,
  Camera,
  Upload,
} from "lucide-react";
import toast from "react-hot-toast";
import CameraCapture from "../../ui/CameraCapture";

interface ProductEditModalProps {
  product?: any; // If provided, we're editing. If not, we're adding.
  storeId: string;
  onClose: () => void;
  onSave: () => void; // Callback to refresh data in parent
}

export function ProductEditModal({
  product,
  storeId,
  onClose,
  onSave,
}: ProductEditModalProps) {
  const isEditing = !!product;
  const [savingProduct, setSavingProduct] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [productForm, setProductForm] = useState({
    name: product?.name || "",
    description: product?.Description || product?.description || "",
    price: product?.price || "",
    unit: product?.unit || "",
    minimumOrders: product?.minimumOrders || "0",
    maxOrders: product?.maxOrders || "",
    deliveryArea: product?.delveryArea || product?.deliveryArea || "",
    image: product?.Image || product?.image || "",
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setProductForm({ ...productForm, image: base64String });
    };
    reader.onerror = () => {
      toast.error("Failed to read image file");
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = (imageDataUrl: string) => {
    setProductForm({ ...productForm, image: imageDataUrl });
    setShowCamera(false);
  };

  const handleSave = async () => {
    if (!productForm.name.trim()) {
      toast.error("Product name is required");
      return;
    }

    if (!productForm.price.trim()) {
      toast.error("Product price is required");
      return;
    }

    if (!productForm.unit.trim()) {
      toast.error("Product unit is required");
      return;
    }

    setSavingProduct(true);

    try {
      if (isEditing) {
        // Update existing product
        const response = await fetch("/api/mutations/update-business-product", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            product_id: product.id,
            name: productForm.name,
            description: productForm.description,
            image: productForm.image,
            price: productForm.price,
            unit: productForm.unit,
            status: product.status || "active",
            minimumOrders: productForm.minimumOrders || "0",
            maxOrders: productForm.maxOrders || "",
            delveryArea: productForm.deliveryArea || "",
            store_id: storeId,
          }),
        });

        if (response.ok) {
          toast.success("Product updated successfully");
          onSave();
          onClose();
        } else {
          const error = await response.json();
          toast.error(error.error || "Failed to update product");
        }
      } else {
        // Create new product - would need query_id generation
        toast.error("Adding new products requires verification ID. Please use the desktop version.");
        // For now, we'll just show an error
        // In the future, we could add query_id generation here
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product");
    } finally {
      setSavingProduct(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm flex flex-col"
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
      }}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-t-3xl mt-[5vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ height: "calc(100vh - 5vh)", marginBottom: 0 }}
      >
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 px-5 py-4 flex items-center justify-between rounded-t-3xl border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
              <Package className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {isEditing ? "Edit Product" : "Add Product"}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {isEditing ? "Update product details" : "Create a new product"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors active:scale-95"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 pb-24">
          <div className="space-y-4 max-w-2xl mx-auto">
            {/* Product Image Preview */}
            {productForm.image && (
              <div className="w-full h-48 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center border-2 border-gray-200 dark:border-gray-600">
                <img
                  src={productForm.image}
                  alt="Product"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling?.classList.remove("hidden");
                  }}
                />
                <ImageIcon className="h-12 w-12 text-gray-400 hidden" />
              </div>
            )}

            {/* Product Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={productForm.name}
                onChange={(e) =>
                  setProductForm({ ...productForm, name: e.target.value })
                }
                className="w-full rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter product name"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={productForm.description}
                onChange={(e) =>
                  setProductForm({ ...productForm, description: e.target.value })
                }
                rows={4}
                className="w-full rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter product description"
              />
            </div>

            {/* Price and Unit */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Price *
                </label>
                <input
                  type="text"
                  value={productForm.price}
                  onChange={(e) =>
                    setProductForm({ ...productForm, price: e.target.value })
                  }
                  className="w-full rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Unit *
                </label>
                <input
                  type="text"
                  value={productForm.unit}
                  onChange={(e) =>
                    setProductForm({ ...productForm, unit: e.target.value })
                  }
                  className="w-full rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="kg, piece, etc"
                />
              </div>
            </div>

            {/* Minimum Orders */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Minimum Orders
              </label>
              <input
                type="text"
                value={productForm.minimumOrders}
                onChange={(e) =>
                  setProductForm({ ...productForm, minimumOrders: e.target.value })
                }
                className="w-full rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="0"
              />
            </div>

            {/* Max Orders */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Maximum Orders
              </label>
              <input
                type="text"
                value={productForm.maxOrders}
                onChange={(e) =>
                  setProductForm({ ...productForm, maxOrders: e.target.value })
                }
                className="w-full rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Optional"
              />
            </div>

            {/* Delivery Area */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Delivery Area
              </label>
              <input
                type="text"
                value={productForm.deliveryArea}
                onChange={(e) =>
                  setProductForm({ ...productForm, deliveryArea: e.target.value })
                }
                className="w-full rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter delivery area"
              />
            </div>

            {/* Image Upload/Capture */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Product Image
              </label>
              
              {/* Image Preview */}
              {productForm.image && (
                <div className="mb-3 w-full h-48 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center border-2 border-gray-200 dark:border-gray-600">
                  <img
                    src={productForm.image}
                    alt="Product"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.nextElementSibling?.classList.remove("hidden");
                    }}
                  />
                  <ImageIcon className="h-12 w-12 text-gray-400 hidden" />
                </div>
              )}

              {/* Upload/Capture Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 transition-all active:scale-95"
                >
                  <Upload className="h-5 w-5" />
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => setShowCamera(true)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 transition-all active:scale-95"
                >
                  <Camera className="h-5 w-5" />
                  Camera
                </button>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

          </div>
        </div>

        {/* Fixed Action Buttons Footer */}
        <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="flex gap-3 max-w-2xl mx-auto">
            <button
              onClick={onClose}
              disabled={savingProduct}
              className="flex-1 px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={savingProduct}
              className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {savingProduct ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  {isEditing ? "Save Changes" : "Create Product"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Camera Capture Modal */}
      <CameraCapture
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handleCameraCapture}
        cameraType="environment"
        title="Capture Product Image"
      />
    </div>
  );
}
