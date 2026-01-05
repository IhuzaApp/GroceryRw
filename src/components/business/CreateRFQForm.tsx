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
import toast from "react-hot-toast";
import rfqTermsOptions from "../../lib/rfqTermsOptions.json";

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
  deliveryTerms: string;
  warrantyInformation: string;
  cancellationTerms: string;
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
    deliveryTerms: "",
    warrantyInformation: "",
    cancellationTerms: "",
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
    setFormData((prev) => {
      const parentValue = prev[parentField as keyof RFQFormData];
      if (typeof parentValue === 'object' && parentValue !== null && !Array.isArray(parentValue)) {
        return {
          ...prev,
          [parentField]: {
            ...parentValue,
            [childField]: value,
          },
        };
      }
      return prev;
    });
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

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/png;base64,")
        const base64 = result.split(",")[1] || result;
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Convert attachments to base64 (for now, we'll use the first attachment)
      let attachmentBase64 = "";
      if (formData.attachments.length > 0) {
        try {
          attachmentBase64 = await convertFileToBase64(formData.attachments[0]);
        } catch (error) {
          console.error("Error converting file to base64:", error);
        }
      }

      // Prepare requirements array (filter out empty strings)
      const requirementsArray = formData.requirements.filter(
        (r) => r.trim() !== ""
      );

      // Combine all notes into a structured format
      const notesContent = formData.additionalNotes 
        ? `${formData.additionalNotes}\n\nTerms & Conditions:\nPayment Terms: ${formData.paymentTerms || "Not specified"}\nDelivery Terms: ${formData.deliveryTerms || "Not specified"}\nWarranty: ${formData.warrantyInformation || "Not specified"}\nCancellation Terms: ${formData.cancellationTerms || "Not specified"}`
        : `Terms & Conditions:\nPayment Terms: ${formData.paymentTerms || "Not specified"}\nDelivery Terms: ${formData.deliveryTerms || "Not specified"}\nWarranty: ${formData.warrantyInformation || "Not specified"}\nCancellation Terms: ${formData.cancellationTerms || "Not specified"}`;

      // Call the API
      const response = await fetch("/api/mutations/create-business-rfq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          min_budget: formData.budget.min || "",
          max_budget: formData.budget.max || "",
          location: formData.location,
          response_date: formData.deadline,
          urgency_level: formData.urgency,
          estimated_quantity: formData.estimatedQuantity || "",
          expected_delivery_date: formData.deliveryDate || "",
          payment_terms: formData.paymentTerms || "",
          delivery_terms: formData.deliveryTerms || "",
          warranty_information: formData.warrantyInformation || "",
          cancellation_terms: formData.cancellationTerms || "",
          requirements: requirementsArray,
          notes: notesContent,
          contact_name: formData.contactInfo.name,
          email: formData.contactInfo.email,
          phone: formData.contactInfo.phone || "",
          attachment: attachmentBase64,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create RFQ");
      }

      const data = await response.json();

      // Call the onSubmit callback with the created RFQ data
      onSubmit(data.rfq || formData);

      // Show success message
      toast.success("RFQ created successfully!");

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
        deliveryTerms: "",
        warrantyInformation: "",
        cancellationTerms: "",
        additionalNotes: "",
      });
      setCurrentStep(1);
    } catch (error: any) {
      console.error("Error creating RFQ:", error);
      toast.error(error.message || "Failed to create RFQ. Please try again.");
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
    <div className="fixed inset-0 z-[10004] flex items-end justify-center bg-black/70 backdrop-blur-md sm:items-center sm:bg-black/60 sm:p-4">
      <div className="flex h-full max-h-screen w-full flex-col overflow-hidden rounded-t-[2rem] bg-white shadow-2xl dark:bg-gray-900 sm:h-auto sm:max-h-[90vh] sm:w-full sm:max-w-4xl sm:rounded-3xl sm:border sm:border-gray-200 dark:sm:border-gray-700">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
                Create RFQ
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Request for Quotation - Step {currentStep} of {steps.length}
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex-shrink-0 border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800/50">
          <div className="flex items-center justify-between overflow-x-auto">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-shrink-0">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
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
                    className={`mx-4 h-0.5 w-12 flex-shrink-0 ${
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
          className="flex-1 overflow-y-auto bg-white dark:bg-gray-900"
        >
          <div className="p-6 md:p-8">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  RFQ Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base font-medium text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:border-green-500"
                  placeholder="Enter a clear, descriptive title for your RFQ"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={4}
                  className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base font-medium text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:border-green-500"
                  placeholder="Provide detailed description of what you're looking for"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    handleInputChange("category", e.target.value)
                  }
                  className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base font-medium text-gray-900 shadow-sm transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-500"
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Minimum Budget
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <input
                      type="number"
                      value={formData.budget.min}
                      onChange={(e) =>
                        handleNestedInputChange("budget", "min", e.target.value)
                      }
                      className="w-full rounded-xl border-2 border-gray-200 bg-white py-3 pl-12 pr-4 text-base font-medium text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:border-green-500"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Maximum Budget
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <input
                      type="number"
                      value={formData.budget.max}
                      onChange={(e) =>
                        handleNestedInputChange("budget", "max", e.target.value)
                      }
                      className="w-full rounded-xl border-2 border-gray-200 bg-white py-3 pl-12 pr-4 text-base font-medium text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:border-green-500"
                      placeholder="10000"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    className="w-full rounded-xl border-2 border-gray-200 bg-white py-3 pl-12 pr-4 text-base font-medium text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:border-green-500"
                    placeholder="City, State, Country"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Response Deadline <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) =>
                        handleInputChange("deadline", e.target.value)
                      }
                      className="w-full rounded-xl border-2 border-gray-200 bg-white py-3 pl-12 pr-4 text-base font-medium text-gray-900 shadow-sm transition-all duration-200 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Urgency Level
                  </label>
                  <select
                    value={formData.urgency}
                    onChange={(e) =>
                      handleInputChange("urgency", e.target.value)
                    }
                    className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base font-medium text-gray-900 shadow-sm transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-500"
                  >
                    {urgencyLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Estimated Quantity
                  </label>
                  <input
                    type="text"
                    value={formData.estimatedQuantity}
                    onChange={(e) =>
                      handleInputChange("estimatedQuantity", e.target.value)
                    }
                    className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base font-medium text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:border-green-500"
                    placeholder="e.g., 100 units, 50 hours"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Expected Delivery Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <input
                      type="date"
                      value={formData.deliveryDate}
                      onChange={(e) =>
                        handleInputChange("deliveryDate", e.target.value)
                      }
                      className="w-full rounded-xl border-2 border-gray-200 bg-white py-3 pl-12 pr-4 text-base font-medium text-gray-900 shadow-sm transition-all duration-200 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-500"
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
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
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
                        className="flex-1 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base font-medium text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:border-green-500"
                        placeholder={`Requirement ${index + 1}`}
                      />
                      {formData.requirements.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRequirement(index)}
                          className="rounded-lg px-3 py-3 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addRequirement}
                    className="flex items-center gap-2 rounded-xl border-2 border-green-300 bg-white px-4 py-2 text-sm font-semibold text-green-600 transition-all duration-200 hover:border-green-400 hover:bg-green-50 hover:text-green-700 dark:border-green-600 dark:bg-gray-700 dark:hover:bg-green-900/20 dark:hover:text-green-400"
                  >
                    <Plus className="h-4 w-4" />
                    Add Requirement
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Attachments
                </label>
                <div className="rounded-xl border-2 border-dashed border-gray-300 p-6 transition-all duration-200 hover:border-green-400 dark:border-gray-600 dark:hover:border-green-500">
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
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30">
                      <Upload className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Click to upload files or drag and drop
                    </span>
                    <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      PDF, DOC, XLS, images (max 10MB each)
                    </span>
                  </label>
                </div>
                {formData.attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {formData.attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-xl border-2 border-gray-200 bg-white px-4 py-3 shadow-sm transition-all duration-200 hover:border-green-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-700 dark:hover:border-green-600"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30">
                            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {file.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Payment Terms
                </label>
                <select
                  value={formData.paymentTerms}
                  onChange={(e) =>
                    handleInputChange("paymentTerms", e.target.value)
                  }
                  className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base font-medium text-gray-900 shadow-sm transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-500"
                >
                  <option value="">Select payment terms</option>
                  <option value="cod">Cash on Delivery (COD)</option>
                  <option value="net30">Net 30 days</option>
                  <option value="net15">Net 15 days</option>
                  <option value="net60">Net 60 days</option>
                  <option value="advance">Advance payment</option>
                  <option value="milestone">Milestone-based</option>
                  <option value="50advance50delivery">50% advance, 50% upon delivery</option>
                  <option value="100upfront">100% upfront</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Delivery Terms
                </label>
                <select
                  value={formData.deliveryTerms}
                  onChange={(e) =>
                    handleInputChange("deliveryTerms", e.target.value)
                  }
                  className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base font-medium text-gray-900 shadow-sm transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-500"
                >
                  <option value="">Select delivery terms</option>
                  {rfqTermsOptions.deliveryTermsOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Warranty Information
                </label>
                <select
                  value={formData.warrantyInformation}
                  onChange={(e) =>
                    handleInputChange("warrantyInformation", e.target.value)
                  }
                  className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base font-medium text-gray-900 shadow-sm transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-500"
                >
                  <option value="">Select warranty</option>
                  {rfqTermsOptions.warrantyOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Cancellation Terms
                </label>
                <select
                  value={formData.cancellationTerms}
                  onChange={(e) =>
                    handleInputChange("cancellationTerms", e.target.value)
                  }
                  className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base font-medium text-gray-900 shadow-sm transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-500"
                >
                  <option value="">Select cancellation terms</option>
                  {rfqTermsOptions.cancellationTermsOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Additional Notes
                </label>
                <textarea
                  value={formData.additionalNotes}
                  onChange={(e) =>
                    handleInputChange("additionalNotes", e.target.value)
                  }
                  rows={3}
                  className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base font-medium text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:border-green-500"
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
                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Contact Name <span className="text-red-500">*</span>
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
                      className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base font-medium text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:border-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Email <span className="text-red-500">*</span>
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
                      className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base font-medium text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:border-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
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
                      className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base font-medium text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:border-green-500"
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
          </div>
        </form>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-3">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 hover:shadow-md active:scale-95 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Previous
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 hover:shadow-md active:scale-95 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 sm:flex-none"
              >
                Cancel
              </button>

              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-500/30 transition-all duration-200 hover:from-green-600 hover:to-emerald-600 hover:shadow-xl hover:shadow-green-500/40 active:scale-95 sm:flex-none sm:px-6"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-500/30 transition-all duration-200 hover:from-green-600 hover:to-emerald-600 hover:shadow-xl hover:shadow-green-500/40 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none sm:px-6"
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
    </div>
  );
}
