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

const LogsTable: React.FC<LogsTableProps> = ({
  initialLogs,
  initialTotal,
  user,
  onLogout,
}) => {
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
      case "error":
        return "text-rose-600 bg-rose-50 ring-rose-500/10";
      case "warn":
        return "text-amber-600 bg-amber-50 ring-amber-500/10";
      case "info":
        return "text-blue-600 bg-blue-50 ring-blue-500/10";
      default:
        return "text-emerald-600 bg-emerald-50 ring-emerald-500/10";
    }
  };

  const filteredLogs = logs.filter(
    (log) =>
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
              <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
              <span className="hidden text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 sm:block">
                Live Infrastructure Status
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-slate-900 sm:text-4xl">
              System Logs
            </h1>
          </div>

          {/* User profile — always visible */}
          {user && (
            <div className="flex items-center gap-2 rounded-xl border border-slate-200/50 bg-slate-100/50 px-2 py-1.5 sm:gap-4 sm:px-3">
              <div className="hidden text-right sm:block">
                <div className="text-[10px] font-black leading-none text-slate-900">
                  {user.username}
                </div>
                <div className="text-[8px] font-black uppercase tracking-widest text-purple-500">
                  {user.role}
                </div>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-[10px] font-black text-white shadow-lg shadow-purple-100">
                {user.username.slice(0, 2).toUpperCase()}
              </div>
              {onLogout && (
                <IconButton
                  icon={<ExitIcon />}
                  onClick={onLogout}
                  size="xs"
                  appearance="subtle"
                  className="text-slate-400 hover:bg-red-50 hover:text-red-500"
                />
              )}
            </div>
          )}
        </div>

        {/* Search + Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-100 bg-white/70 p-2 shadow-lg shadow-slate-100/50 backdrop-blur-md">
          <div className="relative min-w-0 flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search event stream..."
              className="w-full rounded-xl border-none bg-slate-100/50 py-2.5 pl-10 pr-4 text-sm font-bold text-slate-700 outline-none transition-all focus:ring-2 focus:ring-purple-500/20"
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
            onChange={(v) => setFilter(v as LogType)}
            cleanable={false}
            searchable={false}
            className="!rounded-xl !border-none !bg-slate-100/50 font-bold !text-slate-600"
            style={{ width: 140 }}
          />

          <div className="flex items-center gap-1.5">
            <IconButton
              icon={<ReloadIcon />}
              onClick={() => fetchLogs()}
              className="!rounded-xl !bg-purple-600 !text-white shadow-lg shadow-purple-100 transition-all hover:!bg-purple-700 active:scale-95"
            />
            <IconButton
              icon={<TrashIcon />}
              onClick={() => setShowClearConfirm(true)}
              className="!rounded-xl !bg-rose-50 !text-rose-500 transition-all hover:!bg-rose-100"
            />
          </div>
        </div>
      </div>

      {/* Floating Premium Table */}
      <div className="group relative">
        <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-purple-500/20 to-violet-500/20 opacity-25 blur transition duration-1000 group-hover:opacity-50"></div>

        <div className="relative overflow-hidden rounded-[1.5rem] border border-white bg-white/80 shadow-2xl shadow-slate-200/60 backdrop-blur-xl">
          {/* Mobile Card View (< md) */}
          <div className="divide-y divide-slate-50 md:hidden">
            {loading ? (
              <div className="flex flex-col items-center gap-3 py-16">
                <Loader size="lg" />
                <span className="animate-pulse text-sm font-bold text-slate-400">
                  Synchronizing Data...
                </span>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="py-16 text-center text-base font-black text-slate-300">
                No signals found
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-4 transition-colors hover:bg-slate-50/60"
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-base shadow-sm">
                    {getServiceIcon(log.component)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ring-1 ring-inset ${getStatusColor(
                          log.type
                        )}`}
                      >
                        {log.type}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="mb-1 line-clamp-2 text-xs font-bold leading-snug text-slate-700">
                      {log.message}
                    </p>
                    <span className="text-[9px] font-black uppercase tracking-tight text-slate-400">
                      {log.component}
                    </span>
                  </div>
                  <Link href={`/dev/error/${log.id}`}>
                    <button className="flex-shrink-0 rounded-lg bg-slate-900 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-widest text-white transition-colors hover:bg-purple-600">
                      →
                    </button>
                  </Link>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View (≥ md) */}
          <div className="hidden max-h-[70vh] overflow-y-auto scroll-smooth md:block">
            <table className="w-full border-separate border-spacing-0">
              <thead className="sticky top-0 z-20 bg-white/90 backdrop-blur-md">
                <tr>
                  <th className="border-b border-slate-100 px-8 py-5 text-left text-[11px] font-black uppercase tracking-widest text-slate-400">
                    Event Info
                  </th>
                  <th className="border-b border-slate-100 px-8 py-5 text-left text-[11px] font-black uppercase tracking-widest text-slate-400">
                    Source Service
                  </th>
                  <th className="border-b border-slate-100 px-8 py-5 text-left text-[11px] font-black uppercase tracking-widest text-slate-400">
                    Message
                  </th>
                  <th className="border-b border-slate-100 px-8 py-5 text-right text-[11px] font-black uppercase tracking-widest text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-32 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Loader size="lg" />
                        <span className="animate-pulse text-sm font-bold text-slate-400">
                          Synchronizing Data...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-32 text-center">
                      <div className="text-lg font-black text-slate-300">
                        No signals found in this range
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="group transition-all duration-300 hover:bg-slate-50/50"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-lg shadow-sm transition-transform group-hover:scale-110">
                            {getServiceIcon(log.component)}
                          </div>
                          <div>
                            <div className="mb-1 text-sm font-black leading-none text-slate-900">
                              {new Date(log.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })}
                            </div>
                            <div className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">
                              {new Date(log.timestamp).toLocaleDateString(
                                undefined,
                                { month: "short", day: "numeric" }
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-xs font-black tracking-tight text-slate-700">
                            {log.component}
                          </span>
                          <span
                            className={`w-fit rounded-full px-2 py-0.5 text-[9px] font-black uppercase ring-1 ring-inset ${getStatusColor(
                              log.type
                            )}`}
                          >
                            {log.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="max-w-md space-y-1">
                          <p className="line-clamp-1 text-sm font-bold leading-tight text-slate-600 transition-all duration-500 group-hover:line-clamp-none">
                            {log.message}
                          </p>
                          {log.details && (
                            <div className="truncate font-mono text-[10px] text-slate-400 opacity-0 transition-all duration-500 group-hover:opacity-100">
                              {typeof log.details === "string"
                                ? log.details.slice(0, 100)
                                : JSON.stringify(log.details).slice(0, 100)}
                              ...
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <Link href={`/dev/error/${log.id}`}>
                          <button className="inline-flex translate-x-4 items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white opacity-0 shadow-xl shadow-purple-100 transition-all duration-300 hover:bg-purple-600 group-hover:translate-x-0 group-hover:opacity-100">
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
          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 p-4 sm:flex-row sm:p-6">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {filteredLogs.length} of {total} Events
            </div>
            <Pagination
              prev
              next
              first
              last
              ellipsis
              boundaryLinks
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

      <Modal
        open={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        size="xs"
      >
        <Modal.Header>
          <Modal.Title className="font-black text-slate-900">
            Purge System History
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-sm font-bold text-slate-500">
          Warning: This action will permanently erase the event stream. This
          cannot be reversed.
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => setShowClearConfirm(false)}
            appearance="subtle"
            className="text-[10px] font-black uppercase"
          >
            Cancel
          </Button>
          <Button
            onClick={clearLogs}
            appearance="primary"
            color="red"
            className="text-[10px] font-black uppercase"
          >
            Confirm Purge
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default LogsTable;
