import {Component, Input, SimpleChanges, ElementRef, OnChanges} from '@angular/core';
import {DataBaseService} from '../data-base.service';
import {FormsModule} from '@angular/forms';
import {NgForOf} from '@angular/common';

interface Osoba {
  imie : string | undefined;
  nazwisko : string | undefined;
  uczeszcza : number | undefined;
}
class OsobaZSTI implements Osoba {
  imie: string | undefined;
  nazwisko: string | undefined;
  typ_osoby_id: number | undefined;
  klasa: string | undefined;
  uczeszcza: number | undefined;
  constructor(imie?: string, nazwisko?: string, typ_osoby_id?: number, klasa?: string, uczeszcza?: number) {
    this.imie = imie;
    this.nazwisko = nazwisko;
    this.typ_osoby_id = typ_osoby_id;
    this.klasa = klasa;
    this.uczeszcza = uczeszcza;
  }
  assignValues(student : any) : void {
    this.imie = student.imie;
    this.nazwisko = student.nazwisko;
    this.typ_osoby_id = student.typ_osoby_id;
    this.klasa = student.klasa;
    this.uczeszcza = student.uczeszcza;
  }
}
class OsobaInternat implements Osoba {
  imie: string | undefined;
  nazwisko: string | undefined;
  uczeszcza: number | undefined;
  grupa: number | undefined;
  nazwaGrupy: string | undefined;
  constructor(imie?: string, nazwisko?: string, uczeszcza?: number, grupa?: number, nazwaGrupy?: string) {
    this.imie = imie;
    this.nazwisko = nazwisko;
    this.uczeszcza = uczeszcza;
    if(grupa !== undefined) this.grupa = grupa;
    if(nazwaGrupy !== undefined) this.nazwaGrupy = nazwaGrupy;
  }
  assignValues(student : any) : void {
    this.imie = student.imie;
    this.nazwisko = student.nazwisko;
    this.uczeszcza = student.uczeszcza;
    if(student.grupa !== undefined) this.grupa = student.grupa;
    if(student.nazwaGrupy !== undefined) this.nazwaGrupy = student.nazwaGrupy;
  }
}
interface Deklaracja {
  data_od : string | undefined;
  data_do : string | undefined;
  rok_szkolny_id : number | undefined;
  rok_szkolny : string | undefined;
  id_osoby : number | undefined;
}
class DeklaracjaZSTI implements Deklaracja {
  data_od: string | undefined;
  data_do: string | undefined;
  rok_szkolny_id: number | undefined;
  rok_szkolny: string | undefined;
  id_osoby: number | undefined;
  dni: {type : string, data : number[] }| undefined;
  constructor(data_od?: string, data_do?: string, rok_szkolny_id?: number, id_osoby?: number, dni?: {type : string, data : number[] }) {
    this.data_od = data_od;
    this.data_do = data_do;
    this.rok_szkolny_id = rok_szkolny_id;
    this.id_osoby = id_osoby;
    this.dni = dni;
  }
  assignValues(declaration : any) : void {
    this.data_od = declaration.data_od;
    this.data_do = declaration.data_do;
    this.rok_szkolny_id = declaration.rok_szkolny_id;
    this.id_osoby = declaration.id_osoby;
    this.dni = declaration.dni;
  }
}
class DeklaracjaInternat implements Deklaracja {
  data_od: string | undefined;
  data_do: string | undefined;
  rok_szkolny_id: number | undefined;
  rok_szkolny: string | undefined;
  id_osoby: number | undefined;
  wersja: number | undefined;
  constructor(data_od?: string, data_do?: string, rok_szkolny_id?: number, id_osoby?: number, wersja?: number) {
    this.data_od = data_od;
    this.data_do = data_do;
    this.rok_szkolny_id = rok_szkolny_id;
    this.id_osoby = id_osoby;
    this.wersja = wersja;
  }
  assignValues(declaration : any) : void {
    this.data_od = declaration.data_od;
    this.data_do = declaration.data_do;
    this.rok_szkolny_id = declaration.rok_szkolny_id;
    this.id_osoby = declaration.id_osoby;
    this.wersja = declaration.wersja;
  }
}

@Component({
  selector: 'app-edycja',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf
  ],
  templateUrl: './edycja.component.html',
  styleUrl: './edycja.component.css'
})
export class EdycjaComponent implements OnChanges {
  @Input() typ: string | undefined;
  DOMelement: HTMLElement | null;
  // zmian
  constructor(private el: ElementRef, protected dataService: DataBaseService) {
    this.dataService.StudentListZsti.asObservable().subscribe(() : void => this.updateStudent(this.dataService.CurrentStudentId))
    this.dataService.StudentListInternat.asObservable().subscribe(() : void => this.updateStudent(this.dataService.CurrentStudentId))
    this.dataService.CurrentStudentId.asObservable().subscribe((newStudent: any) : void => this.updateStudent(newStudent));
    this.dataService.StudentType.asObservable().subscribe(() : void => this.updateStudent(this.dataService.CurrentStudentId));
    this.DOMelement = this.el.nativeElement as HTMLElement | null;
    this.dataService.CurrentStudentDeclaration.asObservable().subscribe(() : void => this.updateDeclaration())
  }

  student: OsobaZSTI | OsobaInternat | undefined
  declaration: DeklaracjaZSTI | DeklaracjaInternat | undefined
  dni: string[] = ['poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek']

  ngOnChanges(changes: SimpleChanges) {
    if (changes['typ']) {
      if (this.typ === 'ZSTI') {
        this.DOMelement?.querySelectorAll('.internat').forEach((element: Element) : void => {
          (element as HTMLElement).style.display = 'none';
        })
        this.DOMelement?.querySelectorAll('.zsti').forEach((element: Element) : void => {
          (element as HTMLElement).style.display = 'flex';
        })
        this.updateStudent(this.dataService.CurrentStudentId)
      } else if (this.typ === 'Internat') {
        this.DOMelement?.querySelectorAll('.zsti').forEach((element: Element) : void => {
          (element as HTMLElement).style.display = 'none';
        })
        this.DOMelement?.querySelectorAll('.internat').forEach((element: Element) : void => {
          (element as HTMLElement).style.display = 'flex';
        })
        this.updateStudent(this.dataService.CurrentStudentId)
      }
    }
  }

  updateStudent(change: any): void {
    if (this.dataService.StudentType.value === 'Internat') {
      this.student = new OsobaInternat()
      const studentData : OsobaInternat = this.dataService.StudentListInternat.value.find((element: any): boolean => element.id === change.value);
      if(!studentData) return;
      this.student.assignValues(studentData)

    } else if (this.dataService.StudentType.value === 'ZSTI') {
      this.student = new OsobaZSTI();
      const studentData : OsobaInternat = this.dataService.StudentListZsti.value.find((element: any): boolean => element.id === change.value);
      if(!studentData) return;
      this.student.assignValues(studentData)
    }

    if(this.student === undefined) return;
    (this.DOMelement?.querySelector('input[name="imie"]') as HTMLInputElement).value = this.student.imie || '';
    (this.DOMelement?.querySelector('input[name="nazwisko"]') as HTMLInputElement).value = this.student.nazwisko || '';
    if(this.student instanceof OsobaZSTI) {
      (this.DOMelement?.querySelectorAll('input[name="typ"]') as NodeListOf<HTMLInputElement>).forEach((element: HTMLInputElement): void => {
        if (element.value == (this.student as OsobaZSTI)?.typ_osoby_id?.toString()) {
          element.checked = true;
        }
      });
      (this.DOMelement?.querySelector('input[name="klasa"]') as HTMLInputElement).value = this.student.klasa || '';
    }
    if(this.student instanceof OsobaInternat) {
      // @ts-ignore
      if(this.student.grupa !== undefined) (this.DOMelement?.querySelector('select[name="grupa"]') as HTMLInputElement).value = this.student.grupa || "";
    }
    (this.DOMelement?.querySelector('input[name="uczeszcza"]') as HTMLInputElement).checked = !!this.student.uczeszcza;
  }

  toBinary(num: number, len: number): string {
    let binary : string = Number(num).toString(2)
    for (let i : number = 0; i < len - binary.length; i++) {
      binary = '0' + binary
    }
    return binary;
  }


  updateDeclaration(): void {
    if(this.dataService.CurrentStudentId.value === -1) return;
    if (this.dataService.CurrentStudentDeclaration.value === undefined) {

      console.warn(`${(this.DOMelement?.querySelector('input[name="imie"]') as HTMLInputElement).value} ${(this.DOMelement?.querySelector('input[name="nazwisko"]') as HTMLInputElement).value} has no declaration`)
      this.clear_data('deklaracja')
      this.dataService.changeDeclarationDataSaved(true);
      return
    }
    if (this.dataService.StudentType.value === 'ZSTI') {
      this.declaration = new DeklaracjaZSTI()
    } else if (this.dataService.StudentType.value === 'Internat') {
      this.declaration = new DeklaracjaInternat()
    }
    this.dataService.changeDeclarationDataSaved(true)
    if (this.declaration && this.DOMelement) {
      this.declaration?.assignValues(this.dataService.CurrentStudentDeclaration.value)
      if (this.declaration instanceof DeklaracjaZSTI) {
        if (this.declaration.dni) {
          let dni_binary: string = this.toBinary(this.declaration.dni['data'][0], 5)
          this.dni.forEach((element: string, index: number): void => {
            (this.DOMelement?.querySelector(`input[name="${element}"]`) as HTMLInputElement).checked = dni_binary[index] === '1'
          })
        }
      } else {
        (this.DOMelement?.querySelector('input[name="typ_posilku"]') as HTMLInputElement)?.setAttribute('value', this.declaration.wersja?.toString() || '')
      }
      let dateBegin: string = this.declaration.data_od?.split('T')[0] || '';
      let dateEnd: string = this.declaration.data_do?.split('T')[0] || '';
      (this.DOMelement.querySelector('input[name="data_od"]') as HTMLInputElement).value = dateBegin;
      (this.DOMelement.querySelector('input[name="data_do"]') as HTMLInputElement).value = dateEnd;
      this.declaration.rok_szkolny = this.dataService.SchoolYears.value.find((element: any) : boolean => element.id === this.declaration?.rok_szkolny_id)?.rok_szkolny || '';
      (this.DOMelement.querySelector('input[name="rok_szkolny"]') as HTMLInputElement).value = this.declaration.rok_szkolny || '';
    }
  }

  clear_data(typ : string) : void {
    if(this.DOMelement === null) return;
    if (typ === 'podstawowe') {
      const fieldset : HTMLFieldSetElement = this.DOMelement.querySelectorAll('fieldset')[0];
      fieldset.querySelectorAll('input').forEach((input : HTMLInputElement): void => {
        input.value = '';
      })
      this.student = undefined;
    } else if (typ === 'deklaracja') {
      const fieldset : HTMLFieldSetElement = this.DOMelement.querySelectorAll('fieldset')[1];
      fieldset.querySelectorAll('input').forEach((input : HTMLInputElement): void => {
        if(input.type === 'checkbox') {
          input.checked = false;
        } else {
          input.value = '';
        }
      })
      this.declaration = undefined;
    }
  }

    sendChangesDeclaration() {
    let change : boolean = false;
    let rokSzkolny = this.dataService.SchoolYears.value.find((element:any) => element.rok_szkolny == this.declaration?.rok_szkolny);
    if(!rokSzkolny) {
      this.dataService.send(JSON.stringify(
        {
          action: "request",
          params: {
            method: "addSchoolYear",
            year: this.declaration?.rok_szkolny
          }
        }))
      this.dataService.getSchoolYears();
    }
    let data_od : string = (this.DOMelement?.querySelector('input[name="data_od"]') as HTMLInputElement).value;
    let data_do : string = (this.DOMelement?.querySelector('input[name="data_do"]') as HTMLInputElement).value;
    let rok_szkolny : string = (this.DOMelement?.querySelector('input[name="rok_szkolny"]') as HTMLInputElement).value;
    let dni;
    if(this.declaration instanceof DeklaracjaZSTI) dni = this.dni.map((element: string): number => {
      return (this.DOMelement?.querySelector(`input[name="${element}"]`) as HTMLInputElement).checked ? 1 : 0;
    }).join(',');
    dni = (dni as string).replace(/,/g, '');
    dni = parseInt(dni, 2);
    let wersja;
    if(this.declaration instanceof DeklaracjaInternat) wersja = parseInt((this.DOMelement?.querySelector('input[name="typ_posilku"]') as HTMLInputElement).value);
    let editedDeclaration : DeklaracjaZSTI | DeklaracjaInternat;
    if(this.declaration instanceof DeklaracjaZSTI) {
      // @ts-ignore
      editedDeclaration = new DeklaracjaZSTI(data_od, data_do, rokSzkolny.id, this.dataService.CurrentStudentId.value, dni)
    } else {
      editedDeclaration = new DeklaracjaInternat(data_od, data_do, rokSzkolny.id, this.dataService.CurrentStudentId.value, wersja)
    }
    for (const key in editedDeclaration) {
      // @ts-ignore
      if (editedDeclaration[key] !== this.declaration[key]) {
        change = true;
        break;
      }
    }
    if(!change) {
      alert('Nic się nie zmieniło')
      return
    }
    if(editedDeclaration instanceof DeklaracjaZSTI) {
      if(this.declaration === undefined) {
        this.dataService.send(JSON.stringify({
            action: "request",
            params: {
              method: "addZstiDeclaration",
              studentId: this.dataService.CurrentStudentId.value,
              schoolYearId: editedDeclaration.rok_szkolny_id,
              days: editedDeclaration.dni,
              beginDate: editedDeclaration.data_od,
              endDate: editedDeclaration.data_do
            }
          }
        ))
      } else {
        this.dataService.send(JSON.stringify(
          {
            action: "request",
            params: {
              method: "changeStudentDeclarationZsti",
              studentId: this.dataService.CurrentStudentId.value,
              schoolYearId: editedDeclaration.rok_szkolny_id,
              days: editedDeclaration.dni,
              beginDate: editedDeclaration.data_od,
              endDate: editedDeclaration.data_do
            }
          }
        ))
      }
    } else {
      if(this.declaration === undefined) {
        this.dataService.send(JSON.stringify({
            action: "request",
            params: {
              method: "addInternatDeclaration",
              studentId: this.dataService.CurrentStudentId.value,
              schoolYearId: editedDeclaration.rok_szkolny_id,
              wersja: editedDeclaration.wersja,
              beginDate: editedDeclaration.data_od,
              endDate: editedDeclaration.data_do
            }
          }
        ))
      } else {
        this.dataService.send(JSON.stringify({
            action: "request",
            params: {
              method: "changeStudentDeclarationInternat",
              studentId: this.dataService.CurrentStudentId.value,
              schoolYearId: editedDeclaration.rok_szkolny_id,
              wersja: editedDeclaration.wersja,
              beginDate: editedDeclaration.data_od,
              endDate: editedDeclaration.data_do
            }
          }
        ))
      }
    }
    this.dataService.getStudentList();
    }
    sendChangesPersonal() : void {
      console.warn('sendChangesPersonal')
      console.log(this.student)
      let change : boolean = false;
      let editedStudent : OsobaZSTI | OsobaInternat | undefined;
      let typ_osoby_id : number | undefined;
      let klasa : string | undefined;

      if(this.student === undefined) return;

      let imie: string = (this.DOMelement?.querySelector('input[name="imie"]') as HTMLInputElement).value;
      let nazwisko: string = (this.DOMelement?.querySelector('input[name="nazwisko"]') as HTMLInputElement).value;
      if (this.student instanceof OsobaZSTI) {
        typ_osoby_id = parseInt((this.DOMelement?.querySelector('input[name="typ"]:checked') as HTMLInputElement).value);
        klasa = (this.DOMelement?.querySelector('input[name="klasa"]') as HTMLInputElement).value;
      }
      let uczeszcza: number = Number((this.DOMelement?.querySelector('input[name="uczeszcza"]') as HTMLInputElement).checked);

      if(this.student instanceof OsobaZSTI) {
        editedStudent = new OsobaZSTI(imie, nazwisko, typ_osoby_id, klasa, uczeszcza)
      }
      else {
        let grupa = (this.DOMelement?.querySelector('select[name="grupa"]') as HTMLInputElement).value;
        editedStudent = new OsobaInternat(imie, nazwisko, uczeszcza, parseInt(grupa))
      }
      if(editedStudent === undefined) return;
      console.log(editedStudent)
      for (const key in editedStudent) {
        // @ts-ignore
        if (editedStudent[key] !== this.student![key]) {
          change = true;
          break;
        }
      }
      if(!change) {
        alert('Nic się nie zmieniło')
        return
      }
      console.log('sendChangesPersonal', editedStudent, editedStudent.imie, editedStudent.nazwisko, editedStudent.uczeszcza)
      if (editedStudent instanceof OsobaZSTI) {
        this.dataService.send(JSON.stringify({
          action: "request",
          params: {
            method: "changeStudentZsti",
            studentId: this.dataService.CurrentStudentId.value,
            name: editedStudent.imie,
            surname: editedStudent.nazwisko,
            attends: editedStudent.uczeszcza,
            class: editedStudent.klasa,
            type: editedStudent.typ_osoby_id
          }
        }));
      } else {
        this.dataService.send(JSON.stringify({
          action: "request",
          params: {
            method: "changeStudentInternat",
            studentId: this.dataService.CurrentStudentId.value,
            name: editedStudent.imie,
            surname: editedStudent.nazwisko,
            attends:editedStudent.uczeszcza,
            group:editedStudent.grupa
          }
        }));
      }
      this.dataService.getStudentList();
      }
    remove_user() {

      console.log('remove user');
    }
  }
