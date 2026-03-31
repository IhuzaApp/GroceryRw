"use client";

import React, { useState, useEffect } from "react";
import PaymentProcessingOverlay from "../ui/pos/registration/PaymentProcessingOverlay";
import Link from "next/link";
import {
  X,
  ShoppingCart,
  Package,
  MessageSquare,
  Tag,
  CreditCard,
  CheckCircle,
  ChevronDown,
  Plus,
} from "lucide-react";
import toast from "react-hot-toast";
import { formatCurrency } from "../../lib/formatCurrency";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { useTheme } from "../../context/ThemeContext";

interface PaymentMethod {
  type: "refund" | "card" | "momo" | "wallet";
  id?: string;
  number?: string;
}

interface SystemConfiguration {
  baseDeliveryFee: string;
  serviceFee: string;
  shoppingTime: string;
  unitsSurcharge: string;
  extraUnits: string;
  cappedDistanceFee: string;
  distanceSurcharge: string;
  currency: string;
  discounts: boolean;
  id: string;
  deliveryCommissionPercentage: string;
  productCommissionPercentage: string;
}

interface OrderModalProps {
  open: boolean;
  onClose: () => void;
  post: any;
  shopLat: number;
  shopLng: number;
  shopAlt: number;
  shopId: string;
}

function getDistanceFromLatLonInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function OrderModal({
  open,
  onClose,
  post,
  shopLat,
  shopLng,
  shopAlt,
  shopId,
}: OrderModalProps) {
  const router = useRouter();
  const { theme } = useTheme();
  
  useEffect(() => {
    if (open) {
      console.log("[OrderModal] Initialized with post:", post);
    }
  }, [open, post]);

  // States
  const [quantity, setQuantity] = useState(1);
  const [comments, setComments] = useState("");
  const [systemConfig, setSystemConfig] = useState<SystemConfiguration | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(true);
  const [isOrderLoading, setIsOrderLoading] = useState(false);
  const [processingStep, setProcessingStep] = useState<"initiating_payment" | "awaiting_approval" | "success" | null>(null);
  const [isAddressesLoading, setIsAddressesLoading] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [manualPhoneNumber, setManualPhoneNumber] = useState("");
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [priceBounce, setPriceBounce] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<any[]>([]);
  const [showOneTimePhoneInput, setShowOneTimePhoneInput] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [hasWallet, setHasWallet] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "pending" | "polling" | "success" | "failed">("idle");
  const [discounts, setDiscounts] = useState<{
    subtotal_discount: number;
    service_fee_discount: number;
    delivery_fee_discount: number;
    final_delivery_fee?: number;
    final_service_fee?: number;
    final_subtotal?: number;
    final_total?: number;
    free_delivery: boolean;
    pricing_token?: string;
    promotions_applied: any[];
  }>({
    subtotal_discount: 0,
    service_fee_discount: 0,
    delivery_fee_discount: 0,
    final_subtotal: undefined,
    free_delivery: false,
    promotions_applied: [],
  });
  const [validatingCode, setValidatingCode] = useState(false);
  const [autoApplying, setAutoApplying] = useState(false);
  const pollIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // Derived Values
  const basePrice = post?.restaurant?.price || post?.product?.price || 0;
  const subtotal = basePrice * quantity;
  const selectedAddress = savedAddresses.find(a => a.id === selectedAddressId) || null;

  const getDeliveryFee = (config: any, address: any, sub: number) => {
    if (!config) return 0;
    const baseFee = parseInt(config.baseDeliveryFee) || 0;
    const cappedFee = parseInt(config.cappedDistanceFee) || 0;
    const surcharge = config.distanceSurcharge ? parseInt(config.distanceSurcharge) : 0;
    
    let distance = 0;
    if (address?.latitude && address?.longitude) {
       distance = getDistanceFromLatLonInKm(
         parseFloat(address.latitude),
         parseFloat(address.longitude),
         shopLat,
         shopLng
       );
    }
    
    const rawFee = baseFee + (Math.ceil(Math.max(0, distance - 3)) * surcharge);
    const origFee = rawFee > cappedFee ? cappedFee : rawFee;
    return sub > 30000 ? origFee * 0.5 : origFee;
  };

  const deliveryFee = getDeliveryFee(systemConfig, selectedAddress, subtotal);

  const finalTotal = (discounts && discounts.final_total !== undefined) 
    ? discounts.final_total 
    : (subtotal - (discounts?.subtotal_discount || 0) + (discounts?.final_delivery_fee ?? deliveryFee));

  const totalDiscount = (subtotal - (discounts?.final_subtotal ?? subtotal)) + 
                      (deliveryFee - (discounts?.final_delivery_fee ?? deliveryFee));

  // Effects
  useEffect(() => {
    setPriceBounce(true);
    const timer = setTimeout(() => setPriceBounce(false), 400);
    return () => clearTimeout(timer);
  }, [quantity]);

  useEffect(() => {
    const checkSize = () => setIsMobile(window.innerWidth < 640);
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        try {
          setConfigLoading(true);
          const [configRes, addrRes, walletRes, payRes] = await Promise.all([
            fetch("/api/queries/system-configuration").then(r => r.json()),
            fetch("/api/queries/addresses").then(r => r.json()),
            fetch("/api/queries/personal-wallet-balance").then(r => r.json()),
            fetch("/api/queries/payment-methods").then(r => r.json())
          ]);

          if (configRes.success) {
            setSystemConfig(configRes.config);
            setSavedAddresses(addrRes.addresses);
            setWalletBalance(parseFloat(walletRes.wallet[0]?.balance || "0"));
            setHasWallet(true);
            setSavedPaymentMethods(payRes.paymentMethods);
            
            const defaultAddr = addrRes.addresses.find((a: any) => a.is_default);
            if (defaultAddr) setSelectedAddressId(defaultAddr.id);

            applyAutoPromotions(configRes.config, defaultAddr, (post?.restaurant?.price || 0) * quantity);
          }
        } catch (e) {
          console.error("Initialization failed", e);
        } finally {
          setConfigLoading(false);
          setLoadingPayment(false);
        }
      };
      fetchData();
    }
  }, [open]);

  const triggerPricingSync = async (code?: string) => {
    try {
      const response = await fetch("/api/promotions/validate-final", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: {
            cart_id: shopId,
            restaurant_id: post?.restaurant_id || shopId,
            items: [{
              product_id: post?.product?.id || post?.restaurant?.id || post?.id,
              quantity,
              price: basePrice,
              type: post?.restaurant ? "dish" : "product"
            }],
            subtotal,
            delivery_fee: deliveryFee,
            service_fee: 0
          },
          promoCode: code || promoCode,
          delivery_fee: deliveryFee,
          service_fee: 0
        })
      });
      const data = await response.json();
      if (data.success) {
        const pricing = {
          ...data.discounts,
          final_total: data.final_total,
          pricing_token: data.pricing_token,
          promotions_applied: data.promotions_applied
        };
        setDiscounts(pricing);
        return pricing;
      }
      return null;
    } catch (error) {
      console.error("Pricing sync failed", error);
      return null;
    }
  };

  const applyAutoPromotions = async (forcedConfig?: any, forcedAddress?: any, forcedSubtotal?: number) => {
    const config = forcedConfig || systemConfig;
    const address = forcedAddress || selectedAddress;
    const sub = forcedSubtotal || subtotal;
    const currentDeliveryFee = getDeliveryFee(config, address, sub);

    if (!shopId) return;
    try {
      setAutoApplying(true);
      const response = await fetch("/api/promotions/auto-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: {
            cart_id: shopId,
            restaurant_id: post?.restaurant_id || shopId,
            items: [{
              product_id: post?.product?.id || post?.restaurant?.id || post?.id,
              quantity,
              price: (post?.restaurant?.price || 0),
              type: post?.restaurant ? "dish" : "product"
            }],
            subtotal: sub,
            delivery_fee: currentDeliveryFee,
            service_fee: 0
          }
        })
      });
      const data = await response.json();
      if (data.success) {
        const pricing = {
          ...data.discounts,
          final_total: data.final_total,
          pricing_token: data.pricing_token,
          promotions_applied: data.promotions_applied
        };
        setDiscounts(pricing);
      }
    } catch (e) {
      console.error("Auto promotion failed", e);
    } finally {
      setAutoApplying(false);
    }
  };

  useEffect(() => {
    if (open && systemConfig?.discounts) applyAutoPromotions();
  }, [open, systemConfig, quantity]);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    try {
      setValidatingCode(true);
      const res = await fetch("/api/promotions/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: promoCode.trim().toUpperCase(),
          cart: { items: [], subtotal }
        })
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedPromo(promoCode.trim().toUpperCase());
        await triggerPricingSync(promoCode.trim().toUpperCase());
        toast.success("Promo applied!");
      } else {
        toast.error(data.message || "Invalid code");
      }
    } catch (e) {
      toast.error("Validation failed");
    } finally {
      setValidatingCode(false);
    }
  };

  const formatPhoneForMoMo = (phone: string) => {
    let p = phone.replace(/\D/g, "");
    if (p.startsWith("0")) p = "250" + p.slice(1);
    else if (!p.startsWith("250")) p = "250" + p;
    return p;
  };

  const handleMoMoPayment = async (orderId: string, amount: number) => {
    let phone = selectedPaymentMethod?.number || manualPhoneNumber;
    if (showOneTimePhoneInput) phone = manualPhoneNumber;
    
    if (!phone) {
      toast.error("Provide a MoMo number");
      setIsOrderLoading(false);
      return;
    }
    const formatted = formatPhoneForMoMo(phone);
    setPaymentStatus("pending");
    setProcessingStep("initiating_payment");
    try {
      const res = await fetch("/api/momo/request-to-pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(amount),
          payerNumber: formatted,
          externalId: orderId,
          reelOrderId: orderId, // Specifically linked to reel order in backend
        })
      });
      const data = await res.json();
      if (res.ok) {
        setProcessingStep("awaiting_approval");
        setPaymentStatus("polling");
        pollIntervalRef.current = setInterval(async () => {
          const sRes = await fetch(`/api/momo/request-to-pay-status?referenceId=${data.referenceId}`);
          const sData = await sRes.json();
          if (sData.status === "SUCCESSFUL") {
            clearInterval(pollIntervalRef.current!);
            setProcessingStep("success");
            setPaymentStatus("success");
            toast.success("Payment Successful!");
            setTimeout(() => onClose(), 2500);
          } else if (sData.status === "FAILED") {
            clearInterval(pollIntervalRef.current!);
            setProcessingStep(null);
            setIsOrderLoading(false);
            setPaymentStatus("failed");
            toast.error("Payment failed");
          }
        }, 3000);
      } else throw new Error(data.error);
    } catch (e: any) {
      toast.error(e.message || "Payment initiation failed");
      setProcessingStep(null);
      setIsOrderLoading(false);
      setPaymentStatus("failed");
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) return toast.error("Select address");
    if (!selectedPaymentMethod) return toast.error("Select payment");
    if (selectedPaymentMethod.type === "wallet" && walletBalance < finalTotal) return toast.error("Insufficient wallet");

    setIsOrderLoading(true);
    setProcessingStep("initiating_payment");
    try {
      const pricing = await triggerPricingSync();
      const total = pricing?.final_total || finalTotal;
      const res = await fetch("/api/reel-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reel_id: post.id,
          quantity,
          total: total.toString(),
          payment_method: selectedPaymentMethod.type,
          delivery_address_id: selectedAddressId,
          delivery_time: post?.restaurant?.deliveryTime || "1 - 2 hrs",
          delivery_fee: (pricing?.final_delivery_fee ?? deliveryFee).toString(),
          service_fee: (pricing?.final_service_fee ?? 0).toString(),
          discount: (pricing?.total_discount ?? totalDiscount).toString(),
          pricing_token: pricing?.pricing_token,
          applied_promotions: pricing?.promotions_applied || [],
          discount_breakdown: pricing?.discount_breakdown || {
            subtotal: pricing?.subtotal_discount || 0,
            service_fee: 0,
            delivery_fee: originalDeliveryFee - (pricing?.final_delivery_fee ?? deliveryFee)
          },
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (selectedPaymentMethod.type === "momo") {
        await handleMoMoPayment(data.order_id, total);
      } else {
        setProcessingStep("success");
        toast.success("Order placed successfully!");
        setTimeout(() => onClose(), 2000);
      }
    } catch (e: any) {
      toast.error(e.message || "Order failed");
      setProcessingStep(null);
      setIsOrderLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/60 backdrop-blur-md transition-all sm:items-center p-0 sm:p-4" onClick={onClose}>
      <div className="flex w-full max-w-[550px] flex-col overflow-hidden rounded-t-[2rem] bg-white/95 dark:bg-gray-900/90 shadow-2xl sm:rounded-[1.5rem]" 
           onClick={e => e.stopPropagation()}
           style={{ height: isMobile ? "92vh" : "auto", maxHeight: "85vh" }}>
        
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-5 dark:border-white/5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/10 text-green-600">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div>
              <h3 className={`text-xl font-black ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Checkout</h3>
              <p className="text-xs text-gray-500">Reel Order Delivery</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full bg-gray-100 p-2 dark:bg-white/5"><X className="h-5 w-5" /></button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {configLoading ? (
            <div className="space-y-4 animate-pulse">
              {[1,2,3].map(i => <div key={i} className="h-24 rounded-2xl bg-gray-100 dark:bg-white/5" />)}
            </div>
          ) : (
            <>
              {/* Product Info */}
              <div className={`p-4 rounded-2xl border ${theme === "dark" ? "border-white/5 bg-white/5" : "bg-gray-50"}`}>
                <div className="flex gap-4">
                  <div className="h-20 w-20 rounded-xl bg-gray-200 overflow-hidden">
                    <img src={post.content.thumbnail || post.creator.avatar || "/placeholder.svg"} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <h4 className={`font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{post.content?.title || post.title || post.product?.name}</h4>
                    <p className="text-sm text-green-500 font-bold">{formatCurrency(basePrice)}</p>
                    <div className="mt-2 flex items-center gap-3">
                       <button onClick={() => setQuantity(q => Math.max(1, q-1))} className="h-6 w-6 rounded bg-gray-200 dark:bg-white/10">-</button>
                       <span className="font-bold">{quantity}</span>
                       <button onClick={() => setQuantity(q => q+1)} className="h-6 w-6 rounded bg-gray-200 dark:bg-white/10">+</button>
                    </div>
                  </div>
                </div>
              </div>

               {/* Delivery Address */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase text-gray-400">Delivery Address</label>
                  {savedAddresses.length > 0 && (
                    <Link href="/profile?tab=addresses" className="text-xs font-bold text-green-600 hover:underline">Manage</Link>
                  )}
                </div>
                <div className="relative">
                  {savedAddresses.length > 0 ? (
                    <>
                      <select 
                        value={selectedAddressId || ""} 
                        onChange={e => setSelectedAddressId(e.target.value)}
                        className={`w-full appearance-none rounded-2xl border-2 p-4 font-bold ${theme === "dark" ? "bg-gray-800 border-white/5 text-white" : "bg-white border-gray-100"}`}
                      >
                        <option value="" disabled>Select Address</option>
                        {savedAddresses.map(a => (
                          <option key={a.id} value={a.id}>
                            {a.street || a.name || "Address"} - {a.landmark || a.city || ""}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </>
                  ) : (
                    <Link href="/profile?tab=addresses">
                      <div className={`flex items-center justify-between w-full rounded-2xl border-2 border-dashed p-4 font-bold ${theme === "dark" ? "bg-gray-800 border-white/10 text-gray-400" : "bg-gray-50 border-gray-200 text-gray-500"}`}>
                        <span>Add delivery address</span>
                        <Plus className="h-4 w-4" />
                      </div>
                    </Link>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-3">
                <label className="text-xs font-black uppercase text-gray-400">Payment Method</label>
                <div className="relative">
                  <select 
                    value={showOneTimePhoneInput ? "other" : (selectedPaymentMethod?.id || (selectedPaymentMethod?.type === "wallet" ? "wallet" : ""))}
                    onChange={e => {
                      const val = e.target.value;
                      if (val === "wallet") {
                        setSelectedPaymentMethod({ type: "wallet" });
                        setShowOneTimePhoneInput(false);
                      } else if (val === "other") {
                        setSelectedPaymentMethod({ type: "momo" });
                        setShowOneTimePhoneInput(true);
                      } else {
                        const m = savedPaymentMethods.find(pm => pm.id === val);
                        if (m) {
                          setSelectedPaymentMethod({ 
                            type: m.method.toLowerCase().includes("momo") ? "momo" : "card",
                            id: m.id,
                            number: m.number
                          });
                        }
                        setShowOneTimePhoneInput(false);
                      }
                    }}
                    className={`w-full appearance-none rounded-2xl border-2 p-4 font-bold ${theme === "dark" ? "bg-gray-800 border-white/5 text-white" : "bg-white border-gray-100"}`}
                  >
                    <option value="" disabled>Select Payment Method</option>
                    {hasWallet && (
                      <option value="wallet">Personal Wallet ({formatCurrency(walletBalance)})</option>
                    )}
                    {savedPaymentMethods.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.number} ({m.method})
                      </option>
                    ))}
                    <option value="other">Other Number (MTN MoMo)</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                {showOneTimePhoneInput && (
                  <div className="mt-2 animate-in slide-in-from-top-2 duration-300">
                    <input 
                      type="tel"
                      value={manualPhoneNumber}
                      onChange={e => setManualPhoneNumber(e.target.value)}
                      placeholder="Enter MoMo Number (e.g. 078...)"
                      className={`w-full rounded-2xl border-2 p-4 font-bold ${theme === "dark" ? "bg-gray-800 border-white/5 text-white" : "bg-white border-gray-100"}`}
                    />
                  </div>
                )}
              </div>

              {/* Promo Code */}
              <div className="space-y-3">
                <label className="text-xs font-black uppercase text-gray-400">Promotion Code</label>
                <div className="flex gap-2">
                  <input value={promoCode} onChange={e => setPromoCode(e.target.value)} placeholder="Enter code" 
                         className={`flex-1 rounded-2xl border-2 p-4 font-bold ${theme === "dark" ? "bg-gray-800 border-white/5" : "bg-white"}`} />
                  <button onClick={handleApplyPromo} disabled={validatingCode} className="rounded-2xl bg-black px-6 font-bold text-white dark:bg-white dark:text-black">
                    {validatingCode ? "..." : "Apply"}
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-bold">{formatCurrency(subtotal)}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-500">
                    <span>Total Savings</span>
                    <span className="font-bold">-{formatCurrency(totalDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Delivery Fee</span>
                  <span>{formatCurrency(discounts.final_delivery_fee ?? deliveryFee)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-6 pb-8 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400">Total payable</p>
              <div className={`text-3xl font-black ${priceBounce ? "scale-110 text-green-500" : ""}`}>{formatCurrency(finalTotal)}</div>
            </div>
            <button onClick={handlePlaceOrder} disabled={isOrderLoading} 
                    className="h-14 px-8 rounded-2xl bg-green-600 font-black text-white shadow-lg shadow-green-600/20 active:scale-95 transition-all flex items-center gap-2">
              {isOrderLoading ? "Processing..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>

      {processingStep && (
        <PaymentProcessingOverlay processingStep={processingStep} />
      )}
    </div>
  );
}
