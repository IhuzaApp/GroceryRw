import React, { useEffect, useState } from "react";
import {
  Loader,
  Button,
  SelectPicker,
  IconButton,
  Modal,
  Pagination,
} from "rsuite";
import SearchIcon from "@rsuite/icons/Search";
import Link from "next/link";
import ReloadIcon from "@rsuite/icons/Reload";
import TrashIcon from "@rsuite/icons/Trash";
import ExitIcon from "@rsuite/icons/Exit";

interface SystemLog {
  id: string;
  type: string;
  message: string;
  component: string;
  details: any;
  timestamp: string;
}

interface LogsResponse {
  logs: SystemLog[];
  total: number;
}

type LogType = "error" | "warn" | "info" | "debug" | null;

interface LogsTableProps {
  initialLogs: SystemLog[];
  initialTotal: number;
  user?: {
    username: string;
    role: string;
  };
  onLogout?: () => void;
}

const LogsTable: React.FC<LogsTableProps> = ({ initialLogs, initialTotal, user, onLogout }) => {
  const [logs, setLogs] = useState<SystemLog[]>(initialLogs);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<LogType>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(initialTotal);
  const limit = 50;

  const fetchLogs = async (newPage?: number) => {
    try {
      setLoading(true);
      const currentPage = newPage || page;
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });
      if (filter) queryParams.append("type", filter);

      const response = await fetch(`/api/logs/read?${queryParams.toString()}`);
      if (!response.ok) throw new Error("Fetch failed");
      const data = await response.json();
      setLogs(data.logs);
      setTotal(data.total);
      if (newPage) setPage(newPage);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchLogs(newPage);
  };

  const clearLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/logs/clear", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Clear failed");
      const data = await response.json();
      if (data.success) {
        setLogs([]);
        setShowClearConfirm(false);
      }
    } catch (error) {
      console.error("Error clearing logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [filter]);

  const getServiceIcon = (component: string) => {
    const comp = component.toLowerCase();
    if (comp.includes("momo")) return "💸";
    if (comp.includes("resend") || comp.includes("pindo")) return "✉️";
    if (comp.includes("assignment")) return "🤖";
    if (comp.includes("auth") || comp.includes("login")) return "🔑";
    if (comp.includes("pos")) return "🛒";
    if (comp.includes("checkout")) return "🛍️";
    return "⚙️";
  };

  const getStatusColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "error": return "text-rose-600 bg-rose-50 ring-rose-500/10";
      case "warn": return "text-amber-600 bg-amber-50 ring-amber-500/10";
      case "info": return "text-blue-600 bg-blue-50 ring-blue-500/10";
      default: return "text-emerald-600 bg-emerald-50 ring-emerald-500/10";
    }
  };

  const filteredLogs = logs.filter(log =>
    log.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.component?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full space-y-6">
      {/* Premium Header */}
      <div className="flex flex-col gap-4">
        {/* Title row */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hidden sm:block">Live Infrastructure Status</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tighter">System Logs</h1>
          </div>

          {/* User profile — always visible */}
          {user && (
            <div className="flex items-center gap-2 sm:gap-4 px-2 sm:px-3 py-1.5 bg-slate-100/50 rounded-xl border border-slate-200/50">
              <div className="text-right hidden sm:block">
                <div className="text-[10px] font-black text-slate-900 leading-none">{user.username}</div>
                <div className="text-[8px] text-purple-500 uppercase font-black tracking-widest">{user.role}</div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white text-[10px] font-black shadow-lg shadow-purple-100">
                {user.username.slice(0, 2).toUpperCase()}
              </div>
              {onLogout && (
                <IconButton
                  icon={<ExitIcon />}
                  onClick={onLogout}
                  size="xs"
                  appearance="subtle"
                  className="hover:bg-red-50 text-slate-400 hover:text-red-500"
                />
              )}
            </div>
          )}
        </div>

        {/* Search + Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2 bg-white/70 backdrop-blur-md p-2 rounded-2xl border border-slate-100 shadow-lg shadow-slate-100/50">
          <div className="relative flex-1 min-w-0">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search event stream..."
              className="bg-slate-100/50 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-slate-700 w-full focus:ring-2 focus:ring-purple-500/20 transition-all outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <SelectPicker
            data={[
              { label: "All Events", value: null },
              { label: "Errors", value: "error" },
              { label: "Warnings", value: "warn" },
              { label: "Information", value: "info" },
            ]}
            value={filter}
            onChange={setFilter}
            cleanable={false}
            searchable={false}
            className="!bg-slate-100/50 !rounded-xl !border-none font-bold !text-slate-600"
            style={{ width: 140 }}
          />

          <div className="flex items-center gap-1.5">
            <IconButton
              icon={<ReloadIcon />}
              onClick={() => fetchLogs()}
              className="!bg-purple-600 !text-white !rounded-xl shadow-lg shadow-purple-100 hover:!bg-purple-700 transition-all active:scale-95"
            />
            <IconButton
              icon={<TrashIcon />}
              onClick={() => setShowClearConfirm(true)}
              className="!bg-rose-50 !text-rose-500 !rounded-xl hover:!bg-rose-100 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Floating Premium Table */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>

        <div className="relative bg-white/80 backdrop-blur-xl rounded-[1.5rem] border border-white overflow-hidden shadow-2xl shadow-slate-200/60">

          {/* Mobile Card View (< md) */}
          <div className="md:hidden divide-y divide-slate-50">
            {loading ? (
              <div className="py-16 flex flex-col items-center gap-3">
                <Loader size="lg" />
                <span className="text-sm font-bold text-slate-400 animate-pulse">Synchronizing Data...</span>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="py-16 text-center text-slate-300 font-black text-base">No signals found</div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="p-4 flex items-start gap-3 hover:bg-slate-50/60 transition-colors">
                  <div className="w-9 h-9 flex-shrink-0 rounded-xl bg-slate-50 flex items-center justify-center text-base border border-slate-100 shadow-sm">
                    {getServiceIcon(log.component)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ring-1 ring-inset ${getStatusColor(log.type)}`}>
                        {log.type}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-700 leading-snug line-clamp-2 mb-1">{log.message}</p>
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-tight">{log.component}</span>
                  </div>
                  <Link href={`/dev/error/${log.id}`}>
                    <button className="flex-shrink-0 px-2.5 py-1.5 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-purple-600 transition-colors">
                      →
                    </button>
                  </Link>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View (≥ md) */}
          <div className="hidden md:block max-h-[70vh] overflow-y-auto scroll-smooth">
            <table className="w-full border-separate border-spacing-0">
              <thead className="sticky top-0 z-20 bg-white/90 backdrop-blur-md">
                <tr>
                  <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Event Info</th>
                  <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Source Service</th>
                  <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Message</th>
                  <th className="px-8 py-5 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-32 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Loader size="lg" />
                        <span className="text-sm font-bold text-slate-400 animate-pulse">Synchronizing Data...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-32 text-center">
                      <div className="text-slate-300 font-black text-lg">No signals found in this range</div>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-lg border border-slate-100 group-hover:scale-110 transition-transform shadow-sm">
                            {getServiceIcon(log.component)}
                          </div>
                          <div>
                            <div className="text-sm font-black text-slate-900 leading-none mb-1">
                              {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                              {new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-xs font-black text-slate-700 tracking-tight">{log.component}</span>
                          <span className={`w-fit px-2 py-0.5 rounded-full text-[9px] font-black uppercase ring-1 ring-inset ${getStatusColor(log.type)}`}>
                            {log.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="max-w-md space-y-1">
                          <p className="text-sm text-slate-600 font-bold leading-tight line-clamp-1 group-hover:line-clamp-none transition-all duration-500">
                            {log.message}
                          </p>
                          {log.details && (
                            <div className="text-[10px] font-mono text-slate-400 truncate opacity-0 group-hover:opacity-100 transition-all duration-500">
                              {typeof log.details === 'string' ? log.details.slice(0, 100) : JSON.stringify(log.details).slice(0, 100)}...
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <Link href={`/dev/error/${log.id}`}>
                          <button className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 hover:bg-purple-600 shadow-xl shadow-purple-100">
                            Inspect <span>→</span>
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3 justify-between">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {filteredLogs.length} of {total} Events
            </div>
            <Pagination
              prev next first last ellipsis boundaryLinks
              maxButtons={3}
              size="sm"
              layout={["pager"]}
              total={total}
              limit={limit}
              activePage={page}
              onChangePage={handlePageChange}
              disabled={loading}
              className="!m-0"
            />
          </div>
        </div>
      </div>

      <Modal open={showClearConfirm} onClose={() => setShowClearConfirm(false)} size="xs">
        <Modal.Header>
          <Modal.Title className="font-black text-slate-900">Purge System History</Modal.Title>
        </Modal.Header>
        <Modal.Body className="font-bold text-slate-500 text-sm">
          Warning: This action will permanently erase the event stream. This cannot be reversed.
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setShowClearConfirm(false)} appearance="subtle" className="font-black text-[10px] uppercase">Cancel</Button>
          <Button onClick={clearLogs} appearance="primary" color="red" className="font-black text-[10px] uppercase">Confirm Purge</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default LogsTable;
