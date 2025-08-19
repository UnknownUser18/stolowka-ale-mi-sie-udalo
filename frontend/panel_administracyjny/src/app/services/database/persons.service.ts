import { Injectable } from '@angular/core';
import { TypesService,  } from './types.service';

export enum TypOsoby {
  UCZEN = 1,
  NAUCZYCIEL = 2,
}

export interface ZPerson {
  id : number,
  typ_osoby_id : TypOsoby,
  imie : string,
  nazwisko : string,
  klasa : string,
  uczeszcza : boolean,
  miasto : boolean,
  opiekun_id : number | null
}


@Injectable({
  providedIn : 'root'
})
export class PersonsService extends TypesService {

  public getZPersons() : ZPerson[] | null {
    try {
      const res : any = this.http.get(`${ this.api }zsti/person`).subscribe();
      return res.status === 200 ? res.data as ZPerson[] : null;
    } catch (error) {
      console.error('Error fetching persons:', error);
      return null;
    }
  }
}
