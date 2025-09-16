import { Injectable } from '@angular/core';
import { Packet, StatusCodes, TypesService } from '@database/types.service';
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
        return res.status === StatusCodes.OK ? res.data![0] as ZGuardian : null;
      }),
      catchError(() => of(null))
    );
  }

  public updateZGuardian(id_person : ZPerson["opiekun_id"], guardian : ZGuardian) : Observable<ZGuardian["id_opiekun"] | null> {
    if (!id_person)
      throw new Error('Osoba nie posiada przypisanego opiekuna.');
    else if (id_person <= 0)
      throw new Error('Niepoprawne ID opiekuna.');

    const body = {
      ...guardian
    };

    return this.http.put<Packet>(`${ this.api }zsti/guardian/${ id_person }/update`, body).pipe(
      map((res) => {
        if (!this.isArray(res)) return null;
        console.log(res.data);
        return res.status === StatusCodes.Updated ? res.data![0] as ZGuardian["id_opiekun"] : null;
      }),
      catchError(() => of(null))
    );
  }
}
