import 'dotenv/config';
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import {WebSocketServer} from "ws";
import {Person, envSchema, AbsenceDay, CanceledDay, Card, Scan, Payment, Declaration, QueriesStructure} from "./types";
import {PoolOptions} from "mysql2/promise";
// import { createTransport, Transporter } from 'nodemailer';

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

// export const transporter: Transporter = createTransport({
//     service: 'gmail',
//     auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
// });

export const Queries: QueriesStructure = {
    "zsti": {
        "student": {
            "type": Person.array(),
            "get": `SELECT * FROM osoby_zsti ORDER BY nazwisko, imie;`,
            "add": `INSERT INTO osoby_zsti (imie, nazwisko, klasa, uczeszcza, typ_osoby_id) values(:imie, :nazwisko, :klasa, :uczeszcza, :typ_osoby_id);`,
            "update": `UPDATE osoby_zsti SET imie = :imie, nazwisko = :nazwisko, klasa = :klasa, uczeszcza = :uczeszcza, typ_osoby_id = :typ_osoby_id WHERE id = :id;`,
            "delete": `DELETE FROM osoby_zsti WHERE id = :id`
        },
        "declaration": {
            "type": Declaration.array(),
            "get": `SELECT * FROM deklaracja_zywieniowa_zsti`,
            "add": `INSERT INTO deklaracja_zywieniowa_zsti (id_osoby, rok_szkolny_id, data_od, data_do, dni) VALUES(:id_osoby, :rok_szkolny_id, :data_od, :data_do, :dni);`,
            "update": `UPDATE deklaracja_zywieniowa_zsti SET id_osoby = :id_osoby, rok_szkolny_id = :rok_szkolny_id, data_od = :data_od, data_do = :data_do, dni = :dni WHERE id = :id;`,
            "delete": `DELETE FROM deklaracja_zywieniowa_zsti WHERE id = :id`
        },
        "canceledDay": {
            "type": CanceledDay.array(),
            "get": `SELECT * FROM dni_nieczynne_stolowki`,
            "add": `INSERT INTO dni_nieczynne_stolowki (dzien) VALUES(:dzien)`,
            "delete": `DELETE FROM dni_nieczynne_stolowki WHERE id = :id`
        },
        "card": {
            "type": Card.array(),
            "get": `SELECT * FROM karty_zsti`,
            "add": `INSERT INTO karty_zsti (id_ucznia, key_card, data_wydania, ostatnie_uzycie) VALUES (:id_ucznia, :key_card, :data_wydania, :ostatnie_uzycie)`,
            "update": `UPDATE karty_zsti SET id_ucznia = :id_ucznia, key_card = :key_card, data_wydania = :data_wydania, ostatnie_uzycie = :ostatnie_uzycie WHERE id = :id`,
            "delete": `DELETE FROM karty_zsti WHERE id = :id`
        },
        "absence": {
            "type": AbsenceDay.array(),
            "get": `SELECT * FROM nieobecnosci_zsti`,
            "add": `INSERT INTO nieobecnosci_zsti (rok_szkolny_id, dzien_wypisania, osoby_zsti_id, uwagi) VALUES (:rok_szkolny_id, :dzien_wypisania, :osoby_zsti_id, :uwagi)`,
            "update": `UPDATE nieobecnosci_zsti SET rok_szkolny_id = :rok_szkolny_id, dzien_wypisania = :dzien_wypisania, osoby_zsti_id = :osoby_zsti_id, uwagi = :uwagi WHERE id = :id`,
            "delete": `DELETE FROM nieobecnosci_zsti WHERE id = :id`
        },
        "payment": {
            "type": Payment.array(),
            "get": `SELECT * FROM platnosci_zsti`,
            "add": `INSERT INTO platnosci_zsti (id_ucznia, platnosc, data_platnosci, miesiac, opis, rok) VALUES (:id_ucznia, :platnosc, :data_platnosci, :miesiac, :opis, :rok)`,
            "delete": `DELETE FROM platnosci_zsti WHERE id = :id`
        },
        "scan": {
            "type": Scan.array(),
            "get": `SELECT * FROM skany_zsti`,
            "add": `INSERT INTO skany_zsti (id_karty, czas) values (:id_karty, :czas)`,
            "delete": `DELETE FROM skany_zsti WHERE id = :id`
        }
    }
}