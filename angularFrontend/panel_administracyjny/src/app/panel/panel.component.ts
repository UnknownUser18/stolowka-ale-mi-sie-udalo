import { Component, Input, OnInit, Renderer2, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import {KalendarzComponent} from '../kalendarz/kalendarz.component';
import {EdycjaComponent} from '../edycja/edycja.component';

@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [KalendarzComponent, EdycjaComponent],
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
    switch (text) {
      case 'Kalendarz':
        this.contents = ['kalendarz'];
        this.renderer.setStyle(kalendarz, 'display', 'block');
        this.renderer.setStyle(edycja, 'display', 'none');
        break;
      case 'Edytuj':
        this.contents = ['edycja'];
        this.renderer.setStyle(kalendarz, 'display', 'none');
        this.renderer.setStyle(edycja, 'display', 'block');
        break;
      default:
        break;
    }
  }
  contents = ['kalendarz']
}
