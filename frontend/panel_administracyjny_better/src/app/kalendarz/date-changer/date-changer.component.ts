import { Component } from '@angular/core';
import { GlobalInfoService } from '../../global-info.service';

@Component({
  selector: 'app-date-changer',
  imports: [],
  templateUrl: './date-changer.component.html',
  styleUrl: './date-changer.component.scss'
})
export class DateChangerComponent {
  constructor(protected globalInfo: GlobalInfoService) {}

  private getMonth(month : Date) : string {
    return month.toLocaleString('default', { month: 'long' });
  }
  private formatMonth(date : Date) : string {
    const monthName = this.getMonth(date);
    return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${date.getFullYear()}`;
  }

  protected previousMonth() : string {
    return this.formatMonth(new Date(this.globalInfo.activeMonth.value.getFullYear(), this.globalInfo.activeMonth.value.getMonth() - 1, 1));
  }
  protected currentMonth() : string {
    return this.formatMonth(new Date(this.globalInfo.activeMonth.value));
  }
  protected nextMonth() : string {
    return this.formatMonth(new Date(this.globalInfo.activeMonth.value.getFullYear(), this.globalInfo.activeMonth.value.getMonth() + 1, 1));
  }
  protected setNewMonth(number : number) : void {
    const newDate = new Date(this.globalInfo.activeMonth.value.getFullYear(), this.globalInfo.activeMonth.value.getMonth() + number, 1);
    this.globalInfo.setActiveMonth(newDate);
  }
}
