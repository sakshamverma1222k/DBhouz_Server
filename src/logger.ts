import moment from 'moment'
import * as path from 'path'
import * as winston from 'winston'

const localTimestamp = winston.format((info, opts) => {
    if (info instanceof Error) {
        console.log(info)
        return Object.assign({}, info, {
            stack: info.stack,
            message: info.message
        })
    }
    info.timestamp = moment().format('DD/MM/YYYY HH:mm:ss')
    return info
})

const logFormat = winston.format.printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`
})

/**
 * levels available : debug, info, warn, error
 */
let loggerFileTransportOptions: winston.transports.FileTransportOptions = {
    level: 'info',
    filename: path.normalize(`./logs/app.log`),
    handleExceptions: true,
    maxsize: 5000000,
    maxFiles: 10
}

let loggerOptions: winston.LoggerOptions | undefined = {
    level: 'info',
    format: winston.format.combine(
        winston.format.label({ label: 'APP' }),
        localTimestamp(),
        logFormat
    ),
    defaultMeta: { service: 'APP' },
    transports: [
        new winston.transports.File(loggerFileTransportOptions)
    ],
    exitOnError: false
}

let LOGGER
try {
    LOGGER = winston.createLogger(loggerOptions)
    // If we're not in production then log to the `console` with the format:
    // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
    if (process.env.NODE_ENV !== 'production') {
        LOGGER.add(new winston.transports.Console({
            format: winston.format.combine(
                winston.format.label({ label: 'APP' }),
                localTimestamp(),
                logFormat
            ),
        }));
    }
} catch (error) {
    console.error(`Error Initializing Logger`)
    console.error(error)
}

export let LOG = LOGGER