import path from 'path';
import winston from 'winston';
import configManager from './configManager';

const logPath = path.join(path.resolve(__dirname, configManager.getConfig.NODE_ENV === 'development' ? '../../' : '.'), 'logs');
const logFormat = winston.format.printf(({ level, label, message, timestamp }) => {
    return `[${timestamp}] -- ${level} -- [${label}] : ${message}`;
});

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(winston.format.timestamp(), logFormat),
    transports: [new winston.transports.File({ filename: `${logPath}/combined.log`, level: 'debug' }), new winston.transports.File({ filename: `${logPath}/verbose.log`, level: 'verbose' }), new winston.transports.File({ filename: `${logPath}/info.log`, level: 'info' }), new winston.transports.File({ filename: `${logPath}/warn.log`, level: 'warn' }), new winston.transports.File({ filename: `${logPath}/error.log`, level: 'error' })],
});

if (configManager.getConfig.NODE_ENV === 'development') {
    logger.add(new winston.transports.Console({ format: winston.format.simple() }));
}

class LogManager {
    public debug(key: string, message: string): void {
        logger.debug(message, { label: key }, 'debug');
    }
    public verbose(key: string, message: string): void {
        logger.verbose(message, { label: key }, 'verbose');
    }
    public info(key: string, message: string): void {
        logger.info(message, { label: key }, 'info');
    }
    public warn(key: string, message: string): void {
        logger.warn(message, { label: key }, 'warn');
    }
    public error(key: string, message: string): void {
        logger.error(message, { label: key }, 'error');
    }
}

export default new LogManager();