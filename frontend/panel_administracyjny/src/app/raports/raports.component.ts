import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { GlobalInfoService, NotificationType } from '../services/global-info.service';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';
import * as xlsx from 'xlsx';
import { VariablesService } from '../services/variables.service';

@Component({
  selector : 'app-raports',
  imports : [
    ReactiveFormsModule,
    DatePipe,
    FormsModule,
    CurrencyPipe
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

  protected dataForm = new FormGroup({
    data_od : new FormControl(''),
    data_do : new FormControl(''),
  });

  protected platnosciForm = new FormGroup({
    data_od : new FormControl(''),
    data_do : new FormControl(''),
    miesiac : new FormControl('', Validators.pattern('^\\d{4}-(0[1-9]|1[0-2])$')),
  });


  constructor(
    private variables : VariablesService,
    private datePipe : DatePipe,
    private infoService : GlobalInfoService,
    protected router : Router,
  ) {
    // this.variables.waitForWebSocket(this.infoService.webSocketStatus).then(() => {
    //
    //   this.infoService.setTitle('Raporty');
    //   this.router.events.subscribe((event) => {
    //     if (!(event instanceof NavigationEnd || event instanceof NavigationSkipped) || !router.url.startsWith('raporty')) return;
    //     this.result = null;
    //     this.condensedMode = false;
    //     this.infoService.setTitle(`Raporty - ${ this.router.url.split('/')[2] ? this.router.url.split('/')[2].charAt(0).toUpperCase() + this.router.url.split('/')[2].slice(1) : 'ZSTI' }`);
    //   })
    // });
  }

  // /**
  //  * @method generateReport
  //  * @description Generuje raport na podstawie formularza i endpointu.
  //  * @param form - FormGroup zawierający dane do raportu.
  //  * @param endpoint{string} - Endpoint, do którego wysyłane jest żądanie.
  //  * @param paramName{VariableName} - Nazwa parametru, który będzie używany w żądaniu.
  //  * @param ignore_notification{boolean} - Flaga określająca, czy ignorować powiadomienia o błędach i sukcesach.
  //  * @returns {void}
  //  * @memberOf RaportsComponent
  //  */
  // TODO: Reimplement this function when backend is ready and API is defined
  // private generateReport(form : any, endpoint : string, paramName : VariableName, ignore_notification : boolean = false) : void {
  //   if (form.invalid) {
  //     this.infoService.generateNotification(NotificationType.ERROR, 'Proszę naprawić błedy w formularzu.');
  //     return;
  //   } else if (form.get('data_do')?.value < form.get('data_od')?.value) {
  //     this.infoService.generateNotification(NotificationType.ERROR, 'Data końcowa musi być późniejsza niż data początkowa.');
  //     return;
  //   }

  // let data_od = form.get('data_od')?.value;
  // let data_do = form.get('data_do')?.value;
  // if (data_od === '') data_od = null;
  // if (data_do === '') data_do = null;
  // TODO: Uncomment when backend is ready and API is implemented
  // this.database.request(endpoint, { data_od, data_do }, paramName).then((payload : any) => {
  //   if (!payload) {
  //     this.infoService.generateNotification(NotificationType.ERROR, 'Błąd podczas pobierania danych.');
  //     return;
  //   } else if (payload.length === 0) {
  //     this.infoService.generateNotification(NotificationType.WARNING, 'Brak danych do wyświetlenia.');
  //   }
  //   this.result = payload;
  //   if (!ignore_notification && payload.length > 0) {
  //     this.infoService.generateNotification(NotificationType.SUCCESS, `Raport został wygenerowany. Znaleziono ${ payload.length } ${ wynikString(payload.length) }.`);
  //   }
  // });
  // }
  //
  // protected generateObecnosciReport(ignore_notfication = false) : void {
  //   this.generateReport(this.dataForm, 'raportsZsti.checkedCard.get', 'scanList', ignore_notfication);
  // }
  //
  // protected generateKorektyReport(ignore_notfication = false) : void {
  //   this.generateReport(this.dataForm, 'raportsZsti.absence.get', 'absenceDayList', ignore_notfication);
  // }

  protected generatePlatnosciReport(ignore_notification = false) : void {
    if (this.platnosciForm.invalid) {
      this.infoService.generateNotification(NotificationType.ERROR, 'Proszę naprawić błedy w formularzu.');
      return;

    } else if (this.platnosciForm.get('data_do')?.value && this.platnosciForm.get('data_od')?.value && this.platnosciForm.get('data_do')!.value! < this.platnosciForm.get('data_od')!.value!) {
      this.infoService.generateNotification(NotificationType.ERROR, 'Data końcowa musi być późniejsza niż data początkowa.');
      return;

    } else if (this.platnosciForm.get('miesiac')?.value && !/^\d{4}-(0[1-9]|1[0-2])$/.test(this.platnosciForm.get('miesiac')?.value!)) {
      this.infoService.generateNotification(NotificationType.ERROR, 'Miesiąc musi być w formacie YYYY-MM.');
      return;
    }
    let data_od = this.platnosciForm.get('data_od')?.value;
    let data_do = this.platnosciForm.get('data_do')?.value;
    let miesiac = this.platnosciForm.get('miesiac')?.value;
    if (data_od === '') data_od = null;
    if (data_do === '') data_do = null;
    if (miesiac === '') miesiac = null;
    // TODO: Uncomment when backend is ready and API is implemented
    // this.database.request('raportsZsti.platnosci.get', { data_od, data_do, miesiac }, 'paymentList').then((payload : any) => {
    //   if (!payload) {
    //     this.infoService.generateNotification(NotificationType.ERROR, 'Błąd podczas pobierania danych.');
    //     return;
    //   } else if (payload.length === 0) {
    //     this.infoService.generateNotification(NotificationType.WARNING, 'Brak danych do wyświetlenia.');
    //   }
    //
    //   this.result = payload;
    //   if (!ignore_notification && payload.length > 0) {
    //     this.infoService.generateNotification(NotificationType.SUCCESS, `Raport został wygenerowany. Znaleziono ${ payload.length } ${ wynikString(payload.length) }.`);
    //   }
    //
    //   if (!this.result || this.result.length === 0) return;
    //   this.result.forEach((r : any) => {
    //     r.czas = r.rok + '-' + r.miesiac.padStart(2, '0');
    //   });
    // });
  }

  // protected toggleCondensedMode() : void {
  //   if (!this.condensedMode) {
  //     switch (this.router.url.split('/')[2]) {
  //       case 'korekty':
  //         this.generateKorektyReport(true)
  //         break;
  //       case 'obecnosci':
  //         this.generateObecnosciReport(true);
  //         break;
  //     }
  //   }
  //   switch (this.router.url.split('/')[2]) {
  //     case 'korekty':
  //       this.result = Object.values(
  //         this.result.reduce((acc : any, { nazwisko, imie, dzien_wypisania } : any) => {
  //           const key = `${ nazwisko }|${ imie }`;
  //           acc[key] = acc[key] || { nazwisko, imie, dni : [] };
  //           acc[key].dni.push(dzien_wypisania);
  //           return acc;
  //         }, {})
  //       );
  //       break;
  //     case 'obecnosci':
  //       this.result = Object.values(
  //         this.result.reduce((acc : any, { nazwisko, imie, czas } : any) => {
  //           const key = `${ nazwisko }|${ imie }`;
  //           acc[key] = acc[key] || { nazwisko, imie, dni : [] };
  //           const formattedDate = this.datePipe.transform(czas, 'dd-MM-yyyy HH:mm:ss');
  //           acc[key].dni.push(formattedDate);
  //           return acc;
  //         }, {})
  //       );
  //       break;
  //   }
  // }

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
        // Ustawienie wyrównania do środka dla każdej komórki
        const cellRef = xlsx.utils.encode_cell({ c : i, r : j });
        if (!ws[cellRef]) continue;
        ws[cellRef].s = ws[cellRef].s || {};
        ws[cellRef].s.alignment = { ...ws[cellRef].s.alignment, horizontal : 'center' };
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
