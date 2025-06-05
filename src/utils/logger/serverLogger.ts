import { Logger, LogEntry } from './types';

class ServerLogger implements Logger {
  private static instance: ServerLogger;
  private logFile: string = '';
  private logBuffer: LogEntry[] = [];
  private readonly MAX_BUFFER_SIZE = 100;
  private fs: typeof import('fs') | null = null;
  private path: typeof import('path') | null = null;
  
  private constructor() {
    // Only initialize if we're on the server
    if (typeof window === 'undefined') {
      this.initializeAsync();
    }
  }

  private async initializeAsync() {
    try {
      // Dynamically import fs and path
      const [fsModule, pathModule] = await Promise.all([
        import('fs'),
        import('path')
      ]);
      
      this.fs = fsModule.default;
      this.path = pathModule.default;

      const logsDir = this.path.join(process.cwd(), 'logs');
      if (!this.fs.existsSync(logsDir)) {
        this.fs.mkdirSync(logsDir);
      }

      const today = new Date().toISOString().split('T')[0];
      this.logFile = this.path.join(logsDir, `server-${today}.log`);
    } catch (error) {
      console.error('Failed to initialize server logger:', error);
    }
  }

  public static getInstance(): ServerLogger {
    if (!ServerLogger.instance) {
      ServerLogger.instance = new ServerLogger();
    }
    return ServerLogger.instance;
  }

  private async writeToFile(entry: LogEntry) {
    if (typeof window !== 'undefined' || !this.fs) return;

    const logLine = `[${entry.timestamp}] ${entry.type.toUpperCase()} ${entry.component ? `[${entry.component}] ` : ''}${entry.message}${entry.details ? `\nDetails: ${JSON.stringify(entry.details, null, 2)}` : ''}\n`;
    
    try {
      await this.fs.promises.appendFile(this.logFile, logLine);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  private async flushBuffer() {
    if (typeof window !== 'undefined' || !this.fs) return;

    if (this.logBuffer.length > 0) {
      await Promise.all(this.logBuffer.map(entry => this.writeToFile(entry)));
      this.logBuffer = [];
    }
  }

  private addToBuffer(entry: LogEntry) {
    if (typeof window !== 'undefined') return;

    this.logBuffer.push(entry);
    if (this.logBuffer.length >= this.MAX_BUFFER_SIZE) {
      this.flushBuffer();
    }
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
    this.addToBuffer(entry);
    console.log(`[${component || 'Server'}] ${message}`, details || '');
  }

  public error(message: string, component?: string, details?: any): void {
    const entry = this.createLogEntry('error', message, component, details);
    this.addToBuffer(entry);
    console.error(`[${component || 'Server'}] ${message}`, details || '');
  }

  public warn(message: string, component?: string, details?: any): void {
    const entry = this.createLogEntry('warn', message, component, details);
    this.addToBuffer(entry);
    console.warn(`[${component || 'Server'}] ${message}`, details || '');
  }

  public info(message: string, component?: string, details?: any): void {
    const entry = this.createLogEntry('info', message, component, details);
    this.addToBuffer(entry);
    console.info(`[${component || 'Server'}] ${message}`, details || '');
  }

  public debug(message: string, component?: string, details?: any): void {
    const entry = this.createLogEntry('debug', message, component, details);
    this.addToBuffer(entry);
    console.debug(`[${component || 'Server'}] ${message}`, details || '');
  }

  public async getLogs(): Promise<LogEntry[]> {
    if (typeof window !== 'undefined' || !this.fs) return [];

    try {
      await this.flushBuffer();
      const content = await this.fs.promises.readFile(this.logFile, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim());
      const entries: LogEntry[] = [];

      for (const line of lines) {
        try {
          const match = line.match(/\[(.*?)\] (\w+) (?:\[(.*?)\] )?(.+?)(?:\nDetails: (.+))?$/);
          if (match) {
            entries.push({
              timestamp: match[1],
              type: match[2].toLowerCase() as LogEntry['type'],
              component: match[3],
              message: match[4],
              details: match[5] ? JSON.parse(match[5]) : undefined
            });
          }
        } catch (error) {
          console.error('Error parsing log line:', error);
        }
      }

      return entries;
    } catch (error) {
      console.error('Failed to read logs:', error);
      return [];
    }
  }

  public async clearOldLogs(): Promise<void> {
    if (typeof window !== 'undefined' || !this.fs || !this.path) return;

    const logsDir = this.path.join(process.cwd(), 'logs');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    try {
      const files = await this.fs.promises.readdir(logsDir);
      for (const file of files) {
        if (file.startsWith('server-') && file.includes(yesterdayStr)) {
          await this.fs.promises.unlink(this.path.join(logsDir, file));
        }
      }
    } catch (error) {
      console.error('Failed to clear old logs:', error);
    }
  }

  public async clearLogs(): Promise<void> {
    if (typeof window !== 'undefined' || !this.fs || !this.path) return;

    try {
      // Clear the current log file
      await this.fs.promises.writeFile(this.logFile, '');
      
      // Also clear old logs
      const logsDir = this.path.join(process.cwd(), 'logs');
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const files = await this.fs.promises.readdir(logsDir);
      for (const file of files) {
        if (file.startsWith('server-') && file.includes(yesterdayStr)) {
          await this.fs.promises.unlink(this.path.join(logsDir, file));
        }
      }
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  }
}

export const serverLogger = ServerLogger.getInstance(); 