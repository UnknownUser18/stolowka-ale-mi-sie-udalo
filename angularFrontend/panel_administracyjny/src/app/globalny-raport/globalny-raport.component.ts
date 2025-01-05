import { Component, ElementRef, Renderer2, OnInit } from '@angular/core';
import * as XLS from 'xlsx';
// import { DataBaseService } from '../data-base.service';

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
  // private dataService: DataBaseService <--- do konstruktora
  constructor(protected renderer: Renderer2, private el: ElementRef, ) {
    this.DOMelement = this.el.nativeElement;
    // this.dataService.CurrentDisabledInternatDays.asObservable().subscribe((data : any) => this.nieobecnosciInternat = data);
    // this.dataService.StudentListZsti.asObservable().subscribe((data : any) => this.uczniowieZsti = data);
    // this.dataService.StudentListInternat.asObservable().subscribe((data : any) => this.uczniowieInternat = data);
    // this.dataService.StudentDeclarationZsti.asObservable().subscribe((data : any) => this.deklaracjeZsti = data);
    // this.dataService.StudentDeclarationInternat.asObservable().subscribe((data : any) => this.deklaracjeInternat = data);
    // this.getDataBaseInfo();
  }
  ngOnInit() {
    this.uczniowieZsti = this.sort_by_surname(this.uczniowieZsti);
    this.uczniowieInternat = this.sort_by_surname(this.uczniowieInternat);
  }
  miesiace : string[] = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
  date : Date = new Date();
  //! zmienic, aby pobierało z bazy danych
  uczniowieZsti: string[] = ['Jacek Gyatterek', 'Wojtek Skibidi', 'Agata Tobolewska', 'Pozdrawiam AT'];
  uczniowieInternat: string[] = ['Wege Crashout','Julka Chaber','JC + DW','Pozdrawiam JC + DW'];
  // deklaracjeZsti: any;
  // deklaracjeInternat: any;
  // nieobecnosciZsti: any;
  // nieobecnosciInternat: any;

  // Możesz zawsze używa np. this.dataService.StudentListZsti.value zamiast this.uczniowieZsti
  // Ale to jak chcesz

  // Funkcja: Odnowienie danych z bazydanych
  // getDataBaseInfo()
  // {
  //   this.dataService.getStudentDeclarationInternat()
  //   this.dataService.getStudentDeclarationZsti()
  //   this.dataService.getStudentList()
  //   this.dataService.getStudentInternatDays()
  //   this.dataService.getStudentZstiDays()
  //   this.dataService.getStudentDisabledZstiDays()
  //   this.dataService.getStudentDisabledInternatDays()
  // }
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
          console.log('Wersje posiłków');
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
    th.textContent = `Lista korzystających ze stołówki ZSTI za ${this.miesiace[parseInt(date.split('-')[1]) - 1]} ${date.split('-')[0]}`;
    tr_header.appendChild(th);
    table.appendChild(tr_header);

    let columns : string[] = ['Lp.','Imię i Nazwisko','Grupa','Wersja','Należność','Uwagi/Podpis']
    let tr : HTMLTableRowElement = this.renderer.createElement('tr');
    let index : number = 1;
    columns.forEach((column : string) : void => {
      let th : HTMLTableElement = this.renderer.createElement('th');
      th.textContent = column;
      tr.appendChild(th);
    })
    table.appendChild(tr);

    switch (typ) {
      case 'ZSTI':
        this.uczniowieZsti.forEach((osoba : string) : void => {
          let tr : HTMLTableRowElement = this.renderer.createElement('tr');
          let data : string[] = [
            `${index}.`,
            `${osoba}`,
            'szkoła',
            'obiady',
            '9 zł', // pobierać z bazy danych ilość blokad obiadów * 9
            'placeholder'
          ];
          data.forEach((text : string) : void  => {
            let td : HTMLTableElement = this.renderer.createElement('td');
            td.textContent = text;
            tr.appendChild(td);
          });

          table.appendChild(tr);
          index++;
        });
        break;
      case 'Internat':
        this.uczniowieInternat.forEach((osoba : string) : void => {
          let tr : HTMLTableRowElement = this.renderer.createElement('tr');
          let data : string[] = [
            `${index}.`,
            `${osoba}`,
            'grupa_internat', // pobierać z bazy danych
            'wersja posiłku', // pobierać z bazy danych
          ];
          data.forEach((text : string) : void => {
            let td : HTMLElement = this.renderer.createElement('td');
            td.textContent = text;
            tr.appendChild(td);
          });

          let td_naleznosc : HTMLElement = this.renderer.createElement('td');
          let ilosc_nieobecnosci : number = 1; //! pobierać z bazy danych
          td_naleznosc.textContent = (ilosc_nieobecnosci * 23).toString() + ' zł';
          tr.appendChild(td_naleznosc);

          let td_uwagi : HTMLElement = this.renderer.createElement('td');
          td_uwagi.textContent = 'placeholder';
          tr.appendChild(td_uwagi);

          table.appendChild(tr);
          index++;
        })
        break;
      case 'Obie':
        let osoby : string[] = this.uczniowieZsti.concat(this.uczniowieInternat);
        osoby = this.sort_by_surname(osoby);
        osoby.forEach((osoba : string) : void => {
          let tr : HTMLTableRowElement = this.renderer.createElement('tr');
          let data : string[] = [
            `${index}.`,
            `${osoba}`,
          ];
          data.forEach((text : string) : void => {
            let td : HTMLElement = this.renderer.createElement('td');
            td.textContent = text;
            tr.appendChild(td);
          });

          let td_grupa : HTMLTableElement = this.renderer.createElement('td');
          let td_wersja : HTMLElement = this.renderer.createElement('td');
          if (this.uczniowieZsti.includes(osoba)) {
            td_grupa.textContent = 'szkoła';
            td_wersja.textContent = 'obiady';
          }
          else {
            td_grupa.textContent = 'grupa_internat'; //! pobierać z bazy danych
            td_wersja.textContent = 'wersja posiłku'; //! pobierać z bazy danych
          }
          tr.appendChild(td_grupa);
          tr.appendChild(td_wersja);
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
  }
  wersje_posilkow(event : Event) {
    event.preventDefault();
    let raport : HTMLElement = this.DOMelement.querySelector('#raport');
    let table : HTMLTableElement = this.create_table();

    let columns : string[] = ['Lp.','Imię i Nazwisko', 'Grupa', 'Wersja']
    let tr : HTMLTableRowElement = this.renderer.createElement('tr');
    columns.forEach((column : string) : void => {
      let th : HTMLTableElement = this.renderer.createElement('th');
      th.textContent = column;
      tr.appendChild(th);
    });
    table.appendChild(tr);

    let index : number = 1;
    this.uczniowieInternat.forEach((osoba : string) : void => {
      let data : string[] = [
        `${index}.`,
        `${osoba}`,
        'grupa_internat', // pobierać z bazy danych
        'wersja posiłku' // pobierać z bazy danych
      ];
      let tr : HTMLTableRowElement = this.renderer.createElement('tr');
      data.forEach((text : string) : void => {
        let td : HTMLTableElement = this.renderer.createElement('td');
        td.textContent = text;
        tr.appendChild(td);
      });

      table.appendChild(tr);
      index++;
    });
    raport.appendChild(table);
    this.generateToExcel('wersje_posilkow', '2025-01', false);
  }
}
