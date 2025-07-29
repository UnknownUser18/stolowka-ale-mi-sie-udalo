import chalk from "chalk";
import 'dotenv/config';
import { logger } from "./config";

type LogType = 'info' | 'warning' | 'error' | 'debug';

export interface HttpPacket {
  readonly status : number,
  readonly statusMessage : string,
  readonly timestamp : string,
  data? : any[],
}


export enum statusCodes {
  'OK' = 200,
  'Inserted' = 201,
  'Updated' = 202,
  'Removed' = 203,
  'Internal Server Error' = 500,
  'Database Connection Error' = 700,
  'Duplicate Entry' = 701,
  'Unknown Column' = 702,
  'Invalid Query Syntax' = 703,
  'Table Not Found' = 704,
  'Access Denied' = 705,
  'User has no permissions for this action' = 706,
  'Cannot remove or update a record, foreign key constraint fails' = 707,
  'Cannot add or update a record, foreign key constraint fails' = 708,
  'Data too long' = 709,
  'Incorrect data value' = 710,
  'Column cannot be null' = 711,
}

export const mysqlErrorMap = {
  1062 : 701, // ER_DUP_ENTRY
  1054 : 702, // ER_BAD_FIELD_ERROR
  1064 : 703, // ER_PARSE_ERROR
  1146 : 704, // ER_NO_SUCH_TABLE
  1045 : 705, // ER_ACCESS_DENIED_ERROR
  1044 : 706, // ER_DBACCESS_DENIED_ERROR
  1451 : 707, // ER_ROW_IS_REFERENCED_2
  1452 : 708, // ER_NO_REFERENCED_ROW_2
  1406 : 709, // ER_DATA_TOO_LONG
  1366 : 710, // ER_TRUNCATED_WRONG_VALUE
  1048 : 711, // ER_BAD_NULL_ERROR
  'PROTOCOL_CONNECTION_LOST' : 700,
  'ECONNREFUSED' : 700
};

export function getStatusCodeError(error : number | string) : number {
  const mapped = mysqlErrorMap[error as keyof typeof mysqlErrorMap];
  if (mapped !== undefined) {
    return mapped;
  }
  return statusCodes["Internal Server Error"];

}

export function getStatusMessageError(error : number | string) : string {
  const mapped = mysqlErrorMap[error as keyof typeof mysqlErrorMap];
  Debug('getStatusMessage', error, mapped);
  if (mapped !== undefined) {
    return Object.keys(statusCodes).find(key => statusCodes[key as keyof typeof statusCodes] === mapped) || 'Unknown Error';
  }
  return 'Internal Server Error';
}

export function getStatusMessage(status : statusCodes) : string {
  return Object.keys(statusCodes).find(key => statusCodes[key as keyof typeof statusCodes] === status) || 'Unknown Status';
}

export function getStatusCode(status : statusCodes) : number {
  return statusCodes[status as unknown as keyof typeof statusCodes];
}

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
 * @param message{string | any[]} - Message to log
 * @param data{any[]} - Additional data to log
 * @constructor
 * @example
 * Info('This is an informational message', { someData: 'data' });
 * @returns {void}
 */
export function Info(message : string | any[], ...data : any[]) : void {
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
 * @param message{string | any[]} - Message to log
 * @param data{any[]} - Additional data to log
 * @example
 * Warning('This is a warning message', { someData: 'data' });
 * @returns {void}
 * @constructor
 */
export function Warning(message : string | any[], ...data : any[]) : void {
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
 * @param message{string | any[]} - Message to log
 * @param data{any[]} - Additional data to log
 * @example
 * Errors('This is an error message', { someData: 'data' });
 * @returns {void}
 * @notes Cannot be "Error" because it is an Error class in Node.js
 * @constructor
 */
export function Errors(message : string | any[], ...data : any[]) : void {
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
 * @param message{string | any[]} - Message to log
 * @param data{any[]} - Additional data to log
 * @constructor
 * @example
 * Debug('This is a debug message', { someData: 'data' });
 * @returns {void}
 */
export function Debug(message : string | any[], ...data : any[]) : void {
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