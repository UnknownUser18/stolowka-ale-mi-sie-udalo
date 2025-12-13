import { Component, signal, viewChild } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { Info } from '@services/info';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from '@utils/tooltip/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TooltipClickTriggerDirective } from '@directives/clickTooltip/tooltip-click-trigger.directive';
import { ButtonDanger, ButtonSuccess, PrimaryText, SecondaryText } from '@ui';
import { Field, form, maxLength, minLength, pattern, required } from "@angular/forms/signals";

interface MonthForm {
  month : string;
}

@Component({
  selector  : 'app-date-changer',
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
    ButtonSuccess,
    Field
  ],
  templateUrl : './date-changer.html',
  styleUrl  : './date-changer.scss',
  providers : [DatePipe]
})
export class DateChanger {
  private tooltip = viewChild.required<Tooltip>('tooltip');
  protected icons = {
    faArrowLeft,
    faArrowRight,
  };
  private month = signal<MonthForm>({
    month : ''
  });
  protected monthForm = form(this.month, (schemaPath) => {
    required(schemaPath.month, { message : 'Miesiąc jest wymagany.' });
    minLength(schemaPath.month, 7, { message : 'Proszę wpisać 7 znaków.' });
    maxLength(schemaPath.month, 7, { message : 'Proszę wpisać 7 znaków.' });
    pattern(schemaPath.month, /^\d{4}-(0[1-9]|1[0-2])$/, { message : 'Nieprawidłowy format miesiąca, proszę wpisać w formie YYYY-MM.' });

  });

  constructor(private datePipe : DatePipe, private infoS : Info) {}

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
    const month = this.monthForm().value().month;
    if (!month) return;

    const [year, monthNumber] = month.split('-').map(Number);
    if (!year || !monthNumber || monthNumber < 1 || monthNumber > 12) return;

    this.infoS.setDate(new Date(year, monthNumber - 1, 1));
    this.tooltip().hide();
    this.monthForm().reset();
  }
}
