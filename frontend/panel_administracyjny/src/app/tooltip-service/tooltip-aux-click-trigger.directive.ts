import { Directive, input } from '@angular/core';
import { TooltipComponent } from './tooltip/tooltip.component';

@Directive({
  selector : '[auxclickT]',
  host : {
    '(auxclick)' : 'tooltip().createOptionsTooltip()',
    '(click)' : '$event.preventDefault(); $event.stopPropagation();'
  }
})
export class TooltipAuxClickTriggerDirective {
  public tooltip = input.required<TooltipComponent>({ alias : 'auxclickT' });


  constructor() {
  }

}
