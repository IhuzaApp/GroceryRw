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
        <h3 className="text-2xl font-black mb-2 font-outfit">Start your journey</h3>
        <p className="text-gray-500 mb-10 max-w-sm mx-auto font-medium">You haven't booked any vehicles yet. Explore Rwanda with our premium rental selection.</p>
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
    <div className="group relative overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white p-5 transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] dark:border-white/5 dark:bg-[#121212] flex flex-col h-full shadow-sm">
      <div className="relative h-48 w-full overflow-hidden rounded-[2rem] mb-4">
        <img src={booking.image} alt={booking.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute top-4 right-4 text-[10px] font-black uppercase text-green-500 flex items-center gap-1.5 bg-white/90 dark:bg-black/80 backdrop-blur-md px-4 py-1.5 rounded-full shadow-lg">
          <CheckCircle2 className="h-3 w-3" />
          {booking.status || 'Confirmed'}
        </div>
      </div>
      
      <div className="flex-1">
        <div className="flex items-center justify-between mb-3">
           <h4 className="text-lg font-black font-outfit text-gray-900 dark:text-white">{booking.name}</h4>
           <span className="text-xl font-black text-green-500 font-outfit">{formatCurrencySync(booking.total)}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="flex items-center gap-2 rounded-2xl bg-gray-50 dark:bg-white/5 p-3">
              <div className="p-1.5 bg-green-500/10 rounded-lg">
                <MapPin className="h-4 w-4 text-green-500" />
              </div>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest truncate">{booking.location}</span>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-gray-50 dark:bg-white/5 p-3">
              <div className="p-1.5 bg-blue-500/10 rounded-lg">
                <Calendar className="h-4 w-4 text-blue-500" />
              </div>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest truncate">{booking.startDate}</span>
            </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Link 
            href={`/Messages?chat=${booking.owner.id}`} 
            className="flex-1 flex items-center justify-center gap-2 bg-green-500 py-4 rounded-2xl font-black text-sm !text-white shadow-lg shadow-green-500/20 transition-all hover:bg-green-600 active:scale-95"
          >
            <MessageSquare className="h-4 w-4" />
            Contact Owner
          </Link>
          <button className="h-14 w-14 flex items-center justify-center bg-gray-100 dark:bg-white/5 rounded-2xl text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
