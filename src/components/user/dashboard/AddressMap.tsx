import { useEffect, useRef } from "react";

interface AddressMapProps {
  address?: {
    latitude: string;
    longitude: string;
    street: string;
    city: string;
  } | null;
  height?: string;
  className?: string;
}

export default function AddressMap({ 
  address, 
  height = "h-full", 
  className = "" 
}: AddressMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    const initMap = async () => {
      try {
        // Import Leaflet dynamically
        const L = (await import("leaflet")).default;
        
        // Import Leaflet CSS only once
        if (typeof document !== "undefined" && !document.querySelector('link[href*="leaflet"]')) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
          link.crossOrigin = "anonymous";
          document.head.appendChild(link);
        }

        // Clean up existing map if it exists
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        // Clear the container
        if (mapRef.current) {
          mapRef.current.innerHTML = '';
        }

        // Create map instance
        const map = L.map(mapRef.current!, {
          center: address ? [parseFloat(address.latitude), parseFloat(address.longitude)] : [0, 0],
          zoom: address ? 15 : 2,
          zoomControl: true,
          attributionControl: false,
        });

        // Add tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        // Add marker if address exists
        if (address) {
          const lat = parseFloat(address.latitude);
          const lng = parseFloat(address.longitude);
          
          // Create custom marker icon
          const markerIcon = L.divIcon({
            className: "custom-marker",
            html: `
              <div class="w-8 h-8 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                </svg>
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
          });

          const marker = L.marker([lat, lng], { icon: markerIcon }).addTo(map);
          
          // Add popup with address info
          marker.bindPopup(`
            <div class="p-2">
              <h3 class="font-semibold text-gray-900">${address.street}</h3>
              <p class="text-sm text-gray-600">${address.city}</p>
            </div>
          `);

          markerRef.current = marker;

          // Clear any existing timeout
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }

          // Center map after a short delay to ensure everything is initialized
          timeoutRef.current = setTimeout(() => {
            try {
              if (map && mapInstanceRef.current === map) {
                map.setView([lat, lng], 15);
              }
            } catch (error) {
              console.error("Error centering map:", error);
            }
            timeoutRef.current = null;
          }, 300);
        }

        mapInstanceRef.current = map;

      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    initMap();

    // Cleanup function
    return () => {
      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (error) {
          console.error("Error removing map:", error);
        }
        mapInstanceRef.current = null;
      }
      if (markerRef.current) {
        markerRef.current = null;
      }
    };
  }, [address]);


  if (!address) {
    return (
      <div className={`${height} ${className} flex items-center justify-center bg-gray-100 dark:bg-gray-800`}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Address Selected</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Select an address to see it on the map
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${height} ${className} relative`}>
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      
      {/* Custom styles for the marker */}
      <style jsx global>{`
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        
        .leaflet-popup-tip {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
      `}</style>
    </div>
  );
}
