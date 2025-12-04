import { Component, input, model, viewChild } from '@angular/core';
import { TooltipComponent } from '@tooltips/tooltip/tooltip.component';
import { TooltipDelayTriggerDirective } from '@tooltips/tooltip-delay-trigger.directive';
import { TooltipAuxClickTriggerDirective } from '@tooltips/tooltip-aux-click-trigger.directive';
import { faArrowsRotate, faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { FormValueControl } from "@angular/forms/signals";

export type State = 'on' | 'off' | 'all';

export type SwitchType = '2-way' | '3-way';

@Component({
  selector  : 'switch',
  imports   : [
    TooltipComponent,
    TooltipDelayTriggerDirective,
    TooltipAuxClickTriggerDirective,
    FaIconComponent
  ],
  templateUrl : './switch.component.html',
  styleUrl  : './switch.component.scss',
  providers : [],
  host      : {
    '[class.on]' : "value() === 'on'",
    '[class.off]' : "value() === 'off'",
    '[class.all]' : "value() === 'all'",
    '[class.twoWay]' : "type() === '2-way'",
  }
})
export class Switch implements FormValueControl<State> {

  protected tooltipChange = viewChild.required<TooltipComponent>('tooltipChange');
  protected labels = input({ off : 'Off', on : 'On', all : 'All' });

  protected readonly faXmark = faXmark;
  protected readonly faCheck = faCheck;
  protected readonly faArrowsRotate = faArrowsRotate;

  public label = input.required<string>();
  public type = input<SwitchType>('2-way');

  public value = model<State>('off');

  constructor() {}

  protected changeStep(number : number) {
    const states : State[] = this.type() === '2-way' ? ['off', 'on'] : ['off', 'on', 'all'];
    let index = states.indexOf(this.value());
    index = (index + number + states.length) % states.length;
    this.value.set(states[index]);
  }

  protected setValueAndClose(value : State) {
    this.value.set(value);
    this.tooltipChange().hide();
  }
}

