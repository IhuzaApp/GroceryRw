import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { useSession } from "next-auth/react";
import { authenticatedFetch } from "../../../lib/authenticatedFetch";
import {
  MapPin,
  Phone,
  User,
  Package,
  Calendar,
  Clock,
  ChevronRight,
  X,
  Camera,
  ShieldCheck,
  ArrowRight,
  Wallet,
  Smartphone,
  CheckCircle2,
  CreditCard,
  Info,
  Loader2,
} from "lucide-react";
import { storage } from "../../../lib/firebase";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import CameraCapture from "../CameraCapture";
import PaymentProcessingOverlay from "../pos/registration/PaymentProcessingOverlay";
import toast from "react-hot-toast";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    maximumFractionDigits: 0,
  }).format(amount);
};

interface PackageDeliveryModalProps {
  open: boolean;
  onClose: () => void;
}

interface SavedPaymentMethod {
  id: string;
  method: string;
  names: string;
  number: string;
  is_default: boolean;
}

interface UserAddress {
  id: string;
  street: string;
  city: string;
  type?: string;
  latitude?: string | number;
  longitude?: string | number;
  placeDetails?: {
    gateNumber?: string;
    gateColor?: string;
    floor?: string;
    doorNumber?: string;
  };
  is_default: boolean;
}

const formatPhoneForMoMo = (phone: string) => {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("07")) {
    cleaned = "25" + cleaned;
  } else if (!cleaned.startsWith("250")) {
    cleaned = "250" + cleaned;
  }
  return cleaned;
};

export default function PackageDeliveryModal({
  open,
  onClose,
}: PackageDeliveryModalProps) {
  const { theme } = useTheme();
  const { data: session } = useSession();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    pickup: "",
    pickupType: "Home",
    pickupOfficeName: "",
    pickupFloor: "",
    pickupGateNumber: "",
    pickupGateColor: "",
    pickupRoomNumber: "",
    pickupApartmentName: "",
    pickupHotelName: "",
    dropoff: "",
    dropoffType: "Home",
    dropoffOfficeName: "",
    dropoffFloor: "",
    dropoffGateNumber: "",
    dropoffGateColor: "",
    dropoffRoomNumber: "",
    dropoffApartmentName: "",
    dropoffHotelName: "",
    receiverName: "",
    receiverPhone: "",
    instructions: "",
    deliveryId: "",
    capturedImage: "",
    deliveryType: "instant", // instant | scheduled
    scheduledDate: "",
    scheduledTime: "",
    transportMethod: "motorbike", // foot | bicycle | motorbike | car
    distance: 0,
    calculatedFee: 0,
    pickupLat: "",
    pickupLng: "",
    dropoffLat: "",
    dropoffLng: "",
  });

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [userAddresses, setUserAddresses] = useState<UserAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [systemConfig, setSystemConfig] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<
    SavedPaymentMethod[]
  >([]);
  const [oneTimePhoneNumber, setOneTimePhoneNumber] = useState("");
  const [selectedPaymentValue, setSelectedPaymentValue] = useState<
    string | null
  >(null);
  const [processingStep, setProcessingStep] = useState<
    "idle" | "initiating_payment" | "awaiting_approval" | "success"
  >("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const pickupInputRef = useRef<HTMLInputElement>(null);
  const dropoffInputRef = useRef<HTMLInputElement>(null);

  // Generate Unique Delivery ID
  useEffect(() => {
    if (open && !formData.deliveryId) {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No easy-to-confuse O/0, I/1
      let result = "";
      for (let i = 0; i < 5; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setFormData((prev) => ({ ...prev, deliveryId: `PG-${result}` }));
    }
  }, [open, formData.deliveryId]);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (!open || step !== 1) return;

    let pickupAutocomplete: google.maps.places.Autocomplete | null = null;
    let dropoffAutocomplete: google.maps.places.Autocomplete | null = null;

    const initAutocomplete = () => {
      if (
        typeof window !== "undefined" &&
        window.google &&
        window.google.maps &&
        window.google.maps.places &&
        window.google.maps.places.Autocomplete
      ) {
        if (pickupInputRef.current) {
          pickupAutocomplete = new window.google.maps.places.Autocomplete(
            pickupInputRef.current,
            {
              types: ["address"],
              componentRestrictions: { country: "rw" },
            }
          );

          pickupAutocomplete?.addListener("place_changed", () => {
            if (pickupAutocomplete) {
              const place = pickupAutocomplete.getPlace();
              if (place?.formatted_address) {
                const lat = place.geometry?.location?.lat();
                const lng = place.geometry?.location?.lng();
                setFormData((prev) => ({
                  ...prev,
                  pickup: place.formatted_address!,
                  pickupLat: lat?.toString() || "",
                  pickupLng: lng?.toString() || "",
                }));
              }
            }
          });
        }

        if (dropoffInputRef.current) {
          dropoffAutocomplete = new window.google.maps.places.Autocomplete(
            dropoffInputRef.current,
            {
              types: ["address"],
              componentRestrictions: { country: "rw" },
            }
          );

          dropoffAutocomplete?.addListener("place_changed", () => {
            if (dropoffAutocomplete) {
              const place = dropoffAutocomplete.getPlace();
              if (place?.formatted_address) {
                const lat = place.geometry?.location?.lat();
                const lng = place.geometry?.location?.lng();
                setFormData((prev) => ({
                  ...prev,
                  dropoff: place.formatted_address!,
                  dropoffLat: lat?.toString() || "",
                  dropoffLng: lng?.toString() || "",
                }));
              }
            }
          });
        }
      }
    };

    // Check if Google Maps is already loaded
    if (typeof window !== "undefined" && window.google?.maps?.places) {
      initAutocomplete();
    } else {
      // Script loading handled by LandingPage or Header, but we double-check here
      const checkGoogleMaps = setInterval(() => {
        if (window.google?.maps?.places) {
          clearInterval(checkGoogleMaps);
          initAutocomplete();
        }
      }, 100);
      return () => clearInterval(checkGoogleMaps);
    }

    return () => {
      if (pickupAutocomplete) {
        window.google?.maps?.event?.clearInstanceListeners(pickupAutocomplete);
      }
      if (dropoffAutocomplete) {
        window.google?.maps?.event?.clearInstanceListeners(dropoffAutocomplete);
      }
    };
  }, [open, step]);

  // Fetch System Config
  useEffect(() => {
    if (open) {
      authenticatedFetch("/api/queries/system-config")
        .then((res) => res.json())
        .then((data) => {
          if (data?.config) {
            setSystemConfig(data.config);
          }
        })
        .catch((err) => console.error("Error fetching system config:", err));
    }
  }, [open]);

  // Fetch Wallet Balance
  const fetchWalletBalance = async () => {
    try {
      const res = await authenticatedFetch(
        "/api/queries/personal-wallet-balance"
      );
      const data = await res.json();
      if (data?.wallet) {
        setWalletBalance(parseFloat(data.wallet.balance || "0"));
      }
    } catch (err) {
      console.error("Error fetching wallet balance:", err);
    }
  };

  useEffect(() => {
    if (open && session?.user?.id) {
      // Fetch Wallet Balance
      fetchWalletBalance();

      // Fetch Saved Addresses
      setLoadingAddresses(true);
      authenticatedFetch("/api/queries/addresses")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.addresses) {
            setUserAddresses(data.addresses);
          }
          setLoadingAddresses(false);
        })
        .catch((err) => {
          console.error("Error fetching addresses:", err);
          setLoadingAddresses(false);
        });

      // Fetch Saved Payment Methods
      authenticatedFetch("/api/queries/payment-methods")
        .then((res) => res.json())
        .then((data) => {
          if (data?.paymentMethods) {
            setSavedPaymentMethods(data.paymentMethods);
          }
        })
        .catch((err) => console.error("Error fetching payment methods:", err));
    }
  }, [open, session?.user?.id]);

  // Recalculate fee when transport method changes
  useEffect(() => {
    if (step === 4 && formData.distance > 0) {
      let finalFee = 0;
      if (systemConfig) {
        const mode = formData.transportMethod as keyof any;
        const modeConfig = systemConfig.deliveryModes?.[mode] || {};

        const baseFee = Number(
          modeConfig.baseDeliveryFee ?? systemConfig.baseDeliveryFee ?? 1000
        );
        const surcharge = Number(
          modeConfig.distanceSurcharge ?? systemConfig.distanceSurcharge ?? 300
        );

        finalFee = baseFee;
        if (formData.distance > 2) {
          finalFee += Math.max(0, formData.distance - 2) * surcharge;
        }
      }
      setFormData((prev) => ({ ...prev, calculatedFee: Math.round(finalFee) }));
    }
  }, [formData.transportMethod, systemConfig, step]);

  // Handle distance-based transportation restrictions
  useEffect(() => {
    if (formData.distance > 8 && formData.transportMethod === "bicycle") {
      setFormData((prev) => ({ ...prev, transportMethod: "motorbike" }));
    } else if (formData.distance > 2 && formData.transportMethod === "foot") {
      setFormData((prev) => ({ ...prev, transportMethod: "motorbike" }));
    }
  }, [formData.distance]);

  if (!open) return null;

  const applyAddressToForm = (addr: UserAddress, isPickup: boolean) => {
    const rawType = addr.type?.toLowerCase() || "";
    let mappedType = "Home";
    if (rawType === "office") mappedType = "Office";
    else if (rawType === "apartment") mappedType = "Apartment";
    else if (rawType === "hotel") mappedType = "Hotel";
    else if (rawType === "house") mappedType = "Home";

    const details = addr.placeDetails || {};

    if (isPickup) {
      setFormData((prev) => ({
        ...prev,
        pickup: addr.street,
        pickupType: mappedType,
        pickupLat: addr.latitude?.toString() || "",
        pickupLng: addr.longitude?.toString() || "",
        pickupGateNumber: details.gateNumber || "",
        pickupGateColor: details.gateColor || "",
        pickupFloor: details.floor || "",
        pickupRoomNumber: details.doorNumber || "",
        pickupOfficeName: "",
        pickupApartmentName: "",
        pickupHotelName: "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        dropoff: addr.street,
        dropoffType: mappedType,
        dropoffLat: addr.latitude?.toString() || "",
        dropoffLng: addr.longitude?.toString() || "",
        dropoffGateNumber: details.gateNumber || "",
        dropoffGateColor: details.gateColor || "",
        dropoffFloor: details.floor || "",
        dropoffRoomNumber: details.doorNumber || "",
        dropoffOfficeName: "",
        dropoffApartmentName: "",
        dropoffHotelName: "",
      }));
    }
  };

  const handleClose = () => {
    setStep(1);
    setFormData({
      pickup: "",
      pickupType: "Home",
      pickupOfficeName: "",
      pickupFloor: "",
      pickupGateNumber: "",
      pickupGateColor: "",
      pickupRoomNumber: "",
      pickupApartmentName: "",
      pickupHotelName: "",
      dropoff: "",
      dropoffType: "Home",
      dropoffOfficeName: "",
      dropoffFloor: "",
      dropoffGateNumber: "",
      dropoffGateColor: "",
      dropoffRoomNumber: "",
      dropoffApartmentName: "",
      dropoffHotelName: "",
      receiverName: "",
      receiverPhone: "",
      instructions: "",
      deliveryId: "",
      capturedImage: "",
      deliveryType: "instant",
      scheduledDate: "",
      scheduledTime: "",
      transportMethod: "motorbike",
      distance: 0,
      calculatedFee: 0,
      paymentMethod: "",
    });
    setProcessingStep("idle");
    setIsSubmitting(false);
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    onClose();
  };

  const calculateDistanceAndFee = async () => {
    if (!formData.pickup || !formData.dropoff || !window.google) return;

    setIsCalculating(true);
    const service = new google.maps.DistanceMatrixService();

    try {
      const response = await service.getDistanceMatrix({
        origins: [formData.pickup],
        destinations: [formData.dropoff],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
      });

      const element = response.rows[0].elements[0];
      if (element.status === "OK") {
        const distKm = element.distance.value / 1000;
        const roundedDist = Math.round(distKm * 10) / 10;

        // Calculate Fee
        let finalFee = 0;
        if (systemConfig) {
          const mode = formData.transportMethod as keyof any;
          const modeConfig = systemConfig.deliveryModes?.[mode] || {};

          const baseFee = Number(
            modeConfig.baseDeliveryFee ?? systemConfig.baseDeliveryFee ?? 1000
          );
          const surcharge = Number(
            modeConfig.distanceSurcharge ??
              systemConfig.distanceSurcharge ??
              300
          );

          finalFee = baseFee;
          if (roundedDist > 2) {
            finalFee += Math.max(0, roundedDist - 2) * surcharge;
          }
        }

        setFormData((prev) => ({
          ...prev,
          distance: roundedDist,
          calculatedFee: Math.round(finalFee),
        }));
      }
    } catch (error) {
      console.error("Error calculating distance:", error);
    } finally {
      setIsCalculating(false);
    }
  };

  const nextStep = () => {
    if (step === 3) {
      calculateDistanceAndFee();
    }
    setStep((s) => Math.min(s + 1, 5));
  };
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    if (!selectedPaymentValue) {
      toast.error("Please select a payment method");
      return;
    }

    let finalPaymentMethod: "wallet" | "momo" = "momo";
    let momoPhoneNumber = "";

    if (selectedPaymentValue === "wallet") {
      finalPaymentMethod = "wallet";
      if (walletBalance < formData.calculatedFee) {
        toast.error("Insufficient wallet balance");
        return;
      }
    } else if (selectedPaymentValue === "other") {
      finalPaymentMethod = "momo";
      momoPhoneNumber = oneTimePhoneNumber;
      if (!momoPhoneNumber || momoPhoneNumber.length < 10) {
        toast.error("Please enter a valid phone number");
        return;
      }
    } else {
      finalPaymentMethod = "momo";
      const method = savedPaymentMethods.find(
        (m) => m.id === selectedPaymentValue
      );
      if (method) {
        momoPhoneNumber = method.number;
      }
    }

    setIsSubmitting(true);

    try {
      // 0. Upload Image to Firebase if exists
      let finalImageUrl = formData.capturedImage;
      if (
        formData.capturedImage &&
        formData.capturedImage.startsWith("data:image")
      ) {
        try {
          const storageRef = ref(
            storage!,
            `package-deliveries/${Date.now()}-${formData.deliveryId}.jpg`
          );
          await uploadString(storageRef, formData.capturedImage, "data_url");
          finalImageUrl = await getDownloadURL(storageRef);
        } catch (uploadError) {
          console.error(
            "Firebase upload failed, falling back to base64:",
            uploadError
          );
        }
      }

      const getFilteredDetails = (type: string, isPickup: boolean) => {
        const details = isPickup
          ? {
              officeName: formData.pickupOfficeName,
              floor: formData.pickupFloor,
              gateNumber: formData.pickupGateNumber,
              gateColor: formData.pickupGateColor,
              roomNumber: formData.pickupRoomNumber,
              apartmentName: formData.pickupApartmentName,
              hotelName: formData.pickupHotelName,
            }
          : {
              officeName: formData.dropoffOfficeName,
              floor: formData.dropoffFloor,
              gateNumber: formData.dropoffGateNumber,
              gateColor: formData.dropoffGateColor,
              roomNumber: formData.dropoffRoomNumber,
              apartmentName: formData.dropoffApartmentName,
              hotelName: formData.dropoffHotelName,
            };

        if (type === "Home")
          return {
            type,
            gateNumber: details.gateNumber,
            gateColor: details.gateColor,
          };
        if (type === "Office")
          return { type, officeName: details.officeName, floor: details.floor };
        if (type === "Apartment")
          return {
            type,
            apartmentName: details.apartmentName,
            gateNumber: details.gateNumber,
            floor: details.floor,
          };
        if (type === "Hotel")
          return {
            type,
            hotelName: details.hotelName,
            roomNumber: details.roomNumber,
          };
        return { type };
      };

      const isScheduled = formData.deliveryType === "scheduled";

      // 1. Create the delivery record
      const payload = {
        DeliveryCode: formData.deliveryId,
        comment: formData.instructions,
        deliveryMethod: formData.transportMethod,
        delivery_fee: formData.calculatedFee.toString(),
        distance: formData.distance.toString(),
        dropoffDetails: getFilteredDetails(formData.dropoffType, false),
        dropoffLocation: formData.dropoff,
        dropoff_latitude: formData.dropoffLat,
        dropoff_longitude: formData.dropoffLng,
        package_image: finalImageUrl,
        payment_method: finalPaymentMethod,
        pickupDetials: getFilteredDetails(formData.pickupType, true),
        pickupLocation: formData.pickup,
        pickup_latitude: formData.pickupLat,
        pickup_longitude: formData.pickupLng,
        receiverName: formData.receiverName,
        receiverPhone: formData.receiverPhone,
        status: finalPaymentMethod === "momo" ? "AWAITING_PAYMENT" : "PENDING",
        scheduled: isScheduled,
        timeAndDate: isScheduled
          ? {
              type: formData.deliveryType,
              date: formData.scheduledDate,
              time: formData.scheduledTime,
            }
          : null,
      };

      const response = await authenticatedFetch(
        "/api/mutations/insert-package-delivery",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create delivery");
      }

      const deliveryId = result.data.insert_package_delivery.returning[0].id;

      // 2. Handle Payment
      if (finalPaymentMethod === "momo") {
        const phone =
          momoPhoneNumber || session?.user?.phone || formData.receiverPhone;
        if (!phone) throw new Error("Phone number required for MoMo");

        setProcessingStep("initiating_payment");
        const momoRes = await fetch("/api/momo/request-to-pay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: formData.calculatedFee,
            currency: "RWF",
            payerNumber: formatPhoneForMoMo(phone),
            externalId: deliveryId,
            packageId: deliveryId,
            payerMessage: `Delivery ${formData.deliveryId}`,
          }),
        });

        const momoData = await momoRes.json();
        if (!momoRes.ok || !momoData.referenceId) {
          throw new Error(momoData.error || "MoMo initiation failed");
        }

        setProcessingStep("awaiting_approval");

        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        const pollInterval = setInterval(async () => {
          try {
            const statusRes = await fetch(
              `/api/momo/request-to-pay-status?referenceId=${momoData.referenceId}`
            );
            const statusData = await statusRes.json();

            if (statusData.status === "SUCCESSFUL") {
              clearInterval(pollInterval);
              setProcessingStep("success");
              toast.success("Payment Successful!");
              setTimeout(() => handleClose(), 2000);
            } else if (
              ["FAILED", "REJECTED", "EXPIRED"].includes(statusData.status)
            ) {
              clearInterval(pollInterval);
              setProcessingStep("idle");
              toast.error("MoMo Payment failed or rejected");
              setIsSubmitting(false);
            }
          } catch (err) {
            console.error("Polling error:", err);
          }
        }, 3000);
        pollIntervalRef.current = pollInterval;
      } else if (finalPaymentMethod === "wallet") {
        // Wallet payment success -> Deduct Balance
        setProcessingStep("initiating_payment");

        const deductRes = await authenticatedFetch(
          "/api/user/deduct-money-from-wallet",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: formData.calculatedFee }),
          }
        );

        if (!deductRes.ok) {
          const deductData = await deductRes.json();
          throw new Error(deductData.error || "Wallet deduction failed");
        }

        setProcessingStep("success");
        toast.success("Delivery requested successfully!");
        fetchWalletBalance();
        setTimeout(() => handleClose(), 2000);
      }
    } catch (err: any) {
      console.error("Submit error:", err);
      toast.error(err.message || "Something went wrong");
      setIsSubmitting(false);
    }
  };

  const colors = {
    iconBg:
      theme === "dark"
        ? "bg-green-500/20"
        : "bg-gradient-to-br from-green-100 to-green-50",
    iconColor: theme === "dark" ? "text-green-400" : "text-green-600",
    button:
      theme === "dark"
        ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-900/20"
        : "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 shadow-lg shadow-green-500/20",
    focus: "focus:ring-green-500",
    border: "focus:border-green-500",
  };

  const inputStyle = `w-full rounded-xl p-5 text-sm transition-all duration-200 focus:outline-none border-2 ${
    theme === "dark"
      ? "border-gray-700/50 bg-gray-900/40 text-white placeholder-gray-500/70 focus:border-green-600 focus:bg-gray-900/60 focus:shadow-lg focus:shadow-gray-900/20"
      : "border-gray-200 bg-gray-50/80 text-gray-900 placeholder-gray-400 focus:border-green-300 focus:bg-white focus:shadow-lg focus:shadow-gray-200/50"
  } ${colors.border} ${colors.focus}`;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .pac-container {
          z-index: 100001 !important;
          border-radius: 12px !important;
          border: none !important;
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1) !important;
          margin-top: 4px !important;
          font-family: inherit !important;
        }
        .pac-item {
          padding: 12px 16px !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
        }
        .pac-item:hover {
          background-color: #f0fdf4 !important;
        }
        .pac-matched {
          color: #16a34a !important;
          font-weight: 600 !important;
        }
      `,
        }}
      />
      <div className="fixed inset-0 z-[100000] flex items-end justify-center p-0 duration-300 animate-in fade-in sm:items-center sm:p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
          onClick={handleClose}
        />

        {/* Modal Container */}
        <div
          className={`relative z-10 w-full max-w-[550px] rounded-t-2xl border-0 shadow-2xl transition-all sm:rounded-2xl sm:border ${
            theme === "dark"
              ? "bg-gray-800 sm:border-gray-700"
              : "bg-white sm:border-gray-200"
          } duration-300 animate-in slide-in-from-bottom-8`}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between px-6 py-6 sm:px-8 ${
              theme === "dark"
                ? "border-b border-gray-700/50"
                : "border-b border-gray-100"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${colors.iconBg}`}
              >
                <svg
                  className={`h-6 w-6 ${colors.iconColor}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 8V21H3V8" />
                  <path d="M1 3H23V8H1V3Z" />
                  <path d="M10 12H14" />
                </svg>
              </div>
              <div>
                <h2
                  className={`text-xl font-bold ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  Express Plas Package
                </h2>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Step {step} of 5:{" "}
                  {step === 1
                    ? "Route"
                    : step === 2
                    ? "Receiver"
                    : step === 3
                    ? "Details"
                    : step === 4
                    ? "Options"
                    : "Review & Pay"}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className={`hidden rounded-xl p-2 transition-all hover:scale-105 active:scale-95 sm:flex ${
                theme === "dark"
                  ? "text-gray-400 hover:bg-gray-700/50 hover:text-white"
                  : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              }`}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div
            className={`max-h-[70vh] overflow-y-auto px-6 py-8 sm:px-8 ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="space-y-6">
              {step === 1 && (
                <div className="space-y-6 duration-300 animate-in slide-in-from-right-4">
                  <div className="space-y-4">
                    <label
                      className={`block text-base font-semibold ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Where is it going?
                    </label>
                    <div className="space-y-4">
                      <div className="relative">
                        <input
                          ref={pickupInputRef}
                          className={inputStyle}
                          placeholder="Pickup location (From where?)"
                          value={formData.pickup}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              pickup: e.target.value,
                              pickupType: "Home",
                              pickupLat: "",
                              pickupLng: "",
                              pickupGateNumber: "",
                              pickupGateColor: "",
                              pickupFloor: "",
                              pickupRoomNumber: "",
                              pickupOfficeName: "",
                              pickupApartmentName: "",
                              pickupHotelName: "",
                            })
                          }
                        />
                        <div className="absolute left-[-12px] top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-green-500 bg-white" />
                      </div>

                      {/* Pickup Location Type & Details - Show only when pickup is set */}
                      {formData.pickup && (
                        <div className="space-y-4 rounded-2xl border border-gray-100 bg-gray-50/30 p-4 transition-all duration-500 animate-in fade-in zoom-in-95 dark:border-gray-700/50 dark:bg-gray-900/20">
                          <div className="flex flex-wrap gap-2">
                            {["Home", "Office", "Apartment", "Hotel"].map(
                              (type) => (
                                <button
                                  key={type}
                                  onClick={() =>
                                    setFormData({
                                      ...formData,
                                      pickupType: type,
                                    })
                                  }
                                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                                    formData.pickupType === type
                                      ? "bg-green-600 text-white shadow-md shadow-green-900/10"
                                      : theme === "dark"
                                      ? "bg-gray-800 text-gray-400 hover:text-white"
                                      : "border border-gray-100 bg-white text-gray-500 hover:text-green-600"
                                  }`}
                                >
                                  {type === "Home" && (
                                    <svg
                                      className="h-3.5 w-3.5"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                        strokeWidth={2}
                                      />
                                    </svg>
                                  )}
                                  {type === "Office" && (
                                    <svg
                                      className="h-3.5 w-3.5"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                        strokeWidth={2}
                                      />
                                    </svg>
                                  )}
                                  {type === "Apartment" && (
                                    <svg
                                      className="h-3.5 w-3.5"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                                        strokeWidth={2}
                                      />
                                    </svg>
                                  )}
                                  {type === "Hotel" && (
                                    <svg
                                      className="h-3.5 w-3.5"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        d="M7 2a1 1 0 00-1 1v1a1 1 0 001 1h10a1 1 0 001-1V3a1 1 0 00-1-1H7zM4 6a1 1 0 00-1 1v14a1 1 0 001 1h16a1 1 0 001-1V7a1 1 0 00-1-1H4zm3 4h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm-8 4h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm-8 4h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z"
                                        strokeWidth={2}
                                      />
                                    </svg>
                                  )}
                                  {type}
                                </button>
                              )
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-3 duration-300 animate-in fade-in">
                            {formData.pickupType === "Home" && (
                              <>
                                <input
                                  className={inputStyle}
                                  placeholder="Gate Number"
                                  value={formData.pickupGateNumber}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      pickupGateNumber: e.target.value,
                                    })
                                  }
                                />
                                <input
                                  className={inputStyle}
                                  placeholder="Gate Color"
                                  value={formData.pickupGateColor}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      pickupGateColor: e.target.value,
                                    })
                                  }
                                />
                              </>
                            )}
                            {formData.pickupType === "Office" && (
                              <>
                                <input
                                  className={inputStyle}
                                  placeholder="Office Name"
                                  value={formData.pickupOfficeName}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      pickupOfficeName: e.target.value,
                                    })
                                  }
                                />
                                <input
                                  className={inputStyle}
                                  placeholder="Floor Number"
                                  value={formData.pickupFloor}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      pickupFloor: e.target.value,
                                    })
                                  }
                                />
                              </>
                            )}
                            {formData.pickupType === "Apartment" && (
                              <>
                                <input
                                  className={inputStyle}
                                  placeholder="Apartment Name"
                                  value={formData.pickupApartmentName}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      pickupApartmentName: e.target.value,
                                    })
                                  }
                                />
                                <div className="grid grid-cols-2 gap-2">
                                  <input
                                    className={inputStyle}
                                    placeholder="Floor"
                                    value={formData.pickupFloor}
                                    onChange={(e) =>
                                      setFormData({
                                        ...formData,
                                        pickupFloor: e.target.value,
                                      })
                                    }
                                  />
                                  <input
                                    className={inputStyle}
                                    placeholder="Room"
                                    value={formData.pickupRoomNumber}
                                    onChange={(e) =>
                                      setFormData({
                                        ...formData,
                                        pickupRoomNumber: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                              </>
                            )}
                            {formData.pickupType === "Hotel" && (
                              <>
                                <input
                                  className={inputStyle}
                                  placeholder="Hotel Name"
                                  value={formData.pickupHotelName}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      pickupHotelName: e.target.value,
                                    })
                                  }
                                />
                                <input
                                  className={inputStyle}
                                  placeholder="Room Number"
                                  value={formData.pickupRoomNumber}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      pickupRoomNumber: e.target.value,
                                    })
                                  }
                                />
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Saved Addresses Chips */}
                      {userAddresses.length > 0 && (
                        <div className="mt-3 space-y-2 duration-500 animate-in fade-in slide-in-from-top-2">
                          <p
                            className={`text-[10px] font-bold uppercase tracking-wider ${
                              theme === "dark"
                                ? "text-gray-500"
                                : "text-gray-400"
                            }`}
                          >
                            Or use a saved location:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {userAddresses.slice(0, 3).map((addr) => (
                              <button
                                key={addr.id}
                                onClick={() => applyAddressToForm(addr, true)}
                                className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition-all hover:scale-105 active:scale-95 ${
                                  theme === "dark"
                                    ? "border border-gray-600/50 bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white"
                                    : "border border-transparent bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-700"
                                }`}
                              >
                                <svg
                                  className="h-3 w-3"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                                <span className="max-w-[100px] truncate">
                                  {addr.type || addr.street}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="relative">
                        <input
                          ref={dropoffInputRef}
                          className={inputStyle}
                          placeholder="Dropoff location (To where?)"
                          value={formData.dropoff}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              dropoff: e.target.value,
                              dropoffType: "Home",
                              dropoffLat: "",
                              dropoffLng: "",
                              dropoffGateNumber: "",
                              dropoffGateColor: "",
                              dropoffFloor: "",
                              dropoffRoomNumber: "",
                              dropoffOfficeName: "",
                              dropoffApartmentName: "",
                              dropoffHotelName: "",
                            })
                          }
                        />
                        <div className="absolute left-[-12px] top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-green-500 shadow-sm" />
                      </div>

                      {/* Dropoff Location Type & Details - Show only when dropoff is set */}
                      {formData.dropoff && (
                        <div className="space-y-4 rounded-2xl border border-gray-100 bg-gray-50/30 p-4 transition-all duration-500 animate-in fade-in zoom-in-95 dark:border-gray-700/50 dark:bg-gray-900/20">
                          <div className="flex flex-wrap gap-2">
                            {["Home", "Office", "Apartment", "Hotel"].map(
                              (type) => (
                                <button
                                  key={type}
                                  onClick={() =>
                                    setFormData({
                                      ...formData,
                                      dropoffType: type,
                                    })
                                  }
                                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                                    formData.dropoffType === type
                                      ? "bg-green-600 text-white shadow-md shadow-green-900/10"
                                      : theme === "dark"
                                      ? "bg-gray-800 text-gray-400 hover:text-white"
                                      : "border border-gray-100 bg-white text-gray-500 hover:text-green-600"
                                  }`}
                                >
                                  {type === "Home" && (
                                    <svg
                                      className="h-3.5 w-3.5"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                        strokeWidth={2}
                                      />
                                    </svg>
                                  )}
                                  {type === "Office" && (
                                    <svg
                                      className="h-3.5 w-3.5"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                        strokeWidth={2}
                                      />
                                    </svg>
                                  )}
                                  {type === "Apartment" && (
                                    <svg
                                      className="h-3.5 w-3.5"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                                        strokeWidth={2}
                                      />
                                    </svg>
                                  )}
                                  {type === "Hotel" && (
                                    <svg
                                      className="h-3.5 w-3.5"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        d="M7 2a1 1 0 00-1 1v1a1 1 0 001 1h10a1 1 0 001-1V3a1 1 0 00-1-1H7zM4 6a1 1 0 00-1 1v14a1 1 0 001 1h16a1 1 0 001-1V7a1 1 0 00-1-1H4zm3 4h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm-8 4h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm-8 4h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z"
                                        strokeWidth={2}
                                      />
                                    </svg>
                                  )}
                                  {type}
                                </button>
                              )
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-3 duration-300 animate-in fade-in">
                            {formData.dropoffType === "Home" && (
                              <>
                                <input
                                  className={inputStyle}
                                  placeholder="Gate Number"
                                  value={formData.dropoffGateNumber}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      dropoffGateNumber: e.target.value,
                                    })
                                  }
                                />
                                <input
                                  className={inputStyle}
                                  placeholder="Gate Color"
                                  value={formData.dropoffGateColor}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      dropoffGateColor: e.target.value,
                                    })
                                  }
                                />
                              </>
                            )}
                            {formData.dropoffType === "Office" && (
                              <>
                                <input
                                  className={inputStyle}
                                  placeholder="Office Name"
                                  value={formData.dropoffOfficeName}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      dropoffOfficeName: e.target.value,
                                    })
                                  }
                                />
                                <input
                                  className={inputStyle}
                                  placeholder="Floor Number"
                                  value={formData.dropoffFloor}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      dropoffFloor: e.target.value,
                                    })
                                  }
                                />
                              </>
                            )}
                            {formData.dropoffType === "Apartment" && (
                              <>
                                <input
                                  className={inputStyle}
                                  placeholder="Apartment Name"
                                  value={formData.dropoffApartmentName}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      dropoffApartmentName: e.target.value,
                                    })
                                  }
                                />
                                <div className="grid grid-cols-2 gap-2">
                                  <input
                                    className={inputStyle}
                                    placeholder="Floor"
                                    value={formData.dropoffFloor}
                                    onChange={(e) =>
                                      setFormData({
                                        ...formData,
                                        dropoffFloor: e.target.value,
                                      })
                                    }
                                  />
                                  <input
                                    className={inputStyle}
                                    placeholder="Room"
                                    value={formData.dropoffRoomNumber}
                                    onChange={(e) =>
                                      setFormData({
                                        ...formData,
                                        dropoffRoomNumber: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                              </>
                            )}
                            {formData.dropoffType === "Hotel" && (
                              <>
                                <input
                                  className={inputStyle}
                                  placeholder="Hotel Name"
                                  value={formData.dropoffHotelName}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      dropoffHotelName: e.target.value,
                                    })
                                  }
                                />
                                <input
                                  className={inputStyle}
                                  placeholder="Room Number"
                                  value={formData.dropoffRoomNumber}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      dropoffRoomNumber: e.target.value,
                                    })
                                  }
                                />
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 duration-300 animate-in slide-in-from-right-4">
                  {/* Delivery ID Card */}
                  <div
                    className={`rounded-2xl border-2 p-6 text-center transition-all ${
                      theme === "dark"
                        ? "border-green-500/30 bg-green-500/10"
                        : "border-green-100 bg-green-50/50"
                    }`}
                  >
                    <p
                      className={`text-xs font-bold uppercase tracking-widest ${
                        theme === "dark" ? "text-green-400" : "text-green-600"
                      }`}
                    >
                      Unique Delivery Code
                    </p>
                    <div className="mt-2 flex items-center justify-center gap-3">
                      <span
                        className={`text-3xl font-black tracking-widest ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {formData.deliveryId}
                      </span>
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(formData.deliveryId)
                        }
                        className={`rounded-lg p-1.5 transition-all hover:scale-110 active:scale-95 ${
                          theme === "dark"
                            ? "text-gray-400 hover:bg-gray-700/50 hover:text-white"
                            : "text-gray-400 hover:bg-white hover:text-gray-600"
                        }`}
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                          />
                        </svg>
                      </button>
                    </div>
                    <p
                      className={`mt-3 text-xs leading-relaxed ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Share this code with the receiver. They must provide it to
                      the delivery person to confirm the Plas Package has been
                      received.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <label
                      className={`block text-base font-semibold ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Who is receiving it?
                    </label>
                    <input
                      className={inputStyle}
                      placeholder="Receiver's Full Name"
                      value={formData.receiverName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          receiverName: e.target.value,
                        })
                      }
                    />
                    <input
                      className={inputStyle}
                      placeholder="Receiver's Phone Number"
                      value={formData.receiverPhone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          receiverPhone: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 duration-300 animate-in slide-in-from-right-4">
                  <div className="space-y-4">
                    <label
                      className={`block text-base font-semibold ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Item Details & Photo
                    </label>

                    {/* Photo Capture Section */}
                    <div
                      onClick={() => setIsCameraOpen(true)}
                      className={`group relative flex h-48 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 ${
                        formData.capturedImage
                          ? "border-green-500 bg-green-50/10"
                          : theme === "dark"
                          ? "border-gray-700 bg-gray-900/40 hover:border-green-500/50 hover:bg-gray-900/60"
                          : "border-gray-200 bg-gray-50/80 shadow-gray-200/50 hover:border-green-300 hover:bg-white hover:shadow-lg"
                      }`}
                    >
                      {formData.capturedImage ? (
                        <>
                          <img
                            src={formData.capturedImage}
                            alt="Captured Item"
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                            <div className="flex flex-col items-center gap-2">
                              <div className="rounded-full bg-white/20 p-3 backdrop-blur-md">
                                <svg
                                  className="h-6 w-6 text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                                  />
                                  <circle
                                    cx="12"
                                    cy="13"
                                    r="3"
                                    strokeWidth={2}
                                  />
                                </svg>
                              </div>
                              <span className="text-xs font-bold uppercase tracking-widest text-white">
                                Retake Photo
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div
                            className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 ${colors.iconBg}`}
                          >
                            <svg
                              className={`h-7 w-7 ${colors.iconColor}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                              />
                              <circle cx="12" cy="13" r="3" strokeWidth={2} />
                            </svg>
                          </div>
                          <span
                            className={`mt-3 text-sm font-bold uppercase tracking-widest ${
                              theme === "dark"
                                ? "text-gray-500"
                                : "text-gray-400"
                            } group-hover:${colors.iconColor}`}
                          >
                            Add a Photo
                          </span>
                        </>
                      )}
                    </div>

                    <CameraCapture
                      isOpen={isCameraOpen}
                      onClose={() => setIsCameraOpen(false)}
                      onCapture={(img) =>
                        setFormData((prev) => ({ ...prev, capturedImage: img }))
                      }
                    />

                    <textarea
                      className={`${inputStyle} min-h-[120px] resize-none`}
                      placeholder="Anything else? (instructions, floor number, fragile...)"
                      rows={4}
                      value={formData.instructions}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          instructions: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6 duration-300 animate-in slide-in-from-right-4">
                  <div className="space-y-6">
                    {/* Delivery Type Toggle */}
                    <div className="space-y-3">
                      <label
                        className={`block text-base font-semibold ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Delivery Timing
                      </label>
                      <div
                        className={`flex rounded-2xl p-1.5 ${
                          theme === "dark" ? "bg-gray-900/40" : "bg-gray-100"
                        }`}
                      >
                        {["instant", "scheduled"].map((type) => (
                          <button
                            key={type}
                            onClick={() =>
                              setFormData({
                                ...formData,
                                deliveryType: type as any,
                              })
                            }
                            className={`flex-1 rounded-xl py-3 text-sm font-bold transition-all ${
                              formData.deliveryType === type
                                ? "bg-white text-green-600 shadow-md"
                                : "text-gray-500 hover:text-gray-700"
                            } ${
                              theme === "dark" && formData.deliveryType === type
                                ? "bg-gray-700 text-white"
                                : ""
                            }`}
                          >
                            {type === "instant"
                              ? "Deliver Now"
                              : "Schedule for Later"}
                          </button>
                        ))}
                      </div>

                      {formData.deliveryType === "scheduled" && (
                        <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-top-2">
                          <input
                            type="date"
                            className={inputStyle}
                            value={formData.scheduledDate}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                scheduledDate: e.target.value,
                              })
                            }
                          />
                          <input
                            type="time"
                            className={inputStyle}
                            value={formData.scheduledTime}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                scheduledTime: e.target.value,
                              })
                            }
                          />
                        </div>
                      )}
                    </div>

                    {/* Transportation Method */}
                    <div className="space-y-4">
                      <label
                        className={`block text-base font-semibold ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Transportation Method
                      </label>
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          {
                            id: "foot",
                            label: "Walk",
                            icon: (
                              <svg
                                className="h-9 w-9"
                                viewBox="0 0 512 512"
                                fill="none"
                              >
                                <path
                                  d="M314.21,482.32,257.44,367.58l-44.89-57.39a72.82,72.82,0,0,1-10.13-37.05V144h15.67a40.22,40.22,0,0,1,40.23,40.22V367.58"
                                  stroke="currentColor"
                                  strokeWidth="32"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M127.9,293.05V218.53S165.16,144,202.42,144"
                                  stroke="currentColor"
                                  strokeWidth="32"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <line
                                  x1="370.1"
                                  y1="274.42"
                                  x2="304"
                                  y2="231"
                                  stroke="currentColor"
                                  strokeWidth="32"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <line
                                  x1="170.53"
                                  y1="478.36"
                                  x2="224"
                                  y2="400"
                                  stroke="currentColor"
                                  strokeWidth="32"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <circle
                                  cx="258.32"
                                  cy="69.48"
                                  r="37.26"
                                  stroke="currentColor"
                                  strokeWidth="32"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            ),
                          },
                          {
                            id: "bicycle",
                            label: "Bicycle",
                            icon: (
                              <svg
                                className="h-10 w-10"
                                viewBox="0 0 512 512"
                                fill="currentColor"
                              >
                                <path d="M273.628,162.394l66.552,6.841c3.909,0.398,7.465-2.295,8.134-6.164l2.797-16.24 c0.374-2.173-0.228-4.404-1.65-6.085c-1.418-1.689-3.513-2.666-5.715-2.666H274.39c-4.129,0-7.475,3.349-7.475,7.475v9.399 C266.915,158.795,269.812,162.002,273.628,162.394z" />
                                <path d="M413.492,217.997c-46.618,0.008-85.557,32.409-95.794,75.891h30.317c3.46-10.027,9.096-19.027,16.457-26.402 c12.592-12.563,29.829-20.294,49.02-20.301c19.19,0.007,36.428,7.738,49.019,20.301c12.566,12.592,20.294,29.829,20.302,49.02 c-0.007,19.183-7.736,36.42-20.302,49.019c-12.592,12.562-29.829,20.294-49.019,20.302c-19.19-0.007-36.428-7.739-49.02-20.302 c-7.361-7.383-12.994-16.383-16.457-26.402h-30.317c10.236,43.482,49.176,75.884,95.794,75.891 c54.413-0.007,98.498-44.103,98.508-98.508C511.989,262.099,467.905,218.005,413.492,217.997z" />
                                <path d="M413.492,327.451v-21.891H309.378c0.752,3.535,1.162,7.19,1.162,10.946c0,3.755-0.409,7.411-1.162,10.945 H413.492z" />
                                <path d="M156.956,279.331c6.858,10.745,10.87,23.444,10.874,37.176c-0.007,19.183-7.735,36.42-20.301,49.019 c-12.592,12.562-29.829,20.294-49.02,20.302c-19.19-0.007-36.428-7.739-49.019-20.302c-12.566-12.599-20.294-29.836-20.302-49.019 c0.008-19.19,7.736-36.428,20.302-49.02c12.592-12.563,29.829-20.294,49.019-20.301c7.984,0.007,15.595,1.41,22.71,3.876 c4.971-8.472,9.566-17.138,13.874-25.967c-11.32-4.532-23.644-7.097-36.585-7.097C44.095,218.005,0.011,262.099,0,316.506 c0.011,54.406,44.095,98.501,98.508,98.508c54.413-0.007,98.498-44.103,98.509-98.508c-0.004-24.912-9.324-47.594-24.57-64.938 C167.637,261.009,162.46,270.259,156.956,279.331z" />
                                <path d="M177.859,124.57c1.76,2.408,2.668,5.273,2.668,8.181c0,1.418-0.218,2.843-0.663,4.239l-12.809,39.976 c-14.049,43.846-35.586,84.934-63.663,121.426L86.18,320.767l17.352,13.354l17.213-22.382 c26.412-34.333,47.298-72.535,62.03-113.202h105.71l-23.584,65.786c7.478,1.012,14.452,3.591,20.601,7.404l34.083-95.081H190.148 l10.568-32.978c1.14-3.578,1.703-7.255,1.703-10.917c0-7.482-2.355-14.887-6.873-21.079c-6.737-9.235-17.476-14.686-28.895-14.686 h-34.09v21.891h34.09C171.086,118.876,175.248,120.992,177.859,124.57z" />
                                <path d="M249.706,335.439c-7.34-3.157-12.481-10.44-12.499-18.933c0.021-11.38,9.231-20.594,20.615-20.615 c11.384,0.021,20.594,9.235,20.615,20.615c-0.004,2.857-0.592,5.579-1.646,8.045l7.853,21.007 c7.828-7.226,12.759-17.544,12.762-29.052c-0.004-21.87-17.718-39.584-39.584-39.584s-39.581,17.715-39.584,39.584 c0.004,21.734,17.501,39.335,39.178,39.563L249.706,335.439z" />
                                <path d="M265.265,314.553l-0.335,0.121c-0.837-3.192-3.634-5.63-7.108-5.651c-4.118,0.021-7.471,3.385-7.482,7.504 c0.004,1.824,0.752,3.442,1.86,4.746l22.084,54.82h-16.949v19.496h49.137v-19.496H289.86L265.265,314.553z" />
                              </svg>
                            ),
                          },
                          {
                            id: "motorbike",
                            label: "Motorbike",
                            icon: (
                              <svg
                                className="h-10 w-10"
                                viewBox="0 0 64 64"
                                fill="currentColor"
                              >
                                <path
                                  d="M54.411 36.418c.505-.346.839-.935.839-1.601v-3.845c0-1.058-.842-1.892-1.873-1.856l-22.502.826c-1.032.036-1.875.933-1.875 1.992v2.883c0 1.058.844 1.924 1.875 1.924h1.161l1.038 1.05c.066.07 1.903 2.06 1.903 6.2c0 1.866-1.726 3.384-3.846 3.384h-7.534c-.666-.732-1.831-4.442-1.831-10.623c0-6.344 2.395-9.595 2.419-9.627l.485-.645l.53.224c.325.16.71.19 1.064.023c.628-.301.9-1.059.607-1.701a1.226 1.226 0 0 0-.492-.527l-1.923-.834c-.153-1.231-1.014-2.214-2.168-2.403c-.229-.038-.498-.209-.518-.285C21.25 19.001 19.924 18 17.832 18h-2.885l-.021 1.525H13.9v.953c-.745 0-1.35 1.066-1.35 2.383c0 1.314.604 2.383 1.35 2.383v.953h1.025v1.525h2.016c-2.44 3.586-6.475 10.142-6.475 14.305c0 .179.017.358.046.535c-3.443.463-6.585 2.557-8.255 5.593c-.328.595-.343 1.262-.042 1.829c.471.889 1.419 1.176 2.89 1.339a7.672 7.672 0 0 0-.639 3.052c0 4.211 3.357 7.625 7.5 7.625c3.822 0 6.97-2.908 7.434-6.666h2.293c.24 0 .437.098.824.303c.544.287 1.29.68 2.369.68h18.373C44.104 59.586 47.021 62 50.5 62c3.48 0 6.396-2.414 7.241-5.684H62v-1.524c0-9.684-5.366-16.122-7.589-18.374m-24.367-4.571c-.033.002-.061.018-.094.021c.035-.516.453-.955.957-.975l22.536-.824c.488 0 .869.397.869.903v.05l-24.268.825M11.966 58.188c-2.072 0-3.75-1.708-3.75-3.813c0-1.046.422-1.982 1.095-2.668c.793.111 1.505.266 1.927.498c.496.273.939.61 1.408.967c.439.334.904.681 1.429.998a.472.472 0 0 0 .419.682c.174 0 .319-.1.4-.242c.241.111.495.215.769.305c-.26 1.847-1.808 3.273-3.697 3.273m38.534 0c-1.368 0-2.544-.757-3.195-1.871h.965a.474.474 0 0 0 .113.213a.46.46 0 0 0 .662 0a.456.456 0 0 0 .113-.213h2.686a.474.474 0 0 0 .113.213a.46.46 0 0 0 .662 0a.456.456 0 0 0 .113-.213h.964c-.651 1.114-1.827 1.871-3.196 1.871m-25.614-3.396c-1.393 0-1.93-.983-3.193-.983h-3.215c-3.494 0-4.461-1.805-6.525-2.945c-2.445-1.348-9.184-.516-8.387-1.963c1.611-2.93 4.941-4.909 8.387-4.909c.27 0 .535.019.799.043l-.002-.003s-.783-1.145-.783-2.004c0-5.275 7.908-15.83 7.908-15.83h-3.449v-6.672h1.406c.771 0 2.02.063 2.49 1.847c.216.819 1.021 1.229 1.574 1.362c-.545.301-.918.88-.918 1.555c0 .982.782 1.78 1.748 1.78c.09 0 .176-.013.262-.028v.157h.006s-2.729 3.62-2.729 10.555c0 6.715 1.395 12.148 3.117 12.148h7.748c2.956 0 5.346-2.194 5.346-4.909c0-4.587-2.048-6.959-2.316-7.25h18.394c.386.331 7.946 6.968 7.946 18.051H24.886z"
                                  fill="currentColor"
                                />
                              </svg>
                            ),
                          },
                          {
                            id: "car",
                            label: "Car",
                            icon: (
                              <svg
                                className="h-10 w-10"
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M5.27097 8.214C6.02074 6.312 6.92262 5 8.96427 5H14.4369C16.4766 5 17.3795 6.312 18.1302 8.214L18.88 10.249C19.4387 10.2559 19.9519 10.5661 20.2284 11.064C20.3911 11.3476 20.4763 11.6709 20.4751 12V14.624C20.4824 15.2367 20.1808 15.8098 19.6776 16.14C19.4382 16.2929 19.162 16.3739 18.88 16.374H4.52022C4.23827 16.3739 3.96199 16.2929 3.72267 16.14C3.21939 15.8098 2.91786 15.2367 2.92512 14.624V12C2.92406 11.6713 3.00927 11.3483 3.17179 11.065C3.44833 10.5671 3.96155 10.2569 4.52022 10.25L5.27097 8.214Z"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M6.86629 16.375C6.86629 15.9608 6.53051 15.625 6.11629 15.625C5.70208 15.625 5.36629 15.9608 5.36629 16.375H6.86629ZM6.11629 17.688H5.36629V17.687H6.11629ZM5.85012 12.75H6.82512V14.25H5.85012V12.75ZM16.5751 12.75H17.5501V14.25H16.5751V12.75ZM20.4285 16.14V17.687H18.9285V16.14H20.4285Z"
                                  fill="currentColor"
                                />
                              </svg>
                            ),
                          },
                        ]
                          .filter((method) => {
                            if (method.id === "foot" && formData.distance > 2)
                              return false;
                            if (
                              method.id === "bicycle" &&
                              formData.distance > 8
                            )
                              return false;
                            return true;
                          })
                          .map((method) => (
                            <button
                              key={method.id}
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  transportMethod: method.id as any,
                                })
                              }
                              title={method.label}
                              className={`group flex flex-col items-center justify-center rounded-2xl border-2 p-5 transition-all duration-300 ${
                                formData.transportMethod === method.id
                                  ? "scale-[1.02] border-green-500 bg-green-50/50 shadow-sm shadow-green-900/10"
                                  : theme === "dark"
                                  ? "border-gray-700 bg-gray-900/40 hover:border-gray-600 hover:bg-gray-900/60"
                                  : "border-gray-100 bg-gray-50 hover:border-green-200 hover:bg-white"
                              }`}
                            >
                              <div
                                className={`transition-all duration-300 ${
                                  formData.transportMethod === method.id
                                    ? "scale-110 text-green-600"
                                    : theme === "dark"
                                    ? "text-gray-500 group-hover:text-gray-300"
                                    : "text-gray-400 group-hover:text-green-500"
                                }`}
                              >
                                {method.icon}
                              </div>
                            </button>
                          ))}
                      </div>
                    </div>

                    {/* Pricing Summary */}
                    <div
                      className={`mt-6 rounded-2xl p-6 transition-all ${
                        theme === "dark"
                          ? "bg-gray-900/60"
                          : "bg-green-600 shadow-xl shadow-green-500/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p
                            className={`text-[10px] font-black uppercase tracking-widest ${
                              theme === "dark"
                                ? "text-green-400"
                                : "text-green-200 opacity-80"
                            }`}
                          >
                            Estimated Distance
                          </p>
                          <p className="text-2xl font-black text-white">
                            {isCalculating ? (
                              <span className="animate-pulse">
                                Calculating...
                              </span>
                            ) : (
                              `${formData.distance} km`
                            )}
                          </p>
                        </div>
                        <div className="h-10 w-px bg-white/20" />
                        <div className="space-y-1 text-right">
                          <p
                            className={`text-[10px] font-black uppercase tracking-widest ${
                              theme === "dark"
                                ? "text-green-400"
                                : "text-green-200 opacity-80"
                            }`}
                          >
                            Delivery Fee
                          </p>
                          <p className="text-2xl font-black italic text-white">
                            {isCalculating ? (
                              <span className="animate-pulse italic">...</span>
                            ) : (
                              `${formData.calculatedFee.toLocaleString()} ${
                                systemConfig?.currency || "RWF"
                              }`
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-6 pb-4 duration-300 animate-in slide-in-from-right-4">
                  <div className="space-y-4">
                    <label
                      className={`block text-base font-semibold ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Final Review
                    </label>

                    {/* Detailed Location Summary */}
                    <div
                      className={`space-y-5 rounded-2xl border p-5 ${
                        theme === "dark"
                          ? "border-gray-700 bg-gray-900/40"
                          : "border-gray-100 bg-gray-50/50"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`mt-1 rounded-full p-2.5 ${
                            theme === "dark"
                              ? "bg-green-500/10 text-green-400"
                              : "bg-green-50 text-green-600"
                          }`}
                        >
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-[10px] font-black uppercase tracking-widest ${
                              theme === "dark"
                                ? "text-gray-500"
                                : "text-gray-400"
                            }`}
                          >
                            Pickup Location
                          </p>
                          <p
                            className={`truncate text-sm font-bold ${
                              theme === "dark"
                                ? "text-gray-200"
                                : "text-gray-700"
                            }`}
                          >
                            {formData.pickup}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-2">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                theme === "dark"
                                  ? "bg-gray-800 text-gray-400"
                                  : "border border-gray-100 bg-white text-gray-500"
                              }`}
                            >
                              {formData.pickupType}
                            </span>
                            {formData.pickupGateNumber && (
                              <span className="text-[10px] text-gray-500">
                                Gate: {formData.pickupGateNumber}
                              </span>
                            )}
                            {formData.pickupRoomNumber && (
                              <span className="text-[10px] text-gray-500">
                                Room: {formData.pickupRoomNumber}
                              </span>
                            )}
                            {formData.pickupFloor && (
                              <span className="text-[10px] text-gray-500">
                                Floor: {formData.pickupFloor}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div
                          className={`mt-1 rounded-full p-2.5 ${
                            theme === "dark"
                              ? "bg-green-500/10 text-green-400"
                              : "bg-green-50 text-green-600"
                          }`}
                        >
                          <div className="flex h-4 w-4 items-center justify-center text-[10px] font-bold leading-none">
                            TO
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-[10px] font-black uppercase tracking-widest ${
                              theme === "dark"
                                ? "text-gray-500"
                                : "text-gray-400"
                            }`}
                          >
                            Dropoff Location
                          </p>
                          <p
                            className={`truncate text-sm font-bold ${
                              theme === "dark"
                                ? "text-gray-200"
                                : "text-gray-700"
                            }`}
                          >
                            {formData.dropoff}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-2">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                theme === "dark"
                                  ? "bg-gray-800 text-gray-400"
                                  : "border border-gray-100 bg-white text-gray-500"
                              }`}
                            >
                              {formData.dropoffType}
                            </span>
                            {formData.dropoffGateNumber && (
                              <span className="text-[10px] text-gray-500">
                                Gate: {formData.dropoffGateNumber}
                              </span>
                            )}
                            {formData.dropoffRoomNumber && (
                              <span className="text-[10px] text-gray-500">
                                Room: {formData.dropoffRoomNumber}
                              </span>
                            )}
                            {formData.dropoffFloor && (
                              <span className="text-[10px] text-gray-500">
                                Floor: {formData.dropoffFloor}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div
                          className={`mt-1 rounded-full p-2.5 ${
                            theme === "dark"
                              ? "bg-green-500/10 text-green-400"
                              : "bg-green-50 text-green-600"
                          }`}
                        >
                          <User className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-[10px] font-black uppercase tracking-widest ${
                              theme === "dark"
                                ? "text-gray-500"
                                : "text-gray-400"
                            }`}
                          >
                            Receiver Details
                          </p>
                          <p
                            className={`text-sm font-bold ${
                              theme === "dark"
                                ? "text-gray-200"
                                : "text-gray-700"
                            }`}
                          >
                            {formData.receiverName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formData.receiverPhone}
                          </p>
                        </div>
                      </div>

                      {formData.instructions && (
                        <div className="flex items-start gap-4">
                          <div
                            className={`mt-1 rounded-full p-2.5 ${
                              theme === "dark"
                                ? "bg-blue-500/10 text-blue-400"
                                : "bg-blue-50 text-blue-600"
                            }`}
                          >
                            <Info className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-[10px] font-black uppercase tracking-widest ${
                                theme === "dark"
                                  ? "text-gray-500"
                                  : "text-gray-400"
                              }`}
                            >
                              Delivery Comment
                            </p>
                            <p
                              className={`text-sm leading-relaxed ${
                                theme === "dark"
                                  ? "text-gray-400"
                                  : "text-gray-500"
                              }`}
                            >
                              {formData.instructions}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Payment Breakdown Card */}
                    <div
                      className={`rounded-2xl p-5 ${
                        theme === "dark"
                          ? "border border-gray-700 bg-gray-900/40"
                          : "bg-green-600 text-white shadow-xl shadow-green-500/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p
                            className={`text-[10px] font-black uppercase tracking-widest ${
                              theme === "dark"
                                ? "text-green-500"
                                : "text-green-200/80"
                            }`}
                          >
                            Amount To Pay
                          </p>
                          <p className="text-2xl font-black">
                            {formatCurrency(formData.calculatedFee)}
                          </p>
                        </div>
                        <div
                          className={`rounded-xl p-3 ${
                            theme === "dark"
                              ? "bg-green-500/10 text-green-500"
                              : "bg-white/20 text-white"
                          }`}
                        >
                          <CreditCard className="h-6 w-6" />
                        </div>
                      </div>
                    </div>

                    {/* Payment Selection Dropdown */}
                    <div className="space-y-3">
                      <label
                        className={`block text-[10px] font-black uppercase tracking-widest ${
                          theme === "dark" ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
                        Select Payment Method
                      </label>
                      <div className="group relative">
                        <select
                          value={selectedPaymentValue || ""}
                          onChange={(e) =>
                            setSelectedPaymentValue(e.target.value)
                          }
                          className={`w-full appearance-none rounded-2xl border-2 p-5 pr-12 text-sm font-bold outline-none transition-all ${
                            theme === "dark"
                              ? "border-gray-700 bg-gray-900/60 text-white hover:bg-gray-900/80 focus:border-green-600"
                              : "border-gray-100 bg-white text-gray-900 hover:border-gray-200 focus:border-green-300"
                          }`}
                        >
                          <option value="" disabled>
                            Choose a payment method...
                          </option>
                          <option value="wallet">
                            Personal Wallet (Balance:{" "}
                            {formatCurrency(walletBalance)})
                          </option>
                          {savedPaymentMethods.map((method) => (
                            <option key={method.id} value={method.id}>
                              {method.method} - {method.number}
                              {method.is_default ? " (Default)" : ""}
                            </option>
                          ))}
                          <option value="other">Other MTN Number</option>
                        </select>
                        <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 transition-transform group-hover:translate-y-[-40%]">
                          <svg
                            className={`h-5 w-5 ${
                              theme === "dark"
                                ? "text-gray-500"
                                : "text-gray-400"
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* One-time Phone Input */}
                    {selectedPaymentValue === "other" && (
                      <div className="space-y-3 duration-300 animate-in slide-in-from-top-2">
                        <label
                          className={`block text-[10px] font-black uppercase tracking-widest ${
                            theme === "dark" ? "text-gray-500" : "text-gray-400"
                          }`}
                        >
                          MTN Phone Number
                        </label>
                        <input
                          type="tel"
                          className={inputStyle}
                          placeholder="Enter MoMo number (e.g., 078...)"
                          value={oneTimePhoneNumber}
                          onChange={(e) =>
                            setOneTimePhoneNumber(e.target.value)
                          }
                        />
                      </div>
                    )}

                    {/* Security Badge */}
                    <div
                      className={`flex items-center gap-3 rounded-2xl p-4 transition-all ${
                        theme === "dark"
                          ? "bg-blue-500/10 text-blue-400"
                          : "bg-blue-50 text-blue-700"
                      } duration-500 animate-in fade-in slide-in-from-top-2`}
                    >
                      <ShieldCheck className="h-5 w-5 shrink-0" />
                      <p className="text-[10px] font-bold uppercase leading-relaxed tracking-widest">
                        Secure Delivery • Use Code{" "}
                        <span className="underline">{formData.deliveryId}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div
            className={`flex w-full flex-col-reverse gap-3 px-6 py-5 sm:flex-row sm:justify-end sm:px-8 ${
              theme === "dark"
                ? "border-t border-gray-700/50"
                : "border-t border-gray-100"
            }`}
          >
            {step === 1 ? (
              <button
                onClick={handleClose}
                className={`hidden rounded-xl px-8 py-3.5 text-sm font-medium transition-all sm:inline-block ${
                  theme === "dark"
                    ? "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Cancel
              </button>
            ) : (
              <button
                onClick={prevStep}
                className={`flex-1 rounded-xl py-4 text-sm font-bold transition-all active:scale-95 ${
                  theme === "dark"
                    ? "bg-gray-700 text-white hover:bg-gray-600"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Back
              </button>
            )}

            <button
              onClick={step === 5 ? handleSubmit : nextStep}
              disabled={
                isSubmitting ||
                (step === 1 && (!formData.pickup || !formData.dropoff)) ||
                (step === 2 &&
                  (!formData.receiverName || !formData.receiverPhone)) ||
                (step === 5 && !selectedPaymentValue)
              }
              className={`flex-[2] rounded-xl py-4 text-sm font-black uppercase tracking-wider text-white transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${colors.button}`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : step === 5 ? (
                "Confirm & Pay"
              ) : (
                "Continue"
              )}
            </button>
          </div>
        </div>
      </div>
      {processingStep !== "idle" && (
        <PaymentProcessingOverlay
          processingStep={
            processingStep === "success" ? "success" : (processingStep as any)
          }
        />
      )}
    </>
  );
}
