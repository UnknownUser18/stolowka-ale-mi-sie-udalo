import express from 'express';
import 'dotenv/config';
import * as dbConstructor from 'mysql2/promise';
import { Connection, QueryError, QueryResult } from 'mysql2/promise';
import { Debug, ErrorPacket, Errors, getStatusCodeByCode, Info, Packet, StatusCodes, Warning } from './types';
import { configureConsoleOutput } from './config';
import zstiRoutes from './zsti/zsti';
import internatRoutes from './internat/internat';
import infoRoutes from './info';
import cors from 'cors';

const env = process.env;

if (env.DEBUG_MODE === undefined)
  Warning('DEBUG_MODE is not set, defaulting to false');

const app = express();

configureConsoleOutput(app, env.DEBUG_MODE === 'true');

app.use(cors());
app.use(express.json());
app.use('/api/zsti', zstiRoutes);
app.use('/api/info', infoRoutes);
app.use('/api/internat', internatRoutes);


if (!env.DB_HOST || !env.DB_USER || env.DB_PASSWORD === undefined || !env.DB_NAME || !env.DB_PORT) {
  Errors('Database configuration is missing in environment variables');
  process.exit(1);
}

if (!env.PORT || isNaN(parseInt(env.PORT, 10))) {
  Errors('Server port is not defined or invalid in environment variables');
  process.exit(1);
}

const pool = dbConstructor.createPool({
  host               : env.DB_HOST,
  port               : parseInt(env.DB_PORT, 10),
  user               : env.DB_USER,
  password           : env.DB_PASSWORD,
  database           : env.DB_NAME,
  namedPlaceholders  : true,
  waitForConnections : true,
  connectionLimit    : 10,
  queueLimit         : 0
});

pool.on('connection', (conn : Connection) => {
  Info('New database connection established with ID', conn.threadId);
});

app.listen(env.PORT, () => {
  Info('Server is running on port', env.PORT);
});

/**
 * @method executeQuery
 * @param query{string} - SQL query to execute
 * @param params{any[]} - Optional parameters for the query
 * @returns {Promise<QueryResult>} - Promise resolving to the query result
 * @description Executes a SQL query using the established database connection.
 * @throws - Throws an error type QueryError if the query execution fails.
 */
export async function executeQuery(query : string, params? : {}) : Promise<QueryResult | QueryError | null> {
  try {
    const result = await pool.query(query, params);
    if (env.DEBUG_MODE === 'true')
      Debug('Query executed successfully', query, params);
    return result[0]; // MySQL2 returns an array with results and fields
  } catch (error) {
    Errors('Error executing query', error);
    return error as QueryError; // Return the error as QueryError type
  }
}

/**
 * @function sendResponse
 * @description Sends a standardized response to the client.
 * It checks if the packet is an error and sets the appropriate HTTP status code.
 * @param res{express.Response} - The Express response object to send the response.
 * @param packet{Packet} - The packet containing the response data, status, and message.
 * @returns {express.Response} - The Express response object with the status and data.
 */
export function sendResponse(res : express.Response, packet : Packet) : express.Response {
  const isError = packet instanceof ErrorPacket;
  const responseStatus = new Map<number, number>([
    [StatusCodes.OK, 200],
    [StatusCodes.Inserted, 201],
    [StatusCodes.Updated, 200],
  ]);
  const statusCode = getStatusCodeByCode(packet.status);

  const httpStatusCode = !isError ? (responseStatus.get(statusCode) || 200) : 500; // Default to 500 for errors

  res.status(httpStatusCode)
  .contentType('application/json')
  .setHeader('Access-Control-Allow-Origin', `http://localhost:4200`);
  return res.send({
    status    : statusCode,
    statusMessage : packet.statusMessage,
    timestamp : packet.timestamp,
    data      : !(packet.data) || packet.data[0] || null,
  });
}

function isQuerySuccessful(result : QueryResult | QueryError | null) : boolean {
  return !(result instanceof Error || result === null);
}

export function createPacket(data : QueryResult | QueryError | null, successfulStatusCode : StatusCodes) : Packet | ErrorPacket {
  let packet : Packet | ErrorPacket;

  if (isQuerySuccessful(data))
    packet = new Packet(successfulStatusCode, data);
  else if (data === null)
    packet = new ErrorPacket(StatusCodes["Internal Server Error"]);
  else
    packet = new ErrorPacket(getStatusCodeByCode(parseInt((data as QueryError).code)));

  return packet;
}

/**
 * @function getData
 * @description Extracts the primary data from a Packet or ErrorPacket.
 * @notes You have to destructure the result to the expected type after calling this function.
 * @param packet - The Packet or ErrorPacket from which to extract data.
 * @returns The primary data contained in the packet, or null if no data is present.
 * @example
 * ```typescript
 * const packet = createPacket(someQueryResult, StatusCodes.OK);
 * packet.data = [getData(packet).map((declaration : any) => {
 *     declaration.sniadanie = declaration.sniadanie === 1;
 *     declaration.obiad = declaration.obiad === 1;
 *     return declaration;
 *   })]
 * ```
 */
export function getData(packet : Packet | ErrorPacket) : any | null {
  return (packet.data as any)[0] || null;
}

/**
 * @function sendIncorrectDataValueResponse
 * @description Sends a standardized response indicating incorrect data value.
 * @param res
 */
export function sendIncorrectDataValueResponse(res : express.Response) : express.Response {
  const packet = new ErrorPacket(StatusCodes["Incorrect data value"]);
  return sendResponse(res, packet);
}

export function isID(id : any) : boolean {
  return !(!Number.isInteger(id) || id < 1);
}

export function isString(value : any, maxLength? : number) : boolean {
  return typeof value === 'string' && value.length <= (maxLength || Infinity);
}

export function isNumber(value : any) : boolean {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

export function isBoolean(value : any) : boolean {
  return typeof value === 'boolean';
}

export function isDateString(value : any) : boolean {
  return typeof value === 'string' && !isNaN(Date.parse(value));
}

export function isMonth(value : any) : boolean {
  return Number.isInteger(value) && value >= 1 && value <= 12;
}