"use client";

import React from "react";
import { MapPin, Calendar, CheckCircle2, MessageSquare } from "lucide-react";
import Link from "next/link";
import { formatCurrencySync } from "../../../utils/formatCurrency";

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
      {bookings.map((booking) => (
        <BookingCard key={booking.bookingId} booking={booking} />
      ))}
    </div>
  );
}

function BookingCard({ booking }: { booking: any }) {
  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white p-5 shadow-sm transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] dark:border-white/5 dark:bg-[#121212]">
      <div className="relative mb-4 h-48 w-full overflow-hidden rounded-[2rem]">
        <img
          src={booking.image}
          alt={booking.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-white/90 px-4 py-1.5 text-[10px] font-black uppercase text-green-500 shadow-lg backdrop-blur-md dark:bg-black/80">
          <CheckCircle2 className="h-3 w-3" />
          {booking.status || "Confirmed"}
        </div>
      </div>

      <div className="flex-1">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="font-outfit text-lg font-black text-gray-900 dark:text-white">
            {booking.name}
          </h4>
          <span className="font-outfit text-xl font-black text-green-500">
            {formatCurrencySync(booking.total)}
          </span>
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

        <div className="flex items-center gap-3">
          <Link
            href={`/Messages?chat=${booking.owner.id}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-green-500 py-4 text-sm font-black !text-white shadow-lg shadow-green-500/20 transition-all hover:bg-green-600 active:scale-95"
          >
            <MessageSquare className="h-4 w-4" />
            Contact Owner
          </Link>
          <button className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 transition-colors hover:text-gray-900 dark:bg-white/5 dark:hover:text-white">
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
        </div>
      </div>
    </div>
  );
}
