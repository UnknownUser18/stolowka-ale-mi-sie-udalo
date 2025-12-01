import { Directive, input } from '@angular/core';
import { TooltipComponent } from './tooltip/tooltip.component';

@Directive({
  selector: '[tooltip]',
  host: {
    '(mouseenter)': 'tooltip()?.createInfoTooltip($event)',
    '(mouseleave)': 'tooltip()?.hide()'
  }
})
export class TooltipTriggerDirective {
  public tooltip = input.required<TooltipComponent>({ alias : 'tooltip' });

  constructor() { }

}
