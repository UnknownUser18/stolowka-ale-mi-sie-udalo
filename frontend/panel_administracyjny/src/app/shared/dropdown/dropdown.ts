import { Component, computed, input, model, signal } from '@angular/core';
import { FormValueControl } from "@angular/forms/signals";
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

@Component({
  selector    : 'dropdown',
  imports     : [
    FaIconComponent
  ],
  templateUrl : './dropdown.html',
  styleUrl    : './dropdown.scss',
})
export class Dropdown implements FormValueControl<string> {
  protected readonly isOpen = signal(false);
  protected readonly displayValue = computed(() => {
    const val = this.value();
    return this.values().get(val) ?? 'Wybierz...';
  });
  protected readonly faChevronDown = faChevronDown;
  protected readonly Array = Array;

  public readonly values = input.required<Map<string, string>>();
  public readonly defaultValue = input<string>('');
  public readonly value = model<string>(this.defaultValue());

  constructor() {}

  protected select(value : string) {
    this.value.set(value);
    this.isOpen.set(false);
  }

  protected toggle() {
    this.isOpen.update(v => !v);
  }

}
