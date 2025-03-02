import {Component, ElementRef} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {CardInputComponent} from './card-input/card-input.component';
import {CardOutputComponent} from './card-output/card-output.component';
import {DataBaseService} from './data-base.service';
import {ClockComponent} from './clock/clock.component';

@Component({
  selector: 'app-root',
  imports: [CardInputComponent, CardOutputComponent, ClockComponent],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'panel_skanowania2';
  DOMelement: any | undefined;
  constructor(private dataService: DataBaseService, private el: ElementRef) {
    this.DOMelement = this.el.nativeElement;
    setTimeout(() => {
      (this.DOMelement?.querySelector('app-card-input') as HTMLElement).style.display = 'block';
      (this.DOMelement?.querySelector('app-card-output') as HTMLElement).style.display = 'none';
    }, 100)
  }

  handleCardInput(inputEvent: string): void
  {
    console.log(inputEvent);
    (this.DOMelement?.querySelector('app-card-input') as HTMLElement).style.display = 'none';
    (this.DOMelement?.querySelector('app-card-output') as HTMLElement).style.display = 'block';
    this.dataService.keycardInput.next(inputEvent);
  }

  handleReset() : void
  {
    (this.DOMelement?.querySelector('app-card-input') as HTMLElement).style.display = 'block';
    (this.DOMelement?.querySelector('app-card-output') as HTMLElement).style.display = 'none';
  }
}

export function toBinary(num: number, len: number): string {
  console.log('num: ', num, 'len: ', len);
  let binary : string = Number(num).toString(2)
  for (let i : number = 0; i < len - binary.length; i++) {
    binary = '0' + binary
  }
  return binary;
}

export class daneOsobowe{
  name: string;
  surname: string;
  znaleziony?: boolean
  constructor(name: string, surname: string, znaleziony?: boolean) {
    this.name = name;
    this.surname = surname;
    if(znaleziony) this.znaleziony = znaleziony;
    else this.znaleziony = false;
  }
  setAttributes(name: string, surname: string, znaleziony?: boolean) {
    this.name = name;
    this.surname = surname;
    if(znaleziony) this.znaleziony = znaleziony;
    else this.znaleziony = false;
  }
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
