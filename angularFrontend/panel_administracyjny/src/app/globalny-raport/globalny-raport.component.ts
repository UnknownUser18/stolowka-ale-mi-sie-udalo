import { Component, ElementRef, Renderer2 } from '@angular/core';
import * as XLS from 'xlsx';
import { DataBaseService } from '../data-base.service';
import {Osoba, OsobaZSTI, OsobaInternat, Deklaracja, DeklaracjaInternat, DeklaracjaZSTI} from '../app.component';


interface GetDisabledDays {
  dzien_wypisania: string;
  uwagi: string;
}
class GetZSTIDisabledDays implements GetDisabledDays {
  constructor(
    public dzien_wypisania: string,
    public osoby_zsti_id: number,
    public uwagi: string
  ) {}
}
class GetInternatDisabledDays implements GetDisabledDays {
  constructor(
    public posilki_id : number,
    public dzien_wypisania : string,
    public osoby_internat_id : number,
    public uwagi : string,
  ) {}
}
@Component({
  selector: 'app-globalny-raport',
  standalone: true,
  imports: [],
  templateUrl: './globalny-raport.component.html',
  styleUrl: './globalny-raport.component.css'
})
export class GlobalnyRaportComponent {
  DOMelement : any | undefined;
  //   let wersje_posilkow_map : Map<number, number> = new Map([
  //   //! stan za 2025-01
  //   [1, 429],
  //   [2, 345],
  //   [3, 373],
  //   [4, 304],
  //   [5, 266],
  //   [6, 409],
  //   [7, 171] // obiady
  // ])
  //! Za każdy dzień odwołany odejmować 23 zł, i tak kwota może być ujemna, co oznacza nadpłatę. - według pani.
  //  let naleznosc : number = wersje_posilkow_map.get(wersja_posilku) || 0;
  // let wersja_posilku : number = data[2] === 'wersja posiłku' ? 1 : 2; //! Pobierać z bazy danych, wersja posiłku po to na placeholder.
  miesiace : string[] = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
  date : Date = new Date();
  uczniowieZsti: Array<OsobaZSTI> = [];
  uczniowieInternat: Array<OsobaInternat> = [];
  deklaracjeZsti: Array<Deklaracja> = [];
  deklaracjeInternat: Array<DeklaracjaInternat> = [];
  nieobecnosciZsti: Array<GetZSTIDisabledDays> = [];
  nieobecnosciInternat: Array<GetInternatDisabledDays> = [];

  constructor(protected renderer: Renderer2, private el: ElementRef, private dataService: DataBaseService ) {
    this.DOMelement = this.el.nativeElement;
    this.getDataBaseInfo();

  }

  sort_users(array: Array<Osoba>): void {
    if(array.length <= 1) return;
    array.sort((a: Osoba, b: Osoba): number => {
      let nazwisko_pierwsze : string  = a.nazwisko?.toLowerCase() ?? '';
      let nazwisko_drugie : string = b.nazwisko?.toLowerCase() ?? '';
      let imie_pierwsze : string = a.imie?.toLowerCase() ?? '';
      let imie_drugie : string = b.imie?.toLowerCase() ?? '';
      if (nazwisko_pierwsze < nazwisko_drugie) return -1;
      if (nazwisko_pierwsze > nazwisko_drugie) return 1;
      if (imie_pierwsze < imie_drugie) return -1;
      if (imie_pierwsze > imie_drugie) return 1;
      return 0;
    });
}
  getDataBaseInfo(): void {
    this.dataService.DisabledInternatDays.asObservable().subscribe((data: Array<GetInternatDisabledDays>): void => {
      this.nieobecnosciInternat = data?.map(item => new GetInternatDisabledDays(item.posilki_id, item.dzien_wypisania, item.osoby_internat_id, item.uwagi));
    });
    this.dataService.DisabledZstiDays.asObservable().subscribe((data: Array<GetZSTIDisabledDays>): void => {
      this.nieobecnosciZsti = data?.map(item => new GetZSTIDisabledDays(item.dzien_wypisania, item.osoby_zsti_id, item.uwagi));
    });
    this.dataService.StudentListZsti.asObservable().subscribe((data: Array<OsobaZSTI>): void => {
      this.uczniowieZsti = data?.map(item => new OsobaZSTI(item.id, item.imie, item.nazwisko, item.typ_osoby_id, item.klasa));
    });
    this.dataService.StudentListInternat.asObservable().subscribe((data: Array<OsobaInternat>): void => {
      this.uczniowieInternat = data?.map(item => new OsobaInternat(item.id, item.imie, item.nazwisko,item.uczeszcza, item.grupa));
    });
    this.dataService.StudentDeclarationZsti.asObservable().subscribe((data: Array<DeklaracjaZSTI>): void => {
      this.deklaracjeZsti = data?.map(item => new DeklaracjaZSTI(item.data_do, item.data_od, item.rok_szkolny_id, item.id_osoby));
    });
    this.dataService.StudentDeclarationInternat.asObservable().subscribe((data: Array<DeklaracjaInternat>): void => {
      this.deklaracjeInternat = data?.map(item => new DeklaracjaInternat(item.data_do, item.data_od, item.id_osoby, item.rok_szkolny_id, item.wersja));
    });
  }
  checkDate(date: string): boolean {
    if (date.length !== 7) return false;
    const [year, month] = date.split('-');
    return !(!year || !month || isNaN(Number(year)) || isNaN(Number(month)) || Number(month) < 1 || Number(month) > 12);

  }
  create_table() : HTMLTableElement {
    let table : HTMLTableElement = this.renderer.createElement('table');
    table.setAttribute('id', 'raport_table');
    return table;
  }
  create_data_row(data : string[], table : HTMLTableElement, bolded : boolean) : HTMLTableRowElement {
    let tr : HTMLTableRowElement = this.renderer.createElement('tr');
    data.forEach((text : string) : void => {
      const cell: HTMLElement = bolded ? this.renderer.createElement('th') : this.renderer.createElement('td');
      cell.textContent = text;
      tr.appendChild(cell);
    });
    table.appendChild(tr);
    return tr;
  }
  validate_dates(date: string, data_od: string, data_do: string, raport: HTMLElement): boolean {
    if (date === '' && (data_od === '' || data_od === '')) {
      raport.textContent = 'Wprowadź datę!';
      return false;
    }
    if (date !== '' && (data_od !== '' || data_do !== '')) {
      raport.textContent = 'Wprowadź tylko jedną datę!';
      return false;
    }
    if (date !== '' && !this.checkDate(date)) {
      raport.textContent = 'Niepoprawny format daty!';
      return false;
    }
    if (data_do < data_od) {
      raport.textContent = 'Data od nie może być większa niż data do!';
      return false;
    }
    return true;
  }
  generateToExcel(name: string, data: string, okres: boolean): void {
    const buttonExcel: HTMLButtonElement = this.renderer.createElement('button');
    buttonExcel.textContent = okres ? `Zapisz raport za okres ${data} do pliku Excel` : `Zapisz raport za ${data} do pliku Excel`;
    buttonExcel.addEventListener('click', (): void => {
      const table = XLS.utils.table_to_book(document.getElementById('raport_table'), { sheet: okres ? `Raport za okres ${data}` : `Raport za ${data}` });
      const ws = table.Sheets[okres ? `Raport za okres ${data}` : `Raport za ${data}`];
      ws['!cols'] = [{ wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];
      const range = XLS.utils.decode_range(<string>ws['!ref']);
      for (let row = range.s.r; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLS.utils.encode_cell({ r: row, c: col });
          if (!ws[cellAddress]) continue;
          if (!ws[cellAddress].s) ws[cellAddress].s = {};
          if (!ws[cellAddress].s.alignment) ws[cellAddress].s.alignment = {};
          ws[cellAddress].s.alignment.horizontal = 'center';
          ws[cellAddress].s.alignment.vertical = 'center';
        }
      }
      XLS.writeFile(table, okres ? `raport_${name}_okres_${data}.xlsx` : `raport_${name}_${data}.xlsx`);
    });
    this.DOMelement.querySelector('#content').appendChild(buttonExcel);
  }
  show_raport(event : MouseEvent) : void {
    let element : HTMLElement = event.target as HTMLElement;
    if(element.tagName !== 'LI') return;

    let id : number | null = parseInt(<string>element.getAttribute('data-id'));
    let content : HTMLElement = this.DOMelement.querySelector('#content');
    let form : HTMLFormElement = this.renderer.createElement('form');
    form.name = 'data';
    form.method = 'POST';
    content.textContent = '';
    switch (id) {
      case 1:
        let h2 : HTMLHeadingElement = this.renderer.createElement('h2');
        h2.innerHTML = 'Wybierz okres';
        form.appendChild(h2);

        let labelMonth : HTMLElement = this.renderer.createElement('label');
        labelMonth.innerHTML = 'Miesiąc:';

        let inputMonth : HTMLInputElement = this.renderer.createElement('input');
        inputMonth.type = 'month';
        inputMonth.name = 'month';
        inputMonth.placeholder = 'YYYY-MM';

        labelMonth.appendChild(inputMonth);
        form.appendChild(labelMonth);

        let p : HTMLParagraphElement = this.renderer.createElement('p');
        p.innerHTML = 'lub';
        form.appendChild(p);

        let labelDateRange : HTMLElement = this.renderer.createElement('label');
        labelDateRange.innerHTML = 'Określony okres dat:';

        let inputDateFrom : HTMLInputElement = this.renderer.createElement('input');
        inputDateFrom.type = 'date';
        inputDateFrom.name = 'data-od';
        labelDateRange.appendChild(inputDateFrom);

        let inputDateTo : HTMLInputElement = this.renderer.createElement('input');
        inputDateTo.type = 'date';
        inputDateTo.name = 'data-do';
        labelDateRange.appendChild(inputDateTo);
        form.appendChild(labelDateRange);

        let h3 : HTMLHeadingElement = this.renderer.createElement('h3');
        h3.innerHTML = 'Typ raportu';
        form.appendChild(h3);

        let select_type : HTMLSelectElement = this.renderer.createElement('select');
        let options_type : string[] = ['ZSTI', 'Internat', 'Obie'];
        select_type.name = 'typ';
        options_type.forEach((element : string) : void => {
          let option : HTMLOptionElement = this.renderer.createElement('option');
          option.value = element;
          option.textContent = element;
          select_type.appendChild(option);
        });
        form.appendChild(select_type);
        break;
      case 2:
        break;
    }
    content.appendChild(form);
    let button : HTMLButtonElement = this.renderer.createElement('button');
    button.innerHTML = 'Generuj raport';
    button.addEventListener('click', (event : Event) : void => {
      if(this.DOMelement.querySelector('#content > button')) this.DOMelement.querySelector('#content > button').remove();
      this.DOMelement.querySelector('#raport').textContent = '';
      switch (id) {
        case 1:
          this.korekty(event);
          break;
        case 2:
          this.wersje_posilkow(event);
          break;
      }
    });
    form.appendChild(button);
    let raport : HTMLElement = this.renderer.createElement('div');
    raport.setAttribute('id', 'raport');
    raport.textContent = '';
    content.appendChild(raport);
  }

  korekty(event : Event) : void | string {
    event.preventDefault();
    const setDate = (osoba : Osoba) : string[] => {
      let declaration_start : string = '';
      let wersja_posilku : number = 0;
      let declaration_end : string = '';
      if(osoba instanceof OsobaZSTI) {
        const declaration : Deklaracja = this.deklaracjeZsti.find(declaration => declaration.id_osoby === osoba.id) ?? new DeklaracjaZSTI('', '', 0, 0);
        declaration_start = declaration.data_od?.split('T')[0] ?? '';
        declaration_end = declaration.data_do?.split('T')[0] ?? '';
      }
      else if(osoba instanceof OsobaInternat) {
        const declaration: DeklaracjaInternat = this.deklaracjeInternat.find(declaration => declaration.id_osoby === osoba.id) ?? new DeklaracjaInternat('', '', 0, 0, 0);
        console.log(declaration, this.deklaracjeInternat);
        declaration_start = declaration.data_od?.split('T')[0] ?? '';
        declaration_end = declaration.data_do?.split('T')[0] ?? '';
        wersja_posilku = declaration?.wersja ?? 0;
      }
      let min_day : string;
      let max_day : string;
      if (data_od && data_do) {
        min_day = declaration_start < data_od ? data_od : declaration_start;
        max_day = declaration_end > data_do ? data_do : declaration_end;
      } else {
        min_day = declaration_start < date ? `${date}-01` : declaration_start;
        max_day = declaration_end > date ? new Date(Number(date.split('-')[0]), Number(date.split('-')[1]), 1).toISOString().split('T')[0] : declaration_end;
      }
      return [min_day, max_day, wersja_posilku.toString()];
    }
    const findNieobecnosci = (osoba: Osoba, min_day: string, max_day: string): (string | Array<Array<number>>)[] => {
      let ilosc_nieobecnosci: number = 0;
      let ilosc_wersji_nieobecnych: Array<Array<number>> = [
        [1, 0],
        [2, 0],
        [3, 0],
      ];
      let uwagi: string = '';
      if (osoba instanceof OsobaZSTI) {
        this.nieobecnosciZsti.forEach((nieobecnosc: GetZSTIDisabledDays): void => {
          if (nieobecnosc.osoby_zsti_id === osoba.id) {
            if (nieobecnosc.dzien_wypisania.split('T')[0] <= min_day && nieobecnosc.dzien_wypisania.split('T')[0] >= max_day) ilosc_nieobecnosci++;
            if(nieobecnosc.uwagi !== null) uwagi += `${nieobecnosc.uwagi}, `;
          }
        });
      } else if (osoba instanceof OsobaInternat) {
        this.nieobecnosciInternat.forEach((nieobecnosc: GetInternatDisabledDays): void => {
          if (nieobecnosc.osoby_internat_id === osoba.id) {
            if (nieobecnosc.dzien_wypisania.split('T')[0] <= min_day && nieobecnosc.dzien_wypisania.split('T')[0] >= max_day) {
              ilosc_wersji_nieobecnych[nieobecnosc.posilki_id - 1][1]++;
              if (nieobecnosc.uwagi !== null) uwagi += `${nieobecnosc.uwagi}, `;
            }
          }
        });
      }
      return [ilosc_nieobecnosci.toString(), uwagi, ilosc_wersji_nieobecnych];
    };
    let date : string = this.DOMelement.querySelector('input[name="month"]').value;
    let data_od : string = this.DOMelement.querySelector('input[name="data-od"]').value;
    let data_do : string = this.DOMelement.querySelector('input[name="data-do"]').value
    let typ : string = this.DOMelement.querySelector('select[name="typ"]').value;
    let raport : HTMLElement = this.DOMelement.querySelector('#raport');

    if(!this.validate_dates(date, data_od, data_do, raport)) return;
    let table : HTMLTableElement = this.create_table();

    let tr_header : HTMLTableRowElement = this.renderer.createElement('tr');
    let th : HTMLTableCellElement = this.renderer.createElement('th');
    th.colSpan = 6;
    if(data_od !== '' || data_do !== '') th.textContent = `Lista korzystających ze stołówki ZSTI za okres od ${data_od} do ${data_do}`;
    else th.textContent = `Lista korzystających ze stołówki ZSTI za ${this.miesiace[parseInt(date.split('-')[1]) - 1]} ${date.split('-')[0]}`;
    tr_header.appendChild(th);
    table.appendChild(tr_header);
    let columns : string[] = ['Lp.','Imię i Nazwisko','Grupa','Wersja','Należność','Uwagi/Podpis']
    this.create_data_row(columns, table, true);
    let index : number = 1;
    switch (typ) {
      case 'ZSTI':
        console.log(this.uczniowieZsti);
        this.uczniowieZsti.forEach((osoba : OsobaZSTI) : void => {
          let min_day : string = setDate(osoba)[0];
          let max_day : string = setDate(osoba)[1];
          let ilosc_nieobecnosci : number = Number(findNieobecnosci(osoba, min_day, max_day)[0]);
          let uwagi : string = findNieobecnosci(osoba, min_day, max_day)[1] as string;
          console.log(ilosc_nieobecnosci, uwagi);
          if(ilosc_nieobecnosci === 0) return;
          uwagi === '' ? uwagi = '-' : uwagi = uwagi.slice(0, -2);
          let data : string[] = [
            `${index}.`,
            `${osoba.imie} ${osoba.nazwisko} (${osoba.klasa})`,
            'szkoła',
            'obiady',
            `${ilosc_nieobecnosci * 9} zł`,
            `${uwagi}`
          ];
          this.create_data_row(data, table, false);
          index++;
        });
        break;
      case 'Internat':
        this.uczniowieInternat.forEach((osoba : OsobaInternat) : void => {
          //? czy kiedy osoba ma dzień nieobecny, to odejmuje się mu 23 zł, czy osobno po każdym z posiłku?
          // zrobię na drugą wersję
          let min_day : string = setDate(osoba)[0];
          let max_day : string = setDate(osoba)[1];
          console.log(osoba, min_day, max_day);
          let wersja_posilku : string = setDate(osoba)[2];
          let ilosc_wersji_nieobecnych : Array<Array<number>> = findNieobecnosci(osoba, min_day, max_day)[2] as Array<Array<number>>;
          let uwagi : string = findNieobecnosci(osoba, min_day, max_day)[1] as string;
          if(ilosc_wersji_nieobecnych[0][1] === 0 && ilosc_wersji_nieobecnych[1][1] === 0 && ilosc_wersji_nieobecnych[2][1] === 0) return;
          uwagi === '' ? uwagi = '-' : uwagi = uwagi.slice(0, -2);
          let data : string[] = [
            `${index}.`,
            `${osoba.imie} ${osoba.nazwisko}`,
            `${osoba.grupa}`,
            `${wersja_posilku}`,
            `${(ilosc_wersji_nieobecnych[0][1] * 7) + (ilosc_wersji_nieobecnych[1][1] * 9) + (ilosc_wersji_nieobecnych[2][1] * 7)} zł`,
            `${uwagi}`
          ];
          this.create_data_row(data, table, false);
          index++;
        })
        break;
      case 'Obie':
        let osoby : (OsobaZSTI | OsobaInternat)[] =  [...this.uczniowieZsti, ...this.uczniowieInternat];
        this.sort_users(osoby);
        osoby.forEach((osoba : Osoba) : void => {
          let osoba_indetifier : string = '';
          let grupa : string = '-';
          let wersja : string = '-';
          if(osoba instanceof OsobaZSTI) {
            grupa = 'szkoła';
            wersja = 'obiady';
            osoba_indetifier = `${osoba.imie} ${osoba.nazwisko} (${osoba.klasa})`;
          }
          else if(osoba instanceof OsobaInternat) {
            grupa = `${osoba.grupa}`;
            osoba_indetifier = `${osoba.imie} ${osoba.nazwisko}`;
            wersja = setDate(osoba)[2];
          }
          let min_day : string = setDate(osoba)[0];
          let max_day : string = setDate(osoba)[1];
          let ilosc_nieobecnosci : number = Number(findNieobecnosci(osoba, min_day, max_day)[0]);
          let ilosc_wersji_nieobecnych : Array<Array<number>> = findNieobecnosci(osoba, min_day, max_day)[2] as Array<Array<number>>;
          let uwagi : string = findNieobecnosci(osoba, min_day, max_day)[1] as string;
          let data : string[] = [
            `${index}.`,
            `${osoba_indetifier}`,
            `${grupa}`,
            `${wersja}`,
          ];
          if (ilosc_nieobecnosci !== 0) {
            data.push(`${ilosc_nieobecnosci * 9} zł`);
          } else if (ilosc_wersji_nieobecnych[0][1] !== 0 || ilosc_wersji_nieobecnych[1][1] !== 0 || ilosc_wersji_nieobecnych[2][1] !== 0) {
            data.push(`${(ilosc_wersji_nieobecnych[0][1] * 7) + (ilosc_wersji_nieobecnych[1][1] * 9) + (ilosc_wersji_nieobecnych[2][1] * 7)} zł`);
          } else {
            return;
          }
          uwagi === '' ? uwagi = '-' : uwagi = uwagi.slice(0, -2);
          data.push(`${uwagi}`);
          this.create_data_row(data, table, false);
          index++;
        })
        break;
    }
    raport.appendChild(table);
    let suma : number = 0;
    for(let i : number = 2; i < table.rows.length; i++) {
      // @ts-ignore
      suma += parseInt(table.rows[i].cells[4].textContent.split(' ')[0]);
    }
    let tr_2 : HTMLTableRowElement = this.renderer.createElement('tr');
    let td : HTMLTableCellElement = this.renderer.createElement('td');
    td.colSpan = 4;
    td.textContent = 'Suma:';
    tr_2.appendChild(td);

    let td_suma : HTMLTableCellElement = this.renderer.createElement('td');
    td_suma.textContent = suma.toString() + ' zł';
    tr_2.appendChild(td_suma);
    table.appendChild(tr_2);
    if(data_od !== '' || data_do !== '') this.generateToExcel('korekty', `${data_od} — ${data_do}`, true);
    else this.generateToExcel('korekty', date, false);
    this.getDataBaseInfo();
  }
  wersje_posilkow(event : Event) {
    event.preventDefault();
    let raport : HTMLElement = this.DOMelement.querySelector('#raport');
    let table : HTMLTableElement = this.create_table();

    let columns : string[] = ['Lp.','Imię i Nazwisko', 'Grupa', 'Wersja']
    this.create_data_row(columns, table, true);
    let index : number = 1;
    // @ts-ignore
    this.uczniowieInternat.forEach((osoba : string) : void => {
      let data : string[] = [
        `${index}.`,
        `${osoba}`,
        'grupa_internat', // pobierać z bazy danych
        'wersja posiłku' // pobierać z bazy danych
      ];
      this.create_data_row(data, table, false);
      index++;
    });
    raport.appendChild(table);
    this.generateToExcel('wersje_posilkow', '2025-01', false);
  }
}
