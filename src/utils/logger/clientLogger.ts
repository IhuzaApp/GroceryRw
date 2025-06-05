import { Logger, LogEntry } from './types';

class ClientLogger implements Logger {
  private static instance: ClientLogger;
  private readonly MAX_LOGS = 1000; // Maximum number of logs to keep in localStorage
  private readonly STORAGE_KEY = 'system_logs';

  private constructor() {
    // Initialize storage if needed
    if (typeof window !== 'undefined' && !localStorage.getItem(this.STORAGE_KEY)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
    }
  }

  public static getInstance(): ClientLogger {
    if (!ClientLogger.instance) {
      ClientLogger.instance = new ClientLogger();
    }
    return ClientLogger.instance;
  }

  private addLog(entry: LogEntry) {
    if (typeof window === 'undefined') return;

    try {
      const logs = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
      logs.push(entry);
      
      // Keep only the latest MAX_LOGS entries
      if (logs.length > this.MAX_LOGS) {
        logs.splice(0, logs.length - this.MAX_LOGS);
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to store log:', error);
    }
  }

  public async getLogs(): Promise<LogEntry[]> {
    if (typeof window === 'undefined') return [];
    
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    } catch (error) {
      console.error('Failed to retrieve logs:', error);
      return [];
    }
  }

  public async clearLogs(): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
  }

  private createLogEntry(type: LogEntry['type'], message: string, component?: string, details?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      type,
      message,
      component,
      details
    };
  }

  public log(message: string, component?: string, details?: any): void {
    const entry = this.createLogEntry('log', message, component, details);
    this.addLog(entry);
    console.log(`[${component || 'App'}] ${message}`, details || '');
  }

  public error(message: string, component?: string, details?: any): void {
    const entry = this.createLogEntry('error', message, component, details);
    this.addLog(entry);
    console.error(`[${component || 'App'}] ${message}`, details || '');
  }

  public warn(message: string, component?: string, details?: any): void {
    const entry = this.createLogEntry('warn', message, component, details);
    this.addLog(entry);
    console.warn(`[${component || 'App'}] ${message}`, details || '');
  }

  public info(message: string, component?: string, details?: any): void {
    const entry = this.createLogEntry('info', message, component, details);
    this.addLog(entry);
    console.info(`[${component || 'App'}] ${message}`, details || '');
  }

  public debug(message: string, component?: string, details?: any): void {
    const entry = this.createLogEntry('debug', message, component, details);
    this.addLog(entry);
    console.debug(`[${component || 'App'}] ${message}`, details || '');
  }
}

export const clientLogger = ClientLogger.getInstance(); 