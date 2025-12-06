import { Injectable, signal } from '@angular/core';
import { Packet, Types } from '../types';
import { map, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { LocalAbsenceChanges } from '../declarations/declarations';

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

@Injectable({
  providedIn : 'root'
})
export class Persons extends Types {

  constructor() {
    super();
  }

  public personZ = signal<ZPerson | null>(null);
  public localAbsenceChanges = signal(new LocalAbsenceChanges());

  private requestPersons(limit? : number) : Observable<Packet | null> {
    if (limit && (!Number.isInteger(limit) || limit < 1))
      throw new Error('Limit musi być liczbą całkowitą dodatnią.');

    let params = new HttpParams();
    if (limit)
      params = params.set('limit', limit.toString());

    return this.http.get<Packet>(`${ this.api }zsti/person`, { params }).pipe(
      map((res) => {
        return res.status === 200 ? res : null;
      }),
      catchError(() => of(null))
    );
  }

  public getZPersonsLimit(limit : number) : Observable<ZPerson[] | null> {
    return this.requestPersons(limit).pipe(
      map((res) => {
        return res ? res.data as ZPerson[] : null;
      })
    );
  }

  public getZPersons() : Observable<ZPerson[] | null> {
    return this.requestPersons().pipe(
      map((res) => {
        return res ? res.data as ZPerson[] : null;
      })
    );
  }

  public updateZPerson(person : ZPerson) : Observable<boolean> {
    return this.http.put<Packet>(`${ this.api }zsti/person/${ person.id }/update`, person).pipe(
      map((res) => {
        return res.status === 202;
      }),
      catchError(() => of(false))
    );
  }

  public selectZPerson(person : ZPerson) : void {
    this.personZ.set(person);
    this.localAbsenceChanges.set(new LocalAbsenceChanges());
  }

  public deselectPerson() : void {
    this.personZ.set(null);
    this.localAbsenceChanges.set(new LocalAbsenceChanges());
  }

  public isTeacher(person : ZPerson) : boolean {
    return person.typ_osoby_id === TypOsoby.NAUCZYCIEL;
  }

}
