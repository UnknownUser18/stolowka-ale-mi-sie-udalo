import { Injectable, signal } from '@angular/core';
import { Packet, TypesService } from './types.service';
import { map, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { LocalAbsenceChanges } from './declarations.service';

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
export class PersonsService extends TypesService {

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

  public getZPerson(id : number) : Observable<ZPerson | null> {
    return this.http.get<Packet>(`${ this.api }zsti/person/${ id }`).pipe(
      map((res) => {
        return res.status === 200 ? res.data![0] as ZPerson : null;
      }),
      catchError(() => of(null)))
  }

  public updateZPersonKlasa(id_person : ZPerson["id"], klasa_name : string | null) : Observable<boolean> {
    if (id_person <= 0)
      throw new Error('Niepoprawne ID osoby.');

    return this.http.put<Packet>(`${ this.api }zsti/person/${ id_person }/class`, { klasa : klasa_name }).pipe(
      map((res) => {
        return res.status === 202;
      }),
      catchError(() => of(false))
    );
  }

  public updateZPerson(person : ZPerson) : Observable<boolean> {
    return this.http.put<Packet>(`${ this.api }zsti/person/${ person.id }`, person).pipe(
      map((res) => {
        return res.status === 202;
      }),
      catchError(() => of(false))
    );
  }

  public getKlasaID(klasa_name : string) : Observable<string | null> {
    const body = { klasa : klasa_name };

    return this.http.post<Packet>(`${ this.api }zsti/class/get-id`, body).pipe(
      map((res) => {
        return res.status === 200 ? res.data![0].id as string : null;
      }),
      catchError(() => of(null))
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
