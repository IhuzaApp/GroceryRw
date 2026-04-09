import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { 
  Search, 
  Camera, 
  ShoppingCart,
  Receipt
} from "lucide-react";

// Components
import { POSHeader } from "../../src/components/MobilePOS/POSHeader";
import { CartItem } from "../../src/components/MobilePOS/Checkout/CartItem";
import { CheckoutFooter } from "../../src/components/MobilePOS/Checkout/CheckoutFooter";
import { PaymentDialog } from "../../src/components/MobilePOS/Checkout/PaymentDialog";
import POSBarcodeScanner from "../../src/components/ui/POSBarcodeScanner";

export default function POSCheckout() {
  const router = useRouter();

  // Session
  const [session, setSession] = useState<any>(null);

  // Cart & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  
  // Payment State
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [customerTin, setCustomerTin] = useState("");
  const [loading, setLoading] = useState(false);

  // Scanner State
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    const existingSession = localStorage.getItem("mobile_pos_session");
    if (existingSession) {
      setSession(JSON.parse(existingSession));
    } else {
      router.push("/MobilePOS/Connect");
    }
  }, [router]);

  // Handle Search
  useEffect(() => {
    if (searchQuery.length > 2) {
      const fetchProducts = async () => {
        try {
          const res = await fetch(`/api/queries/products?q=${searchQuery}`);
          if (res.ok) {
            const data = await res.json();
            // Filter products by shop_id if session exists
            const filtered = (data.products || []).filter((p: any) => 
                !session?.shopId || p.shop_id === session.shopId
            );
            setSearchResults(filtered);
          }
        } catch (e) {
          console.error("Failed to fetch products", e);
        }
      };
      fetchProducts();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, session]);

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
          cartItems: cart.map(item => ({
            ...item,
            quantity: item.cartQuantity // Map for API
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
    <div className="min-h-screen bg-gray-50 pb-40 dark:bg-black text-gray-900 dark:text-white">
      <Head>
        <title>POS Checkout</title>
      </Head>

      <POSHeader onBack={() => router.back()}>
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by SKU, Name or Barcode"
              className="w-full rounded-2xl border-none bg-gray-50 py-3 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-green-500 dark:bg-gray-800"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowScanner(true)}
            className="rounded-full bg-green-100 p-2.5 text-green-600 dark:bg-green-500/20 dark:text-green-400"
          >
            <Camera className="h-5 w-5" />
          </button>
        </div>
      </POSHeader>

      <div className="mx-auto max-w-md p-6">
        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-8 space-y-3 rounded-[2rem] border border-gray-100 bg-white p-4 shadow-2xl dark:border-gray-800 dark:bg-gray-900 animate-in fade-in slide-in-from-top-2">
            <p className="px-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Search Results</p>
            {searchResults.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="flex w-full items-center gap-4 rounded-2xl p-2 transition hover:bg-gray-50 dark:hover:bg-gray-800 text-left"
              >
                <div className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                   {product.ProductName?.image ? <img src={product.ProductName.image} className="w-full h-full object-cover" /> : <Search className="text-gray-400 h-5 w-5" />}
                </div>
                <div>
                  <p className="font-bold">{product.ProductName?.name || "Product"}</p>
                  <p className="text-xs font-black text-green-600">{parseFloat(product.price).toLocaleString()} RWF</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Cart Context */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black">Shopping Cart</h2>
            <button
               onClick={() => setCart([])}
               className="text-xs font-black uppercase tracking-widest text-red-500/60 hover:text-red-500"
            >
              Clear Cart
            </button>
          </div>

          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
              <div className="relative h-24 w-24 mb-4">
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                    <Receipt className="h-10 w-10 text-gray-300 dark:text-gray-600" />
                </div>
              </div>
              <p className="font-bold">No items in cart</p>
              <p className="text-sm">Search or scan items to begin</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <CartItem 
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeFromCart}
                />
              ))}
            </div>
          )}
        </div>
      </div>

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

      {showScanner && (
        <POSBarcodeScanner
          onBarcodeDetected={(barcode) => {
             console.log("Scanned barcode:", barcode);
             // Implement barcode to product lookup if needed
          }}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
