import { Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FormCheckboxControl } from "@angular/forms/signals";

@Component({
  selector    : 'checkbox',
  imports     : [
    FormsModule,
    FaIconComponent
  ],
  templateUrl : './checkbox.html',
  styleUrl    : './checkbox.scss',
  providers   : [],
  host        : {
    role                  : 'checkbox',
    '[class.checked]'     : 'checked()',
    '[attr.aria-checked]' : 'checked()',
    '(click)'             : 'toggle()',
    '(keydown.space)'     : 'toggle()',
    tabindex              : '0'
  }
})
export class Checkbox implements FormCheckboxControl {
  public checked = model<boolean>(false);

  protected readonly faCheck = faCheck;

  constructor() {}

  protected toggle() {
    this.checked.update(checked => !checked);
  }
}
