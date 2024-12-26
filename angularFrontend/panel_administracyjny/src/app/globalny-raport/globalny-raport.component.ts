import { Component, ElementRef, Renderer2 } from '@angular/core';
import * as XLS from 'xlsx';
import {DataBaseService} from '../data-base.service';

@Component({
  selector: 'app-globalny-raport',
  standalone: true,
  imports: [],
  templateUrl: './globalny-raport.component.html',
  styleUrl: './globalny-raport.component.css'
})
export class GlobalnyRaportComponent {
  DOMelement : any | undefined;
  constructor(private renderer: Renderer2, private el: ElementRef, private dataService: DataBaseService) {
    this.DOMelement = this.el.nativeElement;
    this.dataService.CurrentDisabledZstiDays.asObservable().subscribe((data : any) => this.nieobecnosciZsti = data);
    this.dataService.CurrentDisabledInternatDays.asObservable().subscribe((data : any) => this.nieobecnosciInternat = data);
    this.dataService.StudentListZsti.asObservable().subscribe((data : any) => this.uczniowieZsti = data);
    this.dataService.StudentListInternat.asObservable().subscribe((data : any) => this.uczniowieInternat = data);
    this.dataService.StudentDeclarationZsti.asObservable().subscribe((data : any) => this.deklaracjeZsti = data);
    this.dataService.StudentDeclarationInternat.asObservable().subscribe((data : any) => this.deklaracjeInternat = data);
    this.getDataBaseInfo();
    setTimeout(() => {
      this.generateSomething();
    })
  }
  miesiace : string[] = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
  osoby_zsti : string[] = ['Jacek Gyatterek', 'Wojtek Skibidi', 'Agata Tobolewska', 'Pozdrawiam AT']
  osoby_internat : string[] = ['Wege Crashout','Julka Chaber','JC + DW','Pozdrawiam JC + DW'] // ostatnie podpowiedział ai nie ja 🦅🦅 - ta jasne :3
  date : Date = new Date();

  // Zrobilem ci proste lokalne zmienne
  //  |
  //  v

  uczniowieZsti: any;
  uczniowieInternat: any;
  deklaracjeZsti: any;
  deklaracjeInternat: any;
  nieobecnosciZsti: any;
  nieobecnosciInternat: any;

  // Możesz zawsze używa np. this.dataService.StudentListZsti.value zamiast this.uczniowieZsti
  // Ale to jak chcesz

  // Funkcja: Odnowienie danych z bazydanych
  getDataBaseInfo()
  {
    this.dataService.getStudentDeclarationInternat()
    this.dataService.getStudentDeclarationZsti()
    this.dataService.getStudentList()
    this.dataService.getStudentInternatDays()
    this.dataService.getStudentZstiDays()
  }

  // Funckja: Przyklad wykorzystania danych z zmiennych lokalnych
  generateSomething()
  {
    let value: string = this.uczniowieZsti + this.uczniowieInternat + this.deklaracjeZsti + this.deklaracjeInternat + this.nieobecnosciZsti + this.nieobecnosciInternat;
    console.log(value, this.uczniowieZsti, this.uczniowieInternat, this.deklaracjeZsti, this.deklaracjeInternat, this.nieobecnosciZsti, this.nieobecnosciInternat);
    this.getDataBaseInfo()
  }

  show() : void {
    this.renderer.setStyle(this.DOMelement.querySelector('main'), 'display', 'flex');
  }

  generateToExcel(name : string, data : string, okres : boolean) : void {
    let button_excel : HTMLButtonElement = this.renderer.createElement('button');
    if(okres) button_excel.innerHTML = `Zapisz raport za okres ${data} do pliku Excel`;
    else button_excel.innerHTML = `Zapisz raport za ${data} do pliku Excel`;
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
  show_raport(event : MouseEvent) {
    let element : HTMLElement = event.target as HTMLElement;
    if(element.tagName !== 'LI') return;
    let id : number | null = parseInt(<string>element.getAttribute('data-id'));
    let content : HTMLElement = this.DOMelement.querySelector('#content');
    content.innerHTML = `<form name="data"></form>`;
    let form : HTMLFormElement = this.DOMelement.querySelector('form[name="data"]');
    form.method = 'POST';
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
      let select : HTMLSelectElement = this.renderer.createElement('select');
      let options : string[] = ['ZSTI', 'Internat', 'Obie'];
      select.name = 'typ';
      options.forEach((element : string) : void => {
        let option : HTMLOptionElement = this.renderer.createElement('option');
        option.value = element;
        option.innerHTML = element;
        select.appendChild(option);
      });
      form.appendChild(select);
      break;
    }
    let button : HTMLButtonElement = this.renderer.createElement('button');
    button.innerHTML = 'Generuj raport';
    button.addEventListener('click', (event : Event) : void => {
      if(this.DOMelement.querySelector('#content > button')) this.DOMelement.querySelector('#content > button').remove();
      this.DOMelement.querySelector('#raport').innerHTML = '';
      switch (id) {
        case 1:
          this.korekty(event);
          break;
      }
    });
    form.appendChild(button);
    let raport : HTMLElement = this.renderer.createElement('div');
    raport.setAttribute('id', 'raport');
    raport.innerHTML = '';
    content.appendChild(raport);
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
  close() : void {
    this.renderer.setStyle(this.DOMelement.querySelector('main'), 'display', 'none');
  }
  korekty(event : Event) : void | string {
    event.preventDefault();
    let date : string = this.DOMelement.querySelector('input[name="month"]').value;
    let data_od : string = this.DOMelement.querySelector('input[name="data-od"]').value;
    let data_do : string = this.DOMelement.querySelector('input[name="data-do"]').value
    let typ : string = this.DOMelement.querySelector('select[name="typ"]').value;
    let raport : HTMLElement = this.DOMelement.querySelector('#raport');
    if (date === '' && (data_od === '' || data_do === '')) return raport.innerHTML = 'Wprowadź datę!';
    if (date !== '' && (data_od !== '' || data_do !== '')) return raport.innerHTML = 'Wprowadź tylko jedną datę!';
    if (date !== '' && !this.checkDate(date)) return raport.innerHTML = 'Niepoprawny format daty!';
    if(data_do < data_od) return raport.innerHTML = 'Data od nie może być większa niż data od!';
    let table : HTMLElement = this.renderer.createElement('table');
    table.setAttribute('id', 'raport_table');
    let columns : string[] = ['Imię','Grupa','Wersja','Należność','Uwagi/Podpis']
    let tr : HTMLElement = this.renderer.createElement('tr');
    for(let i : number = 0 ; i < 5 ; i++) {
      let th : HTMLElement = this.renderer.createElement('th');
      th.innerHTML = columns[i];
      tr.appendChild(th);
    }
    table.appendChild(tr);
    switch (typ) {
      case 'ZSTI':
        this.osoby_zsti.forEach((osoba : string) : void => {
          let tr : HTMLElement = this.renderer.createElement('tr');
          let td : HTMLElement = this.renderer.createElement('td');
          td.innerHTML = osoba;
          tr.appendChild(td);
          let td2 : HTMLElement = this.renderer.createElement('td');
          td2.innerHTML = 'szkoła';
          tr.appendChild(td2);
          let td3 : HTMLElement = this.renderer.createElement('td');
          td3.innerHTML = 'obiady';
          tr.appendChild(td3);
          let td4 : HTMLElement = this.renderer.createElement('td');
          td4.innerHTML = '9 zł'; //! pobierać z bazy danych ilość blokad obiadów * 9
          tr.appendChild(td4);
          let td5 : HTMLElement = this.renderer.createElement('td');
          td5.innerHTML = 'placeholder';
          tr.appendChild(td5);
          table.appendChild(tr);
        })
        break;
      case 'Internat':
        this.osoby_internat.forEach((osoba : string) : void => {
          let tr : HTMLElement = this.renderer.createElement('tr');
          let td : HTMLElement = this.renderer.createElement('td');
          td.innerHTML = osoba;
          tr.appendChild(td);
          let td2 : HTMLElement = this.renderer.createElement('td');
          td2.innerHTML = 'internat'; //! pobierać grupe z baz danych
          tr.appendChild(td2);
          let td3 : HTMLElement = this.renderer.createElement('td');
          td3.innerHTML = 'wersja posiłku'; //! pobierać wersje posiłku z bazy danych
          tr.appendChild(td3);
          let td4 : HTMLElement = this.renderer.createElement('td');
          td4.innerHTML = 'należność'; //! pobierać z bazy danych
          tr.appendChild(td4);
          let td5 : HTMLElement = this.renderer.createElement('td');
          td5.innerHTML = 'placeholder';
          tr.appendChild(td5);
          table.appendChild(tr);
        })
        break;
        case 'Obie':
          let osoby : string[] = this.osoby_zsti.concat(this.osoby_internat);
          osoby.forEach((osoba : string) : void => {
            let tr : HTMLElement = this.renderer.createElement('tr');
            let td : HTMLElement = this.renderer.createElement('td');
            td.innerHTML = osoba;
            tr.appendChild(td);
            let td2 : HTMLElement = this.renderer.createElement('td');
            this.osoby_zsti.includes(osoba) ? td2.innerHTML = 'szkoła' : td2.innerHTML = 'internat';
            tr.appendChild(td2);
            let td3 : HTMLElement = this.renderer.createElement('td');
            this.osoby_zsti.includes(osoba) ? td3.innerHTML = 'obiady' : td3.innerHTML = 'wersja posiłku'; //! pobierać wersje posiłku z bazy danych
            tr.appendChild(td3);
            let td4 : HTMLElement = this.renderer.createElement('td');
            td4.innerHTML = 'należność'; //! pobierać z bazy danych
            tr.appendChild(td4);
            let td5 : HTMLElement = this.renderer.createElement('td');
            td5.innerHTML = 'placeholder';
            tr.appendChild(td5);
            table.appendChild(tr);
          })
    }
    raport.appendChild(table);
    if(data_od !== '' || data_do !== '') this.generateToExcel('korekty', `${data_od} — ${data_do}`, true);
    else this.generateToExcel('korekty', date, false);
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
    let typ : string = this.DOMelement.querySelector('form[name="miesiac"] select[name="typ"]').value;
    let table : HTMLElement = this.renderer.createElement('table');
    table.setAttribute('id', 'raport_table');
    let days_in_month : number = new Date(parseInt(date.split('-')[0], 10), parseInt(date.split('-')[1], 10), 0).getDate();
    let first_day : number = new Date(parseInt(date.split('-')[0], 10), parseInt(date.split('-')[1], 10) - 1, 1).getDay();
    let weekend_days : number = 0;


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
  }
}
