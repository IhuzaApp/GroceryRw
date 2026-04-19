"use client";

import { useState, useEffect } from "react";
import {
  X,
  DollarSign,
  Clock,
  FileText,
  Send,
  Upload,
  Package,
  Building,
  CheckCircle,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { formatCurrencySync } from "../../utils/formatCurrency";
import { uploadToFirebase } from "../../utils/firebaseUtils";

interface QuoteSubmissionFormProps {
  isOpen: boolean;
  onClose: () => void;
  rfqId: string;
  rfqTitle?: string;
  onSuccess?: () => void;
  businessAccount?: any;
}

export function QuoteSubmissionForm({
  isOpen,
  onClose,
  rfqId,
  rfqTitle,
  onSuccess,
  businessAccount,
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

      // Upload attachments to Firebase Storage
      const uploadedUrls: string[] = [];
      const businessName = businessAccount?.businessName || "anonymous";
      const timestamp = Date.now();

      const slugify = (text: string) =>
        text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
      const bNameSlug = slugify(businessName);

      if (attachments.length > 0) {
        for (const file of attachments) {
          try {
            const fileName = `${timestamp}_${file.name}`;
            const storagePath = `rfq/${bNameSlug}/quotes/${fileName}`;
            const downloadUrl = await uploadToFirebase(file, storagePath);
            uploadedUrls.push(downloadUrl);
          } catch (uploadError) {
            console.error(`Error uploading ${file.name}:`, uploadError);
            toast.error(`Failed to upload ${file.name}`);
          }
        }
      }

      // Map attachments to the three fields: attachement, attachment_1, attachment_2
      const attachement = uploadedUrls.length > 0 ? uploadedUrls[0] : "";
      const attachment_1 = uploadedUrls.length > 1 ? uploadedUrls[1] : "";
      const attachment_2 = uploadedUrls.length > 2 ? uploadedUrls[2] : "";

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
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-[var(--bg-primary)]"
      onClick={onClose}
    >
      <div
        className="relative flex h-screen w-screen flex-col overflow-hidden bg-[var(--bg-primary)] shadow-2xl transition-all duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative flex-shrink-0 overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-8">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3%3Cfilter id='noiseFilter'%3%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          ></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white sm:text-3xl">
                Submit Formal Bid
              </h2>
              {rfqTitle && (
                <p className="mt-1 text-sm font-medium text-white/80">
                  Ref: {rfqTitle}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-full bg-white/10 p-2 text-white transition-all hover:bg-white/20 active:scale-95"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--bg-primary)]"
        >
          <div className="flex-1 overflow-y-auto p-6 sm:p-10">
            <div className="mx-auto max-w-2xl space-y-10">
              {/* Core Bid Details */}
              <section className="space-y-6">
                <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] opacity-50">
                  <div className="h-1 w-4 rounded-full bg-green-500"></div>
                  Financial Proposal
                </h3>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                      Bid Amount *
                    </label>
                    <div className="group relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-green-600">
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <input
                        type="number"
                        name="quote_amount"
                        value={formData.quote_amount}
                        onChange={handleInputChange}
                        required
                        className="bg-[var(--bg-secondary)]/20 w-full rounded-2xl border border-[var(--bg-secondary)] px-4 py-4 pl-12 text-base font-black text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] placeholder:opacity-40 focus:bg-white focus:ring-4 focus:ring-green-500/10 dark:focus:bg-[var(--bg-secondary)]"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                      Currency
                    </label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      className="bg-[var(--bg-secondary)]/20 w-full rounded-2xl border border-[var(--bg-secondary)] px-4 py-4 text-sm font-black text-[var(--text-primary)] focus:ring-4 focus:ring-green-500/10"
                    >
                      <option value="RWF">RWF</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                      Delivery Timing
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)] opacity-50" />
                      <select
                        name="delivery_time"
                        value={formData.delivery_time}
                        onChange={handleInputChange}
                        className="bg-[var(--bg-secondary)]/20 w-full rounded-2xl border border-[var(--bg-secondary)] py-4 pl-12 pr-4 text-sm font-black text-[var(--text-primary)] focus:ring-4 focus:ring-green-500/10"
                      >
                        <option value="">Standard Lead Time</option>
                        <option value="Same day">Immediate</option>
                        <option value="1-2 business days">1-2 Days</option>
                        <option value="3-5 business days">3-5 Days</option>
                        <option value="1 week">1 Week</option>
                        <option value="2 weeks">2 Weeks</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                      Bid Validity
                    </label>
                    <select
                      name="validity"
                      value={formData.validity}
                      onChange={handleInputChange}
                      className="bg-[var(--bg-secondary)]/20 w-full rounded-2xl border border-[var(--bg-secondary)] px-4 py-4 text-sm font-black text-[var(--text-primary)] focus:ring-4 focus:ring-green-500/10"
                    >
                      <option value="">Select period</option>
                      <option value="7 days">7 Days</option>
                      <option value="30 days">30 Days</option>
                      <option value="90 days">90 Days</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Terms Section */}
              <section className="space-y-6">
                <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] opacity-50">
                  <div className="h-1 w-4 rounded-full bg-purple-500"></div>
                  Commercial Terms
                </h3>
                <div className="bg-[var(--bg-secondary)]/10 rounded-3xl border border-[var(--bg-secondary)] p-6 sm:p-8">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {[
                      {
                        name: "payment_terms",
                        label: "Payment Terms",
                        icon: DollarSign,
                        options: ["COD", "Net 30", "50% Advance"],
                      },
                      {
                        name: "warranty",
                        label: "Warranty Policy",
                        icon: Clock,
                        options: [
                          "No Warranty",
                          "1 Year",
                          "2 Years",
                          "Lifetime",
                        ],
                      },
                      {
                        name: "delivery_terms",
                        label: "Freight Terms",
                        icon: Package,
                        options: ["EXW", "DDP", "FOB", "Free Delivery"],
                      },
                      {
                        name: "cancellation_terms",
                        label: "Cancellation Policy",
                        icon: FileText,
                        options: ["None", "24h Notice", "Refundable"],
                      },
                    ].map((term) => (
                      <div key={term.name}>
                        <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                          {term.label}
                        </label>
                        <select
                          name={term.name}
                          value={(formData as any)[term.name]}
                          onChange={handleInputChange}
                          className="bg-[var(--bg-secondary)]/20 w-full rounded-2xl border border-[var(--bg-secondary)] px-4 py-3 text-sm font-bold text-[var(--text-primary)] focus:bg-white dark:focus:bg-[var(--bg-secondary)]"
                        >
                          <option value="">N/A</option>
                          {term.options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Proposal Text */}
              <section className="space-y-6">
                <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] opacity-50">
                  <div className="h-1 w-4 rounded-full bg-blue-500"></div>
                  Message to Client
                </h3>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="bg-[var(--bg-secondary)]/20 w-full rounded-3xl border border-[var(--bg-secondary)] p-6 text-base font-medium text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] placeholder:opacity-40 focus:bg-white focus:ring-4 focus:ring-green-500/10 dark:focus:bg-[var(--bg-secondary)]"
                  placeholder="Detail your competitive advantages and specific approach for this RFQ..."
                />
              </section>

              {/* Attachments UI */}
              <section className="space-y-6 pb-10">
                <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] opacity-50">
                  <div className="h-1 w-4 rounded-full bg-amber-500"></div>
                  Supporting Documents
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <label
                    className={`group flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 transition-all active:scale-[0.98] ${
                      attachments.length >= 3
                        ? "bg-[var(--bg-secondary)]/10 border-[var(--bg-secondary)] opacity-50"
                        : "border-green-500/30 bg-green-500/5 hover:border-green-500 hover:bg-green-500/10"
                    }`}
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg">
                      <Upload className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-black text-[var(--text-primary)]">
                      {attachments.length >= 3
                        ? "Slot Limit Reached"
                        : "Drop Proposals Here"}
                    </span>
                    <span className="mt-1 text-xs font-bold text-[var(--text-secondary)] opacity-60">
                      Max 3 files (PDF, JPG, PNG)
                    </span>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={attachments.length >= 3}
                    />
                  </label>

                  {attachments.length > 0 && (
                    <div className="space-y-3">
                      {attachments.map((file, i) => (
                        <div
                          key={i}
                          className="bg-[var(--bg-secondary)]/10 hover:bg-[var(--bg-secondary)]/20 flex items-center justify-between rounded-2xl border border-[var(--bg-secondary)] p-4 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-blue-500" />
                            <div>
                              <p className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap text-sm font-black text-[var(--text-primary)]">
                                {file.name}
                              </p>
                              <p className="text-[10px] font-bold text-[var(--text-secondary)]">
                                {(file.size / 1024).toFixed(0)} KB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeAttachment(i)}
                            className="rounded-xl bg-red-500/10 p-2 text-red-500 transition-all hover:bg-red-500 hover:text-white"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>

          {/* Glowing Sticky Footer Actions */}
          <div className="flex-shrink-0 border-t border-[var(--bg-secondary)] bg-[var(--bg-primary)] p-6 sm:px-10">
            <div className="mx-auto flex max-w-2xl flex-col gap-4 sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-2xl border border-[var(--bg-secondary)] bg-[var(--bg-primary)] px-8 py-4 text-sm font-black text-[var(--text-primary)] transition-all hover:bg-[var(--bg-secondary)]"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative flex-[2] overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-4 text-sm font-black text-white shadow-xl shadow-green-500/30 transition-all active:scale-95 disabled:opacity-50"
                style={{ color: "#ffffff" }}
              >
                <div className="relative z-10 flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span style={{ color: "#ffffff" }}>
                    {isSubmitting ? "Processing Bid..." : "Submit Formal Bid"}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
