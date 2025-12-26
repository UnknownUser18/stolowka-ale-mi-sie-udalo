import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Packet } from '@database/types';
import { catchError } from 'rxjs/operators';
import { map, of } from 'rxjs';
import { environment } from "@environments/environment";

@Injectable({
  providedIn : 'root'
})
export class Info {
  private http = inject(HttpClient);

  public readonly status = signal<boolean | undefined>(undefined);
  public readonly currentDate = signal<Date>(new Date());

  public get getHealth() {
    return this.http.get<Packet>(`${ environment.apiUrl }info/health`).pipe(
      map((res) => {
        this.status.set(res.status === 200);
        return res.status === 200 ? 'OK' : null;
      }),
      catchError(() => {
        this.status.set(false);
        return of(null);
      })
    );
  }

  public setDate(date : Date) : void {
    this.currentDate.set(date);
  }
}
