import RootLayout from "@components/ui/layout";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button, Loader } from "rsuite";
import Link from "next/link";
import { AuthGuard } from "@components/AuthGuard";
import { useTheme } from "../../../src/context/ThemeContext";
import Image from "next/image";
import ContactSupportModal from "@components/UserCarts/orders/ContactSupportModal";
import FeedbackModal from "@components/UserCarts/orders/FeedbackModal";
import {
  Package,
  MapPin,
  User,
  Phone,
  Clock,
  ChevronLeft,
  Calendar,
  Navigation,
  Info,
  CreditCard,
  Copy,
  Check,
  MessageSquare,
  Star,
  LifeBuoy,
  Bike,
  Truck,
  Footprints,
  Car,
} from "lucide-react";

// Helper to display timestamps as relative time ago
function timeAgo(timestamp: string): string {
  if (!timestamp) return "Unknown";
  try {
    const now = Date.now();
    const past = new Date(timestamp).getTime();
    if (isNaN(past)) return new Date().toLocaleDateString();
    const diffInSeconds = Math.floor((now - past) / 1000);
    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  } catch (error) {
    return new Date().toLocaleDateString();
  }
}

// Delivery Method Configuration
const getDeliveryMethodInfo = (method: string) => {
  const m = method?.toLowerCase() || "car";
  switch (m) {
    case "foot":
      return { label: "On Foot", icon: <Footprints className="h-4 w-4" /> };
    case "bicycle":
      return { label: "Bicycle", icon: <Bike className="h-4 w-4" /> };
    case "motorbike":
      return { label: "Motorbike", icon: <Bike className="h-4 w-4" /> };
    case "car":
      return { label: "Car", icon: <Car className="h-4 w-4" /> };
    default:
      return {
        label: method || "Standard",
        icon: <Truck className="h-4 w-4" />,
      };
  }
};

// Package Status Configuration
const getPackageStatusInfo = (status: string) => {
  const s = status?.toLowerCase() || "pending";
  switch (s) {
    case "delivered":
      return {
        label: "Delivered",
        color:
          "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400",
        icon: <Package className="h-5 w-5" />,
        description: "Package delivered successfully",
      };
    case "on_the_way":
    case "picked_up":
      return {
        label: "On the Way",
        color:
          "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
        icon: <Navigation className="h-5 w-5" />,
        description: "Package is on the way for delivery",
      };
    case "accepted":
      return {
        label: "Accepted",
        color:
          "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400",
        icon: <User className="h-5 w-5" />,
        description: "Plasa has accepted and is heading to pickup",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        color: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400",
        icon: <Info className="h-5 w-5" />,
        description: "This delivery has been cancelled",
      };
    case "awaiting_payment":
      return {
        label: "Awaiting Payment",
        color:
          "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400",
        icon: <CreditCard className="h-5 w-5" />,
        description: "Payment is required to process",
      };
    default:
      return {
        label: "PENDING",
        color:
          "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400",
        icon: <Clock className="h-5 w-5" />,
        description: "Waiting for Plasa assignment",
      };
  }
};

const formatLocationDetails = (details: any) => {
  if (!details) return null;

  let data = details;
  if (typeof details === "string" && details.startsWith("{")) {
    try {
      data = JSON.parse(details);
    } catch (e) {
      return details;
    }
  }

  if (typeof data === "object" && data !== null) {
    const parts = [];
    if (data.gateNumber) parts.push(`Gate ${data.gateNumber}`);
    if (data.gateColor) parts.push(`${data.gateColor} gate`);
    return parts.length > 0 ? parts.join(", ") : null;
  }

  return typeof data === "string" ? data : null;
};

// --- Skeleton Loader Components ---

const Skeleton = ({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`animate-pulse rounded-md bg-slate-200 dark:bg-slate-700 ${className}`}
    {...props}
  />
);

const PackageDetailsSkeleton = () => (
  <div className="min-h-screen bg-gray-50 pb-20 dark:bg-black md:pb-10">
    {/* Header Skeleton - Full Bleed */}
    <div className="relative h-52 w-full animate-pulse overflow-hidden bg-slate-200 dark:bg-slate-800 md:h-80">
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />

      {/* Back Button Skeleton */}
      <div className="absolute left-6 top-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
        <div className="h-5 w-5 rounded-full bg-white/30" />
      </div>

      {/* Floating Pill Skeleton */}
      <div className="absolute left-1/2 top-10 -translate-x-1/2">
        <Skeleton className="h-10 w-40 rounded-full bg-white/20 backdrop-blur-md" />
      </div>

      {/* Title & Badge Skeleton */}
      <div className="absolute bottom-10 left-6 right-6">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-10 w-48 bg-white/30" />
            <Skeleton className="h-4 w-32 bg-white/20" />
          </div>
          <Skeleton className="h-12 w-24 rounded-2xl bg-white/20 md:h-16 md:w-40" />
        </div>
      </div>
    </div>

    {/* Content Skeleton */}
    <div className="container relative z-20 mx-auto mt-6 px-4 md:px-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Action Row */}
          <div className="flex gap-3">
            <Skeleton className="h-12 w-48 rounded-xl" />
            <Skeleton className="h-12 w-48 rounded-xl" />
          </div>

          {/* Status Card */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
            <Skeleton className="mt-4 h-4 w-full" />
          </div>

          {/* Trip Details Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <Skeleton className="mb-6 h-6 w-32" />
            <div className="space-y-8">
              <div className="flex gap-4">
                <Skeleton className="h-5 w-5 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-full" />
                </div>
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-5 w-5 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-full" />
                </div>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <Skeleton className="mb-4 h-6 w-40" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-14 w-14 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <Skeleton className="mb-6 h-6 w-32" />
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

function PackageDetailsPage() {
  const router = useRouter();
  const { packageId } = router.query;
  const [pkg, setPkg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();

  const [copied, setCopied] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState(false);
  const [supportModal, setSupportModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hasExistingRating, setHasExistingRating] = useState(false);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedbackSubmit = async (
    ratings: {
      rating: number;
      packaging_quality: number;
      delivery_experience: number;
      professionalism: number;
    },
    comment: string
  ) => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/ratings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: pkg?.id,
          shopper_id: pkg?.shopper?.id || pkg?.shopper_id,
          rating: ratings.rating.toString(),
          review: comment,
          delivery_experience: ratings.delivery_experience.toString(),
          packaging_quality: ratings.packaging_quality.toString(),
          professionalism: ratings.professionalism.toString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit feedback");
      }

      setFeedbackModal(false);
      setHasExistingRating(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Feedback failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!packageId || !router.isReady) return;

    async function fetchDetails() {
      try {
        setLoading(true);
        const res = await fetch(`/api/queries/package-details?id=${packageId}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to fetch package details");
        }
        const data = await res.json();
        setPkg(data.package);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [packageId, router.isReady]);

  if (loading) {
    return <PackageDetailsSkeleton />;
  }

  if (error || !pkg) {
    return (
      <RootLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="rounded-2xl bg-red-50 p-8 dark:bg-red-900/10">
            <h2 className="text-2xl font-bold text-red-600">Error</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {error || "Package not found"}
            </p>
            <Button
              appearance="primary"
              color="red"
              className="mt-6"
              onClick={() => router.back()}
            >
              Go Back
            </Button>
          </div>
        </div>
      </RootLayout>
    );
  }

  const statusInfo = getPackageStatusInfo(pkg.status);

  return (
    <AuthGuard requireAuth={true}>
      <RootLayout>
        <div className="min-h-screen pb-20 md:pb-10">
          {/* Header Section - Full Bleed on Mobile, Contained on Desktop */}
          <div className="md:container md:mx-auto md:px-8 md:pt-4">
            <div className="relative h-52 w-full overflow-hidden shadow-2xl md:h-80 md:rounded-3xl">
              <Image
                src={pkg.package_image || "/images/package-placeholder.jpg"}
                alt="Package"
                fill
                className="object-cover"
                priority
              />
              {/* Dual Gradient Overlays for Readability */}
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              {/* Back Button */}
              <button
                onClick={() => router.back()}
                className="absolute left-6 top-6 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-xl transition-all hover:scale-110 hover:bg-white/30 active:scale-95"
              >
                <ChevronLeft className="h-6 w-6 text-white" />
              </button>

              {/* Shopper Header Pill (if assigned) */}
              {pkg.shopper && (
                <div className="absolute left-1/2 top-6 z-20 -translate-x-1/2">
                  <div className="flex items-center gap-3 rounded-full bg-black/40 px-3 py-1.5 shadow-2xl ring-1 ring-white/20 backdrop-blur-xl">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-500 !text-white shadow-lg">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 pr-1">
                      <p className="text-[9px] font-bold uppercase leading-none tracking-widest !text-white/60">
                        Plasa
                      </p>
                      <p className="mt-0.5 truncate text-[11px] font-black !text-white">
                        {pkg.shopper.full_name}
                      </p>
                    </div>
                    <a
                      href={`tel:${
                        pkg.shopper.phone_number || pkg.shopper.phone
                      }`}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500 !text-white shadow-lg transition-transform hover:scale-110 active:scale-90"
                    >
                      <Phone className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              )}

              {/* Title & Code Badge on Image */}
              <div className="absolute bottom-10 left-6 right-6 z-10">
                <div className="flex items-end justify-between gap-4">
                  <div className="min-w-0">
                    <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-md md:text-5xl md:font-black">
                      Plas Package
                    </h1>
                    <div className="mt-1 flex items-center gap-2 text-xs font-medium text-white/90 drop-shadow-sm md:mt-2 md:text-sm">
                      <Clock className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      Created {timeAgo(pkg.created_at)}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <button
                      onClick={() =>
                        handleCopyCode(
                          pkg.DeliveryCode || pkg.id.slice(0, 8).toUpperCase()
                        )
                      }
                      className="group relative inline-flex transform items-center gap-2 rounded-2xl bg-white/10 px-3 py-1.5 text-sm font-bold tracking-widest !text-white shadow-2xl ring-1 ring-white/30 backdrop-blur-xl transition-all hover:scale-105 active:scale-95 md:px-6 md:py-3 md:text-xl"
                    >
                      {pkg.DeliveryCode || pkg.id.slice(0, 8).toUpperCase()}
                      {copied ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4 text-white/50 transition-colors group-hover:text-white" />
                      )}

                      {/* Tooltip */}
                      {copied && (
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 rounded-lg bg-green-500 px-2 py-1 text-[10px] font-bold text-white shadow-lg animate-in fade-in slide-in-from-top-1">
                          COPIED
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="container relative z-20 mx-auto mt-6 px-4 md:px-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Left Column: Status & Route */}
              <div className="space-y-6 lg:col-span-2">
                {/* Action Row: Support / Feedback / Message */}
                <div className="flex flex-wrap items-center gap-3">
                  {pkg.status === "delivered" ? (
                    <Button
                      appearance="primary"
                      className="flex items-center gap-2 !rounded-xl !bg-green-500 !px-6 !py-3 font-black !text-white transition-all hover:!bg-green-600 hover:shadow-lg active:scale-95"
                      onClick={() => setFeedbackModal(true)}
                    >
                      <Star className="h-4 w-4" />
                      Rate Service & Feedback
                    </Button>
                  ) : (
                    <Button
                      appearance="primary"
                      className="flex items-center gap-2 !rounded-xl !bg-indigo-500 !px-6 !py-3 font-black !text-white transition-all hover:!bg-indigo-600 hover:shadow-lg active:scale-95"
                      onClick={() => setSupportModal(true)}
                    >
                      <LifeBuoy className="h-4 w-4" />
                      Contact Support
                    </Button>
                  )}
                </div>

                <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">Delivery Status</h3>
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold ${statusInfo.color}`}
                    >
                      {statusInfo.icon}
                      {statusInfo.label}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {statusInfo.description}
                  </p>
                </div>

                {/* Route Card */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                  <h3 className="mb-6 text-lg font-bold">Trip Details</h3>

                  <div className="relative space-y-8">
                    {/* Vertical Line */}
                    <div className="absolute bottom-4 left-2.5 top-4 w-0.5 bg-gray-100 dark:bg-gray-800" />

                    {/* Pickup */}
                    <div className="relative flex gap-4">
                      <div className="z-10 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 ring-4 ring-green-100 dark:ring-green-900/30">
                        <div className="h-2 w-2 rounded-full bg-white" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                          Pickup
                        </p>
                        <p className="mt-1 font-medium">{pkg.pickupLocation}</p>
                        {formatLocationDetails(pkg.pickupDetials) && (
                          <p className="mt-1 text-sm italic text-gray-500">
                            “{formatLocationDetails(pkg.pickupDetials)}”
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Dropoff */}
                    <div className="relative flex gap-4">
                      <div className="z-10 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 ring-4 ring-orange-100 dark:ring-orange-900/30">
                        <MapPin className="h-3 w-3 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                          Dropoff
                        </p>
                        <p className="mt-1 font-medium">
                          {pkg.dropoffLocation}
                        </p>
                        {formatLocationDetails(pkg.dropoffDetails) && (
                          <p className="mt-1 text-sm italic text-gray-500">
                            “{formatLocationDetails(pkg.dropoffDetails)}”
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-4">
                    <div className="flex flex-1 items-center gap-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm dark:bg-gray-800">
                        <Navigation className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">
                          Estimated Distance
                        </p>
                        <p className="font-bold">
                          {pkg.distance
                            ? `${pkg.distance} km`
                            : "Calculating..."}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-1 items-center gap-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm dark:bg-gray-800">
                        {getDeliveryMethodInfo(pkg.deliveryMethod).icon}
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Delivery Method</p>
                        <p className="font-bold">
                          {getDeliveryMethodInfo(pkg.deliveryMethod).label}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comment Section if exists */}
                {pkg.comment && (
                  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <h3 className="flex items-center gap-2 text-lg font-bold">
                      <Info className="h-5 w-5 text-gray-400" />
                      Extra Instructions
                    </h3>
                    <p className="mt-3 text-gray-600 dark:text-gray-400">
                      {pkg.comment}
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column: Receiver & Payment */}
              <div className="space-y-6">
                {/* Shopper Info (if assigned) */}
                {pkg.shopper && (
                  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <h3 className="mb-4 text-lg font-bold text-green-600 dark:text-green-400">
                      Assigned Plasa
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-green-100 dark:border-green-900/30">
                        <Image
                          src={
                            pkg.shopper.profile_photo ||
                            "/images/avatar-placeholder.jpg"
                          }
                          alt={pkg.shopper.full_name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-gray-900 dark:text-white">
                          {pkg.shopper.full_name}
                        </p>
                        <a
                          href={`tel:${
                            pkg.shopper.phone_number || pkg.shopper.phone
                          }`}
                          className="mt-1 flex items-center gap-2 text-sm font-medium text-green-600 transition-colors hover:text-green-700"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          {pkg.shopper.phone_number || pkg.shopper.phone}
                        </a>
                      </div>
                      {pkg.shopper.active && (
                        <div className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-[10px] font-bold text-green-600 dark:bg-green-900/20">
                          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                          ONLINE
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Receiver Info */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                  <h3 className="mb-4 text-lg font-bold">Receiver</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                      <User className="h-6 w-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-bold">{pkg.receiverName}</p>
                      <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                        <Phone className="h-3 w-3" />
                        {pkg.receiverPhone}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                  <h3 className="mb-4 text-lg font-bold">Payment Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Delivery Fee</span>
                      <span className="font-medium">
                        {pkg.delivery_fee.toLocaleString()} RWF
                      </span>
                    </div>
                    <div className="border-t border-gray-100 pt-3 dark:border-gray-800">
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-black tracking-tight">
                          Total Amount
                        </p>
                        <p className="text-xl font-black text-green-600">
                          {pkg.delivery_fee.toLocaleString()} RWF
                        </p>
                      </div>
                    </div>
                  </div>

                  {pkg.status === "AWAITING_PAYMENT" && (
                    <Button
                      appearance="primary"
                      color="green"
                      block
                      size="lg"
                      className="mt-6 font-bold shadow-lg shadow-green-500/20"
                    >
                      Pay Now
                    </Button>
                  )}
                </div>

                {/* Date Created */}
                <div className="flex items-center gap-3 rounded-2xl border border-dashed border-gray-200 p-4 dark:border-gray-800">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Order Placed</p>
                    <p className="text-sm font-medium">
                      {new Date(pkg.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <FeedbackModal
          isOpen={feedbackModal}
          onClose={() => setFeedbackModal(false)}
          onSubmit={handleFeedbackSubmit}
          submitting={submitting}
          submitError={submitError}
        />

        <ContactSupportModal
          isOpen={supportModal}
          onClose={() => setSupportModal(false)}
          orderId={pkg.id}
        />
      </RootLayout>
    </AuthGuard>
  );
}

export default PackageDetailsPage;
