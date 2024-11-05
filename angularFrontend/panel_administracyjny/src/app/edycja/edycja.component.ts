import {Component, Input, SimpleChanges, ElementRef} from '@angular/core';
import {DataBaseService} from '../data-base.service';

@Component({
  selector: 'app-edycja',
  standalone: true,
  imports: [],
  templateUrl: './edycja.component.html',
  styleUrl: './edycja.component.css'
})
export class EdycjaComponent {
  @Input() typ: string | undefined;
  constructor(private el: ElementRef, private dataService: DataBaseService) {

  }
  ngOnChanges(changes : SimpleChanges) {
    if(changes['typ']) {
      if(this.typ === 'ZSTI') {
        this.el.nativeElement.querySelectorAll('.internat').forEach((element : HTMLElement) => {
          element.style.display = 'none';
        })
        this.el.nativeElement.querySelectorAll('.zsti').forEach((element : HTMLElement) => {
          element.style.display = 'flex';
        })
      }
      else if(this.typ === 'Internat') {
        this.el.nativeElement.querySelectorAll('.zsti').forEach((element : HTMLElement) => {
          element.style.display = 'none';
        })
        this.el.nativeElement.querySelectorAll('.internat').forEach((element : HTMLElement) => {
          element.style.display = 'flex';
        })
      }
    }
  }
}
