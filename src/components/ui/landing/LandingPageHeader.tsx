import Image from "next/image";
import { MapPin, User } from "lucide-react";
import { useRouter } from "next/router";

interface LandingPageHeaderProps {
  isScrolled: boolean;
  address: string;
  displayAddress: string;
  addressInputRef: React.RefObject<HTMLInputElement>;
  stickyAddressInputRef: React.RefObject<HTMLInputElement>;
  onAddressChange: (value: string) => void;
  onAddressSubmit: (e?: React.FormEvent) => void;
  onUseCurrentLocation: () => void;
  isMobile: boolean;
}

export default function LandingPageHeader({
  isScrolled,
  address,
  displayAddress,
  addressInputRef,
  stickyAddressInputRef,
  onAddressChange,
  onAddressSubmit,
  onUseCurrentLocation,
  isMobile,
}: LandingPageHeaderProps) {
  const router = useRouter();

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo and Location */}
          <div className="flex flex-shrink-0 items-center gap-4">
            <div className="flex items-center gap-2">
              <Image
                src="/assets/logos/PlasIcon.png"
                alt="Plas Logo"
                width={40}
                height={40}
                className="h-10 w-10"
              />
              <span
                className={`text-2xl font-bold transition-colors ${
                  isScrolled ? "text-[#00D9A5]" : "text-white"
                }`}
              >
                Plas
              </span>
              <span
                className={`text-2xl font-bold transition-colors ${
                  isScrolled ? "text-[#00D9A5]" : "text-white"
                }`}
              >
                ?
              </span>
            </div>
            {/* Location Display */}
            {displayAddress && (
              <button
                onClick={() => {
                  addressInputRef.current?.focus();
                  if (!isScrolled) {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                className={`hidden items-center gap-2 rounded-full border-2 px-4 py-2 transition-all md:flex ${
                  isScrolled
                    ? "border-gray-300 bg-white text-gray-900 hover:border-[#00D9A5]"
                    : "border-white/30 bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                <MapPin
                  className={`h-4 w-4 ${
                    isScrolled ? "text-gray-600" : "text-white"
                  }`}
                />
                <span className="max-w-[200px] truncate text-sm font-medium">
                  {displayAddress}
                </span>
                <svg
                  className={`h-4 w-4 ${
                    isScrolled ? "text-gray-600" : "text-white"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Address Input - Only shown when scrolled */}
          {isScrolled && (
            <div className="mx-4 hidden max-w-xl flex-1 md:flex">
              <form onSubmit={onAddressSubmit} className="w-full">
                <div className="relative rounded-2xl border-2 border-[#00D9A5] bg-white shadow-sm">
                  <MapPin className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    ref={stickyAddressInputRef}
                    type="text"
                    value={address}
                    onChange={(e) => onAddressChange(e.target.value)}
                    placeholder="What's your address?"
                    className="w-full rounded-2xl border-0 bg-transparent py-2 pl-10 pr-36 text-sm text-gray-900 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={address ? onAddressSubmit : onUseCurrentLocation}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-xl bg-[#A8E6CF] px-3 py-1.5 text-xs font-bold text-[#00A67E] transition-colors hover:bg-[#90D9B8]"
                  >
                    {address ? "Continue" : "Use current location"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Login Button */}
          <button
            onClick={() => router.push("/Auth/Login")}
            className="flex flex-shrink-0 items-center gap-2 rounded-full bg-[#00D9A5] px-6 py-2.5 font-medium text-white transition-colors hover:bg-[#00C896]"
          >
            <User className="h-5 w-5" />
            <span className="hidden sm:inline">Login</span>
          </button>
        </div>
      </div>
    </header>
  );
}
