import { Injectable } from '@angular/core';
import { Packet, Types } from "@database/types";
import { ZPerson } from "@database/persons/persons";
import { map, Observable, of } from "rxjs";
import { catchError } from "rxjs/operators";

interface ZCardDB {
  id : number;
  id_ucznia : number;
  key_card : string; // bigint unsigned
  data_wydania : string;
  ostatnie_uzycie : string;
}

export interface ZCard {
  id : number;
  id_ucznia : number;
  key_card : number; // bigint unsigned
  data_wydania : Date;
  ostatnie_uzycie : Date;
}

@Injectable({
  providedIn : 'root'
})
export class Cards extends Types {
  constructor() {
    super();
  }

  public getZCard(id : ZPerson['id']) : Observable<ZCard | null> {
    return this.http.get<Packet>(`${ this.api }zsti/card/${ id }`).pipe(
      map((res => {
        if (!this.isArray(res)) return null;

        const data = res.data![0] as ZCardDB;

        return {
          ...data,
          key_card : Number(data.key_card),
          data_wydania : new Date(data.data_wydania),
          ostatnie_uzycie : new Date(data.ostatnie_uzycie),
        }
      })),
      catchError(() => of(null))
    );
  }

  public deleteZCard(id : ZCard['id']) : Observable<boolean> {
    return this.http.delete<Packet>(`${ this.api }zsti/card/${ id }/delete`).pipe(
      map((res) => {
        if (res.status !== 200) {
          console.error('Nie udało się usunąć karty.', res.statusMessage);
          return false;
        }
        return true;
      }),
      catchError(() => of(false))
    );
  }

  public addZCard(card : Omit<ZCard, 'id' | 'ostatnie_uzycie'>) : Observable<number | false> {
    return this.http.post<Packet>(`${ this.api }zsti/card/add`, {
      id_ucznia : card.id_ucznia,
      key_card : card.key_card,
      data_wydania : this.convertToDBDate(card.data_wydania),
    }).pipe(
      map((res) => {
        if (res.status !== 201) {
          console.error('Nie udało się dodać karty.', res.statusMessage);
          return false;
        }
        return (res.data as any).insertId as number;
      }),
      catchError(() => of(<false>false))
    )
  }
}
