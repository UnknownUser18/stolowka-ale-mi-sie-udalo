import { AfterViewInit, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { DateChangerComponent } from './date-changer/date-changer.component';
import { GlobalInfoService } from '../global-info.service';
import { DataService, Declaration, Student, CanceledDay } from '../data.service';
import { filter, take } from 'rxjs';


@Component({
  selector: 'app-kalendarz',
  imports: [
    DateChangerComponent
  ],
  templateUrl: './kalendarz.component.html',
  styleUrl: './kalendarz.component.scss'
})
export class KalendarzComponent implements AfterViewInit {
  protected user : Student | undefined;
  private declarations : Declaration[] | undefined;
  private canceledDays : CanceledDay[] = [];
  @ViewChild('section') section!: ElementRef;
  constructor(protected globalInfo : GlobalInfoService, private database : DataService, private renderer : Renderer2) {}
  private addDay(day : Date) : void {
    if(!day) return;
    const dayIndex : number = this.globalInfo.selectedDays.added.findIndex((d : Date) : boolean => {
      return d.getTime() === day.getTime();
    });
    if(dayIndex === -1) {
      this.globalInfo.selectedDays.added.push(day);
    } else {
      this.globalInfo.selectedDays.added.splice(dayIndex, 1);
    }
  }
  /** @method initializeCalendar
   * @description Inicjalizuje cały kalendarz, włącznie z logiką deklaracji i zaznaczania.
   * @returns {void}
   * @memberof KalendarzComponent
   * @throws {Error} - Jeśli nie można zainicjalizować kalendarza, deklaracji (każde sprawdza osobno).
   */
  private async initializeCalendar(): Promise<void> {
    try {
      if(!await this.initCalendar()) return;
      if(!await this.initDeclarations()) return;
      if(!await this.initNieczynneDni()) return;
      let declarations: Declaration[] = this.declarations!;
      let days: NodeListOf<HTMLButtonElement> = this.section.nativeElement.querySelectorAll('.day')!;
      days.forEach((d: HTMLButtonElement): void => {
        const date: string = d.getAttribute('date')!;
        const day: Date = new Date(date);
        if (day.getDay() === 0 || day.getDay() === 6) {
          d.disabled = true;
          return;
        }
        const day_string = `${day.getFullYear()}-${(day.getMonth() + 1).toString().padStart(2, '0')}-${(day.getDate()).toString().padStart(2, '0')}`;
        const declaration: Declaration | undefined = declarations.find((declaration: Declaration): boolean => {
          return declaration.data_od <= day_string && declaration.data_do >= day_string;
        });
        function getTime(date : Date) {
          return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${(date.getDate()).toString().padStart(2, '0')}`;
        }
        const canceledDay: CanceledDay | undefined = this.canceledDays.find((canceledDay: CanceledDay): boolean => {
          return getTime(new Date(canceledDay.dzien)) === getTime(day);
        });
        console.log(canceledDay);
        if (!(declaration && !d.disabled && declaration?.dni.split('')[day.getDay() - 1] === '1')) {
          d.classList.add('no-declaration');
        } else if(canceledDay) {
          d.classList.add('canceled');
          d.disabled = true;
        } else {
          d.addEventListener('click', (): void => {
            this.addDay(day);
            d.classList.toggle('selected');
          });
        }
        this.initZaznaczanie().then();
      });
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
    const main : HTMLElement = this.section.nativeElement.querySelector('main');
    if (!main) throw new Error('Nie można znaleźć elementu do kalendarza');
    if (main.childNodes.length > 1) {
      for (const child of Array.from(main.childNodes).slice(1)) {
        this.renderer.removeChild(main, child);
      }
    }
    const currentDate: Date = this.globalInfo.activeMonth.getValue()!;
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
    for (let i : number = 0; i < daysInMonth; i++) {
      if (i === 0) {
        let firstWeek: HTMLElement = main.querySelector('.week') as HTMLElement;
        for (let j : number = 0; j < firstDay; j++) {
          let emptyDay: HTMLElement = this.renderer.createElement('div');
          this.renderer.addClass(emptyDay, 'empty-day');
          this.renderer.appendChild(firstWeek, emptyDay);
        }
      }
      let day : HTMLButtonElement = this.renderer.createElement('button');
      this.renderer.addClass(day, 'day');
      this.renderer.setProperty(day, 'innerText', `${i + 1}`);
      this.renderer.setAttribute(day, 'date', `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2,'0')}-${(i + 1).toString().padStart(2,'0')}`);

      let weekIndex: number = Math.floor((i + firstDay) / 7);
      let week: HTMLElement = main.querySelectorAll('.week')[weekIndex] as HTMLElement;
      this.renderer.appendChild(week, day);
    }
    return true;
  }

  /** @method initDeclarations
   * @description Inicjalizuje deklaracje użytkownika, jeśli są dostępne.
   * @returns {Promise<boolean>} - Promise, która rozwiązuje się po zakończeniu inicjalizacji deklaracji.
   * @memberof KalendarzComponent
   */
  private async initDeclarations(): Promise<boolean> {
    if (!this.user) return false;
    if (!this.declarations) {
      try {
        this.declarations = await this.database.request('zsti.declaration.getById', { id: this.user.id }, 'declaration');
      } catch (error) {
        throw new Error('Nie można znaleźć deklaracji');
      }
    }
    return this.declarations !== undefined;
  }
  /** @method initZaznaczanie
   * @description Inicjalizuje sekcję zaznaczania dni w kalendarzu.
   * @returns {Promise<boolean>} - Promise, która rozwiązuje się po zakończeniu inicjalizacji sekcji zaznaczania.
   * @throws {Error} - Jeśli nie można znaleźć sekcji zaznaczania.
   * @memberof KalendarzComponent
   */
  private async initZaznaczanie() : Promise<boolean> {
    let select_section : HTMLElement = this.section.nativeElement.querySelector('.select-buttons')!;
    if(!select_section) throw new Error('Nie można znaleźć sekcji zaznaczania');
    if(select_section.childNodes.length > 0) {
      for(const child of Array.from(select_section.childNodes)) {
        this.renderer.removeChild(select_section, child);
      }
    }
    let weeks : NodeListOf<HTMLButtonElement> = this.section.nativeElement.querySelectorAll('.week');
    for(let i : number = 0; i < weeks.length ; i++) {
      let button : HTMLButtonElement = this.renderer.createElement('button');
      let i_element : HTMLElement = this.renderer.createElement('i');
      i_element.classList.add('fa-solid', 'fa-xmark');
      button.addEventListener('click', () : void => {
        i_element.classList.toggle('fa-xmark');
        i_element.classList.toggle('fa-check');
        for (const day of Array.from(weeks[i].querySelectorAll('.day')) as HTMLButtonElement[]) {
          if (day.classList.contains('no-declaration') || day.disabled) continue;
          if (i_element.classList.contains('fa-check')) {
            day.classList.add('selected');
            const dayDate = new Date(day.getAttribute('date')!);
            if (!this.globalInfo.selectedDays.added.some(selectedDay => selectedDay.getTime() === dayDate.getTime())) {
              this.globalInfo.selectedDays.added.push(dayDate);
            }
          } else {
            day.classList.remove('selected');
            const dayDate = new Date(day.getAttribute('date')!);
            this.globalInfo.selectedDays.added = this.globalInfo.selectedDays.added.filter(selectedDay => selectedDay.getTime() !== dayDate.getTime());
          }
        }
      });
      button.appendChild(i_element);
      select_section.appendChild(button);
    }
    return true;
  }

  /**
   * @method initNieczynneDni
   * @description Inicjalizuje dni nieczynne, które są pobierane z bazy danych.
   * @returns {Promise<boolean>} - Promise, która rozwiązuje się po zakończeniu inicjalizacji dni nieczynnych.
   * @throws {Error} - Jeśli nie można znaleźć dni nieczynnych.
   * @memberof KalendarzComponent
   */
  private async initNieczynneDni() : Promise<boolean> {
    try {
      this.canceledDays = await this.database.request('global.canceledDay.get', {}, 'canceledDay');
    } catch (error) {
      throw new Error('Nie można znaleźć dni nieczynnych');
    }
    return this.canceledDays !== undefined;
  }

  public ngAfterViewInit(): void {
    this.globalInfo.activeUser.pipe(
      filter(id => id !== undefined && id !== 0), take(1)).subscribe((id: number): void => {
      this.database.request('zsti.student.getById', { id: id }, 'student').then((payload) => {
        this.user = payload[0];
        if (!this.user) throw new Error('User not found');
        this.globalInfo.setTitle(`${this.user.imie} ${this.user.nazwisko[0]}. - Kalendarz`);

        this.globalInfo.activeMonth.pipe(filter(date => date !== undefined)).subscribe((): void => {
          this.initializeCalendar().then();
        });
      }).catch((err) => {
        console.error('Error fetching user: ', err);
      });
    });
  }
}
