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
  DOMelement : any | undefined;
  constructor(private renderer: Renderer2, private el: ElementRef) {
    this.DOMelement = this.el.nativeElement;
  }

  miesiac : string = '';
  miesiace : string[] = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
  osoby_zsti : string[] = ['Jacek Gyatterek', 'Wojtek Skibidi', 'Agata Tobolewska', 'Pozdrawiam AT']
  osoby_internat : string[] = ['Wege Crashout','Julka Chaber','JC + DW','Pozdrawiam JC + DW'] // ostatnie podpowiedział ai nie ja 🦅🦅
  date : Date = new Date();
  show() : void {
    this.renderer.setStyle(this.DOMelement.querySelector('main'), 'display', 'flex');
  }
  close() : void {
    this.renderer.setStyle(this.DOMelement.querySelector('main'), 'display', 'none');
  }
  generuj(event : Event) : void | string {
    event.preventDefault();


    // getting values
    let date : string = this.DOMelement.querySelector('form[name="miesiac"] input[name="month"]').value;
    let raport : HTMLElement = this.DOMelement.querySelector('#raport');

    // validation
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

    // generating raport
    this.miesiac = this.miesiace[parseInt(date.split('-')[1], 10) - 1] + ' ' + date.split('-')[0];
    let typ : string = this.DOMelement.querySelector('form[name="miesiac"] select[name="typ"]').value;
    let table : HTMLElement = this.renderer.createElement('table');
    table.setAttribute('id', 'raport_table');
    let days_in_month : number = new Date(parseInt(date.split('-')[0], 10), parseInt(date.split('-')[1], 10), 0).getDate();
    let first_day : number = new Date(parseInt(date.split('-')[0], 10), parseInt(date.split('-')[1], 10) - 1, 1).getDay();
    let weekend_days : number = 0;

    let button : HTMLButtonElement = this.renderer.createElement('button');
    button.innerHTML = `Zapisz raport za ${this.miesiac} do pliku Excel`;
    button.addEventListener('click', () : void => {
      console.log('click', this.miesiac);

      let table = XLS.utils.table_to_book(document.getElementById('raport_table'), {sheet: `Raport za ${this.miesiac}`});
      let ws = table.Sheets[`Raport za ${this.miesiac}`];

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
        let header : string[] = ['Osoba','Zakupione Obiady','Zarejestrowane Nieobecności', 'Należność','Nadpłata','Saldo'];
        header.forEach((element : string) : void => {
          let th : HTMLElement = this.renderer.createElement('th');
          th.innerHTML = element;
          tr.appendChild(th);
        });
        table.appendChild(tr);
        this.osoby_zsti.forEach((element: string) : void => {
          let tr: HTMLElement = this.renderer.createElement('tr');
          let td: HTMLElement = this.renderer.createElement('td');
          td.innerHTML = element;
          tr.appendChild(td);
          for (let j: number = 0; j < 5; j++) {
            let td: HTMLElement = this.renderer.createElement('td');
            switch (j) {
              case 0:
                // zakupione obiady
                td.innerHTML = days_in_month.toString()
                break;
              case 1:
                // zarejestrowane nieobecności
                td.innerHTML = '0';
                break;
              case 2:
                // należność
                td.innerHTML = (days_in_month * 9).toString() + ' zł';
                break;
              case 3:
                // nadpłata
                td.innerHTML = '0' + ' zł';
                break;
              case 4:
                // saldo
               td.innerHTML = '126 zł';
               break;
              }
              //! tutaj tak samo co w internacie.
            tr.appendChild(td);
          }
          table.appendChild(tr);
        });
        break;
      case 'Internat':
        function calculate(argument : number) : number {
          let date_used : number = new Date(parseInt(date.split('-')[0], 10), parseInt(date.split('-')[1], 10), 0).getDate();
          let days : number = 0;
          for(let i : number = 0 ; i < date_used ; i++) {
            if((first_day + i) % 7 != 0 && (first_day + i) % 7 != 6 &&  (first_day + i) % 7 != argument) days++;
          }
          return days;
        }
        // osoby
        let tr_internat : HTMLElement = this.renderer.createElement('tr');
        let header_internat : string[] = ['Osoba','Wersja Posiłku','Śniadanie','Obiad','Kolacja','Należność','Nadpłata','Saldo'];
        header_internat.forEach((element : string) : void => {
          let th : HTMLElement = this.renderer.createElement('th');
          th.innerHTML = element;
          tr_internat.appendChild(th);
        });
        table.appendChild(tr_internat);
        this.osoby_internat.forEach((element : string) : void => {
          let tr_internat : HTMLElement = this.renderer.createElement('tr');
          let td_internat : HTMLElement = this.renderer.createElement('td');
          td_internat.innerHTML = element;
          tr_internat.appendChild(td_internat);
          let sniadania : number | string = 0;
          let obiady : number | string = 0;
          let kolacje : number | string = 0;
          for (let j : number = 0 ; j < 7 ; j++) {
            let td_internat : HTMLElement = this.renderer.createElement('td');
            let wersja_posilku : number  = 2; //! pobierać z bazy danych
            switch (j) {
              case 0:
                td_internat.innerHTML = wersja_posilku.toString();
                break;
              case 1:
                switch (wersja_posilku) {
                  case 1: // pon-pt śniadanie-obiad-kolacja
                  case 3: // pon-czw śniadanie-obiad-kolacja // piątek śniadanie
                  case 4: // pon-pt śniadanie-obiad
                  case 5: // pon-pt śniadanie-kolacja
                  case 6: // pon-czw śniadanie-obiad-kolacja // piątek śniadanie-obiad
                    sniadania = days_in_month;
                    break;
                  case 2: // pon obiad-kolacja // wt-czw śniadanie-obiad-kolacja // piątek śniadanie-obiad
                    sniadania = calculate(1);
                    break;
                  default:
                    sniadania = '-';
                }
                td_internat.innerHTML = sniadania.toString();
                break;
              case 2:
                switch (wersja_posilku) {
                  case 1:
                  case 2:
                  case 4:
                  case 6:
                  case 7:
                    obiady = days_in_month;
                    break;
                  case 3:
                    obiady = calculate(5);
                    break;
                  default:
                    obiady = '-';
                }
                td_internat.innerHTML = obiady.toString();
                break;
              case 3:
                switch (wersja_posilku) {
                  case 1:
                  case 5:
                    kolacje = days_in_month;
                    break;
                  case 2:
                  case 3:
                  case 6:
                    kolacje = calculate(5);
                    break;
                  default:
                    kolacje = '-';
                }
                td_internat.innerHTML = kolacje.toString();
                break;
              case 4:
                // należność
                //! należność NIE jest obliczana na podstawie dni w miesiącu for some reason
                //! należność jest obliczana na podstawie wersji posiłku
                switch (wersja_posilku) {
                  case 1:
                    td_internat.innerHTML = '329 zł';
                    break;
                  case 2:
                    td_internat.innerHTML = '276 zł';
                    break;
                  case 3:
                    td_internat.innerHTML = '297 zł';
                    break;
                  case 4:
                    td_internat.innerHTML = '231 zł';
                    break;
                  case 5:
                    td_internat.innerHTML = '203 zł';
                    break;
                  case 6:
                    td_internat.innerHTML = '315 zł';
                    break;
                  case 7:
                    td_internat.innerHTML = '126 zł';
                    break;
                }
                //! po podłaczeniu do bazy danych usuwać razy ile dni jest zarestrowanych.

                //! oddzielna funkcja do obliczania należności
                // let result : number = 0;
                // if(typeof sniadania === 'number') result += sniadania * 7;
                // if(typeof obiady === 'number') result += obiady * 9;
                // if(typeof kolacje === 'number') result += kolacje * 7;
                // td_internat.innerHTML = result.toString() + ' zł';
                break;
              case 5:
                td_internat.innerHTML = '0' + ' zł'; //! tak samo co w zsti.
                break;
              case 6:
                td_internat.innerHTML = '0' + ' zł'; //! tak samo co w zsti.
                break;
            }
            tr_internat.appendChild(td_internat);
          }
          table.appendChild(tr_internat);
        })
        break;
    }
    raport.innerHTML = '';
    raport.appendChild(table);
    raport.appendChild(button);
  }
}
