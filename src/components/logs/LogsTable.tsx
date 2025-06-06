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
} from "rsuite";
import { useTheme } from "../../context/ThemeContext";
import { GetServerSideProps } from "next";
import ReloadIcon from "@rsuite/icons/Reload";
import TrashIcon from "@rsuite/icons/Trash";
import "./LogsTable.css"; // We'll create this file next

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

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/logs/read${filter ? `?type=${filter}` : ""}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = (await response.json()) as LogsResponse;
      setLogs(data.logs);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
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
    // Set up polling to refresh logs every 30 seconds
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, [filter]); // Added filter as dependency

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

  const getTypeColor = (type: string) => {
    if (theme === "dark") {
      switch (type.toLowerCase()) {
        case "error":
          return "#ff4d4f";
        case "warn":
          return "#faad14";
        case "info":
          return "#1890ff";
        case "debug":
          return "#52c41a";
        default:
          return "#d9d9d9";
      }
    } else {
      switch (type.toLowerCase()) {
        case "error":
          return "#cf1322";
        case "warn":
          return "#d48806";
        case "info":
          return "#096dd9";
        case "debug":
          return "#389e0d";
        default:
          return "#8c8c8c";
      }
    }
  };

  return (
    <>
      <Panel
        style={{
          backgroundColor: "var(--bg-secondary)",
          color: "var(--text-primary)",
        }}
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
                  onClick={fetchLogs}
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
            rowHeight={60}
            className={`logs-table ${theme === "dark" ? "dark" : "light"}`}
            style={{
              backgroundColor: "var(--bg-primary)",
            }}
            rowClassName={() => (theme === "dark" ? "dark-row" : "light-row")}
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
                  <span style={{ color: getTypeColor(rowData.type) }}>
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
                  <pre className="whitespace-pre-wrap text-sm">
                    {formatDetails(rowData.details)}
                  </pre>
                )}
              </Cell>
            </Column>
          </Table>
        )}
      </Panel>

      <Modal
        open={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        style={{
          backgroundColor: "var(--bg-primary)",
          color: "var(--text-primary)",
        }}
      >
        <Modal.Header>
          <Modal.Title>Clear All Logs</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to clear all system logs? This action cannot be
          undone.
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => setShowClearConfirm(false)}
            appearance="subtle"
            style={{
              backgroundColor: "var(--bg-secondary)",
              color: "var(--text-primary)",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={clearLogs}
            appearance="primary"
            color="red"
            style={{
              marginLeft: "8px",
            }}
          >
            Clear All
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
