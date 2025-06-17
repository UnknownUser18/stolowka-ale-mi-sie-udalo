import 'dotenv/config';
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import {WebSocketServer} from "ws";
import {
    Person,
    envSchema,
    AbsenceDay,
    CanceledDay,
    Card,
    Scan,
    Payment,
    Declaration,
    QueriesStructure,
    SuccessResponse, Opiekun, Klasa, ReportAbsenceDay, ReportCheckedCard, ReportPayment, ArchivedUser,
} from "./types";
import {PoolOptions} from "mysql2/promise";

/** Inicjalizacja loggera
 *  Logi są złożone z:
 *  - Czasu stworzenia loga;
 *  - Dane;
 *  Logi są przekazywane do:
 *  - Konsoli;
 *  - Pliku serwer-*dzisiejsza data*.log
 *
 * */
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

/** Inicjalizacja serwera WebSocketServer
 * Port: 8080
 * */
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

/**
 * Dopasowanie pliku .env do typu envSchema
 * */
export const env = envSchema.parse(process.env);

/** Konfiguracja połączenia z bazą danych
 * Przekazanie wszystkich wartości z pliku .env
 * Dodatkowo:
 * - Kwerendy można wykonywać z placeholderami;
 * - Maksymalna ilość prób połączenia: 100;
 * - Maksymalna liczba żądań połączenia, które komunikacja z bazą danych umieści w kolejce przed zwróceniem błędu: 100;
 * */
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

/**
 * Statyczne kwerendy podzielone:
 * - sektory;
 * - tabele lub typy danych, na których się pracuje;
 * - operacje na danych;
 * */
export const Queries: QueriesStructure = {
    "archived": {
        "zsti": {
            "type": ArchivedUser.array(),
            "get": `SELECT o.id AS "id", typ_osoby_id, imie, nazwisko, nazwa AS "klasa", opiekun_id  FROM archive_osoby_zsti o LEFT JOIN slownik_klasa s ON o.klasa = s.id ORDER BY nazwisko, imie;`,
        }
    },
    "raportsZsti": {
        "absence": {
            "type": ReportAbsenceDay.array(),
            "get": `SELECT n.id AS "id", dzien_wypisania, imie, nazwisko, sk.nazwa AS "klasa" FROM nieobecnosci_zsti n JOIN osoby_zsti o_z ON o_z.id = n.osoby_zsti_id JOIN slownik_klasa sk on o_z.klasa = sk.id WHERE (:data_od IS NULL OR dzien_wypisania >= :data_od) AND (:data_do IS NULL OR dzien_wypisania <= :data_do) ORDER BY dzien_wypisania`,
            "getForStudent": `SELECT id, dzien_wypisania FROM nieobecnosci_zsti WHERE osoby_zsti_id = :id AND (:data_od IS NULL OR dzien_wypisania >= :data_od) AND (:data_do IS NULL OR dzien_wypisania <= :data_do) ORDER BY dzien_wypisania;`
        },
        "checkedCard": {
            "type": ReportCheckedCard.array(),
            "get": `SELECT s.id AS "id", nazwisko, imie, czas FROM skany_zsti s JOIN karty_zsti k ON k.id = s.id_karty JOIN osoby_zsti o ON o.id = k.id_ucznia WHERE (:data_od IS NULL OR czas >= :data_od) AND (:data_do IS NULL OR czas <= :data_do) ORDER BY czas;`,
            "getForStudent": `SELECT s.id AS "id", czas FROM skany_zsti s JOIN karty_zsti k ON k.id = s.id_karty JOIN osoby_zsti o ON o.id = k.id_ucznia WHERE o.id = :id AND (:data_od IS NULL OR czas >= :data_od) AND (:data_do IS NULL OR czas <= :data_do) ORDER BY czas;`
        },
        "platnosci": {
            "type": ReportPayment.array(),
            "get": `SELECT p.id AS "id", nazwisko, imie, LPAD(miesiac, 2, '0') AS miesiac, rok, CONCAT(rok, '-', LPAD(miesiac, 2, '0')) AS rok_miesiac, platnosc, data_platnosci FROM platnosci_zsti p JOIN osoby_zsti o ON p.id_ucznia = o.id WHERE (:data_od IS NULL OR :data_od <= data_platnosci) AND (:data_do IS NULL OR :data_do >= data_platnosci) AND (:miesiac IS NULL OR :miesiac = CONCAT(rok, '-', LPAD(miesiac, 2, '0'))) ORDER BY miesiac DESC, rok DESC;`
        }
    },
    "global": {
        "success": {
            "type": SuccessResponse.array(),
            "get": `SELECT @ROW_COUNT() as affectedRows`, // kept only for compatibility
        },
        "canceledDay": {
            "type": CanceledDay.array(),
            "get": `SELECT * FROM dni_nieczynne_stolowki ORDER BY dzien`,
            "add": `INSERT INTO dni_nieczynne_stolowki (dzien) VALUES(:dzien)`,
            "delete": `DELETE FROM dni_nieczynne_stolowki WHERE id = :id`
        }
    },
    "zsti": {
        "guardian": {
            "type": Opiekun.array(),
            "get": `SELECT * FROM opiekun_zsti`,
            "getById": `SELECT * FROM opiekun_zsti WHERE opiekun_zsti.id_opiekun = :id`,
            "getByStudentId": `SELECT * FROM opiekun_zsti WHERE id_opiekun = (SELECT opiekun_id FROM osoby_zsti WHERE id = :id)`,
            "update": `UPDATE opiekun_zsti SET imie_opiekuna = :imie_opiekuna, nazwisko_opiekuna = :nazwisko_opiekuna, telefon = :telefon, nr_kierunkowy = :nr_kierunkowy, email = :email WHERE id_opiekun = :id;`,
        },
        "klasa": {
            "type": Klasa.array(),
            "get": `SELECT * FROM slownik_klasa ORDER BY nazwa;`,
            "getById": `SELECT * FROM slownik_klasa WHERE id = :id;`,
            "getId": `SELECT id FROM slownik_klasa WHERE nazwa = :nazwa;`,
        },
        "pricing":{
            "get": `SELECT * FROM cennik_zsti ORDER BY data_od;`,
            "add": `INSERT INTO cennik_zsti (data_od, cena, data_do) VALUES (:data_od, :cena, :data_do);`,
            "addWOdatado": `INSERT INTO cennik_zsti (data_od, cena, data_do) VALUES (:data_od, :cena, NULL);`,
            "update": `UPDATE cennik_zsti SET data_od = :data_od, cena = :cena, data_do = :data_do WHERE id = :id;`,
            "updateWOdatado": `UPDATE cennik_zsti SET data_od = :data_od, data_do = NULL, cena = :cena WHERE id = :id;`,
            "delete": `DELETE FROM cennik_zsti WHERE id = :id`,
        },
        "student": {
            "type": Person.array(),
            "get": `SELECT o.id as id, typ_osoby_id, imie, nazwisko, nazwa AS klasa, uczeszcza, miasto, opiekun_id FROM osoby_zsti o LEFT JOIN slownik_klasa s ON o.klasa = s.id ORDER BY nazwisko, imie;`,
            "getById": `SELECT * FROM osoby_zsti WHERE id = :id`,
            "add": `INSERT INTO osoby_zsti (imie, nazwisko, klasa, uczeszcza, typ_osoby_id) values(:imie, :nazwisko, :klasa, :uczeszcza, :typ_osoby_id);`,
            "update": `UPDATE osoby_zsti SET imie = :imie, nazwisko = :nazwisko, klasa = :klasa, uczeszcza = :uczeszcza, typ_osoby_id = :typ_osoby_id WHERE id = :id;`,
            "delete": `DELETE FROM osoby_zsti WHERE id = :id`
        },
        "declaration": {
            "type": Declaration.array(),
            "get": `SELECT * FROM deklaracja_zywieniowa_zsti`,
            "getWithUser": `SELECT n.id AS "id", dzien_wypisania, imie, nazwisko FROM nieobecnosci_zsti n JOIN osoby_zsti o ON o.id = n.osoby_zsti_id WHERE (:data_od IS NULL OR dzien_wypisania > :data_od) AND (:data_do IS NULL OR dzien_wypisania < :data_do);`,
            "getById": `SELECT * FROM deklaracja_zywieniowa_zsti WHERE id_osoby = :id`,
            "add": `INSERT INTO deklaracja_zywieniowa_zsti (id_osoby, data_od, data_do, dni) VALUES(:id_osoby, :data_od, :data_do, :dni);`,
            "update": `UPDATE deklaracja_zywieniowa_zsti SET id_osoby = :id_osoby, data_od = :data_od, data_do = :data_do, dni = :dni WHERE id = :id;`,
            "delete": `DELETE FROM deklaracja_zywieniowa_zsti WHERE id = :id`,
            "deleteAll": `DELETE FROM deklaracja_zywieniowa_zsti WHERE id_osoby = :id_osoby`
        },
        "card": {
            "type": Card.array(),
            "get": `SELECT * FROM karty_zsti`,
            "getById": `SELECT * FROM karty_zsti WHERE id_ucznia = :id_ucznia`,
            "add": `INSERT INTO karty_zsti (id_ucznia, key_card, data_wydania, ostatnie_uzycie) VALUES (:id_ucznia, :key_card, :data_wydania, :ostatnie_uzycie)`,
            "update": `UPDATE karty_zsti SET key_card = :key_card WHERE id = :id`,
            "updateWithData": `UPDATE karty_zsti SET key_card = :key_card, data_wydania = :data_wydania WHERE id_ucznia = :id_ucznia`,
            "delete": `DELETE FROM karty_zsti WHERE id = :id`,
            "deleteByStudentId": `DELETE FROM karty_zsti WHERE id_ucznia = :id_ucznia`,
            "getWithDetails": `SELECT k_z.id, k_z.id_ucznia, k_z.key_card, k_z.data_wydania, k_z.ostatnie_uzycie, o_z.typ_osoby_id, o_z.imie, o_z.nazwisko, o_z.klasa, o_z.uczeszcza, o_z.miasto FROM karty_zsti k_z LEFT JOIN osoby_zsti o_z ON o_z.id = k_z.id_ucznia ORDER BY o_z.nazwisko, o_z.imie;`
        },
        "absence": {
            "type": AbsenceDay.array(),
            "get": `SELECT * FROM nieobecnosci_zsti`,
            "getById": `SELECT * FROM nieobecnosci_zsti WHERE osoby_zsti_id = :id`,
            "add": `INSERT INTO nieobecnosci_zsti (dzien_wypisania, osoby_zsti_id) VALUES (:dzien_wypisania, :osoby_zsti_id)`,
            "update": `UPDATE nieobecnosci_zsti SET dzien_wypisania = :dzien_wypisania, osoby_zsti_id = :osoby_zsti_id WHERE id = :id`,
            "delete": `DELETE FROM nieobecnosci_zsti WHERE dzien_wypisania = :dzien_wypisania AND osoby_zsti_id = :osoby_zsti_id`,
            "deleteForStudent": `DELETE FROM nieobecnosci_zsti WHERE osoby_zsti_id = :id`
        },
        "payment": {
            "type": Payment.array(),
            "get": `SELECT * FROM platnosci_zsti`,
            "getById": `SELECT * FROM platnosci_zsti WHERE id_ucznia = :id_ucznia`,
            "add": `INSERT INTO platnosci_zsti (id_ucznia, platnosc, data_platnosci, miesiac, opis, rok) VALUES (:id_ucznia, :platnosc, :data_platnosci, :miesiac, :opis, :rok)`,
            "update": `UPDATE platnosci_zsti SET platnosc = :platnosc, data_platnosci = :data_platnosci, miesiac = :miesiac, opis = :opis, rok = :rok WHERE id = :id`,
            "delete": `DELETE FROM platnosci_zsti WHERE id = :id`,
            "deleteByStudentId": `DELETE FROM platnosci_zsti WHERE id_ucznia = :id_ucznia`
        },
        "scan": {
            "type": Scan.array(),
            "get": `SELECT * FROM skany_zsti`,
            "add": `INSERT INTO skany_zsti (id_karty, czas) values (:id_karty, :czas)`,
            "delete": `DELETE FROM skany_zsti WHERE id = :id`,
            "deleteForCard": `DELETE FROM skany_zsti WHERE id_karty = :id_karty`,
        }
    }
}