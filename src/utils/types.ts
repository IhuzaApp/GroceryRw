export type LogLevel = "log" | "error" | "warn" | "info" | "debug";

export interface LogEntry {
  timestamp: string;
  type: LogLevel;
  message: string;
  component?: string;
  details?: string;
}
