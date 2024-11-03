import {Component, OnInit} from '@angular/core';
import { PanelComponent } from './panel/panel.component';
import {NgForOf, NgOptimizedImage} from '@angular/common';
// @ts-ignore
import {DataBaseService} from './data-base.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [PanelComponent, NgOptimizedImage, NgForOf],
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  StudentListZstiData:any = null;
  StudentListInternatData:any = null;
  constructor(private dataService:DataBaseService) {

  }
  ngOnInit() {
    this.dataService.StudentListZstiData.subscribe((data: any) => this.StudentListZstiData = data);
    this.dataService.StudentListInternatData.subscribe((data: any) => this.StudentListInternatData = data);
  }

  osoba : string | undefined;
  title: string = 'panel_administracyjny';
  typ : string | undefined;
  show(event: Event) {
    let target = event.target as HTMLElement;
    if(target.tagName == "SPAN") {
      target = target.parentElement as HTMLElement;
    }
    let daneTarget = target;
    this.osoba = target.querySelector('span')?.textContent!;
    target = target.parentElement as HTMLElement;
    target = target.parentElement as HTMLElement;
    target = target.querySelector('button') as HTMLElement;
    this.typ = target.textContent!;
    if(this.typ === "ZSTI") {
      this.dataService.changeStudent(this.StudentListZstiData[daneTarget.getAttribute('data-index')!].id, this.typ)
    }
    else{
      this.dataService.changeStudent(this.StudentListInternatData[daneTarget.getAttribute('data-index')!].id, this.typ)
    }
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

  protected readonly JSON = JSON;
}
