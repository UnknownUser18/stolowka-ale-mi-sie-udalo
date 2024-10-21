import { Component, ElementRef, Renderer2} from '@angular/core';
import {NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-kalendarz',
  standalone: true,
  imports: [
    NgOptimizedImage
  ],
  templateUrl: './kalendarz.component.html',
  styleUrl: './kalendarz.component.css'
})
export class KalendarzComponent {
  currentDate: string | undefined;
  date: Date = new Date();
  months: Array<string> = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
  month_before: string = this.months[new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).getMonth()] + " " + new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).getFullYear();
  month_next: string = this.months[new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).getMonth()] + " " + new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).getFullYear();
  selected: Array<string> = [];

  constructor(private renderer: Renderer2, private el: ElementRef) {
  };

  ngOnInit() {
    this.show_calendar()
  }

  show_calendar() {
    const calendar_content: HTMLElement = this.el.nativeElement.querySelector('#kalendarz');
    calendar_content.innerHTML = '';
    let year = this.date.getFullYear();
    let month = this.date.getMonth();
    let month_days = new Date(year, month + 1, 0).getDate();
    let first_day_week = new Date(year, month, 1).getDay();

    this.currentDate = this.months[month] + ' ' + year;
    let weekcount = 0;
    // create week div
    const weekDiv = this.renderer.createElement('div');
    this.renderer.addClass(weekDiv, 'week');
    this.renderer.appendChild(calendar_content, weekDiv);
    for (let i = 1; i <= (month_days + first_day_week - 1); i++) {
      let week = this.el.nativeElement.getElementsByClassName('week')[weekcount];
      // create day button
      if (i < first_day_week) {
        const dayDiv = this.renderer.createElement('div');
        this.renderer.addClass(dayDiv, 'day');
        this.renderer.addClass(dayDiv, 'empty');
        this.renderer.appendChild(week, dayDiv);
      } else {
        const dayButton = this.renderer.createElement('button');
        this.renderer.addClass(dayButton, 'day');
        this.renderer.setProperty(dayButton, 'innerHTML', (i - first_day_week + 1).toString());
        this.renderer.appendChild(week, dayButton);
      }
      if (i % 7 === 0) {
        weekcount++;
        // create week div
        const weekDiv = this.renderer.createElement('div');
        this.renderer.addClass(weekDiv, 'week');
        this.renderer.appendChild(calendar_content, weekDiv);
      }
    }
    const dni = this.el.nativeElement.querySelector('#dni');
    dni.innerHTML = '';
    for (let i = 0; i < 7; i++) {
      const daySpan = this.renderer.createElement('span');
      this.renderer.setProperty(daySpan, 'innerHTML', ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Niedz'][i]);
      this.renderer.appendChild(dni, daySpan);
    }
    // checking for empty days
    Array.from(this.el.nativeElement.querySelectorAll('.week') as NodeListOf<HTMLElement>).forEach((week: HTMLElement) => {
      if (week.children.length < 7) {
        for (let i = week.children.length; i < 7; i++) {
          const dayDiv = this.renderer.createElement('div');
          this.renderer.addClass(dayDiv, 'day');
          this.renderer.addClass(dayDiv, 'empty');
          this.renderer.appendChild(week, dayDiv);
        }
      }
    });
    // create zaznacz buttons
    const zaznacz: HTMLElement = this.el.nativeElement.querySelector('#zaznacz');
    zaznacz.innerHTML = '';
    const week_length = this.el.nativeElement.getElementsByClassName('week').length;
    for (let i = 0; i < week_length; i++) {
      let zaznaczElement = this.renderer.createElement('button');
      this.renderer.addClass(zaznaczElement, 'zaznacz');
      this.renderer.setProperty(zaznaczElement, 'innerHTML', "Zaznacz");
      this.renderer.appendChild(zaznacz, zaznaczElement);
    }
  };

  // show previous/next month
  change_month(number: number) {
    this.date = new Date(this.date.getFullYear(), this.date.getMonth() + number, 1);
    console.log(this.date)
    this.month_next = this.months[new Date(this.date.getFullYear(), this.date.getMonth() + 1, 1).getMonth()] + " " + new Date(this.date.getFullYear(), this.date.getMonth() + 1, 1).getFullYear()
    this.month_before = this.months[new Date(this.date.getFullYear(), this.date.getMonth() - 1, 1).getMonth()] + " " + new Date(this.date.getFullYear(), this.date.getMonth() - 1, 1).getFullYear()
    this.show_calendar();
  }
  // when on click add/remove to selected array
  select(element: MouseEvent) {
    let target = element.target as HTMLElement;
    if (target.classList.contains('day')) {
      if (target.tagName === 'BUTTON') {
        if (target.classList.contains('selected')) {
          target.classList.remove('selected');
          this.selected.splice(this.selected.indexOf(`${this.date.getFullYear()}-${this.date.getMonth()}-${parseInt(target.innerHTML)}`), 1);
        } else {
          target.classList.add('selected');
          this.selected.push(`${this.date.getFullYear()}-${this.date.getMonth()}-${parseInt(target.innerHTML)}`);
        }
      }
    }
    console.log(this.selected);
  }
  select_row(element : MouseEvent) {
    let target = element.target as HTMLElement;
    if(target.tagName == "BUTTON") {
      let parent = target.parentElement as HTMLElement; // żydon weś to spróbój skompresować
      let children = parent.children;
      let index = Array.from(children).indexOf(target);
      const week = this.el.nativeElement.getElementsByClassName('week')[index];
      for(let i = 0 ; i < week.children.length ; i ++) {
        if(!(week.children[i].classList.contains('empty'))) {
          const day = week.children[i];
          console.log(day);
          // skonczyć jutro
        }
      }
    }
  }
}
