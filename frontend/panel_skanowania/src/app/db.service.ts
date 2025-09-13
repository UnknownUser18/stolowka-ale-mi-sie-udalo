import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {catchError, map, Observable, of} from 'rxjs';
import {environment} from '../environments/environment';
import {ZPayment} from './data.service';

export enum StatusCodes {
  'OK' = 200,
  'Inserted' = 201,
  'Updated' = 202,
  'Internal Server Error' = 500,
  'Database Connection Error' = 700,
  'Duplicate Entry' = 701,
  'Unknown Column' = 702,
  'Invalid Query Syntax' = 703,
  'Table Not Found' = 704,
  'Access Denied' = 705,
  'User has no permissions for this action' = 706,
  'Cannot remove or update a record, foreign key constraint fails' = 707,
  'Cannot add or update a record, foreign key constraint fails' = 708,
  'Data too long' = 709,
  'Incorrect data value' = 710,
  'Column cannot be null' = 711,
}

type Bit = '0' | '1';
type DniCode = `${ Bit }${ Bit }${ Bit }${ Bit }${ Bit }`;

export class Packet {
  status : StatusCodes;
  statusMessage : string;
  timestamp : Date;
  data? : any[] | null;
  constructor(status : StatusCodes, statusMessage : string, timestamp : string, ...data : any[]) {
    this.status = status;
    this.statusMessage = statusMessage;
    this.timestamp = new Date(timestamp);
    this.data = data.length > 0 ? data : null;
  }
}

export class ErrorPacket extends Packet {
  override data : null;
  constructor(status : StatusCodes, statusMessage : string, timestamp : string) {
    super(status, statusMessage, timestamp);
    this.data = null;
  }
}

export enum TypOsoby {
  UCZEN = 1,
  NAUCZYCIEL = 2,
}

export interface ZPerson {
  id : number,
  typ_osoby_id? : TypOsoby,
  imie : string,
  nazwisko : string,
  klasa? : string,
  uczeszcza? : boolean,
  miasto? : boolean,
  opiekun_id? : number | null
}

export interface ZDeclaration {
  id : number;
  id_osoby : number;
  data_od : Date;
  data_do : Date;
  dni : DniCode;
}

interface ZDeclarationDB {
  id : number;
  id_osoby : number;
  data_od : string;
  data_do : string;
  dni : DniCode;
}

export interface ZAbsenceDay {
  id : number;
  zsti_id : number;
  dzien_wypisania : Date;
}

interface ZAbsenceDayDB {
  id : number;
  zsti_id : number;
  dzien_wypisania : string;
}

export interface ClosedDay {
  id : number;
  dzien : Date;
}

interface ClosedDayDB {
  id : number;
  dzien : string;
}

export interface ZScan {
  id: number;
  id_karty: number;
  czas: Date;
}


@Injectable({
  providedIn: 'root'
})
export class DbService {
  private http = inject(HttpClient);
  protected readonly api = environment.apiUrl;

  constructor() { }

  private requestZPersons() : Observable<Packet | null> {
    return this.http.get<Packet>(`${ this.api }zsti/person`).pipe(
      map((res) => {
        return res.status === 200 ? res : null;
      }),
      catchError(() => of(null))
    );
  }

  public getZPersons() : Observable<ZPerson[] | null> {
    return this.requestZPersons().pipe(
      map((res) => {
        return res ? res.data as ZPerson[] : null;
      })
    );
  }

  public getZPerson(id : number) : Observable<ZPerson | null> {
    return this.http.get<Packet>(`${ this.api }zsti/person/${ id }`).pipe(
      map((res) => {
        return res.status === 200 ? res.data![0] as ZPerson : null;
      }),
      catchError(() => of(null)))
  }

  public getZDeclarationsPerson(id_person : number) : Observable<ZDeclaration[] | null> {
    return this.http.get<Packet>(`${ this.api }zsti/declaration/${ id_person }`).pipe(
      map((res : Packet) => {
        if (!this.isArray(res)) return null;
        return (res.data as ZDeclarationDB[]).map((declarationDB : ZDeclarationDB) => ({
          ...declarationDB,
          data_od : new Date(declarationDB.data_od),
          data_do : new Date(declarationDB.data_do)
        }));
      }),
      catchError(() => of(null))
    );
  }

  public getZDeclarationsPersonInDate(id_person : number, date: Date) : Observable<ZDeclaration[] | null> {
    return this.http.get<Packet>(`${ this.api }zsti/declaration/${ id_person }?date=${this.convertToDBDate(date)}`).pipe(
      map((res : Packet) => {
        if (!this.isArray(res)) return null;
        return (res.data as ZDeclarationDB[]).map((declarationDB : ZDeclarationDB) => ({
          ...declarationDB,
          data_od : new Date(declarationDB.data_od),
          data_do : new Date(declarationDB.data_do)
        }));
      }),
      catchError(() => of(null))
    );
  }

  public getZAbsenceDaysPerson(id_person : number) : Observable<ZAbsenceDay[] | null> {
    return this.http.get<Packet>(`${ this.api }zsti/absence/${ id_person }`).pipe(
      map((res : Packet) => {
        if (!this.isArray(res)) return null;
        return (res.data as ZAbsenceDayDB[]).map((absenceDayDB : ZAbsenceDayDB) => ({
          ...absenceDayDB,
          dzien_wypisania : new Date(absenceDayDB.dzien_wypisania)
        }));
      }),
      catchError(() => of(null))
    );
  }

  public get getClosedDays() : Observable<ClosedDay[] | null> {
    return this.http.get<Packet>(`${ this.api }info/closed-days`).pipe(
      map((res : Packet) => {
        if (!this.isArray(res)) return null;
        return (res.data as ClosedDayDB[]).map((closedDayDB : ClosedDayDB) => ({
          ...closedDayDB,
          dzien : new Date(closedDayDB.dzien)
        }));
      }),
      catchError(() => of(null))
    );
  }

  public getZPaymentsPerson(id_person: number): Observable<ZPayment[] | null> {
    return this.http.get<Packet>(`${ this.api }zsti/payment/${id_person}`).pipe(
      map((res : Packet): ZPayment[] | null => {
        if (!this.isArray(res)) return null;
        return (res.data as ZPayment[]).map((payment : ZPayment) => ({
          ...payment,
          data_platnosci : new Date(payment.data_platnosci)
        }));
      }),
      catchError(() => of(null))
    )
  }

  public getZScansPerson(id_person: number): Observable<ZScan[] | null> {
    return this.http.get<Packet>(`${ this.api }zsti/scan/${id_person}`).pipe(
      map((res : Packet): ZScan[] | null => {
        if (!this.isArray(res)) return null;
        return (res.data as ZScan[]).map((scan : ZScan) => ({
          ...scan,
          czas : new Date(scan.czas)
        }));
      }),
      catchError(() => of(null))
    )
  }


  protected isArray(res : Packet) : boolean {
    return res.status === StatusCodes.OK && Array.isArray(res.data);
  }

  protected convertToDBDate(date : Date) : string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${ year }-${ month }-${ day }`;
  }
}
