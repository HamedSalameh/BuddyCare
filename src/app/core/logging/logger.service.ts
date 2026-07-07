import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug:  0,
  info:   1,
  warn:   2,
  error:  3,
  silent: 4,
};

@Injectable({ providedIn: 'root' })
export class LoggerService {
  private readonly minLevel = LOG_LEVELS[environment.logging.level ?? 'warn'];

  debug(message: string, ...args: unknown[]): void {
    if (this.minLevel <= LOG_LEVELS['debug']) {
      console.debug(`[BuddyCare] ${message}`, ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.minLevel <= LOG_LEVELS['info']) {
      console.info(`[BuddyCare] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.minLevel <= LOG_LEVELS['warn']) {
      console.warn(`[BuddyCare] ${message}`, ...args);
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (this.minLevel <= LOG_LEVELS['error']) {
      console.error(`[BuddyCare] ${message}`, ...args);
    }
  }
}
