import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { DataService, WebSocketStatus } from '../services/data.service';
import { GlobalInfoService, NotificationType } from '../services/global-info.service';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import * as xlsx from 'xlsx';
import { wynikString } from '../users/zsti/zsti.component';

@Component({
  selector : 'app-raports',
  imports : [
    ReactiveFormsModule,
    DatePipe,
    FormsModule
  ],
  templateUrl : './raports.component.html',
  styleUrl : './raports.component.scss',
  providers : [DatePipe]
})
export class RaportsComponent implements OnDestroy {
  private destroy$ : Subject<void> = new Subject()

  protected result : any | null = null;
  protected condensedMode : boolean = false;

  @ViewChild('table') table! : ElementRef;

  protected korektyForm = new FormGroup({
    data_od : new FormControl(''),
    data_do : new FormControl(''),
  });

  constructor(
    private datePipe : DatePipe,
    private database : DataService,
    private infoService : GlobalInfoService,
    protected router : Router,
  ) {
    this.infoService.webSocketStatus.pipe(takeUntil(this.destroy$)).subscribe(status => {
      if (status !== WebSocketStatus.OPEN) return;
    });
  }

  protected generateKorektyReport(ignore_notfication = false) : void {
    if (this.korektyForm.invalid) {
      this.infoService.generateNotification(NotificationType.ERROR, 'Proszę naprawić błedy w formularzu.');
      return;
    }
    let data_od = this.korektyForm.get('data_od')?.value;
    let data_do = this.korektyForm.get('data_do')?.value;

    if (data_od === '') data_od = null;
    if (data_do === '') data_do = null;
    this.database.request('raportsZsti.absence.get', { data_od : data_od, data_do : data_do }, 'absenceDayList').then((payload) => {
      if (!payload) {
        this.infoService.generateNotification(NotificationType.ERROR, 'Błąd podczas pobierania danych.');
        return;
      } else if (payload.length === 0) {
        this.infoService.generateNotification(NotificationType.WARNING, 'Brak danych do wyświetlenia.');
        return;
      }
      this.result = payload;
      if (!ignore_notfication) {
        this.infoService.generateNotification(NotificationType.SUCCESS, `Raport został wygenerowany. Znaleziono ${ payload.length } ${ wynikString(payload.length) }.`);
      }
    });
  }

  protected formatDni(dni : any[]) : string {
    return dni.map(day => this.datePipe.transform(day, 'shortDate')).join(', ');
  }

  protected toggleCondensedMode() : void {
    if (!this.condensedMode) {
      this.generateKorektyReport(true);
      return;
    }
    switch (this.router.url.split('/')[2]) {
      case 'korekty':

        this.result = Object.values(
          this.result.reduce((acc : any, item : any) => {
            const key = `${ item.nazwisko }|${ item.imie }`;
            if (!acc[key]) {
              acc[key] = {
                nazwisko : item.nazwisko,
                imie : item.imie,
                dni : [item.dzien_wypisania]
              };
            } else {
              acc[key].dni.push(item.dzien_wypisania);
            }
            return acc;
          }, {})
        ).map((item : any) => ({
          nazwisko : item.nazwisko,
          imie : item.imie,
          dni : item.dni
        }));
        break;
    }
  }

  protected exportRaport() : void {
    let ws : xlsx.WorkSheet = xlsx.utils.table_to_sheet(this.table.nativeElement);

    const dateString = `Wygenerowano dnia ${ new Date().toLocaleString() }`;
    xlsx.utils.sheet_add_aoa(ws, [[null], [null], [dateString]], { origin : -1 });

    const wb : xlsx.WorkBook = xlsx.utils.book_new();
    const raportName = this.router.url.split('/')[2] || 'raport';
    const wscols = [];
    const data = xlsx.utils.sheet_to_json(ws, { header : 1 }) as any[][];
    for (let i = 0 ; i < data[0].length ; ++i) {
      let maxLen = 10;
      for (let j = 0 ; j < data.length ; ++j) {
        const cell = data[j][i];
        if (cell && cell.toString().length > maxLen) {
          maxLen = cell.toString().length;
        }
      }
      if (i === 0) {
        maxLen = Math.min(maxLen, 20);
      }
      wscols.push({ width : maxLen + 2 });
    }
    ws['!cols'] = wscols;
    xlsx.utils.book_append_sheet(wb, ws, `${ raportName[0].toUpperCase() }${ raportName.slice(1) } - ZSTI`);

    xlsx.writeFile(wb, `${ raportName[0].toUpperCase() }${ raportName.slice(1) } - ZSTI ${ new Date().toISOString().slice(0, 10) }.xlsx`);
    this.infoService.generateNotification(NotificationType.SUCCESS, 'Raport został wyeksportowany.');
  }

  public ngOnDestroy() : void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected readonly Array = Array;
}
