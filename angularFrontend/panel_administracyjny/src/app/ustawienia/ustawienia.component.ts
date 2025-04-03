import { Component, ElementRef, OnInit } from '@angular/core';
import {NgOptimizedImage} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
    selector: 'app-ustawienia',
    imports: [
        NgOptimizedImage,
        FormsModule
    ],
    templateUrl: './ustawienia.component.html',
    styleUrl: './ustawienia.component.css'
})
export class UstawieniaComponent {
  DOMelement: any | undefined;
  color : any = {
    background_color: "",
    primary_color: "",
    secondary_color: "",
    third_color: "",
    accent_color: "",
    border_color: "",
    text_color: "",
    gradient: "",
    disabled_global_day: "",
    disabled_working_day: "",
    out_declaration: "",
    disabled: "",
    disabled_text_color: "",
  };
  constructor(private el: ElementRef) {
    this.DOMelement = this.el.nativeElement as HTMLElement;
  }
  ngOnInit() : void {
    Object.keys(this.color).forEach((key : string) : void => {
      const cssKey : string = key.includes('_') ? key.replace(/_/g, '-') : key;
      this.color[key] = localStorage.getItem(cssKey) || this.CSS(`--${cssKey}`);
      document.documentElement.style.setProperty(`--${cssKey}`, this.color[key]);
    });
  }
  CSS(value : string) : string {
    const root : HTMLElement = document.documentElement;
    const styles : CSSStyleDeclaration = getComputedStyle(root);
    const cssKey : string = value.includes('_') ? value.replace(/_/g, '-') : value;
    return styles.getPropertyValue(cssKey).trim();
  }
  hide() : void {
    (this.DOMelement.querySelector('section') as HTMLElement).style.display = 'none';
  }
  show() : void {
    (this.DOMelement.querySelector('section') as HTMLElement).style.display = 'flex';
    Object.keys(this.color).forEach((key : string) : void => {

      this.color[key] = this.CSS(`--${key}`);``
    })
  }
  save() : void {
    Object.keys(this.color).forEach((key : string) : void => {
      const cssKey : string = key.includes('_') ? key.replace(/_/g, '-') : key;
      document.documentElement.style.setProperty(`--${cssKey}`, this.color[key]);
      localStorage.setItem(cssKey, this.color[key]);
    });
    this.hide();
  }

  reset() : void {
    const values : string[] = ['F1F0E8','B3C8CF','89A8B2','5F7F8A','3B5A65','2A3F4A','212121','b5bdcc','7e7eab','A9A9BE','a2a2e7','6ca8b7','2d2d2d'];
    Object.keys(this.color).forEach((key : string, index : number) : void => {
      const cssKey : string = key.includes('_') ? key.replace(/_/g, '-') : key;
      this.color[key] = `#${values[index]}`;
      document.documentElement.style.setProperty(`--${cssKey}`, this.color[key]);
      localStorage.setItem(cssKey, this.color[key]);
    });
  }
}
