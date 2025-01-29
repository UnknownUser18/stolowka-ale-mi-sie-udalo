import {Component, ElementRef, Input, OnChanges, OnInit, Renderer2, SimpleChanges} from '@angular/core';
import {NgForOf, NgIf, NgOptimizedImage} from '@angular/common';
import {FormsModule} from "@angular/forms";
import {DataBaseService} from '../data-base.service';
import {DeklaracjaZSTI, DeklaracjaInternat, toBinary, GetZSTIDisabledDays, GetInternatDisabledDays} from '../app.component';

@Component({
  selector: 'app-kalendarz',
  standalone: true,
  imports: [NgOptimizedImage, FormsModule, NgForOf, NgIf],
  templateUrl: './kalendarz.component.html',
  styleUrl: './kalendarz.component.css'
})
export class KalendarzComponent implements OnChanges, OnInit {
  DOMelement : any | undefined;
  @Input() typ: string | undefined;
  @Input() name: string | undefined;
  currentDate: string | undefined;
  date: Date = new Date();
  CurrentStudentDeclaration: DeklaracjaZSTI | DeklaracjaInternat | void | undefined;
  StudentZstiDays: Array<GetZSTIDisabledDays> | undefined;
  dbCopyZstiDays: any[] = [];
  StudentInternatDays: Array<GetInternatDisabledDays> | undefined;
  diff_selected_zsti: string[] = [];
  diff_undo_selected_zsti: string[] = [];
  months : string[] = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
  month_before: string = this.months[new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).getMonth()] + " " + new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).getFullYear();
  month_next: string = this.months[new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).getMonth()] + " " + new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).getFullYear();
  selected: Array<string> = [];
  selectedDisabled: Array<string> = [];
  dni: any[] = [];
  DisabledDays: any;
  empty_diff_zsti : boolean = true;
  empty_diff_undo_zsti : boolean = true;
  // dla wychowanków internatu
  empty_dodanie : boolean = true;
  empty_usuniecie : boolean = true;
  typy_posilkow_db: { operacja: string; array_operacaja: Array<{ id: string; array: Array<any> }> } =
    {
      operacja: 'zarejestrowane',
      array_operacaja: [
        {id: 'sniadanie', array: []},
        {id: 'obiad', array: []},
        {id: 'kolacja', array: []},
      ],
    }
  // na zmiane posilków
  usuniecie: Array<{id : string, array : Array<any>}> = [
    {id: 'sniadanie', array : []},
    {id: 'obiad', array: []},
    {id: 'kolacja', array: []}
  ];
  dodanie: Array<{id : string, array : Array<any>}> = [
    {id: 'sniadanie', array: []},
    {id: 'obiad', array: []},
    {id: 'kolacja', array: []}
  ];
  numer_week: number = 0;
  constructor(private renderer: Renderer2, private el: ElementRef, private dataService: DataBaseService) {
    this.DOMelement = this.el.nativeElement;
    console.log("Data service: ", this.dataService.StudentType.value)
    switch (this.dataService.StudentType.value) {
      case "ZSTI":
        this.dataService.StudentZstiDays.asObservable().subscribe((data : Array<GetZSTIDisabledDays>) : void => {
          this.StudentZstiDays = data?.map(item => new GetZSTIDisabledDays(item.dzien_wypisania, item.osoby_zsti_id, item.uwagi));
        });
        this.dataService.CurrentStudentDeclaration.asObservable().subscribe((data : DeklaracjaZSTI) : void => {
          console.log("Deklaracja: ", data)
          this.CurrentStudentDeclaration = data?.assignValues(data);
        });
        break;
      case "Internat":
        this.dataService.StudentInternatDays.asObservable().subscribe((data : Array<GetInternatDisabledDays>) : void => {
          this.StudentInternatDays = data?.map(item => new GetInternatDisabledDays(item.posilki_id, item.dzien_wypisania, item.osoby_internat_id, item.uwagi));
        });
        this.dataService.CurrentStudentDeclaration.asObservable().subscribe((data : DeklaracjaInternat) : void => {
          this.CurrentStudentDeclaration = data?.assignValues(data);
        });
        break;
      default:
        console.error("Nie wybrano typu ucznia");
        break;
    }
    console.log("Deklaracja: ", this.CurrentStudentDeclaration)
    this.month_next = this.months[new Date(this.date.getFullYear(), this.date.getMonth() + 1, 1).getMonth()] + " " + new Date(this.date.getFullYear(), this.date.getMonth() + 1, 1).getFullYear()
    this.month_before = this.months[new Date(this.date.getFullYear(), this.date.getMonth() - 1, 1).getMonth()] + " " + new Date(this.date.getFullYear(), this.date.getMonth() - 1, 1).getFullYear()
    this.DOMelement = this.el.nativeElement;
    this.dataService.CurrentZstiDays.asObservable().subscribe(() => {
      this.selected = []
      this.dbCopyZstiDays = []
      if(!this.dataService.CurrentZstiDays.value)
      {
        this.show_calendar()
        return
      }
      console.log("Zarejestrowane dni: ", this.dataService.CurrentZstiDays.value)
      this.dataService.CurrentZstiDays.value.forEach((element:any) => {
        let data : Date = new Date(element.dzien_wypisania)
        let value = data.getFullYear() + "-" + (data.getMonth() + 1) + "-" + data.getDate()
        this.selected.push(value);
        this.dbCopyZstiDays.push(value)
      })
      this.show_calendar()
    })
    this.dataService.CurrentInternatDays.asObservable().subscribe(() => {
      this.dodanie.forEach((element)=>{
        element.array = []
      })
      this.usuniecie.forEach((element)=>{
        element.array = []
      })
      this.typy_posilkow_db.array_operacaja.forEach((element)=>{
        element.array = []
      })
      if(!this.dataService.CurrentInternatDays.value)
      {
        this.show_calendar()
        return
      }
      this.dataService.CurrentInternatDays.value.forEach((element:any)=>{
        let data : Date = new Date(element.dzien_wypisania)
        let value = data.getFullYear() + "-" + (data.getMonth() + 1) + "-" + data.getDate()
        switch(element.posilki_id){
          case 1:
            this.typy_posilkow_db.array_operacaja[0].array.push(value);
            break;
          case 2:
            this.typy_posilkow_db.array_operacaja[1].array.push(value)
            break;
          case 3:
            this.typy_posilkow_db.array_operacaja[2].array.push(value)
            break;
        }
      })
      console.log("Zarejestrowane dni nieobecnosci: ", this.typy_posilkow_db)
      this.show_calendar()
    })


    this.dataService.DisabledDays.asObservable().subscribe(()=> {
      this.DisabledDays = [];
      if(!this.dataService.DisabledDays.value)
      {
        this.show_calendar()
        return
      }

      this.dataService.DisabledDays.value.forEach((element: any) => {
        let data : Date = new Date(element.dzien)
        let value = data.getFullYear() + "-" + (data.getMonth() + 1) + "-" + data.getDate()
        this.DisabledDays.push(value)
      })
      this.show_calendar()
    })
  };
  checkSelected() {
    let result = true;
    this.selected.forEach(() =>
    {
      result = false
    })
    this.dataService.changeSelectedSaved(result)
    if (this.empty_diff_zsti) this.empty_diff_zsti = false;
    if (this.empty_diff_undo_zsti) this.empty_diff_undo_zsti = false;
  }

  checkTypPosilkow(){
    let result = true
    // dodanie
    this.dodanie.forEach((element)=>{
      element.array.forEach(()=>{
        result = false
      })
    })
    // usuniecie
    this.usuniecie.forEach((element)=>{
      element.array.forEach(()=>{
        result = false
      })
    })
    if (this.empty_dodanie) this.empty_dodanie = false;
    if (this.empty_usuniecie) this.empty_usuniecie = false;
    this.dataService.changeTypPoslikuSaved(result);
    console.log("Is everything saved? : ", this.dataService.TypPosilkuSaved.value);
  }
  ngOnChanges(changes: SimpleChanges) : void   {
    if (changes['typ'] || changes['name']) {
      console.warn("Typ: ", this.typ)
      this.selected = [];
      this.diff_selected_zsti = [];
      this.diff_undo_selected_zsti = [];
      this.usuniecie.forEach((element) => {
        element.array = []
      });
      this.dodanie.forEach((element) => {
        element.array = []
      });
      this.dataService.getStudentZstiDays();
      this.dataService.getStudentInternatDays();
      console.log("Typ: ", this.typ)
      this.dataService.getDisabledDays();
      this.show_calendar();
      if(this.typ === 'Internat') {
        (this.DOMelement?.querySelector('#zsti_diff') as HTMLElement).style.display = 'none';
        this.DOMelement?.querySelectorAll('.internat_logs')?.forEach((element: HTMLElement) => {
          element.style.display = 'block';
        });
      }
      else if(this.typ === 'ZSTI') {
        (this.DOMelement?.querySelector('#zsti_diff') as HTMLElement).style.display = 'flex';
        this.DOMelement?.querySelectorAll('.logs').forEach((element : HTMLElement) : void => {
          element.classList.add('empty');
        });
        this.DOMelement?.querySelectorAll('.internat_logs').forEach((element : HTMLElement) : void => {
          element.style.display = 'none';
        });
        this.empty_dodanie = true;
        this.empty_usuniecie = true;
      }
    }
  }

  getWeekNumber(date: Date): number {
    const tempDate: Date = new Date(date.getTime());
    tempDate.setDate(tempDate.getDate() + 4 - (tempDate.getDay() || 7));
    const yearStart: Date = new Date(tempDate.getFullYear(), 0, 1);
    return Math.ceil((((tempDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  getStartingWeekNumber(year : number, month : number) : number {
      const firstDayOfMonth = new Date(year, month - 1, 1);
      return this.getWeekNumber(firstDayOfMonth);
  }
  changeDeclaration(change : DeklaracjaZSTI | DeklaracjaInternat) : void {
    console.log("Change declaration: ", change)
    this.CurrentStudentDeclaration = change;
    //! fix someday...
    this.show_calendar()
  }
  sendDays() {
    if(this.dataService.StudentType.value === "ZSTI") {
      this.selected.forEach((element)=>{
        if(!this.dbCopyZstiDays.includes(element)) {
          this.dataService.send(
            JSON.stringify({
              action: "request",
              params: {
                method: "AddZstiDays",
                studentId: this.dataService.CurrentStudentId.value,
                date: element,
                schoolYearId: this.dataService.CurrentStudentDeclaration.value.rok_szkolny_id
              }
            })
          )
          console.log("Dodaj element: ", element)
        }
      })
      this.dbCopyZstiDays.forEach((element: any)=>{
        if(!this.selected.includes(element)) {
          this.dataService.send(
            JSON.stringify({
              action: "request",
              params: {
                method: "DeleteZstiDays",
                studentId: this.dataService.CurrentStudentId.value,
                date: element
              }
            })
          )
          console.log("Usun element: ", element,{
            action: "request",
            params: {
              method: "DeleteZstiDays",
              studentId: this.dataService.CurrentStudentId.value,
              date: element
            }
          })
        }
      })
      this.dataService.getStudentZstiDays()
      this.DOMelement?.querySelectorAll('.logs').forEach((element : HTMLElement) : void => {
        element.classList.add('empty');
      });
    }
    else if(this.dataService.StudentType.value === "Internat")
    {
      enum typ {sniadanie = 1, obiad = 2, kolacja = 3}
      this.dodanie.forEach((element_parent) => {
        element_parent.array.forEach((element) => {
          this.dataService.send(
            JSON.stringify({
              action: "request",
              params: {
                method: "AddInternatDays",
                studentId: this.dataService.CurrentStudentId.value,
                date: element,
                // @ts-ignore
                mealId: typ[element_parent.id],
                schoolYearId: this.dataService.CurrentStudentDeclaration.value.rok_szkolny_id
              }
            })
          )
        })
      })
      this.usuniecie.forEach((element_parent) => {
        element_parent.array.forEach((element) => {
          this.dataService.send(
            JSON.stringify({
              action: "request",
              params: {
                method: "DeleteInternatDays",
                studentId: this.dataService.CurrentStudentId.value,
                date: element,
                // @ts-ignore
                mealId: typ[element_parent.id]
              }
            })
          )
        })
      })
      this.dataService.getStudentInternatDays()
    }
    this.diff_undo_selected_zsti = []
    this.diff_selected_zsti = []
    this.dataService.changeTypPoslikuSaved(true)
    this.dataService.changeSelectedSaved(true)
  }
  checkIfEmpty() {
    this.diff_selected_zsti = this.selected.filter((element) => !this.dbCopyZstiDays.includes(element));
    let ul_1 = this.DOMelement?.querySelectorAll('.logs')[0] as HTMLElement;
    let ul_2 = this.DOMelement?.querySelectorAll('.logs')[1] as HTMLElement;
    this.diff_selected_zsti.length === 0 ? ul_1.classList.add('empty') : ul_1.classList.remove('empty');
    this.diff_undo_selected_zsti = this.dbCopyZstiDays.filter((element ) => !this.selected.includes(element));
    console.log("Diff undo: ", this.diff_undo_selected_zsti)
    this.diff_undo_selected_zsti.length === 0 ? ul_2.classList.add('empty') : ul_2.classList.remove('empty');
  }
  ngOnInit() {
    this.show_calendar()
    this.dataService.CurrentStudentDeclaration.asObservable().subscribe((change) => this.changeDeclaration(change));
    this.DOMelement?.querySelectorAll('.logs').forEach((element : HTMLElement) : void => {
      element.classList.add('empty');
    });
    this.checkIfEmpty();
    this.dodanie.forEach((element) => {
      element.array = []
    });
    this.usuniecie.forEach((element) => {
      element.array = []
    });
  }
isWeekend = (date: Date, button: HTMLButtonElement, typ: string): boolean => {
    let dayOfTheWeek = date.getDay();
    if(dayOfTheWeek === 0)
      dayOfTheWeek = 7
    dayOfTheWeek--
    if(!this.CurrentStudentDeclaration) {
      button.disabled = true;
      if (dayOfTheWeek !== 5 && dayOfTheWeek !== 6)
        button.classList.add('disabled-for-person')
      return true;
    }
    if(typ === 'ZSTI') {
      this.CurrentStudentDeclaration = this.CurrentStudentDeclaration as DeklaracjaZSTI;
      if (toBinary(Number(this.CurrentStudentDeclaration?.dni?.['data']),5)[dayOfTheWeek] === '0') {
        button.disabled = true;
        button.classList.add('disabled-for-person')
        return true;
      }
    }
    if(dayOfTheWeek === 5 || dayOfTheWeek === 6) {
      button.disabled = true;
      return true;
    }
    return false;
  }
  checkVersion(dayOfTheWeek:number, mealId:number) {
    if(!this.CurrentStudentDeclaration) return;
    let dni : string[] = ['poniedzialek','wtorek','sroda','czwartek','piatek']
    this.dni = [];
    dni.forEach((dzien : string) : void => {
      // @ts-ignore
      this.dni.push(toBinary(this.CurrentStudentDeclaration?.[dzien]?.data[0],3))
      //! really fix someday...
    })
    if(dayOfTheWeek === 0)
      dayOfTheWeek = 7
    dayOfTheWeek--
    return this.dni[dayOfTheWeek][mealId] === '1';
  }
  checkDayInternat(year: any, month: any, day: any, posilek: any, first_day_week: any, i: any, typy: any): boolean {
    const date = new Date(year, month - 1, day);
    if (date.getDay() === 0 || date.getDay() === 6) return false;

    const dayString = `${year}-${month + 1}-${i - first_day_week + 1}`;
    return this.checkVersion(date.getDay(), typy.indexOf(posilek)) ||
           this.dodanie.find(meal => meal.id === posilek)?.array.includes(dayString) ||
           this.typy_posilkow_db.array_operacaja.find(meal => meal.id === posilek)!.array.includes(dayString);
  }


  show_calendar() : void {
    let data: Date = this.date;
    const calendar_content: HTMLElement = this.DOMelement?.querySelector('#kalendarz')!;
    calendar_content.textContent = '';
    let year: number = data.getFullYear();
    let month: number = data.getMonth();
    let month_days: number = new Date(year, month + 1, 0).getDate();
    let first_day_week: number = new Date(year, month, 1).getDay();

    this.currentDate = this.months[month] + ' ' + year;
    let week : HTMLElement = this.renderer.createElement('div');
    week.classList.add('week');

    for (let i : number = -7; i <= (month_days + first_day_week + 6); i++) {
      let day : HTMLElement | HTMLButtonElement;
      if (i < first_day_week || i > month_days + first_day_week - 1) {
        day = this.renderer.createElement('div');
        day.classList.add('empty');
        week.appendChild(day);
      } else {
        day = this.renderer.createElement('button');
        day.classList.add('day');
        day.textContent = (i - first_day_week + 1).toString();

        if (this.typ === 'Internat') {
          const typy: string[] = ['sniadanie', 'obiad', 'kolacja'];
          const checkboxes: HTMLElement = this.renderer.createElement('div');
          typy.forEach((typ : string): void => {

            const checkbox: HTMLInputElement = this.renderer.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = typ;
            if (this.checkDayInternat(year, month + 1, i - first_day_week + 1, typ, first_day_week, i, typy))
              checkbox.checked = true;
            if (this.DisabledDays?.includes(`${year}-${month + 1}-${i - first_day_week + 1}`))
              checkbox.disabled = true;
            this.dodanie[typy.indexOf(typ)].array.forEach((data : string) : void => {
              console.log(data, `${year}-${month + 1}-${i - first_day_week + 1}`)
              if(data === `${year}-${month + 1}-${i - first_day_week + 1}`) {
                checkbox.checked = false;
              }
            })
            checkboxes.appendChild(checkbox);
          });
          day.appendChild(checkboxes);
          day.classList.add('internat');
        } else if (this.typ === 'ZSTI' && this.selected.includes(`${year}-${month + 1}-${i - first_day_week + 1}`) || this.selectedDisabled.includes(`${year}-${month + 1}-${i - first_day_week + 1}`))
          day.classList.add('selected');
      }
      this.isWeekend(new Date(`${year}-${month + 1}-${i - first_day_week + 1}`), (day as HTMLButtonElement), this.typ!);
      if (this.DisabledDays?.includes(`${year}-${month + 1}-${i - first_day_week + 1}`)) {
        (day as HTMLElement).classList.add('disabled-day-global');
        (day as HTMLButtonElement).disabled = true;
      }
      this.renderer.appendChild(week, day);
      if (i % 7 === 0) {
        calendar_content.appendChild(week);
        week = this.renderer.createElement('div');
        week.classList.add('week');
      }
    }
    const dni : HTMLElement = this.DOMelement?.querySelector('#dni')!;
    dni.textContent = '';
    for (let i : number = 0; i < 7; i++) {
      const daySpan: HTMLSpanElement = this.renderer.createElement('span');
      daySpan.textContent = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nie'][i];
      dni.appendChild(daySpan);
    }
    this.DOMelement?.querySelectorAll('.week')?.forEach((week : HTMLElement) : void => {
      if (!Array.from(week.children).some((child: Element) : boolean => (child as HTMLElement).classList.contains('day')))
        week.remove();
    });
    let week_number : number = this.getStartingWeekNumber(year, month + 1);
    const zaznacz: HTMLElement = this.DOMelement?.querySelector('#zaznacz')!;
    zaznacz.textContent = '';
    for (let i : number = 0; i < this.DOMelement?.getElementsByClassName('week').length!; i++) {
      let selected_days : number = 0;
      let days : number = 0;
      Array.from(this.DOMelement?.getElementsByClassName('week')[i]?.children as HTMLCollectionOf<HTMLElement>).forEach((day: HTMLElement): void => {
        if (!day.classList.contains('empty')) {
          if (day.classList.contains('selected'))
            selected_days++;
          days++;
        }
      });
      let zaznacz_ : HTMLElement = this.renderer.createElement('div');
      let number : number = week_number + i;
      if (number > 52) number = 1;
      zaznacz_.textContent = number.toString();
      let zaznaczAbbr : HTMLElement = this.renderer.createElement('abbr');
      let zaznaczElement : HTMLInputElement = this.renderer.createElement('input');
      let zaznaczSpan : HTMLElement = this.renderer.createElement('span');
      if (this.typ === 'Internat') {
        this.renderer.addClass(zaznaczSpan, 'zaznacz_internat');
        this.renderer.setProperty(zaznaczAbbr, 'title', 'Kliknij lewym przyciskiem myszy aby zmienić posiłek dla całego tygodnia');
      } else {
        this.renderer.setProperty(zaznaczAbbr, 'title', 'Kliknij lewy przycisk myszy aby zaznaczyć cały tydzień');
      }
      zaznaczElement.classList.add('zaznacz');
      zaznaczElement.type = 'checkbox';
      if (selected_days === days && this.typ === 'ZSTI') {
        zaznaczElement.checked = true;
      }
      zaznaczAbbr.append(zaznacz_, zaznaczElement, zaznaczSpan);
      zaznacz.appendChild(zaznaczAbbr);
    }
  }
  change_month(number: number) {
    if (number === 0) {
      this.date = new Date();
      this.show_calendar();
      return;
    }
    this.date = new Date(this.date.getFullYear(), this.date.getMonth() + number, 1);
    this.month_next = this.months[new Date(this.date.getFullYear(), this.date.getMonth() + 1, 1).getMonth()] + " " + new Date(this.date.getFullYear(), this.date.getMonth() + 1, 1).getFullYear()
    this.month_before = this.months[new Date(this.date.getFullYear(), this.date.getMonth() - 1, 1).getMonth()] + " " + new Date(this.date.getFullYear(), this.date.getMonth() - 1, 1).getFullYear()
    this.show_calendar();
  }
  select(element : MouseEvent) : void {
    if (this.typ === "ZSTI") {
      let target : HTMLElement = element.target as HTMLElement;
      if(target.classList.contains('week')) return;
      function isFullWeekSelected(week : HTMLElement) : boolean {
        let selected : number = 0;
        let days : number = 0;
        week.childNodes.forEach((day : any) : void  => {
          day = day as HTMLButtonElement;
          if (!day.classList.contains('empty') && !day.disabled) {
            if (day.classList.contains('selected')) selected++;
            days++;
          }
        });
        return selected === days;
      }
      const week_number: number = Array.from(target.parentElement!.parentElement!.children).indexOf(target.parentElement!);
      if (target.classList.contains('selected')) {
        if (isFullWeekSelected(target.parentElement as HTMLElement)) {
          (this.DOMelement?.querySelector(`#zaznacz > abbr:nth-child(${week_number + 1}) > input`) as HTMLInputElement).checked = false;
        }
        if (target.classList.contains('disabled-for-person')) {
          this.selectedDisabled.splice(this.selectedDisabled.indexOf(`${this.date.getFullYear()}-${this.date.getMonth() + 1}-${parseInt(target.innerHTML)}`), 1);
        } else {
          this.selected.splice(this.selected.indexOf(`${this.date.getFullYear()}-${this.date.getMonth() + 1}-${parseInt(target.innerHTML)}`), 1);
          this.checkSelected()
        }
        target.classList.remove('selected');
      } else {
        target.classList.add('selected');
        if (target.classList.contains('disabled-for-person')) {
          this.selectedDisabled.push(`${this.date.getFullYear()}-${this.date.getMonth() + 1}-${parseInt(target.innerHTML)}`);
        } else {
          this.selected.push(`${this.date.getFullYear()}-${this.date.getMonth() + 1}-${parseInt(target.innerHTML)}`);
          this.checkSelected()
        }
        if (isFullWeekSelected(target.parentElement as HTMLElement)) {
          (this.DOMelement?.querySelector(`#zaznacz > abbr:nth-child(${week_number + 1}) > input`) as HTMLInputElement).checked = true;
        }
      }
      this.checkIfEmpty();
    }
    // dla wychowanków Internatu
    else if (this.typ === "Internat") {
      if (element.button == 2) {
        element.preventDefault()
        let target: HTMLElement = element.target as HTMLElement
        if (target.tagName === "BUTTON" && !(target as HTMLButtonElement).disabled && !target.classList.contains('empty')) {
          let parent: HTMLElement = target.parentElement as HTMLElement;
          let grandparent: HTMLElement = parent.parentElement as HTMLElement;
          let parent_index: number = Array.from(grandparent.children as unknown as NodeListOf<HTMLElement>).indexOf(parent);
          let target_index: number = Array.from(parent.children as unknown as NodeListOf<HTMLElement>).indexOf(target);
          const div: HTMLElement = this.DOMelement?.querySelector(`.week:nth-child(${parent_index + 1}) > .day:nth-child(${target_index + 1}) > div`) as HTMLElement;
          let all: number = 0;
          let checked: number = 0
          let unchecked: number = 0
          const typy = ['sniadanie', 'obiad', 'kolacja']
          const getInputElements = (parent: HTMLElement, check: boolean) => {
            // @ts-ignore
            Array.from(parent.children as unknown as NodeListOf<HTMLInputElement>).forEach((dziecko) => {
              dziecko.disabled ? dziecko.checked = false : dziecko.checked = check;
              let value = dziecko.value;
              if (!check) {
                    let meal = this.dodanie.find(meal => meal.id === value);
                    if (meal) {
                      // @ts-ignore
                      this.usuniecie.find(meal => meal.id === value)?.array.splice(this.usuniecie.find(meal => meal.id === value)?.array.indexOf(`${this.date.getFullYear()}-${this.date.getMonth() + 1}-${target.textContent}`), 1)
                      if (!(this.typy_posilkow_db.array_operacaja.find(meal => meal.id === value)?.array.includes(`${this.date.getFullYear()}-${this.date.getMonth() + 1}-${target.textContent}`)) && this.checkVersion(new Date(`${this.date.getFullYear()}-${this.date.getMonth() + 1}-${target.textContent}`).getDay(), typy.indexOf(value))) {
                        meal.array.push(`${this.date.getFullYear()}-${this.date.getMonth() + 1}-${target.textContent}`);
                      }
                    }
                    this.checkTypPosilkow();
                  } else {
                    let meal = this.dodanie.find(meal => meal.id === value);
                    if (meal) {
                      meal.array.splice(meal.array.indexOf(`${this.date.getFullYear()}-${this.date.getMonth() + 1}-${target.textContent}`), 1);
                      if ((this.typy_posilkow_db.array_operacaja.find(meal => meal.id === value)?.array.includes(`${this.date.getFullYear()}-${this.date.getMonth() + 1}-${target.textContent}`)) && this.checkVersion(new Date(`${this.date.getFullYear()}-${this.date.getMonth() + 1}-${target.textContent}`).getDay(), typy.indexOf(value)))
                        this.usuniecie.find(meal => meal.id === value)?.array.push(`${this.date.getFullYear()}-${this.date.getMonth() + 1}-${target.textContent}`);
                    }
                    this.checkTypPosilkow();
                  }
            })
          }
          Array.from(div.children as unknown as NodeListOf<HTMLInputElement>).forEach((dziecko) => {
            if (!dziecko.disabled) {
              all++;
              dziecko.checked ? checked++ : unchecked++;
            }
          })
          if (checked === all) {
            getInputElements(div, false);
          } else if (unchecked === all) {
            getInputElements(div, true);
          } else if (checked < unchecked) {
            getInputElements(div, false);
          } else if (checked > unchecked) {
            getInputElements(div, true);
          }
        }
      } else {
        let target = element.target as HTMLElement;
        let grandparent = (target.parentElement as HTMLElement).parentElement as HTMLElement;
        if (target.tagName === "INPUT" && !(grandparent as HTMLButtonElement).disabled) {
          console.log((target as HTMLInputElement).checked);
          let value = (target as HTMLInputElement).value;
          console.log("Target?: ", target, value, grandparent.textContent)
          const typy = ['sniadanie', 'obiad', 'kolacja']
          if (!(target as HTMLInputElement).checked) {
            let meal = this.dodanie.find(meal => meal.id === value);
            console.log(meal)
            if (meal) {
              // @ts-ignore
              this.usuniecie.find(meal => meal.id === value)?.array.splice(this.usuniecie.find(meal => meal.id === value)?.array.indexOf(`${this.date.getFullYear()}-${this.date.getMonth() + 1}-${target.textContent}`), 1)
              if (!(this.typy_posilkow_db.array_operacaja.find(meal => meal.id === value)?.array.includes(`${this.date.getFullYear()}-${this.date.getMonth() + 1}-${grandparent.textContent}`)) && this.checkVersion(new Date(`${this.date.getFullYear()}-${this.date.getMonth() + 1}-${grandparent.textContent}`).getDay(), typy.indexOf(value))) {
                console.log("DobraSS")
                meal.array.push(`${this.date.getFullYear()}-${this.date.getMonth() + 1}-${grandparent.textContent}`);
              }
            }
            this.checkTypPosilkow();
          } else {
            let meal = this.dodanie.find(meal => meal.id === value);
            if (meal) {
              meal.array.splice(meal.array.indexOf(`${this.date.getFullYear()}-${this.date.getMonth() + 1}-${grandparent.textContent}`), 1);
              if ((this.typy_posilkow_db.array_operacaja.find(meal => meal.id === value)?.array.includes(`${this.date.getFullYear()}-${this.date.getMonth() + 1}-${grandparent.textContent}`)) && this.checkVersion(new Date(`${this.date.getFullYear()}-${this.date.getMonth() + 1}-${grandparent.textContent}`).getDay(), typy.indexOf(value)))
                this.usuniecie.find(meal => meal.id === value)?.array.push(`${this.date.getFullYear()}-${this.date.getMonth() + 1}-${grandparent.textContent}`);
            }
            this.checkTypPosilkow();
          }
        }
      }
    }
  }
  select_row(element : MouseEvent)
      {
        if (this.typ === "ZSTI") {
          let target = element.target as HTMLElement;
          if (target.tagName === 'INPUT') {
            const week = this.DOMelement?.getElementsByClassName('week')[Array.from(this.DOMelement.querySelectorAll('.zaznacz')).indexOf(target)]!;
            if ((target as HTMLInputElement).checked) {
              for (let i = 0; i < week.children.length; i++) {
                if (!week.children[i].classList.contains('empty') && !(week.children[i] as HTMLInputElement).disabled && !week.children[i].classList.contains('disabled-for-person')) {
                  week.children[i].classList.add('selected');
                  if (!this.selected.includes(`${this.date.getFullYear()}-${this.date.getMonth() + 1}-${parseInt(week.children[i].innerHTML)}`)) {
                    this.selected.push(`${this.date.getFullYear()}-${this.date.getMonth() + 1}-${parseInt(week.children[i].innerHTML)}`);
                    this.checkSelected();
                  }
                }
              }
            } else {
              for (let i = 0; i < week.children.length; i++) {
                if (!week.children[i].classList.contains('empty') && !(week.children[i] as HTMLInputElement).disabled && !week.children[i].classList.contains('disabled-for-person')) {
                  week.children[i].classList.remove('selected');
                  this.selected.splice(this.selected.indexOf(`${this.date.getFullYear()}-${this.date.getMonth() + 1}-${parseInt(week.children[i].innerHTML)}`), 1);
                  this.checkSelected();
                }
              }
            }
          }
          console.log(this.selected);
          this.checkIfEmpty();
        } else if (this.typ === "Internat") {
          let target = element.target as HTMLElement;
          if (target.tagName === 'INPUT') {
            let parent = target.parentElement as HTMLElement;
            let grandparent = parent.parentElement as HTMLElement;
            this.numer_week = Array.from(grandparent.children as unknown as NodeListOf<HTMLElement>).indexOf(parent);
            (this.DOMelement?.querySelector('#zmiana_posilku') as HTMLElement).style.display = 'flex';
          }
        }
      }
  // close change meal
  close() {
    (this.DOMelement?.querySelector('#zmiana_posilku') as HTMLElement).style.display = 'none';
  }

  formatDate(dateStr: string): string {
    const [year, month, day] = dateStr.split('-');
    const formattedMonth = month.padStart(2, '0');
    const formattedDay = day.padStart(2, '0');

    return `${year}-${formattedMonth}-${formattedDay}`;
  }


  // zmien
  zmien_posilek($event: MouseEvent) {
    (this.DOMelement?.querySelector('#zmiana_posilku') as HTMLElement).style.display = 'none';
    const grandparent = ($event.target as HTMLElement).parentElement!.parentElement as HTMLElement;
    let typ = grandparent.querySelectorAll('form')[0] as HTMLElement;
    const formularz = this.DOMelement?.querySelector(`form[name="yah"]`) as HTMLFormElement;
    const wszystko : boolean = (this.DOMelement?.querySelector('input[value="wszystko"]') as HTMLInputElement).checked;
    const checkbox_function = (switch_value: string, checkyMeal: any) => {
      let meal = this.dodanie.find(meal => meal.id === checkyMeal.value)!;
      const typy = ['sniadanie','obiad','kolacja']
      switch(switch_value) {
        case 'być':
          checkyMeal.checked = true;
          if(meal) {
            meal.array.splice(meal.array.indexOf(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${checkyMeal.parentElement.parentElement.textContent}`), 1);
            if((this.typy_posilkow_db.array_operacaja.find(meal => meal.id === checkyMeal.value)?.array.includes(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${checkyMeal.parentElement.parentElement.textContent}`)) && this.checkVersion(new Date(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${checkyMeal.parentElement.parentElement.textContent}`).getDay(),typy.indexOf(checkyMeal.value)))
              this.usuniecie.find(meal => meal.id === checkyMeal.value)?.array.push(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${checkyMeal.parentElement.parentElement.textContent}`);
          }
          this.checkTypPosilkow();
          break;
        case 'nie_być':
          checkyMeal.checked = false;
          if(meal) {
            // @ts-ignore
            this.usuniecie.find(meal => meal.id === checkyMeal.value)?.array.splice(this.usuniecie.find(meal => meal.id === checkyMeal.value)?.array.indexOf(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${checkyMeal.parentElement.parentElement.textContent}`),1)
            if(!(this.typy_posilkow_db.array_operacaja.find(meal => meal.id === checkyMeal.value)?.array.includes(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${checkyMeal.parentElement.parentElement.textContent}`))  && this.checkVersion(new Date(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${checkyMeal.parentElement.parentElement.textContent}`).getDay(),typy.indexOf(checkyMeal.value))) {
              meal.array.push(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${checkyMeal.parentElement.parentElement.textContent}`);
            }
          }
          this.checkTypPosilkow()
          break;
        default:
          console.error('Nieznana wartość');
          break;
      }
    }
    Array.from(typ.querySelectorAll('input:checked') as NodeListOf<HTMLInputElement>).forEach((dziecko:any) => {
      let week = this.DOMelement?.getElementsByClassName('week')[this.numer_week]!;
      Array.from(week.querySelectorAll('.day:not(.empty) div') as NodeListOf<HTMLElement>).forEach((div:any) => {
        // @ts-ignore
        let nieobecnosc = formularz.elements['na']
        const checkboxes : NodeListOf<HTMLInputElement> = div.querySelectorAll('input');
        checkboxes.forEach((checkbox : HTMLInputElement) => {
          if(wszystko) {
            if (!checkbox.disabled && (checkbox.value === dziecko.value) || dziecko.value === 'wszystko') {
              checkbox_function(nieobecnosc.value, checkbox);
            }
          }
          else {
            if(!checkbox.disabled && !div.parentElement!.classList.contains('disabled-for-person') && (checkbox.value === dziecko.value || dziecko.value === 'wszystko')) {
              checkbox_function(nieobecnosc.value, checkbox);
            }
          }
        })
      });
    });
  }
}
