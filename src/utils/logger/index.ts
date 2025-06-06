import { gql } from 'graphql-request';
import { hasuraClient } from '../../lib/hasuraClient';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  type: LogLevel;
  message: string;
  component: string;
  details?: string;
  timestamp: number;
}

const STORAGE_KEY = 'system_logs_buffer';

class LoggerImpl {
  private isProcessing = false;
  private maxRetries = 3;
  private retryDelay = 5000; // 5 seconds
  private flushInterval: NodeJS.Timeout | null = null;
  private memoryBuffer: LogEntry[] = []; // Fallback for server-side
  private isClient = typeof window !== 'undefined';

  constructor() {
    if (this.isClient) {
      // Only start interval in browser environment
      this.startFlushInterval();
      
      // Handle page unload
      window.addEventListener('beforeunload', () => {
        this.flushBuffer().catch(console.error);
      });
    }
  }

  private startFlushInterval() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flushInterval = setInterval(() => this.flushBuffer(), 120000); // 2 minutes
  }

  private getBuffer(): LogEntry[] {
    if (!this.isClient) {
      return this.memoryBuffer;
    }

    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading from session storage:', error);
      return [];
    }
  }

  private setBuffer(buffer: LogEntry[]) {
    if (!this.isClient) {
      this.memoryBuffer = buffer;
      return;
    }

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(buffer));
    } catch (error: any) {
      console.error('Error writing to session storage:', error);
      // If session storage is full, force a flush
      if (error?.name === 'QuotaExceededError') {
        void this.flushBuffer();
      }
    }
  }

  private createLogEntry(
    type: LogLevel,
    message: string,
    component: string,
    details?: any
  ): LogEntry {
    return {
      type,
      message,
      component,
      details: details ? JSON.stringify(details) : undefined,
      timestamp: Date.now()
    };
  }

  debug(message: string, component: string, details?: any) {
    const entry = this.createLogEntry('debug', message, component, details);
    this.addToBuffer(entry);
  }

  info(message: string, component: string, details?: any) {
    const entry = this.createLogEntry('info', message, component, details);
    this.addToBuffer(entry);
  }

  warn(message: string, component: string, details?: any) {
    const entry = this.createLogEntry('warn', message, component, details);
    this.addToBuffer(entry);
  }

  error(message: string, component: string, details?: any) {
    const entry = this.createLogEntry('error', message, component, details);
    this.addToBuffer(entry);
  }

  private addToBuffer(entry: LogEntry) {
    const buffer = this.getBuffer();
    buffer.push(entry);
    this.setBuffer(buffer);

    // If buffer gets too large, flush immediately
    if (buffer.length >= 50) {
      void this.flushBuffer();
    }
  }

  private async flushBuffer() {
    if (this.isProcessing || !hasuraClient) return;

    const buffer = this.getBuffer();
    if (buffer.length === 0) return;

    this.isProcessing = true;

    try {
      await this.sendLogs(buffer);
      // Clear buffer only after successful send
      this.setBuffer([]);
    } catch (error) {
      console.error('Error flushing logs:', error);
      await this.retryFlush();
    } finally {
      this.isProcessing = false;
    }
  }

  private async retryFlush(retryCount = 0) {
    if (retryCount >= this.maxRetries || !hasuraClient) {
      console.error('Max retries reached for log flushing');
      return;
    }

    await new Promise(resolve => setTimeout(resolve, this.retryDelay));
    
    try {
      await this.flushBuffer();
    } catch (error) {
      console.error(`Retry ${retryCount + 1} failed:`, error);
      await this.retryFlush(retryCount + 1);
    }
  }

  private async sendLogs(logs: LogEntry[]) {
    if (!hasuraClient) return;

    const mutation = gql`
      mutation InsertSystemLogs($logs: [System_Logs_insert_input!]!) {
        insert_System_Logs(objects: $logs) {
          affected_rows
        }
      }
    `;

    const objects = logs.map(log => ({
      type: log.type,
      message: log.message,
      component: log.component,
      details: log.details,
      time: new Date(log.timestamp).toISOString()
    }));

    await hasuraClient.request(mutation, { logs: objects });
  }

  // Cleanup method
  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
  }
}

// Create singleton instance
export const logger = new LoggerImpl();

// Export types for use in other files
export type { LogEntry, LogLevel }; 