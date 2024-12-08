import {Component, ElementRef} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {CardInputComponent} from "./card-input/card-input.component";
import {CardOutputComponent} from "./card-output/card-output.component";
import {NgIf} from "@angular/common";
import {DataBaseService} from "./data-base.service";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CardInputComponent, CardOutputComponent, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'panel_skanowania';
  toggleVisibility: boolean = false;
  value:string = 'nic';

  constructor(private dataService:DataBaseService, private el: ElementRef) {
    this.dataService.CurrentStudentCardFromKeyCard.asObservable().subscribe((element:any) => this.handleCardResult())
    this.toggleVisibility = false;
  }

  handleCardRequest(input:string)
  {
    this.value = input;
    this.dataService.getStudentFromCardZsti(parseInt(input))
    this.dataService.getStudentFromCardInternat(parseInt(input))
  }


  handleCardResult()
  {
    this.toggleVisibility = true;
  }

  handleReset()
  {
    this.toggleVisibility = false;
    this.el.nativeElement.querySelector('input').focus();
    (this.el.nativeElement.querySelector('input') as HTMLInputElement ).value = '';
  }


}
