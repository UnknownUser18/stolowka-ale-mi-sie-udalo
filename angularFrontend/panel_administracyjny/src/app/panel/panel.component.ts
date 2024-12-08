import { Component, Input, OnInit, Renderer2, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import {KalendarzComponent} from '../kalendarz/kalendarz.component';
import {EdycjaComponent} from '../edycja/edycja.component';
import {PlatnosciComponent} from '../platnosci/platnosci.component';
import {KartyComponent} from '../karty/karty.component';

@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [KalendarzComponent, EdycjaComponent, PlatnosciComponent, KartyComponent],
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.css']
})
export class PanelComponent implements OnInit, OnChanges {
  @Input() name: string | undefined;
  @Input() typ: string | undefined;

  constructor(private renderer: Renderer2, private el: ElementRef) {
  }

  ngOnInit() {
    this.updateMainDisplay();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['name']) {
      this.updateMainDisplay();
    }
  }

  private updateMainDisplay() {

    const main = this.el.nativeElement.querySelector('main');
    if (this.name === undefined) {
      this.renderer.setStyle(main, 'display', 'none');
    } else {
      this.renderer.setStyle(main, 'display', 'flex');
    }
  }
  select(event: MouseEvent) {
    console.log(this.el.nativeElement.querySelector('app-panel > main'));
    let target = event.target as HTMLElement;
    let text = target.innerText;
    let kalendarz = this.el.nativeElement.querySelector('app-kalendarz');
    let edycja = this.el.nativeElement.querySelector('app-edycja');
    let platnosci = this.el.nativeElement.querySelector('app-platnosci')
    let karty = this.el.nativeElement.querySelector('app-karty')
    switch (text) {
      case 'Kalendarz':
        this.contents = ['kalendarz'];
        this.renderer.setStyle(kalendarz, 'display', 'block');
        this.renderer.setStyle(edycja, 'display', 'none');
        this.renderer.setStyle(platnosci, 'display', 'none')
        this.renderer.setStyle(karty, 'display', 'none')
        Array.from((target.parentElement as HTMLElement).children).forEach((element: any) => {
          this.renderer.removeClass(element, 'selected');
        })
        this.renderer.addClass(target, 'selected');
        break;
      case 'Edytuj':
        this.contents = ['edycja'];
        this.renderer.setStyle(kalendarz, 'display', 'none');
        this.renderer.setStyle(karty, 'display', 'none')
        this.renderer.setStyle(platnosci, 'display', 'none')
        this.renderer.setStyle(edycja, 'display', 'block');
        Array.from((target.parentElement as HTMLElement).children).forEach((element: any) => {
          this.renderer.removeClass(element, 'selected');
        })
        this.renderer.addClass(target, 'selected');
        break;
      case 'Płatności':
        console.log("PLATNOSCI")
        this.contents = ['Płatności']
        this.renderer.setStyle(kalendarz, 'display', 'none');
        this.renderer.setStyle(karty, 'display', 'none')
        this.renderer.setStyle(edycja, 'display', 'none');
        this.renderer.setStyle(platnosci, 'display', 'block')
        Array.from((target.parentElement as HTMLElement).children).forEach((element: any) => {
            this.renderer.removeClass(element, 'selected');
        })
        this.renderer.addClass(target, 'selected');
        break;
      case 'Karty':
        console.log("KARTY")
        this.contents = ['Karty']
        this.renderer.setStyle(kalendarz, 'display', 'none');
        this.renderer.setStyle(edycja, 'display', 'none');
        this.renderer.setStyle(platnosci, 'display', 'none')
        this.renderer.setStyle(karty, 'display', 'block')
        Array.from((target.parentElement as HTMLElement).children).forEach((element: any) => {
          this.renderer.removeClass(element, 'selected');
        })
        this.renderer.addClass(target, 'selected');
        break;
      default:
        break;
    }
  }
  contents = ['kalendarz']
}
