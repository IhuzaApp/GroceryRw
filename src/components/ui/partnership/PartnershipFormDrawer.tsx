"use client";

import { useState } from "react";
import { X, Loader2, CheckCircle, Handshake, Building2, User, Phone, Mail, MapPin, MessageSquare, Briefcase } from "lucide-react";
// Import type only
import type { PartnershipInquiryPayload } from "../../../lib/slackSystemNotifier";

interface PartnershipFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PartnershipFormDrawer({ isOpen, onClose }: PartnershipFormDrawerProps) {
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    contactPerson: "",
    phone: "",
    email: "",
    location: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/partnership-inquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit inquiry");
      }

      setIsSuccess(true);
      // Reset form after 3 seconds and close or just show success
      setTimeout(() => {
        setIsSuccess(false);
        setFormData({
          businessName: "",
          businessType: "",
          contactPerson: "",
          phone: "",
          email: "",
          location: "",
          message: "",
        });
        onClose();
      }, 3000);
    } catch (err) {
      console.error("Error submitting partnership form:", err);
      setError("Failed to submit inquiry. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[1000000] bg-black/70 backdrop-blur-md transition-opacity duration-500 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-[1000001] w-full max-w-lg transform bg-white shadow-2xl transition-transform duration-500 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b border-gray-100 p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black text-[#1A1A1A] tracking-tight">Partner with Us</h2>
                <p className="text-gray-500 mt-1">Unlock new opportunities for your business</p>
              </div>
              <button
                onClick={onClose}
                className="group flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-all hover:bg-red-50 hover:text-red-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            {isSuccess ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-6 rounded-full bg-emerald-50 p-6 text-emerald-500">
                  <CheckCircle className="h-16 w-16" />
                </div>
                <h3 className="text-2xl font-bold text-[#1A1A1A]">Inquiry Sent!</h3>
                <p className="mt-2 text-gray-600">
                  Thank you for your interest. Our team will contact you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  {/* Business Name */}
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-gray-700">Business Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <input
                        required
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-4 text-sm font-medium text-black focus:border-[#022C22] focus:bg-white focus:outline-none transition-all"
                        placeholder="Enter your business name"
                      />
                    </div>
                  </div>

                  {/* Business Type */}
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-gray-700">Business Type</label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <select
                        required
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleChange}
                        className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-4 text-sm font-medium text-black focus:border-[#022C22] focus:bg-white focus:outline-none transition-all"
                      >
                        <option value="">Select business type</option>
                        <option value="Restaurant">Restaurant</option>
                        <option value="Supermarket">Supermarket</option>
                        <option value="Pharmacy">Pharmacy</option>
                        <option value="Store">Store / Boutique</option>
                        <option value="Wholesale">Wholesale</option>
                        <option value="Delivery/Logistic">Delivery or Logistic Company</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Contact Person */}
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-gray-700">Contact Person</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <input
                        required
                        type="text"
                        name="contactPerson"
                        value={formData.contactPerson}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-4 text-sm font-medium text-black focus:border-[#022C22] focus:bg-white focus:outline-none transition-all"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Phone */}
                    <div>
                      <label className="mb-1.5 block text-sm font-bold text-gray-700">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                          required
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-4 text-sm font-medium text-black focus:border-[#022C22] focus:bg-white focus:outline-none transition-all"
                          placeholder="e.g. 078XXXXXXX"
                        />
                      </div>
                    </div>
                    {/* Email */}
                    <div>
                      <label className="mb-1.5 block text-sm font-bold text-gray-700">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                          required
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-4 text-sm font-medium text-black focus:border-[#022C22] focus:bg-white focus:outline-none transition-all"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-gray-700">Business Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <input
                        required
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-4 text-sm font-medium text-black focus:border-[#022C22] focus:bg-white focus:outline-none transition-all"
                        placeholder="e.g. Kigali, Nyarugenge"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-gray-700">Message (Optional)</label>
                    <div className="relative">
                      <MessageSquare className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={3}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-4 text-sm font-medium text-black focus:border-[#022C22] focus:bg-white focus:outline-none transition-all"
                        placeholder="Tell us more about your business..."
                      />
                    </div>
                  </div>
                </div>

                {error && <p className="text-center text-sm font-bold text-red-500">{error}</p>}

                <button
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full rounded-2xl bg-[#022C22] py-4 font-black text-white shadow-xl shadow-[#022C22]/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    "Submit Inquiry"
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 p-8 bg-gray-50/30">
            <p className="text-center text-xs text-gray-500">
              By submitting this form, you agree to Plas Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
