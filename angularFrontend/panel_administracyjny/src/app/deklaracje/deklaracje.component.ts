import {Component, ElementRef, Input, OnChanges, SimpleChanges} from '@angular/core';
import {DataBaseService} from '../data-base.service';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgForOf, NgOptimizedImage} from '@angular/common';
import {DeklaracjaZSTI, DeklaracjaInternat} from '../app.component'
@Component({
    selector: 'app-deklaracje',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        NgForOf,
        NgOptimizedImage,
    ],
    templateUrl: './deklaracje.component.html',
    styleUrl: './deklaracje.component.scss'
})
export class DeklaracjeComponent implements OnChanges {
  @Input() typ: string | undefined;
  DOMelement : any | undefined;
  today : string = new Date().toISOString().split('T')[0];
  next_month : string = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0];
  ZSTIDeclarations : Array<DeklaracjaZSTI> = [];
  InternatDeclarations : Array<DeklaracjaInternat> = [];
  constructor(private el: ElementRef, private dataService: DataBaseService) {
    this.dataService.AllStudentDeclarations.subscribe((data?: Array<DeklaracjaZSTI> | Array<DeklaracjaInternat>): void => {
      if (this.dataService.StudentType.value === 'ZSTI') {
        this.ZSTIDeclarations = (data as Array<DeklaracjaZSTI>)?.map((d : DeklaracjaZSTI) : DeklaracjaZSTI => {
          return new DeklaracjaZSTI(d.data_od?.split('T')[0], d.data_do?.split('T')[0], d.rok_szkolny_id, d.id_osoby, d.dni);
        })
      } else if(this.dataService.StudentType.value === 'Internat') {
        this.InternatDeclarations = (data as Array<DeklaracjaInternat>)?.map((d: DeklaracjaInternat): DeklaracjaInternat => {
          return new DeklaracjaInternat(d.data_od, d.data_do, d.rok_szkolny_id, d.id_osoby, d.wersja);
        });
      }
    });
    this.DOMelement = this.el.nativeElement as HTMLElement;
  }

  sendDeclaration() : void {
    let data_od : string = this.DOMelement.querySelector('input[name="begin-date-edit"]').value;
    let data_do : string = this.DOMelement.querySelector('input[name="end-date-edit"]').value;
    let dni_tygodnia : string = '';
    Array.from(this.DOMelement.querySelectorAll('input[name="days"]')).forEach((input : any) : void => {
      console.log(input);
      input = input as HTMLInputElement;
      input.checked ? dni_tygodnia += '1' : dni_tygodnia += '0';
    });
    dni_tygodnia = parseInt(dni_tygodnia, 2).toString(10);
    let wersja_posilku : string =  this.DOMelement.querySelector('select[name="meal-version"]').value
    if(this.typ === 'ZSTI') {
      this.dataService.send(JSON.stringify({
         action: "request",
        params: {
          method: "addZstiDeclaration",
          studentId: this.dataService.CurrentStudentId.value,
          schoolYearId: 1, //! prosze zmienic
          beginDate: data_od,
          endDate: data_do,
          days: dni_tygodnia
        }
      }))
    } else if(this.typ === 'Internat') {
      this.dataService.send(JSON.stringify({
        action: "request",
        params: {
          method: "addInternatDeclaration",
          studentId: this.dataService.CurrentStudentId.value,
          schoolYearId: 1, //! prosze zmienic
          beginDate: data_od,
          endDate: data_do,
          wersja: wersja_posilku
        }
      }))
    }
    setTimeout(() : void => {
      this.dataService.getStudentDeclarationZsti();
      this.dataService.getStudentDeclarationInternat();

    }, 500); // bez timeouta znika lista deklaracje, nie wiem dlaczego i nie chce wiedziec 🗣️🗣️🗣️🗣️🗣️
    this.closeDeklaracje();
  }

  closeDeklaracje() : void {
    this.DOMelement.querySelector('#dodaj_deklaracje').style.display = 'none';
  }

  dodajDeklaracje() : void   {
    this.DOMelement.querySelector('#dodaj_deklaracje').style.display = 'flex';
  }

  deleteDeclaration() : void {
    let data_od : string = this.DOMelement.querySelector('input[name="declaration-begin-date"]').value;
    let data_do : string = this.DOMelement.querySelector('input[name="declaration-end-date"]').value;
    if(this.typ === 'ZSTI') {
      this.dataService.send(JSON.stringify({
        action: "request",
        params: {
          method: "DeleteDeclarationZSTI",
          studentId: this.dataService.CurrentStudentId.value,
          schoolYearId: 1, //! prosze zmienic
          beginDate: data_od,
          endDate: data_do
        }
      }))
    } else if(this.typ === 'Internat') {
      this.dataService.send(JSON.stringify({
        action: "request",
        params: {
          method: "DeleteDeclarationInternat",
          studentId: this.dataService.CurrentStudentId.value,
          schoolYearId: 1, //! prosze zmienic
          beginDate: data_od,
          endDate: data_do
        }
      }))
    }
  }

  updateDeclaration(event : MouseEvent) : void {
    let target : HTMLElement = event.target as HTMLElement;
    let text : string = target.parentElement!.querySelector('span')!.textContent!;
    let data_od : string = text.split(' ')[0];
    let data_do : string = text.split(' ')[1];
    this.DOMelement.querySelector('input[name="declaration-begin-date"]').value = data_od;
    this.DOMelement.querySelector('input[name="declaration-end-date"]').value = data_do;
    // this.CurrentDeclaration = this.Declarations[event.target.value];
  }

  ngOnChanges(changes : SimpleChanges) {
    if(changes['typ']) {
      if(this.typ === 'ZSTI') {
        this.DOMelement.querySelector('.zsti').style.display = 'block';
        this.DOMelement.querySelector('.internat').style.display = 'none';
      }
      else if(this.typ === 'Internat') {
        this.DOMelement.querySelector('.zsti').style.display = 'none';
        this.DOMelement.querySelector('.internat').style.display = 'block';
      }
    }
  }
}
