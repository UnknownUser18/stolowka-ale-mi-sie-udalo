import express from 'express';
import 'dotenv/config';
import * as dbConstructor from 'mysql2/promise';
import { Errors, Info, Warning } from './types';
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
}).then(() => {
  Info('Database connection established successfully');
}).catch((error) => {
  Errors('Failed to connect to the database', error);
  process.exit(1);
});

app.listen(env.PORT, () => {
  Info('Server is running on port', env.PORT);
});
