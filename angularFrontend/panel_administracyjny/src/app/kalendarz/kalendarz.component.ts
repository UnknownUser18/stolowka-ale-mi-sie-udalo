import {Component, ElementRef, Input, OnChanges, OnInit, Renderer2, SimpleChanges} from '@angular/core';
import {NgForOf, NgOptimizedImage} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {DataBaseService} from '../data-base.service';

@Component({
  selector: 'app-kalendarz',
  standalone: true,
  imports: [NgOptimizedImage, FormsModule, NgForOf],
  templateUrl: './kalendarz.component.html',
  styleUrl: './kalendarz.component.css'
})
export class KalendarzComponent implements OnChanges, OnInit{
  @Input() typ: string | undefined;
  @Input() name: string | undefined;
  currentDate: string | undefined;
  date: Date = new Date();
  CurrentStudentDeclaration: any;
  StudentZstiDays: any;
  dbCopyZstiDays: any[] = [];
  StudentInternatDays: any;
  dbCopyInternatDays: any;
  StudentDisabledZstiDays: any;
  dbCopyDisabledZstiDays: any[] = [];
  StudentDisabledInternatDays: any;
  dbCopyDisabledInternatDays: any;
  months : string[] = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
  month_before: string = this.months[new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).getMonth()] + " " + new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).getFullYear();
  month_next: string = this.months[new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).getMonth()] + " " + new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).getFullYear();
  selected: Array<string> = [];
  selectedDisabled: Array<string> = [];
  typy_posilkow_db: { operacja: string; array_operacaja: Array<{ id: string; array: Array<any> }> } =
    {
      operacja: 'zarejestrowane',
      array_operacaja: [
        {id: 'sniadanie', array: []},
        {id: 'obiad', array: []},
        {id: 'kolacja', array: []},
      ],
    }
  typy_posilkow: Array<{ operacja: string; array_operacaja: Array<{ id: string; array: Array<any> }> }> = [
    {
      operacja: 'dodanie',
      array_operacaja: [
        {id: 'sniadanie', array: []},
        {id: 'obiad', array: []},
        {id: 'kolacja', array: []},
      ],
    },
    {
      operacja: 'usuniecie',
      array_operacaja: [
        {id: 'sniadanie', array: []},
        {id: 'obiad', array: []},
        {id: 'kolacja', array: []},
      ],
    },
  ];
  numer_week: number = 0;

  constructor(private renderer: Renderer2, private el: ElementRef, private dataService: DataBaseService) {
    this.StudentInternatDays = this.dataService.StudentInternatDays.asObservable()
    this.StudentZstiDays = this.dataService.StudentZstiDays.asObservable()
    this.CurrentStudentDeclaration = this.dataService.CurrentStudentDeclaration.asObservable()
    this.dataService.CurrentStudentDeclaration.asObservable().subscribe((change) => this.changeDeclaration(change))
    this.dataService.CurrentZstiDays.asObservable().subscribe(() => this.changeZstiDays())
    this.dataService.CurrentInternatDays.asObservable().subscribe(() => this.changeInternatDays())
    this.dataService.CurrentDisabledZstiDays.asObservable().subscribe(() => this.changeDisabledZstiDays())

  };

  changeInternatDays()
  {
    this.typy_posilkow_db.array_operacaja.forEach((element)=>{
      element.array = []
    })
    if(!this.dataService.CurrentInternatDays.value)
    {
      this.show_calendar()
      return
    }
    this.dataService.CurrentInternatDays.value.forEach((element:any)=>{
      switch(element.posilki_id){
        case "śniadanie":
          this.typy_posilkow_db.array_operacaja[0].array.push(element.dzien_wypisania);
          break;
        case "obiad":
          this.typy_posilkow_db.array_operacaja[1].array.push(element.dzien_wypisania)
          break;
        case "kolacja":
          this.typy_posilkow_db.array_operacaja[2].array.push(element.dzien_wypisania)
          break;
      }
    })
    console.log("Zarejestrowane dni nieobecnosci: ", this.typy_posilkow_db)
  }


  changeZstiDays()
  {
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
  }

  changeDisabledZstiDays()
  {
    this.selectedDisabled = []
    this.dbCopyDisabledZstiDays = []
    if(!this.dataService.CurrentDisabledZstiDays.value)
    {
      this.show_calendar()
      return
    }
    this.dataService.CurrentDisabledZstiDays.value.forEach((element:any) => {
      let data:Date = new Date(element.dzien_wypisania)
      let value = data.getFullYear() + "-" + (data.getMonth() + 1) + "-" + data.getDate()
      this.selectedDisabled.push(value);
      this.dbCopyDisabledZstiDays.push(value)
    })
    console.log("Nowe selected disabled: ", this.selectedDisabled)
    this.show_calendar()
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['typ'] || changes['name']) {
      this.selected = [];
      this.typy_posilkow.forEach((element) => {
        element.array_operacaja.forEach((element_2) => {
          element_2.array = [];
        });
      });
      this.show_calendar();
    }
  }

  week_number(): number[] {
    const weeks: number[] = [];
    const year = this.date.getFullYear();

    for (let month = 0; month < 12; month++) {
      const firstDayOfMonth = new Date(year, month, 1);
      const weekNumber = this.getISOWeekNumber(firstDayOfMonth);
      weeks.push(weekNumber);
    }
    return weeks;
  }

  getISOWeekNumber(date: Date): number {
    const tempDate = new Date(date.getTime());
    tempDate.setHours(0, 0, 0, 0);
    tempDate.setDate(tempDate.getDate() + 3 - (tempDate.getDay() + 6) % 7);
    const week1 = new Date(tempDate.getFullYear(), 0, 4);
    return 1 + Math.round(((tempDate.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  }
  changeDeclaration(change:any)
  {
    this.CurrentStudentDeclaration = change
    this.show_calendar()
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
                schoolYearId: null
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
      console.log("Zsti Send")
      this.dataService.getStudentZstiDays()
      this.selectedDisabled.forEach((element)=>{
        if(!this.dbCopyDisabledZstiDays.includes(element))
        {
          this.dataService.send(
            JSON.stringify({
              action: "request",
              params: {
                method: "AddDisabledZstiDays",
                studentId: this.dataService.CurrentStudentId.value,
                date: element,
                schoolYearId: null
              }
            })
          )
          console.log("Dodaj element disabled: ", element)
        }
      })
      this.dbCopyDisabledZstiDays.forEach((element: any)=>{
        if(!this.selectedDisabled.includes(element))
        {
          this.dataService.send(
            JSON.stringify({
              action: "request",
              params: {
                method: "DeleteDisabledZstiDays",
                studentId: this.dataService.CurrentStudentId.value,
                date: element
              }
            })
          )
          console.log("Usun element: ", element,{
            action: "request",
            params: {
              method: "DeleteDisabledZstiDays",
              studentId: this.dataService.CurrentStudentId.value,
              date: element
            }
          })
        }
      })
      this.dataService.getStudentDisabledZstiDays();
    }
    else if(this.dataService.StudentType.value === "Internat")
    {
      console.log(this.typy_posilkow_db);
      console.log(this.typy_posilkow);
      console.log("Internat Send")
      this.dataService.getStudentInternatDays()
      this.dataService.getStudentDisabledInternatDays()
    }
  }
  ngOnInit() {
    this.week_number();
    this.show_calendar()
    console.log("czy zadzialalo")
    this.dataService.CurrentStudentDeclaration.asObservable().subscribe((change) => this.changeDeclaration(change))
  }
  repeatStr(data:string, iter:number)
  {
    let wynik = '';
    for(let i = 0 ; i < iter ; i++)
    {
      wynik += data
    }
    return wynik;
  }
  isWeekend = (date: Date, button : HTMLElement | null) =>{
    const day = date.getDay();
    if(!button)
      return false
    if((!this.dataService.CurrentStudentDeclaration.value))
    {
      if(day === 5 || day === 6) {
        (button as HTMLButtonElement).disabled = true;
      }
      else {
        button.classList.add('disabled-for-person')
      }
      return true;
    }
    if(day >=5)
    {
      (button as HTMLButtonElement).disabled = true;
      return
    }
    let eatenDays = this.dataService.CurrentStudentDeclaration.value.dni.data
    eatenDays = Number(eatenDays).toString(2)
    eatenDays = this.repeatStr('0' , (5-eatenDays.length)) + eatenDays
    if(eatenDays[day] === '0') {
      button.classList.add('disabled-for-person')
    }
    else if(day === 5 || day === 6) {
      (button as HTMLButtonElement).disabled = true;
    }
    // console.log("Eaten day: ", eatenDays[day] === '0' || day === 6 || day === 5);
    return eatenDays[day] === '0' || day === 6 || day === 5;
  }

  show_calendar() {
    const calendar_content: HTMLElement = this.el.nativeElement.querySelector('#kalendarz');
    calendar_content !== undefined ? calendar_content.innerHTML = '' : this.el.nativeElement.innerHTML = '';
    let year = this.date.getFullYear();
    let month = this.date.getMonth();
    let month_days = new Date(year, month + 1, 0).getDate();
    let first_day_week = new Date(year, month, 1).getDay();

    this.currentDate = this.months[month] + ' ' + year;
    let weekcount = 0;
    // create week div
    const weekDiv = this.renderer.createElement('div');
    this.renderer.addClass(weekDiv, 'week');
    calendar_content !== undefined ? this.renderer.appendChild(calendar_content, weekDiv) : null;

    for (let i = -7; i <= (month_days + first_day_week - 1); i++) {
      let week = this.el.nativeElement.getElementsByClassName('week')[weekcount];
      // create day button
      if (i < first_day_week) {
        const dayDiv = this.renderer.createElement('div');
        this.renderer.addClass(dayDiv, 'day');
        this.renderer.addClass(dayDiv, 'empty');
        week !== undefined ? this.renderer.appendChild(week, dayDiv) : null;
      } else {
        const dayButton = this.renderer.createElement('button');
        this.renderer.addClass(dayButton, 'day');
        this.renderer.setProperty(dayButton, 'innerHTML', (i - first_day_week + 1).toString());
        if (this.selected.includes(`${year}-${month+1}-${i - first_day_week + 1}`) || this.selectedDisabled.includes(`${year}-${month+1}-${i - first_day_week + 1}`)) {
          this.renderer.addClass(dayButton, 'selected');
        }
        this.isWeekend(new Date(year, month, i - first_day_week), dayButton);
        if(this.typ === 'Internat') {
          console.log('Internat');
          const typy = ['sniadanie','obiad','kolacja']
          const checkboxes = this.renderer.createElement('div');
          typy.forEach((element) => {
            const checkbox = this.renderer.createElement('input');
            this.renderer.setAttribute(checkbox, 'type', 'checkbox');
            this.renderer.setAttribute(checkbox, 'value', element);
            if(this.typy_posilkow.find(operacja => operacja.operacja === 'dodanie')?.array_operacaja.find(meal => meal.id === element)?.array.includes(`${year}-${month+1}-${i - first_day_week + 1}`)) {
              checkbox.checked = true;
            }
            dayButton.disabled ? checkbox.disabled = true : null;
            this.renderer.appendChild(checkboxes,checkbox);
          })
          this.renderer.appendChild(dayButton, checkboxes);
          this.renderer.addClass(dayButton,'internat');
        }
        week !== undefined ? this.renderer.appendChild(week, dayButton) : null;
      }
      if (i % 7 === 0) {
        weekcount++;
        // create week div
        const weekDiv = this.renderer.createElement('div');
        this.renderer.addClass(weekDiv, 'week');
        calendar_content !== undefined ? this.renderer.appendChild(calendar_content, weekDiv) : null;
      }
    }
    const dni = this.el.nativeElement.querySelector('#dni');
    dni !== undefined ? dni.innerHTML = '' : null;
    for (let i = 0; i < 7; i++) {
      const daySpan = this.renderer.createElement('span');
      this.renderer.setProperty(daySpan, 'innerHTML', ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nie'][i]);
      dni !== undefined ? this.renderer.appendChild(dni, daySpan) : null;
    }
    // checking for empty days
    Array.from(this.el.nativeElement.querySelectorAll('.week') as NodeListOf<HTMLElement>).forEach((week: HTMLElement) => {
      if (week.children.length < 7) {
        for (let i = week.children.length; i < 7; i++) {
          const dayDiv = this.renderer.createElement('div');
          this.renderer.addClass(dayDiv, 'day');
          this.renderer.addClass(dayDiv, 'empty');
          week ? this.renderer.appendChild(week, dayDiv) : null;
        }
      }
    });
    // check if the week element is empty
    Array.from(this.el.nativeElement.getElementsByClassName('week') as NodeListOf<HTMLElement>).forEach((week: HTMLElement) => {
      let empty = true;
      Array.from(week.children as unknown as NodeListOf<HTMLElement>).forEach((day: HTMLElement) => {
        if (!day.classList.contains('empty')) {
          empty = false;
        }
      });
      if (empty) {
        week.remove();
      }
    });
    let week = this.week_number()[month];
    // create zaznacz buttons
    const zaznacz: HTMLElement = this.el.nativeElement.querySelector('#zaznacz');
    zaznacz !== undefined ? zaznacz.innerHTML = '' : null;
    let week_length = this.el.nativeElement.getElementsByClassName('week').length;
    for (let i = 0; i < week_length; i++) {
      let selected_days = 0;
      let days = 0;
      Array.from(this.el.nativeElement.getElementsByClassName('week')[i].children as NodeListOf<HTMLElement>).forEach((day: HTMLElement) => {
        if(!day.classList.contains('empty')) {
          if(day.classList.contains('selected')) {
            selected_days++;
          }
          days++;
        }
      });
      let zaznacz_ = this.renderer.createElement('div');
      let number = week + i;
      if(number > 52) {
        number = 1;
      }
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
        this.renderer.setProperty(zaznaczAbbr, 'title', 'Kliknij lewy przycisk myszy aby zaznaczyć cały tydzień na który osoba ma posiłki\nLub prawym aby zaznaczyć cały tydzień');
      }
      this.renderer.addClass(zaznaczElement, 'zaznacz');
      this.renderer.setAttribute(zaznaczElement, 'type', 'checkbox');
      // check if the entire array is selected
      if(selected_days === days && this.typ === 'ZSTI') {
        console.log('selected');
        this.renderer.setAttribute(zaznaczElement, 'checked', 'true');
      }
      this.renderer.appendChild(zaznaczAbbr, zaznacz_);
      this.renderer.appendChild(zaznaczAbbr, zaznaczElement);
      this.renderer.appendChild(zaznaczAbbr, zaznaczSpan);

      this.renderer.appendChild(zaznacz, zaznaczAbbr);
    }
  }

  // show previous/next month
  change_month(number: number) {
    this.date = new Date(this.date.getFullYear(), this.date.getMonth() + number, 1);
    this.month_next = this.months[new Date(this.date.getFullYear(), this.date.getMonth() + 1, 1).getMonth()] + " " + new Date(this.date.getFullYear(), this.date.getMonth() + 1, 1).getFullYear()
    this.month_before = this.months[new Date(this.date.getFullYear(), this.date.getMonth() - 1, 1).getMonth()] + " " + new Date(this.date.getFullYear(), this.date.getMonth() - 1, 1).getFullYear()
    this.show_calendar();
  }
  default_date() {
    this.date = new Date();
    this.show_calendar();
  }
  // when on click add/remove to selected array
  select(element: MouseEvent) {
    // dla uczniow zsti
    if(this.typ === "ZSTI") {
      let target = element.target as HTMLElement;
    if (target.classList.contains('day')) {
      if (target.tagName === 'BUTTON' && !(target as HTMLButtonElement).classList.contains('weekend')) {
        console.log('button');
        function isFullWeekSelected(week : HTMLElement) {
          let selected = 0;
          let days = 0;
          Array.from(week.children as unknown as NodeListOf<HTMLElement>).forEach((day: HTMLElement) => {
            if(!day.classList.contains('empty') && !(day as HTMLButtonElement).disabled) {
              if(day.classList.contains('selected')) {
                selected++;
              }
              days++;
            }
          });
          return selected === days;
        }
        const week_number = Array.from((target.parentElement!).parentElement!.children as unknown as NodeListOf<HTMLElement>).indexOf(target.parentElement as HTMLElement);
        if (target.classList.contains('selected')) {
          if(isFullWeekSelected(target.parentElement as HTMLElement)) {
            console.log('full week selected check = false');
            const zaznacz = this.el.nativeElement.querySelector(`#zaznacz > abbr:nth-child(${week_number + 1}) > input`);
            (zaznacz as HTMLInputElement).checked = false;
          }
          if(target.classList.contains('disabled-for-person')) {
            this.selectedDisabled.splice(this.selectedDisabled.indexOf(`${this.date.getFullYear()}-${this.date.getMonth() + 1}-${parseInt(target.innerHTML)}`), 1);
            console.log("Disabled classlist: ", this.selectedDisabled);
          }
          else{
            this.selected.splice(this.selected.indexOf(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${parseInt(target.innerHTML)}`), 1);
            console.log(" selected: ", this.selected);
          }
          target.classList.remove('selected');
        } else {
          target.classList.add('selected');
          if(target.classList.contains('disabled-for-person')) {
            this.selectedDisabled.push(`${this.date.getFullYear()}-${this.date.getMonth() + 1}-${parseInt(target.innerHTML)}`);
            console.log("Disabled classlist: ", this.selectedDisabled);
          }
          else{

            this.selected.push(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${parseInt(target.innerHTML)}`);
            console.log(" selected: ", this.selected);
          }
          console.log("Disabled selected: ", this.selectedDisabled);
          if(isFullWeekSelected(target.parentElement as HTMLElement)) {
            console.log('full week selected check = true');
            const zaznacz = this.el.nativeElement.querySelector(`#zaznacz > abbr:nth-child(${week_number + 1}) > input`);
            (zaznacz as HTMLInputElement).checked = true;
          }
        }
      }
    }
    console.log(this.selected);
    }
    // dla wychowankow Internatu
    else if(this.typ === "Internat") {
      if(element.button == 2) {
        element.preventDefault()
        let target = element.target as HTMLElement
        if(target.tagName === "BUTTON" && !(target as HTMLButtonElement).disabled) {
          if(!target.classList.contains('empty')) {
            let parent = target.parentElement as HTMLElement;
            let grandparent = parent.parentElement as HTMLElement;
            let parent_index = Array.from(grandparent.children as unknown as NodeListOf<HTMLElement>).indexOf(parent);
            let target_index = Array.from(parent.children as unknown as NodeListOf<HTMLElement>).indexOf(target);
            const div = this.el.nativeElement.querySelector(`.week:nth-child(${parent_index+1}) > .day:nth-child(${target_index+1}) > div`);
            let checked = 0
            let unchecked = 0
            function getInputElements(parent : HTMLElement, check : boolean) {
              Array.from(parent.children as unknown as NodeListOf<HTMLElement>).forEach((dziecko) => {
                (dziecko as HTMLInputElement).checked = check;
              })
            }
            Array.from(div.children as unknown as NodeListOf<HTMLElement>).forEach((dziecko) => {
              (dziecko as HTMLInputElement).checked ? checked++ : unchecked++;
            })
            if(checked === 3) {
              getInputElements(div, false);
            }
            else if(unchecked === 3) {
              getInputElements(div, true);
            }
            else if(checked < unchecked) {
              getInputElements(div, false);
            }
            else if(checked > unchecked) {
              getInputElements(div, true);
            }
            console.log(this.typy_posilkow)
          }
        }
      }
      else {
        let target = element.target as HTMLElement;
        let grandparent = (target.parentElement as HTMLElement).parentElement as HTMLElement;
        if(target.tagName === "INPUT" && !(grandparent as HTMLButtonElement).disabled) {
          console.log((target as HTMLInputElement).checked);
          let value = (target as HTMLInputElement).value;
          if((target as HTMLInputElement).checked) {
            let meal = this.typy_posilkow.find(operacja => operacja.operacja === 'dodanie')?.array_operacaja.find(meal => meal.id === value);
            if(meal) {
              if(!(this.typy_posilkow_db.array_operacaja.find(meal => meal.id === value)?.array.includes(value))) {
                meal.array.push(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${grandparent.textContent}`);
              }
            }
          }
          else {
            let meal = this.typy_posilkow.find(operacja => operacja.operacja === 'dodanie')?.array_operacaja.find(meal => meal.id === value);
            if(meal) {
              meal.array.splice(meal.array.indexOf(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${grandparent.textContent}`), 1);
              if(!(this.typy_posilkow_db.array_operacaja.find(meal => meal.id === value)?.array.includes(value)))
                this.typy_posilkow.find(operacja => operacja.operacja === 'usuniecie')?.array_operacaja.find(meal => meal.id === value)?.array.push(`${this.date.getFullYear()}-${grandparent.textContent}`);
            }
          }
          console.log(this.typy_posilkow)
        }
      }
    }
  }
  select_row(element : MouseEvent) {
    if(this.typ === "ZSTI") {
      let right_click = element.button == 2;
      right_click ? element.preventDefault() : null;
      let target = element.target as HTMLElement;
      if(target.tagName === 'INPUT') {
        const week = this.el.nativeElement.getElementsByClassName('week')[Array.from(this.el.nativeElement.querySelectorAll('.zaznacz')).indexOf(target)];
        if (right_click) {
          (target as HTMLInputElement).checked = !(right_click && (target as HTMLInputElement).checked);
        }
        if((target as HTMLInputElement).checked) {
          const push = (day : HTMLElement) => {
            if(!this.selected.includes(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${parseInt(day.innerHTML)}`)) {
              this.selected.push(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${parseInt(day.innerHTML)}`);
            }
          }
          if(right_click) {
            for(let i = 0; i < week.children.length; i++) {
              if (!week.children[i].classList.contains('empty') && !week.children[i].disabled) {
                week.children[i].classList.add('selected');
                push(week.children[i]);
              }
            }
          }
          else {
            for(let i = 0; i < week.children.length; i++) {
              if(!week.children[i].classList.contains('empty') && !week.children[i].disabled && !week.children[i].classList.contains('disabled-for-person')) {
                week.children[i].classList.add('selected');
                push(week.children[i]);
              }
            }
          }
        }
        else {
          const remove = (day : HTMLElement) => {
            this.selected.splice(this.selected.indexOf(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${parseInt(day.innerHTML)}`), 1);
          }
          if(right_click) {
            for (let i = 0; i < week.children.length; i++) {
              if (!week.children[i].classList.contains('empty') && !week.children[i].disabled) {
                week.children[i].classList.remove('selected');
                remove(week.children[i]);
              }
            }
          }
          else {
            for(let i = 0; i < week.children.length; i++) {
              if(!week.children[i].classList.contains('empty') && !week.children[i].disabled && !week.children[i].classList.contains('disabled-for-person')) {
                week.children[i].classList.remove('selected');
                remove(week.children[i]);
              }
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
        this.el.nativeElement.querySelector('#zmiana_posilku').style.display = 'flex';
      }
    }
  }
  // close change meal
  close() {
    this.el.nativeElement.querySelector('#zmiana_posilku').style.display = 'none';
  }
  // zmien
  zmien_posilek($event: MouseEvent) {
    this.el.nativeElement.querySelector('#zmiana_posilku').style.display = 'none';
    const grandparent = ($event.target as HTMLElement).parentElement!.parentElement as HTMLElement;
    let typ = grandparent.querySelectorAll('form')[0] as HTMLElement;
    const nieobecnosc = this.el.nativeElement.querySelector(`input[name="na"]`) as HTMLInputElement;
    const wszystko : HTMLInputElement = this.el.nativeElement.querySelector('input[name="wszystko"]').checked;
    function checkbox_function(switch_value: string , meal: any) {
      switch(switch_value) {
        case 'być':
          meal.checked = true;
          break;
        case 'nie_być':
          meal.checked = false;
          break;
        default:
          console.error('Nieznana wartość');
          break;
      }
    }
    Array.from(typ.querySelectorAll('input:checked') as NodeListOf<HTMLInputElement>).forEach((dziecko:any) => {
      let week = this.el.nativeElement.getElementsByClassName('week')[this.numer_week];
      Array.from(week.querySelectorAll('.day:not(.empty) div') as NodeListOf<HTMLElement>).forEach((div:any) => {
        const checkboxes : NodeListOf<HTMLInputElement> = div.querySelectorAll('input');
        checkboxes.forEach((checkbox : HTMLInputElement) => {
          if(wszystko) {
            if (!checkbox.disabled && (checkbox.value === dziecko.value) || dziecko.value === 'wszystko') {
              checkbox_function(nieobecnosc.value, checkbox);
              console.log(this.typy_posilkow);
            }
          }
          else {
            if(!checkbox.disabled && !div.parentElement!.classList.contains('disabled-for-person') && (checkbox.value === dziecko.value || dziecko.value === 'wszystko')) {
              checkbox_function(nieobecnosc.value, checkbox);
              console.log(this.typy_posilkow);
            }
          }
        })
      });
    });
  }
}
