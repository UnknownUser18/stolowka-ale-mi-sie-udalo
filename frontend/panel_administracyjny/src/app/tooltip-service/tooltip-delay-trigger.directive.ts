import { Directive, input } from '@angular/core';
import { TooltipComponent } from './tooltip/tooltip.component';

@Directive({
  selector : '[delayT]',
  host : {
    '(mouseenter)' : 'onEnter($event)',
    '(mouseleave)' : 'tooltip()?.hide()'
  }
})

export class TooltipDelayTriggerDirective {
  /**
   * @required
   * @description The tooltip component to be triggered.
   */
  public tooltip = input.required<TooltipComponent>({ alias : 'delayT' });

  /**
   * @optional
   * @description Delay in milliseconds before showing the tooltip. If set to true, the default delay of `300ms` is used. If set to `false` or `null`, no delay is applied.
   */
  public delay = input<number | null>(null);

  constructor() {
  }

  onEnter(event : MouseEvent) {
    setTimeout(() => {
      this.tooltip()?.createInfoTooltip(event);
    }, this.delay() ?? 300);
  }
}
