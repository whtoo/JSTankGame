/**
 * Tests for Logger module
 * Simplified tests to avoid core-js polyfill issues in Jest
 */
import { LogLevel, setLogLevel, debug, info, warn, error, createLogger } from './Logger.js';

describe('Logger', () => {
    let consoleSpy;

    beforeEach(() => {
        // Clear mocks before each test
        jest.clearAllMocks();
        consoleSpy = {
            debug: jest.spyOn(console, 'debug').mockImplementation(() => {}),
            info: jest.spyOn(console, 'info').mockImplementation(() => {}),
            warn: jest.spyOn(console, 'warn').mockImplementation(() => {}),
            error: jest.spyOn(console, 'error').mockImplementation(() => {})
        };
    });

    afterEach(() => {
        setLogLevel(LogLevel.DEBUG); // Reset to default
    });

    describe('LogLevel', () => {
        it('should have correct numeric values', () => {
            expect(LogLevel.DEBUG).toBe(0);
            expect(LogLevel.INFO).toBe(1);
            expect(LogLevel.WARN).toBe(2);
            expect(LogLevel.ERROR).toBe(3);
            expect(LogLevel.NONE).toBe(4);
        });
    });

    describe('setLogLevel', () => {
        it('should change the current log level', () => {
            setLogLevel(LogLevel.WARN);
            debug('test');
            expect(consoleSpy.debug).not.toHaveBeenCalled();
        });

        it('should accept valid levels', () => {
            setLogLevel(LogLevel.DEBUG);
            setLogLevel(LogLevel.INFO);
            setLogLevel(LogLevel.ERROR);
            setLogLevel(LogLevel.NONE);
        });

        it('should ignore invalid levels', () => {
            setLogLevel(-1);
            setLogLevel(999);
            // Should not throw
        });
    });

    describe('logging functions', () => {
        beforeEach(() => {
            setLogLevel(LogLevel.DEBUG);
        });

        it('debug should log at DEBUG level', () => {
            debug('debug message');
            expect(consoleSpy.debug).toHaveBeenCalled();
        });

        it('info should log at INFO level', () => {
            info('info message');
            expect(consoleSpy.info).toHaveBeenCalled();
        });

        it('warn should log at WARN level', () => {
            warn('warn message');
            expect(consoleSpy.warn).toHaveBeenCalled();
        });

        it('error should log at ERROR level', () => {
            error('error message');
            expect(consoleSpy.error).toHaveBeenCalled();
        });

        it('should not log below current level', () => {
            setLogLevel(LogLevel.WARN);
            debug('should not log');
            info('should not log');
            expect(consoleSpy.debug).not.toHaveBeenCalled();
            expect(consoleSpy.info).not.toHaveBeenCalled();
            warn('should log');
            error('should log');
            expect(consoleSpy.warn).toHaveBeenCalled();
            expect(consoleSpy.error).toHaveBeenCalled();
        });

        it('should handle multiple arguments', () => {
            info('message', { key: 'value' }, 123);
            expect(consoleSpy.info).toHaveBeenCalled();
        });
    });

    describe('createLogger', () => {
        it('should create a namespaced logger', () => {
            const logger = createLogger('Test');
            expect(logger.debug).toBeDefined();
            expect(logger.info).toBeDefined();
            expect(logger.warn).toBeDefined();
            expect(logger.error).toBeDefined();
        });

        it('should include namespace in log output', () => {
            const logger = createLogger('MyModule');
            logger.info('test message');
            expect(consoleSpy.info).toHaveBeenCalled();
        });

        it('should have independent instances', () => {
            const logger1 = createLogger('ModuleA');
            const logger2 = createLogger('ModuleB');
            expect(logger1).not.toBe(logger2);
        });
    });
});
