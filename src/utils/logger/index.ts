import { Logger, LogEntry } from './types';
import { clientLogger } from './clientLogger';

// Only import serverLogger on the server side
let serverLogger: Logger | null = null;
if (typeof window === 'undefined') {
  import('./serverLogger').then(module => {
    serverLogger = module.serverLogger;
  });
}

class SystemLogger implements Logger {
  private logger: Logger;

  constructor() {
    // Default to client logger, use server logger if available on server
    this.logger = typeof window === 'undefined' && serverLogger ? serverLogger : clientLogger;
  }

  log(message: string, component?: string, details?: any): void {
    this.logger.log(message, component, details);
  }

  error(message: string, component?: string, details?: any): void {
    this.logger.error(message, component, details);
  }

  warn(message: string, component?: string, details?: any): void {
    this.logger.warn(message, component, details);
  }

  info(message: string, component?: string, details?: any): void {
    this.logger.info(message, component, details);
  }

  debug(message: string, component?: string, details?: any): void {
    this.logger.debug(message, component, details);
  }

  async getLogs(): Promise<LogEntry[]> {
    return this.logger.getLogs();
  }

  async clearLogs(): Promise<void> {
    return this.logger.clearLogs();
  }
}

export const logger = new SystemLogger(); 