import { Component, viewChild } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { Info } from '@services/info';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from '@utils/tooltip/tooltip';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TooltipClickTriggerDirective } from '@directives/clickTooltip/tooltip-click-trigger.directive';
import { PrimaryText } from "%primary-text";
import { SecondaryText } from "%secondary-text";
import { ButtonDanger } from "%button-danger";
import { ButtonSuccess } from "%button-success";

@Component({
  selector : 'app-date-changer',
  imports : [
    TitleCasePipe,
    FaIconComponent,
    Tooltip,
    FormsModule,
    TooltipClickTriggerDirective,
    ReactiveFormsModule,
    PrimaryText,
    SecondaryText,
    ButtonDanger,
    ButtonSuccess
  ],
  templateUrl : './date-changer.html',
  styleUrl : './date-changer.scss',
  providers : [DatePipe]
})
export class DateChanger {
  private tooltip = viewChild.required<Tooltip>('tooltip');

  protected month = new FormControl('', { nonNullable : true, validators : [Validators.required, Validators.maxLength(7), Validators.minLength(7), Validators.pattern('[0-9]{4}-[0-9]{2}')] });

  protected readonly faArrowRight = faArrowRight;
  protected readonly faArrowLeft = faArrowLeft;

  constructor(private datePipe : DatePipe, private infoS : Info) {
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
