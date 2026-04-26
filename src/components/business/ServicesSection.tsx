"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Eye,
  MessageSquare,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  MapPin,
  User,
  Star,
  Phone,
  Mail,
  ArrowRight,
  X,
  Package,
} from "lucide-react";
import toast from "react-hot-toast";
import { formatCurrencySync } from "../../utils/formatCurrency";

interface ServicesSectionProps {
  onRequestQuotation?: (serviceId: string) => void;
  guestMode?: boolean;
  onGuestAction?: () => void;
}

export function ServicesSection({
  onRequestQuotation,
  guestMode,
  onGuestAction,
}: ServicesSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("business-modal-toggle", { detail: isServiceModalOpen })
    );
  }, [isServiceModalOpen]);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/queries/business-services");
      if (response.ok) {
        const data = await response.json();
        setServices(data.services || []);
      } else {
        setServices([]);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  // Extract unique categories from services
  const categories = [
    "all",
    ...Array.from(
      new Set(
        services.map((s) => s.category || s.service_category).filter(Boolean)
      )
    ),
  ];

  const filteredServices = services.filter((service) => {
    const serviceName = service.name || service.service_name || "";
    const serviceDescription =
      service.description || service.service_description || "";
    const providerName = service.provider_name || service.business_name || "";
    const serviceCategory = service.category || service.service_category || "";

    const matchesSearch =
      serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      serviceDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      providerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || serviceCategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleViewService = (service: any) => {
    setSelectedService(service);
    setIsServiceModalOpen(true);
  };

  const handleRequestQuotation = (serviceId: string) => {
    if (onRequestQuotation) {
      onRequestQuotation(serviceId);
    } else {
      toast.success(
        "Quotation request sent! The service provider will contact you soon."
      );
      setIsServiceModalOpen(false);
    }
  };

  const handleContactProvider = (service: any) => {
    // Open contact options
    toast.success(`Contacting ${service.provider}...`);
  };

  return (
    <div className="space-y-6">
      {/* Simplified Search & Category System */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-xl flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Filter by name, provider or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white/50 py-3 pl-10 pr-4 text-sm font-medium text-[var(--text-primary)] backdrop-blur-sm transition-all focus:border-green-500/50 focus:outline-none focus:ring-4 focus:ring-green-500/10 dark:border-gray-700 dark:bg-gray-800/50"
          />
        </div>

        <div className="scrollbar-hide flex gap-2 overflow-x-auto">
          {categories.slice(0, 8).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                selectedCategory === category
                  ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
                  : "border border-gray-200 bg-white/50 text-gray-500 hover:bg-white dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-700"
              }`}
            >
              {category === "all" ? "Explore All" : category}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:p-6"
            >
              <div className="mb-3 h-6 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="mb-4 h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="mb-4 space-y-2">
                <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
              </div>
              <div className="h-10 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
          ))}
        </div>
      ) : (
        /* Services Grid */
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => {
            const serviceName =
              service.name || service.service_name || "Unnamed Service";
            const serviceDescription =
              service.description || service.service_description || "";
            const providerName =
              service.provider_name ||
              service.business_name ||
              "Unknown Provider";
            const serviceCategory =
              service.category || service.service_category || "Uncategorized";
            const location =
              service.location || service.service_location || "Not specified";
            const priceRange =
              service.price_range ||
              service.priceRange ||
              "Contact for pricing";
            const rating = service.rating || service.average_rating || 0;
            const serviceId = service.id || service.service_id;

            return (
              <div
                key={serviceId}
                className="group relative rounded-2xl border border-gray-200 bg-white p-4 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800 sm:p-6"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                      {serviceName}
                    </h3>
                    <p className="mb-2 text-xs font-medium text-green-600 dark:text-green-400">
                      {serviceCategory}
                    </p>
                  </div>
                  {rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                  {serviceDescription}
                </p>

                <div className="mb-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <User className="h-3.5 w-3.5" />
                    <span>{providerName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <DollarSign className="h-3.5 w-3.5" />
                    <span>{priceRange}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewService(service)}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    <Eye className="mr-1 inline h-4 w-4" />
                    View Details
                  </button>
                  <button
                    onClick={() =>
                      guestMode
                        ? onGuestAction?.()
                        : handleRequestQuotation(serviceId)
                    }
                    className="flex-1 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-sm font-medium text-white transition-all hover:from-green-600 hover:to-emerald-600"
                    style={{ color: "#ffffff" }}
                  >
                    {guestMode ? "Sign in to Request" : "Request Quote"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredServices.length === 0 && (
        <div className="py-12 text-center">
          <Search className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
            No services found
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* Service Details Modal */}
      {isServiceModalOpen && selectedService && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[var(--bg-primary)]">
          <div
            className="relative flex h-screen w-screen flex-col overflow-hidden bg-[var(--bg-primary)] shadow-2xl transition-all duration-500"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative flex-shrink-0 overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-8">
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3%3Cfilter id='noiseFilter'%3%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
              ></div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-white sm:text-3xl">
                    {selectedService.name ||
                      selectedService.service_name ||
                      "Service Details"}
                  </h3>
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
                    <Star className="h-3 w-3 fill-white" />
                    <span>{selectedService.rating || "New Service"}</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsServiceModalOpen(false)}
                  className="rounded-full bg-white/10 p-2 text-white transition-all hover:bg-white/20 active:scale-95"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto bg-[var(--bg-primary)] p-6 sm:p-10">
              <div className="mx-auto max-w-4xl space-y-8">
                {/* Provider Card */}
                <div className="bg-[var(--bg-secondary)]/30 rounded-2xl border border-[var(--bg-secondary)] p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 text-green-600 dark:bg-green-400/10 dark:text-green-400">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-50">
                        Provider
                      </h4>
                      <p className="text-sm font-black text-[var(--text-primary)]">
                        {selectedService.provider_name ||
                          selectedService.business_name ||
                          "Enterprise Provider"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="mb-3 text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">
                    Overview
                  </h4>
                  <p className="text-base font-medium leading-relaxed text-[var(--text-primary)] opacity-80">
                    {selectedService.description ||
                      selectedService.service_description ||
                      "No description available"}
                  </p>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      label: "Category",
                      value: selectedService.category || "General",
                      icon: Package,
                    },
                    {
                      label: "Budget Range",
                      value: selectedService.price_range || "Contact",
                      icon: DollarSign,
                    },
                    {
                      label: "Location",
                      value: selectedService.location || "Rwanda Wide",
                      icon: MapPin,
                    },
                    {
                      label: "Response",
                      value: selectedService.response_time || "Fast",
                      icon: Clock,
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="bg-[var(--bg-secondary)]/30 rounded-2xl border border-[var(--bg-secondary)] p-4"
                    >
                      <div className="mb-2 flex items-center justify-between text-green-600 dark:text-green-400">
                        <item.icon className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">
                          {item.label}
                        </span>
                      </div>
                      <div className="text-sm font-black text-[var(--text-primary)]">
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Contact Area */}
                {(selectedService.contact ||
                  selectedService.email ||
                  selectedService.phone) && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">
                      Direct Engagement
                    </h4>
                    <div className="grid gap-3">
                      {selectedService.contact && (
                        <div className="bg-[var(--bg-secondary)]/20 flex items-center gap-3 rounded-xl p-3 text-sm font-medium text-[var(--text-primary)]">
                          <Phone className="h-4 w-4 text-blue-500" />
                          <span>{selectedService.contact}</span>
                        </div>
                      )}
                      {selectedService.email && (
                        <div className="bg-[var(--bg-secondary)]/20 flex items-center gap-3 rounded-xl p-3 text-sm font-medium text-[var(--text-primary)]">
                          <Mail className="h-4 w-4 text-purple-500" />
                          <span>{selectedService.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex-shrink-0 border-t border-[var(--bg-secondary)] bg-[var(--bg-primary)] p-6 sm:px-8">
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() =>
                    guestMode
                      ? onGuestAction?.()
                      : handleContactProvider(selectedService)
                  }
                  className="group flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--bg-secondary)] bg-[var(--bg-primary)] px-6 py-4 text-sm font-bold text-[var(--text-primary)] transition-all hover:bg-[var(--bg-secondary)] active:scale-95"
                >
                  <MessageSquare className="mr-2 inline h-4 w-4 text-green-600" />
                  {guestMode ? "Sign in to Contact" : "Contact Provider"}
                </button>
                <button
                  onClick={() =>
                    guestMode
                      ? onGuestAction?.()
                      : handleRequestQuotation(selectedService.id)
                  }
                  className="group flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 text-sm font-black text-white shadow-lg shadow-green-500/30 transition-all hover:from-green-700 active:scale-95"
                  style={{ color: "#ffffff" }}
                >
                  <span style={{ color: "#ffffff" }}>
                    {guestMode ? "Sign in to Request" : "Request Quotation"}
                  </span>
                  <ArrowRight
                    className="ml-2 inline h-4 w-4 transition-transform group-hover:translate-x-1"
                    style={{ color: "#ffffff" }}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
