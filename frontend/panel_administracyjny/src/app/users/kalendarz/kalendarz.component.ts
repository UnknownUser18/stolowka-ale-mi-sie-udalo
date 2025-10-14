import { Component, effect, signal } from '@angular/core';
import { DateChangerComponent } from './date-changer/date-changer.component';
import { DatePipe } from '@angular/common';
import { InfoService } from '@services/info.service';
import { ClosedDay, DeclarationsService, LocalAbsenceChanges, ZAbsenceDay, ZDeclaration } from '@database/declarations.service';
import { PersonsService } from '@database/persons.service';
import { NotificationsService } from '@services/notifications.service';
import { InDeclarationPipe } from '@pipes/in-declaration.pipe';
import { IsAbsencePipe } from '@pipes/is-absence.pipe';
import { IsWeekendPipe } from '@pipes/is-weekend.pipe';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCheck, faXmark, faPaperPlane, faArrowsRotate, faUpRightAndDownLeftFromCenter } from '@fortawesome/free-solid-svg-icons';
import { TooltipComponent } from '@tooltips/tooltip/tooltip.component';
import { TooltipDelayTriggerDirective } from '@tooltips/tooltip-delay-trigger.directive';
import { IsEntireRowSelectedPipe } from '@pipes/is-entire-row-selected.pipe';
import { forkJoin, firstValueFrom } from 'rxjs';
import { IsClosedPipe } from '@pipes/is-closed.pipe';
import { DialogComponent } from '@tooltips/dialog/dialog.component';
import { DialogTriggerDirective } from '@tooltips/dialog-trigger.directive';

type notificationFrom = 'declarations' | 'absences' | 'closedDays' | null;

@Component({
  selector : 'app-kalendarz',
  imports : [
    DateChangerComponent,
    DatePipe,
    InDeclarationPipe,
    IsAbsencePipe,
    IsWeekendPipe,
    FaIconComponent,
    TooltipComponent,
    TooltipDelayTriggerDirective,
    IsEntireRowSelectedPipe,
    IsClosedPipe,
    DialogComponent,
    DialogTriggerDirective,
  ],
  templateUrl : './kalendarz.component.html',
  styleUrl : './kalendarz.component.scss'
})
export class KalendarzComponent {
  private notification : notificationFrom = null;

  protected absenceDays : ZAbsenceDay[] | null | undefined;
  protected declarationZ : ZDeclaration[] | null | undefined;
  protected closedDays : ClosedDay[] | null | undefined;

  protected weeks : { days : (Date | null)[] }[] = [];

  protected readonly isSending = signal<boolean>(false);
  protected readonly isRefreshing = signal<boolean>(false);

  protected readonly faPaperPlane = faPaperPlane;
  protected readonly faCheck = faCheck;
  protected readonly faXmark = faXmark;
  protected readonly faArrowsRotate = faArrowsRotate;
  protected readonly faUpRightAndDownLeftFromCenter = faUpRightAndDownLeftFromCenter;

  constructor(
    private infoS : InfoService,
    private declarationS : DeclarationsService,
    private notificationS : NotificationsService,
    protected personS : PersonsService
  ) {

    effect(() => {
      this.personS.personZ();
      this.getData().then();
    });

    effect(() => {
      this.infoS.currentDate();
      this.initCalendar();
    });
  }

  private isDayInDeclaration(day : Date) : boolean {
    if (!this.declarationZ) return false;

    return this.declarationZ.some(declaration => {
      const day_date = day.getDay();
      if (day_date === 0 || day_date === 6) return false;

      const bit = declaration.dni.charAt(day_date - 1);
      if (bit !== '1') return false;

      return day >= declaration.data_od && day <= declaration.data_do;
    });
  }

  private async getDeclarations(id : number) : Promise<void> {
    const declarations = await firstValueFrom(this.declarationS.getZDeclarationsPerson(id));
    if (!declarations && !this.notification)
      this.notification = 'declarations';
    else if (declarations?.length === 0)
      this.notificationS.createWarningNotification('Nie znaleziono deklaracji dla tego użytkownika.', 5);
    this.declarationZ = declarations;
  }

  private async getZAbsenceDays(id : number) : Promise<void> {
    const absenceDays = await firstValueFrom(this.declarationS.getZAbsenceDaysPerson(id));
    if (!absenceDays && !this.notification)
      this.notification = 'absences';
    this.absenceDays = absenceDays;
  }

  private async getClosedDays() : Promise<void> {
    const closedDays = await firstValueFrom(this.declarationS.getClosedDays);
    if (!closedDays && !this.notification)
      this.notification = 'closedDays';
    this.closedDays = closedDays;
  }

  private get getWeekOffset() {
    const date = this.infoS.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDayOfWeek = new Date(year, month, 1).getDay();
    return firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  }

  private get getWeeks() {
    const date = this.infoS.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = this.getWeekOffset;

    return Math.ceil((daysInMonth + offset) / 7);
  }

  private initCalendar() : void {
    if (!this.infoS.currentDate() || !this.personS.personZ()) return;
    this.generateWeeks();
  }

  private generateWeeks() : void {
    this.weeks = [];
    const weeksCount = this.getWeeks;
    for (let i = 0 ; i < weeksCount ; i++) {
      this.weeks.push({ days : this.getDaysInWeek(i) });
    }
  }

  private isDaySelected(date : Date) : boolean {
    const isLocallyAdded = this.personS.localAbsenceChanges().findAdded(date)
    const isInDatabase = !!this.absenceDays?.some(d => d.dzien_wypisania.toDateString() === date.toDateString());
    const isLocallyRemoved = this.personS.localAbsenceChanges().findRemoved(date);
    return isLocallyAdded || (isInDatabase && !isLocallyRemoved);
  }

  protected removeAbsence(date : Date) : void {
    const localChanges = this.personS.localAbsenceChanges();
    const isInLocalAdded = localChanges.findAdded(date);
    const isInLocalRemoved = localChanges.findRemoved(date);

    if (isInLocalAdded)
      localChanges.removeAdded(date);
    else if (!isInLocalRemoved)
      localChanges.pushRemoved(date);

    this.personS.localAbsenceChanges.set(Object.assign(new LocalAbsenceChanges(), localChanges));
  }

  protected async getData() {
    const id = this.personS.personZ()?.id;
    if (!id) {
      this.notificationS.createErrorNotification('Nie można znaleźć użytkownika.', 5, 'To nie powinno się wydarzyć. Jeśli problem będzie się powtarzał, skontaktuj się z administratorem.');
      return;
    }
    this.isRefreshing.set(true);

    await this.getDeclarations(id);
    await this.getZAbsenceDays(id);
    await this.getClosedDays();

    if (!this.notification) {
      this.notificationS.createSuccessNotification('Pomyślnie załadowano dane.', 3);
    } else {
      let detailedMessage : string;
      switch (this.notification) {
        case 'declarations':
          detailedMessage = 'Nie udało się pobrać deklaracji z serwera.';
          break;
        case 'absences':
          detailedMessage = 'Nie udało się pobrać dni nieobecności z serwera.';
          break;
        case 'closedDays':
          detailedMessage = 'Nie udało się pobrać dni zamkniętych z serwera.';
          break;
        default:
          detailedMessage = 'Nieznany błąd.';
      }
      this.notificationS.createErrorNotification('Wystąpił błąd podczas pobierania danych.', 10, detailedMessage);
    }
    this.isRefreshing.set(false);
  }

  protected getDaysInWeek(weekIndex : number) : (Date | null)[] {
    const date = this.infoS.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = this.getWeekOffset;

    const days : (Date | null)[] = [];
    for (let i = 0 ; i < 7 ; i++) {
      const dayOfMonth = weekIndex * 7 + i - offset + 1;
      if (dayOfMonth > 0 && dayOfMonth <= daysInMonth) {
        days.push(new Date(year, month, dayOfMonth));
      } else {
        days.push(null);
      }
    }
    return days;
  }

  protected selectRow(week_number : number) {
    const days = this.getDaysInWeek(week_number);
    days.forEach((day) => {
      if (!day || !this.isDayInDeclaration(day)) return;
      this.toggleSelect(day);
    })
  }

  protected forceSelectRow(week_number : number) {
    const days = this.getDaysInWeek(week_number);
    let selectedDays : Date[] = [];
    let unselectedDays : Date[] = [];

    days.forEach((day) => {
      if (!day || !this.isDayInDeclaration(day)) return;
      if (this.isDaySelected(day)) selectedDays.push(day);
      else unselectedDays.push(day);
    });

    if (selectedDays.length > unselectedDays.length)
      selectedDays.forEach(day => this.toggleSelect(day));
    else
      unselectedDays.forEach(day => this.toggleSelect(day));
  }

  protected toggleSelect(day : Date) {
    const localAdded = this.personS.localAbsenceChanges();
    const isAbsence = !!this.absenceDays?.some(d => d.dzien_wypisania.toDateString() === day.toDateString());
    const isClosed = !!this.closedDays?.some(d => d.dzien.toDateString() === day.toDateString());
    if (!this.isDayInDeclaration(day) || isClosed) return;

    if (!isAbsence) {
      const isDay = localAdded.findAdded(day);
      isDay ? localAdded.removeAdded(day) : localAdded.pushAdded(day);
    } else {
      const isDay = localAdded.findRemoved(day);
      isDay ? localAdded.removeRemoved(day) : localAdded.pushRemoved(day);
    }

    this.personS.localAbsenceChanges.set(Object.assign(new LocalAbsenceChanges(), localAdded));

    // Update the week's days array to trigger change detection
    const week = this.weeks.find(week =>
      week.days.some(d => d && day && d.toDateString() === day.toDateString())
    );
    if (week)
      week.days = [...week.days];
  }

  protected selectColumn(dayOfWeek : number) {
    for (let week of this.weeks) {
      const day = week.days[dayOfWeek];
      if (!day || !this.isDayInDeclaration(day)) continue;
      this.toggleSelect(day);
    }
  }

  protected forceSelectColumn(dayOfWeek : number) {
    let selectedDays : Date[] = [];
    let unselectedDays : Date[] = [];

    for (let week of this.weeks) {
      const day = week.days[dayOfWeek];
      if (!day || !this.isDayInDeclaration(day)) continue;
      if (this.isDaySelected(day)) selectedDays.push(day);
      else unselectedDays.push(day);
    }

    if (selectedDays.length > unselectedDays.length)
      selectedDays.forEach(day => this.toggleSelect(day));
    else
      unselectedDays.forEach(day => this.toggleSelect(day));
  }

  protected sendAbsence() {
    this.isSending.set(true);
    const localChanges = this.personS.localAbsenceChanges();

    if (localChanges.isEmpty()) {
      this.notificationS.createInfoNotification('Brak zmian do zapisania.', 3);
      this.isSending.set(false);
      return;
    }

    const id = this.personS.personZ()?.id;

    if (!id) {
      this.notificationS.createErrorNotification('Nie można znaleźć użytkownika.', 5, 'To nie powinno się wydarzyć. Jeśli problem będzie się powtarzał, skontaktuj się z administratorem.');
      this.isSending.set(false);
      return;
    }

    const addRequests = localChanges.added.map(date => this.declarationS.addZAbsenceDay(id, date));
    const removeRequests = localChanges.removed.map(date => this.declarationS.removeZAbsenceDay(id, date));

    forkJoin([...addRequests, ...removeRequests]).subscribe(results => {
      this.isSending.set(false);
      const failedRequests = results.filter(res => !res);
      if (failedRequests.length > 0) {
        this.notificationS.createErrorNotification('Wystąpił błąd podczas zapisywania zmian.', 10, `Nie udało się zapisać ${ failedRequests.length } z ${ results.length } zmian.`);
      } else {
        this.notificationS.createSuccessNotification('Pomyślnie zapisano zmiany.', 5);
        this.personS.localAbsenceChanges.set(new LocalAbsenceChanges());
        this.getData().then();
      }
    });
  }

}
