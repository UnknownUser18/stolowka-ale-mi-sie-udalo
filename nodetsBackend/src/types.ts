import 'dotenv/config';
import { z } from 'zod';

/**
 * # Reprezentuje dwie akcje obsługiwane przez serwer:
 * - ### **request** - Pobranie, Dodanie, Zmiana, Usunięcie danych
 * - ### **response** - Odpowiedź, w tym wypadku klienta
 *
 * @example
 * const akcja: ActionType = 'request';
 *
 * */
export type ActionType = 'request' | 'response';

/**
 * # Reprezentuje, w jakim stylu przesyłane są parametry metody
 *
 * @example
 * const parametry: Params = {
 *      'id': number = 1,
 *      'imie': string = 'Michał'
 * }
 *
 * */
export type Params = {[key: string]: any};

/**
 *
 * @interface ServerData
 *
 * @description # Reprezentuje dane, które są przesyłane od/do serwera
 *
 * @property {ActionType} action - Typ zapytania, jakie wysyła się do serwera <br>
 * @property {RequestPayload | ResponsePayload} params - Parametry całego zapytania, są różne w zależności od typu zapytania
 *
 * @example
 * const data: ServerData = {
 *     action: 'request',
 *     params: {
 *         method: 'zsti.student.get'.
 *         params: {},
 *         responseVar: 'StudentListZsti'
 *     }
 * }
 *
 * */
export interface ServerData {
    action: ActionType,
    params: RequestPayload | ResponsePayload
}

/**
 *
 * @interface RequestPayload
 *
 *
 * @property {string} method - Metoda zapytania, jaką chcemy wykonać <br>
 * @property {Params} params - Parametry zapytania odnoszące się do pól w bazie danych <br>
 * @property {string} [responseVar] - Opcjonalnie nazwa zmiennej u klienta, która ma przechowywać wartość zwróconą przez podaną metodę
 *
 * @description # Reprezentuje parametry zapytania typu 'request'
 *
 * @example
 * const data: RequestPayload = {
 *      method: 'zsti.student.get'.
 *      params: {
 *          id: 1,
 *          imie: 'Michał'
 *      },
 *      responseVar: 'StudentListZsti'
 * }
 *
 * */
export interface RequestPayload {
    method: string;
    params: Params;
    responseVar?: string;
}

/**
 *
 * @interface ResponsePayload
 *
 *
 * @property {string} variable - Nazwa zmiennej, w jakiej mają być przechowane dane <br>
 * @property {any} value - Dane zwrócone przez proces
 *
 * @description # Reprezentuje wartość zwróconą przez serwer do klienta
 *
 * @example
 * const data: ResponsePayload = {
 *      variable: 'StudentListZsti'.
 *      value: {
 *          id: 1,
 *          imie: 'Michał',
 *          nazwisko: 'Wiaterek',
 *          wiek: 15
 *      },
 * }
 *
 * */
export interface ResponsePayload {
    variable: string;
    value: any;
}

/**
 *
 * @interface QueryCategory
 *
 *
 * @property {z.ZodSchema<any>} type - Globalny typ danych, który jest używany w tabeli, na której działają wszystkie te operacje
 * @property {string} get - Kwerenda zwracająca dane z tabeli, kwerenda: SELECT
 * @property {string} [add] - Potencjalna kwerenda dodająca dane do tabeli, kwerenda: INSERT
 * @property {string} [update] - Potencjalna kwerenda zmieniająca dane z tabeli, kwerenda: UPDATE
 * @property {string} [delete] - Potencjalna kwerenda usuwająca dane z tabeli, kwerenda: DELETE
 * @property {string | z.ZodSchema | undefined} [key] - Potencjalne inne typy operacji na danych
 *
 * @description # Reprezentuje wartości dla danych operacji na danych w bazie
 *
 * @example
 * const data: QueryCategory = {
 *             "type": CanceledDay.array(),
 *             "get": `SELECT * FROM dni_nieczynne_stolowki`,
 *             "add": `INSERT INTO dni_nieczynne_stolowki (dzien) VALUES(:dzien)`,
 *             "delete": `DELETE FROM dni_nieczynne_stolowki WHERE id = :id`
 *         }
 *
 * */
export interface QueryCategory {
    type: z.ZodSchema<any>;
    get: string;
    add?: string;
    update?: string;
    delete?: string;
    [key: string]: string | z.ZodSchema | undefined;
}

export interface QueriesStructure {
    [sector: string]: {
        [category: string]: QueryCategory;
    };
}


export const envSchema = z.object({
    DB_HOST: z.string(),
    DB_PORT: z.string().transform(Number),
    DB_USER: z.string(),
    DB_PASSWORD: z.string(),
    DB_NAME: z.string(),
    SMTP_USER: z.string(),
    SMTP_PASS: z.string(),
});

export interface Declaration {
    id: number;
    id_osoby: number;
    data_od: string;
    data_do: string;
    dni: string;
}

export const Declaration = z.object({
    id: z.number(),
    id_osoby: z.number(),
    data_od: z.date(),
    data_do: z.date(),
    dni: z.string()
});

export interface CanceledDay {
    id: number;
    dzien: string;
}

export const CanceledDay = z.object({
    id: z.number(),
    dzien: z.date()
});

export interface Card {
    id: number;
    id_ucznia: number;
    key_card: number;
    data_wydania: string;
    ostatnie_uzycie: string;
}

export const Card = z.object({
    id: z.number(),
    id_ucznia: z.number(),
    key_card: z.number(),
    data_wydania: z.date(),
    ostatnie_uzycie: z.date()
});

export interface AbsenceDay {
    id: number;
    dzien_wypisania: string;
    osoby_zsti_id: number;
}

export const AbsenceDay = z.object({
    id: z.number(),
    dzien_wypisania: z.date(),
    osoby_zsti_id: z.number()
});

export interface Person {
    id: number;
    typ_osoby_id: number;
    imie: string;
    nazwisko: string;
    klasa: string;
    uczeszcza: boolean;
    miasto: boolean;
}

export const Person = z.object({
    id: z.number(),
    typ_osoby_id: z.number(),
    imie: z.string(),
    nazwisko: z.string(),
    klasa: z.string(),
    uczeszcza: z.number(),
    miasto: z.number(),
});

export interface Payment {
    id: number;
    id_ucznia: number;
    platnosc: number;
    data_platnosci: string;
    miesiac: number;
    opis: string;
    rok: number;
}

export const Payment = z.object({
    id: z.number(),
    id_ucznia: z.number(),
    platnosc: z.number(),
    data_platnosci: z.date(),
    miesiac: z.number(),
    opis: z.string(),
    rok: z.number()
});

export interface Scan {
    id: number;
    id_karty: number;
    czas: string;
}

export const Scan = z.object({
    id: z.number(),
    id_karty: z.number(),
    czas: z.date()
});