"use client";

import { useState } from "react";
import {
  X,
  Star,
  MapPin,
  Clock,
  DollarSign,
  Package,
  FileText,
  Download,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Truck,
  Calendar,
  User,
  Building,
  Phone,
  Mail,
} from "lucide-react";

interface QuoteDetailsModalProps {
  quote: any;
  isOpen: boolean;
  onClose: () => void;
  onAccept: (quoteId: string) => void;
  onReject: (quoteId: string) => void;
  onMessage: (supplierId: string) => void;
}

export function QuoteDetailsModal({
  quote,
  isOpen,
  onClose,
  onAccept,
  onReject,
  onMessage,
}: QuoteDetailsModalProps) {
  if (!isOpen || !quote) return null;

  const [activeTab, setActiveTab] = useState("overview");

  const handleAccept = () => {
    onAccept(quote.id);
  };

  const handleReject = () => {
    onReject(quote.id);
  };

  const handleMessage = () => {
    onMessage(quote.supplier.contact.email);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-8 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h2 className="mb-2 text-3xl font-bold">{quote.title}</h2>
              <p className="text-lg text-green-100">
                From: {quote.supplier.name}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleMessage}
                className="rounded-xl border border-white/30 bg-white/20 px-4 py-2 font-medium text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/30"
              >
                <MessageSquare className="mr-2 inline h-4 w-4" />
                Message Supplier
              </button>
              <button
                onClick={onClose}
                className="rounded-xl border border-white/30 bg-white/20 p-2 text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/30"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute right-0 top-0 h-32 w-32 -translate-y-16 translate-x-16 rounded-full bg-white/5"></div>
          <div className="absolute bottom-0 left-0 h-24 w-24 -translate-x-12 translate-y-12 rounded-full bg-white/5"></div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="space-y-8">
            <div className="rounded-2xl border border-gray-100 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <div className="flex space-x-2">
                {[
                  { id: "overview", label: "Overview", icon: FileText },
                  { id: "items", label: "Items", icon: Package },
                  { id: "supplier", label: "Supplier Info", icon: Building },
                  { id: "terms", label: "Terms & Conditions", icon: FileText },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium transition-all duration-300 ${
                      activeTab === tab.id
                        ? "scale-105 transform bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Quote Summary */}
                  <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <h3 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
                      Quote Summary
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Total Price
                        </span>
                        <span className="text-2xl font-bold text-green-600">
                          {quote.totalPrice}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Delivery Time
                        </span>
                        <span className="flex items-center gap-1 text-gray-900 dark:text-white">
                          <Truck className="h-4 w-4" />
                          {quote.deliveryTime}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Valid Until
                        </span>
                        <span className="flex items-center gap-1 text-gray-900 dark:text-white">
                          <Calendar className="h-4 w-4" />
                          {quote.validUntil}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Items Count
                        </span>
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                          {quote.items.length} items
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Status
                        </span>
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {quote.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Supplier Quick Info */}
                  <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <h3 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
                      Supplier Information
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                          <Building className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {quote.supplier.name}
                          </h4>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {quote.supplier.rating}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              •
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {quote.supplier.location}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {quote.supplier.contact.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {quote.supplier.contact.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {quote.supplier.contact.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {quote.notes && (
                  <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                      Notes
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {quote.notes}
                    </p>
                  </div>
                )}

                {/* Attachments */}
                {quote.attachments && quote.attachments.length > 0 && (
                  <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                      Attachments
                    </h3>
                    <div className="space-y-2">
                      {quote.attachments.map(
                        (attachment: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded border border-gray-200 p-2 dark:border-gray-700"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-900 dark:text-white">
                                {attachment}
                              </span>
                            </div>
                            <button className="rounded border border-gray-300 px-2 py-1 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "items" && (
              <div className="space-y-6">
                <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    Quote Items
                  </h3>
                  <div className="space-y-4">
                    {quote.items.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                      >
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {item.name}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {item.category}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {item.specifications}
                            </p>
                          </div>
                          <div className="space-y-1 text-right">
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {item.quantity} {item.unit}
                              </span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                @ ${item.unitPrice}
                              </span>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                ${item.totalPrice}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "supplier" && (
              <div className="space-y-6">
                <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    Supplier Details
                  </h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Company Information
                        </h4>
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Company Name:
                            </span>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {quote.supplier.name}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Address:
                            </span>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {quote.supplier.company.address}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Established:
                            </span>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {quote.supplier.company.established}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Employees:
                            </span>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {quote.supplier.company.employees}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Contact Information
                        </h4>
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Contact Person:
                            </span>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {quote.supplier.contact.name}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Email:
                            </span>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {quote.supplier.contact.email}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Phone:
                            </span>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {quote.supplier.contact.phone}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Location:
                            </span>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {quote.supplier.location}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "terms" && (
              <div className="space-y-6">
                <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    Terms & Conditions
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <div>
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Payment Terms:
                          </span>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {quote.terms.paymentTerms}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Delivery Terms:
                          </span>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {quote.terms.deliveryTerms}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Warranty:
                          </span>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {quote.terms.warranty}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Minimum Order:
                          </span>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {quote.terms.minimumOrder}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white p-8 dark:border-gray-700 dark:from-gray-800 dark:to-gray-700">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Submitted on{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {quote.submittedDate}
              </span>
            </div>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Quote ID:{" "}
              <span className="font-mono text-gray-900 dark:text-white">
                {quote.id}
              </span>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleReject}
              className="rounded-xl border-2 border-gray-200 px-6 py-3 font-medium text-gray-700 transition-all duration-300 hover:border-red-500 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Reject Quote
            </button>
            <button
              onClick={handleAccept}
              className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 font-medium text-white shadow-lg transition-all duration-300 hover:from-green-600 hover:to-emerald-600 hover:shadow-xl"
            >
              Accept Quote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
