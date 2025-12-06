import { Component, effect, input, output, signal } from '@angular/core';
import { IsWeekendPipe } from "@pipes/isWeekend/is-weekend.pipe";
import { InDeclarationPipe } from "@pipes/inDeclaration/in-declaration.pipe";
import { ZDeclaration } from "@database/declarations/declarations";
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { TitleCasePipe } from "@angular/common";
import { DayInDeclarationPipe } from "@pipes/dayInDeclaration/day-in-declaration.pipe";
import { DayInMoreDeclarationsPipe } from "@pipes/dayInMoreDeclarations/day-in-more-declarations.pipe";
import { Tooltip } from "@utils/tooltip/tooltip";
import { TooltipDelayTriggerDirective } from "@directives/delayTooltip/tooltip-delay-trigger.directive";
import { ZPricing } from "@database/prices/prices";

@Component({
  selector : 'app-calendar',
  imports : [
    IsWeekendPipe,
    InDeclarationPipe,
    FaIconComponent,
    TitleCasePipe,
    DayInDeclarationPipe,
    DayInMoreDeclarationsPipe,
    Tooltip,
    TooltipDelayTriggerDirective
  ],
  providers : [DayInMoreDeclarationsPipe],
  templateUrl : './calendar.html',
  styleUrl : './calendar.scss',
})
export class Calendar {
  protected weeks : { days : (Date | null)[] }[] = [];
  public readonly elements = input.required<ZDeclaration[] | Omit<ZPricing, 'cena'>[] | undefined>();

  protected readonly faArrowLeft = faArrowLeft;
  protected readonly faArrowRight = faArrowRight;

  protected readonly date = signal(new Date());
  public readonly selectedElement = input<ZDeclaration | Omit<ZPricing, 'cena'> | null>(null);
  public readonly isForNewElement = input<boolean>(false);
  protected declarations : ZDeclaration[] | Omit<ZPricing, 'cena'>[] | null = null;
  public readonly hasWrongDays = output<boolean>();

  constructor(
    private dayinMoreDeclarations : DayInMoreDeclarationsPipe,
  ) {
    effect(() => {
      this.date();
      this.generateWeeks();
    });

    effect(() => {
      this.selectedElement();

      if (this.isForNewElement() && this.selectedElement() !== null) {
        const selected = this.selectedElement() as ZDeclaration | ZPricing;
        if (!this.elements()?.some(d => d === selected))
          this.declarations = [selected, ...(this.elements() ?? [])];
      } else
        this.declarations = this.elements() ?? [];

      this.generateWeeks();
    });

  }

  private getDaysInWeek(weekIndex : number) : (Date | null)[] {
    const date = this.date();
    const year = date.getFullYear();
    const month = date.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const offset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    const days : (Date | null)[] = [];
    for (let i = 0 ; i < 7 ; i++) {
      const dayOfMonth = weekIndex * 7 + i - offset + 1;
      if (dayOfMonth > 0 && dayOfMonth <= daysInMonth) {
        days.push(new Date(year, month, dayOfMonth));
      } else {
        days.push(null);
      }
    }
    return days;
  }

  private get getWeekOffset() {
    const date = this.date();
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDayOfWeek = new Date(year, month, 1).getDay();
    return firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  }

  private get getWeeks() {
    const date = this.date();
    const year = date.getFullYear();
    const month = date.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = this.getWeekOffset;

    return Math.ceil((daysInMonth + offset) / 7);
  }

  private generateWeeks() : void {
    this.weeks = [];
    const weeksCount = this.getWeeks;
    for (let i = 0 ; i < weeksCount ; i++) {
      this.weeks.push({ days : this.getDaysInWeek(i) });
    }

    this.hasWrongDays.emit(this.checkWrongDays());
  }

  private checkWrongDays() : boolean {
    const declaration = this.selectedElement();
    if (!declaration) return false;

    for (const week of this.weeks) {
      for (const day of week.days) {
        if (day && this.dayinMoreDeclarations.transform(day, this.declarations))
          return true;
      }
    }

    return false;
  }

  protected changeMonth(offset : 'previous' | 'next') : void {
    const date = this.date();
    const year = date.getFullYear();
    const month = date.getMonth();

    if (offset === 'previous') {
      this.date.set(new Date(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1, 1));
    } else {
      this.date.set(new Date(month === 11 ? year + 1 : year, month === 11 ? 0 : month + 1, 1));
    }
  }
}
