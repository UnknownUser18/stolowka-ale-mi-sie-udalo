import { Injectable } from '@angular/core';
import { Packet, TypesService } from "@database/types.service";
import { ZPerson } from "@database/persons.service";
import { map, Observable, of } from "rxjs";
import { catchError } from "rxjs/operators";

export interface ZPayment {
  id : number,
  id_ucznia : number,
  platnosc : number,
  data_platnosci : Date,
  miesiac : number,
  rok : number,
  opis : string,
}

interface ZPaymentDB {
  id : number,
  id_ucznia : number,
  platnosc : number,
  data_platnosci : string,
  miesiac : number,
  rok : number,
  opis : string,
}

@Injectable({
  providedIn : 'root'
})
export class PaymentsService extends TypesService {

  constructor() {
    super()
  }

  public getZPayments(id : ZPerson['id']) {
    if (!id || id <= 0) throw new Error('Niepoprawne ID osoby.');

    return this.http.get<Packet>(`${ this.api }zsti/payment/${ id }`).pipe(
      map((res) => {
        if (!this.isArray(res)) return null;
        return (res.data as ZPaymentDB[]).map((payment) => ({
          ...payment,
          data_platnosci : new Date(payment.data_platnosci)
        }) as ZPayment)
      }),
      catchError(() => of(null))
    );
  }

  public updateZPayment(payment : ZPayment) : Observable<boolean> {
    const date = this.convertToDBDate(payment.data_platnosci);

    return this.http.put<Packet>(`${ this.api }zsti/payment/${ payment.id }/update`, { ...payment, data_platnosci : date }).pipe(
      map((res) => {
        if (res.status !== 202) {
          console.error('Nie udało się zaktualizować płatności.', res.statusMessage);
          return false;
        }
        return true;
      }),
      catchError(() => of(false))
    )
  }

  public deleteZPayment(id : ZPayment['id']) : Observable<boolean> {
    return this.http.delete<Packet>(`${ this.api }zsti/payment/${ id }/delete`).pipe(
      map((res) => {
        if (res.status !== 200) {
          console.error('Nie udało się usunąć płatności.', res.statusMessage);
          return false;
        }
        return true;
      }),
      catchError(() => of(false))
    )
  }

  public addZPayment(payment : Omit<ZPayment, 'id'>) : Observable<number | false> {
    return this.http.post<Packet>(`${ this.api }zsti/payment/add`, {
      id_osoby: payment.id_ucznia,
      platnosc: payment.platnosc,
      data_platnosci: this.convertToDBDate(payment.data_platnosci),
      miesiac: payment.miesiac,
      rok: payment.rok,
      opis: payment.opis,
    }).pipe(
      map((res) => {
        if (res.status !== 201) {
          console.error('Nie udało się dodać płatności.', res.statusMessage);
          return false;
        }
        return (res.data as any).insertId as number;
      }),
      catchError(() => of(<false>false))

    )
  }
}
