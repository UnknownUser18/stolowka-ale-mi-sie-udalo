import {Component, ElementRef, Input, Renderer2, SimpleChanges} from '@angular/core';
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
export class KalendarzComponent {
  @Input() typ: string | undefined;
  @Input() name: string | undefined;
  currentDate: string | undefined;
  date: Date = new Date();
  StudentZstiDays: any;
  StudentInternatDays: any;
  months: Array<string> = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
  month_before: string = this.months[new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).getMonth()] + " " + new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).getFullYear();
  month_next: string = this.months[new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).getMonth()] + " " + new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).getFullYear();
  selected: Array<string> = [];
  // typy_posilkow: Array<{id: string, array : Array<any>}> = [
  //   {id: 'sniadanie', array: []},
  //   {id: 'obiad', array: []},
  //   {id: 'kolacja', array: []}
  //   ];
  typy_posilkow: Array<{ operacja: string; array_operacaja: Array<{ id: string; array: Array<any> }> }> = [
    {
      operacja: 'dodanie',
      array_operacaja: [
        { id: 'sniadanie', array: [] },
        { id: 'obiad', array: [] },
        { id: 'kolacja', array: [] },
      ],
    },
    {
      operacja: 'usuniecie',
      array_operacaja: [
        { id: 'sniadanie', array: [] },
        { id: 'obiad', array: [] },
        { id: 'kolacja', array: [] },
      ],
    },
  ];
  numer_week : number = 0;
  constructor(private renderer: Renderer2, private el: ElementRef, private dataService:DataBaseService) {
    this.StudentInternatDays = this.dataService.StudentInternatDays.asObservable()
    this.StudentZstiDays = this.dataService.StudentZstiDays.asObservable()
  };
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
  ngOnInit() {
    this.week_number();
    this.show_calendar()
  }
  show_calendar() {
    const calendar_content: HTMLElement = this.el.nativeElement.querySelector('#kalendarz');
    calendar_content.innerHTML = '';
    let year = this.date.getFullYear();
    let month = this.date.getMonth();
    let month_days = new Date(year, month + 1, 0).getDate();
    let first_day_week = new Date(year, month, 1).getDay();

    this.currentDate = this.months[month] + ' ' + year;
    let weekcount = 0;
    // create week div
    const weekDiv = this.renderer.createElement('div');
    this.renderer.addClass(weekDiv, 'week');
    this.renderer.appendChild(calendar_content, weekDiv);
    function isWeekend(date: Date): boolean {
      const day = date.getDay();
      return day === 0 || day === 6;
    }
    let eatenDays:any;
    if(this.dataService.CurrentStudentDeclaration.value)
    {
      eatenDays = Number(this.dataService.CurrentStudentDeclaration.value.dni.data).toString(2);
    }
    for (let i = -7; i <= (month_days + first_day_week - 1); i++) {
      let week = this.el.nativeElement.getElementsByClassName('week')[weekcount];
      // create day button
      if (i < first_day_week) {
        const dayDiv = this.renderer.createElement('div');
        this.renderer.addClass(dayDiv, 'day');
        this.renderer.addClass(dayDiv, 'empty');
        this.renderer.appendChild(week, dayDiv);
      } else {
        const dayButton = this.renderer.createElement('button');
        this.renderer.addClass(dayButton, 'day');
        this.renderer.setProperty(dayButton, 'innerHTML', (i - first_day_week + 1).toString());
        if (this.selected.includes(`${year}-${month+1}-${i - first_day_week + 1}`)) {
          this.renderer.addClass(dayButton, 'selected');
        }
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
            console.log("EATEN DAYS INTERNAT: ", eatenDays)
            // if(Number(this.dataService.CurrentStudentDeclarationInternat.value.dni).toString(2)[new Date(year, month, i - first_day_week + 1).getDay()] === '0')
            //     checkbox.disabled = true
            console.log(eatenDays.value);
            console.log(eatenDays[(new Date(year, month, i - first_day_week + 1)).getDay()] === 0, new Date(year, month, i - first_day_week + 1).getDay())
            if(isWeekend(new Date(year, month, i - first_day_week + 1)) || eatenDays[(new Date(year, month, i - first_day_week + 1)).getDay()] === 0) {
              checkbox.disabled = true;
            }
            this.renderer.appendChild(checkboxes,checkbox);
          })
          this.renderer.appendChild(dayButton, checkboxes);
          this.renderer.addClass(dayButton,'internat');
        }
        if (isWeekend(new Date(year, month, i - first_day_week + 1)) || eatenDays[(new Date(year, month, i - first_day_week + 1)).getDay()] === 0) {
          dayButton.disabled = true;
          this.renderer.addClass(dayButton, 'disabled');
        }
        this.renderer.appendChild(week, dayButton);
      }
      if (i % 7 === 0) {
        weekcount++;
        // create week div
        const weekDiv = this.renderer.createElement('div');
        this.renderer.addClass(weekDiv, 'week');
        this.renderer.appendChild(calendar_content, weekDiv);
      }
    }
    const dni = this.el.nativeElement.querySelector('#dni');
    dni.innerHTML = '';
    for (let i = 0; i < 7; i++) {
      const daySpan = this.renderer.createElement('span');
      this.renderer.setProperty(daySpan, 'innerHTML', ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Niedz'][i]);
      this.renderer.appendChild(dni, daySpan);
    }
    // checking for empty days
    //@ts-ignore
    Array.from(this.el.nativeElement.querySelectorAll('.week') as NodeListOf<HTMLElement>).forEach((week: HTMLElement) => {
      if (week.children.length < 7) {
        for (let i = week.children.length; i < 7; i++) {
          const dayDiv = this.renderer.createElement('div');
          this.renderer.addClass(dayDiv, 'day');
          this.renderer.addClass(dayDiv, 'empty');
          this.renderer.appendChild(week, dayDiv);
        }
      }
    });
    // check if the week element is empty
    //@ts-ignore
    Array.from(this.el.nativeElement.getElementsByClassName('week') as NodeListOf<HTMLElement>).forEach((week: HTMLElement) => {
      let empty = true;
      //@ts-ignore
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
    zaznacz.innerHTML = '';
    let week_length = this.el.nativeElement.getElementsByClassName('week').length;
    for (let i = 0; i < week_length; i++) {
      let selected_days = 0;
      let days = 0;
      //@ts-ignore
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
      let zaznaczLabel = this.renderer.createElement('label');
      let zaznaczElement = this.renderer.createElement('input');
      let zaznaczSpan = this.renderer.createElement('span');
      // dla wychowanków Internatu
      if(this.typ === 'Internat') {
        this.renderer.addClass(zaznaczSpan,'zaznacz_internat');
      }
      this.renderer.addClass(zaznaczElement, 'zaznacz');
      this.renderer.setAttribute(zaznaczElement, 'type', 'checkbox');
      // check if the entire array is selected
      if(selected_days === days && this.typ === 'ZSTI') {
        console.log('selected');
        this.renderer.setAttribute(zaznaczElement, 'checked', 'true');
      }
      this.renderer.appendChild(zaznaczLabel, zaznacz_);
      this.renderer.appendChild(zaznaczLabel, zaznaczElement);
      this.renderer.appendChild(zaznaczLabel, zaznaczSpan);

      this.renderer.appendChild(zaznacz, zaznaczLabel);
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
      if (target.tagName === 'BUTTON' && !(target as HTMLButtonElement).disabled) {
        function isFullWeekSelected(week : HTMLElement) {
          let selected = 0;
          let days = 0;
          //@ts-ignore
          Array.from(week.children as unknown as NodeListOf<HTMLElement>).forEach((day: HTMLElement) => {
            if(!day.classList.contains('empty')) {
              if(day.classList.contains('selected')) {
                selected++;
              }
              days++;
            }
          });
          return selected === days;
        }
        if (target.classList.contains('selected')) {
          if(isFullWeekSelected(target.parentElement as HTMLElement)) {
            console.log('full week selected check = false');
            const zaznacz = this.el.nativeElement.querySelector('#zaznacz > label > input');
            (zaznacz as HTMLInputElement).checked = false;
          }
          target.classList.remove('selected');
          this.selected.splice(this.selected.indexOf(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${parseInt(target.innerHTML)}`), 1);
        } else {
          target.classList.add('selected');
          this.selected.push(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${parseInt(target.innerHTML)}`);
          if(isFullWeekSelected(target.parentElement as HTMLElement)) {
            console.log('full week selected check = true');
            const zaznacz = this.el.nativeElement.querySelector('#zaznacz > label > input');
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
            //@ts-ignore
            let parent_index = Array.from(grandparent.children as unknown as NodeListOf<HTMLElement>).indexOf(parent);
            //@ts-ignore
            let target_index = Array.from(parent.children as unknown as NodeListOf<HTMLElement>).indexOf(target);
            const div = this.el.nativeElement.querySelector(`.week:nth-child(${parent_index+1}) > .day:nth-child(${target_index+1}) > div`);
            let checked = 0
            let unchecked = 0
            function getInputElements(parent : HTMLElement, check : boolean) {
              //@ts-ignore
              Array.from(parent.children as unknown as NodeListOf<HTMLElement>).forEach((dziecko) => {
                (dziecko as HTMLInputElement).checked = check;
              })
            }
            //@ts-ignore
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
          let value = (target as HTMLInputElement).value;
          if((target as HTMLInputElement).checked) {
            let meal = this.typy_posilkow.find(operacja => operacja.operacja === 'dodanie')?.array_operacaja.find(meal => meal.id === value);
            if(meal) {
              meal.array.push(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${grandparent.textContent}`);
            }
          }
          else {
            let meal = this.typy_posilkow.find(operacja => operacja.operacja === 'dodanie')?.array_operacaja.find(meal => meal.id === value);
            if(meal) {
              meal.array.splice(meal.array.indexOf(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${grandparent.textContent}`), 1);
            }
          }
          console.log(this.typy_posilkow)
        }
      }
    }
  }
  select_row(element : MouseEvent) {
    if(this.typ === "ZSTI") {
      let target = element.target as HTMLElement;
      if(target.tagName === 'INPUT') {
        //@ts-ignore
        const week = this.el.nativeElement.getElementsByClassName('week')[Array.from(this.el.nativeElement.querySelectorAll('.zaznacz')).indexOf(target)];
        if((target as HTMLInputElement).checked) {
          console.log('checked');
          for(let i = 0; i < week.children.length; i++) {
            if(!week.children[i].classList.contains('empty') && !week.children[i].disabled) {
              week.children[i].classList.add('selected');
              if(!this.selected.includes(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${parseInt(week.children[i].innerHTML)}`)) {
                this.selected.push(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${parseInt(week.children[i].innerHTML)}`);
              }
            }
          }
        }
        else {
          console.log('unchecked');
          for(let i = 0; i < week.children.length; i++) {
            if(!week.children[i].classList.contains('empty') && !week.children[i].disabled) {
              week.children[i].classList.remove('selected');
              this.selected.splice(this.selected.indexOf(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${parseInt(week.children[i].innerHTML)}`), 1);
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
        //@ts-ignore
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
    const na = this.el.nativeElement.querySelector(`form[name='na']`) as HTMLElement;
    //@ts-ignore
    const naChecked = Array.from(na.querySelectorAll('input:checked') as NodeListOf<HTMLInputElement>);
    //@ts-ignore
    Array.from(typ.querySelectorAll('input:checked') as NodeListOf<HTMLInputElement>).forEach((dziecko:any) => {
      naChecked.forEach((na_dziecko:any) => {
        let week = this.el.nativeElement.getElementsByClassName('week')[this.numer_week];
        //@ts-ignore
        Array.from(week.querySelectorAll('.day:not(.empty) div') as NodeListOf<HTMLElement>).forEach((div:any) => {
          const checkboxes : NodeListOf<HTMLInputElement> = div.querySelectorAll('input');
          checkboxes.forEach((checkbox) => {
            if (checkbox instanceof HTMLInputElement && !checkbox.disabled && checkbox.value === dziecko.value || dziecko.value === 'wszystko') {
              switch(na_dziecko.value) {
                case 'być':
                  checkbox.checked = true;
                  let meal = this.typy_posilkow.find(operacja => operacja.operacja === 'dodanie')?.array_operacaja.find(meal => meal.id === dziecko.value);
                  if(meal) {
                    meal.array.push(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${div.parentElement!.textContent}`);
                  }
                  break;
                case 'nie_być':
                  checkbox.checked = false;
                  let meal_2 = this.typy_posilkow.find(operacja => operacja.operacja === 'usuniecie')?.array_operacaja.find(meal => meal.id === dziecko.value);
                  if(meal_2) {
                    meal_2.array.push(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${div.parentElement!.textContent}`);
                  }
                  break;
                default:
                  console.error('Nieznana wartość');
                  break;
              }
              console.log(this.typy_posilkow);
            }
          })
        });
      });
    });
  }
}
