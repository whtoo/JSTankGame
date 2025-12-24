/**
 * Logger - Centralized logging system with levels
 */

// Log levels
export const LogLevel = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    NONE: 4
};

// Current log level (configurable)
let currentLevel = LogLevel.INFO;
let showTimestamp = true;
let showLevel = true;

// Logger configuration
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
 * @param {number} level - LogLevel value
 */
export function setLogLevel(level) {
    if (level >= LogLevel.DEBUG && level <= LogLevel.NONE) {
        currentLevel = level;
    }
}

/**
 * Enable/disable timestamps
 * @param {boolean} enabled
 */
export function setShowTimestamp(enabled) {
    showTimestamp = enabled;
}

/**
 * Format a log message with optional timestamp and level
 * @param {string} levelName - Level name string
 * @param {string} message - Message to format
 * @returns {string} - Formatted message
 */
function formatMessage(levelName, message) {
    const parts = [];

    if (showTimestamp) {
        const now = new Date();
        const ms = now.getMilliseconds();
        const msStr = ms < 10 ? '00' + ms : ms < 100 ? '0' + ms : String(ms);
        const time = now.toLocaleTimeString('en-US', { hour12: false }) +
            '.' + msStr;
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
 * @param {...any} args - Arguments to log
 */
export function debug(...args) {
    if (currentLevel <= LogLevel.DEBUG) {
        console.debug(formatMessage('DEBUG', args.join(' ')), ...args.slice(1));
    }
}

/**
 * Log an info message
 * @param {...any} args - Arguments to log
 */
export function info(...args) {
    if (currentLevel <= LogLevel.INFO) {
        console.info(formatMessage('INFO', args.join(' ')), ...args.slice(1));
    }
}

/**
 * Log a warning message
 * @param {...any} args - Arguments to log
 */
export function warn(...args) {
    if (currentLevel <= LogLevel.WARN) {
        console.warn(formatMessage('WARN', args.join(' ')), ...args.slice(1));
    }
}

/**
 * Log an error message
 * @param {...any} args - Arguments to log
 */
export function error(...args) {
    if (currentLevel <= LogLevel.ERROR) {
        console.error(formatMessage('ERROR', args.join(' ')), ...args.slice(1));
    }
}

/**
 * Create a namespaced logger
 * @param {string} namespace - Logger namespace (e.g., 'Game', 'Render')
 * @returns {object} - Logger with debug, info, warn, error methods
 */
export function createLogger(namespace) {
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
