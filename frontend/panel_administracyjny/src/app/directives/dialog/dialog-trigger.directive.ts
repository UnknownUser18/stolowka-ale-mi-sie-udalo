import { Directive, input } from '@angular/core';
import { Dialog } from '@modals/dialog/dialog';

@Directive({
  selector: '[dialog]',
  host : {
    '(click)' : 'dialog()?.show()',
    '(keydown.enter)' : 'dialog()?.show()'
  }
})
export class DialogTriggerDirective {
  public dialog = input.required<Dialog>({ alias : 'dialog' });

  constructor() { }

}
