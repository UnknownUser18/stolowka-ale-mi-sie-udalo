import express from 'express';
import 'dotenv/config';
import * as dbConstructor from 'mysql2/promise';
import { Debug, Errors, getStatusCodeError, getStatusMessage, getStatusMessageError, HttpPacket, Info, statusCodes, Warning } from './types';
import { configureRequestsDebug } from './config';
import zstiRoutes from './zsti';

const env = process.env;

if (env.IGNORE_DEBUG === undefined) {
  Warning('IGNORE_DEBUG is not set, defaulting to false');
}

const app = express();

if (env.IGNORE_DEBUG === 'false')
  configureRequestsDebug(app);

app.use(express.json());
app.use('/api/zsti', zstiRoutes);


if (!env.DB_HOST || !env.DB_USER || env.DB_PASSWORD === undefined || !env.DB_NAME || !env.DB_PORT) {
  Errors('Database configuration is missing in environment variables');
  process.exit(1);
}

if (!env.PORT || isNaN(parseInt(env.PORT, 10))) {
  Errors('Server port is not defined or invalid in environment variables');
  process.exit(1);
}

export const db = dbConstructor.createConnection({
  host : env.DB_HOST,
  port : parseInt(env.DB_PORT, 10),
  user : env.DB_USER,
  password : env.DB_PASSWORD,
  database : env.DB_NAME,
  waitForConnections : true,
  connectionLimit : 10,
  queueLimit : 0,
  namedPlaceholders : true,
}).then((connection) => {
  Info('Database connection established successfully');
  return connection;
}).catch((error) => {
  Errors('Failed to connect to the database', error);
  process.exit(1);
});

app.listen(env.PORT, () => {
  Info('Server is running on port', env.PORT);
});


export async function executeQuery(query : string, params? : any[]) {
  try {
    const connection = await db;
    const result = await connection.query(query, params);
    Debug('Query executed successfully', query, params);
    return result[0]; // MySQL2 returns an array with results and fields
  } catch (error) {
    const mysqlError = error as dbConstructor.QueryError;
    Errors('Error executing query', error);
    return [getStatusCodeError(mysqlError.code), getStatusMessageError(mysqlError.code || 'UNKNOWN_ERROR')];
  }
}

export function preparePacket(status : statusCodes, ...data : any[]) : HttpPacket {
  return {
    status : status,
    statusMessage : getStatusMessage(status),
    timestamp : new Date().toISOString(),
    data : data
  };
}