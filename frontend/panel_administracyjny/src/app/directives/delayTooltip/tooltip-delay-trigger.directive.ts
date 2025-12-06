import { Directive, input } from '@angular/core';
import { Tooltip } from '@utils/tooltip/tooltip';

@Directive({
  selector : '[delayT]',
  host : {
    '(mouseenter)' : 'onEnter($event)',
    '(mouseleave)' : 'onLeave()'
  }
})

export class TooltipDelayTriggerDirective {
  /**
   * @required
   * @description The tooltip component to be triggered.
   */
  public tooltip = input.required<Tooltip>({ alias : 'delayT' });

  /**
   * @optional
   * @description Delay in milliseconds before showing the tooltip. If set to true, the default delay of `300ms` is used. If set to `false` or `null`, no delay is applied.
   */
  public delay = input<number | null>(null);

  private showTimeout: any = null;

  constructor() {
  }
  private cancelShowTimeout() {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = null;
    }
  }

  public onEnter(event : MouseEvent) {
    this.cancelShowTimeout();
    this.showTimeout = setTimeout(() => {
      this.tooltip()?.createInfoTooltip(event);
      this.showTimeout = null;
    }, this.delay() ?? 300);
  }

  public onLeave() {
    this.cancelShowTimeout();
    this.tooltip()?.hide();
  }
}
