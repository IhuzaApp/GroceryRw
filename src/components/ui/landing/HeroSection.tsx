import { MapPin } from "lucide-react";
import AnimatedIllustrations from "../AnimatedIllustrations";

interface HeroSectionProps {
  address: string;
  addressInputRef: React.RefObject<HTMLInputElement>;
  onAddressChange: (value: string) => void;
  onAddressSubmit: (e?: React.FormEvent) => void;
  onUseCurrentLocation: () => void;
}

export default function HeroSection({
  address,
  addressInputRef,
  onAddressChange,
  onAddressSubmit,
  onUseCurrentLocation,
}: HeroSectionProps) {
  return (
    <div className="mt-12 flex flex-col items-center justify-center gap-12 md:mt-20 md:flex-row md:items-center md:justify-center md:gap-16 lg:gap-20">
      {/* Left: Animated Illustrations */}
      <div className="w-full md:flex md:w-auto md:flex-1 md:justify-center lg:max-w-md lg:flex-none">
        <AnimatedIllustrations />
      </div>

      {/* Right: Text and Input */}
      <div className="flex-1 text-center md:max-w-xl md:text-left">
        <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
          Grocery delivery
        </h1>
        <p className="mb-8 text-lg text-white md:text-xl">
          Food, pharmacies, markets, stores, services, bids, anything!
        </p>

        {/* Address Input - Button Inside */}
        <form onSubmit={onAddressSubmit} className="w-full max-w-2xl">
          <div className="relative rounded-2xl bg-white shadow-lg">
            <MapPin className="absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              ref={addressInputRef}
              type="text"
              value={address}
              onChange={(e) => onAddressChange(e.target.value)}
              placeholder="What's your address?"
              className="w-full rounded-2xl border-0 bg-transparent py-4 pl-12 pr-40 text-gray-900 focus:outline-none"
            />
            <button
              type="button"
              onClick={address ? onAddressSubmit : onUseCurrentLocation}
              className="absolute right-2 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-xl bg-[#A8E6CF] px-4 py-2.5 text-sm font-bold text-[#00A67E] transition-colors hover:bg-[#90D9B8]"
            >
              {address ? "Continue" : "Use current location"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
