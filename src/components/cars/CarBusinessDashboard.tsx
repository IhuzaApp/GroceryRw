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
  MoreVertical
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { DUMMY_CARS, Car } from "../../constants/dummyCars";
import AddVehicleModal from "./modals/AddVehicleModal";
import EditVehicleModal from "./modals/EditVehicleModal";
import DashboardHeader from "./DashboardHeader";
import CameraCapture from "../ui/CameraCapture";
import toast from "react-hot-toast";
import { formatCurrencySync } from "../../utils/formatCurrency";

const CarIcon = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M3 8L5.72187 10.2682C5.90158 10.418 6.12811 10.5 6.36205 10.5H17.6379C17.8719 10.5 18.0984 10.418 18.2781 10.2682L21 8M6.5 14H6.51M17.5 14H17.51M8.16065 4.5H15.8394C16.5571 4.5 17.2198 4.88457 17.5758 5.50772L20.473 10.5777C20.8183 11.1821 21 11.8661 21 12.5623V18.5C21 19.0523 20.5523 19.5 20 19.5H19C18.4477 19.5 18 19.0523 18 18.5V17.5H6V18.5C6 19.0523 5.55228 19.5 5 19.5H4C3.44772 19.5 3 19.0523 3 18.5V12.5623C3 11.8661 3.18166 11.1821 3.52703 10.5777L6.42416 5.50772C6.78024 4.88457 7.44293 4.5 8.16065 4.5ZM7 14C7 14.2761 6.77614 14.5 6.5 14.5C6.22386 14.5 6 14.2761 6 14C6 13.7239 6.22386 13.5 6.5 13.5C6.77614 13.5 7 13.7239 7 14ZM18 14C18 14.2761 17.7761 14.5 17.5 14.5C17.2239 14.5 17 14.2761 17 14C17 13.7239 17.2239 13.5 17.5 13.5C17.7761 13.5 18 13.7239 18 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function CarBusinessDashboard() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'fleet' | 'bookings'>('fleet');
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [walletBalance] = useState(2450800);
  const [cars, setCars] = useState(DUMMY_CARS);

  const handleToggleStatus = (id: string) => {
    setCars(prev => prev.map(car => 
      car.id === id ? { ...car, status: car.status === 'active' ? 'disabled' : 'active' } : car
    ));
    toast.success("Status updated");
  };

  const handleEdit = (car: Car) => {
    setSelectedCar(car);
    setIsEditModalOpen(true);
  };

  const handleViewDetails = (car: Car) => {
    setSelectedCar(car);
    setIsDetailsModalOpen(true);
  };

  const handleConfirmBooking = (booking: any) => {
    setSelectedBooking(booking);
    // If no driver provided, require camera capture
    if (!booking.driverProvided) {
      setIsCameraOpen(true);
    } else {
      toast.success("Booking confirmed!");
    }
  };

  const handleCaptureComplete = (imageData: string) => {
    console.log("Vehicle condition captured:", imageData);
    setIsCameraOpen(false);
    toast.success("Booking confirmed with condition report!");
  };

  const handleRejectBooking = (booking: any) => {
    setSelectedBooking(booking);
    setIsRejectionModalOpen(true);
  };

  const submitRejection = () => {
    if (!rejectionReason) {
      toast.error("Please provide a reason");
      return;
    }
    toast.success("Booking rejected");
    setIsRejectionModalOpen(false);
    setRejectionReason("");
  };

  return (
    <div className={`min-h-screen pb-24 md:ml-20 ${theme === 'dark' ? 'bg-[#0A0A0A] text-white' : 'bg-white text-black'}`}>
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
            <StatsCard label="Revenue" value="$12.4k" icon={<TrendingUp />} color="green" theme={theme} />
            <StatsCard label="Fleet" value={cars.length.toString()} icon={<CarIcon />} color="blue" theme={theme} />
            <StatsCard label="Bookings" value="12" icon={<CalendarCheck />} color="purple" theme={theme} />
            <StatsCard label="Rating" value="4.8" icon={<Star />} color="orange" theme={theme} />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 flex gap-8 border-b border-gray-200/10">
          <button 
            onClick={() => setActiveTab('fleet')}
            className={`pb-4 text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'fleet' ? 'border-b-2 border-green-500 text-green-500' : 'text-gray-500 hover:text-gray-400'}`}
          >
            My Fleet
          </button>
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`pb-4 text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'bookings' ? 'border-b-2 border-green-500 text-green-500' : 'text-gray-500 hover:text-gray-400'}`}
          >
            Bookings
          </button>
        </div>

        {activeTab === 'fleet' ? (
          <div className="space-y-4">
            <div className="mb-6 flex items-center justify-between">
              <div className={`flex flex-1 max-w-md items-center rounded-2xl border px-4 py-3 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                <Search className="h-4 w-4 text-gray-400" />
                <input type="text" placeholder="Search fleet..." className="ml-3 flex-1 bg-transparent text-sm font-black outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {cars.map((car) => (
                <FleetItem 
                  key={car.id} 
                  car={car} 
                  theme={theme} 
                  onEdit={() => handleEdit(car)}
                  onToggleStatus={() => handleToggleStatus(car.id)}
                  onView={() => handleViewDetails(car)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <BookingItem 
              customer="John Doe" 
              car="Tesla Model 3" 
              date="Oct 24 - Oct 26" 
              amount="$160.00" 
              status="Ongoing" 
              driverProvided={false}
              theme={theme}
              onConfirm={() => handleConfirmBooking({ customer: "John Doe", driverProvided: false })}
              onReject={() => handleRejectBooking({ customer: "John Doe" })}
            />
            <BookingItem 
              customer="Jane Smith" 
              car="Toyota RAV4" 
              date="Oct 22 - Oct 23" 
              amount="$65.00" 
              status="Completed" 
              driverProvided={true}
              theme={theme}
              onConfirm={() => handleConfirmBooking({ customer: "Jane Smith", driverProvided: true })}
              onReject={() => handleRejectBooking({ customer: "Jane Smith" })}
            />
          </div>
        )}
      </div>

      <AddVehicleModal 
        isOpen={isAddVehicleOpen} 
        onClose={() => setIsAddVehicleOpen(false)} 
        theme={theme} 
        onSubmit={(data) => {
          setCars(prev => [...prev, { ...data, id: Math.random().toString(36).substr(2, 9), status: 'active', rating: 5, reviews: [] }]);
          toast.success("Vehicle added to fleet!");
        }}
      />

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
            setCars(prev => prev.map(c => c.id === selectedCar.id ? { ...c, ...data } : c));
            toast.success("Vehicle updated!");
          }}
        />
      )}

      {/* Rejection Modal */}
      {isRejectionModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsRejectionModalOpen(false)} />
          <div className={`relative w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl ${theme === 'dark' ? 'bg-[#121212] border border-white/10' : 'bg-white'}`}>
            <h3 className="text-2xl font-black mb-4">Reject Booking</h3>
            <p className="text-gray-500 mb-6 font-normal">Please provide a reason for rejecting this booking.</p>
            <textarea 
              className={`w-full rounded-2xl border p-4 text-sm font-normal outline-none h-32 mb-6 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}
              placeholder="e.g. Vehicle maintenance, fully booked..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div className="flex gap-3">
              <button 
                onClick={() => setIsRejectionModalOpen(false)}
                className={`flex-1 rounded-2xl py-4 font-normal transition-all ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}`}
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
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCaptureComplete}
        mode="video"
        title="Vehicle Condition Report"
        maxVideoDuration={15}
      />
    </div>
  );
}

function StatsCard({ label, value, icon, color, theme }: { label: string, value: string, icon: React.ReactNode, color: string, theme: string }) {
  const colors: Record<string, string> = {
    green: 'text-green-500 bg-green-500/10',
    blue: 'text-blue-500 bg-blue-500/10',
    purple: 'text-purple-500 bg-purple-500/10',
    orange: 'text-orange-500 bg-orange-500/10',
  };

  return (
    <div className={`rounded-[2rem] border p-5 transition-all hover:shadow-xl ${theme === 'dark' ? 'bg-[#121212] border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}>
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${colors[color]}`}>
        {React.cloneElement(icon as React.ReactElement, { className: "h-5 w-5" })}
      </div>
      <p className="mb-0.5 text-[10px] font-black uppercase tracking-[0.1em] text-gray-500">{label}</p>
      <h3 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{value}</h3>
    </div>
  );
}

function WalletBalanceCard({ balance, theme }: { balance: number, theme: string }) {
  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8 shadow-2xl shadow-black/20">
      {/* Decorative elements */}
      <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-gradient-to-br from-yellow-400/20 to-transparent blur-3xl" />
      <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-gradient-to-tr from-emerald-500/20 to-transparent blur-2xl" />

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="h-8 w-12 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg shadow-yellow-500/20" />
            <span className="text-[10px] font-black tracking-[0.2em] text-yellow-500 uppercase">VIP PARTNER</span>
          </div>
          <Wallet className="h-6 w-6 text-yellow-500" />
        </div>

        <div className="mb-8">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Available Balance</p>
          <h2 className="text-3xl font-black text-white tracking-tight">{formatCurrencySync(balance)}</h2>
        </div>

        <div className="flex items-end justify-between">
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              {[1,2,3,4].map(i => <div key={i} className="h-1.5 w-1.5 rounded-full bg-yellow-500/40" />)}
            </div>
            <span className="font-mono text-xs text-gray-500 tracking-widest">BUSINESS CARD</span>
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

function FleetItem({ car, theme, onEdit, onToggleStatus, onView }: { car: Car, theme: string, onEdit: () => void, onToggleStatus: () => void, onView: () => void }) {
  return (
    <div className={`flex items-center justify-between rounded-[2rem] border p-3 sm:p-4 transition-all hover:shadow-lg ${
      theme === 'dark' ? 'bg-[#121212] border-white/5 hover:bg-white/[0.07]' : 'bg-white border-gray-100 hover:bg-gray-50 shadow-sm'
    }`}>
      <div className="flex items-center gap-3 sm:gap-5 min-w-0">
        <div className="h-16 w-24 sm:h-20 sm:w-32 shrink-0 overflow-hidden rounded-2xl border border-white/5">
          <img src={car.image} alt={car.name} className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0">
          <h4 className={`text-lg font-black leading-tight ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{car.name}</h4>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{car.type} • {car.fuelType}</p>
          <div className="mt-2 flex items-center gap-3">
            <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-normal uppercase tracking-wider ${
              car.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
            }`}>
              <Circle className="h-2 w-2 fill-current" />
              {car.status}
            </div>
            <span className="text-sm font-normal text-green-600">${car.price}/day</span>
          </div>
        </div>
      </div>
      {/* Desktop Actions */}
      <div className="hidden items-center gap-2 pr-2 sm:flex">
        <button 
          onClick={onToggleStatus}
          title={car.status === 'active' ? 'Disable listing' : 'Enable listing'}
          className={`rounded-xl p-3 transition-colors ${theme === 'dark' ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-200 text-gray-600'}`}
        >
          <Clock className="h-5 w-5" />
        </button>
        <button 
          onClick={onEdit}
          title="Edit details"
          className={`rounded-xl p-3 transition-colors ${theme === 'dark' ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-200 text-gray-600'}`}
        >
          <Edit2 className="h-5 w-5" />
        </button>
        <button 
          onClick={onView}
          title="View all details"
          className={`rounded-xl p-3 transition-colors ${theme === 'dark' ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-200 text-gray-600'}`}
        >
          <Eye className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile Actions Dropdown - Icon Trigger */}
      <div className="relative sm:hidden pr-1">
        <div className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
          theme === 'dark' ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-600'
        }`}>
          <MoreVertical className="h-5 w-5" />
          <select 
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'edit') onEdit();
              else if (val === 'toggle') onToggleStatus();
              else if (val === 'view') onView();
              e.target.value = "";
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            defaultValue=""
          >
            <option value="" disabled>Actions</option>
            <option value="view">View Details</option>
            <option value="edit">Edit Vehicle</option>
            <option value="toggle">{car.status === 'active' ? 'Disable' : 'Enable'} Listing</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function CarDetailsModal({ car, isOpen, onClose, theme }: { car: Car, isOpen: boolean, onClose: () => void, theme: string }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className={`relative flex flex-col w-full max-w-4xl h-full sm:h-auto sm:max-h-[90vh] overflow-hidden sm:rounded-[3rem] shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 ${
        theme === 'dark' ? 'bg-[#121212] border border-white/5 text-white' : 'bg-white text-gray-900'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-8 dark:border-white/5">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 overflow-hidden rounded-2xl">
              <img src={car.image} alt={car.name} className="h-full w-full object-cover" />
            </div>
            <div>
              <h2 className="text-2xl font-black font-outfit">{car.name}</h2>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{car.year} • {car.type}</p>
            </div>
          </div>
          <button onClick={onClose} className={`rounded-full p-3 transition-colors ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}>
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Left: Gallery & Info */}
            <div className="space-y-8">
              <div>
                <h3 className="text-xs font-normal uppercase tracking-[0.2em] text-gray-400 mb-4">Gallery</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/5 shadow-lg">
                    <img src={car.image} alt="Main" className="h-full w-full object-cover" />
                    <div className="absolute bottom-2 left-2 rounded-full bg-black/50 px-2 py-1 text-[8px] font-normal text-white uppercase">Main</div>
                  </div>
                  {/* Mock gallery images if car.images exists */}
                  {(car as any).images?.map((img: any, i: number) => (
                    <div key={i} className="relative aspect-video overflow-hidden rounded-2xl border border-white/5">
                      <img src={img.url} alt={img.label} className="h-full w-full object-cover" />
                      <div className="absolute bottom-2 left-2 rounded-full bg-black/50 px-2 py-1 text-[8px] font-normal text-white uppercase">{img.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-normal uppercase tracking-[0.2em] text-gray-400 mb-4">Description</h3>
                <p className="text-sm font-normal text-gray-500 leading-relaxed">
                  {car.description || "No description provided for this vehicle."}
                </p>
              </div>
            </div>

            {/* Right: Specs & Driver Info */}
            <div className="space-y-8">
              <div>
                <h3 className="text-xs font-normal uppercase tracking-[0.2em] text-gray-400 mb-4">Specifications</h3>
                <div className="grid grid-cols-2 gap-4">
                  <SpecItem icon={<Fuel />} label="Fuel" value={car.fuelType} theme={theme} />
                  <SpecItem icon={<Settings2 />} label="Gearbox" value={car.transmission} theme={theme} />
                  <SpecItem icon={<Users />} label="Capacity" value={`${car.passengers} Seats`} theme={theme} />
                  <SpecItem icon={<MapPin />} label="Location" value={car.location} theme={theme} />
                </div>
              </div>

              <div>
                <h3 className="text-xs font-normal uppercase tracking-[0.2em] text-gray-400 mb-4">Pricing & Policies</h3>
                <div className={`rounded-3xl p-6 space-y-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-normal text-gray-500">Daily Rate</span>
                    <span className="text-xl font-normal text-green-500">{formatCurrencySync(car.price)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-normal text-gray-500">Security Deposit</span>
                    <span className="text-lg font-normal text-blue-500">
                      {car.driverOption === 'offered' ? 'None (Included)' : formatCurrencySync(car.securityDeposit || 0)}
                    </span>
                  </div>
                  <div className={`flex items-center gap-3 p-3 rounded-2xl ${car.driverOption === 'offered' ? 'bg-purple-500/10' : 'bg-orange-500/10'}`}>
                    {car.driverOption === 'offered' ? <UserCheck className="text-purple-500" /> : <AlertCircle className="text-orange-500" />}
                    <div>
                      <p className={`text-xs font-normal uppercase ${car.driverOption === 'offered' ? 'text-purple-500' : 'text-orange-500'}`}>
                        {car.driverOption === 'offered' ? 'Driver Provided' : 'Self-Drive Rental'}
                      </p>
                      <p className="text-[10px] font-normal text-gray-500">
                        {car.driverOption === 'offered' 
                          ? 'This car includes a professional driver service.' 
                          : 'Valid driving license and security deposit required.'}
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
    <div className={`flex items-center gap-3 rounded-2xl border p-4 ${theme === 'dark' ? 'border-white/5 bg-white/5' : 'bg-white border-gray-100 shadow-sm'}`}>
      <div className="text-green-500">
        {React.cloneElement(icon, { className: "h-5 w-5" })}
      </div>
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{label}</p>
        <p className="text-xs font-black">{value}</p>
      </div>
    </div>
  );
}

function BookingItem({ customer, car, date, amount, status, theme, onConfirm, onReject, driverProvided }: any) {
  const statusColors: any = {
    Ongoing: 'text-blue-500 bg-blue-500/10',
    Completed: 'text-green-500 bg-green-500/10',
    Upcoming: 'text-orange-500 bg-orange-500/10',
  };

  return (
    <div className={`flex flex-col gap-4 rounded-[2.5rem] border p-6 transition-all hover:shadow-xl ${
      theme === 'dark' ? 'bg-[#121212] border-white/5' : 'bg-white border-gray-100 shadow-sm'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
            <Clock className="h-7 w-7 text-gray-400" />
          </div>
          <div>
            <h4 className={`text-lg font-black ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{customer}</h4>
            <p className="text-sm font-black text-gray-500">{car} • {date}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-black text-green-500">{amount}</p>
          <div className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${statusColors[status]}`}>
            {status}
          </div>
        </div>
      </div>

      <div className={`flex items-center justify-between rounded-2xl px-4 py-3 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${driverProvided ? 'bg-green-500' : 'bg-orange-500'}`} />
          <span className="text-[10px] font-normal uppercase tracking-widest text-gray-500">
            {driverProvided ? 'Driver Included' : 'Self-Drive (Condition report required)'}
          </span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onReject}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-normal transition-all ${
              theme === 'dark' ? 'bg-white/5 text-red-500 hover:bg-red-500/10' : 'bg-white text-red-600 hover:bg-red-50 hover:shadow-sm'
            }`}
          >
            <X className="h-4 w-4" />
            Reject
          </button>
          <button 
            onClick={onConfirm}
            className="flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2 text-xs font-black !text-white transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-green-500/30"
          >
            <Check className="h-4 w-4 !text-white" />
            <span className="!text-white">Confirm</span>
          </button>
        </div>
      </div>
    </div>
  );
}
