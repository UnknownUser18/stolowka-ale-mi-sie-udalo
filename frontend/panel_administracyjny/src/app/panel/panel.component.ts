import { Component, Input, OnInit, Renderer2, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import {KalendarzComponent} from '../kalendarz/kalendarz.component';
import {EdycjaComponent} from '../edycja/edycja.component';
import {PlatnosciComponent} from '../platnosci/platnosci.component';
import {KartyComponent} from '../karty/karty.component';
import {DeklaracjeComponent} from '../deklaracje/deklaracje.component';

@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [KalendarzComponent, EdycjaComponent, PlatnosciComponent, KartyComponent, DeklaracjeComponent],
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.css']
})
export class PanelComponent implements OnInit, OnChanges {
  DOMelement: HTMLElement | null;
  @Input() name: string | undefined;
  @Input() typ: string | undefined;
  apps : { name : string, selector : string }[]  = [
    {name : 'Kalendarz', selector: 'app-kalendarz'},
    {name : 'Edytuj', selector: 'app-edycja'},
    {name : 'Płatności', selector: 'app-platnosci'},
    {name : 'Karty', selector: 'app-karty'},
    {name : 'Deklaracje', selector: 'app-deklaracje'}
  ]
  changeDisplay(index : number) : void {
    for(let i = 0; i < this.apps.length; i++) {
      if(i === index) {
        this.renderer.setStyle(this.DOMelement?.querySelector(this.apps[i].selector), 'display', 'block');
      }
      else {
        this.renderer.setStyle(this.DOMelement?.querySelector(this.apps[i].selector), 'display', 'none');
      }
    }
  }
  constructor(private renderer: Renderer2, private el: ElementRef) {
    this.DOMelement = this.el.nativeElement as HTMLElement | null;
  }

  ngOnInit() : void {
    this.updateMainDisplay();
    this.changeDisplay(0)
  }

  ngOnChanges(changes: SimpleChanges) : void {
    if (changes['name']) {
      this.updateMainDisplay();
    }
  }

  private updateMainDisplay() : void {
    const main : HTMLElement | null | undefined = this.DOMelement?.querySelector('main');
    if (this.name === undefined) {
      this.renderer.setStyle(main, 'display', 'none');
    } else {
      this.renderer.setStyle(main, 'display', 'flex');
    }
  }
  select(event: MouseEvent) : void  {
    let target : HTMLElement = event.target as HTMLElement;
    if(target.tagName !== 'BUTTON') return;
    let text : string = target.innerText;
    const appIndex : number = this.apps.findIndex(app => app.name === text);
    if (appIndex !== -1) {
      this.contents = [this.apps[appIndex].selector];
      this.changeDisplay(appIndex);
    }
    Array.from(target.parentElement?.children || []).forEach((element: Element) : void => {
      this.renderer.removeClass(element, 'selected');
    })
    this.renderer.addClass(target, 'selected');
  }
  contents : string[] = ['kalendarz']
}
