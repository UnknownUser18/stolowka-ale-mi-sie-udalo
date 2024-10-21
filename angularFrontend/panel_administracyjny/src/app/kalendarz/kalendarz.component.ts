import { Component, ElementRef, Renderer2, OnInit} from '@angular/core';
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
  currentDate : string | undefined;
  date : Date = new Date();
  months : Array <string> = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
  month_before : string = this.months[new Date(new Date().getFullYear(), new Date().getMonth()-1, 1).getMonth()] + " " + new Date(new Date().getFullYear(), new Date().getMonth()+1, 1).getFullYear();
  month_next : string = this.months[new Date(new Date().getFullYear(), new Date().getMonth()+1, 1).getMonth()] + " " + new Date(new Date().getFullYear(), new Date().getMonth()+1, 1).getFullYear();
  constructor(private renderer: Renderer2, private el: ElementRef) {};
  ngOnInit() {
    this.show_calendar()
  }
  show_calendar() {
    const calendar_content = this.el.nativeElement.querySelector('#content');
    calendar_content.innerHTML = '';
    let year = this.date.getFullYear();
    let month = this.date.getMonth();
    let month_days = new Date(year, month+1, 0).getDate();
    let first_day = new Date(year, month, 1).getDate();
    let first_day_week = new Date(year, month, 1).getDay();
    console.log(month)

    this.currentDate = this.months[month] + ' ' + year;
    console.log(first_day);
    console.log(month_days);
    let weekcount = 0;
    // create week div
    const weekDiv = this.renderer.createElement('div');
    this.renderer.addClass(weekDiv, 'week');
    this.renderer.appendChild(calendar_content, weekDiv);
    for(let i = 1 ; i <= (month_days + first_day_week-1) ; i++) {
      let week = document.getElementsByClassName('week')[weekcount];
      // create day button
      if(i < first_day_week) {
        console.log('empty');
        const dayDiv = this.renderer.createElement('div');
        this.renderer.addClass(dayDiv, 'day');
        this.renderer.addClass(dayDiv, 'empty');
        this.renderer.appendChild(week, dayDiv);
      }
      else {
        const dayButton = this.renderer.createElement('button');
        this.renderer.addClass(dayButton, 'day');
        this.renderer.setProperty(dayButton, 'innerHTML', (i-first_day_week+1).toString());
        this.renderer.appendChild(week, dayButton);
      }
      if(i % 7 === 0) {
        weekcount++;
        // create week div
        const weekDiv = this.renderer.createElement('div');
        this.renderer.addClass(weekDiv, 'week');
        this.renderer.appendChild(calendar_content, weekDiv);
      }
    }
    // checking for empty days
    document.querySelectorAll('.week').forEach((week) => {
      if(week.children.length < 7) {
        for(let i = week.children.length ; i < 7 ; i++) {
          const dayDiv = this.renderer.createElement('div');
          this.renderer.addClass(dayDiv, 'day');
          this.renderer.addClass(dayDiv, 'empty');
          this.renderer.appendChild(week, dayDiv);
        }
      }
    });
  };
    // show previous/next month
  change_month(number: number) {
    this.date = new Date(this.date.getFullYear(), this.date.getMonth() + number, 1);
    console.log(this.date)
    this.month_next = this.months[new Date(this.date.getFullYear(), this.date.getMonth()+1, 1).getMonth()] + " "  + new Date(this.date.getFullYear(), this.date.getMonth()+1, 1).getFullYear()
    this.month_before = this.months[new Date(this.date.getFullYear(), this.date.getMonth()-1, 1).getMonth()]  + " " + new Date(this.date.getFullYear(), this.date.getMonth()-1, 1).getFullYear()
    this.show_calendar();
  }
  
}
