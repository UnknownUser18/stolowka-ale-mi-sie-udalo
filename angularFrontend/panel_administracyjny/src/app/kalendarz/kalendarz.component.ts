import {Component, ElementRef, Input, OnChanges, OnInit, Renderer2, SimpleChanges} from '@angular/core';
import {NgForOf, NgIf, NgOptimizedImage} from '@angular/common';
import {FormsModule} from "@angular/forms";
import {DataBaseService} from '../data-base.service';

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
  CurrentStudentDeclaration: any;
  StudentZstiDays: any;
  dbCopyZstiDays: any[] = [];
  StudentInternatDays: any;
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
    {id: 'sniadanie', array: []},
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
    this.StudentInternatDays = this.dataService.StudentInternatDays.asObservable()
    this.StudentZstiDays = this.dataService.StudentZstiDays.asObservable()
    this.CurrentStudentDeclaration = this.dataService.CurrentStudentDeclaration.asObservable()
    this.dataService.CurrentStudentDeclaration.asObservable().subscribe((change) => this.changeDeclaration(change))
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
      this.dataService.CurrentZstiDays.value.forEach((element:any) => {
        let data : Date = new Date(element.dzien_wypisania)
        let value = data.getFullYear() + "-" + (data.getMonth() + 1) + "-" + data.getDate()
        this.selected.push(value);
        this.dbCopyZstiDays.push(value)
      })
      console.log("Nowe selected: ", this.selected)
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

  checkSelected()
  {
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
  ngOnChanges(changes: SimpleChanges) {
    if (changes['typ'] || changes['name']) {
      this.selected = [];
      this.diff_selected_zsti = [];
      this.diff_undo_selected_zsti = [];
      this.usuniecie.forEach((element) => {
        element.array = []
      });
      this.dodanie.forEach((element) => {
        element.array = []
      });
      this.dataService.getDisabledDays();
      this.show_calendar();
    }
  }

  week_number(): number[] {
    const weeks: number[] = [];
    const year = this.date.getFullYear();

    for (let month = 0; month < 12; month++) {
      const firstDayOfMonth = new Date(year, month, 1);
      const tempDate = new Date(firstDayOfMonth.getTime());
      tempDate.setHours(0, 0, 0, 0);
      tempDate.setDate(tempDate.getDate() + 3 - (tempDate.getDay() + 6) % 7);
      const week1 = new Date(tempDate.getFullYear(), 0, 4);
      const weekNumber = 1 + Math.round(((tempDate.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
      weeks.push(weekNumber);
    }
    return weeks;
  }
  changeDeclaration(change:any)
  {
    console.log("Neew declaration: ", change)
    this.CurrentStudentDeclaration = change
    if(this.DOMelement !== undefined) this.show_calendar()
  }
  sendDays()
  {
    if(this.dataService.StudentType.value === "ZSTI")
    {
      this.selected.forEach((element)=>{
        if(!this.dbCopyZstiDays.includes(element))
        {
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
        if(!this.selected.includes(element))
        {
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
  ngOnInit() {
    this.week_number();
    this.show_calendar()
    this.dataService.CurrentStudentDeclaration.asObservable().subscribe((change) => this.changeDeclaration(change))
    this.diff_selected_zsti = this.selected.filter((element) => !this.dbCopyZstiDays.includes(element));
    this.diff_undo_selected_zsti = this.dbCopyZstiDays.filter((element) => !this.selected.includes(element));
    this.dodanie.forEach((element) => {
      element.array = []
    });
    this.usuniecie.forEach((element) => {
      element.array = []
    });
  }
  //@ts-ignore
isWeekend = (date: Date, button: HTMLButtonElement, typ: string): boolean | undefined => {

    let dayOfTheWeek = date.getDay();
    if(dayOfTheWeek === 0)
      dayOfTheWeek = 7
    dayOfTheWeek--
    if(typ === 'ZSTI')
    {
      if( dayOfTheWeek === 5 || dayOfTheWeek === 6)
      {
        (button as HTMLButtonElement).disabled = true;
        return true;
      }
      if(!(this.dataService.CurrentStudentDeclaration.value))
      {
        if(dayOfTheWeek === 5 || dayOfTheWeek === 6) {
          button.disabled = true;
        }
        else {
          button.disabled = true;
          button.classList.add('disabled-for-person')
        }
        return true;
      }
      if (this.toBinary(this.dataService.CurrentStudentDeclaration.value.dni,5)[dayOfTheWeek] === '0')
      {
        button.disabled = true;
        button.classList.add('disabled-for-person')
        return true;
      }
      return false;
    }
    else if (typ === 'Internat')
    {
      if(dayOfTheWeek === 5 || dayOfTheWeek === 6)
      {
        button.disabled = true;
        return true;
      }
      return false;
    }
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
  checkVersion(dayOfTheWeek:number, mealId:number)
  {
    this.dni = [];
    this.dni.push(this.toBinary(this.CurrentStudentDeclaration.poniedzialek.data[0], 3));
    this.dni.push(this.toBinary(this.CurrentStudentDeclaration.wtorek.data[0], 3))
    this.dni.push(this.toBinary(this.CurrentStudentDeclaration.sroda.data[0], 3))
    this.dni.push(this.toBinary(this.CurrentStudentDeclaration.czwartek.data[0], 3))
    this.dni.push(this.toBinary(this.CurrentStudentDeclaration.piatek.data[0], 3))
    if(dayOfTheWeek === 0)
      dayOfTheWeek = 7
    dayOfTheWeek--
    return this.dni[dayOfTheWeek][mealId] === '1';
  }
  checkDayInternat(year:any, month:any, day:any, posilek:any, first_day_week:any, i:any, typy:any):boolean
  {
    let date = new Date(year, month-1, day);
    if(date.getDay() === 0 || date.getDay() === 6)
      return false;
    let result:boolean = false;

    if(this.checkVersion(date.getDay(), typy.indexOf(posilek)) || this.dodanie.find(meal => meal.id === posilek)?.array.includes(`${year}-${month+1}-${i - first_day_week + 1}`) || this.typy_posilkow_db.array_operacaja.find(meal => meal.id === posilek)!.array.includes(`${year}-${month+1}-${i - first_day_week + 1}`))
      result = true;
    return result;
  }


  show_calendar() {
    const calendar_content: HTMLElement = this.DOMelement.querySelector('#kalendarz');
    if(calendar_content !== undefined) calendar_content.innerHTML = '';
    let year = this.date.getFullYear();
    let month = this.date.getMonth();
    let month_days = new Date(year, month + 1, 0).getDate();
    let first_day_week = new Date(year, month, 1).getDay();

    this.currentDate = this.months[month] + ' ' + year;
    let weekcount = 0;
    const weekDiv = this.renderer.createElement('div');
    this.renderer.addClass(weekDiv, 'week');
    if(calendar_content !== undefined) this.renderer.appendChild(calendar_content, weekDiv);


    for (let i = -7; i <= (month_days + first_day_week - 1); i++) {
      let week = this.DOMelement.getElementsByClassName('week')[weekcount];
      if (i < first_day_week) {
        const dayDiv = this.renderer.createElement('div');
        this.renderer.addClass(dayDiv, 'day');
        this.renderer.addClass(dayDiv, 'empty');
        if(dayDiv !== undefined && week !== undefined) this.renderer.appendChild(week, dayDiv);
      } else {
        const dayButton = this.renderer.createElement('button');
        this.renderer.addClass(dayButton, 'day');
        this.renderer.setProperty(dayButton, 'innerHTML', (i - first_day_week + 1).toString());
        this.selected.includes(`${year}-${month+1}-${i - first_day_week + 1}`) || this.selectedDisabled.includes(`${year}-${month+1}-${i - first_day_week + 1}`) ? this.renderer.addClass(dayButton, 'selected') : null;
        if(this.typ !== 'Internat')
        {
          this.isWeekend(new Date(this.formatDate(`${year}-${month+1}-${i - first_day_week + 1}`)), dayButton, this.typ!);
          if(this.DisabledDays) {
            if(this.DisabledDays.includes(`${year}-${month + 1}-${i - first_day_week + 1}`)) {
              dayButton.classList.add('disabled-day-global')
              dayButton.setAttribute('disabled', 'true');
            }
          }
        }
        if(this.typ === 'Internat') {
          const typy = ['sniadanie','obiad','kolacja']
          const checkboxes = this.renderer.createElement('div');
          typy.forEach((element) => {
            const checkbox = this.renderer.createElement('input');
            this.renderer.setAttribute(checkbox, 'type', 'checkbox');
            this.renderer.setAttribute(checkbox, 'value', element);

            !this.isWeekend(new Date(this.formatDate(`${year}-${month + 1}-${i - first_day_week + 1}`)), dayButton, this.typ!) && this.checkDayInternat(year, month+1, i - first_day_week + 1, element, first_day_week, i, typy) ? checkbox.checked = true : checkbox.disabled = true;
            if(this.typy_posilkow_db.array_operacaja.find(elem=>elem.id === element)!.array.includes(`${year}-${month+1}-${i - first_day_week + 1}`))
              checkbox.checked = false;
            dayButton.disabled ? checkbox.disabled = true : null;
            if(this.DisabledDays.includes(`${year}-${month + 1}-${i - first_day_week + 1}`))
            {
              dayButton.classList.add('disabled-day-global')
              checkbox.checked = false
            }
            this.renderer.appendChild(checkboxes,checkbox);
          })
          if(!this.isWeekend(new Date(this.formatDate(`${year}-${month + 1}-${i - first_day_week + 1}`)), dayButton, this.typ!) && !this.DisabledDays.includes(`${year}-${month + 1}-${i - first_day_week + 1}`))
            this.renderer.appendChild(dayButton, checkboxes);
          this.renderer.addClass(dayButton,'internat');
        }
        if(week !== undefined) this.renderer.appendChild(week, dayButton);
      }
      if (i % 7 === 0) {
        weekcount++;
        // create week div
        const weekDiv = this.renderer.createElement('div');
        this.renderer.addClass(weekDiv, 'week');
        if(calendar_content !== undefined) this.renderer.appendChild(calendar_content, weekDiv);
      }
    }
    const dni = this.DOMelement.querySelector('#dni');
    if(dni !== undefined) dni.innerHTML = '';
    for (let i = 0; i < 7; i++) {
      const daySpan = this.renderer.createElement('span');
      this.renderer.setProperty(daySpan, 'innerHTML', ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nie'][i]);
      if(dni !== undefined) this.renderer.appendChild(dni, daySpan);
    }
    Array.from(this.DOMelement.querySelectorAll('.week') as NodeListOf<HTMLElement>).forEach((week: HTMLElement) => {
      if (week.children.length < 7) {
        for (let i = week.children.length; i < 7; i++) {
          const dayDiv = this.renderer.createElement('div');
          this.renderer.addClass(dayDiv, 'day');
          this.renderer.addClass(dayDiv, 'empty');
          this.renderer.appendChild(week, dayDiv);
        }
      }
    });

    Array.from(this.DOMelement.querySelectorAll('.week') as NodeListOf<HTMLElement>).forEach((week : HTMLElement) => {
      // @ts-ignore
      const isEmpty = Array.from(week.children).every((day: HTMLElement) => day.classList.contains('empty'));
      if (isEmpty) week.remove();
    });
    let week = this.week_number()[month];
    const zaznacz: HTMLElement = this.DOMelement.querySelector('#zaznacz');
    if(zaznacz !== undefined) zaznacz.innerHTML = '';
    let week_length = this.DOMelement.getElementsByClassName('week').length;
    for (let i = 0; i < week_length; i++) {
      let selected_days = 0;
      let days = 0;
      Array.from(this.DOMelement.getElementsByClassName('week')[i].children as NodeListOf<HTMLElement>).forEach((day: HTMLElement) => {
        if(!day.classList.contains('empty')) {
          if(day.classList.contains('selected')) selected_days++;
          days++;
        }
      });
      let zaznacz_ = this.renderer.createElement('div');
      let number = week + i;
      if(number > 52) number = 1;
      this.renderer.setProperty(zaznacz_, 'innerHTML', `${number}`);
      let zaznaczAbbr = this.renderer.createElement('abbr');
      let zaznaczElement = this.renderer.createElement('input');
      let zaznaczSpan = this.renderer.createElement('span');
      // dla wychowanków Internatu
      if(this.typ === 'Internat') {
        this.renderer.addClass(zaznaczSpan, 'zaznacz_internat');
        this.renderer.setProperty(zaznaczAbbr, 'title', 'Kliknij lewym przyciskiem myszy aby zmienić posiłek dla całego tygodnia');
      }
      else {
        this.renderer.setProperty(zaznaczAbbr, 'title', 'Kliknij lewy przycisk myszy aby zaznaczyć cały tydzień');
      }
      this.renderer.addClass(zaznaczElement, 'zaznacz');
      this.renderer.setAttribute(zaznaczElement, 'type', 'checkbox');
      // check if the entire array is selected
      if(selected_days === days && this.typ === 'ZSTI') {
        this.renderer.setAttribute(zaznaczElement, 'checked', 'true');
      }
      this.renderer.appendChild(zaznaczAbbr, zaznacz_);
      this.renderer.appendChild(zaznaczAbbr, zaznaczElement);
      this.renderer.appendChild(zaznaczAbbr, zaznaczSpan);

      this.renderer.appendChild(zaznacz, zaznaczAbbr);
    }
  }

  change_month(number: number) {
    if(number === 0) {
      this.date = new Date();
      this.show_calendar();
      return;
    }
    this.date = new Date(this.date.getFullYear(), this.date.getMonth() + number, 1);
    this.month_next = this.months[new Date(this.date.getFullYear(), this.date.getMonth() + 1, 1).getMonth()] + " " + new Date(this.date.getFullYear(), this.date.getMonth() + 1, 1).getFullYear()
    this.month_before = this.months[new Date(this.date.getFullYear(), this.date.getMonth() - 1, 1).getMonth()] + " " + new Date(this.date.getFullYear(), this.date.getMonth() - 1, 1).getFullYear()
    this.show_calendar();
  }
  select(element: MouseEvent) {
    // dla uczniow zsti
    if(this.typ === "ZSTI") {
      let target = element.target as HTMLElement;
      if (target.classList.contains('day')) {
        if (target.tagName === 'BUTTON' && !(target as HTMLButtonElement).classList.contains('weekend')) {
          function isFullWeekSelected(week : HTMLElement) {
            let selected = 0;
            let days = 0;
            Array.from(week.children as unknown as NodeListOf<HTMLElement>).forEach((day: HTMLElement) => {
              if(!day.classList.contains('empty') && !(day as HTMLButtonElement).disabled) {
                if(day.classList.contains('selected')) selected++;
                days++;
              }
            });
            return selected === days;
          }
          const week_number = Array.from((target.parentElement!).parentElement!.children as unknown as NodeListOf<HTMLElement>).indexOf(target.parentElement as HTMLElement);
          if (target.classList.contains('selected')) {
            if(isFullWeekSelected(target.parentElement as HTMLElement)) {
              console.log('full week selected check = false');
              this.DOMelement.querySelector(`#zaznacz > abbr:nth-child(${week_number + 1}) > input`).checked = false;
            }
            if(target.classList.contains('disabled-for-person')) {
              this.selectedDisabled.splice(this.selectedDisabled.indexOf(`${this.date.getFullYear()}-${this.date.getMonth() + 1}-${parseInt(target.innerHTML)}`), 1);
              console.log("Disabled classlist: ", this.selectedDisabled);
            }
            else {
              this.selected.splice(this.selected.indexOf(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${parseInt(target.innerHTML)}`), 1);
              console.log(" selected: ", this.selected);
              this.checkSelected()
            }
            target.classList.remove('selected');
          } else {
            target.classList.add('selected');
            if(target.classList.contains('disabled-for-person')) {
              this.selectedDisabled.push(`${this.date.getFullYear()}-${this.date.getMonth() + 1}-${parseInt(target.innerHTML)}`);
              console.log("Disabled classlist: ", this.selectedDisabled);
            }
            else {
              this.selected.push(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${parseInt(target.innerHTML)}`);
              console.log(" selected: ", this.selected);
              this.checkSelected()
            }
            console.log("Disabled selected: ", this.selectedDisabled);
            if(isFullWeekSelected(target.parentElement as HTMLElement)) {
              console.log('full week selected check = true');
              this.DOMelement.querySelector(`#zaznacz > abbr:nth-child(${week_number + 1}) > input`).checked = true;
            }
          }
        }
      }
      this.diff_selected_zsti = this.selected.filter((element) => !this.dbCopyZstiDays.includes(element));
      this.diff_undo_selected_zsti = this.dbCopyZstiDays.filter((element) => !this.selected.includes(element));
    }
    // dla wychowanków Internatu
    else if(this.typ === "Internat") {
      if(element.button == 2) {
        element.preventDefault()
        let target : HTMLElement = element.target as HTMLElement
        if(target.tagName === "BUTTON" && !(target as HTMLButtonElement).disabled && !target.classList.contains('empty')) {
          let parent : HTMLElement = target.parentElement as HTMLElement;
          let grandparent : HTMLElement = parent.parentElement as HTMLElement;
          let parent_index : number = Array.from(grandparent.children as unknown as NodeListOf<HTMLElement>).indexOf(parent);
          let target_index : number = Array.from(parent.children as unknown as NodeListOf<HTMLElement>).indexOf(target);
          const div : HTMLElement = this.DOMelement.querySelector(`.week:nth-child(${parent_index+1}) > .day:nth-child(${target_index+1}) > div`);
          let all : number = 0;
          let checked : number = 0
          let unchecked : number = 0
          const typy = ['sniadanie','obiad','kolacja']
          const getInputElements = (parent: HTMLElement, check: boolean) => {
            // @ts-ignore
            Array.from(parent.children as unknown as NodeListOf<HTMLInputElement>).forEach((dziecko) => {
              dziecko.disabled ? dziecko.checked = false : dziecko.checked = check;
              let value = dziecko.value;
              if(!check) {
                let meal = this.dodanie.find(meal => meal.id === value);
                if(meal) {
                  // @ts-ignore
                  this.usuniecie.find(meal => meal.id === value)?.array.splice(this.usuniecie.find(meal => meal.id === value)?.array.indexOf(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${target.textContent}`),1)
                  if(!(this.typy_posilkow_db.array_operacaja.find(meal => meal.id === value)?.array.includes(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${target.textContent}`))  && this.checkVersion(new Date(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${target.textContent}`).getDay(),typy.indexOf(value))) {
                    meal.array.push(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${target.textContent}`);
                  }
                }
                this.checkTypPosilkow();
              }
              else {
                let meal = this.dodanie.find(meal => meal.id === value);
                if(meal) {
                  meal.array.splice(meal.array.indexOf(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${target.textContent}`), 1);
                  if((this.typy_posilkow_db.array_operacaja.find(meal => meal.id === value)?.array.includes(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${target.textContent}`)) && this.checkVersion(new Date(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${target.textContent}`).getDay(),typy.indexOf(value)))
                    this.usuniecie.find(meal => meal.id === value)?.array.push(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${target.textContent}`);
                }
                this.checkTypPosilkow();
              }
            })
          }
          Array.from(div.children as unknown as NodeListOf<HTMLInputElement>).forEach((dziecko) => {
            if(!dziecko.disabled) {
              all++;
              dziecko.checked ? checked++ : unchecked++;
            }
          })
          if(checked === all) {
            getInputElements(div, false);
          }
          else if(unchecked === all) {
            getInputElements(div, true);
          }
          else if(checked < unchecked) {
            getInputElements(div, false);
          }
          else if(checked > unchecked) {
            getInputElements(div, true);
          }
        }
      }
      else {
        let target = element.target as HTMLElement;
        let grandparent = (target.parentElement as HTMLElement).parentElement as HTMLElement;
        if(target.tagName === "INPUT" && !(grandparent as HTMLButtonElement).disabled) {
          console.log((target as HTMLInputElement).checked);
          let value = (target as HTMLInputElement).value;
          console.log("Target?: ", target)
          const typy = ['sniadanie','obiad','kolacja']
          if(!(target as HTMLInputElement).checked) {
            let meal = this.dodanie.find(meal => meal.id === value);
            if(meal) {
              // @ts-ignore
              this.usuniecie.find(meal => meal.id === value)?.array.splice(this.usuniecie.find(meal => meal.id === value)?.array.indexOf(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${target.textContent}`),1)
              if(!(this.typy_posilkow_db.array_operacaja.find(meal => meal.id === value)?.array.includes(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${grandparent.textContent}`)) && this.checkVersion(new Date(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${grandparent.textContent}`).getDay(),typy.indexOf(value))) {
                meal.array.push(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${grandparent.textContent}`);
              }
            }
            this.checkTypPosilkow();
          }
          else {
            let meal = this.dodanie.find(meal => meal.id === value);
            if(meal) {
              meal.array.splice(meal.array.indexOf(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${grandparent.textContent}`), 1);
              if((this.typy_posilkow_db.array_operacaja.find(meal => meal.id === value)?.array.includes(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${grandparent.textContent}`)) && this.checkVersion(new Date(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${grandparent.textContent}`).getDay(),typy.indexOf(value)))
                this.usuniecie.find(meal => meal.id === value)?.array.push(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${grandparent.textContent}`);
            }
            this.checkTypPosilkow();
          }
        }
      }
    }
  }
  select_row(element : MouseEvent) {
    if(this.typ === "ZSTI") {
      let target = element.target as HTMLElement;
      if(target.tagName === 'INPUT') {
        const week = this.DOMelement.getElementsByClassName('week')[Array.from(this.DOMelement.querySelectorAll('.zaznacz')).indexOf(target)];
        if((target as HTMLInputElement).checked) {
          for(let i = 0; i < week.children.length; i++) {
            if(!week.children[i].classList.contains('empty') && !week.children[i].disabled && !week.children[i].classList.contains('disabled-for-person')) {
              week.children[i].classList.add('selected');
              if(!this.selected.includes(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${parseInt(week.children[i].innerHTML)}`)) {
                this.selected.push(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${parseInt(week.children[i].innerHTML)}`);
                this.checkSelected();
              }
            }
          }
        }
        else {
          for(let i = 0; i < week.children.length; i++) {
            if(!week.children[i].classList.contains('empty') && !week.children[i].disabled && !week.children[i].classList.contains('disabled-for-person')) {
              week.children[i].classList.remove('selected');
              this.selected.splice(this.selected.indexOf(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${parseInt(week.children[i].innerHTML)}`), 1);
              this.checkSelected();
            }
          }
        }
        console.log(this.selected);
      }
    }
    else if(this.typ === "Internat") {
      let target = element.target as HTMLElement;
      if(target.tagName === 'INPUT') {
        let parent = target.parentElement as HTMLElement;
        let grandparent = parent.parentElement as HTMLElement;
        this.numer_week = Array.from(grandparent.children as unknown as NodeListOf<HTMLElement>).indexOf(parent);
        this.DOMelement.querySelector('#zmiana_posilku').style.display = 'flex';
      }
    }
  }
  // close change meal
  close() {
    this.DOMelement.querySelector('#zmiana_posilku').style.display = 'none';
  }

  formatDate(dateStr: string): string {
    const [year, month, day] = dateStr.split('-');
    const formattedMonth = month.padStart(2, '0');
    const formattedDay = day.padStart(2, '0');

    return `${year}-${formattedMonth}-${formattedDay}`;
  }


  // zmien
  zmien_posilek($event: MouseEvent) {
    this.DOMelement.querySelector('#zmiana_posilku').style.display = 'none';
    const grandparent = ($event.target as HTMLElement).parentElement!.parentElement as HTMLElement;
    let typ = grandparent.querySelectorAll('form')[0] as HTMLElement;
    const formularz = this.DOMelement.querySelector(`form[name="yah"]`) as HTMLFormElement;
    const wszystko : HTMLInputElement = this.DOMelement.querySelector('input[value="wszystko"]').checked;
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
      let week = this.DOMelement.getElementsByClassName('week')[this.numer_week];
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
