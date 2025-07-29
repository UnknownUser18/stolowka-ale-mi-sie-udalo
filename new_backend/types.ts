import chalk from "chalk";
import 'dotenv/config';
import { logger } from "./config";

type LogType = 'info' | 'warning' | 'error' | 'debug';

function getTimestamp() : string {
  if (!showTimestamps) return '';
  const date = new Date();
  return chalk.dim(`(${ date.toLocaleTimeString(undefined, {
    day : '2-digit',
    month : '2-digit',
    year : '2-digit',
    hour : '2-digit',
    minute : '2-digit',
    second : '2-digit',
  }).replaceAll('.', '-').replace(',', '') }:${ date.getMilliseconds() })`);
}

function getType(type : LogType) : string {
  if (!showTypes) return '';
  return chalk.dim(`[${ type.toUpperCase() }] `);
}

/**
 * @method Info
 * @description Logs an informational message to the console.
 * @param message{string} - Message to log
 * @param data{any[]} - Additional data to log
 * @constructor
 * @example
 * Info('This is an informational message', { someData: 'data' });
 * @returns {void}
 */
export function Info(message : string, ...data : any[]) : void {
  console.log(
    chalk.blue(
      `${ getType('info') }${ message }`
    )
    , ...data,
    getTimestamp()
  );
  logger.info([message, ...data].join(' '));
}

/**
 * @method Warning
 * @description Logs a warning message to the console.
 * @param message{string} - Message to log
 * @param data{any[]} - Additional data to log
 * @example
 * Warning('This is a warning message', { someData: 'data' });
 * @returns {void}
 * @constructor
 */
export function Warning(message : string, ...data : any[]) : void {
  console.warn(
    chalk.yellow(
      `${ getType('warning') }${ message }`
    )
    , ...data,
    getTimestamp()
  )
  logger.warn([message, ...data].join(' '));
}


/**
 * @method Errors
 * @description Logs an error message to the console.
 * @param message{string} - Message to log
 * @param data{any[]} - Additional data to log
 * @example
 * Errors('This is an error message', { someData: 'data' });
 * @returns {void}
 * @notes Cannot be "Error" because it is an Error class in Node.js
 * @constructor
 */
export function Errors(message : string, ...data : any[]) : void {
  console.error(
    chalk.red(
      `${ getType('error') }${ message }`
    )
    , ...data,
    getTimestamp()
  )
  logger.error([message, ...data].join(' '));
}

/**
 * @method Debug
 * @description Logs a debug message to the console.
 * @param message{string} - Message to log
 * @param data{any[]} - Additional data to log
 * @constructor
 * @example
 * Debug('This is a debug message', { someData: 'data' });
 * @returns {void}
 */
export function Debug(message : string, ...data : any[]) : void {
  console.debug(
    chalk.hex('#c6a0f6')(
      `${ getType('debug') }${ message }`
    )
    , ...data,
    getTimestamp()
  )
  logger.debug([message, ...data].join(' '));
}

const env = process.env;

const showTypesExist = env.IGNORE_LOG_TYPES !== undefined;
const showTimestampsExist = env.IGNORE_LOG_TIMESTAMPS !== undefined;
const showTypes = (showTypesExist && env.IGNORE_LOG_TYPES === 'false') || !showTypesExist;
const showTimestamps = (showTimestampsExist && env.IGNORE_LOG_TIMESTAMPS === 'false') || !showTimestampsExist;

if (!showTypesExist)
  Warning('Environment variable IGNORE_LOG_TYPES is not set, defaulting to true');

if (!showTimestampsExist)
  Warning('Environment variable IGNORE_LOG_TIMESTAMPS is not set, defaulting to true');

if (showTypesExist && !['true', 'false'].includes(env.IGNORE_LOG_TYPES!))
  Warning('Environment variable IGNORE_LOG_TYPES is not set to true or false, defaulting to false');

if (showTimestampsExist && !['true', 'false'].includes(env.IGNORE_LOG_TIMESTAMPS!))
  Warning('Environment variable IGNORE_LOG_TIMESTAMPS is not set to true or false, defaulting to false');