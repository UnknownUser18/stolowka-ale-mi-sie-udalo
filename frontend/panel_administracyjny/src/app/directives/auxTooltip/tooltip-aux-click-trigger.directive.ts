import { Directive, input } from '@angular/core';
import { Tooltip } from '@utils/tooltip/tooltip';

@Directive({
  selector : '[auxclickT]',
  host : {
    '(auxclick)' : 'tooltip().createOptionsTooltip()',
    '(click)' : '$event.preventDefault(); $event.stopPropagation();'
  }
})
export class TooltipAuxClickTriggerDirective {
  public tooltip = input.required<Tooltip>({ alias : 'auxclickT' });


  constructor() {
  }

}
