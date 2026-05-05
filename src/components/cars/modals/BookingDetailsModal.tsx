import React from "react";
import { X, AlertCircle } from "lucide-react";
import { formatCurrencySync } from "../../../utils/formatCurrency";

interface BookingDetailsModalProps {
  booking: any;
  isOpen: boolean;
  onClose: () => void;
  theme: string;
}

export default function BookingDetailsModal({
  booking,
  isOpen,
  onClose,
  theme,
}: BookingDetailsModalProps) {
  if (!isOpen || !booking) return null;

  const pickupDate = new Date(booking.pickup_date);
  const returnDate = new Date(booking.return_date);
  const diffTime = Math.abs(returnDate.getTime() - pickupDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

  return (
    <div className="fixed inset-0 z-[400] flex items-end justify-center sm:items-center sm:p-6">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />
      <div
        className={`relative flex h-full w-full max-w-2xl flex-col overflow-hidden shadow-2xl duration-300 animate-in slide-in-from-bottom-10 sm:h-auto sm:max-h-[90vh] sm:rounded-[3rem] sm:zoom-in-95 ${
          theme === "dark"
            ? "border border-white/5 bg-[#121212] text-white"
            : "bg-white text-gray-900"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-8 dark:border-white/5">
          <div>
            <h2 className="font-outfit text-2xl font-black">
              Booking Information
            </h2>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
              Ref: {booking.id.slice(0, 8)} • Booked on{" "}
              {new Date(booking.created_at).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`rounded-full p-3 transition-colors ${
              theme === "dark" ? "hover:bg-white/5" : "hover:bg-gray-100"
            }`}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="custom-scrollbar flex-1 overflow-y-auto p-8">
          <div className="space-y-8">
            {/* Customer Info */}
            <section>
              <h3 className="mb-4 text-xs font-normal uppercase tracking-[0.2em] text-gray-400">
                Customer Profile
              </h3>
              <div
                className={`flex items-center gap-4 rounded-3xl p-6 ${
                  theme === "dark" ? "bg-white/5" : "bg-gray-50"
                }`}
              >
                <div className="h-16 w-16 overflow-hidden rounded-full ring-2 ring-green-500/20">
                  <img
                    src={
                      booking.orderedBy?.profile_picture ||
                      "https://ui-avatars.com/api/?name=" +
                        (booking.orderedBy?.name || "Customer")
                    }
                    alt={booking.orderedBy?.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-lg font-black">
                    {booking.orderedBy?.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {booking.orderedBy?.email}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm font-black text-green-500">
                      {booking.orderedBy?.phone}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-gray-300" />
                    <span className="text-[10px] font-black uppercase text-gray-400">
                      {booking.guests || 1} Guests
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Trip Details */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div
                className={`rounded-3xl p-6 ${
                  theme === "dark" ? "bg-white/5" : "bg-gray-50"
                }`}
              >
                <p className="mb-1 text-[10px] font-normal uppercase tracking-widest text-gray-400">
                  Duration
                </p>
                <p className="text-lg font-black">{diffDays} Day(s)</p>
                <div className="mt-2 text-xs text-gray-500">
                  {new Date(booking.pickup_date).toLocaleDateString()} -{" "}
                  {new Date(booking.return_date).toLocaleDateString()}
                </div>
              </div>
              <div
                className={`rounded-3xl p-6 ${
                  theme === "dark" ? "bg-white/5" : "bg-gray-50"
                }`}
              >
                <p className="mb-1 text-[10px] font-normal uppercase tracking-widest text-gray-400">
                  Total Price Paid
                </p>
                <p className="text-2xl font-black text-green-500">
                  {formatCurrencySync(booking.amount)}
                </p>
                <div className="mt-1 flex flex-col gap-1">
                  <div className="text-[10px] font-black uppercase text-gray-400">
                    Payment Status: {booking.status}
                  </div>
                  {booking.refundable_fee &&
                    parseFloat(booking.refundable_fee) > 0 && (
                      <div className="text-[10px] font-black uppercase text-orange-500">
                        Includes Refundable Deposit:{" "}
                        {formatCurrencySync(booking.refundable_fee)}
                      </div>
                    )}
                </div>
              </div>
            </section>

            {/* Driving License */}
            <section>
              <h3 className="mb-4 text-xs font-normal uppercase tracking-[0.2em] text-gray-400">
                Driver Verification
              </h3>
              <div className="relative aspect-[16/10] overflow-hidden rounded-[2.5rem] border border-white/5 shadow-2xl">
                {booking.driving_license ? (
                  <img
                    src={booking.driving_license}
                    alt="Driving License"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div
                    className={`flex h-full w-full flex-col items-center justify-center ${
                      theme === "dark" ? "bg-white/5" : "bg-gray-50"
                    }`}
                  >
                    <AlertCircle className="mb-2 h-8 w-8 text-orange-500/50" />
                    <p className="text-sm font-normal text-gray-400">
                      License document not available
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Condition Video */}
            {booking.carVideo_Status &&
              (booking.status === "picked_up" ||
                booking.status === "COMPLETED") && (
                <section className="duration-500 animate-in fade-in slide-in-from-bottom-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-xs font-normal uppercase tracking-[0.2em] text-gray-400">
                      Vehicle Handover Report
                    </h3>
                    <span className="rounded-full bg-green-500/10 px-3 py-1 text-[10px] font-black uppercase text-green-500">
                      Verified Video
                    </span>
                  </div>
                  <div className="overflow-hidden rounded-[2.5rem] border border-white/5 shadow-2xl">
                    <video
                      src={booking.carVideo_Status}
                      controls
                      className="h-full w-full"
                    />
                  </div>
                </section>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
