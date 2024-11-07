import {Component, OnInit, ElementRef} from '@angular/core';
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
  zsti_users: Array<{imie: string[], nazwisko: string[]}> = [
  {
    imie: [],
    nazwisko: []
  }
  ];
  internat_users : Array<{imie: string[], nazwisko: string[]}> = [
  {
    imie: [],
    nazwisko: []
  }
  ];
  StudentListZstiData:any = null;
  StudentListInternatData:any = null;
  constructor(private dataService:DataBaseService, private el: ElementRef) {

  }
  ngOnInit() {
    this.dataService.StudentListZstiData.subscribe((data: any) => {
      this.StudentListZstiData = data;
      if(this.StudentListZstiData != null) {
        this.zsti_users[0].imie = this.StudentListZstiData.map((element: any) => element.imie.toLowerCase());
        this.zsti_users[0].nazwisko = this.StudentListZstiData.map((element: any) => element.nazwisko.toLowerCase());
      }
    });
    this.dataService.StudentListInternatData.subscribe((data: any) => {
      this.StudentListInternatData = data;
      if(this.StudentListInternatData != null) {
        this.internat_users[0].imie = this.StudentListInternatData.map((element: any) => element.imie.toLowerCase());
        this.internat_users[0].nazwisko = this.StudentListInternatData.map((element: any) => element.nazwisko.toLowerCase());
      }
    });
  }
  szukaj() {
    let zsti_current: string[] = [];
    this.el.nativeElement.querySelectorAll('section:nth-of-type(1) > ol > li').forEach((element : HTMLElement) => {
      zsti_current.push(element.textContent!);
    })
    const searchTerm = this.el.nativeElement.querySelector('#wyszukaj > input').value.toLowerCase();
    if(searchTerm === '') {
      this.el.nativeElement.querySelectorAll('section:nth-of-type(1) > ol > li').forEach((element : HTMLElement) => {
        element.style.display = 'block';
      })
      this.el.nativeElement.querySelectorAll('section:nth-of-type(2) > ol > li').forEach((element : HTMLElement) => {
        element.style.display = 'block';
      })
      return;
    }
    this.rozwin(this.el.nativeElement.querySelector('section:nth-of-type(1) > button'), 3, true);
    this.rozwin(this.el.nativeElement.querySelector('section:nth-of-type(2) > button'), 4, true);
    this.el.nativeElement.querySelectorAll('section:nth-of-type(1) > ol > li').forEach((element : HTMLElement) => {
      if(!element.textContent?.includes(searchTerm)) {
        element.style.display = 'none';
      }
      else {
        element.style.display = 'block';
      }
    })
    this.el.nativeElement.querySelectorAll('section:nth-of-type(2) > ol > li').forEach((element : HTMLElement) => {
      if(!element.textContent?.includes(searchTerm)) {
        element.style.display = 'none';
      }
      else {
        element.style.display = 'block';
      }
    })
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
    // @ts-ignore
    if(!this.StudentListZstiData[daneTarget.getAttribute('data-index')])
      return
    if(this.typ === "ZSTI") {
      this.dataService.changeStudent(this.StudentListZstiData[daneTarget.getAttribute('data-index')!].id, this.typ)
    }
    else{
      this.dataService.changeStudent(this.StudentListInternatData[daneTarget.getAttribute('data-index')!].id, this.typ)
    }
  }
    rozwin(event: Event, number: number, szukaj : boolean) {
      let target = szukaj ? event : (event.target as HTMLElement);
      // @ts-ignore
      target = target.parentElement as HTMLElement;
      target = target.parentElement as HTMLElement;
      let img = target.querySelector(`:nth-child(${number}) > button img`) as HTMLElement;
      target = target.querySelector(`:nth-child(${number}) > ol`) as HTMLElement;
      if(target.style.opacity === '1' && !szukaj) {
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
