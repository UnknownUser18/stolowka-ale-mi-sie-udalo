import { Component } from '@angular/core';
import { PanelComponent } from './panel/panel.component';
import {NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [PanelComponent, NgOptimizedImage],
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  osoba : string | undefined;
  title: string = 'panel_administracyjny';
  typ : string | undefined;
  show(event: Event) {
    let target = event.target as HTMLElement;
    if(target.tagName == "SPAN") {
      target = target.parentElement as HTMLElement;
    }
    this.osoba = target.querySelector('span')?.textContent!;
    target = target.parentElement as HTMLElement;
    target = target.parentElement as HTMLElement;
    target = target.querySelector('button') as HTMLElement;
    this.typ = target.textContent!;
  }
    rozwin(event: Event, number: number) {
      let target = event.target as HTMLElement;
      target = target.parentElement as HTMLElement;
      target = target.parentElement as HTMLElement;
      let img = target.querySelector(`:nth-child(${number}) > button img`) as HTMLElement;
      target = target.querySelector(`:nth-child(${number}) > ol`) as HTMLElement;
      if(target.style.opacity === '1') {
        target.style.opacity = '0';
        target.style.maxHeight = '0';
        target.style.overflow = 'hidden';
        img.classList.remove('rotate');
        return;
      }
      else {
        target.style.opacity = '1';
        target.style.maxHeight = 'fit-content';
        target.style.overflow = 'visible';
        img.classList.add('rotate');
      }
    }
  }
