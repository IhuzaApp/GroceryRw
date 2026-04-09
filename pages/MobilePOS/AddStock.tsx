import React, { useState, useEffect, useCallback, useRef } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  Search, ScanLine, Package, Plus, ChevronRight,
  CheckCircle2, AlertCircle, ArrowLeft, Loader2,
  Barcode, Tag, User, Calendar, DollarSign,
  Scale, RotateCcw, ShoppingBag, ChevronDown, X
} from "lucide-react";
import { POSHeader } from "../../src/components/MobilePOS/POSHeader";
import dynamic from "next/dynamic";

const POSBarcodeScanner = dynamic(
  () => import("../../src/components/ui/POSBarcodeScanner"),
  { ssr: false }
);

type Step = "SCAN" | "SELECT_MATCH" | "TOP_UP" | "ADD_TO_SHOP" | "NEW_PRODUCT" | "SUCCESS";

interface ProductNameRecord {
  id: string;
  name: string;
  barcode: string | null;
  sku: string | null;
  image: string | null;
  description: string | null;
}

interface ExistingStock {
  id: string;
  quantity: number;
  price: string | null;
  final_price: string | null;
  buying_price: string | null;
  supplier: string | null;
  category: string | null;
  measurement_unit: string | null;
  reorder_point: number | null;
  sku: string | null;
  productName_id: string;
}

const CATEGORIES = [
  "groceries", "dairy", "meat", "beverages", "bakery", "frozen",
  "snacks", "household", "personal care", "electronics", "clothing", "toys", "other"
];
const UNITS = ["item", "kg", "g", "litre", "ml", "pack", "box", "dozen", "pair", "carton", "packet", "bottle"];

export default function AddStock() {
  const router = useRouter();
  const [session, setSession] = useState<{ shopId: string; shopName: string; employeeId: string } | null>(null);

  const [step, setStep] = useState<Step>("SCAN");
  const [showScanner, setShowScanner] = useState(false);

  // Search
  const [searchInput, setSearchInput] = useState("");
  const [looking, setLooking] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [matches, setMatches] = useState<ProductNameRecord[]>([]);
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<ProductNameRecord[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Selected records
  const [selectedProductName, setSelectedProductName] = useState<ProductNameRecord | null>(null);
  const [existingStock, setExistingStock] = useState<ExistingStock | null>(null);

  // Scanned barcode (auto-filled)
  const [scannedBarcode, setScannedBarcode] = useState("");

  // Stock form fields
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState("");
  const [buyingPrice, setBuyingPrice] = useState("");
  const [supplier, setSupplier] = useState("");
  const [supplierOpen, setSupplierOpen] = useState(false);
  const [category, setCategory] = useState("groceries");
  const [unit, setUnit] = useState("item");
  const [reorderPoint, setReorderPoint] = useState("10");
  const [expiryDate, setExpiryDate] = useState("");
  const [productImage, setProductImage] = useState<string | null>(null);

  // New product fields
  const [newName, setNewName] = useState("");
  const [newSku, setNewSku] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const s = localStorage.getItem("mobile_pos_session");
    if (!s) { router.push("/MobilePOS/Connect"); return; }
    const parsed = JSON.parse(s);
    if (parsed.expiresAt < Date.now()) { router.push("/MobilePOS/Connect"); return; }
    setSession(parsed);
  }, [router]);

  const reset = useCallback(() => {
    setStep("SCAN");
    setSearchInput("");
    setLookupError(null);
    setMatches([]);
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedProductName(null);
    setExistingStock(null);
    setScannedBarcode("");
    setQuantity("1");
    setPrice(""); setBuyingPrice("");
    setSupplier(""); setCategory("groceries");
    setUnit("item"); setReorderPoint("10");
    setExpiryDate(""); setNewName("");
    setNewSku(""); setNewDescription("");
    setProductImage(null);
    setSaveError(null);
  }, []);

  // Fetch suppliers for this shop regardless of search
  const fetchSuppliers = useCallback(async (shopId: string) => {
    try {
      const res = await fetch("/api/mobile-pos/lookup-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopId, name: "" }),
      });
      const data = await res.json();
      if (data.suppliers?.length) setSuppliers(data.suppliers);
    } catch { }
  }, []);

  useEffect(() => {
    if (session) fetchSuppliers(session.shopId);
  }, [session, fetchSuppliers]);

  // Live debounced search for autocomplete suggestions
  const searchSuggestions = useCallback(async (value: string) => {
    if (!session || !value.trim() || value.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const isBarcode = /^\d{6,}$/.test(value.trim());
      const res = await fetch("/api/mobile-pos/lookup-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopId: session.shopId,
          ...(isBarcode ? { barcode: value.trim() } : { name: value.trim() })
        }),
      });
      const data = await res.json();
      if (data.found && data.matches?.length) {
        setSuggestions(data.matches);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch { }
  }, [session]);

  // Debounce the live search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchSuggestions(searchInput), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchInput, searchSuggestions]);

  const lookupProduct = useCallback(async (value: string, isBarcode = false) => {
    if (!session || !value.trim()) return;
    setLooking(true);
    setLookupError(null);

    try {
      const body: Record<string, any> = { shopId: session.shopId };
      if (isBarcode || /^\d{6,}$/.test(value.trim())) {
        body.barcode = value.trim();
      } else {
        body.name = value.trim();
      }

      const res = await fetch("/api/mobile-pos/lookup-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.suppliers?.length) setSuppliers(data.suppliers);

      if (data.found) {
        const productMatches: ProductNameRecord[] = data.matches || (data.productName ? [data.productName] : []);

        // Exact name match check to prioritize adding to shop over new product
        const exactMatch = productMatches.find(m => m.name.toLowerCase() === value.trim().toLowerCase());

        if (exactMatch) {
          selectProductName(exactMatch, data.existingStock && data.existingStock.productName_id === exactMatch.id ? data.existingStock : null);
        } else if (productMatches.length === 1) {
          selectProductName(productMatches[0], data.existingStock);
        } else {
          setMatches(productMatches);
          setExistingStock(data.existingStock);
          setStep("SELECT_MATCH");
        }
      } else {
        // Not found globally → new product
        if (isBarcode) setScannedBarcode(value.trim());
        setNewName(value.trim());
        setStep("NEW_PRODUCT");
      }
    } catch {
      setLookupError("Failed to look up product. Please try again.");
    } finally {
      setLooking(false);
    }
  }, [session]);

  const selectProductName = (pn: ProductNameRecord, stock: ExistingStock | null) => {
    setSelectedProductName(pn);
    setScannedBarcode(pn.barcode || "");
    setNewSku(pn.sku || "");
    setNewDescription(pn.description || "");
    setProductImage(pn.image || null);

    if (stock) {
      setExistingStock(stock);
      setPrice(stock.price || "");
      setBuyingPrice(stock.buying_price || "");
      setSupplier(stock.supplier || "");
      setCategory(stock.category || "groceries");
      setUnit(stock.measurement_unit || "item");
      setReorderPoint(String(stock.reorder_point || "10"));
      setStep("TOP_UP");
    } else {
      // Exist in global productNames but not in this shop
      setNewSku(pn.sku || "");
      setNewDescription(pn.description || "");
      setStep("ADD_TO_SHOP");
    }
  };

  const handleBarcodeDetected = useCallback((barcode: string) => {
    setShowScanner(false);
    setScannedBarcode(barcode);
    setSearchInput(barcode);
    lookupProduct(barcode, true);
  }, [lookupProduct]);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    lookupProduct(searchInput);
  };

  const handleSave = async () => {
    if (!session) return;
    setSaving(true);
    setSaveError(null);

    try {
      const common = {
        shopId: session.shopId,
        quantity: parseInt(quantity, 10) || 1,
        price,
        final_price: price, // They are the same
        buying_price: buyingPrice,
        supplier, category,
        measurement_unit: unit,
        reorder_point: parseInt(reorderPoint, 10) || 10,
        expiry_date: expiryDate || null,
        productImage,
      };

      let body: Record<string, any>;

      if (step === "TOP_UP" && existingStock) {
        body = { ...common, mode: "top_up", productId: existingStock.id };
      } else if (step === "ADD_TO_SHOP" && selectedProductName) {
        body = { ...common, mode: "add_to_shop", productNameId: selectedProductName.id, sku: newSku || selectedProductName.sku };
      } else {
        // NEW_PRODUCT
        if (!newName.trim()) { setSaveError("Product name is required"); setSaving(false); return; }
        body = {
          ...common, mode: "new_product",
          productName: newName.trim(),
          barcode: scannedBarcode || null,
          sku: newSku || null,
          description: newDescription || null,
        };
      }

      const res = await fetch("/api/mobile-pos/add-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok || !data.success) throw new Error(data.error || data.details || "Failed to save");
      setStep("SUCCESS");
    } catch (err: any) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-medium text-gray-900 placeholder-gray-400 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500";
  const labelCls = "mb-1.5 block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400";

  // ── Supplier dropdown ────────────────────────────────────────────────────
  const renderSupplierField = () => {
    const filteredSuppliers = suppliers.filter(s => s.toLowerCase().includes(supplier.toLowerCase()));
    const exactMatch = suppliers.some(s => s.toLowerCase() === supplier.toLowerCase());

    return (
      <div className="relative" onClick={e => e.stopPropagation()}>
        <label className={labelCls}><User className="mr-1 inline h-3 w-3" />Supplier</label>
        <div className="relative">
          <input
            type="text"
            placeholder="Type or select supplier..."
            value={supplier}
            onChange={e => { setSupplier(e.target.value); setSupplierOpen(true); }}
            onFocus={() => setSupplierOpen(true)}
            className={inputCls}
          />
          <button type="button" 
            onMouseDown={e => { e.stopPropagation(); setSupplierOpen(o => !o); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <ChevronDown className={`h-4 w-4 transition-transform ${supplierOpen ? "rotate-180" : ""}`} />
          </button>
        </div>
        {supplierOpen && (supplier.trim() || filteredSuppliers.length > 0) && (
          <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200 dark:border-gray-700 dark:bg-gray-800">
            {supplier.trim() && !exactMatch && (
              <button type="button"
                onMouseDown={e => { e.stopPropagation(); setSupplierOpen(false); }}
                className="flex w-full items-center gap-2 border-b border-gray-50 px-4 py-3 text-sm font-bold text-green-600 transition hover:bg-green-50 dark:border-gray-700 dark:text-green-400 dark:hover:bg-green-500/10">
                <Plus className="h-4 w-4" />
                Use "{supplier}" as new supplier
              </button>
            )}
            <div className="max-h-48 overflow-y-auto">
              {filteredSuppliers.map(s => (
                <button key={s} type="button"
                  onMouseDown={e => { e.stopPropagation(); setSupplier(s); setSupplierOpen(false); }}
                  className="flex w-full items-center px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-green-50 hover:text-green-700 dark:text-gray-300 dark:hover:bg-green-500/10">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── Stock form fields ────────────────────────────────────────────────────
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProductImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const renderImageSection = () => (
    <div className="mb-6 overflow-hidden rounded-3xl border border-gray-100 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Product Image</h4>
      <div className="flex flex-col items-center gap-4">
        {productImage ? (
          <div className="relative group h-40 w-full overflow-hidden rounded-2xl bg-gray-50 dark:bg-black/20">
            <img src={productImage} alt="Product" className="h-full w-full object-contain" />
            <button onClick={() => setProductImage(null)} className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white shadow-lg">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex h-40 w-full items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-black/20">
            <div className="text-center">
              <Plus className="mx-auto h-8 w-8 text-gray-300" />
              <p className="mt-2 text-xs font-medium text-gray-400">No Image Available</p>
            </div>
          </div>
        )}
        <div className="grid w-full grid-cols-1 gap-2">
          <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-green-50 py-3 text-sm font-bold text-green-600 transition hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400">
            <ScanLine className="h-4 w-4" />
            {productImage ? "Change Image" : "Take Photo / Upload"}
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageChange} />
          </label>
        </div>
      </div>
    </div>
  );

  const renderStockForm = () => {
    const isTopUp = step === "TOP_UP";

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {!isTopUp && (
            <>
              <div>
                <label className={labelCls}><Barcode className="mr-1 inline h-3 w-3" />Barcode</label>
                <div className="flex gap-2">
                  <input type="text" placeholder="Scan or enter barcode" value={scannedBarcode}
                    onChange={e => setScannedBarcode(e.target.value)} className={inputCls} />
                  <button type="button" onClick={() => setShowScanner(true)}
                    className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400">
                    <ScanLine className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div>
                <label className={labelCls}>SKU</label>
                <input type="text" placeholder="Enter SKU" value={newSku} onChange={e => setNewSku(e.target.value)} className={inputCls} />
              </div>
            </>
          )}

          <div>
            <label className={labelCls}><Scale className="mr-1 inline h-3 w-3" />Quantity to Add *</label>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setQuantity(q => String(Math.max(1, parseInt(q || "1") - 1)))}
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-xl font-bold dark:bg-gray-700">−</button>
              <input type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)}
                className={`${inputCls} text-center text-xl font-black`} />
              <button type="button" onClick={() => setQuantity(q => String(parseInt(q || "0") + 1))}
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-green-500 text-xl font-bold text-white">+</button>
            </div>
          </div>

          <div>
            <label className={labelCls}><Calendar className="mr-1 inline h-3 w-3" />Expiry Date</label>
            <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className={inputCls} />
          </div>

          {!isTopUp && (
            <>
              <div>
                <label className={labelCls}><DollarSign className="mr-1 inline h-3 w-3" />Buying Price (Market Price)</label>
                <input type="number" placeholder="0" value={buyingPrice} onChange={e => setBuyingPrice(e.target.value)} className={inputCls} />
              </div>

              <div>
                <label className={labelCls}><DollarSign className="mr-1 inline h-3 w-3" />Selling Price</label>
                <input type="number" placeholder="0" value={price} onChange={e => setPrice(e.target.value)} className={inputCls} />
              </div>

              {renderSupplierField()}

              <div>
                <label className={labelCls}>Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className={inputCls}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>

              <div>
                <label className={labelCls}>Unit</label>
                <select value={unit} onChange={e => setUnit(e.target.value)} className={inputCls}>
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>

              <div>
                <label className={labelCls}>Reorder Point</label>
                <input type="number" placeholder="10" value={reorderPoint} onChange={e => setReorderPoint(e.target.value)} className={inputCls} />
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 dark:bg-black" onClick={() => setSupplierOpen(false)}>
      <Head><title>Add Stock — Mobile POS</title></Head>

      <POSHeader
        title="Add Stock"
        onBack={() => step === "SCAN" ? router.back() : reset()}
      />

      <div className="mx-auto max-w-md p-4 pt-6">

        {/* ── SCAN / SEARCH ── */}
        {step === "SCAN" && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-green-100 shadow-xl shadow-green-500/20 dark:bg-green-500/20">
                <Package className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-black tracking-tight dark:text-white">Stock Intake</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Scan barcode or search by product name / SKU</p>
            </div>

            <button onClick={() => setShowScanner(true)}
              className="group flex w-full items-center justify-between rounded-3xl border-2 border-dashed border-green-400 bg-green-50 p-5 transition hover:bg-green-100 dark:border-green-500/40 dark:bg-green-500/10">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500 text-white shadow-lg shadow-green-500/30">
                  <ScanLine className="h-7 w-7" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-green-800 dark:text-green-300">Scan Barcode</p>
                  <p className="text-xs text-green-600 dark:text-green-400">Use camera to scan</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-green-500" />
            </button>

            <form onSubmit={handleManualSearch} className="space-y-3">
              <div className="relative" ref={searchRef}>
                <div className="relative">
                  {looking
                    ? <Loader2 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-green-500" />
                    : <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  }
                  <input
                    type="text"
                    placeholder="Search by name or barcode..."
                    value={searchInput}
                    onChange={e => { setSearchInput(e.target.value); }}
                    onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    className="w-full rounded-2xl border border-gray-200 bg-white py-4 pl-12 pr-10 text-sm font-medium placeholder-gray-400 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                  {searchInput && (
                    <button type="button" onClick={() => { setSearchInput(""); setSuggestions([]); setShowSuggestions(false); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Live suggestions dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
                    <p className="border-b border-gray-100 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-400 dark:border-gray-700 dark:text-gray-500">
                      {suggestions.length} match{suggestions.length > 1 ? "es" : ""} found
                    </p>
                    {suggestions.map(s => (
                      <button key={s.id} type="button"
                        onMouseDown={() => {
                          setShowSuggestions(false);
                          setSearchInput(s.name);
                          selectProductName(s, null); // will re-check existingStock from lookupProduct
                          lookupProduct(s.name);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-green-50 dark:hover:bg-green-500/10">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-green-100 dark:bg-green-500/20">
                          <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-bold text-gray-900 dark:text-white">{s.name}</p>
                          <p className="text-xs text-gray-400">
                            {[s.barcode && `Barcode: ${s.barcode}`, s.sku && `SKU: ${s.sku}`].filter(Boolean).join(" · ") || "No barcode / SKU"}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-300" />
                      </button>
                    ))}
                    <button type="button" onMouseDown={() => { setShowSuggestions(false); setStep("NEW_PRODUCT"); }}
                      className="flex w-full items-center gap-2 border-t border-gray-100 px-4 py-3 text-sm font-bold text-green-600 transition hover:bg-green-50 dark:border-gray-700 dark:text-green-400 dark:hover:bg-green-500/10">
                      <Plus className="h-4 w-4" />Add as new product
                    </button>
                  </div>
                )}
              </div>

              <button type="submit" disabled={!searchInput.trim() || looking}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 py-4 font-bold text-white transition hover:bg-gray-700 disabled:opacity-50 dark:bg-white dark:text-black">
                {looking ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                {looking ? "Searching..." : "Search"}
              </button>
            </form>

            {lookupError && (
              <div className="flex items-center gap-2 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-600 dark:bg-red-500/10 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />{lookupError}
              </div>
            )}

            <button onClick={() => setStep("NEW_PRODUCT")}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-4 text-sm font-bold text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              <Plus className="h-5 w-5" />Add New Product Manually
            </button>
          </div>
        )}

        {/* ── SELECT MATCH ── */}
        {step === "SELECT_MATCH" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <p className="font-bold text-gray-700 dark:text-gray-300">Multiple products found — select one:</p>
            {matches.map(m => (
              <button key={m.id} onClick={() => selectProductName(m, existingStock && existingStock.productName_id === m.id ? existingStock : null)}
                className="flex w-full items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition hover:border-green-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-500/20">
                  <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 dark:text-white">{m.name}</p>
                  <p className="text-xs text-gray-500">{m.barcode || m.sku || "No barcode/SKU"}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
            ))}
            <button onClick={() => setStep("NEW_PRODUCT")}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 py-4 text-sm font-bold text-gray-500 dark:border-gray-600 dark:text-gray-400">
              <Plus className="h-4 w-4" />None of these — create new
            </button>
          </div>
        )}

        {/* ── TOP UP (existing in this shop) ── */}
        {step === "TOP_UP" && selectedProductName && existingStock && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="rounded-3xl border border-green-200 bg-green-50 p-5 dark:border-green-500/20 dark:bg-green-500/10">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500 text-white">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400">In Stock — Top Up</p>
                  <h3 className="text-lg font-black dark:text-white">{selectedProductName.name}</h3>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                <span className="rounded-xl bg-white px-3 py-1 font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  Current: <span className="text-green-600">{existingStock.quantity}</span> units
                </span>
                {selectedProductName.barcode && (
                  <span className="rounded-xl bg-white px-3 py-1 font-mono text-xs text-gray-500 dark:bg-gray-800">{selectedProductName.barcode}</span>
                )}
              </div>
            </div>
            {renderImageSection()}
            {renderStockForm()}
            {saveError && <div className="flex items-center gap-2 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-600 dark:bg-red-500/10 dark:text-red-400"><AlertCircle className="h-4 w-4" />{saveError}</div>}
            <button onClick={handleSave} disabled={saving || !quantity}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 py-5 text-lg font-black text-white shadow-xl shadow-green-600/30 transition hover:bg-green-700 disabled:opacity-50">
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShoppingBag className="h-5 w-5" />}
              {saving ? "Saving..." : `Add ${quantity || 0} Units`}
            </button>
          </div>
        )}

        {/* ── ADD TO SHOP (known product, new to this shop) ── */}
        {step === "ADD_TO_SHOP" && selectedProductName && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="rounded-3xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-500/20 dark:bg-blue-500/10">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500 text-white">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Adding to This Shop</p>
                  <h3 className="text-lg font-black dark:text-white">{selectedProductName.name}</h3>
                </div>
              </div>
              {selectedProductName.barcode && (
                <p className="mt-2 font-mono text-xs text-gray-500">Barcode: {selectedProductName.barcode}</p>
              )}
            </div>
            {renderImageSection()}
            {renderStockForm()}
            {saveError && <div className="flex items-center gap-2 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-600 dark:bg-red-500/10 dark:text-red-400"><AlertCircle className="h-4 w-4" />{saveError}</div>}
            <button onClick={handleSave} disabled={saving || !quantity || !price}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 py-5 text-lg font-black text-white shadow-xl shadow-green-600/30 transition hover:bg-green-700 disabled:opacity-50">
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
              {saving ? "Adding..." : "Add to Shop Inventory"}
            </button>
          </div>
        )}

        {/* ── NEW PRODUCT ── */}
        {step === "NEW_PRODUCT" && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="rounded-3xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-500/20 dark:bg-orange-500/10">
              <p className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">New Product</p>
              <p className="mt-0.5 text-sm text-orange-700 dark:text-orange-300">Not found in database. Fill in details below.</p>
            </div>

            <div className="space-y-4 rounded-3xl border border-gray-100 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
              <h4 className="font-bold dark:text-white">Product Identity</h4>

              {renderImageSection()}

              <div className="relative">
                <label className={labelCls}><Tag className="mr-1 inline h-3 w-3" />Product Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. Inyange 1L Milk"
                    value={newName}
                    onChange={e => {
                      setNewName(e.target.value);
                      searchSuggestions(e.target.value);
                    }}
                    onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className={inputCls}
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
                      {suggestions.map(s => (
                        <button key={s.id} type="button"
                          onMouseDown={() => {
                            setShowSuggestions(false);
                            setNewName(s.name);
                            selectProductName(s, null);
                            lookupProduct(s.name);
                          }}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-green-50 dark:hover:bg-green-500/10">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-500/20">
                            <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-gray-900 dark:text-white">{s.name}</p>
                            <p className="text-[10px] text-gray-400">
                              {[s.barcode && `Barcode: ${s.barcode}`, s.sku && `SKU: ${s.sku}`].filter(Boolean).join(" · ") || "No barcode / SKU"}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-300" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Barcode — auto-filled if scanned, otherwise allow scan */}
              <div>
                <label className={labelCls}><Barcode className="mr-1 inline h-3 w-3" />Barcode</label>
                <div className="flex gap-2">
                  <input type="text" placeholder="Scan or enter barcode" value={scannedBarcode}
                    onChange={e => setScannedBarcode(e.target.value)} className={inputCls} readOnly={!!scannedBarcode} />
                  {scannedBarcode
                    ? <button type="button" onClick={() => setScannedBarcode("")}
                      className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-500">
                      <X className="h-4 w-4" />
                    </button>
                    : <button type="button" onClick={() => setShowScanner(true)}
                      className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400">
                      <ScanLine className="h-5 w-5" />
                    </button>
                  }
                </div>
              </div>

              <div>
                <label className={labelCls}>SKU <span className="font-normal normal-case text-gray-400">(optional)</span></label>
                <input type="text" placeholder="e.g. INY-MILK-1L" value={newSku} onChange={e => setNewSku(e.target.value)} className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Description <span className="font-normal normal-case text-gray-400">(optional)</span></label>
                <input type="text" placeholder="Brief product description" value={newDescription} onChange={e => setNewDescription(e.target.value)} className={inputCls} />
              </div>
            </div>

            <div className="space-y-4 rounded-3xl border border-gray-100 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
              <h4 className="font-bold dark:text-white">Stock & Pricing</h4>
              {renderStockForm()}
            </div>

            {saveError && <div className="flex items-center gap-2 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-600 dark:bg-red-500/10 dark:text-red-400"><AlertCircle className="h-4 w-4" />{saveError}</div>}

            <button onClick={handleSave} disabled={saving || !newName.trim() || !quantity}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 py-5 text-lg font-black text-white shadow-xl shadow-green-600/30 transition hover:bg-green-700 disabled:opacity-50">
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
              {saving ? "Creating..." : "Create & Add to Stock"}
            </button>
          </div>
        )}

        {/* ── SUCCESS ── */}
        {step === "SUCCESS" && (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 shadow-2xl shadow-green-500/30 dark:bg-green-500/20">
              <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-3xl font-black tracking-tight dark:text-white">Stock Added!</h2>
            <p className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              {quantity} unit(s) recorded successfully.
            </p>
            <div className="mt-10 flex w-full flex-col gap-3">
              <button onClick={reset}
                className="flex items-center justify-center gap-2 rounded-2xl bg-green-600 py-5 text-lg font-black text-white shadow-xl shadow-green-600/30 transition hover:bg-green-700">
                <RotateCcw className="h-5 w-5" />Add Another Item
              </button>
              <button onClick={() => router.push("/MobilePOS/Dashboard")}
                className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-4 font-bold text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                <ArrowLeft className="h-5 w-5" />Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>

      {showScanner && (
        <POSBarcodeScanner
          onBarcodeDetected={handleBarcodeDetected}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
