import {Component, ElementRef, Input, OnChanges, OnInit, Renderer2, SimpleChanges} from '@angular/core';
import {NgForOf, NgIf, NgOptimizedImage} from '@angular/common';
import {FormsModule} from "@angular/forms";
import {DataBaseService} from '../data-base.service';
import {DeklaracjaZSTI, DeklaracjaInternat, toBinary, GetZSTIDisabledDays, GetInternatDisabledDays, DisabledDays} from '../app.component';

@Component({
    selector: 'app-kalendarz',
    imports: [NgOptimizedImage, FormsModule, NgForOf, NgIf],
    templateUrl: './kalendarz.component.html',
    styleUrl: './kalendarz.component.css'
})
export class KalendarzComponent implements OnChanges, OnInit {
  DOMelement: any | undefined;
  @Input() typ: string | undefined;
  @Input() name: string | undefined;
  currentDate: string | undefined;
  date: Date = new Date();
  CurrentStudentDeclaration: Array<DeklaracjaZSTI> | Array<DeklaracjaInternat> | undefined;
  StudentZstiDays: Array<GetZSTIDisabledDays> | undefined;
  dodaneZsti: string[] = [];
  usunieteZsti: string[] = [];
  // dbCopyZstiDays: any[] = [];
  StudentInternatDays: Array<GetInternatDisabledDays> | undefined;
  diff_selected_zsti: string[] = [];
  diff_undo_selected_zsti: string[] = [];
  months: string[] = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
  month_before: string = this.months[new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).getMonth()] + " " + new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).getFullYear();
  month_next: string = this.months[new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).getMonth()] + " " + new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).getFullYear();
  selected: Array<string> = [];
  dni: any[] = [];
  DisabledDays: any;
  empty_diff_zsti: boolean = true;
  empty_diff_undo_zsti: boolean = true;
  empty_dodanie: boolean = true;
  empty_usuniecie: boolean = true;
  nearestDeclaration: DeklaracjaZSTI | DeklaracjaInternat | undefined;
  typy_posilkow_db: { operacja: string; array_operacaja: Array<{ id: string; array: Array<any> }> } =
    {
      operacja: 'zarejestrowane',
      array_operacaja: [
        {id: 'sniadanie', array: []},
        {id: 'obiad', array: []},
        {id: 'kolacja', array: []},
      ],
    }
  usuniecie: Array<{ id: string, array: Array<any> }> = [
    {id: 'sniadanie', array: []},
    {id: 'obiad', array: []},
    {id: 'kolacja', array: []}
  ];
  dodanie: Array<{ id: string, array: Array<any> }> = [
    {id: 'sniadanie', array: []},
    {id: 'obiad', array: []},
    {id: 'kolacja', array: []}
  ];
  numer_week: number = 0;
  waitForCurrentStudentDeclaration(): Promise<void> {
    return new Promise((resolve, reject) : void => {
      const checkInterval = setInterval(() : void => {
        if (this.CurrentStudentDeclaration) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      setTimeout(() : void => {
        clearInterval(checkInterval);
        if (!this.CurrentStudentDeclaration) {
          reject(new Error('CurrentStudentDeclaration did not load within 5 seconds'));
        }
      }, 5000);
    });
  }
  temp()
  {
    switch (this.dataService.StudentType.value) {
      case "ZSTI":
        this.dataService.StudentZstiDays.asObservable().subscribe((data: Array<GetZSTIDisabledDays>): void => {
          this.selected = []
          this.StudentZstiDays = data?.map(item => new GetZSTIDisabledDays(item.dzien_wypisania, item.osoby_zsti_id, item.uwagi));
          this.StudentZstiDays?.forEach((item: GetZSTIDisabledDays) => {
            item.dzien_wypisania = this.dataService.formatDate(new Date(item.dzien_wypisania))
            this.selected.push(item.dzien_wypisania)
          })
        });
        this.dataService.AllStudentDeclarations.asObservable().subscribe((data: Array<DeklaracjaZSTI> | Array<DeklaracjaInternat>): void => {
          console.log("Deklaracja: ", data)
          if(!(data.length > 0))
            return
          if(data[0] instanceof DeklaracjaZSTI)
            data = data as Array<DeklaracjaZSTI>
          else
            return
          this.CurrentStudentDeclaration = data.map((d: DeklaracjaZSTI): DeklaracjaZSTI => {
            return new DeklaracjaZSTI(d.data_od?.split('T')[0], d.data_do?.split('T')[0], d.rok_szkolny_id, d.id_osoby, d.dni);
          })
        });
        this.show_calendar()
        break;
      case "Internat":
        this.dataService.StudentInternatDays.asObservable().subscribe((data: Array<GetInternatDisabledDays>): void => {
          this.StudentInternatDays = data?.map(item => new GetInternatDisabledDays(item.posilki_id, item.dzien_wypisania, item.osoby_internat_id, item.uwagi));
        });
        this.dataService.AllStudentDeclarations.asObservable().subscribe((data: Array<DeklaracjaInternat> | Array<DeklaracjaZSTI>): void => {
          if(!(data.length > 0))
            return
          if(data[0] instanceof DeklaracjaInternat)
            data = data as Array<DeklaracjaInternat>
          else
            return
          this.CurrentStudentDeclaration = data.map((d: DeklaracjaInternat): DeklaracjaInternat => {
            return new DeklaracjaInternat(d.data_od?.split('T')[0], d.data_do?.split('T')[0], d.rok_szkolny_id, d.id_osoby, d.wersja);
          })
        });
        this.show_calendar()
        break;
      default:
        console.error("Nie wybrano typu ucznia");
        break;
    }
    this.logDaysChanges();

  }
  constructor(private renderer: Renderer2, private el: ElementRef, private dataService: DataBaseService) {
    this.DOMelement = this.el.nativeElement;
    console.log("Data service: ", this.dataService.StudentType.value)
    this.temp()
    this.dataService.CurrentZstiDays.asObservable().subscribe(()=> this.temp())
    this.DOMelement = this.el.nativeElement;
    // this.dataService.CurrentZstiDays.asObservable().subscribe(() : void => {
    //   this.selected = []
    //   this.dbCopyZstiDays = []
    //   if (!this.dataService.CurrentZstiDays.value || this.dataService.StudentType.value !== "BRAK") {
    //     return
    //   }
    //   console.log("Zarejestrowane dni: ", this.dataService.CurrentZstiDays.value)
    //   this.dataService.CurrentZstiDays.value.forEach((element: GetZSTIDisabledDays): void => {
    //     let data: Date = new Date(element.dzien_wypisania)
    //     let value: string = data.getFullYear() + "-" + (data.getMonth() + 1).toString().padStart(2, '0') + "-" + data.getDate().toString().padStart(2, '0')
    //     this.selected.push(value);
    //     this.dbCopyZstiDays.push(value)
    //   })
    //   console.log(`Tescik: ${this.selected} ; ${this.dbCopyZstiDays}`)
    //   this.show_calendar()
    // })
    this.dataService.CurrentInternatDays.asObservable().subscribe(() : void => {
      this.dodanie.forEach((element) : void => {
        element.array = []
      })
      this.usuniecie.forEach((element) : void => {
        element.array = []
      })
      this.typy_posilkow_db.array_operacaja.forEach((element) : void => {
        element.array = []
      })
      if (!this.dataService.CurrentInternatDays.value) {
        return
      }
      this.dataService.CurrentInternatDays.value.forEach((element: GetInternatDisabledDays): void => {
        let data: Date = new Date(element.dzien_wypisania)
        let value: string = `${data.getFullYear()}-${(data.getMonth() + 1).toString().padStart(2, '0')}-${data.getDate().toString().padStart(2, '0')}`;
        const mealIndex: number = element.posilki_id - 1;
        if (mealIndex >= 0 && mealIndex < this.typy_posilkow_db.array_operacaja.length) {
          this.typy_posilkow_db.array_operacaja[mealIndex].array.push(value);
        }
      })
      console.log("Zarejestrowane dni nieobecnosci: ", this.typy_posilkow_db)
    })


    this.dataService.DisabledDays.asObservable().subscribe(() : void => {
      this.DisabledDays = [];
      if (!this.dataService.DisabledDays.value) {
        return
      }

      this.dataService.DisabledDays.value.forEach((element : DisabledDays) : void => {
        let data: Date = new Date(element.dzien)
        let value : string = data.getFullYear() + "-" + (data.getMonth() + 1) + "-" + data.getDate()
        this.DisabledDays.push(value)
      })
    })
    this.logDaysChanges();

  };

  checkSelected(): void {
    let result: boolean = true;
    this.selected.forEach((): void => {
      result = false
    })
    this.dataService.changeSelectedSaved(result)
    if (this.empty_diff_zsti) this.empty_diff_zsti = false;
    if (this.empty_diff_undo_zsti) this.empty_diff_undo_zsti = false;
  }

  checkTypPosilkow() : void {
    let result : boolean = true
    this.dodanie.forEach((element) : void => {
      element.array.forEach(() : void => {
        result = false
      })
    })
    this.usuniecie.forEach((element) : void => {
      element.array.forEach(() : void => {
        result = false
      })
    })
    if (this.empty_dodanie) this.empty_dodanie = false;
    if (this.empty_usuniecie) this.empty_usuniecie = false;
    this.dataService.changeTypPoslikuSaved(result);
    console.log("Is everything saved? : ", this.dataService.TypPosilkuSaved.value);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['typ'] || changes['name']) {
      if(changes['name'].currentValue === undefined) return;
      console.warn("Zmiana typu ucznia")
      this.dataService.getStudentDeclarationInternat();
      this.dataService.getStudentDeclarationZsti();
      this.waitForCurrentStudentDeclaration().then((): void => {
        this.change_month(0);
        this.show_calendar();
      }).catch((error: Error): void => {
        console.error(error.message);
      });
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
      if (this.typ === 'Internat') {
        (this.DOMelement?.querySelector('#zsti_diff') as HTMLElement).style.display = 'none';
        this.DOMelement?.querySelectorAll('.internat_logs')?.forEach((element: HTMLElement) => {
          element.style.display = 'block';
        });
      } else if (this.typ === 'ZSTI') {
        (this.DOMelement?.querySelector('#zsti_diff') as HTMLElement).style.display = 'flex';
        this.DOMelement?.querySelectorAll('.logs').forEach((element: HTMLElement): void => {
          element.classList.add('empty');
        });
        this.DOMelement?.querySelectorAll('.internat_logs').forEach((element: HTMLElement): void => {
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

  getStartingWeekNumber(year: number, month: number): number {
    const firstDayOfMonth = new Date(year, month - 1, 1);
    return this.getWeekNumber(firstDayOfMonth);
  }

  changeDeclaration(change: Array<DeklaracjaZSTI> | Array<DeklaracjaInternat>): void {
    this.CurrentStudentDeclaration = change;
    //! fix someday...
  }

  simpleSend(method:string, date: string): void{
    this.dataService.send(
      JSON.stringify({
        action: "request",
        params: {
          method: method,
          studentId: this.dataService.CurrentStudentId.value,
          date: date,
          schoolYearId: 1
        }
      })
    )
  }

  sendDays() {
    if (this.dataService.StudentType.value === "ZSTI") {
      this.dataService.send(JSON.stringify({
        action: "request",
        params: {
          method: "sendMailDaysZsti",
          name: this.dataService.CurrentStudent.value.imie,
          surname: this.dataService.CurrentStudent.value.nazwisko,
          email: 'xxxxxxszymi@gmail.com',
          addedDays: this.dodaneZsti,
          removedDays: this.usunieteZsti
        }
      }))
      this.dodaneZsti.forEach((distinctAddedDay:string)=> {
        this.simpleSend("AddZstiDays", distinctAddedDay);
      })
      console.log(`Adding ZSTI Days: \n ${this.dodaneZsti}`)

      this.usunieteZsti.forEach((distinctRemovedDay:string)=> {
        this.simpleSend("DeleteZstiDays", distinctRemovedDay);
      })
      console.log(`Removing ZSTI Days: \n ${this.usunieteZsti}`)
      this.dataService.getStudentZstiDays()
      this.DOMelement?.querySelectorAll('.logs').forEach((element: HTMLElement): void => {
        element.classList.add('empty');
      });
      this.dodaneZsti = [];
      this.usunieteZsti = [];

    } else if (this.dataService.StudentType.value === "Internat") {
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
                schoolYearId: 1
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

  // checkIfEmpty(): void {
  //   this.diff_selected_zsti = this.selected.filter((element: string): boolean => !this.dbCopyZstiDays.includes(element));
  //   let ul_1: HTMLElement = this.DOMelement?.querySelectorAll('.logs')[0];
  //   let ul_2: HTMLElement = this.DOMelement?.querySelectorAll('.logs')[1];
  //   this.diff_selected_zsti.length === 0 ? ul_1.classList.add('empty') : ul_1.classList.remove('empty');
  //   this.diff_undo_selected_zsti = [];
  //   this.dbCopyZstiDays.forEach((element: string): void => {
  //     if (!this.selected.includes(element)) {
  //       this.diff_undo_selected_zsti.push(element);
  //     }
  //   });
  //   console.log("Diff undo: ", this.diff_undo_selected_zsti)
  //   this.diff_undo_selected_zsti.length === 0 ? ul_2.classList.add('empty') : ul_2.classList.remove('empty');
  // }

  ngOnInit(): void {
    this.show_calendar()
    this.dataService.AllStudentDeclarations.asObservable().subscribe((change) => this.changeDeclaration(change));
    (Array.from(this.DOMelement?.querySelectorAll('.logs')) as Array<HTMLElement>).forEach((element: HTMLElement): void => {
      element.classList.add('empty');
    });
    // this.checkIfEmpty();
    this.dodanie.forEach((element) => {
      element.array = []
    });
    this.usuniecie.forEach((element) => {
      element.array = []
    });
  }

  isWeekend = (date: Date, button: HTMLButtonElement, typ: string): boolean => {
    let dayOfTheWeek: number = date.getDay();
    if (dayOfTheWeek === 0)
      dayOfTheWeek = 7
    dayOfTheWeek--
    if (dayOfTheWeek === 5 || dayOfTheWeek === 6) {
      button.disabled = true;
      return true;
    }
    if (!this.CurrentStudentDeclaration) {
      button.disabled = true;
      if (dayOfTheWeek !== 5 && dayOfTheWeek !== 6)
        button.classList.add('disabled-for-person')
      return true;
    }
    if (typ === 'ZSTI') {
      this.CurrentStudentDeclaration = this.CurrentStudentDeclaration as Array<DeklaracjaZSTI>;
      this.CurrentStudentDeclaration.forEach((d: DeklaracjaZSTI): boolean => {
        if (date >= new Date(d.data_od!) && date <= new Date(d.data_do!)) {
          if (toBinary(Number(d.dni?.['data']), 5)[dayOfTheWeek] === '0') {
            button.disabled = true;
            button.classList.add('disabled-for-person')
            return true;
          }
        }
        return false;
      })
    }
    return false;
  }

  checkVersion(dayOfTheWeek: number, mealId: number): boolean {
    if (!this.CurrentStudentDeclaration) return false;
    let dni: string[] = ['poniedzialek', 'wtorek', 'sroda', 'czwartek', 'piatek']
    this.dni = [];
    dni.forEach((dzien: string): void => {
      // @ts-ignore
      this.dni.push(toBinary(this.CurrentStudentDeclaration?.[dzien]?.data[0], 3))
      //! really fix someday...
    })
    if (dayOfTheWeek === 0)
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


  show_calendar(): void {
    let data: Date = this.date;
    const calendar_content: HTMLElement = this.DOMelement?.querySelector('#kalendarz')!;
    calendar_content.textContent = '';
    let year: number = data.getFullYear();
    let month: number = data.getMonth();
    let month_days: number = new Date(year, month + 1, 0).getDate();
    let first_day_week: number = new Date(year, month, 1).getDay();

    this.currentDate = this.months[month] + ' ' + year;
    let week: HTMLElement = this.renderer.createElement('div');
    week.classList.add('week');
    const typy: string[] = ['sniadanie', 'obiad', 'kolacja'];

    for (let i: number = -7; i <= (month_days + first_day_week + 6); i++) {
      const day_number: string = `${year}-${(month + 1).toString().padStart(2, '0')}-${(i - first_day_week + 1).toString().padStart(2, '0')}`;
      let day: HTMLButtonElement;
      if (i < first_day_week || i > month_days + first_day_week - 1) {
        day = this.renderer.createElement('div');
        day.classList.add('empty');
        week.appendChild(day);
      } else {
        day = this.renderer.createElement('button');
        day.classList.add('day');
        day.textContent = (i - first_day_week + 1).toString();
        this.isWeekend(new Date(day_number), day, this.typ!);
        if (this.CurrentStudentDeclaration) {
          let nearestDeclaration : DeklaracjaZSTI | DeklaracjaInternat = this.nearestDeclaration!;
          // console.log(nearestDeclaration, day_number, day_number <= nearestDeclaration?.data_od!, day_number >= nearestDeclaration?.data_do!, this.isWeekend(new Date(day_number), day, this.typ!));
          if (((day_number <= nearestDeclaration?.data_od! || day_number >= nearestDeclaration?.data_do!) && !this.isWeekend(new Date(day_number), day, this.typ!)) || nearestDeclaration === undefined) {
            day.disabled = true;
            day.classList.add('out-declaration');
          }
        }

        if (this.typ === 'Internat') {
          const checkboxes: HTMLElement = this.renderer.createElement('div');
          typy.forEach((typ: string): void => {
            const checkbox: HTMLInputElement = this.renderer.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = typ;
            if (this.checkDayInternat(year, month + 1, i - first_day_week + 1, typ, first_day_week, i, typy))
              checkbox.checked = true;

            if (this.DisabledDays?.includes(day_number) || day.disabled)
              checkbox.disabled = true;
            this.typy_posilkow_db.array_operacaja[typy.indexOf(typ)].array.forEach((data: string): void => {
              if (data === day_number)
                checkbox.checked = false;
            });
            this.dodanie[typy.indexOf(typ)].array.forEach((data: string): void => {
              if (data === day_number)
                checkbox.checked = false;
            })
            checkboxes.appendChild(checkbox);
          });
          day.appendChild(checkboxes);
          day.classList.add('internat');
        } else if (this.typ === 'ZSTI' && ((this.dodaneZsti.includes(day_number) || this.StudentZstiDays?.find((distinctItem: GetZSTIDisabledDays) => distinctItem.dzien_wypisania == day_number))))
        {
          day.classList.add('selected');
        }
        this.logDaysChanges();
        if (this.DisabledDays?.includes(day_number)) {
          day.classList.add('disabled-day-global');
          day.disabled = true;
        }
      }
      this.renderer.appendChild(week, day);
      if (i % 7 === 0) {
        calendar_content.appendChild(week);
        week = this.renderer.createElement('div');
        week.classList.add('week');
      }
    }
    const dni: HTMLElement = this.DOMelement?.querySelector('#dni')!;
    dni.textContent = '';
    for (let i: number = 0; i < 7; i++) {
      const daySpan: HTMLSpanElement = this.renderer.createElement('span');
      daySpan.textContent = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nie'][i];
      dni.appendChild(daySpan);
    }
    (Array.from(this.DOMelement?.querySelectorAll('.week')) as Array<HTMLElement>).forEach((week: HTMLElement) => {
        if (!Array.from(week.children).some((child: Element): boolean => (child as HTMLElement).classList.contains('day')))
          week.remove();
    });
    let week_number: number = this.getStartingWeekNumber(year, month + 1);
    const zaznacz: HTMLElement = this.DOMelement?.querySelector('#zaznacz')!;
    zaznacz.textContent = '';
    for (let i: number = 0; i < this.DOMelement?.getElementsByClassName('week').length!; i++) {
      let selected_days: number = 0;
      let days: number = 0;
      Array.from(this.DOMelement?.getElementsByClassName('week')[i]?.children as HTMLCollectionOf<HTMLElement>).forEach((day: HTMLElement): void => {
        if (!day.classList.contains('empty')) {
          if (day.classList.contains('selected'))
            selected_days++;
          days++;
        }
      });
      let zaznacz_: HTMLElement = this.renderer.createElement('div');
      let number: number = week_number + i;
      if (number > 52) number = 1;
      zaznacz_.textContent = number.toString();
      let zaznaczAbbr: HTMLElement = this.renderer.createElement('abbr');
      let zaznaczElement: HTMLInputElement = this.renderer.createElement('input');
      let zaznaczSpan: HTMLElement = this.renderer.createElement('span');
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
      this.renderer.appendChild(zaznaczAbbr, zaznacz_);
      this.renderer.appendChild(zaznaczAbbr, zaznaczElement);
      this.renderer.appendChild(zaznaczAbbr, zaznaczSpan);
      zaznacz.appendChild(zaznaczAbbr);
    }
  }
change_month(number : number): void {
  if (this.DOMelement.querySelector('#kalendarz') === undefined) return;
  if (number === 0) {
    this.date = new Date();
  } else {
    this.date = new Date(this.date.getFullYear(), this.date.getMonth() + number, 1);
  }
  this.month_next = `${this.months[(this.date.getMonth() + 1) % 12]} ${this.date.getFullYear() + (this.date.getMonth() === 11 ? 1 : 0)}`;
  this.month_before = `${this.months[(this.date.getMonth() + 11) % 12]} ${this.date.getFullYear() - (this.date.getMonth() === 0 ? 1 : 0)}`;

  let nearestDeclaration: DeklaracjaZSTI | DeklaracjaInternat | undefined;
  if (!this.CurrentStudentDeclaration) return;

  if (Array.isArray(this.CurrentStudentDeclaration)) {
    let minDiff : number = Infinity;
    this.CurrentStudentDeclaration.forEach((declaration : DeklaracjaZSTI | DeklaracjaInternat) : void => {
      const diff : number = Math.abs(new Date(declaration.data_od!).getTime() - this.date.getTime());
      if (diff < minDiff) {
        minDiff = diff;
        nearestDeclaration = declaration;
      }
    });
  } else {
    nearestDeclaration = this.CurrentStudentDeclaration;
  }
  this.nearestDeclaration = nearestDeclaration;

  this.show_calendar();
}
logDaysChanges()
{
  console.log(`Dodane ; Usunietę ZSTI: ${this.dodaneZsti} ; ${this.usunieteZsti}`)
}
    select(element : MouseEvent) : void {
    let target : HTMLElement = element.target as HTMLElement;
    if(!target.classList.contains('day') && target.tagName !== "INPUT") return;
    let day : string = target.textContent!;
    if(target.tagName === "INPUT") {
      day = target.parentElement!.parentElement!.textContent!;
    }
    const date: string = `${this.date.getFullYear()}-${(this.date.getMonth() + 1).toString().padStart(2, '0')}-${day.padStart(2, '0')}`;
    // const date: string = this.dataService.formatDateFromVariables(this.date.getFullYear(), this.date.getMonth(), day);
    if (this.typ === "ZSTI") {
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
      const week_number : number = Array.from(target.parentElement!.parentElement!.children).indexOf(target.parentElement!);
      if (target.classList.contains('selected')) {
        if (isFullWeekSelected(target.parentElement as HTMLElement)) {
          (this.DOMelement?.querySelector(`#zaznacz > abbr:nth-child(${week_number + 1}) > input`) as HTMLInputElement).checked = false;
        }
        if(this.dodaneZsti.includes(date))
        {
          this.dodaneZsti.splice(this.dodaneZsti.indexOf(date), 1);
        }
        else if(this.StudentZstiDays?.find((distinctItem:GetZSTIDisabledDays) => distinctItem.dzien_wypisania == date))
          this.usunieteZsti.push(date);
        // this.selected.splice(this.selected.indexOf(date), 1);
        target.classList.remove('selected');
      } else {
        target.classList.add('selected');
        if(this.usunieteZsti.includes(date))
        {
          this.usunieteZsti.splice(this.usunieteZsti.indexOf(date), 1);
        }
        else if(!this.StudentZstiDays?.find((distinctItem:GetZSTIDisabledDays) => distinctItem.dzien_wypisania == date))
          this.dodaneZsti.push(date);
        // this.selected.push(date);
        if (isFullWeekSelected(target.parentElement as HTMLElement)) {
          (this.DOMelement?.querySelector(`#zaznacz > abbr:nth-child(${week_number + 1}) > input`) as HTMLInputElement).checked = true;
        }
      }
      this.logDaysChanges();
      this.checkSelected()
      // this.checkIfEmpty();
    }

    else if (this.typ === "Internat") {
      let parent: HTMLElement = target.parentElement as HTMLElement;
      let grandparent: HTMLElement = parent.parentElement as HTMLElement;
      const typy : string[] = ['sniadanie', 'obiad', 'kolacja']
      const assignValueToMeal = (meal: any, date: string, check: boolean): void => {
        console.log(meal, date, check);
        if (!check) {
          const mealItem = this.usuniecie.find(item => item.id === meal.id);
          if (mealItem) {
            const index = mealItem.array.indexOf(date);
            if (index !== -1) {
              mealItem.array.splice(index, 1);
            }
          }
          if (!(this.typy_posilkow_db.array_operacaja.find(item => item.id === meal.id)?.array.includes(date)) && this.checkVersion(new Date(date).getDay(), typy.indexOf(meal.id))) {
            if(!meal.array.includes(date))
              meal.array.push(date);
          }
        } else {
          const index = meal.array.indexOf(date);
          if (index !== -1) {
            meal.array.splice(index, 1);
          }
          if ((this.typy_posilkow_db.array_operacaja.find(item => item.id === meal.id)?.array.includes(date)) && this.checkVersion(new Date(date).getDay(), typy.indexOf(meal.id))) {
            const mealItem = this.usuniecie.find(item => item.id === meal.id);
            if (mealItem && !mealItem.array.includes(date)) {
              mealItem.array.push(date);
            }
          }
        }
      };
      if (element.button == 2) {
        element.preventDefault()
        const div: HTMLElement = this.DOMelement?.querySelector(`.week:nth-child(${Array.from(grandparent.children).indexOf(parent) + 1}) > .day:nth-child(${Array.from(parent.children).indexOf(target) + 1}) > div`) as HTMLElement;
        let all: number = 0;
        let checked: number = 0
        let unchecked: number = 0
         const getInputElements = (parent : HTMLElement, check : boolean) : void  => {
          Array.from(parent.children).forEach((input : any) : void => {
            input.disabled ? input.checked = false : input.checked = check;
            let value: string = input.value;
            let meal = this.dodanie.find(meal => meal.id === value);
            if (meal) {
              assignValueToMeal(meal, date, check);
            }
            this.checkTypPosilkow();
          });
        }
        Array.from(div.children).forEach((child : any) : void => {
          if (!child.disabled) {
            all++;
            child.checked ? checked++ : unchecked++;
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
    } else {
        if (target.tagName === "INPUT") {
          let input: HTMLInputElement = target as HTMLInputElement;
          let value: string = input.value;
          let meal = this.dodanie.find(meal => meal.id === value);
          if (meal) {
            assignValueToMeal(meal, date, input.checked);
          }
          this.checkTypPosilkow();
        }
      }
    }
  }
  select_row(element : MouseEvent) : void {
    let target : HTMLInputElement = element.target as HTMLInputElement;
    if(target.tagName !== 'INPUT') return;
    if (this.typ === "ZSTI") {
      if (target.tagName === 'INPUT') {
        const week : HTMLElement = this.DOMelement?.getElementsByClassName('week')[Array.from(this.DOMelement.querySelectorAll('.zaznacz')).indexOf(target)]!;
        for(let i : number = 0 ; i < week.children.length ; i++) {
          let element : HTMLButtonElement = week.children[i] as HTMLButtonElement;
          if(element.classList.contains('empty') || element.disabled) continue;
          let date : string = `${this.date.getFullYear()}-${(this.date.getMonth() + 1).toString().padStart(2, '0')}-${element.textContent!.padStart(2, '0')}`;
          if(target.checked) {
            element.classList.add('selected');
            if (!this.selected.includes(date)) {
              this.selected.push(date);
              this.usunieteZsti.splice(this.usunieteZsti.indexOf(date) ,1);
              if(!this.StudentZstiDays?.find((distinctItem:GetZSTIDisabledDays) => distinctItem.dzien_wypisania == date))
                this.dodaneZsti.push(date);
              this.checkSelected();
            }
          } else {
            element.classList.remove('selected');
            this.dodaneZsti.splice(this.dodaneZsti.indexOf(date) ,1);
            if(this.StudentZstiDays?.find((distinctItem:GetZSTIDisabledDays) => distinctItem.dzien_wypisania == date))
              this.usunieteZsti.push(date);
            this.selected.splice(this.selected.indexOf(date), 1);
            this.checkSelected();
          }
        }
      }
      // this.checkIfEmpty();
    } else if (this.typ === "Internat") {
      const parent : HTMLElement = target.parentElement!;
      const grandparent : HTMLElement = parent.parentElement!;
      this.numer_week = Array.from(grandparent.children).indexOf(parent);
      let zmiana_posilku : HTMLElement = this.DOMelement?.querySelector('#zmiana_posilku')!;
      zmiana_posilku.style.display = 'flex';
    }
  }
  close() : void {
    (this.DOMelement?.querySelector('#zmiana_posilku') as HTMLElement).style.display = 'none';
  }
  zmien_posilek(event: MouseEvent) : void {
    let target : HTMLElement = event.target! as HTMLElement;
    let zmiana_posilku : HTMLElement = this.DOMelement?.querySelector('#zmiana_posilku')!;
    zmiana_posilku.style.display = 'none';
    const grandparent : HTMLElement = target.parentElement!.parentElement!;
    let typ : HTMLElement = grandparent.querySelectorAll('form')[0]!;
    const formularz : HTMLFormElement = this.DOMelement?.querySelector(`form[name="yah"]`);
  const checkbox_function = (value: string, input: HTMLInputElement): void => {
    let meal = this.dodanie.find(meal => meal.id === input.value)!;
    if (input.disabled) return;
    const typy : string[] = ['sniadanie', 'obiad', 'kolacja'];
    if (meal) {
      let date: string = `${this.date.getFullYear()}-${(this.date.getMonth() + 1).toString().padStart(2, '0')}-${input.parentElement!.parentElement!.textContent!.padStart(2, '0')}`;
      switch (value) {
        case 'być':
          input.checked = true;
          meal.array = meal.array.filter(d => d !== date);
          if (this.typy_posilkow_db.array_operacaja.find(meal => meal.id === input.value)?.array.includes(date) && this.checkVersion(new Date(date).getDay(), typy.indexOf(input.value))) {
            let usuniecieMeal = this.usuniecie.find(meal => meal.id === input.value);
            if (usuniecieMeal && !usuniecieMeal.array.includes(date)) {
              usuniecieMeal.array.push(date);
            }
          }
          break;
        case 'nie_być':
          input.checked = false;
          let usuniecieMeal = this.usuniecie.find(meal => meal.id === input.value);
          if (usuniecieMeal) {
            usuniecieMeal.array = usuniecieMeal.array.filter(d => d !== date);
          }
          if (!this.typy_posilkow_db.array_operacaja.find(meal => meal.id === input.value)?.array.includes(date) && this.checkVersion(new Date(date).getDay(), typy.indexOf(input.value))) {
            if (!meal.array.includes(date)) {
              meal.array.push(date);
            }
          }
          break;
        default:
          console.error('Nieznana wartość');
          break;
      }
    }
    this.checkTypPosilkow();
  };
      typ.querySelectorAll('input:checked').forEach((child : Element) : void => {
        const input: string = (child as HTMLInputElement).value;
        let week: HTMLElement = this.DOMelement?.getElementsByClassName('week')[this.numer_week]!;
        week.querySelectorAll('.day:not(.empty) div').forEach((div: Element): void => {
          const checkboxes: NodeListOf<HTMLInputElement> = div.querySelectorAll('input');
          let nieobecnosc: string = (formularz.elements.namedItem('na') as HTMLInputElement).value;
          checkboxes.forEach((checkboxes: HTMLInputElement): void => {
            if (checkboxes.value === input || input === 'wszystko') {
              checkbox_function(nieobecnosc, checkboxes);
            }
          })
        });
      });
    }
}
