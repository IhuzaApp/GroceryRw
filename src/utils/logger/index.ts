import { LogEntry, LogLevel, Logger } from './types';
import { hasuraClient } from '../../lib/hasuraClient';
import { gql } from 'graphql-request';

const INSERT_LOG = gql`
  mutation insertSystemLog($type: String!, $message: String!, $component: String!, $details: jsonb) {
    insert_System_Logs_one(object: {
      type: $type,
      message: $message,
      component: $component,
      details: $details,
      timestamp: "now()"
    }) {
      id
    }
  }
`;

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
      if (!hasuraClient) return;

      await hasuraClient.request(INSERT_LOG, {
        type: entry.type,
        message: entry.message,
        component: entry.component,
        details: entry.details || null
      });
    } catch (error) {
      console.error('Failed to save log to database:', error);
    }
  }

  private addLog(entry: LogEntry) {
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