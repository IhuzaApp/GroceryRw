"use client";

import { useState } from "react";
import {
  X,
  Plus,
  DollarSign,
  MapPin,
  FileText,
  Upload,
  Save,
  Send,
  Users,
  Package,
  Tag,
} from "lucide-react";

interface CreateProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (productData: any) => void;
}

interface ProductFormData {
  name: string;
  description: string;
  category: string;
  price: string;
  priceUnit: string;
  status: "Active" | "Draft";
  minOrder: string;
  maxOrder: string;
  deliveryArea: string;
  specialties: string[];
  image: File | null;
}

const categories = [
  "Catering Services",
  "Grocery Services",
  "Office Supplies",
  "Technology",
  "Furniture",
  "Cleaning Services",
  "Security Services",
  "Transportation",
  "Marketing Services",
  "Food & Beverage",
  "Other",
];

const priceUnits = [
  "/person",
  "/hour",
  "/day",
  "/week",
  "/month",
  "/unit",
  "/kg",
  "/lb",
  "flat rate",
];

const steps = [
  {
    id: 1,
    title: "Basic Information",
    description: "Product name and description",
  },
  {
    id: 2,
    title: "Pricing & Category",
    description: "Set price and category",
  },
  {
    id: 3,
    title: "Order Details",
    description: "Order limits and delivery area",
  },
  {
    id: 4,
    title: "Specialties & Review",
    description: "Add specialties and review",
  },
];

export function CreateProductForm({
  isOpen,
  onClose,
  onSubmit,
}: CreateProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    category: "",
    price: "",
    priceUnit: "/person",
    status: "Draft",
    minOrder: "",
    maxOrder: "",
    deliveryArea: "",
    specialties: [""],
    image: null,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSpecialtyChange = (index: number, value: string) => {
    const newSpecialties = [...formData.specialties];
    newSpecialties[index] = value;
    setFormData((prev) => ({
      ...prev,
      specialties: newSpecialties,
    }));
  };

  const addSpecialty = () => {
    setFormData((prev) => ({
      ...prev,
      specialties: [...prev.specialties, ""],
    }));
  };

  const removeSpecialty = (index: number) => {
    const newSpecialties = formData.specialties.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      specialties: newSpecialties.length > 0 ? newSpecialties : [""],
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: null,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Format price
      const formattedPrice =
        formData.priceUnit === "flat rate"
          ? `$${formData.price}`
          : `$${formData.price}${formData.priceUnit}`;

      // Filter out empty specialties
      const filteredSpecialties = formData.specialties.filter(
        (s) => s.trim() !== ""
      );

      const productData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: formattedPrice,
        status: formData.status,
        minOrder: parseInt(formData.minOrder) || 1,
        maxOrder: parseInt(formData.maxOrder) || 1,
        deliveryArea: formData.deliveryArea,
        specialties: filteredSpecialties,
        image: formData.image,
      };

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onSubmit(productData);
      onClose();
      // Reset form
      setFormData({
        name: "",
        description: "",
        category: "",
        price: "",
        priceUnit: "/person",
        status: "Draft",
        minOrder: "",
        maxOrder: "",
        deliveryArea: "",
        specialties: [""],
        image: null,
      });
      setCurrentStep(1);
    } catch (error) {
      console.error("Error creating product:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create Product
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Add a new product or service - Step {currentStep} of{" "}
              {steps.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="bg-gray-50 px-6 py-4 dark:bg-gray-700">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    currentStep >= step.id
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-400"
                  }`}
                >
                  {step.id}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p
                    className={`text-sm font-medium ${
                      currentStep >= step.id
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`mx-4 h-0.5 w-12 ${
                      currentStep > step.id
                        ? "bg-green-500"
                        : "bg-gray-200 dark:bg-gray-600"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <form
          onSubmit={handleSubmit}
          className="max-h-[60vh] overflow-y-auto p-6"
        >
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Corporate Catering Package"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Provide a detailed description of your product or service"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Product Image
                </label>
                <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 dark:border-gray-600">
                  {formData.image ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {formData.image.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="flex cursor-pointer flex-col items-center justify-center"
                      >
                        <Upload className="mb-2 h-8 w-8 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Click to upload image or drag and drop
                        </span>
                        <span className="mt-1 text-xs text-gray-500">
                          PNG, JPG, WEBP (max 5MB)
                        </span>
                      </label>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Pricing & Category */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    handleInputChange("category", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Price *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        handleInputChange("price", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="45"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Price Unit *
                  </label>
                  <select
                    value={formData.priceUnit}
                    onChange={(e) =>
                      handleInputChange("priceUnit", e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    {priceUnits.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Preview:</span>{" "}
                  {formData.price && formData.priceUnit
                    ? formData.priceUnit === "flat rate"
                      ? `$${formData.price}`
                      : `$${formData.price}${formData.priceUnit}`
                    : "Enter price to see preview"}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status *
                </label>
                <div className="flex gap-4">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      value="Active"
                      checked={formData.status === "Active"}
                      onChange={(e) =>
                        handleInputChange("status", e.target.value)
                      }
                      className="h-4 w-4 text-green-500 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Active
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      value="Draft"
                      checked={formData.status === "Draft"}
                      onChange={(e) =>
                        handleInputChange("status", e.target.value)
                      }
                      className="h-4 w-4 text-green-500 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Draft
                    </span>
                  </label>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Active products are visible to buyers, Draft products are
                  saved but not published
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Order Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Minimum Order *
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                    <input
                      type="number"
                      value={formData.minOrder}
                      onChange={(e) =>
                        handleInputChange("minOrder", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="1"
                      min="1"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Maximum Order *
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                    <input
                      type="number"
                      value={formData.maxOrder}
                      onChange={(e) =>
                        handleInputChange("maxOrder", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="100"
                      min="1"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Delivery Area *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                  <input
                    type="text"
                    value={formData.deliveryArea}
                    onChange={(e) =>
                      handleInputChange("deliveryArea", e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Downtown & Surrounding Areas, City-wide"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Specialties & Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Specialties
                </label>
                <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                  Add tags that describe your product's specialties or key
                  features
                </p>
                <div className="space-y-3">
                  {formData.specialties.map((specialty, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                        <input
                          type="text"
                          value={specialty}
                          onChange={(e) =>
                            handleSpecialtyChange(index, e.target.value)
                          }
                          className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          placeholder={`Specialty ${index + 1}`}
                        />
                      </div>
                      {formData.specialties.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSpecialty(index)}
                          className="px-3 py-3 text-red-500 hover:text-red-700 dark:hover:text-red-400"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addSpecialty}
                    className="flex items-center gap-2 rounded-lg border border-green-300 px-4 py-2 text-green-600 hover:bg-green-50 hover:text-green-700 dark:border-green-600 dark:hover:bg-green-900/20 dark:hover:text-green-400"
                  >
                    <Plus className="h-4 w-4" />
                    Add Specialty
                  </button>
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                  Product Summary
                </h3>
                <div className="space-y-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Name:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {formData.name || "Not specified"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Category:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {formData.category || "Not specified"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Price:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {formData.price && formData.priceUnit
                        ? formData.priceUnit === "flat rate"
                          ? `$${formData.price}`
                          : `$${formData.price}${formData.priceUnit}`
                        : "Not specified"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Status:
                    </span>
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        formData.status === "Active"
                          ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                          : "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300"
                      }`}
                    >
                      {formData.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Order Range:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {formData.minOrder && formData.maxOrder
                        ? `${formData.minOrder} - ${formData.maxOrder}`
                        : "Not specified"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Delivery Area:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {formData.deliveryArea || "Not specified"}
                    </span>
                  </div>
                  {formData.specialties.filter((s) => s.trim() !== "").length >
                    0 && (
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Specialties:
                      </span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {formData.specialties
                          .filter((s) => s.trim() !== "")
                          .map((specialty, index) => (
                            <span
                              key={index}
                              className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                            >
                              {specialty}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 p-6 dark:border-gray-700">
          <div className="flex gap-3">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
              >
                Previous
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
            >
              Cancel
            </button>

            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={nextStep}
                className="rounded-lg bg-green-500 px-6 py-2 font-medium text-white transition-colors hover:bg-green-600"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-lg bg-green-500 px-6 py-2 font-medium text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleSubmit}
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Create Product
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

