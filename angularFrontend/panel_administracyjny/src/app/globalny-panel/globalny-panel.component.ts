import {Component, ElementRef, OnInit} from '@angular/core';
import { NgForOf, NgOptimizedImage } from '@angular/common';
import {DataBaseService} from '../data-base.service';
import {GlobalnyRaportComponent} from '../globalny-raport/globalny-raport.component';

@Component({
  selector: 'app-globalny-panel',
  standalone: true,
  imports: [
    NgForOf,
    NgOptimizedImage,
    GlobalnyRaportComponent
  ],
  templateUrl: './globalny-panel.component.html',
  styleUrls: ['./globalny-panel.component.css']
})
export class GlobalnyPanelComponent implements OnInit{
  constructor(private el: ElementRef, private dataService: DataBaseService) {
    this.dataService.DisabledDays.asObservable().subscribe((change:any)=>this.updateDays(change));
    this.dataService.getDisabledDays()
    this.dataService.LastStudentInsertId.asObservable().subscribe((change:any)=>this.sendDeclaration(change));
  }

  student: { imie: string, nazwisko:string, typ_osoby_id:number, klasa:string, uczeszcza:boolean} = {imie:'', nazwisko:'', typ_osoby_id: 0, klasa:'', uczeszcza:false}
  editedStudent: { imie: string, nazwisko:string, typ_osoby_id?:number, klasa?:string, uczeszcza:boolean} = {imie:'', nazwisko:'', typ_osoby_id: 0, klasa:'', uczeszcza:false}

  nullDeclaration: {data_od:string, data_do:string, rok_szkolny_id:number, rok_szkolny?:string ,osoby_internat_id?:number, id_osoby?:number, dniString: string, dni?:any, wersja:number, poniedzialek?:any, wtorek?:any, sroda?:any, czwartek?:any, piatek?:any} = {data_od:'', data_do:'', rok_szkolny_id:-1, osoby_internat_id: -1, id_osoby: -1, dni: -1, wersja: -1, dniString: ''};
  declaration: {data_od:string, data_do:string, rok_szkolny_id:number, rok_szkolny?:string ,osoby_internat_id?:number, id_osoby?:number, dniString: string, dni?:any, wersja:number, poniedzialek?:any, wtorek?:any, sroda?:any, czwartek?:any, piatek?:any} = {data_od:'', data_do:'', rok_szkolny_id:-1, osoby_internat_id: -1, id_osoby: -1, dni: -1, wersja: -1, dniString: ''};
  editedDeclaration: {data_od:string, data_do:string, rok_szkolny_id:number, rok_szkolny?:string, osoby_internat_id?:number, id_osoby?:number, dniString?: string, dni?:any, wersja?:number, poniedzialek?:any, wtorek?:any, sroda?:any, czwartek?:any, piatek?:any} = {data_od:'', data_do:'', rok_szkolny_id:-1, osoby_internat_id: -1, id_osoby: -1, dni: -1, wersja: -1, dniString: ''};

  insertedDeclaration:boolean = true;

  day: number = new Date().getDate();
  month: number = new Date().getMonth();
  year: number = new Date().getFullYear();
  days_in_month: number = new Date(this.year, this.month + 1, 0).getDate();
  dni_nieczynne: string[] = []
  nieczynneZaIle_teraz: string[] = [];
  dni_nieczynne_za_ile: string[] = [];
  aktualny_dni_nieczynne: string[] | undefined;
  yearBefore: number = this.year;
  miesiace: Array<{ month: string, disabled: boolean }> = [];
  minDay: number = 1;
  ngOnInit() {
    this.updateDays(null)
    this.refresh()
  }

  updateDays(change:any)
  {
    this.dni_nieczynne = []
    if(!change)
    {
      this.dni_nieczynne.push('')
      return

    }
    change.forEach((dni:any) => {
      let value = new Date(dni.dzien)
      this.dni_nieczynne.push(`${value.getFullYear()}-${value.getMonth() + 1}-${value.getDate()}`)
    })
    this.dni_nieczynne.sort((a:any, b:any) => {
      let dateA:Date = new Date(a);
      let dateB:Date = new Date(b);

      // @ts-ignore
      return dateA - dateB;
    });
    this.refresh()
  }

  refresh()
  {
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

  daysFromNow(dateString: string): string {
    const inputDate = new Date(dateString);
    const today = new Date();

    const differenceInTime = inputDate.getTime() - today.getTime();

    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));

    if(differenceInDays < 0 )
      return '(' + Math.abs(differenceInDays) + " dni temu)"
    if(differenceInDays === 0)
      return '(dzisiaj)'
    if(differenceInDays === 1)
      return '(jutro)'
    if(differenceInDays > 0 )
      return '(za ' + differenceInDays + ' dni)'
    return 'undefined'
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
    let date = new Date(string)
    date.setMonth(date.getMonth() + 1)
    console.log(`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`);
    this.dataService.send(
      JSON.stringify({
        action: "request",
        params: {
          method: "AddDniNieczynne",
          date: `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`
        }
      }))
    this.dataService.getDisabledDays()
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
        if(this.day - 7 < 1) {
          this.miesiace[month-1] = { month: this.miesiace[month-1].month, disabled: false };
          this.el.nativeElement.querySelector('form[name="dni_nieczynne"] input[name="dzien"]').min = new Date(year, this.month + 1, 0).getDate() - 7;
        }
        else {
          this.el.nativeElement.querySelector('form[name="dni_nieczynne"] input[name="dzien"]').min = this.day - 7;
          this.el.nativeElement.querySelector('form[name="dni_nieczynne"] input[name="dzien"]').value = this.day;
        }
        this.el.nativeElement.querySelector('form[name="dni_nieczynne"] input[name="dzien"]').max = new Date(year, this.month + 1, 0).getDate();
      }, 10);

    }
    this.yearBefore = year;
    if (year === this.year && month === this.month) {
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
    this.dataService.send(
      JSON.stringify({
        action: "request",
        params: {
          method: "DeleteDniNieczynne",
          date: element
        }
      }))
    this.dataService.getDisabledDays()
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
    let thisElement = this.el.nativeElement;
    this.editedStudent = {
      imie: thisElement.querySelector('input[name="imie"]').value,
      nazwisko:thisElement.querySelector('input[name="nazwisko"]').value,
      uczeszcza: true
    }
    if(thisElement.querySelector('select[name="typ"]').value === 'ZSTI')
    {
      this.editedStudent.typ_osoby_id = thisElement.querySelector('select[name="typ_zsti"]').value
      this.editedStudent.klasa = thisElement.querySelector('input[name="klasa"]').value
      this.dataService.send(JSON.stringify({
        action: "request",
        params: {
          method: "addZstiStudent",
          name: this.editedStudent.imie,
          surname: this.editedStudent.nazwisko,
          class: this.editedStudent.klasa,
          attends: this.editedStudent.uczeszcza,
          type: this.editedStudent.typ_osoby_id
        }
      }))
    }
    else{
      this.dataService.send(JSON.stringify({
        action: "request",
        params: {
          method: "addInternatStudent",
          name: this.editedStudent.imie,
          surname: this.editedStudent.nazwisko,
          attends: this.editedStudent.uczeszcza
        }
      }))
    }
    this.insertedDeclaration = false;
    console.log('dodaj_osobe');
  }
  sendDeclaration(change:any)
  {
    let thisElement = this.el.nativeElement;
    this.editedDeclaration = {
      rok_szkolny_id: 0,
      data_od: thisElement.querySelector('input[name="data_od"]').value,
      data_do: thisElement.querySelector('input[name="data_do"]').value
    }
    this.editedDeclaration.rok_szkolny = thisElement.querySelector('input[name="rok_szkolny"]').value
    let rokSzkolny = this.dataService.SchoolYears.value.find((element:any) => element.rok_szkolny == this.editedDeclaration.rok_szkolny)
    if(!rokSzkolny)
    {
      this.dataService.send(JSON.stringify(
        {
          action: "request",
          params: {
            method: "addSchoolYear",
            year: this.editedDeclaration.rok_szkolny
          }
        }))
      console.log(JSON.stringify(
        {
          action: "request",
          params: {
            method: "addSchoolYear",
            year: this.editedDeclaration.rok_szkolny
          }
        }))
      this.dataService.getSchoolYears()
    }
    let IntervalSchoolYear = setInterval(()=>{
      rokSzkolny = this.dataService.SchoolYears.value.find((element:any) => element.rok_szkolny === this.editedDeclaration.rok_szkolny)
      if(rokSzkolny.id)
      {
        clearInterval(IntervalSchoolYear)
        this.editedDeclaration.rok_szkolny_id = rokSzkolny.id
        this.afterSendDeclaration()
      }
    }, 500)

  }

  toBinary(num : number, len : number)
  {
    let binary = Number(num).toString(2)
    for(let i = 0 ; i < len - binary.length; i++)
    {
      binary = '0' + binary
    }
    return binary;
  }

  afterSendDeclaration()
  {
    let thisElement = this.el.nativeElement;
    if(thisElement.querySelector('select[name="typ"]').value === 'ZSTI')
    {
      this.editedDeclaration.id_osoby = this.dataService.LastStudentInsertId.value.insertId;
      let dni = [
        this.el.nativeElement.querySelector('input[name="poniedzialek"]'),
        this.el.nativeElement.querySelector('input[name="wtorek"]'),
        this.el.nativeElement.querySelector('input[name="sroda"]'),
        this.el.nativeElement.querySelector('input[name="czwartek"]'),
        this.el.nativeElement.querySelector('input[name="piatek"]')
      ]
      let value = ''
      dni.forEach((element:any)=>{
        value += element.checked ? '1' : '0';
      })
      console.log(value, this.toBinary(parseInt(value, 2), 5))
      this.editedDeclaration.dni = parseInt(value, 2);
      this.dataService.send(JSON.stringify({
        action: "request",
        params: {
          method: "addZstiDeclaration",
          studentId: this.editedDeclaration.id_osoby,
          schoolYearId: this.editedDeclaration.rok_szkolny_id,
          beginDate: this.editedDeclaration.data_od,
          endDate: this.editedDeclaration.data_do,
          days: this.editedDeclaration.dni
        }
      }))
      this.dataService.getStudentDeclarationZsti()
    }
    else{
      this.editedDeclaration.osoby_internat_id = this.dataService.LastStudentInsertId.value.insertId;
      this.dataService.send(JSON.stringify({
        action: "request",
        params: {
          method: "addInternatDeclaration",
          studentId: this.editedDeclaration.osoby_internat_id,
          schoolYearId: this.editedDeclaration.rok_szkolny_id,
          beginDate: this.editedDeclaration.data_od,
          endDate: this.editedDeclaration.data_do,
          wersja: this.editedDeclaration.wersja
        }
      }))
      this.dataService.getStudentDeclarationInternat()
    }
    console.log(this.dataService.LastStudentInsertId.value.insertId)
    this.dataService.getStudentList()
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
