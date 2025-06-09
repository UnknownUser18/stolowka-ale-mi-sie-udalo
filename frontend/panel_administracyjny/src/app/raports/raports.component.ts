import { Component, OnDestroy } from '@angular/core';
import { AbsenceDay, DataService, Student, WebSocketStatus } from '../data.service';
import { GlobalInfoService, NotificationType } from '../global-info.service';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector : 'app-raports',
  imports : [
    ReactiveFormsModule,
    DatePipe
  ],
  templateUrl : './raports.component.html',
  styleUrl : './raports.component.scss'
})
export class RaportsComponent implements OnDestroy {
  private destroy$ : Subject<void> = new Subject()

  protected result : any | null = null;

  protected korektyForm = new FormGroup({
    data_od : new FormControl(''),
    data_do : new FormControl(''),
  });

  constructor(
    private database : DataService,
    private infoService : GlobalInfoService,
    protected router : Router,
  ) {
    this.infoService.webSocketStatus.pipe(takeUntil(this.destroy$)).subscribe(status => {
      if (status !== WebSocketStatus.OPEN) return;
    });
  }

  protected generateKorektyReport() : void {
    if (this.korektyForm.invalid) {
      this.infoService.generateNotification(NotificationType.ERROR, 'Proszę naprawić błedy w formularzu.');
      return;
    }
    const data_od = this.korektyForm.get('data_od')?.value;
    const data_do = this.korektyForm.get('data_do')?.value;
    this.database.request('zsti.absence.getWithUser', { data_od : data_od, data_do : data_do }, 'absenceDayList').then((payload) => {
      if (!payload) {
        this.infoService.generateNotification(NotificationType.ERROR, 'Błąd podczas pobierania danych.');
        return;
      } else if (payload.length === 0) {
        this.infoService.generateNotification(NotificationType.WARNING, 'Brak danych do wyświetlenia.');
        return;
      }
      this.result = payload as unknown as (AbsenceDay & Student);
    });
  }

  public ngOnDestroy() : void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
