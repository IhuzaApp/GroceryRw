"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Loader, toaster, Message, Button } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import { useTheme } from "../../../context/ThemeContext";
import { logger } from "../../../utils/logger";
import { useFCMNotifications } from "../../../hooks/useFCMNotifications";
import { formatCurrencySync } from "../../../utils/formatCurrency";

// Internal Map Components and Utils
import { MapSectionProps, Shop, Restaurant, PendingOrder, Location, DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, MAP_STYLES } from "./map/mapTypes";
import * as MapUtils from "./map/mapUtils";
import * as MapPopups from "./map/MapPopups";
import EarningsBadge from "./map/EarningsBadge";
import GoLiveButton from "./map/GoLiveButton";
import BusyAreasToggle from "./map/BusyAreasToggle";
import TrackingModeIndicator from "./map/TrackingModeIndicator";
import RefreshLocationButton from "./map/RefreshLocationButton";

export default function MapSection({
  mapLoaded,
  availableOrders,
  isInitializing = false,
  isExpanded = false,
  notifiedOrder = null,
  shopperLocation = null,
}: MapSectionProps) {
  const { theme } = useTheme();
  const { isInitialized } = useFCMNotifications();
  const mapRef = useRef<HTMLDivElement | null>(null);
  
  // State
  const [shops, setShops] = useState<Shop[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [isOnline, setIsOnline] = useState(false);
  const [dailyEarnings, setDailyEarnings] = useState(0);
  const [completedOrdersCount, setCompletedOrdersCount] = useState(0);
  const [loadingEarnings, setLoadingEarnings] = useState(true);
  const [isRefreshingLocation, setIsRefreshingLocation] = useState(false);
  const [isActivelyTracking, setIsActivelyTracking] = useState(false);
  const [showBusyAreas, setShowBusyAreas] = useState(false);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  // Responsive zoom helper: More zoomed out on mobile (level 8 as requested)
  const getFocusZoom = useCallback(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      return 13; // Level 8 for mobile as requested
    }
    return 16; // Standard zoom for desktop
  }, []);

  // Refs
  const isOnlineRef = useRef(isOnline);
  const watchIdRef = useRef<number | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const orderMarkersRef = useRef<L.Marker[]>([]);
  const locationErrorCountRef = useRef<number>(0);
  const activeToastTypesRef = useRef<Set<string>>(new Set());
  const busyAreaCirclesRef = useRef<L.Circle[]>([]);

  // Sync ref with state
  useEffect(() => {
    isOnlineRef.current = isOnline;
  }, [isOnline]);

  // Helper: Filter aged unassigned orders (optional: keeping it if needed for logic elsewhere, but we'll use all available orders for the map)
  const agedUnassignedOrders = useMemo(() => {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    return (availableOrders || []).filter((order) => {
      let referenceTimestamp;
      if (order.orderType === "restaurant") {
        const updatedAt = (order as any).updatedAt;
        referenceTimestamp = updatedAt && updatedAt !== "null" && updatedAt !== "" ? updatedAt : order.createdAt;
      } else {
        referenceTimestamp = (order as any).rawCreatedAt || order.createdAt;
      }
      const orderTimestamp = new Date(referenceTimestamp);
      if (isNaN(orderTimestamp.getTime())) return false;
      const isAged = orderTimestamp <= thirtyMinutesAgo;
      const isUnassigned = !order.shopper_id || order.shopper_id === null;
      return isAged && isUnassigned;
    });
  }, [availableOrders]);

  const allAvailableOrders = useMemo(() => availableOrders || [], [availableOrders]);

  // Helper: Reduce duplicate toasts
  const reduceToastDuplicates = useCallback((toastType: string, content: React.ReactNode, options: any = {}) => {
    if (activeToastTypesRef.current.has(toastType)) return;
    activeToastTypesRef.current.add(toastType);
    return toaster.push(content, {
      ...options,
      onClose: () => {
        activeToastTypesRef.current.delete(toastType);
        if (options.onClose) options.onClose();
      },
    });
  }, []);

  // Helper: Clear markers
  const clearOrderMarkers = useCallback(() => {
    orderMarkersRef.current.forEach((marker) => {
      try {
        if (marker) marker.remove();
      } catch (e) {}
    });
    orderMarkersRef.current = [];
  }, []);

  const clearBusyAreas = useCallback(() => {
    busyAreaCirclesRef.current.forEach((circle) => {
      try {
        if (circle) circle.remove();
      } catch (e) {}
    });
    busyAreaCirclesRef.current = [];
  }, []);

  // Location logic
  const startLocationTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (navigator.geolocation) {
      locationErrorCountRef.current = 0;
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          locationErrorCountRef.current = 0;
          MapUtils.saveLocationToCookies(latitude, longitude);
          if (userMarkerRef.current && mapInstanceRef.current) {
            try {
              userMarkerRef.current.setLatLng([latitude, longitude]);
              if (MapUtils.isMapReady(mapInstanceRef.current)) {
                mapInstanceRef.current.setView([latitude, longitude], mapInstanceRef.current.getZoom());
              }
            } catch (error) {}
          }
        },
        (error) => {
          console.error("Error watching location:", error);
          locationErrorCountRef.current += 1;
          if (error.code === 1) setIsActivelyTracking(false);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
      );
      setIsActivelyTracking(true);
    }
  }, []);

  const getCurrentPosition = async () => {
    setIsRefreshingLocation(true);
    try {
      const position = await MapUtils.getSingleLocation();
      const { latitude, longitude } = position.coords;
      MapUtils.saveLocationToCookies(latitude, longitude);
      if (userMarkerRef.current && mapInstanceRef.current) {
        userMarkerRef.current.setLatLng([latitude, longitude]);
        userMarkerRef.current.addTo(mapInstanceRef.current);
        mapInstanceRef.current.setView([latitude, longitude], getFocusZoom());
      }
      setIsOnline(true);
      locationErrorCountRef.current = 0;
      toaster.push(<Message type="success" closable>You are now online</Message>, { placement: "topEnd", duration: 3000 });
    } catch (error) {
      locationErrorCountRef.current += 1;
      toaster.push(<Message type="error" closable>Could not get your location. Please check settings.</Message>, { placement: "topEnd", duration: 5000 });
    } finally {
      setIsRefreshingLocation(false);
    }
  };

  const handleGoLive = useCallback(() => {
    if (!isOnline) {
      setIsRefreshingLocation(true);
      const cookies = MapUtils.getCookies();
      if (cookies["user_latitude"] && cookies["user_longitude"]) {
        const lat = parseFloat(cookies["user_latitude"]);
        const lng = parseFloat(cookies["user_longitude"]);
        try {
          if (userMarkerRef.current && mapInstanceRef.current) {
            userMarkerRef.current.setLatLng([lat, lng]);
            userMarkerRef.current.addTo(mapInstanceRef.current);
            mapInstanceRef.current.setView([lat, lng], getFocusZoom());
          }
          setIsOnline(true);
          setIsRefreshingLocation(false);
          toaster.push(<Message type="success" closable>You are now online</Message>, { placement: "topEnd", duration: 3000 });
        } catch (error) { getCurrentPosition(); }
      } else { getCurrentPosition(); }
    } else {
      setIsOnline(false);
      setIsActivelyTracking(false);
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      document.cookie = "user_latitude=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "user_longitude=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      if (userMarkerRef.current) userMarkerRef.current.remove();
      toaster.push(<Message type="info" closable>You are now offline</Message>, { placement: "topEnd", duration: 3000 });
    }
  }, [isOnline]);

  // Order Assignment Handler
  const attachAcceptHandler = useCallback((marker: L.Marker, orderId: string, map: L.Map, orderType: string = "regular") => {
    marker.on("popupopen", () => {
      const btn = document.getElementById(`accept-batch-${orderId}`) as HTMLButtonElement | null;
      if (btn) {
        btn.addEventListener("click", () => {
          btn.disabled = true;
          btn.style.background = orderType === "reel" ? "#8b5cf6" : "#10b981";
          btn.innerHTML = '<span class="animate-spin mr-2 inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>Assigning...';
          
          fetch("/api/shopper/assignOrder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId, orderType }),
          })
          .then(res => res.json())
          .then(data => {
            if (data.error === "no_wallet") {
              reduceToastDuplicates("no-wallet", <Message type="warning">Wallet required</Message>);
              btn.disabled = false;
              btn.innerHTML = "Accept Batch";
              return;
            }
            toaster.push(<Message type="success">Order assigned!</Message>, { placement: "topEnd" });
            map.removeLayer(marker);
            setPendingOrders(prev => prev.filter(o => o.id !== orderId));
          })
          .catch(() => {
            btn.disabled = false;
            btn.innerHTML = "Accept Batch";
          });
        });
      }
    });
  }, [reduceToastDuplicates]);

  // Map markers rendering
  const initMapSequence = useCallback(async (map: L.Map) => {
    if (!map || !map.getContainer()) return;
    
    // Always clear existing markers before re-rendering to avoid duplicates
    clearOrderMarkers();

    try {
      const [shopsRes, restRes, pendRes] = await Promise.all([
        fetch("/api/shopper/shops"),
        fetch("/api/queries/restaurants"),
        isOnline ? fetch("/api/shopper/pendingOrders") : Promise.resolve({ json: () => [] } as any)
      ]);

      const shopsData = await shopsRes.json();
      const restaurantsData = await restRes.json();
      const pendingData = await pendRes.json();

      setShops(shopsData);
      setRestaurants(restaurantsData.restaurants || []);
      
      if (isOnline) {
        setPendingOrders(pendingData);
      }

      // Render shops
      shopsData.forEach((shop: Shop) => {
        const lat = parseFloat(shop.latitude);
        const lng = parseFloat(shop.longitude);
        if (isNaN(lat) || isNaN(lng)) return;
        
        const shopIconHtml = `
          <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
            ${MapUtils.createShopMarkerIcon(shop.is_active, theme)}
            <div style="font-size: 11px; font-weight: 800; color: ${shop.is_active ? (theme === 'dark' ? '#fff' : '#1f2937') : '#9ca3af'}; white-space: nowrap; text-shadow: ${theme === 'dark' ? '0 0 4px rgba(0,0,0,0.8)' : '0 0 4px rgba(255,255,255,0.8)'};">
              ${shop.name}
            </div>
          </div>
        `;

        const marker = L.marker([lat, lng], {
          icon: L.divIcon({
            html: shopIconHtml,
            className: "",
            iconSize: [40, 56],
            iconAnchor: [20, 32],
            popupAnchor: [0, -32],
          }),
          zIndexOffset: 500
        });
        
        if (MapUtils.safeAddMarker(marker, map, shop.name)) {
          marker.bindPopup(`<strong>${shop.name}</strong>${shop.is_active ? "" : " (Disabled)"}`);
          orderMarkersRef.current.push(marker); // Reusing orderMarkersRef for all markers to simplify clearing
        }
      });

      // Render restaurants
      const actualRestaurants = restaurantsData.restaurants || [];
      actualRestaurants.forEach((rest: Restaurant) => {
        const lat = parseFloat(rest.lat || "");
        const lng = parseFloat(rest.long || "");
        if (isNaN(lat) || isNaN(lng)) return;

        const restIconHtml = `
          <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
            ${MapUtils.createRestaurantMarkerIcon(theme)}
            <div style="font-size: 11px; font-weight: 800; color: ${theme === 'dark' ? '#fff' : '#1f2937'}; white-space: nowrap; text-shadow: ${theme === 'dark' ? '0 0 4px rgba(0,0,0,0.8)' : '0 0 4px rgba(255,255,255,0.8)'};">
              ${rest.name}
            </div>
          </div>
        `;

        const marker = L.marker([lat, lng], {
          icon: L.divIcon({
            html: restIconHtml,
            className: "",
            iconSize: [40, 56],
            iconAnchor: [20, 32],
            popupAnchor: [0, -32],
          }),
          zIndexOffset: 400
        });

        if (MapUtils.safeAddMarker(marker, map, rest.name)) {
          marker.bindPopup(`<strong>${rest.name}</strong>`);
          orderMarkersRef.current.push(marker);
        }
      });

      // If offline, stop here
      if (!isOnline) return;

      // Render pending orders with grouping
      const grouped = new Map<string, PendingOrder[]>();
      pendingData.forEach((o: PendingOrder) => {
        const key = `${o.shopLat.toFixed(5)},${o.shopLng.toFixed(5)}`;
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key)?.push(o);
      });

      grouped.forEach((orders, key) => {
        const [lat, lng] = key.split(",").map(Number);
        orders.forEach((order, idx) => {
          const offset = MapUtils.calculateMarkerOffset(idx, orders.length);
          const marker = L.marker([lat + offset.lat, lng + offset.lng], {
            icon: L.divIcon({ html: `<div style="background: #10b981; border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; color: white; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); font-weight: bold;">${MapUtils.formatEarningsDisplay(formatCurrencySync(order.earnings))}</div>`, className: "" }),
            zIndexOffset: 1000 + idx
          });
          
          if (MapUtils.safeAddMarker(marker, map, `pending-${order.id}`)) {
            marker.bindPopup(MapPopups.createPopupHTML(order, theme, true));
            attachAcceptHandler(marker, order.id, map, "regular");
            orderMarkersRef.current.push(marker);
          }
        });
      });

      // Render available orders
      allAvailableOrders.forEach((order, idx) => {
        if (!order.shopLatitude || !order.shopLongitude) return;
        const marker = L.marker([order.shopLatitude, order.shopLongitude], {
          icon: L.divIcon({ html: `<div style="background: #3b82f6; border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; color: white; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); font-weight: bold;">${MapUtils.formatEarningsDisplay(order.estimatedEarnings || "0")}</div>`, className: "" }),
          zIndexOffset: 1000
        });
        
        if (MapUtils.safeAddMarker(marker, map, `available-${order.id}`)) {
          marker.bindPopup(MapPopups.createPopupHTML(order, theme, false));
          attachAcceptHandler(marker, order.id, map, order.orderType || "regular");
          orderMarkersRef.current.push(marker);
        }
      });

    } catch (e) { console.error("Error in initMapSequence:", e); }
  }, [isOnline, theme, allAvailableOrders, clearOrderMarkers, attachAcceptHandler]);

  // Busy Areas Logic
  const renderBusyAreas = useCallback((map: L.Map) => {
    if (!showBusyAreas || !isOnline) return;
    clearBusyAreas();
    const allOrders = [...pendingOrders, ...allAvailableOrders];
    if (allOrders.length === 0) return;

    allOrders.forEach(order => {
      const lat = (order as any).shopLat || (order as any).shopLatitude;
      const lng = (order as any).shopLng || (order as any).shopLongitude;
      if (!lat || !lng) return;
      const circle = L.circle([lat, lng], { radius: 1000, color: theme === 'dark' ? '#ef4444' : '#dc2626', fillOpacity: 0.2 }).addTo(map);
      busyAreaCirclesRef.current.push(circle);
    });
  }, [showBusyAreas, isOnline, pendingOrders, allAvailableOrders, theme]);

  // Effects
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    
    // Check if the container already has a map instance
    const container = mapRef.current;
    
    // IMPORTANT: If we're already initializing or there's an instance, 
    // we should let the cleanup function handle it or avoid double-init.
    if ((container as any)._leaflet_id && mapInstanceRef.current) {
      // If theme changed, we might just want to update the tile layer 
      // instead of re-creating the whole map to avoid race conditions.
      const currentMap = mapInstanceRef.current;
      currentMap.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) {
          currentMap.removeLayer(layer);
        }
      });
      L.tileLayer(theme === "dark" ? MAP_STYLES.dark : MAP_STYLES.light).addTo(currentMap);
      return;
    }

    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (e) {
        console.warn("Error removing existing map instance:", e);
      }
      mapInstanceRef.current = null;
    }

    const map = L.map(container, { 
      center: DEFAULT_MAP_CENTER, 
      zoom: DEFAULT_MAP_ZOOM, 
      attributionControl: false,
      zoomAnimation: false // Disabling zoom animation during init helps prevent _leaflet_pos errors
    });
    
    mapInstanceRef.current = map;
    setMapInstance(map);
    L.tileLayer(theme === "dark" ? MAP_STYLES.dark : MAP_STYLES.light).addTo(map);
    
    const cookies = MapUtils.getCookies();
    if (cookies["user_latitude"]) {
      const lat = parseFloat(cookies["user_latitude"]), lng = parseFloat(cookies["user_longitude"]);
      const marker = L.marker([lat, lng], { icon: L.divIcon({ html: MapUtils.createUserMarkerIcon(), className: "" }) });
      if (MapUtils.safeAddMarker(marker, map, "user-marker")) {
        userMarkerRef.current = marker;
        map.setView([lat, lng], getFocusZoom(), { animate: false }); // Use responsive zoom
      }
    }

    initMapSequence(map);
    
    return () => { 
      if (mapInstanceRef.current) {
        try {
          // Check if map is still in the DOM before removing
          if (container && (container as any)._leaflet_id) {
            mapInstanceRef.current.remove();
          }
        } catch (e) {
          console.warn("Error during map cleanup:", e);
        }
        mapInstanceRef.current = null;
        setMapInstance(null);
      }
    };
  }, [mapLoaded, theme, isInitializing, initMapSequence]);

  useEffect(() => { if (mapInstance && isOnline) initMapSequence(mapInstance); }, [allAvailableOrders, isOnline, mapInstance]);
  
  // Real-time updates for batches when shopper is active
  useEffect(() => {
    if (!mapInstance || !isOnline) return;
    
    // Poll for new batches (pending orders, shops, etc.) every 30 seconds
    const interval = setInterval(() => {
      initMapSequence(mapInstance);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [mapInstance, isOnline, initMapSequence]);

  useEffect(() => { if (mapInstance) renderBusyAreas(mapInstance); }, [showBusyAreas, isOnline, mapInstance]);

  // Fetch earnings
  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await fetch("/api/shopper/todayCompletedEarnings");
        const data = await res.json();
        if (data.success) {
          setDailyEarnings(data.data.totalEarnings);
          setCompletedOrdersCount(data.data.orderCount);
        }
      } catch (e) {} finally { setLoadingEarnings(false); }
    };
    fetchEarnings();
    const interval = setInterval(fetchEarnings, 300000);
    return () => clearInterval(interval);
  }, []);

  if (isInitializing) {
    return (
      <div className="relative w-full md:rounded-lg">
        <div ref={mapRef} className={`h-[calc(100vh-3.5rem)] md:h-[600px] ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"}`} />
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50"><Loader size="lg" content="Initializing..." /></div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full md:rounded-lg">
      {!isExpanded && (
        <EarningsBadge 
          dailyEarnings={dailyEarnings} 
          completedOrdersCount={completedOrdersCount} 
          loadingEarnings={loadingEarnings} 
          theme={theme} 
        />
      )}

      <div className="relative h-full w-full">
        <div
          ref={mapRef}
          className={`h-full w-full overflow-hidden rounded-none md:h-[600px] md:rounded-lg ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"}`}
          style={{ position: "relative", zIndex: 1 }}
        />
        {!mapLoaded && (
          <div className={`absolute inset-0 z-10 flex items-center justify-center ${theme === "dark" ? "bg-gray-900/90" : "bg-gray-100/90"}`}>
            <Loader size="lg" content="Loading map..." />
          </div>
        )}
      </div>

      {mapLoaded && (
        <>
          <GoLiveButton isOnline={isOnline} theme={theme} handleGoLive={handleGoLive} />
          {isOnline && <BusyAreasToggle showBusyAreas={showBusyAreas} setShowBusyAreas={setShowBusyAreas} theme={theme} />}
          {isOnline && (
            <TrackingModeIndicator 
              isActivelyTracking={isActivelyTracking} 
              setIsActivelyTracking={setIsActivelyTracking} 
              theme={theme} 
              startLocationTracking={startLocationTracking} 
              watchIdRef={watchIdRef} 
              reduceToastDuplicates={reduceToastDuplicates} 
            />
          )}
          {isOnline && !isExpanded && (
            <RefreshLocationButton 
              refreshLocation={() => getCurrentPosition()} 
              isRefreshingLocation={isRefreshingLocation} 
              theme={theme} 
            />
          )}
        </>
      )}
    </div>
  );
}
