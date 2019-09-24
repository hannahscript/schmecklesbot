const winston = require('winston');

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL,
    format: winston.format.printf(
        ({level, message, context}) => `${level.toUpperCase()} <${context}>: ${message}`
    ),
    defaultMeta: {context: 'bot'},
    transports: [
        new winston.transports.Console()
    ]
});

module.exports = logger;