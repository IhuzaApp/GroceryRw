import { LogEntry, LogLevel, Logger } from './types';
import { insertSystemLog } from '../../../pages/api/queries/system-logs';

class LoggerImpl implements Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private createLogEntry(
    type: LogLevel,
    message: string,
    component?: string,
    details?: any
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      type,
      component: component || 'unknown',
      message,
      details: details !== undefined ? details : undefined
    };
  }

  private async saveToDatabase(entry: LogEntry) {
    try {
      await insertSystemLog(
        entry.type,
        entry.message,
        entry.component,
        entry.details
      );
    } catch (error) {
      // Avoid recursive logging here
      process.env.NODE_ENV === 'development' && 
        console.error('Failed to save log to database:', error);
    }
  }

  private addLog(entry: LogEntry) {
    // Add to memory cache
    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }
    // Save to database asynchronously
    this.saveToDatabase(entry);
  }

  debug(message: string, component?: string, details?: any) {
    const entry = this.createLogEntry('debug', message, component, details);
    this.addLog(entry);
  }

  info(message: string, component?: string, details?: any) {
    const entry = this.createLogEntry('info', message, component, details);
    this.addLog(entry);
  }

  warn(message: string, component?: string, details?: any) {
    const entry = this.createLogEntry('warn', message, component, details);
    this.addLog(entry);
  }

  error(message: string, component?: string, details?: any) {
    const entry = this.createLogEntry('error', message, component, details);
    this.addLog(entry);
  }

  async getLogs(): Promise<LogEntry[]> {
    return this.logs;
  }

  async clearLogs(): Promise<void> {
    this.logs = [];
  }
}

export const logger = new LoggerImpl(); 