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
  clear_data(typ : string) {
    if(typ === 'podstawowe') {
      this.el.nativeElement.querySelectorAll('form[name="osoba"] > fieldset')[0].childNodes.forEach((element : HTMLFieldSetElement) => {
        console.log(element);
        element.childNodes.forEach((child : ChildNode) => {
          if(child.nodeName === 'INPUT') {
            (child as HTMLInputElement).value = '';
          }
        })
      })
    }
    else if(typ === 'deklaracja') {
      this.el.nativeElement.querySelectorAll('form[name="osoba"] > fieldset')[1].childNodes.forEach((element : HTMLFieldSetElement) => {
        element.childNodes.forEach((child : ChildNode) => {
          console.log(child);
          if(child.nodeName === 'INPUT') {
            (child as HTMLInputElement).value = '';
          }
          else if(child.nodeName === 'DIV') {
            child.childNodes.forEach((child2 : ChildNode) => {
              if(child2.nodeName === 'LABEL') {
                (child2.childNodes[0] as HTMLInputElement).checked = false;
              }
            })
          }
        })
      })
    }
  }
  remove_user() {
    console.log('remove user');
  }
}
