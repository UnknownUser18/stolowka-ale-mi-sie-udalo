import { Component, ElementRef, Renderer2 } from '@angular/core';
import {NgOptimizedImage} from '@angular/common';
import * as XLS from 'xlsx';

@Component({
  selector: 'app-globalny-raport',
  standalone: true,
  imports: [
    NgOptimizedImage
  ],
  templateUrl: './globalny-raport.component.html',
  styleUrl: './globalny-raport.component.css'
})
export class GlobalnyRaportComponent {
  constructor(private renderer: Renderer2, private el: ElementRef) {}


  miesiac : string = '';
  miesiace : string[] = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
  osoby_zsti : string[] = ['Jacek Gyatterek', 'Wojtek Skibidi', 'Agata Tobolewska', 'Pozdrawiam AT']
  date : Date = new Date();
  show() : void {
    this.renderer.setStyle(this.el.nativeElement.querySelector('main'), 'display', 'flex');
  }
  close() : void {
    this.renderer.setStyle(this.el.nativeElement.querySelector('main'), 'display', 'none');
  }
  generuj(event : Event) : void | string {
    event.preventDefault();
    let date : string = this.el.nativeElement.querySelector('form[name="miesiac"] input[name="month"]').value;
    let raport : HTMLElement = this.el.nativeElement.querySelector('#raport');
    if(parseInt(date.split('-')[1]) >= 13 || parseInt(date.split('-')[1]) == 0) return raport.innerHTML = `Niepoprawny format daty! <br> Wprowadź miesiąc w zakresie od 1 do 12!`;
    if(date.length != 7) return raport.innerHTML = `Niepoprawny format daty! <br> Wprowadź datę w formacie RRRR-MM`;
    let myslnik : number = 0;
    for(let i : number = 0 ; i < date.length ; i++) {
      if(date[0] === '-') myslnik++;
    }
    if(myslnik > 1) return raport.innerHTML = `Niepoprawny format daty! <br> Wprowadź datę w formacie RRRR-MM`;
    for (let i : number = 0 ; i < date.length ; i++) {
      if(((i < 4 || i > 5) && (date[i] < '0' || date[i] > '9')) || (i == 4 && date[i] != '-')) return raport.innerHTML = `Niepoprawny format daty! <br> Wprowadź datę w formacie RRRR-MM`
    }
    this.miesiac = this.miesiace[parseInt(date.split('-')[1], 10) - 1] + ' ' + date.split('-')[0];
    let typ : string = this.el.nativeElement.querySelector('form[name="miesiac"] select[name="typ"]').value;
    let table : HTMLElement = this.renderer.createElement('table');
    table.setAttribute('id', 'raport_table');
    let days_in_month : number = new Date(parseInt(date.split('-')[0], 10), parseInt(date.split('-')[1], 10), 0).getDate();
    let first_day : number = new Date(parseInt(date.split('-')[0], 10), parseInt(date.split('-')[1], 10) - 1, 1).getDay();
    let weekend_days : number = 0;

    let button : HTMLButtonElement = this.renderer.createElement('button');
    button.innerHTML = `Zapisz raport za ${this.miesiac} do pliku Excel`;
    button.addEventListener('click', () : void => {
      console.log('click', this.miesiac);

      // Create a workbook from the HTML table
      let table = XLS.utils.table_to_book(document.getElementById('raport_table'), {sheet: `Raport za ${this.miesiac}`});
      let ws = table.Sheets[`Raport za ${this.miesiac}`];

      // Apply styling
      ws['!cols'] = [{wch: 20}, {wch: 20}, {wch: 20}, {wch: 20}]; // Set column widths

      // Center align all cells in the worksheet
      const range = XLS.utils.decode_range(<string>ws['!ref']); // Get the range of the worksheet
      for (let row = range.s.r; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLS.utils.encode_cell({r: row, c: col});
          if (!ws[cellAddress]) continue; // Skip if the cell is empty
          if (!ws[cellAddress].s) ws[cellAddress].s = {}; // Initialize style object if not present
          if (!ws[cellAddress].s.alignment) ws[cellAddress].s.alignment = {}; // Initialize alignment object if not present
          ws[cellAddress].s.alignment.horizontal = 'center';
          ws[cellAddress].s.alignment.vertical = 'center';
        }
      }
      // Write the file
      XLS.writeFile(table, `raport_${this.miesiac.split(' ')[0].toLowerCase()}_${this.miesiac.split(' ')[1]}.xlsx`);
    });

    for(let i : number = 0; i < days_in_month; i++) {
      if((first_day + i) % 7 == 0 || (first_day + i) % 7 == 6) weekend_days++;
    }
    days_in_month -= weekend_days;
    switch (typ) {
      case 'ZSTI':
        // osoby
        let tr : HTMLElement = this.renderer.createElement('tr');
        tr.appendChild(this.renderer.createElement('th')).innerHTML = 'Osoby';
        this.osoby_zsti.forEach((osoba : string) : void => {
          let td : HTMLElement = this.renderer.createElement('td');
          td.innerHTML = osoba;
          tr.appendChild(td);
        });
        table.appendChild(tr);

        // zakupione obiady
        tr = this.renderer.createElement('tr');
        tr.appendChild(this.renderer.createElement('th')).innerHTML = 'Zakupione Obiady';
        this.osoby_zsti.forEach(() : void => {
          let td : HTMLElement = this.renderer.createElement('td');
          td.innerHTML = days_in_month.toString(); //TODO : żydon backend
          tr.appendChild(td);
        });
        table.appendChild(tr);

        // zarejestrowane obiady
        tr = this.renderer.createElement('tr');
        tr.appendChild(this.renderer.createElement('th')).innerHTML = 'Zarejestrowane Nieobecności';
        this.osoby_zsti.forEach(() : void => {
          let td : HTMLElement = this.renderer.createElement('td');
          td.innerHTML = '0'; //TODO : żydon backend
          tr.appendChild(td);
        });
        table.appendChild(tr);

        // należność
        tr = this.renderer.createElement('tr');
        tr.appendChild(this.renderer.createElement('th')).innerHTML = 'Należność';
        this.osoby_zsti.forEach(() : void => {
          let td : HTMLElement = this.renderer.createElement('td');
          td.innerHTML = (days_in_month*9).toString() + ' zł'; //TODO : żydon backend
          tr.appendChild(td);
        });
        table.appendChild(tr);

        // nadpłata
        tr = this.renderer.createElement('tr');
        tr.appendChild(this.renderer.createElement('th')).innerHTML = 'Nadpłata';
        this.osoby_zsti.forEach(() : void => {
          let td : HTMLElement = this.renderer.createElement('td');
          td.innerHTML = '0' + ' zł'; //TODO : żydon backend
          tr.appendChild(td);
        });
        table.appendChild(tr);
        break;
      case 'Internat':

        break;
    }
    raport.innerHTML = '';
    raport.appendChild(table);
    raport.appendChild(button);
  }
}
