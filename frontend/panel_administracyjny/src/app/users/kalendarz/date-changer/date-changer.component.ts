import { Component } from '@angular/core';
import { GlobalInfoService } from '../../../services/global-info.service';
import { DatePipe, TitleCasePipe } from '@angular/common';

@Component({
  selector : 'app-date-changer',
  imports : [
    TitleCasePipe
  ],
  templateUrl : './date-changer.component.html',
  styleUrl : './date-changer.component.scss',
  providers : [DatePipe]
})
export class DateChangerComponent {
  constructor(protected globalInfo : GlobalInfoService, private datePipe : DatePipe) {
    this.globalInfo.setActiveMonth(new Date());
  }

  private formatMonth(date : Date) : string {
    return this.datePipe.transform(date, 'LLLL yyyy') || '';
  }

  protected previousMonth() : string {
    if (!this.globalInfo.activeMonth.value) return '';
    const prevMonth = new Date(this.globalInfo.activeMonth.value.getFullYear(), this.globalInfo.activeMonth.value.getMonth() - 1, 1);
    return this.formatMonth(prevMonth);
  }

  protected currentMonth() : string {
    if (!this.globalInfo.activeMonth.value) return '';
    return this.formatMonth(new Date(this.globalInfo.activeMonth.value));
  }

  protected nextMonth() : string {
    if (!this.globalInfo.activeMonth.value) return '';
    const nextMonth = new Date(this.globalInfo.activeMonth.value.getFullYear(), this.globalInfo.activeMonth.value.getMonth() + 1, 1);
    return this.formatMonth(nextMonth);
  }

  protected setNewMonth(number : number) : void {
    if (!this.globalInfo.activeMonth.value) return;
    const newDate = new Date(this.globalInfo.activeMonth.value.getFullYear(), this.globalInfo.activeMonth.value.getMonth() + number, 1);
    this.globalInfo.setActiveMonth(newDate);
  }
}
