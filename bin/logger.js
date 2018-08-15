'use strict';

const
    winston = require('winston'),
    fs = require('fs'),
    util = require('util');

(function () {
//logging setting
    const logDirectory = 'logs';
    if (!fs.existsSync(logDirectory)) {
        fs.mkdirSync(logDirectory);
    }

    const { createLogger, format } = winston;
    const { combine, timestamp, printf } = format;

    const myFormat = printf(info => {
        return `${info.timestamp} ${info.level}: ${info.message}`;
    });

    const logger = createLogger({
        format: combine(
            timestamp(),
            myFormat
        ),
        transports: [
            new winston.transports.Console({
                timestamp: timestamp
            }),
            new (require('winston-daily-rotate-file'))({
                filename: `${logDirectory}/nmns.log`,
                timestamp: timestamp,
            })
        ]
    });

    if(!global.nmns){
        global.nmns = {};
    }
    const formatArgs = function (args){
        return [util.format.apply(util.format, Array.prototype.slice.call(args))];
    }
    global.nmns.LOGGER = {
        log: function(){
            logger.info(formatArgs(arguments));
        },
        info: function(){
            logger.info(formatArgs(arguments));
        },
        warn: function(){
            logger.warn(formatArgs(arguments));
        },
        error: function(){
            logger.error(formatArgs(arguments));
        }
    };
})();