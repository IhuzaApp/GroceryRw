import React, { useEffect, useState } from "react";
import {
  Table,
  Loader,
  Button,
  SelectPicker,
  Panel,
  ButtonToolbar,
  IconButton,
  Modal,
  Pagination,
} from "rsuite";
import { useTheme } from "../../context/ThemeContext";
import { GetServerSideProps } from "next";
import ReloadIcon from "@rsuite/icons/Reload";
import TrashIcon from "@rsuite/icons/Trash";

const { Column, HeaderCell, Cell } = Table;

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
  page: number;
  limit: number;
  totalPages: number;
}

type LogType = "error" | "warn" | "info" | "debug" | null;

interface LogsTableProps {
  initialLogs: SystemLog[];
  initialTotal: number;
}

const LogsTable: React.FC<LogsTableProps> = ({ initialLogs, initialTotal }) => {
  const { theme } = useTheme();
  const [logs, setLogs] = useState<SystemLog[]>(initialLogs);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<LogType>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(initialTotal);
  const [totalPages, setTotalPages] = useState(Math.ceil(initialTotal / 100));
  const limit = 100;

  const fetchLogs = async (newPage?: number) => {
    try {
      setLoading(true);
      const currentPage = newPage || page;
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });

      if (filter) {
        queryParams.append("type", filter);
      }

      const response = await fetch(`/api/logs/read?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = (await response.json()) as LogsResponse;
      setLogs(data.logs);
      setTotal(data.total);
      setTotalPages(data.totalPages);

      if (newPage) {
        setPage(newPage);
      }
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
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
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
    fetchLogs(1); // Reset to first page when filter changes
  }, [filter]);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDetails = (details: any) => {
    if (!details) return "";
    try {
      return typeof details === "string"
        ? details
        : JSON.stringify(details, null, 2);
    } catch (e) {
      return String(details);
    }
  };

  const getBadgeClass = (type: string) => {
    switch (type.toLowerCase()) {
      case "error": return "log-badge log-badge-error";
      case "warn": return "log-badge log-badge-warn";
      case "info": return "log-badge log-badge-info";
      case "debug": return "log-badge log-badge-debug";
      default: return "log-badge";
    }
  };

  return (
    <>
      <Panel
        header={
          <div className="mb-4 flex items-center justify-between">
            <h2
              className="text-xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              System Logs
            </h2>
            <div className="flex items-center gap-4">
              <SelectPicker
                data={[
                  { label: "All", value: null },
                  { label: "Error", value: "error" },
                  { label: "Warning", value: "warn" },
                  { label: "Info", value: "info" },
                  { label: "Debug", value: "debug" },
                ]}
                value={filter}
                onChange={(value) => {
                  setFilter(value as LogType);
                }}
                cleanable={false}
                searchable={false}
                placeholder="Filter by type"
                style={{
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)",
                }}
              />
              <ButtonToolbar>
                <IconButton
                  icon={<ReloadIcon />}
                  onClick={() => fetchLogs()}
                  disabled={loading}
                  appearance="subtle"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    color: "var(--text-primary)",
                  }}
                >
                  Refresh
                </IconButton>
                <IconButton
                  icon={<TrashIcon />}
                  onClick={() => setShowClearConfirm(true)}
                  disabled={loading || logs.length === 0}
                  appearance="subtle"
                  color="red"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                  }}
                >
                  Clear
                </IconButton>
              </ButtonToolbar>
            </div>
          </div>
        }
      >
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader size="md" content="Loading logs..." />
          </div>
        ) : (
          <Table
            height={600}
            data={logs}
            loading={loading}
            className="logs-table"
          >
            <Column width={150} align="left" fixed>
              <HeaderCell className="header-cell">Timestamp</HeaderCell>
              <Cell className="table-cell">
                {(rowData: SystemLog) => formatTimestamp(rowData.timestamp)}
              </Cell>
            </Column>

            <Column width={100}>
              <HeaderCell className="header-cell">Type</HeaderCell>
              <Cell className="table-cell">
                {(rowData: SystemLog) => (
                  <span className={getBadgeClass(rowData.type)}>
                    {rowData.type}
                  </span>
                )}
              </Cell>
            </Column>

            <Column width={150}>
              <HeaderCell className="header-cell">Component</HeaderCell>
              <Cell className="table-cell">
                {(rowData: SystemLog) => rowData.component}
              </Cell>
            </Column>

            <Column width={300}>
              <HeaderCell className="header-cell">Message</HeaderCell>
              <Cell className="table-cell">
                {(rowData: SystemLog) => rowData.message}
              </Cell>
            </Column>

            <Column flexGrow={1}>
              <HeaderCell className="header-cell">Details</HeaderCell>
              <Cell className="table-cell">
                {(rowData: SystemLog) => (
                  <pre className="details-pre">
                    {formatDetails(rowData.details)}
                  </pre>
                )}
              </Cell>
            </Column>
          </Table>
        )}

        <div className="mt-4 flex justify-center">
          <Pagination
            prev
            next
            first
            last
            ellipsis
            boundaryLinks
            maxButtons={5}
            size="md"
            layout={["total", "-", "limit", "|", "pager", "skip"]}
            total={total}
            limit={limit}
            activePage={page}
            onChangePage={handlePageChange}
            disabled={loading}
          />
        </div>
      </Panel>

      <Modal
        open={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        size="xs"
      >
        <Modal.Header>
          <Modal.Title>Clear All Logs</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to clear all logs?</Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => setShowClearConfirm(false)}
            appearance="subtle"
          >
            Cancel
          </Button>
          <Button onClick={clearLogs} appearance="primary" color="red">
            Clear
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default LogsTable;

// Add this to your page component that uses LogsTable
export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/logs/read`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    return {
      props: {
        initialLogs: data.logs,
        initialTotal: data.total,
      },
    };
  } catch (error) {
    console.error("Error fetching initial logs:", error);
    return {
      props: {
        initialLogs: [],
        initialTotal: 0,
      },
    };
  }
};
