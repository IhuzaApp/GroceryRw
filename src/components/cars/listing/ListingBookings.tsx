"use client";

import React from "react";
import {
  MapPin,
  Calendar,
  CheckCircle2,
  MessageSquare,
  X,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Camera,
  Check,
  Eye
} from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import { formatCurrencySync } from "../../../utils/formatCurrency";
import CameraCapture from "../../ui/CameraCapture";
import { uploadToFirebase } from "../../../lib/firebase";

interface ListingBookingsProps {
  bookings: any[];
}

export default function ListingBookings({ bookings }: ListingBookingsProps) {
  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[3rem] bg-gray-100 text-gray-400 shadow-inner dark:bg-white/5">
          <Calendar className="h-12 w-12" />
        </div>
        <h3 className="mb-2 font-outfit text-2xl font-black">
          Start your journey
        </h3>
        <p className="mx-auto mb-10 max-w-sm font-medium text-gray-500">
          You haven't booked any vehicles yet. Explore Rwanda with our premium
          rental selection.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {bookings.map((booking, index) => (
        <BookingCard key={`${booking.bookingId || index}-${index}`} booking={booking} />
      ))}
    </div>
  );
}

function BookingCard({ booking }: { booking: any }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isConfirmingPickup, setIsConfirmingPickup] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const statusLabel = useMemo(() => {
    switch (booking.status) {
      case "PAID": return "Booked";
      case "approved": return "Waiting for Pickup";
      case "picked_up": return "Active Ride";
      case "COMPLETED": return "Completed";
      case "CANCELLED": return "Cancelled";
      default: return booking.status || "Confirmed";
    }
  }, [booking.status]);

  const cancellationDetails = useMemo(() => {
    const total = parseFloat(booking.total || "0");
    const isAccepted = booking.status === "approved" || booking.status === "picked_up";
    const feePercent = isAccepted ? 0.05 : 0.02;
    const feeAmount = total * feePercent;
    const refundAmount = total - feeAmount;

    return {
      total,
      feePercent: feePercent * 100,
      feeAmount,
      refundAmount,
      isAccepted,
    };
  }, [booking.total, booking.status]);

  const canCancel = useMemo(() => {
    if (booking.status === "CANCELLED" || booking.status === "picked_up" || booking.status === "COMPLETED") return false;
    
    const now = new Date();
    const pickupDate = new Date(booking.pickup_date);
    const returnDate = new Date(booking.return_date);
    
    const pickup6AM = new Date(pickupDate);
    pickup6AM.setHours(6, 0, 0, 0);

    const durationDays = Math.ceil((returnDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24));
    const hoursToPickup = (pickup6AM.getTime() - now.getTime()) / (1000 * 60 * 60);
    const daysToPickup = hoursToPickup / 24;

    if (durationDays > 3) {
      if (daysToPickup <= 2 && daysToPickup > 0) return false;
    } else {
      if (hoursToPickup <= 12 && hoursToPickup > 0) return false;
    }

    if (now > pickup6AM) return false;

    return true;
  }, [booking.status, booking.pickup_date, booking.return_date]);

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      const res = await fetch("/api/mutations/cancel-car-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.bookingId }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(`Refunded: ${formatCurrencySync(data.refundAmount)}`);
        setShowCancelModal(false);
        // Page will refresh via CarListing interval
      } else {
        toast.error(data.error || "Failed to cancel booking");
      }
    } catch (error) {
      console.error("Cancellation error:", error);
      toast.error("An error occurred while cancelling.");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleConfirmPickup = () => {
    setIsCameraOpen(true);
  };

  const handlePickupVideoCapture = async (videoUrl: string) => {
    const loadingToast = toast.loading("Uploading pickup confirmation video...");
    setIsConfirmingPickup(true);
    try {
      // 1. Fetch blob
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const file = new File([blob], `pickup_${booking.bookingId}.webm`, { type: "video/webm" });

      // 2. Upload to Firebase
      const storagePath = `bookings/${booking.bookingId}/pickup_video.webm`;
      const downloadUrl = await uploadToFirebase(file, storagePath);

      // 3. API call
      const res = await fetch("/api/mutations/confirm-pickup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          bookingId: booking.bookingId,
          carVideo_Status: downloadUrl 
        }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Pickup confirmed! Ride is now active.", { id: loadingToast });
        window.location.reload(); // Refresh to update status
      } else {
        toast.error(data.error || "Failed to confirm pickup", { id: loadingToast });
      }
    } catch (error) {
      console.error("Pickup confirmation error:", error);
      toast.error("An error occurred during pickup.", { id: loadingToast });
    } finally {
      setIsConfirmingPickup(false);
      setIsCameraOpen(false);
    }
  };

  return (
    <div className="contents">
      <div className="group relative flex h-full flex-col overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white p-5 shadow-sm transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] dark:border-white/5 dark:bg-[#121212]">
        <div className="relative mb-4 h-48 w-full overflow-hidden rounded-[2rem]">
          <img
            src={booking.image}
            alt={booking.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div
            className={`absolute right-4 top-4 flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[10px] font-black uppercase shadow-lg backdrop-blur-md ${
              booking.status === "CANCELLED"
                ? "bg-red-500/90 text-white"
                : booking.status === "approved"
                ? "bg-blue-500/90 text-white"
                : booking.status === "picked_up"
                ? "bg-purple-500/90 text-white"
                : "bg-white/90 text-green-500 dark:bg-black/80"
            }`}
          >
            {booking.status === "CANCELLED" ? (
              <CheckCircle2 className="h-3 w-3 rotate-45" />
            ) : (
              <CheckCircle2 className="h-3 w-3" />
            )}
            {statusLabel}
          </div>
        </div>

        <div className="flex-1">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex flex-col">
              <h4 className="font-outfit text-lg font-black text-gray-900 dark:text-white">
                {booking.name}
              </h4>
              {booking.platNumber && (
                <span className="w-fit rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-black tracking-wider text-gray-500 dark:bg-white/10 dark:text-gray-400">
                  {booking.platNumber}
                </span>
              )}
            </div>
            <div className="flex flex-col items-end">
              <span className="font-outfit text-xl font-black text-green-500">
                {formatCurrencySync(booking.total)}
              </span>
              {booking.securityDeposit > 0 && (
                <span className="text-[10px] font-bold text-gray-400">
                  +{formatCurrencySync(booking.securityDeposit)} Deposit
                </span>
              )}
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 rounded-2xl bg-gray-50 p-3 dark:bg-white/5">
              <div className="rounded-lg bg-green-500/10 p-1.5">
                <MapPin className="h-4 w-4 text-green-500" />
              </div>
              <span className="truncate text-[10px] font-black uppercase tracking-widest text-gray-500">
                {booking.location}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-gray-50 p-3 dark:bg-white/5">
              <div className="rounded-lg bg-blue-500/10 p-1.5">
                <Calendar className="h-4 w-4 text-blue-500" />
              </div>
              <span className="truncate text-[10px] font-black uppercase tracking-widest text-gray-500">
                {booking.startDate}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Link
                href={`/Cars/booking/${booking.bookingId}`}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-gray-200 py-4 text-sm font-black text-gray-900 transition-all hover:bg-gray-50 active:scale-95 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
              >
                <Eye className="h-4 w-4" />
                View Details
              </Link>

              <Link
                href={`/Messages/${booking.bookingId}?chat=true`}
                title="Contact Owner"
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500 text-white shadow-lg shadow-green-500/20 transition-all hover:bg-green-600 active:scale-95"
              >
                <MessageSquare className="h-5 w-5" />
              </Link>

              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 transition-colors hover:text-gray-900 dark:bg-white/5 dark:hover:text-white"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                  </svg>
                </button>

                {showMenu && (
                  <div className="absolute bottom-full right-0 mb-4 w-48 animate-in fade-in slide-in-from-bottom-2">
                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl dark:border-white/5 dark:bg-[#1A1A1A]">
                      {booking.status === "approved" && (
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            handleConfirmPickup();
                          }}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-blue-500 transition-colors hover:bg-blue-50 dark:hover:bg-blue-500/10"
                        >
                          <Camera className="h-4 w-4" />
                          Confirm Pickup
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setShowCancelModal(true);
                        }}
                        disabled={!canCancel}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-500/10"
                      >
                        <X className="h-4 w-4" />
                        Cancel Booking
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCancelModal && (
        <CancelConfirmationModal
          details={cancellationDetails}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleCancel}
          isCancelling={isCancelling}
        />
      )}

      <CameraCapture
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handlePickupVideoCapture}
        mode="video"
        title="Confirm Vehicle Pickup"
        maxVideoDuration={60}
      />
    </div>
  );
}

function CancelConfirmationModal({
  details,
  onClose,
  onConfirm,
  isCancelling,
}: any) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] border border-white/10 bg-white p-8 shadow-2xl animate-in zoom-in-95 dark:bg-[#121212]">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 text-red-500 dark:bg-red-500/10">
          <AlertCircle className="h-8 w-8" />
        </div>

        <h3 className="mb-2 font-outfit text-2xl font-black text-gray-900 dark:text-white">
          Cancel Booking?
        </h3>
        <p className="mb-8 text-sm font-normal text-gray-500">
          You are about to cancel your booking. Please review the refund details
          below based on our policy.
        </p>

        <div className="mb-8 space-y-4 rounded-3xl bg-gray-50 p-6 dark:bg-white/5">
          <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-gray-400">
            <span>Original Total</span>
            <span className="text-gray-900 dark:text-white">
              {formatCurrencySync(details.total)}
            </span>
          </div>

          <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-red-500">
            <span>Cancellation Fee ({details.feePercent}%)</span>
            <span>-{formatCurrencySync(details.feeAmount)}</span>
          </div>

          <div className="my-2 border-t border-gray-200 dark:border-white/10" />

          <div className="flex items-center justify-between">
            <span className="font-outfit text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">
              Total Refund
            </span>
            <span className="text-xl font-black text-green-500">
              {formatCurrencySync(details.refundAmount)}
            </span>
          </div>
        </div>

        <div className="mb-8 flex items-start gap-3 rounded-2xl bg-blue-50/50 p-4 text-[10px] leading-relaxed text-blue-600 dark:bg-blue-500/5 dark:text-blue-400">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <p>
            {details.isAccepted
              ? "This booking was already accepted. The fee includes compensation for the car owner."
              : "Standard processing fee applied for cancellations made before acceptance."}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl border border-gray-200 py-4 text-xs font-black uppercase tracking-widest transition-colors hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5"
          >
            Go Back
          </button>
          <button
            onClick={onConfirm}
            disabled={isCancelling}
            className="flex flex-[1.5] items-center justify-center gap-2 rounded-2xl bg-red-500 py-4 text-xs font-black uppercase tracking-widest !text-white text-white shadow-lg shadow-red-500/20 transition-all hover:bg-red-600 active:scale-95 disabled:opacity-50"
          >
            {isCancelling ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <>
                Confirm Cancel
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
