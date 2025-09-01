import express from 'express';
import 'dotenv/config';
import * as dbConstructor from 'mysql2/promise';
import { Debug, Errors, getStatusCodeByCode, Info, StatusCodes, Warning, Packet, ErrorPacket } from './types';
import { configureRequestsDebug } from './config';
import { QueryError, QueryResult } from "mysql2/promise";
import zstiRoutes from './zsti';
import infoRoutes from './info';

const env = process.env;

if (env.DEBUG_MODE === undefined)
  Warning('DEBUG_MODE is not set, defaulting to false');

const app = express();

if (env.DEBUG_MODE === 'false')
  configureRequestsDebug(app);

app.use(express.json());
app.use('/api/zsti', zstiRoutes);
app.use('/api/info', infoRoutes)


if (!env.DB_HOST || !env.DB_USER || env.DB_PASSWORD === undefined || !env.DB_NAME || !env.DB_PORT) {
  Errors('Database configuration is missing in environment variables');
  process.exit(1);
}

if (!env.PORT || isNaN(parseInt(env.PORT, 10))) {
  Errors('Server port is not defined or invalid in environment variables');
  process.exit(1);
}

const connection = {
  host : env.DB_HOST,
  port : parseInt(env.DB_PORT, 10),
  user : env.DB_USER,
  password : env.DB_PASSWORD,
  database : env.DB_NAME,
  namedPlaceholders : true,
}

export const db = dbConstructor.createConnection(connection).then((connection) => {
  Info('Database connection established successfully');
  return connection;
}).catch((error) => {
  Errors('Failed to connect to the database', error);
  if (env.DEBUG_MODE === 'true')
    process.exit(1);
  else {
    setInterval(() => {
      Info('Attempting to reconnect to the database...');
      dbConstructor.createConnection(connection).then((connection) => {
        Info('Database reconnection successful');
        return connection;
      }).catch((err) => {
        Errors('Reconnection attempt failed', err);
      });
    }, 60000); // Retry every 60 seconds
    return null;
  }
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
    const connection = await db;
    if (!connection) {
      Errors('No database connection available');
      return null;
    }
    const result = await connection.query(query, params);
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
    [StatusCodes.Removed, 204],
  ]);
  const statusCode = getStatusCodeByCode(packet.status);

  const httpStatusCode = !isError ? (responseStatus.get(statusCode) || 200) : 500; // Default to 500 for errors

  return res.status(httpStatusCode).send({
    status : statusCode,
    statusMessage : packet.statusMessage,
    timestamp : packet.timestamp,
    data : !(packet.data) || packet.data[0] || null,
  });
}

function isQuerySuccesful(result : QueryResult | QueryError | null) : boolean {
  return !(result instanceof Error || result === null);
}

export function createPacket(data : QueryResult | QueryError | null, succesfulStatusCode : StatusCodes) : Packet | ErrorPacket {
  let packet : Packet | ErrorPacket;

  if (isQuerySuccesful(data))
    packet = new Packet(succesfulStatusCode, data);
  else if (data === null)
    packet = new ErrorPacket(StatusCodes["Internal Server Error"]);
  else
    packet = new ErrorPacket(getStatusCodeByCode(parseInt((data as QueryError).code)));

  return packet;
}