import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { 
  ChevronLeft, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  AlertCircle, 
  Clock, 
  Play, 
  FileText,
  CreditCard,
  User,
  Car as CarIcon,
  CheckCircle2
} from "lucide-react";
import RootLayout from "../../../src/components/ui/layout";
import { formatCurrencySync } from "../../../src/utils/formatCurrency";
import { toast } from "react-hot-toast";

export default function BookingDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // Basic theme detection
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    if (id) {
      fetchBooking();
    }
  }, [id]);

  const fetchBooking = async () => {
    try {
      const res = await fetch(`/api/queries/get-booking-details?id=${id}`);
      const data = await res.json();
      if (data.booking) {
        setBooking(data.booking);
      } else {
        toast.error("Booking not found");
        router.push("/Cars?tab=bookings");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load booking details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <RootLayout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
        </div>
      </RootLayout>
    );
  }

  if (!booking) return null;

  const statusColors: any = {
    PAID: "bg-green-500/10 text-green-500",
    approved: "bg-blue-500/10 text-blue-500",
    picked_up: "bg-purple-500/10 text-purple-500",
    COMPLETED: "bg-emerald-500/10 text-emerald-500",
    CANCELLED: "bg-red-500/10 text-red-500",
  };

  const statusLabels: any = {
    PAID: "Confirmed",
    approved: "Ready for Pickup",
    picked_up: "In Use",
    COMPLETED: "Finished",
    CANCELLED: "Cancelled",
  };

  return (
    <RootLayout>
      <div className={`min-h-screen pb-24 ${theme === "dark" ? "bg-[#0A0A0A] text-white" : "bg-gray-50 text-gray-900"}`}>
        {/* Header */}
        <div className={`sticky top-0 z-50 border-b backdrop-blur-xl ${theme === "dark" ? "border-white/5 bg-black/60" : "border-gray-200 bg-white/80"}`}>
          <div className="mx-auto flex max-w-5xl items-center justify-between p-4 md:p-6">
            <button 
              onClick={() => router.back()}
              className={`flex items-center gap-2 rounded-full p-2 transition-all hover:scale-105 ${theme === "dark" ? "bg-white/5" : "bg-gray-100"}`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h1 className="font-outfit text-xl font-black">Booking Receipt</h1>
            <div className="w-10" /> {/* Spacer */}
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            
            {/* Left Column: Vehicle & Status */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Vehicle Card */}
              <div className={`overflow-hidden rounded-[2.5rem] border shadow-sm ${theme === "dark" ? "border-white/5 bg-[#121212]" : "border-gray-100 bg-white"}`}>
                <div className="relative h-64 w-full">
                  <img 
                    src={booking.RentalVehicles?.main_photo} 
                    alt={booking.RentalVehicles?.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-6 left-6">
                    <div className={`mb-2 inline-flex items-center rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest ${statusColors[booking.status] || "bg-gray-500/10 text-gray-500"}`}>
                      {statusLabels[booking.status] || booking.status}
                    </div>
                    <h2 className="text-3xl font-black text-white">{booking.RentalVehicles?.name}</h2>
                    <p className="text-white/80 font-bold uppercase tracking-widest text-xs mt-1">
                      Plate: <span className="text-green-400">{booking.RentalVehicles?.platNumber || "N/A"}</span>
                    </p>
                  </div>
                </div>
                
                <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-6">
                  <SpecItem icon={<CarIcon />} label="Category" value={booking.RentalVehicles?.category} theme={theme} />
                  <SpecItem icon={<User />} label="Capacity" value={`${booking.RentalVehicles?.passenger} Persons`} theme={theme} />
                  <SpecItem icon={<MapPin />} label="Location" value={booking.RentalVehicles?.location} theme={theme} />
                  <SpecItem icon={<Clock />} label="Fuel" value={booking.RentalVehicles?.fuel_type} theme={theme} />
                </div>
              </div>

              {/* Dates & Timeline */}
              <div className={`p-8 rounded-[2.5rem] border shadow-sm ${theme === "dark" ? "border-white/5 bg-[#121212]" : "border-gray-100 bg-white"}`}>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-500 mb-6 flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Schedule
                </h3>
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative">
                  <div className="flex-1 text-center md:text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Pickup Date</p>
                    <p className="text-xl font-black">{new Date(booking.pickup_date).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    <p className="text-xs font-medium text-gray-500 mt-1">Expected at 06:00 AM</p>
                  </div>
                  <div className="hidden md:block h-[1px] flex-1 bg-gradient-to-r from-green-500/50 to-blue-500/50 relative">
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-[#121212] p-2 rounded-full border border-gray-100 dark:border-white/5">
                      <Clock className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Return Date</p>
                    <p className="text-xl font-black">{new Date(booking.return_date).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    <p className="text-xs font-medium text-gray-500 mt-1">Before 10:00 PM</p>
                  </div>
                </div>
              </div>

              {/* Condition Reports (Videos) */}
              {(booking.carVideo_Status || booking.Issuecomplains?.length > 0) && (
                <div className={`p-8 rounded-[2.5rem] border shadow-sm ${theme === "dark" ? "border-white/5 bg-[#121212]" : "border-gray-100 bg-white"}`}>
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-500 mb-6 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" /> Condition Reports
                  </h3>
                  
                  <div className="space-y-4">
                    {booking.carVideo_Status && (
                      <div className={`flex items-center justify-between p-4 rounded-2xl ${theme === "dark" ? "bg-white/5" : "bg-gray-50"}`}>
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <Play className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-black">Pickup Condition Video</p>
                            <p className="text-[10px] font-medium text-gray-500 uppercase">Recorded at pickup</p>
                          </div>
                        </div>
                        <a 
                          href={booking.carVideo_Status} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all"
                        >
                          View Video
                        </a>
                      </div>
                    )}

                    {booking.Issuecomplains?.map((complaint: any) => (
                      <div key={complaint.id} className={`flex items-center justify-between p-4 rounded-2xl ${theme === "dark" ? "bg-white/5" : "bg-red-500/5 border border-red-500/10"}`}>
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                            <AlertCircle className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-red-500">Damage Report: {complaint.title}</p>
                            <p className="text-[10px] font-medium text-gray-500 uppercase">{new Date(complaint.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        {complaint.vehicleVideo && (
                          <a 
                            href={complaint.vehicleVideo} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-600 transition-all"
                          >
                            View Evidence
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Payment & Summary */}
            <div className="space-y-6">
              
              {/* Payment Summary */}
              <div className={`p-8 rounded-[2.5rem] border shadow-sm ${theme === "dark" ? "border-white/5 bg-[#121212]" : "border-gray-100 bg-white"}`}>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-500 mb-6 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" /> Financials
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Rental Rate</span>
                    <span className="text-sm font-bold">{formatCurrencySync(booking.amount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Service Fee</span>
                    <span className="text-sm font-bold">{formatCurrencySync(booking.services_fee)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-white/5">
                    <span className="text-sm text-gray-500">Platform Fee</span>
                    <span className="text-sm font-bold">{formatCurrencySync(0)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-base font-black">Total Paid</span>
                    <span className="text-2xl font-black text-green-500">
                      {formatCurrencySync(parseFloat(booking.amount) + parseFloat(booking.services_fee))}
                    </span>
                  </div>

                  {/* Security Deposit */}
                  <div className={`mt-6 p-4 rounded-2xl border-2 border-dashed ${theme === "dark" ? "border-orange-500/20 bg-orange-500/5" : "border-orange-200 bg-orange-50"}`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-black uppercase tracking-wider text-orange-600">Refundable Deposit</span>
                      <span className="text-lg font-black text-orange-600">{formatCurrencySync(booking.refundable_fee)}</span>
                    </div>
                    <p className="text-[9px] text-orange-600/70 font-medium">This amount is held and will be refunded after inspection.</p>
                  </div>
                </div>
              </div>

              {/* Host Info */}
              <div className={`p-8 rounded-[2.5rem] border shadow-sm ${theme === "dark" ? "border-white/5 bg-[#121212]" : "border-gray-100 bg-white"}`}>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-500 mb-6 flex items-center gap-2">
                  <User className="h-4 w-4" /> Host Information
                </h3>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center text-white font-black">
                    {booking.RentalVehicles?.logisticsAccounts?.businessName?.[0] || booking.RentalVehicles?.logisticsAccounts?.fullname?.[0] || "H"}
                  </div>
                  <div>
                    <p className="font-black">{booking.RentalVehicles?.logisticsAccounts?.businessName || booking.RentalVehicles?.logisticsAccounts?.fullname}</p>
                    <p className="text-xs text-gray-500">{booking.RentalVehicles?.logisticsAccounts?.Users?.phone}</p>
                  </div>
                </div>
              </div>

              {/* Support */}
              <div className={`p-6 rounded-[2rem] bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/20`}>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm">Need help?</h4>
                    <p className="text-[11px] font-medium opacity-90 mt-1">Our support team is available 24/7 for any issues during your ride.</p>
                    <button className="mt-4 px-4 py-2 bg-white text-green-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-100 transition-all">
                      Contact Support
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </RootLayout>
  );
}

function SpecItem({ icon, label, value, theme }: any) {
  return (
    <div className="flex flex-col items-center md:items-start">
      <div className={`mb-2 p-2 rounded-xl ${theme === "dark" ? "bg-white/5 text-gray-400" : "bg-gray-100 text-gray-500"}`}>
        {React.cloneElement(icon as React.ReactElement, { size: 18 })}
      </div>
      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{label}</p>
      <p className="text-xs font-bold truncate max-w-full">{value}</p>
    </div>
  );
}
