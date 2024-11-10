import { Component, Input, OnInit, Renderer2, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import {KalendarzComponent} from '../kalendarz/kalendarz.component';
@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [KalendarzComponent],
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
}
