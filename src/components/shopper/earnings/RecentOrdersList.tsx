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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black tracking-tight">Order Logs</h3>
          <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest opacity-40">Historical Performance</p>
        </div>
        {!isLoading && orders.length > 0 && (
          <div className={`rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-widest ${isDark ? "bg-white/5 text-white/40" : "bg-black/5 text-black/40"}`}>
            Page {currentPage} of {totalPages}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader size="md" content="Syncing Orders..." />
        </div>
      ) : orders.length === 0 ? (
        <div className={`rounded-[2.5rem] border-2 border-dashed p-12 text-center ${isDark ? "border-white/5" : "border-black/5"}`}>
          <p className="text-sm font-bold opacity-30 uppercase tracking-widest">No transaction records</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedOrders.map((item, index) => {
            const serviceFee = item.serviceFee !== undefined ? item.serviceFee : item.amount * 0.6;
            const deliveryFee = item.deliveryFee !== undefined ? item.deliveryFee : item.amount * 0.4;

            return (
              <div
                key={item.id || index}
                className={`group relative overflow-hidden rounded-[2rem] p-5 transition-all duration-300 hover:scale-[1.01] ${
                  isDark ? "bg-white/5 border border-white/10 hover:bg-white/[0.08]" : "bg-white border border-black/5 shadow-sm hover:shadow-md"
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${isDark ? "bg-indigo-500/10 text-indigo-400" : "bg-indigo-100 text-indigo-600"}`}>
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-black tracking-tight">{item.store}</h4>
                        {item.orderNumber && (
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${isDark ? "bg-white/5 text-white/40" : "bg-black/5 text-black/40"}`}>
                            #{item.orderNumber}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest opacity-40">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {item.date}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest opacity-40">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          {item.items} Items
                        </div>
                        {item.minutesTaken && (
                          <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {item.minutesTaken}m Execution
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-black/5 pt-4 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Earned</p>
                      <p className={`text-lg font-black ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                        {formatCurrencySync(serviceFee + deliveryFee)}
                      </p>
                    </div>
                    <div className="flex gap-2 sm:mt-1">
                      <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase tracking-tight ${isDark ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
                        Del: {formatCurrencySync(deliveryFee)}
                      </span>
                      <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase tracking-tight ${isDark ? "bg-purple-500/10 text-purple-400" : "bg-purple-50 text-purple-600"}`}>
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
        <div className="mt-8 flex justify-center">
          <Pagination
            prev
            next
            size="md"
            total={(serverPagination ? totalOrders : orders.length) || 0}
            limit={pageSize}
            activePage={currentPage}
            maxButtons={5}
            onChangePage={handlePageChange}
            className="custom-glass-pagination"
          />
        </div>
      )}
    </div>
  );
};

export default RecentOrdersList;
