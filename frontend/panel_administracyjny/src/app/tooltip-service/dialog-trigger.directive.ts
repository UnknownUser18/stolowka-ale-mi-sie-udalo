import { Directive, input } from '@angular/core';
import { DialogComponent } from './dialog/dialog.component';

@Directive({
  selector: '[dialog]',
  host : {
    '(click)' : 'dialog()?.show()',
    '(keydown.enter)' : 'dialog()?.show()'
  }
})
export class DialogTriggerDirective {
  public dialog = input.required<DialogComponent>({ alias : 'dialog' });

  constructor() { }

}
