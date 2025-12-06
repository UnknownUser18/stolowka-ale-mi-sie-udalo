import { Injectable } from '@angular/core';
import { Packet, Types } from "@database/types";
import { map, Observable, of } from "rxjs";
import { catchError } from "rxjs/operators";

export interface ZPricingDB { // TODO : remove export
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

@Injectable({
  providedIn : 'root'
})
export class Prices extends Types {
  constructor() {
    super();
  }

  public get getPricing() : Observable<ZPricing[] | null> {
    return this.http.get<Packet>(`${ this.api }zsti/pricing`).pipe(
      map((res) => {
        if (!this.isArray(res)) return null;

        return res.data?.map((price : ZPricingDB) => {
          return {
            ...price,
            data_od : new Date(price.data_od),
            data_do : new Date(price.data_do)
          }
        }) as ZPricing[];
      }),
      catchError(() => of(null))
    );
  }
}
