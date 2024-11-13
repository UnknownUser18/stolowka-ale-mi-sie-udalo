import {Component, Input, SimpleChanges, ElementRef, OnChanges} from '@angular/core';
import {DataBaseService} from '../data-base.service';
import {NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-edycja',
  standalone: true,
  imports: [
    NgIf,
    FormsModule
  ],
  templateUrl: './edycja.component.html',
  styleUrl: './edycja.component.css'
})
export class EdycjaComponent implements OnChanges {
  @Input() typ: string | undefined;
  constructor(private el: ElementRef, private dataService: DataBaseService) {
    this.dataService.StudentListZsti.asObservable().subscribe(()=>this.updateStudent(this.dataService.CurrentStudentId))
    this.dataService.CurrentStudentId.asObservable().subscribe((newStudent:any)=>this.updateStudent(newStudent));
    this.dataService.StudentType.asObservable().subscribe((newStudent:any)=>this.updateStudent(this.dataService.CurrentStudentId));

    this.dataService.CurrentStudentDeclaration.asObservable().subscribe(()=>this.updateDeclaration())
  }

  student: { imie: string, nazwisko:string, typ_osoby_id:number, klasa:string, uczeszcza:boolean} = {imie:'', nazwisko:'', typ_osoby_id: 0, klasa:'', uczeszcza:false}
  editedStudent: { imie: string, nazwisko:string, typ_osoby_id:number, klasa:string, uczeszcza:boolean} = {imie:'', nazwisko:'', typ_osoby_id: 0, klasa:'', uczeszcza:false}

  declaration: {data_od:string, data_do:string, rok_szkolny_id:number, rok_szkolny?:string ,osoby_internat_id?:number, id_osoby?:number, dniString: string, dni?:any, wersja:number, poniedzialek?:any, wtorek?:any, sroda?:any, czwartek?:any, piatek?:any} = {data_od:'', data_do:'', rok_szkolny_id:-1, osoby_internat_id: -1, id_osoby: -1, dni: -1, wersja: -1, dniString: ''};
  editedDeclaration: {data_od:string, data_do:string, rok_szkolny_id:number, rok_szkolny?:string, osoby_internat_id?:number, id_osoby?:number, dniString: string, dni?:any, wersja:number, poniedzialek?:any, wtorek?:any, sroda?:any, czwartek?:any, piatek?:any} = {data_od:'', data_do:'', rok_szkolny_id:-1, osoby_internat_id: -1, id_osoby: -1, dni: -1, wersja: -1, dniString: ''};

  updateStudent(change:any)
  {
    this.student = {imie:'', nazwisko:'', typ_osoby_id: 0, klasa:'', uczeszcza:false}
    if(this.dataService.StudentType.value === 'Internat')
    {
      this.student = this.dataService.StudentListInternat.value.find((element:any) => element.id === change.value)
    }
    else if(this.dataService.StudentType.value === 'ZSTI')
    {
      this.student = this.dataService.StudentListZsti.value.find((element:any) => element.id === change.value)
    }

    let temp = JSON.stringify(this.student);
    this.editedStudent = JSON.parse(temp);
    this.checkStudents()
    console.log("Updated")

    setTimeout(()=>{
      this.el.nativeElement.querySelector('input[name="imie"]').value = this.student.imie;
      this.el.nativeElement.querySelector('input[name="nazwisko"]').value = this.student.nazwisko;
      console.log(this.el.nativeElement.querySelectorAll('input[name="typ"]'))
      this.el.nativeElement.querySelectorAll('input[name="typ"]').forEach((element:any)=>{
        console.log(element, element.value, element.value == this.student.typ_osoby_id, this.student.typ_osoby_id)
        if(element.value == this.student.typ_osoby_id)
          element.checked = 'checked';
      })
      this.el.nativeElement.querySelector('input[name="klasa"]').value = this.student.klasa;
      this.el.nativeElement.querySelector('input[name="uczeszcza"]').checked = this.student.uczeszcza ? 'checked' : '';

    },100)

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


  updateDeclaration():void {
    if(!this.dataService.CurrentStudentDeclaration.value)
    {
      this.clear_data('deklaracja')
      return
    }
    this.declaration = this.dataService.CurrentStudentDeclaration.value;
    if(this.dataService.StudentType.value === 'ZSTI')
    {
      this.declaration.dni = this.declaration.dni!.data[0]
      this.declaration.dniString = this.toBinary(this.declaration.dni!, 5)
    }
    let dateBegin = new Date(this.declaration.data_od)
    let dateEnd = new Date(this.declaration.data_do)

    this.declaration.data_od = `${dateBegin.getFullYear()}-${dateBegin.getMonth() + 1}-${dateBegin.getDate()}`
    this.declaration.data_do = `${dateEnd.getFullYear()}-${dateEnd.getMonth() + 1}-${dateEnd.getDate()}`
    console.log("Update Declaration", this.dataService.CurrentStudentDeclaration.value)
    let temp = JSON.stringify(this.declaration);
    this.editedDeclaration = JSON.parse(temp);

    let dni = [
      this.el.nativeElement.querySelector('input[name="poniedziałek"]'),
      this.el.nativeElement.querySelector('input[name="wtorek"]'),
      this.el.nativeElement.querySelector('input[name="środa"]'),
      this.el.nativeElement.querySelector('input[name="czwartek"]'),
      this.el.nativeElement.querySelector('input[name="piątek"]')
    ]

    setTimeout(()=>{
      console.log(`${new Date(this.declaration.data_od).getFullYear()}-${new Date(this.declaration.data_od).getMonth()+1}-${new Date(this.declaration.data_od).getDate()}`)
      this.el.nativeElement.querySelector('input[name="data_od"]').value =
          `${new Date(this.declaration.data_od).getFullYear()}-${
              String(new Date(this.declaration.data_od).getMonth() + 1).padStart(2, '0')}-${
              String(new Date(this.declaration.data_od).getDate()).padStart(2, '0')}`;

      this.el.nativeElement.querySelector('input[name="data_do"]').value =
          `${new Date(this.declaration.data_do).getFullYear()}-${
              String(new Date(this.declaration.data_do).getMonth() + 1).padStart(2, '0')}-${
              String(new Date(this.declaration.data_do).getDate()).padStart(2, '0')}`;
      dni.forEach((element:any)=>{
        element.checked = (this.declaration.dniString[dni.indexOf(element)] === '1')
      })

      if(this.dataService.StudentType.value === 'Internat')
        this.el.nativeElement.querySelector('input[name="typ_posilku"]').value = this.declaration.wersja
      this.el.nativeElement.querySelector('input[name="rok_szkolny"]').value = this.dataService.SchoolYears.value.find((element:any) => element.id = this.declaration.rok_szkolny_id).rok_szkolny
    },100)

  }

  changeDays(event:Event)
  {
    // @ts-ignore
    console.log(this.editedDeclaration.dniString, this.editedDeclaration.dniString[(event.target as HTMLInputElement).value], (event.target as HTMLInputElement).value, (event.target! as HTMLInputElement).checked, (event.target! as HTMLInputElement).checked ? '1' : '0')
    // @ts-ignore
    this.editedDeclaration.dniString[(event.target as HTMLInputElement).value] = (event.target! as HTMLInputElement).checked ? '1' : '0';
    this.logChangesDeclaration()
  }

  checkStudents()
  {
    const conditions = [
      this.editedStudent.imie === this.student.imie,
      this.editedStudent.nazwisko === this.student.nazwisko,
      this.editedStudent.typ_osoby_id === this.student.typ_osoby_id,
      this.editedStudent.klasa === this.student.klasa,
      this.editedStudent.uczeszcza === this.student.uczeszcza,
    ]
    conditions.forEach(condition => {
      console.log(condition)
    })
    this.dataService.changePersonalDataSaved(!conditions.includes(false))
    return conditions
  }

  checkDeclaration()
  {
    let conditions = [
      this.editedDeclaration.id_osoby === this.declaration.id_osoby,
      this.editedDeclaration.data_od === this.declaration.data_od,
      this.editedDeclaration.data_od === this.declaration.data_od,
      this.editedDeclaration.rok_szkolny_id === this.declaration.rok_szkolny_id
    ]
    if(this.dataService.StudentType.value === 'ZSTI')
      conditions.push(this.editedDeclaration.dni === this.declaration.dni)
    if(this.dataService.StudentType.value === 'Internat')
      conditions.push(this.editedDeclaration.wersja === this.declaration.wersja)
    conditions.forEach(condition => {
      console.log(condition)
    })
    this.dataService.changeDeclarationDataSaved(!conditions.includes(false))
    return conditions
  }

  logChangesPersonal() {
    console.log('Edited student:', this.editedStudent, ", Normal Student: ", this.student );
    this.checkStudents()
  }

  logChangesDeclaration() {
    console.log('Edited declaration:', this.editedDeclaration, ", Normal Declaration: ", this.declaration );
    this.checkDeclaration()
  }

  sendChangesPersonal()
  {
    if(!this.checkStudents().includes(false))
    {
      alert("Nic się nie zmieniło")
      return
    }
    if(this.dataService.StudentType.value === 'ZSTI')
    {
      this.dataService.send(JSON.stringify(
          {
            action: "request",
            params: {
              method: "changeStudentZsti",
              studentId: this.dataService.CurrentStudentId.value,
              name: this.editedStudent.imie,
              surname: this.editedStudent.nazwisko,
              attends: this.editedStudent.uczeszcza,
              class: this.editedStudent.klasa,
              type: this.editedStudent.typ_osoby_id
            }
          }
      ))
      console.log(          {
        action: "request",
        params: {
          method: "changeStudentZsti",
          studentId: this.dataService.CurrentStudentId.value,
          name: this.editedStudent.imie,
          surname: this.editedStudent.nazwisko,
          attends: this.editedStudent.uczeszcza,
          class: this.editedStudent.klasa,
          type: this.editedStudent.typ_osoby_id
        }
      })
    }
    else if (this.dataService.StudentType.value === 'Internat')
    {
      this.dataService.send(JSON.stringify(
          {
            action: "request",
            params: {
              method: "changeStudentInternat",
              studentId: this.dataService.CurrentStudentId.value,
              name: this.editedStudent.imie,
              surname: this.editedStudent.nazwisko,
              attends: this.editedStudent.uczeszcza,
            }
          }
      ))
      console.log(          {
        action: "request",
        params: {
          method: "changeStudentInternat",
          studentId: this.dataService.CurrentStudentId.value,
          name: this.editedStudent.imie,
          surname: this.editedStudent.nazwisko,
          attends: this.editedStudent.uczeszcza,
        }
      })
    }
    this.dataService.getStudentList()
    console.log("Zmiana")
  }


  ngOnChanges(changes : SimpleChanges) {
    if(changes['typ']) {
      if(this.typ === 'ZSTI') {
        this.el.nativeElement.querySelectorAll('.internat').forEach((element : HTMLElement) => {
          element.style.display = 'none';
        })
        this.el.nativeElement.querySelectorAll('.zsti').forEach((element : HTMLElement) => {
          element.style.display = 'flex';
        })
        this.updateStudent(this.dataService.CurrentStudentId)
      }
      else if(this.typ === 'Internat') {
        this.el.nativeElement.querySelectorAll('.zsti').forEach((element : HTMLElement) => {
          element.style.display = 'none';
        })
        this.el.nativeElement.querySelectorAll('.internat').forEach((element : HTMLElement) => {
          element.style.display = 'flex';
        })
        this.updateStudent(this.dataService.CurrentStudentId)
      }
    }
  }
  clear_data(typ : string) {
    if(typ === 'podstawowe') {
      this.el.nativeElement.querySelectorAll('form[name="osoba"] > fieldset')[0].childNodes.forEach((element : HTMLFieldSetElement) => {
        console.log(element);
        element.childNodes.forEach((child : ChildNode) => {
          if(child.nodeName === 'INPUT') {
            (child as HTMLInputElement).value = '';
          }
        })
      })
    }
    else if(typ === 'deklaracja') {
      this.el.nativeElement.querySelectorAll('form[name="osoba"] > fieldset')[1].childNodes.forEach((element : HTMLFieldSetElement) => {
        element.childNodes.forEach((child : ChildNode) => {
          console.log(child);
          if(child.nodeName === 'INPUT') {
            (child as HTMLInputElement).value = '';
          }
          else if(child.nodeName === 'DIV') {
            child.childNodes.forEach((child2 : ChildNode) => {
              if(child2.nodeName === 'LABEL') {
                (child2.childNodes[0] as HTMLInputElement).checked = false;
              }
            })
          }
        })
      })
    }
  }
  remove_user() {
    console.log('remove user');
  }
}
