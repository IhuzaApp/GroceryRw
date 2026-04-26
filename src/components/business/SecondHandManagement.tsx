"use client";

import { useState } from "react";
import {
  Package,
  PlusCircle,
  FileText,
  History,
  X,
  Cpu,
  Sparkles,
  Settings,
  Camera,
} from "lucide-react";

export function SecondHandManagement({ businessAccount, theme }: any) {
  const [view, setView] = useState<"inventory" | "orders">("inventory");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Dummy Data with Categories
  const dummyItems = [
    {
      id: 1,
      name: "Office Desk",
      price: "45,000",
      status: "Active",
      stock: 2,
      category: "Interior",
      image:
        "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=200",
      images: [
        "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=600",
        "https://images.unsplash.com/photo-1593062096033-9a26b09da705?q=80&w=600",
        "https://images.unsplash.com/photo-1493932484597-07b41a59d99a?q=80&w=600",
      ],
      details: {
        material: "Oak Wood",
        dimensions: "120x60x75 cm",
        roomType: "Office",
        condition: "Gently Used",
      },
      description:
        "A solid oak wood office desk in excellent condition. Perfect for home offices.",
    },
    {
      id: 2,
      name: "Dell Monitor 24\"",
      price: "85,000",
      status: "Sold",
      stock: 0,
      category: "Electronic",
      image:
        "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=200",
      images: [
        "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=600",
        "https://images.unsplash.com/photo-1547119957-637f8679db1e?q=80&w=600",
        "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?q=80&w=600",
      ],
      details: {
        brand: "Dell",
        model: "U2419H",
        specs: "IPS, 1080p, 60Hz",
        condition: "Used - Like New",
      },
      description:
        "Professional grade monitor with ultra-thin bezels and accurate color representation.",
    },
    {
      id: 3,
      name: "Fender Stratocaster",
      price: "450,000",
      status: "Active",
      stock: 1,
      category: "Instrument",
      image:
        "https://images.unsplash.com/photo-1550291652-6ea9114a47b1?q=80&w=200",
      images: [
        "https://images.unsplash.com/photo-1550291652-6ea9114a47b1?q=80&w=600",
        "https://images.unsplash.com/photo-1516924911020-87448282000e?q=80&w=600",
        "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=600",
      ],
      details: {
        type: "Electric Guitar",
        brand: "Fender",
        yearsUsed: "5 years",
        condition: "Excellent",
      },
      description:
        "Original Fender Stratocaster, Made in Mexico. Classic tone and smooth playability.",
    },
  ];

  const dummyOrders = [
    {
      id: "SH-1024",
      customer: "John Baguma",
      item: "Office Desk",
      amount: "45,000",
      status: "Pending",
      date: "24 Oct 2026",
    },
    {
      id: "SH-1025",
      customer: "Sarah Keza",
      item: "Ergonomic Chair",
      amount: "240,000",
      status: "Delivered",
      date: "22 Oct 2026",
    },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-500">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="font-outfit text-3xl font-black">Second Hand Items</h2>
          <p className="font-medium text-gray-500">
            Manage your pre-owned assets and sales
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-2xl bg-green-500 px-6 py-3 font-black text-white shadow-xl shadow-green-500/20 transition-all hover:scale-105"
        >
          <PlusCircle className="h-5 w-5" />
          List New Item
        </button>
      </div>

      <div className="flex gap-4 border-b border-gray-200/10 dark:border-white/5">
        <button
          onClick={() => setView("inventory")}
          className={`pb-3 text-sm font-black uppercase tracking-widest transition-all ${
            view === "inventory"
              ? "border-b-2 border-green-500 text-green-500"
              : "text-gray-500"
          }`}
        >
          Inventory
        </button>
        <button
          onClick={() => setView("orders")}
          className={`pb-3 text-sm font-black uppercase tracking-widest transition-all ${
            view === "orders"
              ? "border-b-2 border-green-500 text-green-500"
              : "text-gray-500"
          }`}
        >
          Sales Orders
        </button>
      </div>

      {view === "inventory" ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {dummyItems.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setSelectedItem(item);
                setShowDetailModal(true);
              }}
              className={`group cursor-pointer rounded-[2rem] border p-4 transition-all hover:shadow-xl ${
                theme === "dark"
                  ? "bg-white/5 border-white/5"
                  : "bg-white border-gray-100 shadow-sm"
              }`}
            >
              <div className="relative mb-4 aspect-video overflow-hidden rounded-2xl border border-white/5">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/20 group-hover:opacity-100">
                  <div className="rounded-xl bg-white/20 px-4 py-2 text-xs font-black text-white backdrop-blur-md">
                    View Details
                  </div>
                </div>
                <div
                  className={`absolute right-2 top-2 rounded-full px-3 py-1 text-[10px] font-black uppercase ${
                    item.status === "Active"
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {item.status}
                </div>
                <div className="absolute bottom-2 left-2 flex gap-1">
                  {item.category === "Electronic" && (
                    <Cpu className="h-4 w-4 text-white drop-shadow-md" />
                  )}
                  {item.category === "Instrument" && (
                    <Sparkles className="h-4 w-4 text-white drop-shadow-md" />
                  )}
                  {item.category === "Interior" && (
                    <Package className="h-4 w-4 text-white drop-shadow-md" />
                  )}
                  {item.category === "Equipment" && (
                    <Settings className="h-4 w-4 text-white drop-shadow-md" />
                  )}
                </div>
              </div>
              <h4
                className={`font-outfit mb-1 text-lg font-black ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {item.name}
              </h4>
              <p className="mb-4 text-sm font-black text-green-500">
                RWF {item.price}
              </p>
              <div className="flex items-center justify-between border-t border-gray-200/10 pt-4 dark:border-white/5">
                <span className="text-[10px] font-black uppercase text-gray-400">
                  Stock: {item.stock}
                </span>
                <div className="flex gap-2">
                  <button className="rounded-xl bg-gray-100 p-2 text-gray-500 transition-colors hover:text-green-500 dark:bg-white/5">
                    <FileText className="h-4 w-4" />
                  </button>
                  <button className="rounded-xl bg-gray-100 p-2 text-gray-500 transition-colors hover:text-red-500 dark:bg-white/5">
                    <PlusCircle className="h-4 w-4 rotate-45" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {dummyOrders.map((order) => (
            <div
              key={order.id}
              className={`flex items-center justify-between rounded-[2rem] border p-6 transition-all hover:shadow-lg ${
                theme === "dark"
                  ? "bg-white/5 border-white/5"
                  : "bg-white border-gray-100 shadow-sm"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/10 text-green-500">
                  <History className="h-6 w-6" />
                </div>
                <div>
                  <h4
                    className={`font-outfit text-lg font-black ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {order.item}
                  </h4>
                  <p className="text-xs font-medium text-gray-500">
                    Ordered by {order.customer} • {order.date}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="mb-1 font-black text-green-500">
                  RWF {order.amount}
                </p>
                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${
                    order.status === "Pending"
                      ? "bg-orange-500/10 text-orange-500"
                      : "bg-green-500/10 text-green-500"
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      {showAddModal && (
        <AddItemModal onClose={() => setShowAddModal(false)} theme={theme} />
      )}

      {showDetailModal && selectedItem && (
        <DetailModal
          item={selectedItem}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedItem(null);
          }}
          theme={theme}
        />
      )}
    </div>
  );
}

function DetailModal({ item, onClose, theme }: any) {
  const [activeImage, setActiveImage] = useState(0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative max-h-[90vh] w-full max-w-4xl animate-in zoom-in-95 overflow-y-auto rounded-[2.5rem] shadow-2xl duration-300 ${
          theme === "dark"
            ? "border border-white/10 bg-[#121212]"
            : "bg-white"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute right-6 top-6 z-10 rounded-full bg-black/10 p-2 transition-colors hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Images Section */}
          <div className="p-8">
            <div className="mb-4 aspect-square overflow-hidden rounded-3xl border border-gray-100 dark:border-white/5">
              <img
                src={item.images[activeImage]}
                alt={item.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-2">
              {item.images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                    activeImage === idx
                      ? "scale-105 border-green-500"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Details Section */}
          <div className="p-8 md:pl-0">
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full bg-green-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-green-600">
                {item.category}
              </span>
              <span className="rounded-full bg-blue-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-600">
                {item.status}
              </span>
            </div>
            <h2 className="font-outfit mb-2 text-3xl font-black leading-tight">
              {item.name}
            </h2>
            <p className="mb-6 text-2xl font-black text-green-500">
              RWF {item.price}
            </p>

            <div className="space-y-6">
              <div>
                <h4 className="mb-2 text-xs font-black uppercase tracking-widest text-gray-400">
                  Description
                </h4>
                <p className="font-medium leading-relaxed text-gray-500 dark:text-gray-400 text-sm">
                  {item.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {Object.entries(item.details).map(([key, value]: any) => (
                  <div
                    key={key}
                    className="rounded-2xl border border-gray-100 bg-gray-50 p-3 dark:border-white/5 dark:bg-white/5"
                  >
                    <p className="mb-1 text-[10px] font-black uppercase text-gray-400">
                      {key}
                    </p>
                    <p className="truncate text-sm font-bold">{value}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 border-t border-gray-100 pt-6 dark:border-white/5">
                <button className="flex-1 rounded-2xl bg-green-500 py-4 font-black text-white shadow-xl shadow-green-500/20 transition-all hover:scale-[1.02]">
                  Edit Listing
                </button>
                <button className="rounded-2xl bg-red-500/10 px-6 py-4 font-black text-red-500 transition-all hover:bg-red-500/20">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddItemModal({ onClose, theme }: any) {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<any>(null);

  const categories = [
    {
      id: "Electronic",
      name: "Electronic",
      icon: Cpu,
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      id: "Interior",
      name: "Interior",
      icon: Package,
      color: "text-orange-500 bg-orange-500/10",
    },
    {
      id: "Instrument",
      name: "Instruments",
      icon: Sparkles,
      color: "text-purple-500 bg-purple-500/10",
    },
    {
      id: "Equipment",
      name: "Equipment",
      icon: Settings,
      color: "text-green-500 bg-green-500/10",
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative w-full max-w-2xl animate-in slide-in-from-bottom-8 rounded-[2.5rem] shadow-2xl duration-300 ${
          theme === "dark"
            ? "border border-white/10 bg-[#121212]"
            : "bg-white"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 p-8 dark:border-white/5">
          <div>
            <h2 className="font-outfit text-2xl font-black">List New Item</h2>
            <p className="text-xs font-medium text-gray-500">
              Step {step} of 3 •{" "}
              {step === 1
                ? "Select Category"
                : step === 2
                ? "Details"
                : "Upload Images"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 transition-colors hover:bg-gray-100 dark:hover:bg-white/5"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-8">
          {step === 1 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setCategory(cat.id);
                    setStep(2);
                  }}
                  className={`flex flex-col items-center gap-4 rounded-[2rem] border-2 p-8 transition-all hover:scale-105 ${
                    category === cat.id
                      ? "border-green-500 bg-green-500/5"
                      : "border-gray-100 bg-transparent dark:border-white/5"
                  }`}
                >
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl ${cat.color}`}
                  >
                    <cat.icon className="h-8 w-8" />
                  </div>
                  <span className="font-outfit text-sm font-black uppercase tracking-widest">
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in space-y-4 duration-300">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="ml-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Item Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. iPhone 13 Pro"
                    className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 font-bold text-sm outline-none transition-all focus:border-green-500 dark:border-white/5 dark:bg-white/5"
                  />
                </div>
                <div className="space-y-2">
                  <label className="ml-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Price (RWF)
                  </label>
                  <input
                    type="text"
                    placeholder="500,000"
                    className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 font-bold text-green-500 text-sm outline-none transition-all focus:border-green-500 dark:border-white/5 dark:bg-white/5"
                  />
                </div>
              </div>

              {category === "Electronic" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="ml-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Brand
                    </label>
                    <input
                      type="text"
                      placeholder="Apple"
                      className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 font-bold text-sm outline-none transition-all focus:border-green-500 dark:border-white/5 dark:bg-white/5"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="ml-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Condition
                    </label>
                    <select className="w-full appearance-none rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 font-bold text-sm outline-none transition-all focus:border-green-500 dark:border-white/5 dark:bg-white/5">
                      <option>Brand New</option>
                      <option>Used - Like New</option>
                      <option>Used - Good</option>
                    </select>
                  </div>
                </div>
              )}

              {category === "Instrument" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="ml-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Instrument Type
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Acoustic Guitar"
                      className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 font-bold text-sm outline-none transition-all focus:border-green-500 dark:border-white/5 dark:bg-white/5"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="ml-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Years of Use
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 3 years"
                      className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 font-bold text-sm outline-none transition-all focus:border-green-500 dark:border-white/5 dark:bg-white/5"
                    />
                  </div>
                </div>
              )}

              {category === "Equipment" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="ml-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Tool/Device Type
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Drill or Printer"
                      className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 font-bold text-sm outline-none transition-all focus:border-green-500 dark:border-white/5 dark:bg-white/5"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="ml-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Years of Use
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1.5 years"
                      className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 font-bold text-sm outline-none transition-all focus:border-green-500 dark:border-white/5 dark:bg-white/5"
                    />
                  </div>
                </div>
              )}

              {category === "Interior" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="ml-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Material
                    </label>
                    <input
                      type="text"
                      placeholder="Wood / Metal"
                      className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 font-bold text-sm outline-none transition-all focus:border-green-500 dark:border-white/5 dark:bg-white/5"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="ml-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Dimensions
                    </label>
                    <input
                      type="text"
                      placeholder="120x80 cm"
                      className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 font-bold text-sm outline-none transition-all focus:border-green-500 dark:border-white/5 dark:bg-white/5"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="ml-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Description
                </label>
                <textarea
                  placeholder="Tell us more about the item..."
                  className="h-32 w-full resize-none rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 font-bold text-sm outline-none transition-all focus:border-green-500 dark:border-white/5 dark:bg-white/5"
                ></textarea>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 rounded-2xl bg-gray-100 py-4 text-xs font-black uppercase tracking-widest dark:bg-white/5"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-[2] rounded-2xl bg-green-500 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-green-500/20"
                >
                  Next: Upload Media
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in space-y-6 text-center duration-300">
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <button
                    key={i}
                    className="flex aspect-square flex-col items-center justify-center gap-2 rounded-[2rem] border-2 border-dashed border-gray-200 text-gray-400 transition-all hover:border-green-500 hover:bg-green-500/5 hover:text-green-500 dark:border-white/10"
                  >
                    <Camera className="h-8 w-8" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Photo {i}
                    </span>
                  </button>
                ))}
              </div>

              <div className="rounded-3xl border border-blue-500/10 bg-blue-500/5 p-6">
                <p className="text-xs font-medium text-blue-600">
                  Great photos increase your chances of selling by 70%. Ensure
                  your items are well-lit!
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 rounded-2xl bg-gray-100 py-4 text-xs font-black uppercase tracking-widest dark:bg-white/5"
                >
                  Back
                </button>
                <button
                  onClick={onClose}
                  className="flex-[2] rounded-2xl bg-green-500 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-green-500/20"
                >
                  Complete Listing
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
