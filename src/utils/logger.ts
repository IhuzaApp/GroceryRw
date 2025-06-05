import { LogEntry, LogLevel } from './types';

class BaseLogger {
  protected formatMessage(message: string, component?: string, details?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      type: 'log' as LogLevel,
      message,
      component,
      details: details ? (
        typeof details === 'string' ? details : JSON.stringify(details)
      ) : undefined
    };
  }

  protected formatConsoleMessage(component: string | undefined, message: string, details?: any): string {
    const componentStr = component ? `[${component}]` : '';
    const detailsStr = details ? (
      typeof details === 'string' ? details : JSON.stringify(details, null, 2)
    ) : '';
    return `${componentStr} ${message} ${detailsStr}`.trim();
  }
}

class ClientLogger extends BaseLogger {
  private readonly STORAGE_KEY = 'app_logs';
  private readonly MAX_LOGS = 1000;

  private getStoredLogs(): LogEntry[] {
    try {
      const logs = localStorage.getItem(this.STORAGE_KEY);
      return logs ? JSON.parse(logs) : [];
    } catch {
      return [];
    }
  }

  private saveLogs(logs: LogEntry[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs.slice(-this.MAX_LOGS)));
    } catch (error) {
      console.error('Failed to save logs to localStorage:', error);
    }
  }

  private addLog(entry: LogEntry): void {
    const logs = this.getStoredLogs();
    logs.push(entry);
    this.saveLogs(logs);
  }

  log(message: string, component?: string, details?: any): void {
    const entry = { ...this.formatMessage(message, component, details), type: 'log' as LogLevel };
    this.addLog(entry);
    console.log(this.formatConsoleMessage(component || 'App', message, details));
  }

  error(message: string, component?: string, details?: any): void {
    const entry = { ...this.formatMessage(message, component, details), type: 'error' as LogLevel };
    this.addLog(entry);
    console.error(this.formatConsoleMessage(component || 'App', message, details));
  }

  warn(message: string, component?: string, details?: any): void {
    const entry = { ...this.formatMessage(message, component, details), type: 'warn' as LogLevel };
    this.addLog(entry);
    console.warn(this.formatConsoleMessage(component || 'App', message, details));
  }

  info(message: string, component?: string, details?: any): void {
    const entry = { ...this.formatMessage(message, component, details), type: 'info' as LogLevel };
    this.addLog(entry);
    console.info(this.formatConsoleMessage(component || 'App', message, details));
  }

  debug(message: string, component?: string, details?: any): void {
    const entry = { ...this.formatMessage(message, component, details), type: 'debug' as LogLevel };
    this.addLog(entry);
    console.debug(this.formatConsoleMessage(component || 'App', message, details));
  }

  async getLogs(): Promise<LogEntry[]> {
    return this.getStoredLogs();
  }

  async clearLogs(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

class ServerLogger extends BaseLogger {
  private readonly MAX_BUFFER_SIZE = 100;
  private logBuffer: LogEntry[] = [];

  constructor() {
    super();
  }

  private async flushBuffer(): Promise<void> {
    if (this.logBuffer.length === 0) return;

    try {
      await fetch('/api/logs/write', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs: this.logBuffer }),
      });
      this.logBuffer = [];
    } catch (error) {
      console.error('Failed to write logs:', error);
    }
  }

  private async addLog(entry: LogEntry): Promise<void> {
    this.logBuffer.push(entry);
    if (this.logBuffer.length >= this.MAX_BUFFER_SIZE) {
      await this.flushBuffer();
    }
  }

  async log(message: string, component?: string, details?: any): Promise<void> {
    const entry = { ...this.formatMessage(message, component, details), type: 'log' as LogLevel };
    await this.addLog(entry);
    console.log(this.formatConsoleMessage(component || 'Server', message, details));
  }

  async error(message: string, component?: string, details?: any): Promise<void> {
    const entry = { ...this.formatMessage(message, component, details), type: 'error' as LogLevel };
    await this.addLog(entry);
    console.error(this.formatConsoleMessage(component || 'Server', message, details));
  }

  async warn(message: string, component?: string, details?: any): Promise<void> {
    const entry = { ...this.formatMessage(message, component, details), type: 'warn' as LogLevel };
    await this.addLog(entry);
    console.warn(this.formatConsoleMessage(component || 'Server', message, details));
  }

  async info(message: string, component?: string, details?: any): Promise<void> {
    const entry = { ...this.formatMessage(message, component, details), type: 'info' as LogLevel };
    await this.addLog(entry);
    console.info(this.formatConsoleMessage(component || 'Server', message, details));
  }

  async debug(message: string, component?: string, details?: any): Promise<void> {
    const entry = { ...this.formatMessage(message, component, details), type: 'debug' as LogLevel };
    await this.addLog(entry);
    console.debug(this.formatConsoleMessage(component || 'Server', message, details));
  }

  async getLogs(): Promise<LogEntry[]> {
    try {
      const response = await fetch('/api/logs/read');
      const data = await response.json();
      return (data.logs || []).map((log: LogEntry) => ({
        ...log,
        details: log.details ? (
          typeof log.details === 'string' ? log.details : JSON.stringify(log.details)
        ) : undefined
      }));
    } catch (error) {
      console.error('Failed to read logs:', error);
      return [];
    }
  }

  async clearLogs(): Promise<void> {
    try {
      await fetch('/api/logs/clear', { method: 'POST' });
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  }
}

// Create the appropriate logger based on environment
const logger = typeof window === 'undefined' ? new ServerLogger() : new ClientLogger();

export { logger }; 