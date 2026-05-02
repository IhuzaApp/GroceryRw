"use client";

import React, { useState } from "react";
import {
  BarChart3,
  CalendarCheck,
  TrendingUp,
  Search,
  Circle,
  Clock,
  Wallet,
  ArrowUpRight,
  Edit2,
  Trash2,
  Eye,
  Star,
  Check,
  X,
  Camera,
  Fuel,
  Settings2,
  Users,
  MapPin,
  UserCheck,
  AlertCircle,
  ChevronRight,
  MoreVertical,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useBusinessWallet } from "../../context/BusinessWalletContext";
import { Car } from "../../constants/dummyCars";
import AddVehicleModal from "./modals/AddVehicleModal";
import EditVehicleModal from "./modals/EditVehicleModal";
import DashboardHeader from "./DashboardHeader";
import CameraCapture from "../ui/CameraCapture";
import toast from "react-hot-toast";
import { formatCurrencySync } from "../../utils/formatCurrency";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { uploadToFirebase } from "../../lib/firebase";
import LoadingScreen from "../ui/LoadingScreen";
import {
  PendingReviewMessage,
  RejectedAccountMessage,
} from "../business/PendingReviewMessage";

const CarIcon = ({ className }: { className?: string }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M3 8L5.72187 10.2682C5.90158 10.418 6.12811 10.5 6.36205 10.5H17.6379C17.8719 10.5 18.0984 10.418 18.2781 10.2682L21 8M6.5 14H6.51M17.5 14H17.51M8.16065 4.5H15.8394C16.5571 4.5 17.2198 4.88457 17.5758 5.50772L20.473 10.5777C20.8183 11.1821 21 11.8661 21 12.5623V18.5C21 19.0523 20.5523 19.5 20 19.5H19C18.4477 19.5 18 19.0523 18 18.5V17.5H6V18.5C6 19.0523 5.55228 19.5 5 19.5H4C3.44772 19.5 3 19.0523 3 18.5V12.5623C3 11.8661 3.18166 11.1821 3.52703 10.5777L6.42416 5.50772C6.78024 4.88457 7.44293 4.5 8.16065 4.5ZM7 14C7 14.2761 6.77614 14.5 6.5 14.5C6.22386 14.5 6 14.2761 6 14C6 13.7239 6.22386 13.5 6.5 13.5C6.77614 13.5 7 13.7239 7 14ZM18 14C18 14.2761 17.7761 14.5 17.5 14.5C17.2239 14.5 17 14.2761 17 14C17 13.7239 17.2239 13.5 17.5 13.5C17.7761 13.5 18 13.7239 18 14Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function CarBusinessDashboard() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<"fleet" | "bookings">("fleet");
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isBookingDetailsOpen, setIsBookingDetailsOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isPickupCameraOpen, setIsPickupCameraOpen] = useState(false);
  const [selectedBookingForPickup, setSelectedBookingForPickup] = useState<any>(null);
  const { walletBalance, fetchWalletBalance: refreshWallet } = useBusinessWallet();
  const [cars, setCars] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isVehiclesLoading, setIsVehiclesLoading] = useState(true);
  const [isBookingsLoading, setIsBookingsLoading] = useState(true);
  const router = useRouter();
  const { data: session } = useSession();
  const [accountStatus, setAccountStatus] = useState<
    "loading" | "active" | "pending" | "disabled"
  >("loading");
  const [logisticsAccountId, setLogisticsAccountId] = useState<string | null>(
    null
  );

  const fetchBookings = async (accountId: string) => {
    try {
      const response = await fetch(
        `/api/queries/get-logistics-bookings?logisticAccount_id=${accountId}`
      );
      const data = await response.json();
      if (data.bookings) {
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setIsBookingsLoading(false);
    }
  };

  const fetchVehicles = async (accountId: string) => {
    try {
      const response = await fetch(
        `/api/queries/get-logistics-vehicles?logisticAccount_id=${accountId}`
      );
      const data = await response.json();
      if (data.vehicles) {
        // Map database fields to frontend Car structure
        const mappedCars = data.vehicles.map((v: any) => ({
          ...v,
          type: v.category,
          fuelType: v.fuel_type,
          image: v.main_photo,
          passengers: parseInt(v.passenger || "5"),
          securityDeposit: v.refundable_amount,
          driverOption: v.drive_provided ? "offered" : "none",
          owner: {
            id: v.logisticAccount_id,
            name:
              v.logisticsAccounts?.businessName ||
              v.logisticsAccounts?.fullname ||
              "Verified Host",
            image:
              v.logisticsAccounts?.Users?.profile_picture ||
              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1780&auto=format&fit=crop",
            isVerified: true,
          },
          images: [
            { url: v.main_photo, label: "Main" },
            { url: v.exterior, label: "Exterior" },
            { url: v.interior, label: "Interior" },
            { url: v.seats, label: "Seats" },
          ].filter((img) => img.url),
          reviews: [],
          rating: 5.0,
          description: `Premium ${v.category} vehicle for rent in ${v.location}.`,
          licenseInfo: "Verified License & Insurance",
        }));
        setCars(mappedCars);
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setIsVehiclesLoading(false);
    }
  };



  useEffect(() => {
    const checkAccount = async () => {
      try {
        const response = await fetch("/api/queries/check-logistics-account");
        if (!response.ok) {
          router.push("/Cars/become-partner");
          return;
        }
        const data = await response.json();
        if (!data.hasAccount) {
          router.push("/Cars/become-partner");
          return;
        }

        setLogisticsAccountId(data.account.id);
        fetchVehicles(data.account.id);
        fetchBookings(data.account.id);

        if (data.account.disabled) {
          setAccountStatus("disabled");
        } else {
          setAccountStatus(data.account.status);
        }
      } catch (error) {
        console.error("Error checking logistics account status:", error);
        setAccountStatus("active"); // Fallback
      }
    };

    if (session?.user) {
      checkAccount();
    }
  }, [session, router]);

  const handleToggleStatus = async (vehicleId: string, currentActive: boolean) => {
    try {
      const response = await fetch("/api/mutations/update-vehicle-active-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId,
          active: !currentActive,
        }),
      });

      if (response.ok) {
        toast.success(`Vehicle ${!currentActive ? "enabled" : "disabled"}`);
        if (logisticsAccountId) fetchVehicles(logisticsAccountId);
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      toast.error("An error occurred");
    }
  };

  const handleEdit = (car: Car) => {
    setSelectedCar(car);
    setIsEditModalOpen(true);
  };

  const handleViewDetails = (car: Car) => {
    setSelectedCar(car);
    setIsDetailsModalOpen(true);
  };

  const handleConfirmBooking = async (booking: any) => {
    try {
      const response = await fetch("/api/mutations/update-vehicle-booking-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          status: "approved"
        }),
      });

      if (response.ok) {
        toast.success("Booking confirmed! It is now waiting for pickup.");
        if (logisticsAccountId) fetchBookings(logisticsAccountId);
      } else {
        toast.error("Failed to confirm booking");
      }
    } catch (error) {
      console.error("Error confirming booking:", error);
      toast.error("An error occurred");
    }
  };

  const handleCaptureComplete = async (imageData: string) => {
    console.log("Vehicle condition captured:", imageData);
    setIsCameraOpen(false);
    
    if (selectedBooking) {
      try {
        const response = await fetch("/api/mutations/update-vehicle-booking-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingId: selectedBooking.id,
            status: "approved"
          }),
        });

        if (response.ok) {
          toast.success("Booking confirmed with condition report!");
          if (logisticsAccountId) fetchBookings(logisticsAccountId);
        } else {
          toast.error("Failed to confirm booking");
        }
      } catch (error) {
        console.error("Error confirming booking:", error);
        toast.error("An error occurred");
      }
    }
  };

  const handleRejectBooking = (booking: any) => {
    setSelectedBooking(booking);
    setIsRejectionModalOpen(true);
  };

  const submitRejection = async () => {
    if (!rejectionReason) {
      toast.error("Please provide a reason");
      return;
    }
    
    if (selectedBooking) {
      try {
        const response = await fetch("/api/mutations/update-vehicle-booking-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingId: selectedBooking.id,
            status: "CANCELLED"
          }),
        });

        if (response.ok) {
          toast.success("Booking rejected");
          setIsRejectionModalOpen(false);
          setRejectionReason("");
          if (logisticsAccountId) fetchBookings(logisticsAccountId);
        } else {
          toast.error("Failed to reject booking");
        }
      } catch (error) {
        console.error("Error rejecting booking:", error);
        toast.error("An error occurred");
      }
    }
  };

  const handleConfirmPickup = (booking: any) => {
    setSelectedBookingForPickup(booking);
    setIsPickupCameraOpen(true);
  };

  const handlePickupVideoCapture = async (videoUrl: string) => {
    if (!selectedBookingForPickup) return;

    const loadingToast = toast.loading("Uploading condition video...");
    try {
      // 1. Fetch the blob from the local object URL
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const file = new File([blob], `pickup_${selectedBookingForPickup.id}.webm`, { type: "video/webm" });

      // 2. Upload to Firebase
      const storagePath = `bookings/${selectedBookingForPickup.id}/pickup_video.webm`;
      const downloadUrl = await uploadToFirebase(file, storagePath);

      // 3. Confirm pickup via API
      const confirmResponse = await fetch("/api/mutations/confirm-pickup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: selectedBookingForPickup.id,
          carVideo_Status: downloadUrl,
        }),
      });

      if (confirmResponse.ok) {
        toast.success("Pickup confirmed! Funds transferred to wallet.", { id: loadingToast });
        if (logisticsAccountId) fetchBookings(logisticsAccountId);
        refreshWallet();
      } else {
        toast.error("Failed to confirm pickup", { id: loadingToast });
      }
    } catch (error) {
      console.error("Error confirming pickup:", error);
      toast.error("An error occurred during pickup confirmation", { id: loadingToast });
    } finally {
      setIsPickupCameraOpen(false);
      setSelectedBookingForPickup(null);
    }
  };

  const handleViewBookingDetails = (booking: any) => {
    setSelectedBooking(booking);
    setIsBookingDetailsOpen(true);
  };

  if (accountStatus === "loading") {
    return <LoadingScreen />;
  }

  if (accountStatus === "pending") {
    return (
      <div
        className={`min-h-screen pb-24 md:ml-20 ${theme === "dark" ? "bg-[#0A0A0A] text-white" : "bg-white text-black"
          }`}
      >
        <PendingReviewMessage contactEmail={session?.user?.email} />
      </div>
    );
  }

  if (accountStatus === "disabled") {
    return (
      <div
        className={`min-h-screen pb-24 md:ml-20 ${theme === "dark" ? "bg-[#0A0A0A] text-white" : "bg-white text-black"
          }`}
      >
        <RejectedAccountMessage businessAccountId={logisticsAccountId} />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen pb-24 md:ml-20 ${theme === "dark" ? "bg-[#0A0A0A] text-white" : "bg-white text-black"
        }`}
    >
      <DashboardHeader
        title="Partner Dashboard"
        subtitle="Welcome back, Elite Car Rentals"
        onAction={() => setIsAddVehicleOpen(true)}
        actionLabel="Add Vehicle"
        theme={theme}
      />

      <div className="mx-auto max-w-[1600px] px-6">
        {/* Wallet & Stats Section */}
        <div className="mb-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Wallet Card */}
          <WalletBalanceCard balance={walletBalance} theme={theme} />

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <StatsCard
              label="Revenue"
              value={formatCurrencySync(
                bookings
                  .filter((b) => b.status === "approved" || b.status === "picked_up" || b.status === "COMPLETED")
                  .reduce((acc, b) => acc + (parseFloat(b.amount) || 0), 0)
              )}
              icon={<TrendingUp />}
              color="green"
              theme={theme}
            />
            <StatsCard
              label="Fleet"
              value={cars.length.toString()}
              icon={<CarIcon />}
              color="blue"
              theme={theme}
            />
            <StatsCard
              label="Bookings"
              value={bookings.length.toString()}
              icon={<CalendarCheck />}
              color="purple"
              theme={theme}
            />
            <StatsCard
              label="Rating"
              value={(() => {
                const ratings = bookings.flatMap(b => b.Ratings || []).map(r => r.rating);
                return ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : "5.0";
              })()}
              icon={<Star />}
              color="orange"
              theme={theme}
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 flex gap-8 border-b border-gray-200/10">
          <button
            onClick={() => setActiveTab("fleet")}
            className={`pb-4 text-sm font-black uppercase tracking-widest transition-all ${activeTab === "fleet"
                ? "border-b-2 border-green-500 text-green-500"
                : "text-gray-500 hover:text-gray-400"
              }`}
          >
            My Fleet
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`pb-4 text-sm font-black uppercase tracking-widest transition-all ${activeTab === "bookings"
                ? "border-b-2 border-green-500 text-green-500"
                : "text-gray-500 hover:text-gray-400"
              }`}
          >
            Bookings
          </button>
        </div>

        {activeTab === "fleet" ? (
          <div className="space-y-4">
            <div className="mb-6 flex items-center justify-between">
              <div
                className={`flex max-w-md flex-1 items-center rounded-2xl border px-4 py-3 ${theme === "dark"
                    ? "border-white/10 bg-white/5"
                    : "border-gray-200 bg-gray-50"
                  }`}
              >
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search fleet..."
                  className="ml-3 flex-1 bg-transparent text-sm font-black outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {cars.map((car) => (
                <FleetItem
                  key={car.id}
                  car={car}
                  theme={theme}
                  onEdit={() => handleEdit(car)}
                  onToggleStatus={() => handleToggleStatus(car.id, car.status === "active")}
                  onView={() => handleViewDetails(car)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CalendarCheck className="mb-4 h-12 w-12 text-gray-500 opacity-20" />
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No bookings yet</p>
              </div>
            ) : (
              bookings.map((booking) => (
                <BookingItem
                  key={booking.id}
                  customer={booking.orderedBy?.name || "Customer"}
                  car={booking.RentalVehicles?.name || "Vehicle"}
                  date={booking.pickup_date ? `${new Date(booking.pickup_date).toLocaleDateString()} - ${new Date(booking.return_date).toLocaleDateString()}` : "No dates"}
                  amount={formatCurrencySync(booking.amount)}
                  status={booking.status}
                  driverProvided={false}
                  theme={theme}
                  onConfirm={() => handleConfirmBooking(booking)}
                  onReject={() => handleRejectBooking(booking)}
                  onConfirmPickup={() => handleConfirmPickup(booking)}
                  onClick={() => handleViewBookingDetails(booking)}
                  rating={booking.Ratings?.[0]?.rating}
                  review={booking.Ratings?.[0]?.review}
                  professionalism={booking.Ratings?.[0]?.professionalism}
                />
              ))
            )}
          </div>
        )}
      </div>

      {isAddVehicleOpen && logisticsAccountId && (
        <AddVehicleModal
          isOpen={isAddVehicleOpen}
          onClose={() => setIsAddVehicleOpen(false)}
          theme={theme}
          logisticAccountId={logisticsAccountId}
          onSuccess={() => fetchVehicles(logisticsAccountId)}
        />
      )}

      {selectedCar && (
        <CarDetailsModal
          car={selectedCar}
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          theme={theme}
        />
      )}

      {selectedCar && (
        <EditVehicleModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          theme={theme}
          initialData={selectedCar}
          onSubmit={(data) => {
            setCars((prev) =>
              prev.map((c) => (c.id === selectedCar.id ? { ...c, ...data } : c))
            );
            toast.success("Vehicle updated!");
          }}
        />
      )}

      {/* Rejection Modal */}
      {isRejectionModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsRejectionModalOpen(false)}
          />
          <div
            className={`relative w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl ${theme === "dark"
                ? "border border-white/10 bg-[#121212]"
                : "bg-white"
              }`}
          >
            <h3 className="mb-4 text-2xl font-black">Reject Booking</h3>
            <p className="mb-6 font-normal text-gray-500">
              Please provide a reason for rejecting this booking.
            </p>
            <textarea
              className={`mb-6 h-32 w-full rounded-2xl border p-4 text-sm font-normal outline-none ${theme === "dark"
                  ? "border-white/10 bg-white/5"
                  : "border-gray-200 bg-gray-50"
                }`}
              placeholder="e.g. Vehicle maintenance, fully booked..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setIsRejectionModalOpen(false)}
                className={`flex-1 rounded-2xl py-4 font-normal transition-all ${theme === "dark"
                    ? "bg-white/5 hover:bg-white/10"
                    : "bg-gray-100 hover:bg-gray-200"
                  }`}
              >
                Cancel
              </button>
              <button
                onClick={submitRejection}
                className="flex-1 rounded-2xl bg-red-500 py-4 font-black text-white shadow-xl shadow-red-500/30 transition-all hover:scale-[1.02]"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      <CameraCapture
        isOpen={isPickupCameraOpen}
        onClose={() => setIsPickupCameraOpen(false)}
        onCapture={handlePickupVideoCapture}
        mode="video"
        title="Pickup Condition Report"
        maxVideoDuration={60}
      />

      <BookingDetailsModal
        booking={selectedBooking}
        isOpen={isBookingDetailsOpen}
        onClose={() => setIsBookingDetailsOpen(false)}
        theme={theme}
      />
    </div>
  );
}

function StatsCard({
  label,
  value,
  icon,
  color,
  theme,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  theme: string;
}) {
  const colors: Record<string, string> = {
    green: "text-green-500 bg-green-500/10",
    blue: "text-blue-500 bg-blue-500/10",
    purple: "text-purple-500 bg-purple-500/10",
    orange: "text-orange-500 bg-orange-500/10",
  };

  return (
    <div
      className={`rounded-[2rem] border p-5 transition-all hover:shadow-xl ${theme === "dark"
          ? "border-white/5 bg-[#121212]"
          : "border-gray-100 bg-white shadow-sm"
        }`}
    >
      <div
        className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${colors[color]}`}
      >
        {React.cloneElement(icon as React.ReactElement, {
          className: "h-5 w-5",
        })}
      </div>
      <p className="mb-0.5 text-[10px] font-black uppercase tracking-[0.1em] text-gray-500">
        {label}
      </p>
      <h3
        className={`text-xl font-black ${theme === "dark" ? "text-white" : "text-black"
          }`}
      >
        {value}
      </h3>
    </div>
  );
}

function WalletBalanceCard({
  balance,
  theme,
}: {
  balance: number;
  theme: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8 shadow-2xl shadow-black/20">
      {/* Decorative elements */}
      <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-gradient-to-br from-yellow-400/20 to-transparent blur-3xl" />
      <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-gradient-to-tr from-emerald-500/20 to-transparent blur-2xl" />

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-12 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg shadow-yellow-500/20" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-500">
              VIP PARTNER
            </span>
          </div>
          <Wallet className="h-6 w-6 text-yellow-500" />
        </div>

        <div className="mb-8">
          <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
            Available Balance
          </p>
          <h2 className="text-3xl font-black tracking-tight text-white">
            {formatCurrencySync(balance)}
          </h2>
        </div>

        <div className="flex items-end justify-between">
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-yellow-500/40"
                />
              ))}
            </div>
            <span className="font-mono text-xs tracking-widest text-gray-500">
              BUSINESS CARD
            </span>
          </div>
          <button className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-600 px-4 py-2 text-xs font-black !text-white transition-all hover:scale-[1.02] active:scale-[0.98]">
            <ArrowUpRight className="h-3 w-3 !text-white" />
            <span className="!text-white">Withdraw</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function FleetItem({
  car,
  theme,
  onEdit,
  onToggleStatus,
  onView,
}: {
  car: Car;
  theme: string;
  onEdit: () => void;
  onToggleStatus: () => void;
  onView: () => void;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-[2rem] border p-3 transition-all hover:shadow-lg sm:p-4 ${theme === "dark"
          ? "border-white/5 bg-[#121212] hover:bg-white/[0.07]"
          : "border-gray-100 bg-white shadow-sm hover:bg-gray-50"
        }`}
    >
      <div className="flex min-w-0 items-center gap-3 sm:gap-5">
        <div className="h-16 w-24 shrink-0 overflow-hidden rounded-2xl border border-white/5 sm:h-20 sm:w-32">
          <img
            src={car.image}
            alt={car.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <h4
            className={`text-lg font-black leading-tight ${theme === "dark" ? "text-white" : "text-black"
              }`}
          >
            {car.name}
          </h4>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
            {car.type} • {car.fuelType}
          </p>
          <div className="mt-2 flex items-center gap-3">
            <div
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-normal uppercase tracking-wider ${car.status === "active"
                  ? "bg-green-500/10 text-green-500"
                  : "bg-red-500/10 text-red-500"
                }`}
            >
              <Circle className="h-2 w-2 fill-current" />
              {car.status === "active" ? "Active" : "Disabled"}
            </div>
            <span className="text-sm font-normal text-green-600">
              {formatCurrencySync(car.price)}/day
            </span>
          </div>
        </div>
      </div>
      {/* Desktop Actions */}
      <div className="hidden items-center gap-2 pr-2 sm:flex">
        <button
          onClick={onToggleStatus}
          title={car.status === "active" ? "Disable listing" : "Enable listing"}
          className={`rounded-xl p-3 transition-colors ${theme === "dark"
              ? "text-gray-400 hover:bg-white/5"
              : "text-gray-600 hover:bg-gray-200"
            }`}
        >
          <Clock className="h-5 w-5" />
        </button>
        <button
          onClick={onEdit}
          title="Edit details"
          className={`rounded-xl p-3 transition-colors ${theme === "dark"
              ? "text-gray-400 hover:bg-white/5"
              : "text-gray-600 hover:bg-gray-200"
            }`}
        >
          <Edit2 className="h-5 w-5" />
        </button>
        <button
          onClick={onView}
          title="View all details"
          className={`rounded-xl p-3 transition-colors ${theme === "dark"
              ? "text-gray-400 hover:bg-white/5"
              : "text-gray-600 hover:bg-gray-200"
            }`}
        >
          <Eye className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile Actions Dropdown - Icon Trigger */}
      <div className="relative pr-1 sm:hidden">
        <div
          className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${theme === "dark"
              ? "bg-white/5 text-gray-400"
              : "bg-gray-100 text-gray-600"
            }`}
        >
          <MoreVertical className="h-5 w-5" />
          <select
            onChange={(e) => {
              const val = e.target.value;
              if (val === "edit") onEdit();
              else if (val === "toggle") onToggleStatus();
              else if (val === "view") onView();
              e.target.value = "";
            }}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            defaultValue=""
          >
            <option value="" disabled>
              Actions
            </option>
            <option value="view">View Details</option>
            <option value="edit">Edit Vehicle</option>
            <option value="toggle">
              {car.status === "active" ? "Disable" : "Enable"} Listing
            </option>
          </select>
        </div>
      </div>
    </div>
  );
}

function CarDetailsModal({
  car,
  isOpen,
  onClose,
  theme,
}: {
  car: Car;
  isOpen: boolean;
  onClose: () => void;
  theme: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-end justify-center sm:items-center sm:p-6">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />
      <div
        className={`relative flex h-full w-full max-w-4xl flex-col overflow-hidden shadow-2xl duration-300 animate-in slide-in-from-bottom-10 sm:h-auto sm:max-h-[90vh] sm:rounded-[3rem] sm:zoom-in-95 ${theme === "dark"
            ? "border border-white/5 bg-[#121212] text-white"
            : "bg-white text-gray-900"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-8 dark:border-white/5">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 overflow-hidden rounded-2xl">
              <img
                src={car.image}
                alt={car.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h2 className="font-outfit text-2xl font-black">{car.name}</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                {car.year} • {car.type}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`rounded-full p-3 transition-colors ${theme === "dark" ? "hover:bg-white/5" : "hover:bg-gray-100"
              }`}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="custom-scrollbar flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Left: Gallery & Info */}
            <div className="space-y-8">
              <div>
                <h3 className="mb-4 text-xs font-normal uppercase tracking-[0.2em] text-gray-400">
                  Gallery
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/5 shadow-lg">
                    <img
                      src={car.image}
                      alt="Main"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 rounded-full bg-black/50 px-2 py-1 text-[8px] font-normal uppercase text-white">
                      Main
                    </div>
                  </div>
                  {/* Mock gallery images if car.images exists */}
                  {(car as any).images?.map((img: any, i: number) => (
                    <div
                      key={i}
                      className="relative aspect-video overflow-hidden rounded-2xl border border-white/5"
                    >
                      <img
                        src={img.url}
                        alt={img.label}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 rounded-full bg-black/50 px-2 py-1 text-[8px] font-normal uppercase text-white">
                        {img.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-xs font-normal uppercase tracking-[0.2em] text-gray-400">
                  Description
                </h3>
                <p className="text-sm font-normal leading-relaxed text-gray-500">
                  {car.description ||
                    "No description provided for this vehicle."}
                </p>
              </div>
            </div>

            {/* Right: Specs & Driver Info */}
            <div className="space-y-8">
              <div>
                <h3 className="mb-4 text-xs font-normal uppercase tracking-[0.2em] text-gray-400">
                  Specifications
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <SpecItem
                    icon={<Fuel />}
                    label="Fuel"
                    value={car.fuelType}
                    theme={theme}
                  />
                  <SpecItem
                    icon={<Settings2 />}
                    label="Gearbox"
                    value={car.transmission}
                    theme={theme}
                  />
                  <SpecItem
                    icon={<Users />}
                    label="Capacity"
                    value={`${car.passengers} Seats`}
                    theme={theme}
                  />
                  <SpecItem
                    icon={<MapPin />}
                    label="Location"
                    value={car.location}
                    theme={theme}
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-xs font-normal uppercase tracking-[0.2em] text-gray-400">
                  Pricing & Policies
                </h3>
                <div
                  className={`space-y-4 rounded-3xl p-6 ${theme === "dark" ? "bg-white/5" : "bg-gray-50"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-normal text-gray-500">
                      Daily Rate
                    </span>
                    <span className="text-xl font-normal text-green-500">
                      {formatCurrencySync(car.price)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-normal text-gray-500">
                      Security Deposit
                    </span>
                    <span className="text-lg font-normal text-blue-500">
                      {car.driverOption === "offered"
                        ? "None (Included)"
                        : formatCurrencySync(car.securityDeposit || 0)}
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-3 rounded-2xl p-3 ${car.driverOption === "offered"
                        ? "bg-purple-500/10"
                        : "bg-orange-500/10"
                      }`}
                  >
                    {car.driverOption === "offered" ? (
                      <UserCheck className="text-purple-500" />
                    ) : (
                      <AlertCircle className="text-orange-500" />
                    )}
                    <div>
                      <p
                        className={`text-xs font-normal uppercase ${car.driverOption === "offered"
                            ? "text-purple-500"
                            : "text-orange-500"
                          }`}
                      >
                        {car.driverOption === "offered"
                          ? "Driver Provided"
                          : "Self-Drive Rental"}
                      </p>
                      <p className="text-[10px] font-normal text-gray-500">
                        {car.driverOption === "offered"
                          ? "This car includes a professional driver service."
                          : "Valid driving license and security deposit required."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpecItem({ icon, label, value, theme }: any) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border p-4 ${theme === "dark"
          ? "border-white/5 bg-white/5"
          : "border-gray-100 bg-white shadow-sm"
        }`}
    >
      <div className="text-green-500">
        {React.cloneElement(icon, { className: "h-5 w-5" })}
      </div>
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
          {label}
        </p>
        <p className="text-xs font-black">{value}</p>
      </div>
    </div>
  );
}

function BookingItem({
  customer,
  car,
  date,
  amount,
  status,
  theme,
  onConfirm,
  onReject,
  onConfirmPickup,
  driverProvided,
  rating,
  review,
  professionalism,
  onClick,
}: any) {
  const statusColors: any = {
    ACCEPTED: "text-blue-500 bg-blue-500/10",
    COMPLETED: "text-green-500 bg-green-500/10",
    PENDING: "text-orange-500 bg-orange-500/10",
    CANCELLED: "text-red-500 bg-red-500/10",
    approved: "text-emerald-500 bg-emerald-500/10",
    picked_up: "text-purple-500 bg-purple-500/10",
    Paid: "text-green-600 bg-green-500/10",
    paid: "text-green-600 bg-green-500/10",
  };

  const statusLabels: any = {
    ACCEPTED: "Ongoing",
    COMPLETED: "Completed",
    PENDING: "Pending",
    CANCELLED: "Cancelled",
    approved: "Ready for Pickup",
    picked_up: "Picked Up",
    Paid: "Payment Received",
    paid: "Payment Received",
  };

  return (
    <div
      onClick={onClick}
      className={`flex cursor-pointer flex-col gap-4 rounded-[2.5rem] border p-6 transition-all hover:shadow-xl ${theme === "dark"
          ? "border-white/5 bg-[#121212]"
          : "border-gray-100 bg-white shadow-sm"
        }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl ${theme === "dark" ? "bg-white/5" : "bg-gray-50"
              }`}
          >
            <Clock className="h-7 w-7 text-gray-400" />
          </div>
          <div>
            <h4
              className={`text-lg font-black ${theme === "dark" ? "text-white" : "text-black"
                }`}
            >
              {customer}
            </h4>
            <p className="text-sm font-black text-gray-500">
              {car} • {date}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-black text-green-500">{amount}</p>
          <div
            className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${statusColors[status] || "text-gray-500 bg-gray-500/10"}`}
          >
            {statusLabels[status] || status}
          </div>
        </div>
      </div>

      <div
        className={`flex items-center justify-between rounded-2xl px-4 py-3 ${theme === "dark" ? "bg-white/5" : "bg-gray-50"
          }`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${driverProvided ? "bg-green-500" : "bg-orange-500"
              }`}
          />
          <span className="text-[10px] font-normal uppercase tracking-widest text-gray-500">
            {driverProvided
              ? "Driver Included"
              : "Self-Drive (Condition report required)"}
          </span>
        </div>
        <div className="flex gap-2">
          {(status?.toUpperCase() === "PENDING" || status?.toUpperCase() === "PAID") && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onReject(); }}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-normal transition-all ${theme === "dark"
                    ? "bg-white/5 text-red-500 hover:bg-red-500/10"
                    : "bg-white text-red-600 hover:bg-red-50 hover:shadow-sm"
                  }`}
              >
                <X className="h-4 w-4" />
                Reject
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onConfirm(); }}
                className="flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2 text-xs font-black !text-white transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-green-500/30"
              >
                <Check className="h-4 w-4 !text-white" />
                <span className="!text-white">Confirm</span>
              </button>
            </>
          )}
        </div>
      </div>

      {rating && (
        <div className={`mt-2 rounded-2xl p-4 ${theme === "dark" ? "bg-white/5" : "bg-gray-50"}`}>
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${i < rating ? "fill-orange-500 text-orange-500" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <span className="text-[10px] font-black uppercase text-orange-500">
                Customer Review
              </span>
            </div>
            {professionalism && (
              <span className="text-[9px] font-black uppercase text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">
                Professionalism: {professionalism}/5
              </span>
            )}
          </div>
          <p className="text-xs italic text-gray-500">"{review}"</p>
        </div>
      )}
    </div>
  );
}

function BookingDetailsModal({
  booking,
  isOpen,
  onClose,
  theme,
}: {
  booking: any;
  isOpen: boolean;
  onClose: () => void;
  theme: string;
}) {
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
        className={`relative flex h-full w-full max-w-2xl flex-col overflow-hidden shadow-2xl duration-300 animate-in slide-in-from-bottom-10 sm:h-auto sm:max-h-[90vh] sm:rounded-[3rem] sm:zoom-in-95 ${theme === "dark"
            ? "border border-white/5 bg-[#121212] text-white"
            : "bg-white text-gray-900"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-8 dark:border-white/5">
          <div>
            <h2 className="font-outfit text-2xl font-black">Booking Information</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
              Ref: {booking.id.slice(0, 8)} • Booked on {new Date(booking.created_at).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`rounded-full p-3 transition-colors ${theme === "dark" ? "hover:bg-white/5" : "hover:bg-gray-100"
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
              <div className={`flex items-center gap-4 rounded-3xl p-6 ${theme === "dark" ? "bg-white/5" : "bg-gray-50"}`}>
                <div className="h-16 w-16 overflow-hidden rounded-full ring-2 ring-green-500/20">
                  <img
                    src={booking.orderedBy?.profile_picture || "https://ui-avatars.com/api/?name=" + (booking.orderedBy?.name || "Customer")}
                    alt={booking.orderedBy?.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-lg font-black">{booking.orderedBy?.name}</h4>
                  <p className="text-sm text-gray-500">{booking.orderedBy?.email}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm font-black text-green-500">{booking.orderedBy?.phone}</span>
                    <span className="h-1 w-1 rounded-full bg-gray-300" />
                    <span className="text-[10px] font-black uppercase text-gray-400">{booking.guests || 1} Guests</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Trip Details */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className={`rounded-3xl p-6 ${theme === "dark" ? "bg-white/5" : "bg-gray-50"}`}>
                <p className="mb-1 text-[10px] font-normal uppercase tracking-widest text-gray-400">Duration</p>
                <p className="text-lg font-black">{diffDays} Day(s)</p>
                <div className="mt-2 text-xs text-gray-500">
                  {new Date(booking.pickup_date).toLocaleDateString()} - {new Date(booking.return_date).toLocaleDateString()}
                </div>
              </div>
              <div className={`rounded-3xl p-6 ${theme === "dark" ? "bg-white/5" : "bg-gray-50"}`}>
                <p className="mb-1 text-[10px] font-normal uppercase tracking-widest text-gray-400">Total Price Paid</p>
                <p className="text-2xl font-black text-green-500">{formatCurrencySync(booking.amount)}</p>
                <div className="mt-1 flex flex-col gap-1">
                  <div className="text-[10px] font-black uppercase text-gray-400">Payment Status: {booking.status}</div>
                  {booking.refundable_fee && parseFloat(booking.refundable_fee) > 0 && (
                    <div className="text-[10px] font-black uppercase text-orange-500">Includes Refundable Deposit: {formatCurrencySync(booking.refundable_fee)}</div>
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
                  <div className={`flex h-full w-full flex-col items-center justify-center ${theme === "dark" ? "bg-white/5" : "bg-gray-50"}`}>
                    <AlertCircle className="mb-2 h-8 w-8 text-orange-500/50" />
                    <p className="text-sm font-normal text-gray-400">License document not available</p>
                  </div>
                )}
              </div>
            </section>

            {/* Condition Video - ONLY SHOW IF PICKED UP OR COMPLETED */}
            {booking.carVideo_Status && (booking.status === "picked_up" || booking.status === "COMPLETED") && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
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
