import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { DataService, VariableName, WebSocketStatus } from '../services/data.service';
import { GlobalInfoService, NotificationType } from '../services/global-info.service';
import { Subject, takeUntil } from 'rxjs';
import { NavigationEnd, NavigationSkipped, Router } from '@angular/router';
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
  protected readonly Array = Array;

  @ViewChild('table') table! : ElementRef;

  protected korektyForm = new FormGroup({
    data_od : new FormControl(''),
    data_do : new FormControl(''),
  });

  protected obecnosciForm = new FormGroup({
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
      this.infoService.setTitle('Raporty');
      this.router.events.subscribe((event) => {
        if (!(event instanceof NavigationEnd || event instanceof NavigationSkipped)) return;
        this.result = null;
        this.condensedMode = false;
        this.infoService.setTitle(`Raporty - ${ this.router.url.split('/')[2] ? this.router.url.split('/')[2].charAt(0).toUpperCase() + this.router.url.split('/')[2].slice(1) : 'ZSTI' }`);
      })
    });
  }

  /**
   * @method generateReport
   * @description Generuje raport na podstawie formularza i endpointu.
   * @param form - FormGroup zawierający dane do raportu.
   * @param endpoint{string} - Endpoint, do którego wysyłane jest żądanie.
   * @param paramName{VariableName} - Nazwa parametru, który będzie używany w żądaniu.
   * @param ignore_notification{boolean} - Flaga określająca, czy ignorować powiadomienia o błędach i sukcesach.
   * @returns {void}
   * @memberOf RaportsComponent
   */
  private generateReport(form : any, endpoint : string, paramName : VariableName, ignore_notification : boolean = false) : void {
    if (form.invalid) {
      this.infoService.generateNotification(NotificationType.ERROR, 'Proszę naprawić błedy w formularzu.');
      return;
    } else if (form.get('data_do')?.value < form.get('data_od')?.value) {
      this.infoService.generateNotification(NotificationType.ERROR, 'Data końcowa musi być późniejsza niż data początkowa.');
      return;
    }

    let data_od = form.get('data_od')?.value;
    let data_do = form.get('data_do')?.value;
    if (data_od === '') data_od = null;
    if (data_do === '') data_do = null;
    this.database.request(endpoint, { data_od, data_do }, paramName).then((payload : any) => {
      if (!payload) {
        this.infoService.generateNotification(NotificationType.ERROR, 'Błąd podczas pobierania danych.');
        return;
      } else if (payload.length === 0) {
        this.infoService.generateNotification(NotificationType.WARNING, 'Brak danych do wyświetlenia.');
      }
      this.result = payload;
      if (!ignore_notification && payload.length > 0) {
        this.infoService.generateNotification(NotificationType.SUCCESS, `Raport został wygenerowany. Znaleziono ${ payload.length } ${ wynikString(payload.length) }.`);
      }
    });
  }

  protected generateObecnosciReport(ignore_notfication = false) : void {
    this.generateReport(this.obecnosciForm, 'raportsZsti.checkedCard.get', 'scanList', ignore_notfication);
  }

  protected generateKorektyReport(ignore_notfication = false) : void {
    this.generateReport(this.korektyForm, 'raportsZsti.absence.get', 'absenceDayList', ignore_notfication);
  }

  protected toggleCondensedMode() : void {
    if (!this.condensedMode) {
      switch (this.router.url.split('/')[2]) {
        case 'korekty':
          this.generateKorektyReport(true)
          break;
        case 'obecnosci':
          this.generateObecnosciReport(true);
          break;
      }
    }
    switch (this.router.url.split('/')[2]) {
      case 'korekty':
        this.result = Object.values(
          this.result.reduce((acc : any, { nazwisko, imie, dzien_wypisania } : any) => {
            const key = `${ nazwisko }|${ imie }`;
            acc[key] = acc[key] || { nazwisko, imie, dni : [] };
            acc[key].dni.push(dzien_wypisania);
            return acc;
          }, {})
        );
        break;
      case 'obecnosci':
        this.result = Object.values(
          this.result.reduce((acc : any, { nazwisko, imie, czas } : any) => {
            const key = `${ nazwisko }|${ imie }`;
            acc[key] = acc[key] || { nazwisko, imie, dni : [] };
            const formattedDate = this.datePipe.transform(czas, 'dd-MM-yyyy HH:mm:ss');
            acc[key].dni.push(formattedDate);
            return acc;
          }, {})
        );
        break;
    }
  }

  protected formatDni(dni : any[], format : string) : string {
    return dni.map(day => this.datePipe.transform(day, format)).join('; ');
  }

  protected exportRaport() : void {
    let ws : xlsx.WorkSheet = xlsx.utils.table_to_sheet(this.table.nativeElement);

    const dateString = `Wygenerowano dnia ${ (this.datePipe.transform(new Date(), "dd'-'LL'-'yyyy 'o godzinie' HH':'mm':'ss")) }.`;
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

}
