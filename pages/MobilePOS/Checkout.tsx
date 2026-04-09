import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  Search,
  Camera,
  ShoppingCart,
  Receipt,
  Plus,
  ArrowLeft,
  X,
  Loader2,
  Scan,
} from "lucide-react";

// Components
import { POSHeader } from "../../src/components/MobilePOS/POSHeader";
import { CartItem } from "../../src/components/MobilePOS/Checkout/CartItem";
import { CheckoutFooter } from "../../src/components/MobilePOS/Checkout/CheckoutFooter";
import { PaymentDialog } from "../../src/components/MobilePOS/Checkout/PaymentDialog";
import POSBarcodeScanner from "../../src/components/ui/POSBarcodeScanner";
import { useTheme } from "../../src/context/ThemeContext";

export default function POSCheckout() {
  const router = useRouter();

  // Session
  const [session, setSession] = useState<any>(null);

  // Cart State
  const [cart, setCart] = useState<any[]>([]);
  const { theme } = useTheme();

  // Search Modal State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Payment State
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [customerTin, setCustomerTin] = useState("");
  const [loading, setLoading] = useState(false);

  // Scanner State
  const [showScanner, setShowScanner] = useState(true);

  useEffect(() => {
    const existingSession = localStorage.getItem("mobile_pos_session");
    if (existingSession) {
      setSession(JSON.parse(existingSession));
    } else {
      router.push("/MobilePOS/Connect");
    }
  }, [router]);

  // Handle Search in Modal
  useEffect(() => {
    if (isSearchOpen && searchQuery.length > 1) {
      const delayDebounce = setTimeout(async () => {
        setIsSearching(true);
        try {
          const res = await fetch("/api/mobile-pos/lookup-product", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: searchQuery,
              shopId: session?.shopId,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            setSearchResults(data.matches || []);
          }
        } catch (e) {
          console.error("Search failed", e);
        } finally {
          setIsSearching(false);
        }
      }, 500);
      return () => clearTimeout(delayDebounce);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, isSearchOpen, session]);

  const handleBarcodeDetected = async (barcode: string) => {
    try {
      const res = await fetch("/api/mobile-pos/lookup-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barcode,
          shopId: session?.shopId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.existingStock) {
          // Found local stock, use it
          addToCart({
            ...data.existingStock,
            ProductName: data.productName,
          });
        } else if (data.found) {
          // Found global but no local stock
          // Depending on requirements, we might show a message or add with 0 price
          alert(`Product ${data.productName.name} found but has no stock in this shop.`);
        }
      }
    } catch (e) {
      console.error("Barcode lookup failed", e);
    }
  };

  const handleManualAdd = async (productMatch: any) => {
    // When adding from search matches, we need the local stock info
    try {
      const res = await fetch("/api/mobile-pos/lookup-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: productMatch.sku,
          shopId: session?.shopId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.existingStock) {
          addToCart({
            ...data.existingStock,
            ProductName: data.productName,
          });
          setIsSearchOpen(false);
          setSearchQuery("");
        } else {
          alert("This product is not available in your shop stock.");
        }
      }
    } catch (e) {
      console.error("Manual add lookup failed", e);
    }
  };

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, cartQuantity: item.cartQuantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, cartQuantity: 1 }];
    });
    setSearchQuery("");
    setSearchResults([]);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, cartQuantity: Math.max(0, item.cartQuantity + delta) }
            : item
        )
        .filter((item) => item.cartQuantity > 0)
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // Pricing Logic (VAT Inclusive)
  const total = cart.reduce(
    (acc, item) => acc + parseFloat(item.price) * item.cartQuantity,
    0
  );
  const tax = total - total / 1.18; // 18% VAT included
  const subtotal = total - tax;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);

    try {
      const res = await fetch("/api/mobile-pos/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shop_id: session.shopId,
          Processed_By: session.employeeId,
          cartItems: cart.map((item) => ({
            ...item,
            quantity: item.cartQuantity, // Map for API
          })),
          total,
          tax,
          subtotal,
          payment_method: paymentMethod, // Align with API
          tin: customerTin, // Align with API
        }),
      });

      if (res.ok) {
        alert("Transaction successful!");
        setCart([]);
        setIsPaymentOpen(false);
        router.push("/MobilePOS/Dashboard"); // Go back to dashboard after success
      } else {
        const data = await res.json();
        alert("Checkout failed: " + (data.message || "Unknown error"));
      }
    } catch (e) {
      console.error("Checkout transaction failed", e);
      alert("Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-black dark:text-white">
      <Head>
        <title>POS Checkout</title>
      </Head>

      <POSHeader
        title="POS Checkout"
        onBack={() => router.push("/MobilePOS/Dashboard")}
        rightAction={
          <button
            onClick={() => setIsSearchOpen(true)}
            className="rounded-2xl bg-green-500/10 p-3 text-green-500 transition-all hover:bg-green-500 hover:text-white active:scale-95 dark:bg-green-500/20"
          >
            <Search className="h-5 w-5" />
          </button>
        }
      />

      <div className="mx-auto max-w-xl pb-40">
        {/* Scanner Section - Always on top */}
        <div className="relative z-10 p-4">
          <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/5 shadow-2xl backdrop-blur-md dark:bg-white/5">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/20 text-green-500">
                  <Scan className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest">
                    Interactive Scanner
                  </h3>
                  <p className="text-[10px] font-bold text-gray-500">
                    Align barcode to scan automatically
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-green-500/20 px-3 py-1 text-[10px] font-black uppercase text-green-500">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                Live
              </div>
            </div>

            <POSBarcodeScanner
              isInline={true}
              onBarcodeDetected={handleBarcodeDetected}
              onClose={() => setShowScanner(false)}
            />
          </div>
        </div>

        {/* Cart Contents */}
        <div className="px-6 py-4">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-white/5">
                <ShoppingCart className="h-6 w-6 opacity-60" />
              </div>
              <div>
                <h2 className="text-xl font-black">Scanned Items</h2>
                <p className="text-xs font-bold text-gray-400">
                  {cart.length} product{cart.length !== 1 ? "s" : ""} in cart
                </p>
              </div>
            </div>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-500 transition-all hover:bg-red-500 hover:text-white"
              >
                Clear All
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-gray-100/50 dark:bg-white/5">
                <Receipt className="h-12 w-12 opacity-20" />
              </div>
              <h3 className="text-lg font-black opacity-80">Cart is empty</h3>
              <p className="mt-1 text-sm font-medium text-gray-400">
                Scan a barcode or use search to add items
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {cart.map((item) => (
                <CartItem
                  key={item.id}
                  item={{
                    ...item,
                    name: item.ProductName?.name || "Unknown Product",
                    image: item.ProductName?.image,
                  }}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeFromCart}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xl"
            onClick={() => setIsSearchOpen(false)}
          />
          <div className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/90 shadow-2xl dark:bg-gray-900/90">
            <div className="flex items-center justify-between border-b border-gray-100 p-6 dark:border-white/5">
              <h3 className="text-2xl font-black">Search Product</h3>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="rounded-full bg-gray-100 p-2 dark:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  autoFocus
                  type="text"
                  placeholder="SKU, Barcode or Name..."
                  className="w-full rounded-2xl border-none bg-gray-100 py-4 pl-12 pr-6 text-lg font-bold shadow-inner focus:ring-2 focus:ring-green-500 dark:bg-white/5"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="max-h-[50vh] overflow-y-auto pr-2">
                {isSearching ? (
                  <div className="flex flex-col items-center justify-center py-20 opacity-40">
                    <Loader2 className="h-10 w-10 animate-spin" />
                    <p className="mt-4 font-black uppercase tracking-widest">
                      Searching...
                    </p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="grid gap-3">
                    {searchResults.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleManualAdd(product)}
                        className="flex w-full items-center gap-4 rounded-3xl bg-gray-50 p-3 text-left transition-all hover:bg-green-500 hover:text-white dark:bg-white/5"
                      >
                        <div className="h-16 w-16 overflow-hidden rounded-2xl bg-white dark:bg-black">
                          {product.image ? (
                            <img
                              src={product.image}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <ShoppingCart className="h-6 w-6 opacity-20" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-black leading-tight">
                            {product.name}
                          </p>
                          <p className="mt-0.5 text-xs font-bold opacity-60">
                            SKU: {product.sku} | {product.barcode}
                          </p>
                        </div>
                        <div className="mr-2 h-10 w-10 rounded-full bg-black/10 flex items-center justify-center">
                          <Plus className="h-5 w-5" />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : searchQuery.length > 1 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                    <X className="h-10 w-10" />
                    <p className="mt-4 font-black uppercase tracking-widest">
                      No products found
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center opacity-20">
                    <Search className="h-10 w-10" />
                    <p className="mt-4 text-xs font-black uppercase tracking-widest">
                      Start typing to search
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <CheckoutFooter
        subtotal={subtotal}
        tax={tax}
        total={total}
        disabled={cart.length === 0}
        onProceed={() => setIsPaymentOpen(true)}
      />

      {isPaymentOpen && (
        <PaymentDialog
          total={total}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          tin={customerTin}
          setTin={setCustomerTin}
          loading={loading}
          onClose={() => setIsPaymentOpen(false)}
          onConfirm={handleCheckout}
        />
      )}
    </div>
  );
}
