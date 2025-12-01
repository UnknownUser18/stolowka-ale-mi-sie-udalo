import { Component, viewChild } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { InfoService } from '@services/info.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { TooltipComponent } from '@tooltips/tooltip/tooltip.component';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TooltipClickTriggerDirective } from '@tooltips/tooltip-click-trigger.directive';

@Component({
  selector : 'app-date-changer',
  imports : [
    TitleCasePipe,
    FaIconComponent,
    TooltipComponent,
    FormsModule,
    TooltipClickTriggerDirective,
    ReactiveFormsModule
  ],
  templateUrl : './date-changer.component.html',
  styleUrl : './date-changer.component.scss',
  providers : [DatePipe]
})
export class DateChangerComponent {
  private tooltip = viewChild.required<TooltipComponent>('tooltip');

  protected month = new FormControl('', { nonNullable : true, validators : [Validators.required, Validators.maxLength(7), Validators.minLength(7), Validators.pattern('[0-9]{4}-[0-9]{2}')] });

  protected readonly faArrowRight = faArrowRight;
  protected readonly faArrowLeft = faArrowLeft;

  constructor(private datePipe : DatePipe, private infoS : InfoService) {
  }

  private formatMonth(date : Date) : string {
    return this.datePipe.transform(date, 'LLLL yyyy') || '';
  }

  protected previousMonth() : string {
    const date = this.infoS.currentDate();
    const prevMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1);
    return this.formatMonth(prevMonth);
  }

  protected currentMonth() : string {
    return this.formatMonth(this.infoS.currentDate());
  }

  protected nextMonth() : string {
    const date = this.infoS.currentDate();
    const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    return this.formatMonth(nextMonth);
  }

  protected setNewMonth(number : number) : void {
    const date = this.infoS.currentDate();
    return this.infoS.setDate(new Date(date.getFullYear(), date.getMonth() + number, 1));
  }

  protected changeMonth() {
    const month = this.month.value.trim()
    if (!month) return;

    const [year, monthNumber] = month.split('-').map(Number);
    if (!year || !monthNumber || monthNumber < 1 || monthNumber > 12) return;

    this.infoS.setDate(new Date(year, monthNumber - 1, 1));
    this.tooltip().hide();
    this.month.setValue('');
  }
}
