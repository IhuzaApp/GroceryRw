import { LogEntry, LogLevel } from './types';

class BaseLogger {
  protected formatMessage(message: string, component?: string, details?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      type: 'log' as LogLevel,
      message,
      component,
      details: details ? JSON.stringify(details) : undefined
    };
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
    console.log(`[${component || 'App'}]`, message, details || '');
  }

  error(message: string, component?: string, details?: any): void {
    const entry = { ...this.formatMessage(message, component, details), type: 'error' as LogLevel };
    this.addLog(entry);
    console.error(`[${component || 'App'}]`, message, details || '');
  }

  warn(message: string, component?: string, details?: any): void {
    const entry = { ...this.formatMessage(message, component, details), type: 'warn' as LogLevel };
    this.addLog(entry);
    console.warn(`[${component || 'App'}]`, message, details || '');
  }

  info(message: string, component?: string, details?: any): void {
    const entry = { ...this.formatMessage(message, component, details), type: 'info' as LogLevel };
    this.addLog(entry);
    console.info(`[${component || 'App'}]`, message, details || '');
  }

  debug(message: string, component?: string, details?: any): void {
    const entry = { ...this.formatMessage(message, component, details), type: 'debug' as LogLevel };
    this.addLog(entry);
    console.debug(`[${component || 'App'}]`, message, details || '');
  }

  async getLogs(): Promise<LogEntry[]> {
    return this.getStoredLogs();
  }

  async clearLogs(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

class ServerLogger extends BaseLogger {
  private readonly fs = require('fs');
  private readonly path = require('path');
  private readonly LOG_DIR = './logs';
  private readonly MAX_BUFFER_SIZE = 100;
  private logBuffer: LogEntry[] = [];

  constructor() {
    super();
    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    if (!this.fs.existsSync(this.LOG_DIR)) {
      this.fs.mkdirSync(this.LOG_DIR, { recursive: true });
    }
  }

  private getLogFilePath(): string {
    const date = new Date().toISOString().split('T')[0];
    return this.path.join(this.LOG_DIR, `${date}.log`);
  }

  private async flushBuffer(): Promise<void> {
    if (this.logBuffer.length === 0) return;

    const logFile = this.getLogFilePath();
    const logString = this.logBuffer.map(entry => JSON.stringify(entry)).join('\n') + '\n';

    try {
      await this.fs.promises.appendFile(logFile, logString);
      this.logBuffer = [];
    } catch (error) {
      console.error('Failed to write to log file:', error);
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
    console.log(`[${component || 'Server'}]`, message, details || '');
  }

  async error(message: string, component?: string, details?: any): Promise<void> {
    const entry = { ...this.formatMessage(message, component, details), type: 'error' as LogLevel };
    await this.addLog(entry);
    console.error(`[${component || 'Server'}]`, message, details || '');
  }

  async warn(message: string, component?: string, details?: any): Promise<void> {
    const entry = { ...this.formatMessage(message, component, details), type: 'warn' as LogLevel };
    await this.addLog(entry);
    console.warn(`[${component || 'Server'}]`, message, details || '');
  }

  async info(message: string, component?: string, details?: any): Promise<void> {
    const entry = { ...this.formatMessage(message, component, details), type: 'info' as LogLevel };
    await this.addLog(entry);
    console.info(`[${component || 'Server'}]`, message, details || '');
  }

  async debug(message: string, component?: string, details?: any): Promise<void> {
    const entry = { ...this.formatMessage(message, component, details), type: 'debug' as LogLevel };
    await this.addLog(entry);
    console.debug(`[${component || 'Server'}]`, message, details || '');
  }

  async getLogs(): Promise<LogEntry[]> {
    await this.flushBuffer();
    const logFile = this.getLogFilePath();
    
    try {
      const content = await this.fs.promises.readFile(logFile, 'utf-8');
      return content.split('\n')
        .filter((line: string) => line.trim())
        .map((line: string) => JSON.parse(line));
    } catch (error) {
      console.error('Failed to read log file:', error);
      return [];
    }
  }

  async clearLogs(): Promise<void> {
    await this.flushBuffer();
    const logFile = this.getLogFilePath();
    
    try {
      await this.fs.promises.unlink(logFile);
    } catch (error) {
      console.error('Failed to delete log file:', error);
    }
  }
}

// Create the appropriate logger based on environment
const logger = typeof window === 'undefined' ? new ServerLogger() : new ClientLogger();

export { logger }; 