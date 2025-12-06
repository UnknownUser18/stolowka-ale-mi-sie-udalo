import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { VariablesService } from '@services/variables.service';
import { GlobalInfoService, NotificationType } from '@services/global-info.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import * as xlsx from 'xlsx';

@Component({
  selector : 'app-individual-raport',
  imports : [
    ReactiveFormsModule,
    DatePipe
  ],
  templateUrl : './individual-raport.component.html',
  styleUrl : './individual-raport.component.scss',
  providers : [DatePipe]
})
export class IndividualRaport implements OnDestroy {
  private destroy$ = new Subject<void>();

  @ViewChild('table') table! : ElementRef;

  protected type : BehaviorSubject<'korekta' | 'nieobecnosci' | ''> = new BehaviorSubject<'korekta' | 'nieobecnosci' | ''>('');

  protected dataForm = new FormGroup({
    data_od : new FormControl('', Validators.pattern('^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-(\\d{4})$')),
    data_do : new FormControl('', Validators.pattern('^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-(\\d{4})$')),
  });

  constructor(
    private datePipe : DatePipe,
    private variables : VariablesService,
    private infoService : GlobalInfoService
  ) {
    // this.variables.waitForWebSocket(this.infoService.webSocketStatus).then(() => {
    //   this.infoService.activeUser.subscribe(user => {
    //     if (!user) return;
    //     this.infoService.setActiveTab('RAPORT');
    //     this.infoService.setTitle(`${ user.imie } ${ user.nazwisko } - Raport`);
    //   });
    // });
  }

  protected generateRaport() : void {
    if (this.dataForm.invalid) {
      this.infoService.generateNotification(NotificationType.ERROR, 'Proszę poprawić błędy w formularzu.');
      return;
    }
    let data_od = this.dataForm.value.data_od;
    let data_do = this.dataForm.value.data_do;
    data_od = data_od !== '' ? this.datePipe.transform(data_od, 'yyyy-MM-dd') : null;
    data_do = data_do !== '' ? this.datePipe.transform(data_do, 'yyyy-MM-dd') : null;
    let path;
    switch (this.type.value) {
      case 'korekta':
        path = 'raportsZsti.absence.getForStudent';
        break;
      case 'nieobecnosci':
        path = 'raportsZsti.checkedCard.getForStudent';
        break;
      default:
        this.infoService.generateNotification(NotificationType.ERROR, 'Proszę wybrać typ raportu.');
        return;
    }
    // this.database.request(path, { data_od : data_od, data_do : data_do, id : this.infoService.activeUser.value!.id }, 'dump').then((payload) => {
    //   this.result = payload;
    //   this.infoService.generateNotification(NotificationType.SUCCESS, `Raport został wygenerowany. Znaleziono ${ payload.length } ${ wynikString(payload.length) }.`)
    // });
  }

  protected exportRaport() : void {
    let ws : xlsx.WorkSheet = xlsx.utils.table_to_sheet(this.table.nativeElement);

    const dateString = `Wygenerowano dnia ${ (this.datePipe.transform(new Date(), "dd'-'LL'-'yyyy 'o godzinie' HH':'mm':'ss")) }.`;
    xlsx.utils.sheet_add_aoa(ws, [[null], [null], [dateString]], { origin : -1 });

    const wb : xlsx.WorkBook = xlsx.utils.book_new();
    const raportName = this.type.value || 'raport';
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

    // xlsx.writeFile(wb, `${ raportName[0].toUpperCase() }${ raportName.slice(1) } - ${ this.infoService.activeUser.value?.imie } ${ this.infoService.activeUser.value?.nazwisko } ${ new Date().toISOString().slice(0, 10) }.xlsx`);
    this.infoService.generateNotification(NotificationType.SUCCESS, 'Raport został wyeksportowany.');
  }

  public ngOnDestroy() : void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
