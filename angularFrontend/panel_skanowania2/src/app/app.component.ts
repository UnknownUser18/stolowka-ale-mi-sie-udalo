import {Component, ElementRef} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {CardInputComponent} from './card-input/card-input.component';
import {CardOutputComponent} from './card-output/card-output.component';
import {DataBaseService} from './data-base.service';
import {ClockComponent} from './clock/clock.component';

@Component({
  selector: 'app-root',
  imports: [CardInputComponent, CardOutputComponent, ClockComponent],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'panel_skanowania2';
  DOMelement: any | undefined;
  constructor(private dataService: DataBaseService, private el: ElementRef) {
    this.DOMelement = this.el.nativeElement;
    setTimeout(() => {
      (this.DOMelement?.querySelector('app-card-input') as HTMLElement).style.display = 'block';
      (this.DOMelement?.querySelector('app-card-output') as HTMLElement).style.display = 'none';
    }, 100)
  }

  handleCardInput(inputEvent: string): void
  {
    console.log(inputEvent);
    (this.DOMelement?.querySelector('app-card-input') as HTMLElement).style.display = 'none';
    (this.DOMelement?.querySelector('app-card-output') as HTMLElement).style.display = 'block';
    this.dataService.keycardInput.next(inputEvent);
  }

  handleReset() : void
  {
    (this.DOMelement?.querySelector('app-card-input') as HTMLElement).style.display = 'block';
    (this.DOMelement?.querySelector('app-card-output') as HTMLElement).style.display = 'none';
  }
}

export function toBinary(num: number, len: number): string {
  console.log('num: ', num, 'len: ', len);
  let binary : string = Number(num).toString(2)
  for (let i : number = 0; i < len - binary.length; i++) {
    binary = '0' + binary
  }
  return binary;
}

export class daneOsobowe{
  name: string;
  surname: string;
  znaleziony?: boolean
  constructor(name: string, surname: string, znaleziony?: boolean) {
    this.name = name;
    this.surname = surname;
    if(znaleziony) this.znaleziony = znaleziony;
    else this.znaleziony = false;
  }
  setAttributes(name: string, surname: string, znaleziony?: boolean) {
    this.name = name;
    this.surname = surname;
    if(znaleziony) this.znaleziony = znaleziony;
    else this.znaleziony = false;
  }
}
