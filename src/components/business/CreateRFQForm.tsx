"use client";

import { useState } from "react";
import {
  X,
  Plus,
  Calendar,
  DollarSign,
  MapPin,
  FileText,
  Upload,
  Save,
  Send,
} from "lucide-react";

interface CreateRFQFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rfqData: any) => void;
}

interface RFQFormData {
  title: string;
  description: string;
  category: string;
  budget: {
    min: string;
    max: string;
  };
  location: string;
  deadline: string;
  requirements: string[];
  attachments: File[];
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
  urgency: "Low" | "Medium" | "High" | "Urgent";
  estimatedQuantity: string;
  deliveryDate: string;
  paymentTerms: string;
  additionalNotes: string;
}

const categories = [
  "Technology",
  "Furniture",
  "Office Supplies",
  "Services",
  "Marketing",
  "Food & Beverage",
  "Cleaning",
  "Security",
  "Transportation",
  "Other",
];

const urgencyLevels = [
  { value: "Low", label: "Low", color: "text-green-600 bg-green-100" },
  { value: "Medium", label: "Medium", color: "text-yellow-600 bg-yellow-100" },
  { value: "High", label: "High", color: "text-orange-600 bg-orange-100" },
  { value: "Urgent", label: "Urgent", color: "text-red-600 bg-red-100" },
];

export function CreateRFQForm({
  isOpen,
  onClose,
  onSubmit,
}: CreateRFQFormProps) {
  const [formData, setFormData] = useState<RFQFormData>({
    title: "",
    description: "",
    category: "",
    budget: { min: "", max: "" },
    location: "",
    deadline: "",
    requirements: [""],
    attachments: [],
    contactInfo: { name: "", email: "", phone: "" },
    urgency: "Medium",
    estimatedQuantity: "",
    deliveryDate: "",
    paymentTerms: "",
    additionalNotes: "",
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    {
      id: 1,
      title: "Basic Information",
      description: "RFQ title and description",
    },
    { id: 2, title: "Details", description: "Category, budget, and timeline" },
    {
      id: 3,
      title: "Requirements",
      description: "Specific requirements and attachments",
    },
    {
      id: 4,
      title: "Contact & Review",
      description: "Contact info and final review",
    },
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedInputChange = (
    parentField: string,
    childField: string,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      [parentField]: {
        ...prev[parentField as keyof RFQFormData],
        [childField]: value,
      },
    }));
  };

  const handleRequirementChange = (index: number, value: string) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = value;
    setFormData((prev) => ({
      ...prev,
      requirements: newRequirements,
    }));
  };

  const addRequirement = () => {
    setFormData((prev) => ({
      ...prev,
      requirements: [...prev.requirements, ""],
    }));
  };

  const removeRequirement = (index: number) => {
    const newRequirements = formData.requirements.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      requirements: newRequirements,
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }));
  };

  const removeAttachment = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onSubmit(formData);
      onClose();
      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        budget: { min: "", max: "" },
        location: "",
        deadline: "",
        requirements: [""],
        attachments: [],
        contactInfo: { name: "", email: "", phone: "" },
        urgency: "Medium",
        estimatedQuantity: "",
        deliveryDate: "",
        paymentTerms: "",
        additionalNotes: "",
      });
      setCurrentStep(1);
    } catch (error) {
      console.error("Error creating RFQ:", error);
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
              Create RFQ
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Request for Quotation - Step {currentStep} of {steps.length}
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
                  RFQ Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter a clear, descriptive title for your RFQ"
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
                  placeholder="Provide detailed description of what you're looking for"
                  required
                />
              </div>

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
            </div>
          )}

          {/* Step 2: Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Minimum Budget
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                    <input
                      type="number"
                      value={formData.budget.min}
                      onChange={(e) =>
                        handleNestedInputChange("budget", "min", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Maximum Budget
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                    <input
                      type="number"
                      value={formData.budget.max}
                      onChange={(e) =>
                        handleNestedInputChange("budget", "max", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="10000"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Location *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="City, State, Country"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Response Deadline *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) =>
                        handleInputChange("deadline", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Urgency Level
                  </label>
                  <select
                    value={formData.urgency}
                    onChange={(e) =>
                      handleInputChange("urgency", e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    {urgencyLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Estimated Quantity
                  </label>
                  <input
                    type="text"
                    value={formData.estimatedQuantity}
                    onChange={(e) =>
                      handleInputChange("estimatedQuantity", e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., 100 units, 50 hours"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Expected Delivery Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                    <input
                      type="date"
                      value={formData.deliveryDate}
                      onChange={(e) =>
                        handleInputChange("deliveryDate", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Requirements */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Specific Requirements
                </label>
                <div className="space-y-3">
                  {formData.requirements.map((requirement, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={requirement}
                        onChange={(e) =>
                          handleRequirementChange(index, e.target.value)
                        }
                        className="flex-1 rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        placeholder={`Requirement ${index + 1}`}
                      />
                      {formData.requirements.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRequirement(index)}
                          className="px-3 py-3 text-red-500 hover:text-red-700 dark:hover:text-red-400"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addRequirement}
                    className="flex items-center gap-2 rounded-lg border border-green-300 px-4 py-2 text-green-600 hover:bg-green-50 hover:text-green-700 dark:border-green-600 dark:hover:bg-green-900/20 dark:hover:text-green-400"
                  >
                    <Plus className="h-4 w-4" />
                    Add Requirement
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Attachments
                </label>
                <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 dark:border-gray-600">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex cursor-pointer flex-col items-center justify-center"
                  >
                    <Upload className="mb-2 h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Click to upload files or drag and drop
                    </span>
                    <span className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                      PDF, DOC, XLS, images (max 10MB each)
                    </span>
                  </label>
                </div>
                {formData.attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {formData.attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg bg-gray-50 p-2 dark:bg-gray-700"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {file.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Payment Terms
                </label>
                <select
                  value={formData.paymentTerms}
                  onChange={(e) =>
                    handleInputChange("paymentTerms", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select payment terms</option>
                  <option value="net30">Net 30 days</option>
                  <option value="net15">Net 15 days</option>
                  <option value="net60">Net 60 days</option>
                  <option value="cod">Cash on Delivery</option>
                  <option value="advance">Advance payment</option>
                  <option value="milestone">Milestone-based</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Additional Notes
                </label>
                <textarea
                  value={formData.additionalNotes}
                  onChange={(e) =>
                    handleInputChange("additionalNotes", e.target.value)
                  }
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Any additional information or special requirements"
                />
              </div>
            </div>
          )}

          {/* Step 4: Contact & Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      value={formData.contactInfo.name}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "contactInfo",
                          "name",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.contactInfo.email}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "contactInfo",
                          "email",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.contactInfo.phone}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "contactInfo",
                          "phone",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                  RFQ Summary
                </h3>
                <div className="space-y-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Title:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {formData.title || "Not specified"}
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
                      Budget:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {formData.budget.min && formData.budget.max
                        ? `$${formData.budget.min} - $${formData.budget.max}`
                        : "Not specified"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Location:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {formData.location || "Not specified"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Deadline:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {formData.deadline || "Not specified"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Urgency:
                    </span>
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        urgencyLevels.find((l) => l.value === formData.urgency)
                          ?.color || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {formData.urgency}
                    </span>
                  </div>
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
                    Create RFQ
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
