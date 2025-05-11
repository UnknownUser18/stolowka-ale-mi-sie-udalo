import {AfterViewInit, Component, ElementRef, Renderer2, ViewChild} from '@angular/core';
import {DateChangerComponent} from './date-changer/date-changer.component';
import {GlobalInfoService} from '../global-info.service';
import {DataService, Declaration, Student} from '../data.service';


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
  @ViewChild('section') section!: ElementRef;
  constructor(protected globalInfo : GlobalInfoService, private database : DataService, private renderer : Renderer2) {
    this.globalInfo.activeUser.subscribe((id : number) : void => {
      if(id === undefined || id === 0 || this.globalInfo.previousUser === id) return;
      this.globalInfo.setPreviousUser(id);
      this.database.request('zsti.student.getById', { id: id }, 'student').then((payload) => {
        this.user = payload[0];
        if(!this.user) throw new Error('Nie można znaleźć użytkownika');
        this.globalInfo.setTitle(`${this.user.imie} ${this.user.nazwisko[0]}. - Kalendarz`);
      });
    });
  }
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
  private initializeCalendar() : void {
    this.initCalendar().then((r : boolean | Error) : void => {
      if(!r) throw new Error('Nie można zainicjalizować kalendarza', r as unknown as Error);
      if(!this.user) {
       setTimeout((): void => {
         if(!this.user) return;
       }, 1500);
      }
      this.initDeclarations().then((r : boolean) : void => {
        if(!r) console.warn('Użytkownik nie ma deklaracji, lub nie można ich zainicjalizować, wyświetlanie trybu bez zaznaczania.');
        let declarations : Declaration[] = [];
        if(r)
          declarations = this.declarations!;
        let days : NodeListOf<HTMLButtonElement> = this.section.nativeElement.querySelectorAll('.day')!;
        days.forEach((d : HTMLButtonElement) : void => {
          const date : string = d.getAttribute('date')!;
          const day : Date = new Date(date);
          if(day.getDay() === 0 || day.getDay() === 6) {
            d.disabled = true;
            return;
          }
          d.addEventListener('click', () : void => this.addDay(day));
          const day_string = `${day.getFullYear()}-${(day.getMonth() + 1).toString().padStart(2,'0')}-${(day.getDate()).toString().padStart(2,'0')}`;
          const dayDeclarations: Declaration[] = declarations.filter((declaration : Declaration) : boolean => {
            return declaration.data_od <= day_string && declaration.data_do >= day_string;
          });
        });
      });
    });
  }
  /** @method initCalendar
    * @description Inicjalizuje kalendarz, tworząc widok miesięczny bez uwzględnienia deklaracji użytkownika.
    * @returns {Promise<boolean>} - Promise, która rozwiązuje się po zakończeniu inicjalizacji kalendarza, pozwalając na dołączenie dodatkowej logiki (np. deklaracji).
   *  @throws {Error} - Jeśli nie można znaleźć elementu do kalendarza.
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
    if (this.declarations === undefined) {
      this.declarations = await this.database.request('zsti.declaration.getById', {id: this.user.id}, 'declaration');
    }
    return this.declarations !== undefined;
  }
  public ngAfterViewInit() : void {
    this.globalInfo.activeMonth.subscribe((date : Date | undefined) : void => {
      if(!date || date === this.globalInfo.previousMonth) return;
      this.initializeCalendar();
    });
  }
}
