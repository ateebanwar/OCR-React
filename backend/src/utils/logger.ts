import { config } from '../config/index.js';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function sanitize(message: string): string {
  // Strip potential API keys or tokens
  return message
    .replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED_API_KEY]')
    .replace(/(Bearer\s+)[A-Za-z0-9._-]+/gi, '$1[REDACTED_TOKEN]')
    .replace(/("key"\s*:\s*")[^"]+(")/gi, '$1[REDACTED]$2');
}

export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private shouldLog(level: LogLevel): boolean {
    const configuredLevel = config.LOG_LEVEL as LogLevel;
    return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[configuredLevel];
  }

  private format(level: LogLevel, message: string, meta?: unknown): string {
    const timestamp = new Date().toISOString();
    const safeMsg = sanitize(message);
    const metaStr = meta ? ` | meta: ${sanitize(JSON.stringify(meta))}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] [${this.context}] ${safeMsg}${metaStr}`;
  }

  public debug(message: string, meta?: unknown): void {
    if (this.shouldLog('debug')) {
      console.debug(this.format('debug', message, meta));
    }
  }

  public info(message: string, meta?: unknown): void {
    if (this.shouldLog('info')) {
      console.info(this.format('info', message, meta));
    }
  }

  public warn(message: string, meta?: unknown): void {
    if (this.shouldLog('warn')) {
      console.warn(this.format('warn', message, meta));
    }
  }

  public error(message: string, meta?: unknown): void {
    if (this.shouldLog('error')) {
      console.error(this.format('error', message, meta));
    }
  }
}

export const createLogger = (context: string) => new Logger(context);
