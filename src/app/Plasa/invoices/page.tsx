"use client";

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useTheme } from '../../../context/ThemeContext';
import InvoiceList from '../../../components/shopper/invoice/InvoiceList';
import InvoiceViewer from '../../../components/shopper/invoice/InvoiceViewer';
import ShopperLayout from '../../../components/shopper/ShopperLayout';

interface Order {
  id: string;
  createdAt: string;
  total: number;
  status: string;
  customerName: string;
  customerAddress: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
}

export default function InvoicesPage() {
  const { theme } = useTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/shopper/completedOrders');
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        const data = await response.json();
        setOrders(data.orders);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <ShopperLayout>
        <div className={`flex h-full items-center justify-center p-8 ${
          theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
        }`}>
          <div className="flex items-center space-x-2">
            <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
            <span>Loading invoices...</span>
          </div>
        </div>
      </ShopperLayout>
    );
  }

  if (error) {
    return (
      <ShopperLayout>
        <div className={`flex h-full items-center justify-center p-8 ${
          theme === 'dark' ? 'text-red-400' : 'text-red-600'
        }`}>
          <div className="text-center">
            <p className="mb-2">Error: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className={`rounded px-4 py-2 ${
                theme === 'dark'
                  ? 'bg-red-900/30 text-red-200 hover:bg-red-900/50'
                  : 'bg-red-50 text-red-600 hover:bg-red-100'
              }`}
            >
              Retry
            </button>
          </div>
        </div>
      </ShopperLayout>
    );
  }

  return (
    <ShopperLayout>
      <div className={`min-h-screen p-4 md:p-6 ${
        theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
      }`}>
        <div className="mx-auto max-w-7xl">
          <h1 className={`mb-6 text-2xl font-bold ${
            theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
          }`}>
            Invoices
          </h1>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className={`rounded-lg p-4 ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}>
              <h2 className={`mb-4 text-lg font-semibold ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>
                Order History
              </h2>
              <InvoiceList
                orders={orders}
                selectedOrderId={selectedOrder?.id}
                onSelectOrder={setSelectedOrder}
              />
            </div>

            <div className={`rounded-lg p-4 ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}>
              <h2 className={`mb-4 text-lg font-semibold ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>
                Invoice Preview
              </h2>
              <InvoiceViewer order={selectedOrder} />
            </div>
          </div>
        </div>
      </div>
    </ShopperLayout>
  );
} 