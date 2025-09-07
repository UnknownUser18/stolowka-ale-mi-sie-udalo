import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Packet } from './database/types.service';
import { catchError } from 'rxjs/operators';
import { map, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InfoService {
  private http = inject(HttpClient);

  public readonly status = signal<boolean | undefined>(undefined);

  public getHealth() {
    return this.http.get<Packet>('/api/info/health').pipe(
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
}
