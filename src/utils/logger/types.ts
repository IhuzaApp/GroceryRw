export interface LogEntry {
  timestamp: string;
  type: 'log' | 'error' | 'warn' | 'info' | 'debug';
  message: string;
  component?: string;
  details?: any;
}

export interface Logger {
  log(message: string, component?: string, details?: any): void;
  error(message: string, component?: string, details?: any): void;
  warn(message: string, component?: string, details?: any): void;
  info(message: string, component?: string, details?: any): void;
  debug(message: string, component?: string, details?: any): void;
  getLogs(): Promise<LogEntry[]>;
  clearLogs(): Promise<void>;
} 