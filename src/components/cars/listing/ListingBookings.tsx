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
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[3rem] bg-gray-100 dark:bg-white/5 text-gray-400 shadow-inner">
           <Calendar className="h-12 w-12" />
        </div>
        <h3 className="text-2xl font-bold mb-2 font-outfit">Start your journey</h3>
        <p className="text-gray-500 mb-10 max-w-sm mx-auto font-medium">You haven't booked any vehicles yet. Explore Rwanda with our premium rental selection.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {bookings.map((booking) => (
        <BookingCard key={booking.bookingId} booking={booking} />
      ))}
    </div>
  );
}

function BookingCard({ booking }: { booking: any }) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-3 dark:border-white/5 dark:bg-[#121212] flex items-center gap-3">
      <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl shadow-sm">
        <img src={booking.image} alt={booking.name} className="h-full w-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
           <h4 className="text-xs font-bold font-outfit truncate text-gray-900 dark:text-white">{booking.name}</h4>
           <div className="text-[7px] font-bold uppercase text-green-500 flex items-center gap-0.5 bg-green-500/10 px-1.5 py-0.5 rounded-full">
              <CheckCircle2 className="h-2 w-2" />
              {booking.status || 'Confirmed'}
           </div>
        </div>
        <div className="flex items-center gap-2 text-[8px] font-medium text-gray-400 uppercase mb-2">
           <div className="flex items-center gap-1">
             <MapPin className="h-2 w-2 text-green-500" />
             {booking.location}
           </div>
           <div className="flex items-center gap-1">
             <Calendar className="h-2 w-2" />
             {booking.startDate}
           </div>
        </div>
        <div className="flex items-center justify-between">
           <span className="text-sm font-bold text-green-500 font-outfit">{formatCurrencySync(booking.total)}</span>
           <Link href={`/Messages?chat=${booking.owner.id}`} className="p-1.5 bg-green-500 rounded-full shadow-md">
              <MessageSquare className="h-3.5 w-3.5 !text-white" />
           </Link>
        </div>
      </div>
    </div>
  );
}
