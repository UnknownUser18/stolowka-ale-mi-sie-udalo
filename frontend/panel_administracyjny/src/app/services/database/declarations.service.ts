import { Injectable } from '@angular/core';
import { Packet, TypesService } from './types.service';
import { map, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

type Bit = '0' | '1';
type DniCode = `${ Bit }${ Bit }${ Bit }${ Bit }${ Bit }`;

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

interface ZPricingDB {
  id : number;
  data_od : string;
  data_do : string;
  cena : number;
}

export interface ZPricing {
  id : number;
  data_od : Date;
  data_do : Date;
  cena : number;
}

export class LocalAbsenceChanges {
  public added : Date[];
  public removed : Date[];

  constructor() {
    this.added = [];
    this.removed = [];
  }

  public isEmpty() : boolean {
    return this.added.length === 0 && this.removed.length === 0;
  }

  public pushAdded(date : Date) : void {
    if (!this.added.find(d => d.getTime() === date.getTime())) {
      this.added.push(date);
    }
    this.removed = this.removed.filter(d => d.getTime() !== date.getTime());
  }

  public pushRemoved(date : Date) : void {
    if (!this.removed.find(d => d.getTime() === date.getTime())) {
      this.removed.push(date);
    }
    this.added = this.added.filter(d => d.getTime() !== date.getTime());
  }

  public removeAdded(date : Date) : void {
    this.added = this.added.filter(d => d.getTime() !== date.getTime());
  }

  public removeRemoved(date : Date) : void {
    this.removed = this.removed.filter(d => d.getTime() !== date.getTime());
  }

  public findAdded(date : Date) : boolean {
    return !!this.added.find(d => d.getTime() === date.getTime());
  }

  public findRemoved(date : Date) : boolean {
    return !!this.removed.find(d => d.getTime() === date.getTime());
  }
}

@Injectable({
  providedIn : 'root'
})
export class DeclarationsService extends TypesService {

  constructor() {
    super();
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

  public addZAbsenceDay(id_person : number, date : Date) : Observable<boolean> {
    return this.http.post<Packet>(`${ this.api }zsti/absence/${ id_person }/add`, { dzien_wypisania : this.convertToDBDate(date) }).pipe(
      map((res) => {
        if (res.status !== 201) {
          console.error(`Error adding absence day: ${ res.statusMessage }`);
          return false;
        }
        return true;
      }),
      catchError(() => of(false))
    );
  }

  public removeZAbsenceDay(id_person : number, date : Date) : Observable<boolean> {
    return this.http.delete<Packet>(`${ this.api }zsti/absence/${ id_person }/delete`, { body : { dzien_wypisania : this.convertToDBDate(date) } }).pipe(
      map((res) => {
        if (res.status !== 200) {
          console.error(`Error removing absence day: ${ res.statusMessage }`);
          return false;
        }
        return true;
      }),
      catchError(() => of(false))
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

  public deleteClosedDay(id : number) : Observable<boolean | null> {
    return this.http.delete<Packet>(`${ this.api }info/closed-days/delete/${ id }`).pipe(
      map((res) => {
        if (res.status !== 200) {
          console.error(`Error removing closed day: ${ res.statusMessage }`);
          return false;
        }
        return true;
      }),
      catchError(() => of(false))
    )
  }

  public addClosedDay(date : Date) : Observable<boolean | null> {
    console.log(`${ this.api }info/closed-days/add`, this.convertToDBDate(date), date)
    return this.http.post<Packet>(`${ this.api }info/closed-days/add?date=${ this.convertToDBDate(date) }`, { date : this.convertToDBDate(date) }).pipe(
      map((res) => {
        if (res.status !== 201) {
          console.error(`Error adding closed day: ${ res.statusMessage }`);
          return false;
        }
        return true;
      }),
      catchError(() => of(false))
    )

  }

  public getPricing() : Observable<ZPricing[] | null> {
    return this.http.get<Packet>(`${ this.api }zsti/pricing`).pipe(
      map((res : Packet) => {
        if (!this.isArray(res)) return null;
        return (res.data as ZPricingDB[]).map((pricingDB : ZPricingDB) : ZPricing => ({
          ...pricingDB,
          data_od : new Date(pricingDB.data_od),
          data_do : new Date(pricingDB.data_do)
        }));
      }),
      catchError(() => of(null))
    )
  }

  public addPricing(date_start : Date, date_end : Date, price : number) : Observable<boolean | null> {
    return this.http.post<Packet>(`${ this.api }zsti/pricing/add`, { date_start : this.convertToDBDate(date_start), date_end : this.convertToDBDate(date_end), price }).pipe(
      map((res) => {
        if (res.status !== 201) {
          console.error(`Error adding pricing: ${ res.statusMessage }`);
          return false;
        }
        return true;
      }),
      catchError(() => of(false))
    )

  }

  public deletePricing(id : number) : Observable<boolean | null> {
    return this.http.delete<Packet>(`${ this.api }zsti/pricing/delete/${ id }`).pipe(
      map((res) => {
        if (res.status !== 200) {
          console.error(`Error removing pricing: ${ res.statusMessage }`);
          return false;
        }
        return true;
      }),
      catchError(() => of(false))
    )
  }

  public updatePricing(id : number, date_start : Date, date_end : Date, price : number) : Observable<boolean | null> {
    console.log(`${ this.api }zsti/pricing/update/${ id }`, { body : { date_start : this.convertToDBDate(date_start), date_end : this.convertToDBDate(date_end), price } })
    return this.http.put<Packet>(`${ this.api }zsti/pricing/update/${ id }`, { date_start : this.convertToDBDate(date_start), date_end : this.convertToDBDate(date_end), price }).pipe(
      map((res) => {
        if (res.status !== 200) {
          console.error(`Error updating pricing: ${ res.statusMessage }`);
          return false;
        }
        return true;
      }),
      catchError(() => of(false))
    )
  }

  public checkPricing(id : number, date_start : Date, date_end : Date) : Observable<number | null> {
    return this.http.get<Packet>(`${ this.api }zsti/pricing/not-in-dates/${ id }?date_start=${ this.convertToDBDate(date_start) }&date_end=${ this.convertToDBDate(date_end) }`).pipe(
      map((res) => {
        if (res.status !== 200) {
          console.error(`Error adding closed day: ${ res.statusMessage }`);
          return null;
        }
        console.log((res.data as any[])[0].cnt as number)
        return ((res.data as any[])[0].cnt as number);
      }),
      catchError(() => of(null))
    )
  }

  public updateZDeclaration(declaration : ZDeclaration) : Observable<boolean> {
    return this.http.put<Packet>(`${ this.api }zsti/declaration/${ declaration.id }/update`, {
      data_od : this.convertToDBDate(declaration.data_od),
      data_do : this.convertToDBDate(declaration.data_do),
      dni : declaration.dni
    }).pipe(
      map((res) => {
        if (res.status !== 202) {
          console.error(`Error updating declaration: ${ res.statusMessage }`);
          return false;
        }
        return true;
      }),
      catchError(() => of(false))
    );
  }

  public deleteZDeclaration(id : number) : Observable<boolean> {
    return this.http.delete<Packet>(`${ this.api }zsti/declaration/${ id }/delete`).pipe(
      map((res) => {
        if (res.status !== 200) {
          console.error(`Error removing declaration: ${ res.statusMessage }`);
          return false;
        }
        return true;
      }),
      catchError(() => of(false))
    );
  }

  public addZDeclaration(declaration : Omit<ZDeclaration, 'id'>) : Observable<number | false> {
    return this.http.post<Packet>(`${ this.api }zsti/declaration/add`, {
      id_osoby : declaration.id_osoby,
      data_od : this.convertToDBDate(declaration.data_od),
      data_do : this.convertToDBDate(declaration.data_do),
      dni : declaration.dni
    }).pipe(
      map((res) => {
        if (res.status !== 201) {
          console.error(`Error adding declaration: ${ res.statusMessage }`);
          return false;
        }
        return (res.data as any).insertId as number;
      }),
      catchError(() => of(<false>false))
    );
  }
}
