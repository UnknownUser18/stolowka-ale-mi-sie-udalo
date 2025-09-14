import { Component, forwardRef, input, viewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TooltipComponent } from '@tooltips/tooltip/tooltip.component';
import { TooltipDelayTriggerDirective } from '@tooltips/tooltip-delay-trigger.directive';
import { TooltipAuxClickTriggerDirective } from '@tooltips/tooltip-aux-click-trigger.directive';
import { faArrowsRotate, faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

export type State = 'on' | 'off' | 'all';

export type SwitchType = '2-way' | '3-way';

@Component({
  selector : 'app-switch',
  imports : [
    TooltipComponent,
    TooltipDelayTriggerDirective,
    TooltipAuxClickTriggerDirective,
    FaIconComponent
  ],
  templateUrl : './switch.component.html',
  styleUrl : './switch.component.scss',
  providers : [
    {
      provide : NG_VALUE_ACCESSOR,
      useExisting : forwardRef(() => SwitchComponent),
      multi : true,
    },
  ],
  host : {
    '[class.on]' : "value === 'on'",
    '[class.off]' : "value === 'off'",
    '[class.all]' : "value === 'all'",
    '[class.twoWay]' : "type() === '2-way'",
  }
})
export class SwitchComponent implements ControlValueAccessor {

  protected tooltipChange = viewChild.required<TooltipComponent>('tooltipChange');
  protected labels = input({ off : 'Off', on : 'On', all : 'All' });

  protected readonly faXmark = faXmark;
  protected readonly faCheck = faCheck;
  protected readonly faArrowsRotate = faArrowsRotate;

  public label = input.required<string>();
  public type = input<SwitchType>('2-way');

  constructor() {
  }

  public value : State = 'off';

  private onChange : (value : State) => void = () => {
  };
  private onTouched : () => void = () => {
  };

  protected changeStep(number : number) {
    const states : State[] = this.type() === '2-way' ? ['off', 'on'] : ['off', 'on', 'all'];
    let index = states.indexOf(this.value);
    index = (index + number + states.length) % states.length;
    this.value = states[index];

    this.onChange(this.value);
    this.onTouched();
  }

  protected setValueAndClose(value : State) {
  this.value = value;
    this.tooltipChange().hide();
  }

  public writeValue(value : State) : void {
    if (value !== undefined && value !== null) {
      this.value = value;
    }
  }

  public registerOnChange(fn : (value : State) => void) : void {
    this.onChange = fn;
  }

  public registerOnTouched(fn : () => void) : void {
    this.onTouched = fn;
  }

}

