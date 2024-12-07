import {AfterViewInit, Component, ElementRef, EventEmitter, Output, ViewChild} from '@angular/core';
import { DataBaseService } from "../data-base.service";

@Component({
  selector: 'app-card-input',
  standalone: true,
  imports: [],
  templateUrl: './card-input.component.html',
  styleUrls: ['./card-input.component.css']
})
export class CardInputComponent implements AfterViewInit{
  @Output() cardChange = new EventEmitter<string>();
  today: Date = new Date();
  todayString: string = this.today.toString();

  @ViewChild('cardInput') cardInput: ElementRef<HTMLInputElement> | undefined;

  ngAfterViewInit() {
    this.focusInput();
  }



  focusInput() {
    (this.cardInput!.nativeElement as HTMLInputElement).focus();
    console.log("blur", this.cardInput!.nativeElement)
  }

  constructor(private dataService: DataBaseService) {}

  handleSubmit(event: Event) {
    event.preventDefault();
    let cardInput = ((event.target as HTMLElement).children[0] as HTMLInputElement).value;
    this.cardChange.emit(cardInput);
  }
}
