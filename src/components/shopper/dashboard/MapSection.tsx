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
}

export default function MapSection({ mapLoaded, availableOrders }: MapSectionProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    // Initialize Leaflet map
    const map = L.map(mapRef.current, {
      center: [-1.9706, 30.1044],
      zoom: 14,
      minZoom: 10,
      maxBounds: [[-2.8, 28.8], [-1.0, 31.5]],
      scrollWheelZoom: false,
    });

    // Muted, light-themed basemap (CartoDB Positron)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors, &copy; CARTO',
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
    L.marker([-1.9706, 30.1044], { icon: userIcon })
      .addTo(map)
      .bindPopup('Your Location');

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
        const jitter = 0.0002;
        data.forEach((order, i) => {
          const lat = order.latitude + jitter * i;
          const lng = order.longitude + jitter * i;
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
          // Popup with order details and action
          const popupContent = `
            <div style="font-size:14px;">
              <strong>Order:</strong> ${order.id}<br/>
              <strong>Shop:</strong> ${order.shopName}<br/>
              <button id="accept-batch-${order.id}" style="margin-top:6px;padding:4px 8px;background:#10b981;color:#fff;border:none;border-radius:4px;cursor:pointer;">
                Accept Batch
              </button>
            </div>
          `;
          marker.bindPopup(popupContent);
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
  }, [mapLoaded, availableOrders]);

  return (
    <div className="p-4 relative">
      <div
        ref={mapRef}
        className="h-[400px] md:h-[600px] rounded-lg overflow-hidden"
      />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <Loader size="lg" content="Loading map..." />
        </div>
      )}
    </div>
  );
} 