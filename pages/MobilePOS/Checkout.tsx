import React, { useState, useEffect, useMemo, useRef } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { 
  ChevronLeft, 
  Search, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Banknote, 
  Smartphone,
  CheckCircle2,
  Printer,
  Share2,
  Receipt,
  Store,
  X,
  ArrowRight
} from "lucide-react";
import { useTheme } from "../../src/context/ThemeContext";
import InlinePOSScanner from "../../src/components/ui/InlinePOSScanner";

interface Product {
  id: string;
  price: string;
  final_price: string;
  quantity: number;
  measurement_unit: string;
  shop_id: string;
  ProductName: {
    name: string;
    barcode: string;
    sku: string;
    image: string;
  }
}

interface CartItem extends Product {
  cartQuantity: number;
}

export default function MobilePOSCheckout() {
  const router = useRouter();
  const { theme } = useTheme();

  // --- State ---
  const [session, setSession] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [systemConfig, setSystemConfig] = useState<any>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [tin, setTin] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "momo" | "card">("cash");
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  // --- Initialization ---
  useEffect(() => {
    const existingSession = localStorage.getItem("mobile_pos_session");
    if (existingSession) {
      const parsed = JSON.parse(existingSession);
      if (parsed.expiresAt > Date.now()) {
        setSession(parsed);
      } else {
        router.push("/MobilePOS/Connect");
      }
    } else {
      router.push("/MobilePOS/Connect");
    }

    const fetchData = async () => {
      try {
        const [prodRes, configRes] = await Promise.all([
          fetch("/api/queries/products"),
          fetch("/api/queries/system-config")
        ]);
        if (prodRes.ok && parsed.shopId) {
          const data = await prodRes.json();
          // FILTER: Only show products belonging to this shop
          const shopProducts = (data.products || []).filter((p: any) => p.shop_id === parsed.shopId);
          setProducts(shopProducts);
        }
        if (configRes.ok) {
          const data = await configRes.json();
          setSystemConfig(data.config);
        }
      } catch (e) {
        console.error("Failed to initialize checkout", e);
      }
    };
    fetchData();
  }, [router]);

  // --- Logic ---
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return products.filter(p => 
      p.ProductName.name.toLowerCase().includes(q) || 
      (p.ProductName.sku && p.ProductName.sku.toLowerCase().includes(q)) ||
      (p.ProductName.barcode && p.ProductName.barcode.toLowerCase().includes(q))
    ).slice(0, 5);
  }, [searchQuery, products]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, cartQuantity: item.cartQuantity + 1 } 
            : item
        );
      }
      return [...prev, { ...product, cartQuantity: 1 }];
    });
    setSearchQuery("");
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.cartQuantity + delta);
        return { ...item, cartQuantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleBarcodeDetected = (barcode: string) => {
    const product = products.find(p => p.ProductName.barcode === barcode);
    if (product) {
      addToCart(product);
    }
  };

  // --- Calculations ---
  const subtotal = cart.reduce((acc, item) => acc + (parseFloat(item.final_price) * item.cartQuantity), 0);
  const taxRate = systemConfig?.tax ? parseFloat(systemConfig.tax) / 100 : 0.18;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  // --- Final Checkout ---
  const handleFinalCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    try {
      const checkoutData = {
        shop_id: products[0]?.shop_id, // Use shop_id from first item
        Processed_By: session?.employeeId,
        cartItems: cart.map(item => ({
          id: item.id,
          name: item.ProductName.name,
          price: parseFloat(item.final_price),
          quantity: item.cartQuantity,
          measurement_unit: item.measurement_unit,
          image: item.ProductName.image
        })),
        subtotal,
        tax,
        total,
        tin,
        payment_method: paymentMethod,
      };

      const res = await fetch("/api/mobile-pos/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkoutData)
      });

      if (res.ok) {
        const result = await res.json();
        setCompletedOrder(result);
        setCart([]);
        setShowPaymentModal(false);
      }
    } catch (e) {
      console.error("Payment failed", e);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-black dark:text-white">
      <Head>
        <title>POS Checkout</title>
      </Head>

      {/* 1. Header & Scanner Section */}
      <div className="sticky top-0 z-50 bg-white/90 shadow-sm backdrop-blur-md dark:bg-gray-900/90">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => router.push("/MobilePOS/Dashboard")} className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-sm font-black uppercase tracking-widest text-green-500">Checkout Terminal</h1>
          <div className="w-10" />
        </div>
        
        <div className="relative h-48 w-full">
          <InlinePOSScanner 
            onBarcodeDetected={handleBarcodeDetected} 
            className="h-full w-full"
          />
          <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-gray-50 to-transparent dark:from-black" />
        </div>
      </div>

      <div className="mx-auto max-w-md px-4 pb-32 pt-2">
        {/* 2. Manual Search */}
        <div className="relative mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by Name, SKU or Barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border-none bg-white p-4 pl-12 shadow-xl ring-1 ring-gray-100 placeholder:text-gray-400 focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:ring-gray-700 dark:placeholder:text-gray-500"
            />
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          </div>

          {filteredProducts.length > 0 && (
            <div className="absolute top-full z-40 mt-2 w-full overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
              {filteredProducts.map(p => (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="flex w-full items-center gap-4 border-b border-gray-50 p-4 last:border-none hover:bg-green-50 dark:border-gray-700/50 dark:hover:bg-green-900/10"
                >
                  <div className="h-10 w-10 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    {p.ProductName.image ? (
                      <img 
                        src={p.ProductName.image} 
                        alt="" 
                        className="h-full w-full object-cover" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/679/679821.png';
                        }}
                      />
                    ) : (
                      <Store className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-bold leading-tight">{p.ProductName.name}</p>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">{p.ProductName.sku || "No SKU"}</p>
                  </div>
                  <p className="font-black text-green-600">{parseFloat(p.final_price).toLocaleString()} RWF</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. Cart Items */}
        <div className="space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <ShoppingCartPlaceholder />
              <p className="mt-4 font-bold">Your cart is empty</p>
              <p className="text-xs">Scan items to start checkout</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex flex-col rounded-3xl bg-white p-4 shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    {item.ProductName.image ? (
                      <img 
                        src={item.ProductName.image} 
                        alt="" 
                        className="h-full w-full object-cover" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/679/679821.png';
                        }}
                      />
                    ) : (
                      <Store className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold leading-tight">{item.ProductName.name}</h4>
                    <p className="text-xs font-black text-green-500">{parseFloat(item.final_price).toLocaleString()} RWF</p>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="rounded-full p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3 dark:border-gray-700">
                  <div className="flex items-center gap-4 rounded-xl bg-gray-50 p-1 dark:bg-gray-900">
                    <button onClick={() => updateCartQuantity(item.id, -1)} className="rounded-lg bg-white p-2 shadow-sm dark:bg-gray-800"><Minus className="h-3 w-3" /></button>
                    <span className="min-w-[1.5rem] text-center font-black">{item.cartQuantity}</span>
                    <button onClick={() => updateCartQuantity(item.id, 1)} className="rounded-lg bg-white p-2 shadow-sm dark:bg-gray-800"><Plus className="h-3 w-3" /></button>
                  </div>
                  <p className="font-black text-gray-900 dark:text-white">{(parseFloat(item.final_price) * item.cartQuantity).toLocaleString()} RWF</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. Footer Summary */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 p-6 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] backdrop-blur-xl dark:bg-gray-900/80">
        <div className="mx-auto max-w-md">
          <div className="mb-4 flex items-center justify-between text-sm">
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">In Cart</span>
              <span className="font-bold">{cart.reduce((a, b) => a + b.cartQuantity, 0)} Items</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Amount</span>
              <p className="text-2xl font-black text-green-600">{total.toLocaleString()} RWF</p>
            </div>
          </div>
          <button
            disabled={cart.length === 0}
            onClick={() => setShowPaymentModal(true)}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-green-600 py-4 font-black transition active:scale-95 disabled:grayscale"
          >
            <span>Proceed to Payment</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* 5. Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm lg:items-center p-0 lg:p-4">
          <div className="w-full max-w-md rounded-t-[2.5rem] bg-white p-8 shadow-2xl animate-in slide-in-from-bottom dark:bg-gray-900 overflow-y-auto max-h-[90vh]">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-2xl font-black tracking-tight">Complete Payment</h3>
              <button onClick={() => setShowPaymentModal(false)} className="rounded-full bg-gray-100 p-2 dark:bg-gray-800"><X className="h-6 w-6" /></button>
            </div>

            <div className="space-y-6">
              {/* Payment Method Selector */}
              <div>
                <label className="mb-3 block text-xs font-black uppercase tracking-widest text-gray-400">Payment Method</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "cash", label: "Cash", icon: Banknote },
                    { id: "momo", label: "MoMo", icon: Smartphone },
                    { id: "card", label: "Card", icon: CreditCard },
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as any)}
                      className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 py-4 transition-all ${
                        paymentMethod === method.id 
                          ? "border-green-500 bg-green-50 text-green-600 dark:bg-green-500/10" 
                          : "border-gray-100 text-gray-400 dark:border-gray-800"
                      }`}
                    >
                      <method.icon className="h-6 w-6" />
                      <span className="text-xs font-bold">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* TIN Field */}
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-400">Customer TIN (Optional)</label>
                <input
                  type="text"
                  placeholder="Enter TIN for EBM invoice..."
                  value={tin}
                  onChange={(e) => setTin(e.target.value)}
                  className="w-full rounded-2xl border-none bg-gray-50 p-4 font-bold placeholder:text-gray-400 dark:bg-gray-800"
                />
              </div>

              {/* Summary */}
              <div className="rounded-2xl bg-gray-50 p-6 dark:bg-gray-800">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span>{subtotal.toLocaleString()} RWF</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>VAT ({systemConfig?.tax || "18"}%)</span>
                    <span>{tax.toLocaleString()} RWF</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-black text-lg text-gray-900 dark:text-white dark:border-gray-700">
                    <span>Total Pay</span>
                    <span className="text-green-600">{total.toLocaleString()} RWF</span>
                  </div>
                </div>
              </div>

              <button
                disabled={isProcessing}
                onClick={handleFinalCheckout}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-green-600 py-5 text-lg font-black text-white shadow-xl shadow-green-600/20 active:scale-95 disabled:bg-gray-400"
              >
                {isProcessing ? "Processing Transaction..." : "Confirm & Record Sale"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Success Modal */}
      {completedOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
          <div className="w-full max-w-sm rounded-[3rem] bg-white p-10 text-center shadow-2xl dark:bg-gray-900">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-500 text-white shadow-2xl shadow-green-500/40">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h2 className="mb-2 text-3xl font-black">Sale Success!</h2>
            <p className="mb-8 text-sm font-medium text-gray-500">Order #{completedOrder.orderNumber} has been recorded locally and synced.</p>
            
            <div className="space-y-4">
              <button 
                onClick={() => {
                  // TODO: Print logic
                  alert("Invoice feature starting soon! For now, please use standard device sharing.");
                }}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-gray-100 py-4 font-bold transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
              >
                <Printer className="h-5 w-5" />
                <span>Print Invoice</span>
              </button>
              
              <button className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-gray-100 py-4 font-bold transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800">
                <Share2 className="h-5 w-5" />
                <span>Share EBM TIN Info</span>
              </button>
              
              <button
                onClick={() => setCompletedOrder(null)}
                className="w-full rounded-2xl bg-gray-900 py-4 font-black text-white transition active:scale-95 dark:bg-white dark:text-gray-900"
              >
                Next Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ShoppingCartPlaceholder() {
  return (
    <div className="relative h-24 w-24">
      <div className="absolute inset-0 flex items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800/50">
        <Receipt className="h-10 w-10 text-gray-200 dark:text-gray-700" />
      </div>
      <div className="absolute -right-2 top-0 h-8 w-8 animate-bounce rounded-full bg-green-500/20 p-2 text-green-500 backdrop-blur-sm">
        <div className="h-full w-full rounded-full bg-green-500" />
      </div>
    </div>
  );
}
