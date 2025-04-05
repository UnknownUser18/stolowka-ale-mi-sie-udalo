import 'dotenv/config';
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import {WebSocketServer} from "ws";
import {envSchema} from "./types";
import {PoolOptions} from "mysql2/promise";
import { createTransport, Transporter } from 'nodemailer';

export const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new DailyRotateFile({
            filename: 'logs/serwer-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: false,
            maxSize: '20m',
            maxFiles: '14d',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            options: { flags: 'a' }
        })

    ]
});

export const wss: WebSocketServer = new WebSocketServer({
    port: 8080,
    perMessageDeflate: {
        zlibDeflateOptions: {
            chunkSize: 1024,
            level: 3,
            memLevel: 7,
        },
        zlibInflateOptions: { chunkSize: 10240 },
        clientNoContextTakeover: true,
        serverNoContextTakeover: true,
        serverMaxWindowBits: 10,
        concurrencyLimit: 10,
        threshold: 1024,
    },
});

export const env = envSchema.parse(process.env);

export const dbConfig: PoolOptions = {
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    namedPlaceholders: true,
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 100
}

export const transporter: Transporter = createTransport({
    service: 'gmail',
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
});

export const Queries = {
    "zsti": {
        "students": {
            "get": `SELECT * FROM osoby_zsti ORDER BY nazwisko asc, imie asc;`,
            "add": `INSERT INTO osoby_zsti (imie, nazwisko, klasa, uczeszcza, typ_osoby_id) values(:imie, :nazwisko, :klasa, :uczeszcza, :typ_osoby_id);`,
            "update": `UPDATE osoby_zsti SET imie = :imie, nazwisko = :nazwisko, klasa = :klasa, uczeszcza = :uczeszcza, typ_osoby_id = :typ_osoby_id WHERE id = :id;`,
        }
    }
}