import 'dotenv/config';
import { z } from 'zod';
import { WebSocket } from 'ws';

export type ActionType = 'request' | 'response';

export type Params = {[key: string]: any};

export interface ServerData {
    action: ActionType,
    params: RequestPayload | ResponsePayload
}

export interface RequestPayload {
    method: string;
    params: {[key: string]: any};
}

export interface ResponsePayload {
    variable: string;
    value: any;
}

export interface ActionHandler {
    (ws: WebSocket, params: Params): Promise<void>;
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
    // here
    dni: string;
}

export interface CanceledDay {
    id: number;
    dzien: string;
}

export interface Card {
    id: number;
    id_ucznia: number;
    key_card: number;
    data_wydania: string;
    ostatnie_uzycie: string;
}

export interface AbsenceDay {
    id: number;
    dzien_wypisania: string;
    osoby_zsti_id: number;
    uwagi: string;
}

export interface Person {
    id: number;
    typ_osoby_id: number;
    imie: string;
    nazwisko: string;
    klasa: string;
    uczeszcza: boolean;
    miasto: boolean;
}

export interface Payment {
    id: number;
    id_ucznia: number;
    platnosc: number;
    data_platnosci: string;
    miesiac: number;
    opis: string;
    rok: number;
}

export interface Scan {
    id: number;
    id_karty: number;
    czas: string;
}