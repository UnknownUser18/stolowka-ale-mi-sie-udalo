import { Injectable } from '@angular/core';
import { Packet, TypesService } from '@database/types.service';
import { ZPerson } from '@database/persons.service';
import { map, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface ZGuardian {
  id_opiekun : number,
  imie_opiekuna : string,
  nazwisko_opiekuna : string,
  nr_kierunkowy : number,
  telefon : number,
  email : string,
}

@Injectable({
  providedIn : 'root'
})
export class GuardiansService extends TypesService {

  constructor() {
    super();
  }

  public getZGuardian(id_person : ZPerson["opiekun_id"]) : Observable<ZGuardian | null> {
    if (!id_person)
      throw new Error('Osoba nie posiada przypisanego opiekuna.');
    else if (id_person <= 0)
      throw new Error('Niepoprawne ID opiekuna.');

    return this.http.get<Packet>(`${ this.api }zsti/guardian/${ id_person }`).pipe(
      map((res) => {
        return res.status === 200 ? res.data![0] as ZGuardian : null;
      }),
      catchError(() => of(null))
    );
  }

  public updateZGuardian(id_person : ZPerson["opiekun_id"], guardian : Partial<ZGuardian>) : Observable<boolean> {
    if (!id_person)
      throw new Error('Osoba nie posiada przypisanego opiekuna.');
    else if (id_person <= 0)
      throw new Error('Niepoprawne ID opiekuna.');

    const body = {
      ...guardian
    };

    return this.http.put<Packet>(`${ this.api }zsti/guardian/${ id_person }`, body).pipe(
      map((res) => {
        return res.status === 202;
      }),
      catchError(() => of(false))
    );
  }

  public getGuardianID(guardian : Partial<ZGuardian>) : Observable<number | null> {
    const body = {
      ...guardian
    };

    return this.http.post<Packet>(`${ this.api }zsti/guardian/get-id`, body).pipe(
      map((res) => {
        return res.status === 200 ? (res.data as any)[0].id_opiekun as number : null;
      }),
      catchError(() => of(null))
    );
  }
}
