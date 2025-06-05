export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  type: LogLevel;
  component: string;
  message: string;
  details?: any;
}

export interface Logger {
  debug(message: string, component?: string, details?: any): void;
  info(message: string, component?: string, details?: any): void;
  warn(message: string, component?: string, details?: any): void;
  error(message: string, component?: string, details?: any): void;
  getLogs(): Promise<LogEntry[]>;
  clearLogs(): Promise<void>;
} 