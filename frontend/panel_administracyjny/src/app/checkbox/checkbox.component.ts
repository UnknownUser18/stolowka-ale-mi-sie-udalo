import { Component, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector : 'app-checkbox',
  imports : [
    FormsModule,
    FaIconComponent
  ],
  templateUrl : './checkbox.component.html',
  styleUrl : './checkbox.component.scss',
  providers : [
    {
      provide : NG_VALUE_ACCESSOR,
      useExisting : forwardRef(() => CheckboxComponent),
      multi : true,
    },
  ],
  host : {
    role : 'checkbox',
    '[class.checked]' : 'isChecked',
    '[attr.aria-checked]' : 'isChecked',
    '(click)' : 'toggle()',
    '(keydown.space)' : 'toggle()',
    tabindex : '0'
  }
})
export class CheckboxComponent implements ControlValueAccessor {
  public isChecked = false;

  constructor() {
  }

  private onChange : (value : boolean) => void = () => {
  };

  private onTouched : () => void = () => {
  };

  public toggle() : void {
    this.isChecked = !this.isChecked;
    this.onChange(this.isChecked);
    this.onTouched();
  }

  public writeValue(value : boolean) : void {
    this.isChecked = value;
  }

  public registerOnChange(fn : (value : boolean) => void) : void {
    this.onChange = fn;
  }

  public registerOnTouched(fn : () => void) : void {
    this.onTouched = fn;
  }

  protected readonly faCheck = faCheck;
}
