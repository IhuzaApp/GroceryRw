"use client";

import { useState, useEffect } from "react";
import { X, DollarSign, Clock, FileText, Send, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { formatCurrencySync } from "../../utils/formatCurrency";

interface QuoteSubmissionFormProps {
  isOpen: boolean;
  onClose: () => void;
  rfqId: string;
  rfqTitle?: string;
  onSuccess?: () => void;
}

export function QuoteSubmissionForm({
  isOpen,
  onClose,
  rfqId,
  rfqTitle,
  onSuccess,
}: QuoteSubmissionFormProps) {
  const [formData, setFormData] = useState({
    quote_amount: "",
    currency: "RWF", // Will be updated from system config
    delivery_time: "",
    validity: "",
    message: "",
    payment_terms: "",
    warranty: "",
    delivery_terms: "",
    cancellation_terms: "",
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch default currency from system configuration
  useEffect(() => {
    const fetchDefaultCurrency = async () => {
      try {
        const response = await fetch("/api/queries/system-configuration");
        const data = await response.json();
        if (data.success && data.config?.currency) {
          setFormData((prev) => ({
            ...prev,
            currency: data.config.currency,
          }));
        }
      } catch (error) {
        console.warn("Failed to fetch system configuration:", error);
        // Keep default "RWF"
      }
    };
    fetchDefaultCurrency();
  }, []);

  // Hide bottom navbar when modal is open on mobile
  useEffect(() => {
    if (!isOpen) return;

    // Hide bottom navbar - target the specific navbar element
    const hideNavbar = () => {
      // Try multiple selectors to find the bottom navbar
      const selectors = [
        "nav.fixed.bottom-0",
        'nav[class*="fixed"][class*="bottom-0"]',
        ".fixed.bottom-0.z-\\[9999\\]",
        "nav.z-\\[9999\\]",
      ];

      selectors.forEach((selector) => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            // Check if it's a bottom navigation (has bottom-0 and is fixed)
            if (
              htmlEl.classList.contains("bottom-0") &&
              htmlEl.classList.contains("fixed")
            ) {
              htmlEl.style.display = "none";
              htmlEl.setAttribute("data-modal-hidden", "true");
            }
          });
        } catch (e) {
          // Ignore selector errors
        }
      });
    };

    hideNavbar();

    // Cleanup: restore navbar when modal closes
    return () => {
      const elements = document.querySelectorAll('[data-modal-hidden="true"]');
      elements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.display = "";
        htmlEl.removeAttribute("data-modal-hidden");
      });
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const currentCount = attachments.length;
      const remainingSlots = 3 - currentCount;

      if (remainingSlots <= 0) {
        toast.error("Maximum 3 attachments allowed");
        return;
      }

      const filesToProcess = files.slice(0, remainingSlots);
      if (files.length > remainingSlots) {
        toast.error(
          `Only ${remainingSlots} more attachment(s) allowed (max 3 total)`
        );
      }

      // Validate and compress files before adding
      const processedFiles: File[] = [];
      for (const file of filesToProcess) {
        // Check original file size (max 2MB before compression for non-images, 3MB for images)
        // Base64 encoding increases size by ~33%, so we need to be conservative
        const maxOriginalSize = file.type.startsWith("image/")
          ? 2.5 * 1024 * 1024 // 2.5MB for images (will be compressed)
          : 1.5 * 1024 * 1024; // 1.5MB for non-images (PDFs, etc. - no compression)

        if (file.size > maxOriginalSize) {
          toast.error(
            `File "${file.name}" is too large. Maximum size is ${
              file.type.startsWith("image/") ? "2.5MB" : "1.5MB"
            } per file.`
          );
          continue;
        }

        // Compress images
        try {
          const processedFile = file.type.startsWith("image/")
            ? await compressImage(file, 1920, 0.7) // Lower quality for better compression
            : file;

          // Check size after compression (max 1.5MB per file to account for base64 overhead)
          const maxCompressedSize = 1.5 * 1024 * 1024; // 1.5MB
          if (processedFile.size > maxCompressedSize) {
            toast.error(
              `File "${file.name}" is still too large after compression. Maximum size is 1.5MB per file.`
            );
            continue;
          }

          processedFiles.push(processedFile);
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          toast.error(
            `Error processing "${file.name}". Please try a different file.`
          );
        }
      }

      setAttachments((prev) => [...prev, ...processedFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const compressImage = (
    file: File,
    maxWidth: number = 1920,
    quality: number = 0.8
  ): Promise<File> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith("image/")) {
        // Not an image, return as is
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Resize if larger than maxWidth
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(file);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: file.type,
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            file.type,
            quality
          );
        };
        img.onerror = () => resolve(file);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve(file);
    });
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    // Files are already compressed in handleFileChange, so just convert to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.quote_amount) {
      toast.error("Quote amount is required");
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate total file size before processing (check base64 size estimate)
      // Base64 encoding increases size by ~33%, so we check original size * 1.4
      const totalSize = attachments.reduce((sum, file) => sum + file.size, 0);
      const estimatedBase64Size = totalSize * 1.4; // Estimate base64 size
      const maxTotalSize = 4 * 1024 * 1024; // 4MB total base64 (reduced to be safer)
      const maxPerFileBase64 = 2 * 1024 * 1024; // 2MB base64 per file max

      // Check individual file sizes (already validated in handleFileChange, but double-check)
      for (const file of attachments) {
        if (file.size > 1.5 * 1024 * 1024) {
          toast.error(
            `File "${file.name}" is too large. Maximum size is 1.5MB per file.`
          );
          setIsSubmitting(false);
          return;
        }
      }

      if (estimatedBase64Size > maxTotalSize) {
        toast.error(
          `Total attachment size is too large (${(
            estimatedBase64Size /
            1024 /
            1024
          ).toFixed(
            2
          )}MB). Maximum total size is 4MB. Please reduce file sizes or remove some attachments.`
        );
        setIsSubmitting(false);
        return;
      }

      // Convert attachments to base64
      // Note: Files are already compressed in handleFileChange
      const attachmentPromises = attachments.map(async (file) => {
        const base64 = await convertFileToBase64(file);
        // Validate actual base64 size (2MB limit per file)
        if (base64.length > maxPerFileBase64) {
          throw new Error(
            `File "${file.name}" is too large after encoding (${(
              base64.length /
              1024 /
              1024
            ).toFixed(
              2
            )}MB). Maximum size is 2MB per file. Please use a smaller file.`
          );
        }
        return base64;
      });

      const attachmentData = await Promise.all(attachmentPromises);

      // Prepare terms object
      const terms = {
        payment: formData.payment_terms || "",
        warranty: formData.warranty || "",
        delivery: formData.delivery_terms || "",
        cancellation: formData.cancellation_terms || "",
      };

      // Map attachments to the three fields: attachement, attachment_1, attachment_2
      const attachement = attachmentData.length > 0 ? attachmentData[0] : "";
      const attachment_1 = attachmentData.length > 1 ? attachmentData[1] : "";
      const attachment_2 = attachmentData.length > 2 ? attachmentData[2] : "";

      const response = await fetch("/api/mutations/submit-rfq-quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessRfq_id: rfqId,
          qouteAmount: formData.quote_amount,
          currency: formData.currency,
          delivery_time: formData.delivery_time,
          quote_validity: formData.validity,
          message: formData.message,
          PaymentTerms: formData.payment_terms,
          DeliveryTerms: formData.delivery_terms,
          warrantly: formData.warranty,
          cancellatioinTerms: formData.cancellation_terms,
          attachement: attachement,
          attachment_1: attachment_1,
          attachment_2: attachment_2,
          status: "pending",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Quote submitted successfully!");
        // Reset form
        // Reset form but keep the currency from system config
        const currentCurrency = formData.currency;
        setFormData({
          quote_amount: "",
          currency: currentCurrency,
          delivery_time: "",
          validity: "",
          message: "",
          payment_terms: "",
          warranty: "",
          delivery_terms: "",
          cancellation_terms: "",
        });
        setAttachments([]);
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      } else {
        console.error("API Error Response:", data);
        const errorMessage =
          data.graphqlErrors ||
          data.message ||
          data.error ||
          "Failed to submit quote";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error submitting quote:", error);
      toast.error("Failed to submit quote");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-end justify-center bg-black bg-opacity-50 p-0 sm:items-center sm:p-4"
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 10000,
        overflow: "hidden",
      }}
    >
      <div
        className="relative flex h-screen w-full flex-col rounded-none bg-white shadow-2xl dark:bg-gray-800 sm:h-auto sm:max-h-[90vh] sm:max-w-3xl sm:rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-5 py-4 dark:border-gray-700 dark:bg-gray-800 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Submit Quote
              </h2>
              {rfqTitle && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  For: {rfqTitle}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto p-5 sm:p-6">
            <div className="space-y-6">
              {/* Quote Amount */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Quote Amount <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                      <input
                        type="number"
                        name="quote_amount"
                        value={formData.quote_amount}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        required
                        className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 pl-12 text-base font-medium text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:border-green-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base font-medium text-gray-900 shadow-sm transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-500"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="RWF">RWF</option>
                  </select>
                </div>
              </div>

              {/* Delivery Time & Validity */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Delivery Time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <select
                      name="delivery_time"
                      value={formData.delivery_time}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border-2 border-gray-200 bg-white py-3 pl-12 pr-4 text-base font-medium text-gray-900 shadow-sm transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-500"
                    >
                      <option value="">Select delivery time</option>
                      <option value="Same day">Same day</option>
                      <option value="1-2 business days">
                        1-2 business days
                      </option>
                      <option value="3-5 business days">
                        3-5 business days
                      </option>
                      <option value="1 week">1 week</option>
                      <option value="2 weeks">2 weeks</option>
                      <option value="3-4 weeks">3-4 weeks</option>
                      <option value="1-2 months">1-2 months</option>
                      <option value="3+ months">3+ months</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Quote Validity
                  </label>
                  <select
                    name="validity"
                    value={formData.validity}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base font-medium text-gray-900 shadow-sm transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-500"
                  >
                    <option value="">Select validity period</option>
                    <option value="7 days">7 days</option>
                    <option value="14 days">14 days</option>
                    <option value="30 days">30 days</option>
                    <option value="45 days">45 days</option>
                    <option value="60 days">60 days</option>
                    <option value="90 days">90 days</option>
                    <option value="6 months">6 months</option>
                    <option value="1 year">1 year</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Message / Proposal
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base font-medium text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:border-green-500"
                  placeholder="Describe your proposal, capabilities, and why you're the best fit..."
                />
              </div>

              {/* Terms */}
              <div className="space-y-4 rounded-xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100/50 p-5 shadow-sm dark:border-gray-700 dark:from-gray-700/50 dark:to-gray-800/50">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Terms & Conditions
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Payment Terms
                    </label>
                    <select
                      name="payment_terms"
                      value={formData.payment_terms}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base font-medium text-gray-900 shadow-sm transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-500"
                    >
                      <option value="">Select payment terms</option>
                      <option value="Cash on Delivery (COD)">
                        Cash on Delivery (COD)
                      </option>
                      <option value="Net 7 days">Net 7 days</option>
                      <option value="Net 15 days">Net 15 days</option>
                      <option value="Net 30 days">Net 30 days</option>
                      <option value="Net 45 days">Net 45 days</option>
                      <option value="Net 60 days">Net 60 days</option>
                      <option value="50% advance, 50% on delivery">
                        50% advance, 50% on delivery
                      </option>
                      <option value="100% advance payment">
                        100% advance payment
                      </option>
                      <option value="Letter of Credit (L/C)">
                        Letter of Credit (L/C)
                      </option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Credit Card">Credit Card</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Warranty
                    </label>
                    <select
                      name="warranty"
                      value={formData.warranty}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base font-medium text-gray-900 shadow-sm transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-500"
                    >
                      <option value="">Select warranty</option>
                      <option value="No warranty">No warranty</option>
                      <option value="30 days warranty">30 days warranty</option>
                      <option value="90 days warranty">90 days warranty</option>
                      <option value="6 months warranty">
                        6 months warranty
                      </option>
                      <option value="1 year warranty">1 year warranty</option>
                      <option value="2 years warranty">2 years warranty</option>
                      <option value="3 years warranty">3 years warranty</option>
                      <option value="5 years warranty">5 years warranty</option>
                      <option value="Lifetime warranty">
                        Lifetime warranty
                      </option>
                      <option value="Manufacturer warranty">
                        Manufacturer warranty
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Delivery Terms
                    </label>
                    <select
                      name="delivery_terms"
                      value={formData.delivery_terms}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base font-medium text-gray-900 shadow-sm transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-500"
                    >
                      <option value="">Select delivery terms</option>
                      <option value="FOB Origin (Free On Board)">
                        FOB Origin (Free On Board)
                      </option>
                      <option value="FOB Destination">FOB Destination</option>
                      <option value="CIF (Cost, Insurance, Freight)">
                        CIF (Cost, Insurance, Freight)
                      </option>
                      <option value="EXW (Ex Works)">EXW (Ex Works)</option>
                      <option value="DDP (Delivered Duty Paid)">
                        DDP (Delivered Duty Paid)
                      </option>
                      <option value="Free delivery">Free delivery</option>
                      <option value="Customer pickup">Customer pickup</option>
                      <option value="Delivery charges apply">
                        Delivery charges apply
                      </option>
                      <option value="Free delivery within city">
                        Free delivery within city
                      </option>
                      <option value="Free delivery within 50km">
                        Free delivery within 50km
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Cancellation Terms
                    </label>
                    <select
                      name="cancellation_terms"
                      value={formData.cancellation_terms}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base font-medium text-gray-900 shadow-sm transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-500"
                    >
                      <option value="">Select cancellation terms</option>
                      <option value="No cancellation allowed">
                        No cancellation allowed
                      </option>
                      <option value="24 hours notice required">
                        24 hours notice required
                      </option>
                      <option value="48 hours notice required">
                        48 hours notice required
                      </option>
                      <option value="7 days notice required">
                        7 days notice required
                      </option>
                      <option value="14 days notice required">
                        14 days notice required
                      </option>
                      <option value="30 days notice required">
                        30 days notice required
                      </option>
                      <option value="50% cancellation fee">
                        50% cancellation fee
                      </option>
                      <option value="Full refund if cancelled before delivery">
                        Full refund if cancelled before delivery
                      </option>
                      <option value="Partial refund based on work completed">
                        Partial refund based on work completed
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Attachments */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Attachments{" "}
                  <span className="text-xs font-normal text-gray-500">
                    (Max 3 files)
                  </span>
                </label>
                <div className="space-y-2">
                  <label
                    className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 py-8 transition-all duration-200 ${
                      attachments.length >= 3
                        ? "cursor-not-allowed border-gray-300 bg-gray-100 opacity-50 dark:border-gray-600 dark:bg-gray-800"
                        : "border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100/50 shadow-sm hover:border-green-400 hover:bg-gradient-to-br hover:from-green-50/50 hover:to-emerald-50/30 hover:shadow-md dark:border-gray-600 dark:from-gray-700/50 dark:to-gray-800/50 dark:hover:border-green-500"
                    }`}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30">
                      <Upload className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-center">
                      <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {attachments.length >= 3
                          ? "Maximum 3 attachments reached"
                          : `Click to upload files (${
                              3 - attachments.length
                            } slot${
                              3 - attachments.length > 1 ? "s" : ""
                            } remaining)`}
                      </span>
                    </div>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      disabled={attachments.length >= 3}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Max 1.5MB per file, 4MB total. Images will be
                      automatically compressed. PDFs and other documents must be
                      under 1.5MB.
                    </p>
                  </label>
                  {attachments.length > 0 && (
                    <div className="space-y-2">
                      {attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-xl border-2 border-gray-200 bg-white px-4 py-3 shadow-sm transition-all duration-200 hover:border-green-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-700 dark:hover:border-green-600"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30">
                              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                                {file.name}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {(file.size / 1024).toFixed(2)} KB
                              </span>
                            </div>
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
              </div>
            </div>
          </div>

          {/* Submit Button - Always visible at bottom */}
          <div className="flex-shrink-0 border-t-2 border-gray-200 bg-white px-5 py-4 shadow-xl dark:border-gray-700 dark:bg-gray-800 sm:mt-6 sm:border-t-0 sm:bg-transparent sm:px-6 sm:py-0 sm:shadow-none">
            <div className="flex gap-3 sm:mt-0">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border-2 border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 hover:shadow-md active:scale-95 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 sm:py-2.5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-3 font-semibold text-white shadow-lg shadow-green-500/30 transition-all duration-200 hover:from-green-600 hover:to-emerald-600 hover:shadow-xl hover:shadow-green-500/40 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:py-2.5"
                style={{ color: "#ffffff" }}
              >
                {isSubmitting ? (
                  <>
                    <div
                      className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                      style={{
                        borderColor: "#ffffff",
                        borderTopColor: "transparent",
                      }}
                    ></div>
                    <span style={{ color: "#ffffff" }}>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send
                      className="h-4 w-4"
                      style={{ color: "#ffffff", stroke: "#ffffff" }}
                    />
                    <span style={{ color: "#ffffff" }}>Submit Quote</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
