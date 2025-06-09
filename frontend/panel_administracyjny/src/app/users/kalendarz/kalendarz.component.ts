import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, Renderer2, ViewChild} from '@angular/core';
import {DateChangerComponent} from './date-changer/date-changer.component';
import {GlobalInfoService, NotificationType} from '../../global-info.service';
import {AbsenceDay, CanceledDay, DataService, Declaration, Student, VariableName, WebSocketStatus} from '../../data.service';
import {Subject} from 'rxjs';
import {TransitionService} from '../../transition.service';

enum AbsenceWindowStatus {
  CLOSED,
  DODANE,
  USUNIETE
}

@Component({
  selector: 'app-kalendarz',
  imports: [
    DateChangerComponent
  ],
  templateUrl: './kalendarz.component.html',
  styleUrl: './kalendarz.component.scss'
})
export class KalendarzComponent implements AfterViewInit, OnDestroy {
  private absenceDays: AbsenceDay[] = [];
  private declarations: Declaration[] | undefined;
  private closedDays: CanceledDay[] = [];
  private destroy$ = new Subject<void>();

  protected user: Student | undefined;
  protected openStatus: AbsenceWindowStatus = AbsenceWindowStatus.CLOSED;
  protected readonly AbsenceWindowStatus = AbsenceWindowStatus;
  protected readonly Math = Math;

  @ViewChild('section') section!: ElementRef;
  @ViewChild('absencesMenu') absencesMenu!: ElementRef;

  constructor(
    private database: DataService,
    private renderer: Renderer2,
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
    private transtion: TransitionService,
    protected infoService: GlobalInfoService
  ) {
  }

  /** @method addDay
   * @description Dodaje dzień do listy dni zaznaczonych.
   * @param day - Data do dodania.
   * @param absence - Czy dzień jest nieobecnością?
   * @returns {void}
   * @memberof KalendarzComponent
   */
  private addDay(day: Date, absence: boolean): void {
    if (!day) return;
    if (!absence) {
      const dayIndex = this.infoService.selectedDays.added.findIndex(d => d.getTime() === day.getTime());
      dayIndex === -1
        ? this.infoService.selectedDays.added.push(day)
        : this.infoService.selectedDays.added.splice(dayIndex, 1);
    } else {
      const dayIndex = this.infoService.selectedDays.removed.findIndex(d => d.getTime() === day.getTime());
      dayIndex === -1
        ? this.infoService.selectedDays.removed.push(day)
        : this.infoService.selectedDays.removed.splice(dayIndex, 1);
    }
  }

  /** @method initComponent
   * @description Inicjalizuje komponent, pobierając dane z bazy danych.
   * @param method{string} - Nazwa metody do wywołania w bazie danych.
   * @param responseVar{VariableName} - Nazwa zmiennej, do której przypisane będą dane z bazy danych.
   * @param variable{string} - Nazwa zmiennej, do której przypisane będą dane z bazy danych.
   * @param params{boolean} - Czy metoda wymaga parametrów?
   * @returns {Promise<boolean>} - Promise, która rozwiązuje się po zakończeniu inicjalizacji komponentu.
   * @throws {Error} - Jeśli nie można znaleźć zmiennej.
   * @memberof KalendarzComponent
   */
  private async initComponent(method: string, responseVar: VariableName, variable: string, params: boolean = false): Promise<boolean> {
    if (!this.user) return false;
    try {
      if (params) {
        (this as any)[variable] = await this.database.request(method, {id: this.user.id}, responseVar);
      } else {
        (this as any)[variable] = await this.database.request(method, {}, responseVar);
      }
    } catch (error) {
      throw new Error(`Nie można znaleźć ${variable}`);
    }
    return (this as any)[variable] !== undefined;
  }

  /** @method initializeCalendar
   * @description Inicjalizuje cały kalendarz, włącznie z logiką deklaracji, dni nieczynnych, nieobecności oraz zaznaczania.
   * @returns {void}
   * @memberof KalendarzComponent
   * @throws {Error} - Jeśli nie można zainicjalizować kalendarza, deklaracji itp. (każde sprawdza osobno).
   */
  private async initializeCalendar(): Promise<void> {
    try {
      if (!await this.initCalendar()) return;
      // Inicjacja po kolei deklaracji, dni nieczynnych i dni nieobecności
      if (!await this.initComponent('zsti.declaration.getById', 'declaration', 'declarations', true)) return;
      if (!await this.initComponent('global.canceledDay.get', 'closedDays', 'closedDays')) return;
      if (!await this.initComponent('zsti.absence.getById', 'absenceDayList', 'absenceDays', true)) return;
      let declarations: Declaration[] = this.declarations!;
      let days: NodeListOf<HTMLButtonElement> = this.section.nativeElement.querySelectorAll('.day')!;
      days.forEach((d: HTMLButtonElement): void => {
        const date: string = d.getAttribute('date')!;
        const day: Date = new Date(date);
        if (day.getDay() === 0 || day.getDay() === 6) {
          d.disabled = true;
          d.classList.add('weekend');
          return;
        }
        const absenceDay = this.absenceDays.find(a => this.formatDate(new Date(a.dzien_wypisania)) === this.formatDate(day));
        if (absenceDay) {
          d.classList.add('absence');
          if (!this.infoService.selectedDays.removed.find(d => this.formatDate(d) === this.formatDate(day))) d.classList.add('selected');
        } else if (this.infoService.selectedDays.added.find(d => this.formatDate(d) === this.formatDate(day))) {
          d.classList.add('selected');
        }
        const declaration = declarations.find(d => this.formatDate(new Date(d.data_od)) <= this.formatDate(day) && this.formatDate(new Date(d.data_do)) >= this.formatDate(day));
        const canceledDay = this.closedDays.find(c => this.formatDate(new Date(c.dzien)) === this.formatDate(day));
        console.log(declarations)
        if (!(declaration && !d.disabled && declaration?.dni.split('')[day.getDay() - 1] === '1')) {
          d.classList.add('no-declaration');
        } else if (canceledDay) {
          d.classList.add('canceled');
          d.disabled = true;
        } else {
          d.addEventListener('click', (): void => {
            this.addDay(day, d.classList.contains('absence'));
            d.classList.toggle('selected');
            this.checkZaznaczanie(Array.from(d.parentElement!.parentElement!.children).indexOf(d.parentElement!) - 1);
          });
        }
      });
      this.initZaznaczanie().then();
    } catch (err) {
      console.error(err);
    }
  }

  /** @method initCalendar
   * @description Inicjalizuje kalendarz, tworząc widok miesięczny bez uwzględnienia deklaracji użytkownika.
   * @returns {Promise<boolean>} - Promise, która rozwiązuje się po zakończeniu inicjalizacji kalendarza, pozwalając na dołączenie dodatkowej logiki (np. deklaracji).
   * @throws {Error} - Jeśli nie można znaleźć elementu do kalendarza.
   * @memberof KalendarzComponent
   **/
  private async initCalendar(): Promise<boolean> {
    const main: HTMLElement = this.section.nativeElement.querySelector('main');
    if (!main) throw new Error('Nie można znaleźć elementu do kalendarza');
    if (main.childNodes.length > 1) {
      for (const child of Array.from(main.childNodes).slice(1)) {
        this.renderer.removeChild(main, child);
      }
    }
    const currentDate: Date = this.infoService.activeMonth.getValue()!;
    const daysInMonth: number = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

    let firstDay: number = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    firstDay = (firstDay === 0) ? 6 : firstDay - 1;

    // Obliczanie liczby tygodni w miesiącu
    const weeks_in_month: number = Math.ceil((daysInMonth + firstDay) / 7);

    // Tworzenie tygodni
    for (let i: number = 0; i < weeks_in_month; i++) {
      let week: HTMLElement = this.renderer.createElement('div');
      this.renderer.addClass(week, 'week');
      this.renderer.appendChild(main, week);
    }

    // Tworzenie dni
    for (let i: number = 0; i < daysInMonth; i++) {
      if (i === 0) {
        let firstWeek: HTMLElement = main.querySelector('.week') as HTMLElement;
        for (let j: number = 0; j < firstDay; j++) {
          let emptyDay: HTMLElement = this.renderer.createElement('div');
          this.renderer.addClass(emptyDay, 'empty-day');
          this.renderer.appendChild(firstWeek, emptyDay);
        }
      }
      let day: HTMLButtonElement = this.renderer.createElement('button');
      this.renderer.addClass(day, 'day');
      this.renderer.setProperty(day, 'innerText', `${i + 1}`);
      this.renderer.setAttribute(day, 'date', this.formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1)));

      let weekIndex: number = Math.floor((i + firstDay) / 7);
      let week: HTMLElement = main.querySelectorAll('.week')[weekIndex] as HTMLElement;
      this.renderer.appendChild(week, day);
    }
    return true;
  }

  /** @method initZaznaczanie
   * @description Inicjalizuje sekcję zaznaczania dni w kalendarzu.
   * @returns {Promise<boolean>} - Promise, która rozwiązuje się po zakończeniu inicjalizacji sekcji zaznaczania.
   * @throws {Error} - Jeśli nie można znaleźć sekcji zaznaczania.
   * @memberof KalendarzComponent
   */
  private async initZaznaczanie(): Promise<boolean> {
    const selectSection = this.section.nativeElement.querySelector('.select-buttons')!;
    if (!selectSection) throw new Error('Nie można znaleźć sekcji zaznaczania');
    while (selectSection.firstChild) {
      this.renderer.removeChild(selectSection, selectSection.firstChild);
    }
    const weeks = this.section.nativeElement.querySelectorAll('.week');
    weeks.forEach((week: HTMLElement) => {
      const button = this.renderer.createElement('button');
      const icon = this.renderer.createElement('i');
      icon.classList.add('fa-solid');
      const days = Array.from(week.querySelectorAll('.day')) as HTMLButtonElement[];
      const activeDays = days.filter(d => !d.classList.contains('no-declaration') && !d.disabled);
      const selectableDays = days.filter(d => !d.classList.contains('weekend') && !d.classList.contains('no-declaration'));
      if (activeDays.length === 0) {
        button.disabled = true;
        icon.classList.add('fa-minus');
      } else {
        const allSelected = selectableDays.every(d => d.classList.contains('selected'));
        icon.classList.add(allSelected ? 'fa-check' : 'fa-xmark');
      }
      button.appendChild(icon);
      selectSection.appendChild(button);
      button.addEventListener('click', () => {
        icon.classList.toggle('fa-xmark');
        icon.classList.toggle('fa-check');
        const isSelecting = icon.classList.contains('fa-check');

        for (const day of activeDays) {
          const dayDate = new Date(day.getAttribute('date')!);
          const isAbsence = day.classList.contains('absence');
          const isSelected = day.classList.contains('selected');
          const isAdded = this.infoService.selectedDays.added.some(d => d.getTime() === dayDate.getTime());
          const isRemoved = this.infoService.selectedDays.removed.some(d => d.getTime() === dayDate.getTime());
          if (isSelecting) {
            day.classList.add('selected');
            if (isAbsence && !isSelected) {
              this.infoService.selectedDays.removed = isRemoved
                ? this.infoService.selectedDays.removed.filter(d => d.getTime() !== dayDate.getTime())
                : [...this.infoService.selectedDays.removed, dayDate];
            } else if (!isAbsence && !isAdded) {
              this.infoService.selectedDays.added.push(dayDate);
            }
          } else {
            day.classList.remove('selected');
            if (isAbsence && !isRemoved) {
              this.infoService.selectedDays.removed.push(dayDate);
            } else {
              this.infoService.selectedDays.added = this.infoService.selectedDays.added.filter(d => d.getTime() !== dayDate.getTime());
            }
          }
        }
      });
    });
    return true;
  }

  /** @method checkZaznaczanie
   * @description Sprawdza zaznaczenie dni w kalendarzu.
   * @param {number} week_number - Numer tygodnia do sprawdzenia.
   * @returns {void}
   * @memberof KalendarzComponent
   */
  private checkZaznaczanie(week_number: number): void {
    const week = this.section.nativeElement.querySelectorAll('.week')[week_number] as HTMLElement;
    const days = Array.from(week.querySelectorAll('.day')) as HTMLButtonElement[];
    const selectElement = this.section.nativeElement.querySelector('.select-buttons')!.children[week_number].firstChild as HTMLElement;
    const selectedAll: boolean = days.filter(d => !d.classList.contains('weekend') && !d.classList.contains('no-declaration') && !d.disabled)
      .every(d => d.classList.contains('selected'));
    selectElement.classList.remove('fa-check', 'fa-xmark');
    selectElement.classList.add(selectedAll ? 'fa-check' : 'fa-xmark');
  }

  /** @method sendAbsence
   * @description Wysyła zgłoszenie nieobecności do serwera.
   * @throws {Error} - Jeśli nie można znaleźć użytkownika.
   * @returns {void}
   * @memberof KalendarzComponent
   */
  protected sendAbsence(): void {
    if (!this.user) this.infoService.generateNotification(NotificationType.ERROR, 'Nie można znaleźć użytkownika.');
    try {
      this.infoService.selectedDays.added.forEach(d => {
        this.database.request('zsti.absence.add', {rok_szkolny_id: 1, dzien_wypisania: this.formatDate(d), osoby_zsti_id: this.user!.id}).then();
      });
      this.infoService.selectedDays.removed.forEach((d) => {
        this.database.request('zsti.absence.delete', {dzien_wypisania: this.formatDate(d), osoby_zsti_id: this.user!.id}).then();
      });
    } catch (error) {
      console.error('Error sending absence:', error);
      this.infoService.generateNotification(NotificationType.ERROR, 'Wystąpił błąd podczas wysyłania danych.');
      return;
    }
    this.initializeCalendar().then((): void => {
      this.infoService.selectedDays = {added: [], removed: []};
      this.infoService.generateNotification(NotificationType.SUCCESS, 'Pomyślnie wysłano dane.');
    });
  }

  /** @method applyAnimation
   * @description Zastosowuje animację do okna nieobecności.
   * @param {AbsenceWindowStatus} openStatus - Status okna nieobecności.
   * @returns {Promise<boolean>} - Promise, która rozwiązuje się po zakończeniu animacji.
   * @memberof KalendarzComponent
   */
  protected applyAnimation(openStatus: AbsenceWindowStatus): Promise<boolean> {
    if (openStatus !== AbsenceWindowStatus.CLOSED)
      this.openStatus = openStatus;
    this.cdr.detectChanges();
    return new Promise((resolve, reject) => {
      try {
        this.transtion.applyAnimation(this.absencesMenu!.nativeElement, openStatus !== AbsenceWindowStatus.CLOSED, this.zone).then(() => {
          if (openStatus === AbsenceWindowStatus.CLOSED) this.openStatus = AbsenceWindowStatus.CLOSED;
          resolve(true);
        });
      } catch (error) {
        console.error('Animation error:', error);
        reject(error);
      }
    });
  }

  /** @method formatDate
   * @description Formatuje datę do formatu YYYY-MM-DD.
   * @param date{Date} - Data do sformatowania.
   * @param fancy{boolean} - Formatowanie daty w formacie DD miesiąc YYYY.
   * @returns {string} - Sformatowana data w formacie YYYY-MM-DD.
   * @memberof KalendarzComponent
   */
  protected formatDate(date: Date, fancy: boolean = false): string {
    if (fancy) {
      return date.toLocaleDateString('pl-PL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${(date.getDate()).toString().padStart(2, '0')}`;
  }

  /** @method removeAbsence
   * @description Usuwa nieobecność z listy dni.
   * @param date - Data do usunięcia.
   * @returns {void}
   * @memberof KalendarzComponent
   */
  protected removeAbsence(date: Date): void {
    switch (this.openStatus) {
      case AbsenceWindowStatus.DODANE:
        this.infoService.selectedDays.added = this.infoService.selectedDays.added.filter(d => d.getTime() !== date.getTime());
        break;
      case AbsenceWindowStatus.USUNIETE:
        this.infoService.selectedDays.removed = this.infoService.selectedDays.removed.filter(d => d.getTime() !== date.getTime());
        break;
      default:
        throw new Error("Nieznany status okna");
    }
  }

  /** @method closeAbsenceWindow
   * @description Zamyka okno nieobecności.
   * @returns {void}
   * @memberof KalendarzComponent
   */
  protected closeAbsenceWindow(): void {
    this.applyAnimation(AbsenceWindowStatus.CLOSED).then(() => {
      this.initializeCalendar().then();
    });
  }

  public ngAfterViewInit(): void {
    this.infoService.webSocketStatus.subscribe(status => {
      if (status !== WebSocketStatus.OPEN) return;
      this.infoService.activeUser.subscribe((user: Student | undefined) => {
        if (!user) return;
        this.user = user;
        this.infoService.setTitle(`${user.imie} ${user.nazwisko} - Kalendarz`);
        this.infoService.setActiveTab('KALENDARZ');
        this.infoService.setActiveMonth(new Date());
      });
      this.infoService.activeMonth.subscribe((date: Date | undefined) => {
        if (!date) return;
        this.initializeCalendar().catch(err => console.error('Init error:', err));
      })
    });
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
