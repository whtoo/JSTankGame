/**
 * Logger - Centralized logging system with levels
 */

/** Log levels */
export const LogLevel = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    NONE: 4
} as const;

export type LogLevelValue = typeof LogLevel[keyof typeof LogLevel];

// Current log level (configurable)
let currentLevel: LogLevelValue = LogLevel.INFO;
let showTimestamp: boolean = true;
let showLevel: boolean = true;

/** Logger configuration */
export const LoggerConfig = {
    level: LogLevel.INFO,
    timestamps: true,
    levels: {
        [LogLevel.DEBUG]: 'DEBUG',
        [LogLevel.INFO]: 'INFO',
        [LogLevel.WARN]: 'WARN',
        [LogLevel.ERROR]: 'ERROR'
    }
};

/**
 * Set the current log level
 */
export function setLogLevel(level: LogLevelValue): void {
    if (level >= LogLevel.DEBUG && level <= LogLevel.NONE) {
        currentLevel = level;
    }
}

/**
 * Enable/disable timestamps
 */
export function setShowTimestamp(enabled: boolean): void {
    showTimestamp = enabled;
}

/**
 * Format a log message with optional timestamp and level
 */
function formatMessage(levelName: string, message: string): string {
    const parts: string[] = [];

    if (showTimestamp) {
        const now = new Date();
        const ms = now.getMilliseconds();
        const msStr = ms < 10 ? '00' + ms : ms < 100 ? '0' + ms : String(ms);
        const time = now.toLocaleTimeString('en-US', { hour12: false }) + '.' + msStr;
        parts.push('[' + time + ']');
    }

    if (showLevel) {
        parts.push('[' + levelName + ']');
    }

    parts.push(message);
    return parts.join(' ');
}

/**
 * Log a debug message
 */
export function debug(...args: unknown[]): void {
    if (currentLevel <= LogLevel.DEBUG) {
        console.debug(formatMessage('DEBUG', args.join(' ')), ...args.slice(1));
    }
}

/**
 * Log an info message
 */
export function info(...args: unknown[]): void {
    if (currentLevel <= LogLevel.INFO) {
        console.info(formatMessage('INFO', args.join(' ')), ...args.slice(1));
    }
}

/**
 * Log a warning message
 */
export function warn(...args: unknown[]): void {
    if (currentLevel <= LogLevel.WARN) {
        console.warn(formatMessage('WARN', args.join(' ')), ...args.slice(1));
    }
}

/**
 * Log an error message
 */
export function error(...args: unknown[]): void {
    if (currentLevel <= LogLevel.ERROR) {
        console.error(formatMessage('ERROR', args.join(' ')), ...args.slice(1));
    }
}

/** Logger interface */
export interface ILogger {
    debug: (...args: unknown[]) => void;
    info: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
}

/**
 * Create a namespaced logger
 */
export function createLogger(namespace: string): ILogger {
    const prefix = `[${namespace}]`;

    return {
        debug: (...args) => debug(prefix, ...args),
        info: (...args) => info(prefix, ...args),
        warn: (...args) => warn(prefix, ...args),
        error: (...args) => error(prefix, ...args)
    };
}

// Game-specific loggers
export const gameLogger = createLogger('Game');
export const renderLogger = createLogger('Render');
export const inputLogger = createLogger('Input');
export const systemLogger = createLogger('System');
