import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Packet, TypesService } from './types.service';
import { map, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { isPlatformServer } from '@angular/common';

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

  constructor(@Inject(PLATFORM_ID) private platform : object) {
    super();
  }

  public getZPersons() : Observable<ZPerson[] | null> {
    return this.http.get<Packet>(`${ this.api }zsti/person`).pipe(
      map((res) => {
        return res.status === 200 ? res.data as ZPerson[] : null;
      }),
      catchError(() => of(null))
    );
  }

  public getZPerson(id : number) : Observable<ZPerson | null> {
    return this.http.get<Packet>(`${ this.api }zsti/person/${ id }`).pipe(
      map((res) => {
        return res.status === 200 ? res.data![0] as ZPerson : null;
      }),
      catchError(() => of(null)))

  }

  public selectPerson(id : number) : void {
    if (!Number.isInteger(id) || id < 1)
      throw new Error('ID osoby musi być liczbą całkowitą dodatnią.');
    if (isPlatformServer(this.platform))
      throw new Error('Nie można nawigować na serwerze.');

    this.getZPerson(id).subscribe((person : ZPerson | null) => {
      if (!person)
        throw new Error('Nie znaleziono osoby o podanym ID.');
      sessionStorage.setItem('selectedZPerson', JSON.stringify(person));
    });
  }

  public deselectPerson() : void {
    if (isPlatformServer(this.platform))
      throw new Error('Nie można nawigować na serwerze.');
    sessionStorage.removeItem('selectedZPerson');
  }
}
