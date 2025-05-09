"use client"

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader, toaster, Message } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';
import { formatCurrency } from '../../../lib/formatCurrency';

interface MapSectionProps {
  mapLoaded: boolean;
  availableOrders: Array<{ id: string }>;
}

// Haversine formula to compute distance in km
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Shop data type
interface Shop {
  id: string;
  name: string;
  latitude: string;
  longitude: string;
  is_active: boolean;
}

// Pending order data type
interface PendingOrder {
  id: string;
  latitude: number;
  longitude: number;
  earnings: number;
  shopName: string;
  shopAddress: string;
  shopLat: number;
  shopLng: number;
  createdAt: string;
  itemsCount: number;
  addressStreet: string;
  addressCity: string;
}

export default function MapSection({ mapLoaded, availableOrders }: MapSectionProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const watchIdRef = useRef<number | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  // Refs for real-time map and marker
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const handleGoLive = () => {
    if (!isOnline) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            // Set session cookies
            document.cookie = `user_latitude=${latitude}; path=/`;
            document.cookie = `user_longitude=${longitude}; path=/`;
            // Immediately reposition and add marker on the map, zoom into street level
            const defaultZoom = 18;
            if (userMarkerRef.current && mapInstanceRef.current) {
              userMarkerRef.current.setLatLng([latitude, longitude]);
              userMarkerRef.current.addTo(mapInstanceRef.current);
              mapInstanceRef.current.setView([latitude, longitude], defaultZoom);
            }
          },
          (error) => console.error("Error obtaining location:", error),
          { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
        );
      } else {
        console.error("Geolocation is not supported by this browser.");
      }
    } else {
      // Clear session cookies
      document.cookie = "user_latitude=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "user_longitude=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      // Remove marker when going offline
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
      }
    }
    setIsOnline(!isOnline);
  };

  useEffect(() => {
    // Check cookies on mount to set online status
    const cookieMap = document.cookie.split('; ').reduce((acc: Record<string, string>, cur) => {
      const [k, v] = cur.split('=');
      acc[k] = v;
      return acc;
    }, {} as Record<string, string>);
    if (cookieMap['user_latitude'] && cookieMap['user_longitude']) {
      setIsOnline(true);
    }
  }, []);

  useEffect(() => {
    // Start or stop continuous location tracking based on online status
    if (isOnline) {
      if (navigator.geolocation) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            document.cookie = `user_latitude=${latitude}; path=/`;
            document.cookie = `user_longitude=${longitude}; path=/`;
            // Update marker position and recenter map
            if (userMarkerRef.current && mapInstanceRef.current) {
              userMarkerRef.current.setLatLng([latitude, longitude]);
              mapInstanceRef.current.setView([latitude, longitude], mapInstanceRef.current.getZoom());
            }
          },
          (error) => console.error("Error watching location:", error),
          { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
        );
      }
    } else {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      // Remove the user marker from the map when offline
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
      }
      // Zoom out map on offline
      if (mapInstanceRef.current && typeof mapInstanceRef.current.setZoom === 'function') {
        mapInstanceRef.current.setZoom(14);
      }
    }
    // Cleanup on unmount
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isOnline]);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    // Initialize Leaflet map
    const map = L.map(mapRef.current, {
      center: [-1.9706, 30.1044],
      zoom: 14,
      minZoom: 10,
      maxBounds: [[-2.8, 28.8], [-1.0, 31.5]],
      scrollWheelZoom: false,
      attributionControl: false,
    });
    // Store map instance for real-time updates
    mapInstanceRef.current = map;

    // Muted, light-themed basemap (CartoDB Positron)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      // attributionControl disabled, no attribution shown
    }).addTo(map);

    // Custom avatar icon for user location
    const userIconHtml = `
      <div style="
        background: white;
        border: 2px solid #3b82f6;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="font-size: 16px;">👤</span>
      </div>
    `;
    const userIcon = L.divIcon({
      html: userIconHtml,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });
    // Add user marker and store reference at default location
    userMarkerRef.current = L.marker([-1.9706, 30.1044], { icon: userIcon })
      .addTo(map)
      .bindPopup('Your Location');
    // Check for stored location in cookies
    const initCookies = document.cookie.split('; ').reduce((acc: Record<string,string>, cur) => {
      const [k,v] = cur.split('='); acc[k]=v; return acc;
    }, {} as Record<string,string>);
    if (initCookies['user_latitude'] && initCookies['user_longitude']) {
      const lat = parseFloat(initCookies['user_latitude']);
      const lng = parseFloat(initCookies['user_longitude']);
      userMarkerRef.current.setLatLng([lat, lng]);
      map.setView([lat, lng], 18);
    } else if (navigator.geolocation) {
      // No stored location, use live geolocation
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (userMarkerRef.current && mapInstanceRef.current) {
            userMarkerRef.current.setLatLng([latitude, longitude]);
            mapInstanceRef.current.setView([latitude, longitude], 18);
          }
        },
        (error) => console.error("Error obtaining initial location:", error),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      );
    }
    // Hide the user marker if offline on initial load
    if (!isOnline && userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    // Fetch and render shop markers with custom icons
    fetch('/api/shopper/shops')
      .then((res) => res.json())
      .then((data: Shop[]) => {
        setShops(data);
        data.forEach((shop) => {
          const lat = parseFloat(shop.latitude);
          const lng = parseFloat(shop.longitude);
          const shopIconHtml = `
            <img src="https://static-00.iconduck.com/assets.00/shop-icon-2048x1878-qov4lrv1.png" style="
              width: 32px;
              height: 32px;
              filter: ${shop.is_active ? 'none' : 'grayscale(100%)'};
            " />
          `;
          const shopIcon = L.divIcon({
            html: shopIconHtml,
            className: '',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
          });
          L.marker([lat, lng], { icon: shopIcon })
            .addTo(map)
            .bindPopup(`${shop.name}${shop.is_active ? '' : ' (Disabled)'}`);
        });
      })
      .catch((err) => console.error('Shop fetch error:', err));

    // Fetch and render pending orders (>20min unassigned)
    fetch('/api/shopper/pendingOrders')
      .then((res) => res.json())
      .then((data: PendingOrder[]) => {
        console.log('Pending orders to map:', data);
        setPendingOrders(data);
        data.forEach((order) => {
          // use exact coords
          const lat = order.latitude;
          const lng = order.longitude;
          // time since creation
          const created = new Date(order.createdAt);
          const diffMs = Date.now() - created.getTime();
          const diffMins = Math.floor(diffMs / 60000);
          const timeStr = diffMins >= 60
            ? `${Math.floor(diffMins/60)}h ${diffMins%60}m ago`
            : `${diffMins} mins ago`;
          // distance between shop and delivery address
          const distKm = getDistanceKm(order.shopLat, order.shopLng, order.latitude, order.longitude);
          const distanceStr = `${Math.round(distKm*10)/10} km`;
          const earningsStr = formatCurrency(order.earnings);
          // Earnings badge icon
          const pendingIcon = L.divIcon({
            html: `<div style="background:#fff;border:2px solid #8b5cf6;border-radius:12px;padding:4px 12px;font-size:12px;color:#8b5cf6;white-space:nowrap;">${earningsStr}</div>`,
            className: '',
            iconSize: [90, 30],
            iconAnchor: [60, 15],
            popupAnchor: [0, -15],
          });
          const marker = L.marker([lat, lng], { icon: pendingIcon, zIndexOffset: 1000 }).addTo(map);
          // Enhanced popup with icons and flex layout
          const popupContent = `
            <div style="font-size:14px; line-height:1.4; min-width:200px;">
              <div style="display:flex;align-items:center;margin-bottom:4px;">
                <span style="margin-right:6px;">🆔</span><strong>${order.id}</strong>
              </div>
              <div style="display:flex;align-items:center;margin-bottom:4px;">
                <span style="margin-right:6px;">🏪</span><span>${order.shopName}</span>
              </div>
              <div style="display:flex;align-items:center;margin-bottom:4px;">
                <span style="margin-right:6px;">📍</span><span>${order.shopAddress}</span>
              </div>
              <div style="display:flex;align-items:center;margin-bottom:4px;">
                <span style="margin-right:6px;">⏱️</span><span>${timeStr}</span>
              </div>
              <div style="display:flex;align-items:center;margin-bottom:4px;">
                <span style="margin-right:6px;">📏</span><span>Distance: ${distanceStr}</span>
              </div>
              <div style="display:flex;align-items:center;margin-bottom:4px;">
                <span style="margin-right:6px;">🛒</span><span>Items: ${order.itemsCount}</span>
              </div>
              <div style="display:flex;align-items:center;margin-bottom:4px;">
                <span style="margin-right:6px;">🚚</span><span>Deliver to: ${order.addressStreet}, ${order.addressCity}</span>
              </div>
              <div style="display:flex;align-items:center;">
                <span style="margin-right:6px;">💰</span><span>Estimated Earnings: ${earningsStr}</span>
              </div>
              <button id="accept-batch-${order.id}" style="margin-top:8px;padding:6px 12px;background:#10b981;color:#fff;border:none;border-radius:4px;cursor:pointer;">
                Accept Batch
              </button>
            </div>
          `;
          // Bind popup with max width
          marker.bindPopup(popupContent, { maxWidth: 250 });
          marker.on('popupopen', () => {
            const btn = document.getElementById(`accept-batch-${order.id}`) as HTMLButtonElement | null;
            if (btn) {
              btn.addEventListener('click', () => {
                // Show loading state on button
                btn.disabled = true;
                // Change button to green and show spinner
                btn.style.background = '#10b981';
                btn.innerHTML = '<span class="animate-spin mr-2 inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>Assigning...';
                // Toast assigning
                toaster.push(
                  <Message showIcon type="info" header="Assigning">
                    Assigning order...
                  </Message>,
                  { placement: 'topEnd' }
                );
                fetch('/api/shopper/assignOrder', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ orderId: order.id }),
                })
                  .then((res) => res.json())
                  .then(() => {
                    // Success toast
                    toaster.push(
                      <Message showIcon type="success" header="Assigned">
                        Order assigned!
                      </Message>,
                      { placement: 'topEnd' }
                    );
                    // Remove marker and update state
                    map.removeLayer(marker);
                    setPendingOrders((prev) => prev.filter((o) => o.id !== order.id));
                  })
                  .catch((err) => {
                    console.error('Assign failed:', err);
                    toaster.push(
                      <Message showIcon type="error" header="Error">
                        Failed to assign.
                      </Message>,
                      { placement: 'topEnd' }
                    );
                    btn.disabled = false;
                    btn.style.background = '#3b82f6';
                    btn.innerHTML = 'Accept Batch';
                  });
              });
            }
          });
        });
      })
      .catch((err) => console.error('Pending orders fetch error:', err));

    return () => {
      map.remove();
    };
  }, [mapLoaded]);

  useEffect(() => {
    // Listen for dashboard toggle event
    const onToggle = () => handleGoLive();
    window.addEventListener('toggleGoLive', onToggle);
    return () => window.removeEventListener('toggleGoLive', onToggle);
  }, [handleGoLive]);

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className="h-[calc(100vh-4rem-3.5rem)] md:h-[600px] rounded-lg overflow-hidden"
      />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <Loader size="lg" content="Loading map..." />
        </div>
      )}

      {mapLoaded && (
        <button
          onClick={handleGoLive}
          className={`hidden md:block absolute bottom-5 left-1/2 transform -translate-x-1/2 z-[1000] font-bold py-2 rounded-full shadow-lg w-[90%] md:w-auto md:px-4 ${isOnline ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
        >
          {isOnline ? 'Go Offline' : 'Start Plas'}
        </button>
      )}
    </div>
  );
} 