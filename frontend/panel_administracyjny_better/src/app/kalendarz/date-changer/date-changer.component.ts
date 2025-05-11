import { Component } from '@angular/core';
import { GlobalInfoService } from '../../global-info.service';

@Component({
  selector: 'app-date-changer',
  imports: [],
  templateUrl: './date-changer.component.html',
  styleUrl: './date-changer.component.scss'
})
export class DateChangerComponent {
  constructor(protected globalInfo: GlobalInfoService) {
    this.globalInfo.setActiveMonth(new Date());
  }

  private getMonth(month : Date) : string {
    return month.toLocaleString('default', { month: 'long' });
  }
  private formatMonth(date : Date) : string {
    const monthName : string = this.getMonth(date);
    return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${date.getFullYear()}`;
  }

  protected previousMonth() : string {
    if(!this.globalInfo.activeMonth.value) return '';
    return this.formatMonth(new Date(this.globalInfo.activeMonth.value.getFullYear(), this.globalInfo.activeMonth.value.getMonth() - 1, 1));
  }
  protected currentMonth() : string {
    if(!this.globalInfo.activeMonth.value) return '';
    return this.formatMonth(new Date(this.globalInfo.activeMonth.value));
  }
  protected nextMonth() : string {
    if(!this.globalInfo.activeMonth.value) return '';
    return this.formatMonth(new Date(this.globalInfo.activeMonth.value.getFullYear(), this.globalInfo.activeMonth.value.getMonth() + 1, 1));
  }
  protected setNewMonth(number : number) : void {
    if(!this.globalInfo.activeMonth.value) return;
    const newDate = new Date(this.globalInfo.activeMonth.value.getFullYear(), this.globalInfo.activeMonth.value.getMonth() + number, 1);
    this.globalInfo.setActiveMonth(newDate);
  }
}
