import { Directive, input } from '@angular/core';
import { TooltipComponent } from './tooltip/tooltip.component';

@Directive({
  selector: '[tooltipTrigger]',
  host: {
    '(mouseenter)': 'onEnter($event)',
    '(mouseleave)': 'tooltip()?.hide()'
  }
})
export class TooltipTriggerDirective {
  public tooltip = input.required<TooltipComponent>({ alias : 'tooltipTrigger' });

  constructor() { }

  onEnter(event: MouseEvent) {
    this.tooltip()?.showAt(event);
  }

  onMove(event: MouseEvent) {
    this.tooltip()?.updatePosition(event);
  }
}
