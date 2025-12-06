import { Directive, input } from '@angular/core';
import { Tooltip } from '@utils/tooltip/tooltip';

@Directive({
  selector: '[tooltip]',
  host: {
    '(mouseenter)': 'tooltip()?.createInfoTooltip($event)',
    '(mouseleave)': 'tooltip()?.hide()'
  }
})
export class TooltipTriggerDirective {
  public tooltip = input.required<Tooltip>({ alias : 'tooltip' });

  constructor() { }

}
