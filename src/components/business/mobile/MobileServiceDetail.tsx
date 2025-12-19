"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  ChevronLeft,
  Search,
  MapPin,
  Phone,
  Mail,
  Package,
  DollarSign,
  Calendar,
  User,
  FileText,
  MessageSquare,
  Store,
} from "lucide-react";

interface MobileServiceDetailProps {
  serviceId?: string;
  serviceName?: string;
  onBack?: () => void;
}

export function MobileServiceDetail({
  serviceId,
  serviceName,
  onBack,
}: MobileServiceDetailProps) {
  const router = useRouter();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"details" | "contact">("details");

  useEffect(() => {
    if (serviceId) {
      fetchServiceDetails();
    } else {
      setLoading(false);
    }
  }, [serviceId]);

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      // Fetch service details from API
      const response = await fetch(`/api/queries/business-services?id=${serviceId}`);
      if (response.ok) {
        const data = await response.json();
        setService(data.services?.[0] || data.service || null);
      }
    } catch (error) {
      console.error("Error fetching service details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleRequestQuote = () => {
    if (service?.id) {
      router.push(`/plasBusiness/rfqs/create?serviceId=${service.id}`);
    } else {
      router.push("/plasBusiness?createRFQ=true");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-gray-800 overflow-hidden">
        <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={handleBack}
              className="p-2 -ml-2 text-gray-600 dark:text-gray-300"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              Service Details
            </h1>
            <div className="w-10"></div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const displayService = service || {
    name: serviceName || "Service Details",
    description: "Service description will be displayed here.",
    price: "Contact for pricing",
    category: "Business Service",
    location: "Location not specified",
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors active:scale-95"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            Service Details
          </h1>
          <button className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors active:scale-95">
            <Search className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-2.5">
          <button
            onClick={() => setActiveTab("details")}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === "details"
                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md"
                : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-600 hover:bg-gray-50 dark:hover:bg-gray-600"
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab("contact")}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === "contact"
                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md"
                : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-600 hover:bg-gray-50 dark:hover:bg-gray-600"
            }`}
          >
            Contact
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        {activeTab === "details" ? (
          <div className="px-4 py-6 space-y-6">
            {/* Service Image/Icon */}
            <div className="w-full h-56 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center overflow-hidden shadow-lg ring-1 ring-gray-200 dark:ring-gray-600">
              {displayService.Image ? (
                <img
                  src={displayService.Image}
                  alt={displayService.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-white dark:bg-gray-600 flex items-center justify-center shadow-md">
                  <Package className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                </div>
              )}
            </div>

            {/* Service Name */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {displayService.name}
              </h2>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm font-medium">
                  {displayService.category || "Business Service"}
                </span>
              </div>
            </div>

            {/* Price */}
            {displayService.price && (
              <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 rounded-xl p-5 border border-green-200 dark:border-green-800/50 shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30">
                    <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Price</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {displayService.price} {displayService.unit ? `/ ${displayService.unit}` : ""}
                </p>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Description
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {displayService.Description || displayService.description || "No description available."}
              </p>
            </div>

            {/* Service Details Grid */}
            <div className="grid grid-cols-2 gap-3">
              {displayService.location && (
                <div className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-600">
                      <MapPin className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Location</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {displayService.location}
                  </p>
                </div>
              )}
              {displayService.delveryArea && (
                <div className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-600">
                      <MapPin className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Delivery Area</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {displayService.delveryArea}
                  </p>
                </div>
              )}
              {displayService.minimumOrders && (
                <div className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-600">
                      <Package className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Min Order</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {displayService.minimumOrders}
                  </p>
                </div>
              )}
              {displayService.speciality && (
                <div className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-600">
                      <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Speciality</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {displayService.speciality}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleRequestQuote}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
              >
                <MessageSquare className="h-5 w-5" />
                Request Quote
              </button>
              <button
                onClick={() => setActiveTab("contact")}
                className="flex-1 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold py-3.5 px-4 rounded-xl transition-all duration-200 hover:border-green-400 dark:hover:border-green-600 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm hover:shadow-md active:scale-95"
              >
                Contact Supplier
              </button>
            </div>
          </div>
        ) : (
          <div className="px-4 py-6">
            <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 border border-gray-200 dark:border-gray-600 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Contact Supplier
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Get in touch with the service provider:
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center shadow-sm">
                    <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      Phone
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                      {displayService.phone || "Not available"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center shadow-sm">
                    <Mail className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      Email
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                      {displayService.email || "Not available"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => router.push("/Messages")}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
                >
                  <MessageSquare className="h-5 w-5" />
                  Send Message
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
