import { logger } from './logger';

// Server-side logging wrapper
export const serverLogger = {
  log: (message: string, component?: string, details?: any) => {
    logger.log(message, component || 'Server', details);
  },
  error: (message: string, component?: string, details?: any) => {
    logger.error(message, component || 'Server', details);
  },
  warn: (message: string, component?: string, details?: any) => {
    logger.warn(message, component || 'Server', details);
  },
  info: (message: string, component?: string, details?: any) => {
    logger.info(message, component || 'Server', details);
  },
  debug: (message: string, component?: string, details?: any) => {
    logger.debug(message, component || 'Server', details);
  }
}; 