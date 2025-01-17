import { Component, OnInit, ElementRef } from '@angular/core';
import { PanelComponent } from './panel/panel.component';
import {NgForOf, NgIf, NgOptimizedImage} from '@angular/common';
import { DataBaseService } from './data-base.service';
import { GlobalnyPanelComponent } from './globalny-panel/globalny-panel.component';
import { MatDialog } from '@angular/material/dialog';
import { UnsavedChangesDialogComponent } from './unsaved-changes-dialog/unsaved-changes-dialog.component';


export function toBinary(num: number, len: number): string {
    let binary : string = Number(num).toString(2)
    for (let i : number = 0; i < len - binary.length; i++) {
      binary = '0' + binary
    }
    return binary;
  }
export interface Osoba {
  imie : string | undefined;
  nazwisko : string | undefined;
  uczeszcza : number | undefined;
}
export class OsobaZSTI implements Osoba {
  id: number | undefined;
  imie: string | undefined;
  nazwisko: string | undefined;
  typ_osoby_id: number | undefined;
  klasa: string | undefined;
  uczeszcza: number | undefined;
  constructor(id? : number, imie?: string, nazwisko?: string, typ_osoby_id?: number, klasa?: string, uczeszcza?: number) {
    this.id = id;
    this.imie = imie;
    this.nazwisko = nazwisko;
    this.typ_osoby_id = typ_osoby_id;
    this.klasa = klasa;
    this.uczeszcza = uczeszcza;
  }
  assignValues(student : OsobaZSTI) : void {
    this.imie = student.imie;
    this.nazwisko = student.nazwisko;
    this.typ_osoby_id = student.typ_osoby_id;
    this.klasa = student.klasa;
    this.uczeszcza = student.uczeszcza;
  }
}
export class OsobaInternat implements Osoba {
  id : number | undefined;
  imie: string | undefined;
  nazwisko: string | undefined;
  uczeszcza: number | undefined;
  grupa: string | undefined;
  constructor(id? : number, imie?: string, nazwisko?: string, uczeszcza?: number, grupa?: string) {
    this.id = id;
    this.imie = imie;
    this.nazwisko = nazwisko;
    this.uczeszcza = uczeszcza;
    this.grupa = grupa;
  }
  assignValues(student : OsobaInternat) : void {
    this.imie = student.imie;
    this.nazwisko = student.nazwisko;
    this.uczeszcza = student.uczeszcza;
  }
}
export interface Deklaracja {
  data_od : string | undefined;
  data_do : string | undefined;
  rok_szkolny_id : number | undefined;
  rok_szkolny : string | undefined;
  id_osoby : number | undefined;
}
export class DeklaracjaZSTI implements Deklaracja {
  data_od: string | undefined;
  data_do: string | undefined;
  rok_szkolny_id: number | undefined;
  rok_szkolny: string | undefined;
  id_osoby: number | undefined;
  dni: {type : string, data : number[] }| undefined;
  constructor(data_od?: string, data_do?: string, rok_szkolny_id?: number, id_osoby?: number, dni?: {type : string, data : number[] }) {
    this.data_od = data_od;
    this.data_do = data_do;
    this.rok_szkolny_id = rok_szkolny_id;
    this.id_osoby = id_osoby;
    this.dni = dni;
  }
  assignValues(declaration : any) : void {
    this.data_od = declaration.data_od;
    this.data_do = declaration.data_do;
    this.rok_szkolny_id = declaration.rok_szkolny_id;
    this.id_osoby = declaration.id_osoby;
    this.dni = declaration.dni;
  }
}
export class DeklaracjaInternat implements Deklaracja {
  data_od: string | undefined;
  data_do: string | undefined;
  rok_szkolny_id: number | undefined;
  rok_szkolny: string | undefined;
  id_osoby: number | undefined;
  wersja: number | undefined;
  constructor(data_od?: string, data_do?: string, rok_szkolny_id?: number, id_osoby?: number, wersja?: number) {
    this.data_od = data_od;
    this.data_do = data_do;
    this.rok_szkolny_id = rok_szkolny_id;
    this.id_osoby = id_osoby;
    this.wersja = wersja;
  }
  assignValues(declaration : any) : void {
    this.data_od = declaration.data_od;
    this.data_do = declaration.data_do;
    this.rok_szkolny_id = declaration.rok_szkolny_id;
    this.id_osoby = declaration.id_osoby;
    this.wersja = declaration.wersja;
  }
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [PanelComponent, NgOptimizedImage, NgForOf, GlobalnyPanelComponent, NgIf],
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  DOMelement: HTMLElement | null;
  StudentListZstiData: OsobaZSTI[] | undefined;
  StudentListInternatData: OsobaInternat[] | undefined;
  osoba: string | undefined;
  title: string = 'panel_administracyjny';
  typ: string | undefined;

  constructor(private dataService: DataBaseService, private el: ElementRef, private dialog: MatDialog) {
    this.DOMelement = this.el.nativeElement as HTMLElement | null;
  }

  ngOnInit() : void {
    this.dataService.StudentListZsti.asObservable().subscribe((data : OsobaZSTI) : void => this.updateUserList(data, 'ZSTI'));
    this.dataService.StudentListInternat.asObservable().subscribe((data : OsobaInternat) : void => this.updateUserList(data, 'Internat'));
    // this.dataService.StudentType.asObservable().subscribe((data:any) => this.typ = data)
  }

  updateUserList(data: unknown, type: string) {
    this.typ = this.dataService.StudentType.value; // to linijka zabrała mi 1 godzine na naprawnienie błędu 🦅🦅🦅🦅🦅🦅⭐⭐⭐🐷🍖🐻
    // Ta kurwa linijka wszystko psuła 😀😀😉😚😶😯😶🙂😎😎🙂😏😣😥😌😔😓😓🙁😧🥵😡😠🤧🧐👻👻😼🐱‍🐉🐱‍👓🐱‍👓🐺
    if (type === 'ZSTI') {
      this.StudentListZstiData = data as OsobaZSTI[];
    } else if(type === 'Internat') {
      this.StudentListInternatData = data as OsobaInternat[];
    }
    else {
      console.error('Invalid type at updateUserList');
    }
  }

  szukaj() : void {
    const searchTerm : string = this.el.nativeElement.querySelector('#wyszukaj > input')?.value.toLowerCase() || '';
    const sectionsZsti = this.DOMelement?.querySelectorAll('section:nth-of-type(1) > ol > li');
    const sectionsInternat = this.DOMelement?.querySelectorAll('section:nth-of-type(2) > ol > li');
    if(!sectionsZsti || !sectionsInternat) {
      console.error('Sections not found');
      return;
    }
    const filterSections = (sections: NodeListOf<Element> | null) : void => {
      sections?.forEach((element: Element) : void => {
        let htmlElement : HTMLElement = element as HTMLElement;
        htmlElement.style.display = htmlElement.textContent?.toLowerCase().includes(searchTerm) ? 'block' : 'none';
        if (htmlElement.style.display === 'block') {
          htmlElement = htmlElement.parentElement?.parentElement as HTMLElement;
          const ol = htmlElement.querySelector('ol');
          const img = htmlElement.querySelector('img');
          if (ol) ol.classList.add('show');
          if (img) img.classList.add('rotate');
        }
      });
    };
    filterSections(sectionsZsti);
    filterSections(sectionsInternat);
    if (searchTerm === '') {
      const showAllSections = (sections: NodeListOf<Element> | null) => {
        sections?.forEach((element: Element) => {
          const htmlElement = element as HTMLElement;
          htmlElement.style.display = 'block';
        });
      };

      showAllSections(sectionsZsti);
      showAllSections(sectionsInternat);
    }
  }

  cantDoThat(func: Function) : void {
    const dialogRef = this.dialog.open(UnsavedChangesDialogComponent, { width: '400px' });
    dialogRef.afterClosed().subscribe((result : string) : void => {
      if (result === 'proceed') {
        this.dataService.SavedList.forEach(element => element.next(true));
        func();
      }
    });
  }

  show(event: Event, typ : string | null): void {
    if(typ) this.typ = typ;
    if (this.dataService.SavedList.some(element => !element.value)) {
      this.cantDoThat(() => this.show(event, null));
      return;
    }
    let target = event.target as HTMLElement;
    if (target.tagName === 'OL') return;
    while (target.tagName !== 'LI') {
      target = target.parentElement as HTMLElement;
    }
    const globalnyPanel = this.DOMelement?.querySelector('app-globalny-panel') as HTMLElement | null;
    const panel = this.DOMelement?.querySelector('app-panel') as HTMLElement | null;
    if (globalnyPanel) globalnyPanel.style.display = 'none';
    if (panel) panel.style.display = 'block';
    this.osoba = target.querySelector('span')?.textContent!;

    const index : number = parseInt(target.getAttribute('data-index')!, 10);
    const studentData = this.typ === 'ZSTI' ? this.StudentListZstiData : this.StudentListInternatData;
    if (studentData && studentData[index].id && this.typ) {
      this.dataService.changeStudent(studentData[index].id, this.typ);
    }
  }



  rozwin(event: Event) : void {
    let target : HTMLElement = event.target as HTMLElement;
    while (target.tagName !== 'BUTTON') {
      target = target.parentElement as HTMLElement;
    }
    const img = target.querySelector('img') as HTMLElement;
    const ol = target.nextElementSibling as HTMLElement;
    if (!ol) return;
    ol.classList.toggle('show');
    img.classList.toggle('rotate');
  }

  main_menu(): void {
    const globalnyPanel = this.DOMelement?.querySelector('app-globalny-panel') as HTMLElement | null;
    const panel = this.DOMelement?.querySelector('app-panel') as HTMLElement | null;
    if (globalnyPanel) globalnyPanel.style.display = 'block';
    if (panel) panel.style.display = 'none';
  }
}
