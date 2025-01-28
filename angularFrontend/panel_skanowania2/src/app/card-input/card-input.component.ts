import {AfterViewInit, Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {DataBaseService} from '../data-base.service';

@Component({
  selector: 'app-card-input',
  imports: [
    FormsModule
  ],
  templateUrl: './card-input.component.html',
  styleUrl: './card-input.component.css'
})
export class CardInputComponent implements AfterViewInit {
  @Output() cardChange = new EventEmitter<string>();
  @ViewChild('cardInput') cardInput: any;
  textInput: any;
  constructor(private dataService: DataBaseService) {
    // setInterval(() => this.focusInput(), 500);
    // this.focusInput()
    this.onBlur()
    this.dataService.CurrentStudent.subscribe((data: any) => this.onBlur())
  }
  handleSubmit(event: Event) : void {
    event.preventDefault();
    console.log(`Entered card input: ${this.textInput}`);
    this.cardChange.emit(this.textInput);
    this.textInput = '';
  }

  ngAfterViewInit() {
    this.focusInput();
  }

  onBlur()
  {
    setTimeout(() => this.focusInput(), 100)
  }

  focusInput() {
    this.cardInput.nativeElement.focus();
  }

}
