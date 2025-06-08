import {AfterViewInit, Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {DataBaseService} from '../data-base.service';
import {AutoCompleteComponent} from '../auto-complete/auto-complete.component';

@Component({
  selector: 'app-card-input',
  imports: [
    FormsModule,
    AutoCompleteComponent
  ],
  templateUrl: './card-input.component.html',
  standalone: true,
  styleUrl: './card-input.component.css'
})
export class CardInputComponent{
  @Output() cardChange = new EventEmitter<string>();

  handleSubmit(inputEvent: number) : void {
    console.log(`Entered card input: ${inputEvent}`);
    this.cardChange.emit(inputEvent.toString());
  }

}
