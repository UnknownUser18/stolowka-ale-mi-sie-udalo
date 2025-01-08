import { Component, ElementRef, Renderer2 } from '@angular/core';
import * as XLS from 'xlsx';
import { DataBaseService } from '../data-base.service';

class OsobaZSTI {
  constructor(
    public id: number,
    public imie : string,
    public nazwisko : string,
    public klasa : string
  ) {}
}
class OsobaInternat {
  constructor(
    public id : number,
    public imie : string,
    public nazwisko : string,
    public grupa : string
  ) {}
}
class Deklaracja {
  constructor(
    public id_osoby : number,
    public data_do : string,
    public data_od : string
  ) {}
}
class DeklaracjaInternat extends Deklaracja {
  constructor(
    public osoby_internat_id : number, //! w bazie danych zmienic aby było na id_osoby, gdyż nie ma sensu na 2 różne nazwy kolumn
    id_osoby : number,
    data_do: string,
    data_od: string,
    public wersja: number
  ) {
    super(id_osoby, data_do, data_od);
  }
}
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
    public posilki_id : string,
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
  constructor(protected renderer: Renderer2, private el: ElementRef, private dataService: DataBaseService ) {
    this.DOMelement = this.el.nativeElement;
    this.getDataBaseInfo();
  }
  miesiace : string[] = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
  date : Date = new Date();
  //! zmienic, aby pobierało z bazy danych
  uczniowieZsti: Array<OsobaZSTI> = [];
  uczniowieInternat: Array<OsobaInternat> = [];
  deklaracjeZsti: Array<Deklaracja> = [];
  deklaracjeInternat: Array<DeklaracjaInternat> = [];
  nieobecnosciZsti: Array<GetZSTIDisabledDays> = [];
  nieobecnosciInternat: Array<GetInternatDisabledDays> = [];

  // Możesz zawsze używa np. this.dataService.StudentListZsti.value zamiast this.uczniowieZsti
  // Ale to jak chcesz

  // Funkcja: Odnowienie danych z bazydanych

  getDataBaseInfo() : void {
    this.dataService.DisabledInternatDays.asObservable().subscribe((data: Array<GetInternatDisabledDays>) : void => {
      this.nieobecnosciInternat = data?.map(item => new GetInternatDisabledDays(item.posilki_id, item.dzien_wypisania, item.osoby_internat_id, item.uwagi));
    });
    this.dataService.DisabledZstiDays.asObservable().subscribe((data: Array<GetZSTIDisabledDays>): void => {
      this.nieobecnosciZsti = data?.map(item => new GetZSTIDisabledDays(item.dzien_wypisania, item.osoby_zsti_id, item.uwagi));
    });

    this.dataService.StudentListZsti.asObservable().subscribe((data: Array<OsobaZSTI>): void => {
      this.uczniowieZsti = data?.map(item => new OsobaZSTI(item.id, item.imie, item.nazwisko, item.klasa));
    });

    this.dataService.StudentListInternat.asObservable().subscribe((data: Array<OsobaInternat>): void => {
      this.uczniowieInternat = data?.map(item => new OsobaInternat(item.id, item.imie, item.nazwisko, item.grupa));
    });

    this.dataService.StudentDeclarationZsti.asObservable().subscribe((data: Array<Deklaracja>): void => {
      this.deklaracjeZsti = data?.map(item => new Deklaracja(item.id_osoby, item.data_do, item.data_od));
    });

    this.dataService.StudentDeclarationInternat.asObservable().subscribe((data: Array<DeklaracjaInternat>): void => {
      this.deklaracjeInternat = data?.map(item => new DeklaracjaInternat(item.osoby_internat_id, item.id_osoby, item.data_do, item.data_od, item.wersja));
    });
  }
  checkDate(date : string) : boolean {
    if(date.length != 7) return false;
    let myslnik : number = 0;
    for(let i : number = 0 ; i < date.length ; i++) {
      if(date[0] === '-') myslnik++;
    }
    if(date !== '' && (parseInt(date.split('-')[1]) >= 13 || parseInt(date.split('-')[1]) == 0)) return false;
    if(date !== '' && date.length != 7) return false;
    if(myslnik > 1) return false;
    for (let i : number = 0 ; i < date.length ; i++) {
      if(((i < 4 || i > 5) && (date[i] < '0' || date[i] > '9')) || (i == 4 && date[i] != '-')) return false;
    }
    return true;
  }
  create_table() : HTMLTableElement {
    let table : HTMLTableElement = this.renderer.createElement('table');
    table.setAttribute('id', 'raport_table');
    return table;
  }
  create_data_row(data : string[], table : HTMLTableElement, bolded : boolean) : HTMLTableRowElement {
    let tr : HTMLTableRowElement = this.renderer.createElement('tr');
    data.forEach((text : string) : void => {
      let cell : HTMLElement;
      bolded ? cell = this.renderer.createElement('th') : cell = this.renderer.createElement('td');
      cell.textContent = text;
      tr.appendChild(cell);
    });
    table.appendChild(tr);
    return tr;
  }
  sort_by_surname(array : string[]) : string[] {
    return array.sort((a : string, b : string) : number => {
      let a_surname : string = a.split(' ')[1];
      let b_surname : string = b.split(' ')[1];
      if(a_surname < b_surname) return -1;
      if(a_surname > b_surname) return 1;
      return 0;
    });
  }
  generateToExcel(name : string, data : string, okres : boolean) : void {
    let button_excel : HTMLButtonElement = this.renderer.createElement('button');
    if(okres) button_excel.textContent = `Zapisz raport za okres ${data} do pliku Excel`;
    else button_excel.textContent = `Zapisz raport za ${data} do pliku Excel`;
    button_excel.addEventListener('click', () : void => {
      let table, ws;
      if(okres) {
        table = XLS.utils.table_to_book(document.getElementById('raport_table'), {sheet: `Raport za okres ${data}`});
        ws = table.Sheets[`Raport za okres ${data}`];
      }
      else {
        table = XLS.utils.table_to_book(document.getElementById('raport_table'), {sheet: `Raport za ${data}`});
        ws = table.Sheets[`Raport za ${data}`];
      }


      ws['!cols'] = [{wch: 20}, {wch: 20}, {wch: 20}, {wch: 20}];

      const range = XLS.utils.decode_range(<string>ws['!ref']);
      for (let row = range.s.r; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLS.utils.encode_cell({r: row, c: col});
          if (!ws[cellAddress]) continue;
          if (!ws[cellAddress].s) ws[cellAddress].s = {};
          if (!ws[cellAddress].s.alignment) ws[cellAddress].s.alignment = {};
          ws[cellAddress].s.alignment.horizontal = 'center';
          ws[cellAddress].s.alignment.vertical = 'center';
        }
      }
      if(okres) XLS.writeFile(table, `raport_${name}_okres_${data}.xlsx`);
      else XLS.writeFile(table, `raport_${name}_${data}.xlsx`);
    });
    this.DOMelement.querySelector('#content').appendChild(button_excel);
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
    function setDate(declaration_start : string, declaration_end : string) : string[] {
      let min_day : string = '';
      let max_day : string = '';
      if (data_od && data_do) {
        min_day = declaration_start < data_od ? data_od : declaration_start;
        max_day = declaration_end > data_do ? data_do : declaration_end;
      } else {
        min_day = declaration_start < date ? `${date}-01` : declaration_start;
        max_day = declaration_end > date ? new Date(Number(date.split('-')[0]), Number(date.split('-')[1]), 1).toISOString().split('T')[0] : declaration_end;
      }
      return [min_day, max_day];
    }
    let date : string = this.DOMelement.querySelector('input[name="month"]').value;
    let data_od : string = this.DOMelement.querySelector('input[name="data-od"]').value;
    let data_do : string = this.DOMelement.querySelector('input[name="data-do"]').value
    let typ : string = this.DOMelement.querySelector('select[name="typ"]').value;
    let raport : HTMLElement = this.DOMelement.querySelector('#raport');

    if (date === '' && (data_od === '' || data_do === '')) return raport.textContent = 'Wprowadź datę!';
    if (date !== '' && (data_od !== '' || data_do !== '')) return raport.textContent = 'Wprowadź tylko jedną datę!';
    if (date !== '' && !this.checkDate(date)) return raport.textContent = 'Niepoprawny format daty!';
    if(data_do < data_od) return raport.textContent = 'Data od nie może być większa niż data od!';

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
        this.uczniowieZsti.forEach((osoba : OsobaZSTI) : void => {
          let declaration_start : string = '';
          let declaration_end : string = '';
          this.deklaracjeZsti.forEach((declaration : Deklaracja) : void => {
            if(declaration.id_osoby === osoba.id) {
              declaration_start = declaration.data_od.split('T')[0];
              declaration_end = declaration.data_do.split('T')[0];
            }
          });
          let ilosc_nieobecnosci : number = 0;
          let uwagi : string = '';
          let min_day : string = setDate(declaration_start, declaration_end)[0];
          let max_day : string = setDate(declaration_start, declaration_end)[1];
          this.nieobecnosciZsti.forEach((nieobecnosc : GetZSTIDisabledDays) : void => {
            if(nieobecnosc.osoby_zsti_id === osoba.id) {
              if(nieobecnosc.dzien_wypisania >= min_day && nieobecnosc.dzien_wypisania <= max_day) {
                ilosc_nieobecnosci++;
                if(nieobecnosc.uwagi !== null) uwagi += `${nieobecnosc.uwagi}, `;
              }
            }
          })
          if(ilosc_nieobecnosci === 0) return;
          uwagi === '' ? uwagi = 'Brak' : uwagi = uwagi.slice(0, -2);
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
        // @ts-ignore
        this.uczniowieInternat.forEach((osoba : OsobaInternat) : void => {
          //? czy kiedy osoba ma dzień nieobecny, to odejmuje się mu 23 zł, czy osobno po każdym z posiłku?
          let ilosc_wersji_nieobecnych : Array<Array<number>> = [
            [1,0],
            [2,0],
            [3,0],
          ]
          // zrobię na drugą wersję
          let wersja_posilku : number = 0;
          let declaration_start : string = '';
          let declaration_end : string = '';
          this.deklaracjeInternat.forEach((declaration : DeklaracjaInternat) : void => {
            if(declaration.osoby_internat_id === osoba.id) {
              declaration_start = declaration.data_od.split('T')[0];
              declaration_end = declaration.data_do.split('T')[0];
              wersja_posilku = declaration.wersja;
            }
          });
          let min_day : string = setDate(declaration_start, declaration_end)[0];
          let max_day : string = setDate(declaration_start, declaration_end)[1];
          let uwagi : string = '';
          this.nieobecnosciInternat.forEach((nieobecnosc : GetInternatDisabledDays) : void => {
            if(nieobecnosc.osoby_internat_id === osoba.id) {
              if(nieobecnosc.dzien_wypisania >= min_day && nieobecnosc.dzien_wypisania <= max_day) {
                ilosc_wersji_nieobecnych[Number(nieobecnosc.posilki_id) - 1][1]++;
                if(nieobecnosc.uwagi !== null) uwagi += `${nieobecnosc.uwagi}, `;
              }
            }
          });
          if(ilosc_wersji_nieobecnych[0][1] === 0 && ilosc_wersji_nieobecnych[1][1] === 0 && ilosc_wersji_nieobecnych[2][1] === 0) return;
          uwagi === '' ? uwagi = 'Brak' : uwagi = uwagi.slice(0, -2);
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
        // @ts-ignore
        let osoby : string[] = this.uczniowieZsti.concat(this.uczniowieInternat);
        osoby = this.sort_by_surname(osoby);
        osoby.forEach((osoba : string) : void => {
          let data : string[] = [
            `${index}.`,
            `${osoba}`,
          ];
          let tr : HTMLTableRowElement = this.create_data_row(data, table, false);
          let td_grupa : HTMLElement = this.renderer.createElement('td');
          let td_wersja : HTMLElement = this.renderer.createElement('td');
          let td_naleznosc : HTMLElement = this.renderer.createElement('td');
          let ilosc_nieobecnosci : number = 1; //! pobierać z bazy danych
          let td_uwagi : HTMLElement = this.renderer.createElement('td');
          // @ts-ignore
          if (this.uczniowieZsti.includes(osoba)) {
            td_grupa.textContent = 'szkoła';
            td_wersja.textContent = 'obiady';
            td_naleznosc.textContent = (ilosc_nieobecnosci * 9).toString() + ' zł';
          } else {
            td_grupa.textContent = 'grupa_internat'; //! pobierać z bazy danych
            td_wersja.textContent = 'wersja posiłku'; //! pobierać z bazy danych
            td_naleznosc.textContent = (ilosc_nieobecnosci * 23).toString() + ' zł';
          }
          td_uwagi.textContent = 'placeholder';
          tr.appendChild(td_grupa);
          tr.appendChild(td_wersja);
          tr.appendChild(td_naleznosc);
          tr.appendChild(td_uwagi);
          table.appendChild(tr);
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
