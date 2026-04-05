import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency } from "../../lib/formatCurrency";
import { MapPin, Package, User, ChevronRight, Clock } from "lucide-react";

type PackageDelivery = {
  id: string;
  DeliveryCode: string;
  pickupLocation: string;
  dropoffLocation: string;
  status: string;
  delivery_fee: string;
  created_at: string;
  package_image?: string;
  receiverName?: string;
  receiverPhone?: string;
  comment?: string;
  deliveryMethod?: string;
  distance?: string;
};

interface UserRecentPackagesProps {
  packages: PackageDelivery[];
  loading: boolean;
  onRefresh?: () => void;
}

function timeAgo(timestamp: string): string {
  const now = Date.now();
  const past = new Date(timestamp).getTime();
  const diff = now - past;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function UserRecentPackages({
  packages = [],
  loading,
  onRefresh,
}: UserRecentPackagesProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const packagesPerPage = 4;
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPackages = packages.filter((pkg) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      (pkg.DeliveryCode || "").toLowerCase().includes(query) ||
      (pkg.pickupLocation || "").toLowerCase().includes(query) ||
      (pkg.dropoffLocation || "").toLowerCase().includes(query) ||
      (pkg.receiverName || "").toLowerCase().includes(query)
    );
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredPackages.length / packagesPerPage);
  const startIndex = (currentPage - 1) * packagesPerPage;
  const endIndex = startIndex + packagesPerPage;
  const visiblePackages = filteredPackages.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-700 dark:bg-gray-800/50"
          >
            <div className="flex gap-4">
              <div className="h-12 w-12 rounded-xl bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/4 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 rounded-full bg-gray-50 p-4 dark:bg-gray-800">
          <Package className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          No deliveries yet
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Your Plas Package history will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Premium Search & Actions Header */}
      <div className="mb-6 flex items-center gap-2.5">
        <div className="group relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Package className="h-4.5 w-4.5 text-gray-400 transition-colors duration-200 group-focus-within:text-green-500" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search deliveries (code, location, receiver)..."
            className="w-full rounded-2xl border border-gray-200 bg-white/50 py-3 pl-11 pr-10 text-sm shadow-sm backdrop-blur-md transition-all duration-300 placeholder:text-gray-400 focus:border-green-500/50 focus:bg-white focus:ring-4 focus:ring-green-500/5 dark:border-gray-700/50 dark:bg-gray-800/50 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-green-500/50 dark:focus:ring-green-500/10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 transition-colors hover:text-green-500"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="group flex h-[46px] w-[46px] items-center justify-center rounded-2xl border border-gray-200 bg-white/50 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-green-200 hover:bg-white hover:text-green-600 dark:border-gray-700/50 dark:bg-gray-800/50 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-green-400"
          >
            <Clock
              className={`h-5 w-5 transition-transform duration-700 ${
                loading ? "animate-spin" : "group-hover:rotate-180"
              }`}
            />
          </button>
        )}
      </div>

      <div className="grid gap-4">
        {visiblePackages.map((pkg) => (
          <Link
            key={pkg.id}
            href={`/CurrentPendingOrders/viewPackageDetails/${pkg.id}`}
            className={`group relative overflow-hidden rounded-2xl border bg-white p-5 transition-all hover:shadow-xl dark:bg-gray-800/40 ${
              pkg.status === "cancelled"
                ? "border-red-500/50 hover:border-red-500 dark:border-red-900/50 dark:hover:border-red-500"
                : "border-gray-100 hover:border-green-200 dark:border-gray-700 dark:hover:border-green-500"
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Package Icon/Image */}
              <div className="relative flex-shrink-0">
                {pkg.package_image ? (
                  <img
                    src={pkg.package_image}
                    alt="Plas Package"
                    className="h-14 w-14 rounded-xl object-cover shadow-sm ring-1 ring-gray-100 dark:ring-gray-700"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                    <Package className="h-7 w-7" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 rounded-full bg-white p-1 shadow-sm dark:bg-gray-800">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      pkg.status === "AWAITING_PAYMENT"
                        ? "bg-amber-400"
                        : pkg.status === "PENDING"
                        ? "bg-blue-400"
                        : pkg.status === "DELIVERED"
                        ? "bg-green-500"
                        : "bg-gray-400"
                    }`}
                  />
                </div>
              </div>

              {/* Info Column */}
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-mono text-xs font-black tracking-wider text-green-600 dark:text-green-400">
                    {pkg.DeliveryCode}
                  </span>
                  <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
                    {timeAgo(pkg.created_at)}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-gray-400" />
                    <p className="truncate text-xs font-bold text-gray-900 dark:text-white">
                      From:{" "}
                      <span className="font-normal text-gray-500 dark:text-gray-400">
                        {pkg.pickupLocation}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 flex h-3 w-3 shrink-0 items-center justify-center rounded-sm border border-gray-400 text-[8px] font-black text-gray-400">
                      TO
                    </div>
                    <p className="truncate text-xs font-bold text-gray-900 dark:text-white">
                      To:{" "}
                      <span className="font-normal text-gray-500 dark:text-gray-400">
                        {pkg.dropoffLocation}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3 dark:border-gray-700/50">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-gray-100 p-1 dark:bg-gray-700">
                      <User className="h-full w-full text-gray-400" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">
                      {pkg.receiverName || "Assigning Shopper..."}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-gray-900 dark:text-white">
                      {formatCurrency(parseFloat(pkg.delivery_fee))}
                    </p>
                    <p className="text-[9px] uppercase tracking-tighter text-gray-400">
                      {pkg.status.replace("_", " ")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Indicator */}
              <div className="flex h-14 items-center pl-2">
                <ChevronRight className="h-5 w-5 text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-green-500" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Premium Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition-all duration-300 hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700/50"
          >
            <ChevronRight className="h-5 w-5 rotate-180" />
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-medium transition-all duration-300 ${
                      currentPage === page
                        ? "scale-110 border-transparent bg-gradient-to-br from-green-500 to-green-600 !text-white shadow-lg shadow-green-500/30"
                        : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-gray-200"
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return (
                  <span key={page} className="text-gray-400">
                    ...
                  </span>
                );
              }
              return null;
            })}
          </div>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition-all duration-300 hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700/50"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
