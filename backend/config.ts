import morgan from "morgan";
import chalk from "chalk";
import { Debug, Errors } from "./types";
import { Express } from "express";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

export function configureConsoleOutput(app : Express, debugMode : boolean) {
  morgan.token('method', (req) => {
    const types : Record<string, string> = {
      'GET'    : chalk.green('GET'),
      'POST'   : chalk.blue('POST'),
      'PUT'    : chalk.yellow('PUT'),
      'DELETE' : chalk.red('DELETE'),
      'PATCH'  : chalk.magenta('PATCH'),
      'HEAD'   : chalk.cyan('HEAD'),
      'OPTIONS' : chalk.gray('OPTIONS'),
      'TRACE'  : chalk.white('TRACE'),
      'CONNECT' : chalk.whiteBright('CONNECT'),
    }
    return types[req.method!] || chalk.white(req.method);
  });

  morgan.token('status', (_req, res) => {
    const status = res.statusCode;
    if (status >= 200 && status < 300)
      return chalk.green(status);

    if (status >= 300 && status < 400)
      return chalk.cyan(status);

    if (status >= 400 && status < 500)
      return chalk.yellow(status);

    if (status >= 500)
      return chalk.red(status);

    return chalk.white(status);
  })

  app.use((req, res, next) => {
    res.on('finish', () => {
      const logMessage = `${ req.method } ${ req.originalUrl } ${ res.statusCode } ${ res.getHeader('X-Response-Time') || '' }`.trim();
      if (res.statusCode >= 500)
        logger.error(logMessage);
      else if (res.statusCode >= 400)
        logger.warn(logMessage);
      else
        logger.info(logMessage);
    });
    next();
  })

  if (debugMode)
    app.use(morgan(':method :url :status :response-time ms', {
      stream : {
        write : (message) => {
          Debug(message.trim());
        }
      }
    }));
  else
    app.use(morgan(':method :url :status :response-time ms', {
      stream : {
        write : (message) => {
          Errors(message.trim());
        }
      },
      skip   : (_req, res) => res.statusCode < 400
    }));
}

export const logger = winston.createLogger({
  levels     : {
    error : 0,
    warn : 1,
    info : 2,
    debug : 3,
  },
  format     : winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${ timestamp } ${ level }: ${ message }`;
    })
  ),
  transports : [
    new DailyRotateFile({
      filename    : 'logs/%DATE%.log',
      datePattern : 'YYYY-MM-DD',
      zippedArchive : true,
      maxSize     : '20m',
      maxFiles    : '14d'
    }),
  ],
});