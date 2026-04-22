import React, { useState } from "react";
import { Button, Loader, Pagination } from "rsuite";
import { useTheme } from "../../../context/ThemeContext";
import { formatCurrencySync } from "../../../utils/formatCurrency";

interface Order {
  id: string;
  orderNumber?: string;
  date: string;
  store: string;
  items: number;
  amount: number;
  serviceFee?: number;
  deliveryFee?: number;
  tip?: number;
  minutesTaken?: number;
}

interface RecentOrdersListProps {
  orders: Order[];
  isLoading?: boolean;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  totalOrders?: number;
  currentPage?: number;
  serverPagination?: boolean;
}

const RecentOrdersList: React.FC<RecentOrdersListProps> = ({
  orders,
  isLoading = false,
  pageSize = 5,
  onPageChange,
  totalOrders,
  externalCurrentPage,
  serverPagination = false,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [localCurrentPage, setLocalCurrentPage] = useState(1);
  const currentPage = externalCurrentPage || localCurrentPage;

  const handlePageChange = (page: number) => {
    if (serverPagination && onPageChange) {
      onPageChange(page);
    } else {
      setLocalCurrentPage(page);
    }
  };

  const totalPages = serverPagination
    ? Math.ceil((totalOrders || 0) / pageSize)
    : Math.ceil(orders.length / pageSize);

  const displayedOrders = serverPagination
    ? orders
    : orders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
            Order Log
          </h3>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-500/60">
            Historical Performance Archive
          </p>
        </div>
        {!isLoading && orders.length > 0 && (
          <div
            className={`rounded-2xl border px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] ${
              isDark ? "bg-white/5 border-white/10 text-white/40" : "bg-gray-50 border-gray-100 text-gray-500 shadow-sm"
            }`}
          >
            Entry {currentPage} of {totalPages}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-6">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent shadow-[0_0_15px_rgba(16,185,129,0.3)]"></div>
          <p className="text-xs font-black uppercase tracking-[0.2em] opacity-40 animate-pulse">Synchronizing Records...</p>
        </div>
      ) : orders.length === 0 ? (
        <div
          className={`rounded-[3rem] border-2 border-dashed p-20 text-center transition-colors ${
            isDark ? "border-white/5 bg-white/[0.01]" : "border-gray-100 bg-gray-50/50"
          }`}
        >
          <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] ${isDark ? "bg-white/5" : "bg-white shadow-xl"}`}>
            <svg className="h-10 w-10 text-gray-400 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-sm font-black uppercase tracking-[0.2em] opacity-20">
            No active transaction history
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedOrders.map((item, index) => {
            const serviceFee = item.serviceFee !== undefined ? item.serviceFee : item.amount * 0.6;
            const deliveryFee = item.deliveryFee !== undefined ? item.deliveryFee : item.amount * 0.4;
            const totalEarned = serviceFee + deliveryFee;

            return (
              <div
                key={item.id || index}
                className={`group relative overflow-hidden rounded-[2.5rem] p-6 transition-all duration-500 hover:shadow-2xl ${
                  isDark
                    ? "border border-white/5 bg-gray-900/40 backdrop-blur-2xl hover:bg-gray-800/60 shadow-xl"
                    : "border border-gray-100 bg-white shadow-xl shadow-gray-200/50 hover:border-emerald-200 hover:shadow-emerald-500/5"
                }`}
              >
                {/* Accent Glow */}
                <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-emerald-500/5 blur-[80px] group-hover:bg-emerald-500/10 transition-all duration-500" />
                
                <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-6">
                    <div
                      className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.5rem] shadow-inner transition-all duration-500 group-hover:rotate-6 ${
                        isDark
                          ? "bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 ring-1 ring-white/10"
                          : "bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600 ring-1 ring-emerald-100"
                      }`}
                    >
                      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>

                    <div className="min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-3">
                        <h4 className={`text-xl font-black tracking-tighter truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                          {item.store}
                        </h4>
                        {item.orderNumber && (
                          <span
                            className={`rounded-xl px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${
                              isDark ? "bg-white/5 text-white/40 ring-1 ring-white/5" : "bg-gray-100 text-gray-500 ring-1 ring-gray-200 shadow-sm"
                            }`}
                          >
                            #{item.orderNumber}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-2">
                        <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${isDark ? "text-white/20" : "text-gray-400"}`}>
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {item.date}
                        </div>
                        <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${isDark ? "text-white/20" : "text-gray-400"}`}>
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          {item.items} Items
                        </div>
                        {item.minutesTaken && (
                          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {item.minutesTaken}m Dispatch
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row items-center justify-between border-t border-white/5 pt-6 lg:flex-col lg:items-end lg:border-0 lg:pt-0">
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-500/60">
                        Net Earning
                      </p>
                      <p className="bg-gradient-to-br from-emerald-400 to-teal-500 bg-clip-text text-2xl font-black text-transparent tracking-tighter">
                        {formatCurrencySync(totalEarned)}
                      </p>
                    </div>
                    <div className="flex gap-2 lg:mt-2">
                      <span className={`rounded-xl px-2 py-1 text-[9px] font-black uppercase tracking-widest ${
                        isDark ? "bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20" : "bg-blue-50 text-blue-600 ring-1 ring-blue-100"
                      }`}>
                        Del: {formatCurrencySync(deliveryFee)}
                      </span>
                      <span className={`rounded-xl px-2 py-1 text-[9px] font-black uppercase tracking-widest ${
                        isDark ? "bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/20" : "bg-purple-50 text-purple-600 ring-1 ring-purple-100"
                      }`}>
                        Svc: {formatCurrencySync(serviceFee)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="mt-12 flex justify-center pb-8">
          <Pagination
            prev
            next
            size="md"
            total={(serverPagination ? totalOrders : orders.length) || 0}
            limit={pageSize}
            activePage={currentPage}
            maxButtons={5}
            onChangePage={handlePageChange}
            className="custom-premium-pagination"
          />
        </div>
      )}
    </div>
  );
};

export default RecentOrdersList;
