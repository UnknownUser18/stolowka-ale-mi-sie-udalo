import { Component, OnInit, ElementRef } from '@angular/core';
import { PanelComponent } from './panel/panel.component';
import {NgForOf, NgIf, NgOptimizedImage} from '@angular/common';
import { DataBaseService } from './data-base.service';
import { GlobalnyPanelComponent } from './globalny-panel/globalny-panel.component';
import { MatDialog } from '@angular/material/dialog';
import { UnsavedChangesDialogComponent } from './unsaved-changes-dialog/unsaved-changes-dialog.component';
import {UstawieniaComponent} from './ustawienia/ustawienia.component';

export function toBinary(num : number, len : number): string {
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
  assignValues(student : any) : this;
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
  assignValues(student : OsobaZSTI) : this {
    this.id = student.id;
    this.imie = student.imie;
    this.nazwisko = student.nazwisko;
    this.typ_osoby_id = student.typ_osoby_id;
    this.klasa = student.klasa;
    this.uczeszcza = student.uczeszcza;
    return this;
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
  assignValues(student : OsobaInternat) : this {
    this.id = student.id
    this.imie = student.imie;
    this.nazwisko = student.nazwisko;
    this.uczeszcza = student.uczeszcza;
    this.grupa = student.grupa;
    return this;
  }
}
interface GetDisabledDays {
  dzien_wypisania: string;
  uwagi: string;
}
export class GetZSTIDisabledDays implements GetDisabledDays {
  constructor(
    public dzien_wypisania: string,
    public osoby_zsti_id: number,
    public uwagi: string
  ) {}
}
export class GetInternatDisabledDays implements GetDisabledDays {
  constructor(
    public posilki_id : number,
    public dzien_wypisania : string,
    public osoby_internat_id : number,
    public uwagi : string,
  ) {}
}
export class Deklaracja {
  data_od : string | undefined;
  data_do : string | undefined;
  rok_szkolny_id : number | undefined;
  rok_szkolny : string | undefined;
  id_osoby : number | undefined;
  constructor(data_od?: string, data_do?: string, rok_szkolny_id?: number, id_osoby?: number) {
    this.data_od = data_od;
    this.data_do = data_do;
    this.rok_szkolny_id = rok_szkolny_id;
    this.id_osoby = id_osoby;
  }
  assignValues(declaration : DeklaracjaZSTI | DeklaracjaInternat) : this   {
    this.data_od = declaration.data_od;
    this.data_do = declaration.data_do;
    this.rok_szkolny_id = declaration.rok_szkolny_id;
    this.id_osoby = declaration.id_osoby;
    return this;
  }
}
export class DeklaracjaZSTI extends Deklaracja {
  dni: {type : string, data : number[] }| undefined;
  constructor(data_od?: string, data_do?: string, rok_szkolny_id?: number, id_osoby?: number, dni?: {type : string, data : number[] }) {
    super(data_od, data_do, rok_szkolny_id, id_osoby);
    this.dni = dni;
  }
  override assignValues(declaration : DeklaracjaZSTI) : this {
    super.assignValues(declaration);
    this.dni = declaration.dni;
    return this;
  }
}
export class DeklaracjaInternat extends Deklaracja {
  wersja: number | undefined;
  constructor(data_od?: string, data_do?: string, rok_szkolny_id?: number, id_osoby?: number, wersja?: number) {
    super(data_od, data_do, rok_szkolny_id, id_osoby);
    this.wersja = wersja;
  }
  override assignValues(declaration : DeklaracjaInternat) : this {
    super.assignValues(declaration);
    this.wersja = declaration.wersja;
    return this;
  }
}
export interface DisabledDays{
  id:number,
  dzien: string
}

export interface Payments{
  id: number,
  id_ucznia: number,
  platnosc: number,
  data_platnosci: string,
  miesiac: number,
  opis: string,
  rok: number
}

export interface Cards{
  id: number,
  id_ucznia: number,
  key_card:number,
  data_wydania: string,
  ostatnie_uzycie:string
}

export class ScanZstiExtended{
  id: number | undefined;
  id_osoby: number | undefined;
  czas: string | undefined;
  constructor(id?: number, id_ucznia?: number, czas?: string) {
    this.id = id;
    this.id_osoby = id_ucznia;
    this.czas = czas;
  }
  assignValues(other: ScanZstiExtended):this
  {
    this.id = other.id;
    this.id_osoby = other.id_osoby;
    this.czas = other.czas;
    return this;
  }
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    imports: [PanelComponent, NgOptimizedImage, NgForOf, GlobalnyPanelComponent, NgIf, UstawieniaComponent],
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  DOMelement: any | undefined;
  StudentListZsti: OsobaZSTI[] | undefined;
  StudentListInternat: OsobaInternat[] | undefined;
  osoba: string | undefined;
  title: string = 'panel_administracyjny';
  typ: string | undefined;

  constructor(private dataService: DataBaseService, private el: ElementRef, private dialog: MatDialog) {
    this.DOMelement = this.el.nativeElement;
    // setInterval(() => {console.log("Niggas")}, 1000)
  }

  ngOnInit() : void {
    this.dataService.StudentListZsti.asObservable().subscribe((data: Array<OsobaZSTI>): void => {
      this.StudentListZsti = data?.map((student: OsobaZSTI): OsobaZSTI => new OsobaZSTI().assignValues(student));
    });
    this.dataService.StudentListInternat.asObservable().subscribe((data : Array<OsobaInternat>) : void => {
      this.StudentListInternat = data?.map((student: OsobaInternat): OsobaInternat => new OsobaInternat().assignValues(student));
    });
  }

  szukaj() : void {
    const searchTerm : string = this.DOMelement?.querySelector('#wyszukaj > input')?.value.toLowerCase() || '';
    const sectionsZsti : NodeListOf<HTMLLIElement> = this.DOMelement?.querySelectorAll('section:nth-of-type(1) > ol > li')!;
    const sectionsInternat : NodeListOf<HTMLLIElement> = this.DOMelement?.querySelectorAll('section:nth-of-type(2) > ol > li')!;
    function filterSections(sections: NodeListOf<HTMLLIElement>) : void  {
      sections.forEach((li: HTMLLIElement) : void => {
        li.style.display = li.textContent?.toLowerCase().includes(searchTerm) ? 'block' : 'none';
        if (li.style.display === 'block') {
          const section = li.parentElement?.parentElement as HTMLElement;
          section.querySelector('ol')!.classList.add('show');
          section.querySelector('img')!.classList.add('rotate');
        }
      });
    }
    filterSections(sectionsZsti);
    filterSections(sectionsInternat);
    if (searchTerm === '') {
      function showAllSections(sections: NodeListOf<HTMLLIElement>) : void {
        sections.forEach((li: HTMLLIElement) : void => {
          li.style.display = 'block';
        });
      }

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

  show(event : Event, typ : string | null): void {
    if(typ) this.typ = typ;
    if (this.dataService.SavedList.some(element => !element.value)) {
      this.cantDoThat(() => this.show(event, null));
      return;
    }
    let target : HTMLElement = event.target as HTMLElement;
    if (target.tagName === 'OL') return;
    while (target.tagName !== 'LI') {
      target = target.parentElement as HTMLElement;
    }
    (this.DOMelement?.querySelector('app-globalny-panel') as HTMLElement).style.display = 'none';
    (this.DOMelement?.querySelector('app-panel') as HTMLElement).style.display = 'block';
    this.osoba = target.querySelector('span')?.textContent!;

    const index : number = parseInt(target.getAttribute('data-index')!, 10);
    const studentData = this.typ === 'ZSTI' ? this.StudentListZsti : this.StudentListInternat;
    if (studentData && studentData[index].id && this.typ) {
      this.dataService.changeStudent(studentData[index].id, this.typ);
    }
  }



  rozwin(event: Event) : void {
    let target : HTMLElement = event.target as HTMLElement;
    while (target.tagName !== 'BUTTON') {
      target = target.parentElement!;
    }
    target.querySelector('img')!.classList.toggle('rotate');
    target.nextElementSibling!.classList.toggle('show');
  }

  main_menu(): void {
    (this.DOMelement?.querySelector('app-globalny-panel') as HTMLElement).style.display = 'block';
    (this.DOMelement?.querySelector('app-panel') as HTMLElement).style.display = 'none';
  }
}
