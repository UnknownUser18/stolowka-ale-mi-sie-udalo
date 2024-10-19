import { Component, ElementRef, Renderer2, SimpleChanges, OnInit, OnChanges } from '@angular/core';
import {first} from 'rxjs';

@Component({
  selector: 'app-kalendarz',
  standalone: true,
  imports: [],
  templateUrl: './kalendarz.component.html',
  styleUrl: './kalendarz.component.css'
})
export class KalendarzComponent {
  currentDate : string | undefined;
  constructor(private renderer: Renderer2, private el: ElementRef) {};
  show_calendar() {
    this.el.nativeElement.querySelector('.kalendarz').style.display = 'flex';
    const calendar_content = this.el.nativeElement.querySelector('#content');

    const date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth()+1;
    let month_days = new Date(year, month, 0).getDate();
    let first_day = new Date(year, month, 1).getDate();
    let first_day_week = new Date(year, month-1, 1).getDay();
    this.currentDate = `${year}-${month}`;
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
  }
}
