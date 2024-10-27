import {Component, ElementRef, Input, Renderer2, SimpleChanges, OnChanges } from '@angular/core';
import {NgForOf, NgOptimizedImage} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-kalendarz',
  standalone: true,
  imports: [NgOptimizedImage, FormsModule, NgForOf],
  templateUrl: './kalendarz.component.html',
  styleUrl: './kalendarz.component.css'
})
export class KalendarzComponent {
  @Input() typ: string | undefined;
  currentDate: string | undefined;
  date: Date = new Date();
  months: Array<string> = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
  month_before: string = this.months[new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).getMonth()] + " " + new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).getFullYear();
  month_next: string = this.months[new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).getMonth()] + " " + new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).getFullYear();
  selected: Array<string> = [];
  posilki_cashe: Array<{id: number, array: Array<any>}> = [
    {id: 1, array: []},
    {id: 2, array: []},
    {id: 3, array: []},
    {id: 4, array: []},
    {id: 5, array: []},
    {id: 6, array: []},
    {id: 7, array: []}
  ];

  constructor(private renderer: Renderer2, private el: ElementRef) {
  };
  ngOnChanges(changes: SimpleChanges) {
    if (changes['typ']) {
      this.show_calendar();
    }
  }
  ngOnInit() {
    if(!this.previousPosilek === null) {
      this.previousPosilek = this.el.nativeElement.querySelector('#posilek').selectedIndex;
    }
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
    for (let i = -7; i <= (month_days + first_day_week - 1); i++) {
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
        if (this.selected.includes(`${year}-${month+1}-${i - first_day_week + 1}`)) {
          this.renderer.addClass(dayButton, 'selected');
        }
        if(this.typ === 'Internat') {
          console.log('Internat');
          const checkboxes = this.renderer.createElement('div');
          const sniadanie = this.renderer.createElement('input');
          this.renderer.setAttribute(sniadanie, 'type', 'checkbox');
          this.renderer.appendChild(checkboxes, sniadanie);
          const obiad = this.renderer.createElement('input');
          this.renderer.setAttribute(obiad, 'type', 'checkbox');
          this.renderer.appendChild(checkboxes, obiad);
          const kolacja = this.renderer.createElement('input');
          this.renderer.setAttribute(kolacja, 'type', 'checkbox');
          this.renderer.appendChild(checkboxes, kolacja);
          this.renderer.appendChild(dayButton, checkboxes);
        }
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
    // check if the week element is empty
    Array.from(this.el.nativeElement.getElementsByClassName('week') as NodeListOf<HTMLElement>).forEach((week: HTMLElement) => {
      let empty = true;
      Array.from(week.children as unknown as NodeListOf<HTMLElement>).forEach((day: HTMLElement) => {
        if (!day.classList.contains('empty')) {
          empty = false;
        }
      });
      if (empty) {
        week.remove();
      }
    });
    // create zaznacz buttons
    const zaznacz: HTMLElement = this.el.nativeElement.querySelector('#zaznacz');
    zaznacz.innerHTML = '';
    let week_length = this.el.nativeElement.getElementsByClassName('week').length;
    for (let i = 0; i < week_length; i++) {
      let selected_days = 0;
      let days = 0;
      Array.from(this.el.nativeElement.getElementsByClassName('week')[i].children as NodeListOf<HTMLElement>).forEach((day: HTMLElement) => {
        if(!day.classList.contains('empty')) {
          if(day.classList.contains('selected')) {
            selected_days++;
          }
          days++;
        }
      });
      let zaznaczLabel = this.renderer.createElement('label');
      let zaznaczElement = this.renderer.createElement('input');
      let zaznaczSpan = this.renderer.createElement('span');
      this.renderer.addClass(zaznaczElement, 'zaznacz');
      this.renderer.setAttribute(zaznaczElement, 'type', 'checkbox');
      // check if the entire array is selected
      if(selected_days === days) {
        console.log('selected');
        this.renderer.setAttribute(zaznaczElement, 'checked', 'true');
      }
      this.renderer.appendChild(zaznaczLabel, zaznaczElement);
      this.renderer.appendChild(zaznaczLabel, zaznaczSpan);
      this.renderer.appendChild(zaznacz, zaznaczLabel);
    }
  }

  // show previous/next month
  change_month(number: number) {
    this.date = new Date(this.date.getFullYear(), this.date.getMonth() + number, 1);
    this.month_next = this.months[new Date(this.date.getFullYear(), this.date.getMonth() + 1, 1).getMonth()] + " " + new Date(this.date.getFullYear(), this.date.getMonth() + 1, 1).getFullYear()
    this.month_before = this.months[new Date(this.date.getFullYear(), this.date.getMonth() - 1, 1).getMonth()] + " " + new Date(this.date.getFullYear(), this.date.getMonth() - 1, 1).getFullYear()
    this.show_calendar();
  }
  // when on click add/remove to selected array
  select(element: MouseEvent) {
    let target = element.target as HTMLElement;
    if (target.classList.contains('day')) {
      if (target.tagName === 'BUTTON') {
        function isFullWeekSelected(week : HTMLElement) {
          let selected = 0;
          let days = 0;
          Array.from(week.children as unknown as NodeListOf<HTMLElement>).forEach((day: HTMLElement) => {
            if(!day.classList.contains('empty')) {
              if(day.classList.contains('selected')) {
                selected++;
              }
              days++;
            }
          });
          return selected === days;
        }
        if (target.classList.contains('selected')) {
          if(isFullWeekSelected(target.parentElement as HTMLElement)) {
            console.log('full week selected check = false');
            const zaznacz = this.el.nativeElement.querySelector('#zaznacz > label > input');
            (zaznacz as HTMLInputElement).checked = false;
          }
          target.classList.remove('selected');
          this.selected.splice(this.selected.indexOf(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${parseInt(target.innerHTML)}`), 1);
        } else {
          target.classList.add('selected');
          this.selected.push(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${parseInt(target.innerHTML)}`);
          if(isFullWeekSelected(target.parentElement as HTMLElement)) {
            console.log('full week selected check = true');
            const zaznacz = this.el.nativeElement.querySelector('#zaznacz > label > input');
            (zaznacz as HTMLInputElement).checked = true;
          }
        }
      }
    }
    console.log(this.selected);
  }
  select_row(element : MouseEvent) {
    let target = element.target as HTMLElement;
    if(target.tagName === 'INPUT') {
      const week = this.el.nativeElement.getElementsByClassName('week')[Array.from(this.el.nativeElement.querySelectorAll('.zaznacz')).indexOf(target)];
      if((target as HTMLInputElement).checked) {
        console.log('checked');
        for(let i = 0; i < week.children.length; i++) {
          if(!week.children[i].classList.contains('empty')) {
            week.children[i].classList.add('selected');
            this.selected.push(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${parseInt(week.children[i].innerHTML)}`);
          }
        }
      }
      else {
        console.log('unchecked');
        for(let i = 0; i < week.children.length; i++) {
          if(!week.children[i].classList.contains('empty')) {
            week.children[i].classList.remove('selected');
            this.selected.splice(this.selected.indexOf(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${parseInt(week.children[i].innerHTML)}`), 1);
          }
        }
      }
      console.log(this.selected);
    }
  }
  // posilki
  GetPosilki(posilek: {id: number, nazwa: string}): string {
    const rename: { [key : number] : string} = {
      0: 'Śniadanie',
      1: 'Obiad',
      2: 'Kolacja',
      3: 'Śniadanie i Obiad',
      4: 'Śniadanie i Kolacja',
      5: 'Śniadanie, Obiad i Kolacja',
      6: 'Obiad i Kolacja'
    }
    return rename[posilek.id] || posilek.nazwa;
  }
  posilki = [
    {id : 0, nazwa: "śniadanie"},
    {id : 1, nazwa: "obiad"},
    {id : 2, nazwa: "kolacja"},
    {id : 3, nazwa: "śniadanie_obiad"},
    {id : 4, nazwa: "śniadanie_kolacja"},
    {id : 5, nazwa: "śniadanie_obiad_kolacja"},
    {id : 6, nazwa: "obiad_kolacja"},
  ]
  selectedPosilek: number = this.posilki[1].id;
  previousPosilek : number | undefined;

  select_posilek() {
    console.log(this.previousPosilek)
    // @ts-ignore
    this.posilki_cashe[this.previousPosilek].array = this.selected;
    this.previousPosilek = this.selectedPosilek;
    console.log(this.previousPosilek)
    this.selected = this.posilki_cashe[this.selectedPosilek].array;
    console.log(this.selected);
    console.log(this.posilki_cashe);
    this.show_calendar();
  }
}
