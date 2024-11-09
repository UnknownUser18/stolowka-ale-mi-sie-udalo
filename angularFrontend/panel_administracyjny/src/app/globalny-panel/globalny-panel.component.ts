import { Component, ElementRef } from '@angular/core';
import { NgForOf, NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-globalny-panel',
  standalone: true,
  imports: [
    NgForOf,
    NgOptimizedImage
  ],
  templateUrl: './globalny-panel.component.html',
  styleUrls: ['./globalny-panel.component.css']
})
export class GlobalnyPanelComponent {
  constructor(private el: ElementRef) { }

  day: number = new Date().getDate();
  month: number = new Date().getMonth();
  year: number = new Date().getFullYear();
  days_in_month: number = new Date(this.year, this.month + 1, 0).getDate();
  dni_nieczynne: string[] = ['2024-11-07', '2024-12-25', '2025-11-03', '2024-11-09', '2024-11-06','2025-03-05','2024-10-11','2024-11-11'].sort();
  nieczynneZaIle_teraz: string[] = [];
  dni_nieczynne_za_ile: string[] = [];
  aktualny_dni_nieczynne: string[] | undefined;
  yearBefore: number = this.year;
  miesiace: Array<{ month: string, disabled: boolean }> = [];
  minDay: number = 1;
  ngOnInit() {
    let date = new Date();
    let futureDate = new Date();
    futureDate.setMonth(date.getMonth() + 3);
    this.aktualny_dni_nieczynne = this.dni_nieczynne.filter(dateStr => {
      const date_inner = new Date(dateStr);
      return date_inner >= date && date_inner <= futureDate || date_inner.toDateString() === date.toDateString();
    });
    this.dni_nieczynne.forEach(dateStr => {
      const daysDiff = (dateStr: string) => {
        const date_inner = new Date(dateStr);
        const timeDiff = date_inner.getTime() - date.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        if (daysDiff === 0) return '(Dzisiaj)';
        if (daysDiff === 1) return '(Jutro)';
        if (daysDiff < 0) return daysDiff === -1 ? '(Wczoraj)' : `(${Math.abs(daysDiff)} dni temu)`;
        return `(za ${daysDiff} dni)`;
      };

      if (this.aktualny_dni_nieczynne) {
        this.aktualny_dni_nieczynne.forEach(dateStr => {
          this.nieczynneZaIle_teraz.push(daysDiff(dateStr));
        });
      }
      if (this.dni_nieczynne) {
        this.dni_nieczynne_za_ile.push(daysDiff(dateStr));
      }

      const miesiace: string[] = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
      const disabledMonths = new Set<number>();
      if (this.aktualny_dni_nieczynne) {
        this.aktualny_dni_nieczynne.forEach(dateStr => {
          const month_inner = parseInt(dateStr.split('-')[1], 10);
          disabledMonths.add(month_inner);
        });
      }
      this.miesiace = miesiace.map((month, index) => ({
        month,
        disabled: !disabledMonths.has(index + 1)
      }));
      if(this.day - 7 < 1) {
        this.miesiace[this.month-1] = { month: this.miesiace[this.month-1].month, disabled: false };
        this.minDay = new Date(this.year, this.month + 1, 0).getDate() - 7;
      }
      else {
        this.minDay = this.day - 7;
      }
    });
  }

  dodaj() {
    console.log('dodaj');
    let day = this.el.nativeElement.querySelector('form[name="dni_nieczynne"] input[name="dzien"]');
    if(day.value > new Date(this.year, this.month + 1, 0).getDate() || day.value < 1) {
      alert('Niepoprawny dzień!');
      return;
    }
    let month = this.el.nativeElement.querySelector('form[name="dni_nieczynne"] select[name="miesiac"]');
    let year = this.el.nativeElement.querySelector('form[name="dni_nieczynne"] input[name="rok"]');
    let string = `${year.value}-${month.value}-${day.value}`;
    console.log(string);
  }

  check() {
    let year = parseInt(this.el.nativeElement.querySelector('form[name="dni_nieczynne"] input[name="rok"]').value);
    let month = parseInt(this.el.nativeElement.querySelector('form[name="dni_nieczynne"] select[name="miesiac"]').value);

    if (year > this.year && year != this.yearBefore) {
      this.miesiace = this.miesiace.map(month => {
        return { month: month.month, disabled: false };
      });
      this.el.nativeElement.querySelector('form[name="dni_nieczynne"] input[name="dzien"]').value = 1;
    } else if (year != this.yearBefore) {
      this.miesiace = this.miesiace.map((month, index) => {
        return {month: month.month, disabled: index < this.month};
      });
      setTimeout(() => {
        this.el.nativeElement.querySelector('form[name="dni_nieczynne"] select[name="miesiac"]').value = this.month.toString();
        // safeguard
        if(this.day - 7 < 1) {
          this.miesiace[month-1] = { month: this.miesiace[month-1].month, disabled: false };
          this.el.nativeElement.querySelector('form[name="dni_nieczynne"] input[name="dzien"]').min = new Date(year, this.month + 1, 0).getDate() - 7;
        }
        else {
          this.el.nativeElement.querySelector('form[name="dni_nieczynne"] input[name="dzien"]').min = this.day - 7;
          this.el.nativeElement.querySelector('form[name="dni_nieczynne"] input[name="dzien"]').value = this.day;
        }
        this.el.nativeElement.querySelector('form[name="dni_nieczynne"] input[name="dzien"]').max = new Date(year, this.month + 1, 0).getDate();
      }, 0);

    }
    this.yearBefore = year;
    if (year === this.year && month === this.month) {
      // safeguard
      if(this.day - 7 < 1) {
        this.miesiace[month-1] = { month: this.miesiace[month-1].month, disabled: false };
        this.el.nativeElement.querySelector('form[name="dni_nieczynne"] input[name="dzien"]').min = new Date(year, month + 1, 0).getDate() - 7;
      }
      else {
        this.el.nativeElement.querySelector('form[name="dni_nieczynne"] input[name="dzien"]').min = this.day - 7;
      }
      this.el.nativeElement.querySelector('form[name="dni_nieczynne"] input[name="dzien"]').max = new Date(year, month + 1, 0).getDate();
    } else {
      this.el.nativeElement.querySelector('form[name="dni_nieczynne"] input[name="dzien"]').min = 1;
      this.el.nativeElement.querySelector('form[name="dni_nieczynne"] input[name="dzien"]').max = new Date(year, month + 1, 0).getDate();
    }
  }

  usun() {
    console.log('usun');
    let element = this.el.nativeElement.querySelector('form[name="dni_nieczynne"] select[multiple]').value
    if(element === '') {
      alert('Nie wybrano żadnego dnia do usunięcia!')
    }
    console.log(element)
  }

  show() {
    this.el.nativeElement.querySelector('#dni_nieczynne').style.display = 'flex';
  }
  close() {
    this.el.nativeElement.querySelector('#dni_nieczynne').style.display = 'none';
  }

  dodaj_os() {
    this.el.nativeElement.querySelector('#dodaj_osobe').style.display = 'flex';
  }
  close_os() {
    this.el.nativeElement.querySelector('#dodaj_osobe').style.display = 'none';
  }
  dodaj_osobe() {
    console.log('dodaj_osobe');
  }
  change_form() {
    console.log('change_form');
    const typ = this.el.nativeElement.querySelector('form[name="dodaj"] select[name="typ"]').value;
    switch(typ) {
      case 'wybierz':
        this.el.nativeElement.querySelectorAll('form[name="dodaj"] fieldset').forEach((element : HTMLElement) => {
          element.style.display = 'none';
        })
        this.el.nativeElement.querySelector('form[name="dodaj"]').style.width = '20%';
        this.el.nativeElement.querySelector('form[name="dodaj"] > :nth-last-child(2)').style.display = 'none';

        break;
      case 'ZSTI':
        this.el.nativeElement.querySelectorAll('.zsti').forEach((element : HTMLElement) => {
          element.style.display = 'flex';
        })
        this.el.nativeElement.querySelectorAll('form[name="dodaj"] fieldset').forEach((element : HTMLElement) => {
          element.style.display = 'block';
        })
        this.el.nativeElement.querySelector('form[name="dodaj"] > :nth-last-child(2)').style.display = 'flex';
        this.el.nativeElement.querySelector('form[name="dodaj"]').style.width = 'fit-content';
        this.el.nativeElement.querySelectorAll('.internat').forEach((element : HTMLElement) => {
          element.style.display = 'none';
        })
        break;
      case 'Internat':
        this.el.nativeElement.querySelectorAll('.zsti').forEach((element : HTMLElement) => {
          element.style.display = 'none';
        })
        this.el.nativeElement.querySelectorAll('form[name="dodaj"] fieldset').forEach((element : HTMLElement) => {
          element.style.display = 'block';
        })
        this.el.nativeElement.querySelector('form[name="dodaj"] > :nth-last-child(2)').style.display = 'flex';
        this.el.nativeElement.querySelector('form[name="dodaj"]').style.width = 'fit-content';
        this.el.nativeElement.querySelectorAll('.internat').forEach((element : HTMLElement) => {
          element.style.display = 'flex';
        })
        break;
      default:
        console.error('Nieznany typ');
        break;
    }
    const typ_zsti = this.el.nativeElement.querySelector('form[name="dodaj"] select[name="typ_zsti"]').value;
    if(typ === 'ZSTI') {
      switch (typ_zsti) {
        case 'uczeń':
          this.el.nativeElement.querySelector('form[name="dodaj"] input[name="klasa"]').parentElement.style.display = 'flex';
          break;
        case 'nauczyciel':
          this.el.nativeElement.querySelector('form[name="dodaj"] input[name="klasa"]').parentElement.style.display = 'none';
          break;
        default:
          console.error('Nieznany typ');
          break
      }
    }
  }
}
