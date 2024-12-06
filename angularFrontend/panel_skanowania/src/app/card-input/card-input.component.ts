import {Component, EventEmitter, output, Output} from '@angular/core';
import {DataBaseService} from "../data-base.service";

@Component({
  selector: 'app-card-input',
  standalone: true,
  imports: [],
  templateUrl: './card-input.component.html',
  styleUrl: './card-input.component.css'
})
export class CardInputComponent {
  cardChange = output<string>()
  today: Date = new Date();
  todayString: string = this.today.toString();
  constructor(private dataService: DataBaseService) {
  }

  setNewName(event: Event)
  {
    this.cardChange.emit((event.target as HTMLInputElement).value);
  }

  handleSubmit(event: Event) {
    event.preventDefault();
    let cardInput = ((event.target as HTMLElement).children[0] as HTMLInputElement).value;
    this.cardChange.emit(cardInput);

  }


}
