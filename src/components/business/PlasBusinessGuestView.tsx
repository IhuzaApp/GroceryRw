"use client";

import { useState, useEffect } from "react";
import {
  Briefcase,
  CreditCard,
  ArrowRight,
  Package,
  FileText,
  Search,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Globe,
  Users,
} from "lucide-react";
import { useRouter } from "next/router";
import CreateBusinessAccountModal from "./CreateBusinessAccountModal";
import { ServicesSection } from "./ServicesSection";
import { RFQOpportunitiesSection } from "./RFQOpportunitiesSection";
import { useTheme } from "../../context/ThemeContext";

interface PlasBusinessGuestViewProps {
  onAccountCreated?: () => void;
}

export default function PlasBusinessGuestView({
  onAccountCreated,
}: PlasBusinessGuestViewProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInternalModalOpen, setIsInternalModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"services" | "rfqs">("services");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleModalEvent = (e: any) => {
      setIsInternalModalOpen(e.detail);
    };
    window.addEventListener("business-modal-toggle", handleModalEvent);
    return () =>
      window.removeEventListener("business-modal-toggle", handleModalEvent);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isAnyModalOpen = isModalOpen || isInternalModalOpen;

  const handleGuestAction = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg-primary)] transition-colors duration-500 md:ml-16">
      {/* Premium Background System */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -left-[10%] -top-[10%] h-[60%] w-[60%] animate-pulse rounded-full bg-green-500/5 blur-[120px] dark:bg-green-400/5"></div>
        <div
          className="absolute -right-[10%] top-[20%] h-[50%] w-[50%] animate-pulse rounded-full bg-emerald-500/10 blur-[120px] dark:bg-emerald-400/5"
          style={{ animationDelay: "2s" }}
        ></div>
        <div className="absolute bottom-0 left-[20%] h-[40%] w-[40%] rounded-full bg-blue-500/5 blur-[100px] dark:bg-blue-400/5"></div>

        {/* Background Image Overlay */}
        <div
          className="absolute inset-0 z-[-1] bg-cover bg-center bg-no-repeat opacity-[0.07] grayscale"
          style={{ backgroundImage: 'url("/assets/images/auth/login_bg.png")' }}
        />

        {/* Grainy Texture */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3%3Cfilter id='noiseFilter'%3%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-20">
        {/* Asymmetrical Hero Section */}
        <div className="mb-4 flex flex-col gap-12 lg:mb-24 lg:flex-row lg:items-center">
          <div className="hidden max-w-3xl flex-1 space-y-8 lg:block">
            <div className="inline-flex items-center gap-3 rounded-full border border-green-500/20 bg-green-500/5 px-4 py-2 text-sm font-bold text-green-600 backdrop-blur-md dark:border-green-400/20 dark:bg-green-400/10 dark:text-green-400">
              <Sparkles className="h-4 w-4 animate-bounce" />
              <span className="uppercase tracking-wide">
                The Future of Rwandan Trade
              </span>
            </div>

            <h1 className="text-5xl font-black leading-[1.1] tracking-tight text-[var(--text-primary)] sm:text-7xl">
              Elevate Your <br />
              <span className="bg-gradient-to-r from-green-600 via-emerald-500 to-green-500 bg-clip-text text-transparent dark:from-green-400 dark:via-emerald-400 dark:to-green-300">
                Business Frontier
              </span>
            </h1>

            {!isAnyModalOpen && (
              <p className="max-w-xl text-xl font-medium leading-relaxed text-[var(--text-secondary)] opacity-80 transition-opacity duration-300">
                A comprehensive ecosystem designed to bridge the gap between
                Rwandan enterprises and global standards. Discovery, trade, and
                management in one seamless interface.
              </p>
            )}

            <div className="flex flex-wrap gap-6 pt-6">
              <button
                onClick={() => setIsModalOpen(true)}
                className="group relative flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-4 font-bold text-white transition-all hover:scale-105 hover:shadow-2xl hover:shadow-green-500/40 active:scale-95"
              >
                <span className="relative z-10" style={{ color: "#ffffff" }}>
                  Join the Ecosystem
                </span>
                <ArrowRight
                  className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1"
                  style={{ color: "#ffffff" }}
                />
                <div className="absolute inset-0 z-0 bg-gradient-to-r from-emerald-600 to-green-600 opacity-0 transition-opacity group-hover:opacity-100"></div>
              </button>

              <button
                onClick={() => window.open("/pos", "_blank")}
                className="group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-[var(--bg-secondary)] bg-[var(--bg-primary)] px-8 py-4 font-bold text-[var(--text-primary)] transition-all hover:scale-105 hover:border-blue-500/30 hover:bg-blue-500/5 hover:shadow-xl active:scale-95"
              >
                <CreditCard className="relative z-10 h-5 w-5 text-blue-500" />
                <span className="relative z-10">Retail & POS Solution</span>
              </button>

              <div className="flex items-center gap-4 lg:ml-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-10 w-10 rounded-full border-2 border-[var(--bg-primary)] bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800"
                    ></div>
                  ))}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-[var(--text-primary)]">
                    +500 Businesses
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] opacity-50">
                    Already Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden flex-1 lg:block">
            {/* Visual Abstract/Stat Grid for Desktop */}
            <div className="grid grid-cols-2 gap-4 opacity-40 grayscale transition-all duration-700 hover:opacity-100 hover:grayscale-0">
              {[
                {
                  icon: TrendingUp,
                  label: "Market Growth",
                  value: "+24%",
                  color: "text-green-500",
                },
                {
                  icon: Globe,
                  label: "Regional Reach",
                  value: "8 Districts",
                  color: "text-blue-500",
                },
                {
                  icon: Users,
                  label: "Supply Chain",
                  value: "Locked",
                  color: "text-purple-500",
                },
                {
                  icon: Sparkles,
                  label: "Innovation",
                  value: "Top Tier",
                  color: "text-amber-500",
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-[var(--bg-primary)]/50 rounded-3xl border border-[var(--bg-secondary)] p-6 backdrop-blur-xl transition-all hover:-translate-y-2 hover:border-green-500/30"
                >
                  <stat.icon className={`mb-4 h-8 w-8 ${stat.color}`} />
                  <div className="text-2xl font-black text-[var(--text-primary)]">
                    {stat.value}
                  </div>
                  <div className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Discovery Explorer */}
        <div className="space-y-8 lg:space-y-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <h3 className="text-3xl font-black tracking-tighter text-[var(--text-primary)] sm:text-6xl lg:text-7xl">
                Market <span className="text-green-500">Explorer</span>
              </h3>
              <p className="max-w-md text-lg font-medium leading-relaxed text-[var(--text-secondary)] opacity-60">
                Real-time pulses from the Rwandan business ecosystem. Discovery
                and trade simplified.
              </p>
            </div>

            {/* Sliding Segmented Control */}
            <div className="bg-[var(--bg-secondary)]/30 relative flex w-full items-center rounded-2xl border border-[var(--bg-secondary)] p-1 backdrop-blur-md md:w-auto">
              {/* Sliding Highlight */}
              <div
                className="absolute inset-y-1 left-1 rounded-xl bg-white shadow-xl transition-all duration-500 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] dark:bg-gray-800"
                style={{
                  width: "calc(50% - 4px)",
                  transform:
                    activeTab === "services"
                      ? "translateX(0)"
                      : "translateX(100%)",
                }}
              ></div>

              <button
                onClick={() => setActiveTab("services")}
                className={`relative z-10 flex flex-1 items-center justify-center gap-3 px-8 py-3 text-sm font-black transition-colors duration-500 md:flex-none ${
                  activeTab === "services"
                    ? "text-green-600"
                    : "text-[var(--text-secondary)]"
                }`}
              >
                <Package
                  className={`h-4 w-4 transition-transform duration-500 ${
                    activeTab === "services" ? "scale-110" : ""
                  }`}
                />
                Services
              </button>
              <button
                onClick={() => setActiveTab("rfqs")}
                className={`relative z-10 flex flex-1 items-center justify-center gap-3 px-8 py-3 text-sm font-black transition-colors duration-500 md:flex-none ${
                  activeTab === "rfqs"
                    ? "text-green-600"
                    : "text-[var(--text-secondary)]"
                }`}
              >
                <FileText
                  className={`h-4 w-4 transition-transform duration-500 ${
                    activeTab === "rfqs" ? "scale-110" : ""
                  }`}
                />
                RFQs
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="scrollbar-hide max-h-[1200px] overflow-y-auto overflow-x-hidden">
              {activeTab === "services" && (
                <div className="duration-700 animate-in fade-in zoom-in-95">
                  <ServicesSection
                    guestMode={true}
                    onGuestAction={handleGuestAction}
                  />
                </div>
              )}
              {activeTab === "rfqs" && (
                <div className="duration-700 animate-in fade-in zoom-in-95">
                  <RFQOpportunitiesSection
                    guestMode={true}
                    onGuestAction={handleGuestAction}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <CreateBusinessAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAccountCreated={onAccountCreated}
      />

      <style jsx global>{`
        @keyframes subtle-pulse {
          0%,
          100% {
            opacity: 0.1;
            transform: scale(1);
          }
          50% {
            opacity: 0.15;
            transform: scale(1.05);
          }
        }
        .animate-pulse {
          animation: subtle-pulse 8s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
