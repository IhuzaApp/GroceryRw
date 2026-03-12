import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

interface Location {
  id: string;
  name: string;
  city: string;
  type: string;
  lat: number;
  lng: number;
  details: string;
}

const locations: Location[] = [
  {
    id: "rw",
    name: "Rwanda Office",
    city: "Kigali",
    type: "Headquarters",
    lat: -1.9441,
    lng: 30.0619,
    details: "The heart of Plas operations and our primary innovation center.",
  },
  {
    id: "ug",
    name: "Uganda Office",
    city: "Kampala",
    type: "Regional Office",
    lat: 0.3476,
    lng: 32.5825,
    details: "Focusing on expansion and local market integration in Uganda.",
  },
  {
    id: "ke",
    name: "Kenya Office",
    city: "Nairobi",
    type: "Logistics Office",
    lat: -1.2921,
    lng: 36.8219,
    details: "Strategic center for East African logistics and trade.",
  },
  {
    id: "et",
    name: "Ethiopia Office",
    city: "Addis Ababa",
    lat: 9.0333,
    lng: 38.75,
    type: "Service Center",
    details:
      "Empowering businesses in one of Africa's fastest-growing economies.",
  },
  {
    id: "za",
    name: "South Africa Office",
    city: "Johannesburg",
    lat: -26.2041,
    lng: 28.0473,
    type: "Enterprise Center",
    details: "Driving large-scale enterprise solutions in the southern region.",
  },
];

export default function LocationsMapSection() {
  const [activeLocation, setActiveLocation] = useState<Location | null>(null);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    // Load Leaflet only on the client side
    import("leaflet").then((mod) => {
      setL(mod.default);
    });
  }, []);

  // Custom Icon for Leaflet
  const customIcon = useMemo(() => {
    if (!L) return null;
    return L.divIcon({
      html: `
        <div style="
          background: #00D9A5;
          border: 3px solid white;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          cursor: pointer;
          transition: all 0.3s ease;
        " class="marker-pin-inner">
          <div style="
            width: 10px;
            height: 10px;
            background: white;
            border-radius: 50%;
          "></div>
        </div>
      `,
      className: "custom-marker",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  }, [L]);

  const activeIcon = useMemo(() => {
    if (!L) return null;
    return L.divIcon({
      html: `
        <div style="
          background: #1A1A1A;
          border: 3px solid #00D9A5;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 16px rgba(0,0,0,0.3);
          cursor: pointer;
          transform: scale(1.1);
        ">
          <div style="
            width: 12px;
            height: 12px;
            background: #00D9A5;
            border-radius: 50%;
            animation: pulse 1.5s infinite;
          "></div>
        </div>
      `,
      className: "custom-marker-active",
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  }, [L]);

  return (
    <section className="bg-white py-24">
      <div className="container mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Map Column */}
          <div className="relative h-[600px] w-full overflow-hidden rounded-3xl border border-gray-100 bg-gray-50 shadow-xl">
            <div className="absolute right-4 top-4 z-[1000]">
              <span className="inline-flex items-center gap-2 rounded-full border border-gray-100 bg-white px-4 py-2 text-xs font-bold text-gray-700 shadow-lg">
                <Info className="h-4 w-4 text-[#00D9A5]" />
                Explore our African regional offices
              </span>
            </div>

            {/* Map Component */}
            <MapContainer
              center={[-2, 33]} // Centered around Central/East Africa
              zoom={4}
              scrollWheelZoom={true}
              className="h-full w-full"
              style={{ background: "#f8fafc" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />

              {locations.map((loc) => (
                <Marker
                  key={loc.id}
                  position={[loc.lat, loc.lng]}
                  icon={
                    activeLocation?.id === loc.id
                      ? activeIcon || undefined
                      : customIcon || undefined
                  }
                  eventHandlers={{
                    click: () => setActiveLocation(loc),
                  }}
                >
                  <Popup className="custom-popup">
                    <div className="p-1">
                      <p className="font-bold text-[#1A1A1A]">{loc.name}</p>
                      <p className="text-xs text-gray-500">
                        {loc.city},{" "}
                        {loc.id === "za"
                          ? "South Africa"
                          : loc.id === "et"
                            ? "Ethiopia"
                            : loc.id === "ke"
                              ? "Kenya"
                              : loc.id === "ug"
                                ? "Uganda"
                                : "Rwanda"}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Injected CSS for Animations */}
            <style
              dangerouslySetInnerHTML={{
                __html: `
              @keyframes pulse {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.5); opacity: 0.5; }
                100% { transform: scale(1); opacity: 1; }
              }
              .leaflet-container {
                z-index: 1;
              }
            `,
              }}
            />
          </div>

          {/* Details Column */}
          <div className="flex flex-col justify-center">
            <h2 className="mb-8 text-center text-3xl font-bold text-[#1A1A1A] md:text-4xl lg:text-left">
              Our African <span className="text-[#00A67E]">Network</span>
            </h2>

            <div className="space-y-6">
              {!activeLocation ? (
                <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/30 p-12 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-gray-100 bg-white shadow-sm">
                    <MapPin className="h-8 w-8 text-gray-300" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-gray-500">
                    Select an Office
                  </h3>
                  <p className="mx-auto max-w-sm text-gray-400">
                    Interact with the map to explore our presence across the
                    continent. Select an office to see more details.
                  </p>
                </div>
              ) : (
                <div className="duration-300 animate-in fade-in slide-in-from-right-4">
                  <div className="mb-6 rounded-3xl border border-emerald-100 bg-emerald-50 p-8 shadow-sm">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#00A67E] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
                      {activeLocation.type}
                    </div>
                    <h3 className="mb-2 text-4xl font-bold text-[#1A1A1A]">
                      {activeLocation.name}
                    </h3>
                    <p className="mb-6 flex items-center gap-2 text-xl font-bold text-[#00A67E]">
                      <MapPin className="h-5 w-5" />
                      {activeLocation.city},{" "}
                      {activeLocation.id === "za"
                        ? "South Africa"
                        : activeLocation.id === "et"
                          ? "Ethiopia"
                          : activeLocation.id === "ke"
                            ? "Kenya"
                            : activeLocation.id === "ug"
                              ? "Uganda"
                              : "Rwanda"}
                    </p>
                    <div className="mb-6 h-px w-full bg-emerald-200" />
                    <p className="border-l-4 border-[#00D9A5] pl-4 text-lg font-medium italic leading-relaxed text-[#1A1A1A]">
                      "{activeLocation.details}"
                    </p>
                    <button className="group mt-8 flex items-center gap-2 font-bold text-[#1A1A1A] transition-colors hover:text-[#00A67E]">
                      Open in Maps
                      <svg
                        className="h-4 w-4 transform transition-transform group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                      <p className="mb-1 text-xs font-bold uppercase tracking-widest text-gray-400">
                        Regional Status
                      </p>
                      <p className="text-lg font-bold text-emerald-600">
                        Active & Scaling
                      </p>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                      <p className="mb-1 text-xs font-bold uppercase tracking-widest text-gray-400">
                        Local Support
                      </p>
                      <p className="text-lg font-bold text-[#1A1A1A]">
                        24/7 Connectivity
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick List */}
            <div className="mt-12 rounded-3xl border border-gray-100 bg-gray-50 p-6">
              <p className="mb-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-gray-400 lg:text-left">
                Our Major Markets
              </p>
              <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
                {locations.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => setActiveLocation(loc)}
                    className={`rounded-full border px-5 py-2.5 text-sm font-bold shadow-sm transition-all ${activeLocation?.id === loc.id
                        ? "scale-105 border-[#1A1A1A] bg-[#1A1A1A] text-white"
                        : "border-gray-200 bg-white text-gray-600 hover:scale-105 hover:border-[#00D9A5] hover:text-[#00A67E]"
                      }`}
                  >
                    {loc.name.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
