import { Component, ElementRef, Renderer2 } from '@angular/core';
import { DateChangerComponent } from './date-changer/date-changer.component';
import { GlobalInfoService } from '../global-info.service';
import { Student, DataService } from '../data.service';
@Component({
  selector: 'app-kalendarz',
  imports: [
    DateChangerComponent
  ],
  templateUrl: './kalendarz.component.html',
  styleUrl: './kalendarz.component.scss'
})
export class KalendarzComponent {
  protected user : Student | undefined;
  constructor(private globalInfo : GlobalInfoService, private database : DataService, private el : ElementRef, private renderer : Renderer2) {
    this.globalInfo.activeUser.subscribe((id : number) : void => {
      if(id === undefined || id === 0) return;
      this.database.request('zsti.student.getById', { id: id }, 'student');
      setTimeout((): void => {
        this.user = this.database.get('student')![0];
        this.globalInfo.setTitle(`${this.user?.imie} ${this.user?.nazwisko[0]}. - Kalendarz`);
        this.initCalendar().then();
      }, 1500);
    });
    this.globalInfo.activeMonth.subscribe((date : Date) : void => {
      if(date === undefined) return;
      this.initCalendar().then();
    });
  }
  /** @method initCalendar
    * @description Inicjalizuje kalendarz, tworząc widok miesięczny bez uwzględnienia deklaracji użytkownika.
    * @returns {Promise<void>} - Promise, która rozwiązuje się po zakończeniu inicjalizacji kalendarza, pozwalając na dołączenie dodatkowej logiki (np. deklaracji).
    * @memberof KalendarzComponent
  **/
  private async initCalendar(): Promise<boolean> {
    const main: HTMLElement = this.el.nativeElement.querySelector('main');
    if (!main) return false;
    if (main.childNodes.length > 1) {
      for (const child of Array.from(main.childNodes).slice(1)) {
        this.renderer.removeChild(main, child);
      }
    }
    const currentDate: Date = this.globalInfo.activeMonth.getValue();
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
      let day: HTMLElement = this.renderer.createElement('div');
      this.renderer.addClass(day, 'day');
      this.renderer.setProperty(day, 'innerText', `${i + 1}`);

      let weekIndex: number = Math.floor((i + firstDay) / 7);
      let week: HTMLElement = main.querySelectorAll('.week')[weekIndex] as HTMLElement;
      this.renderer.appendChild(week, day);
    }
    return true;
  }
}
