import 'dotenv/config';
import { z } from 'zod';

export type ActionType = 'request' | 'response';

export type Params = {[key: string]: any};

export interface ServerData {
    action: ActionType,
    params: RequestPayload | ResponsePayload
}

export interface RequestPayload {
    method: string;
    params: {[key: string]: any};
    responseVar?: string;
}

export interface ResponsePayload {
    variable: string;
    value: any;
}

export type QueryCategory = {
    type: z.ZodSchema<any>;
    get: string;
    add?: string;
    update?: string;
    delete?: string;
    [key: string]: string | z.ZodSchema | undefined;
};

export type QueriesStructure = {
    [sector: string]: {
        [category: string]: QueryCategory;
    };
};

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
    // here
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