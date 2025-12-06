import { Directive, input } from '@angular/core';
import { Tooltip } from '@utils/tooltip/tooltip';

@Directive({
  selector : '[clickT]',
  host : {
    '(click)' : 'onClick($event)',
  }
})
export class TooltipClickTriggerDirective {
  public tooltip = input.required<Tooltip>({ alias : 'clickT' });
  public underCursor = input<boolean | null>(null);

  constructor() {
  }

  protected onClick(event : MouseEvent) : void {
    this.tooltip().createOptionsTooltip(this.underCursor() ?? false, this.underCursor() ? (event.target as HTMLElement) : undefined);
  }
}
