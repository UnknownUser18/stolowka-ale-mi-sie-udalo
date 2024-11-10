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
    this.dataService.CurrentStudentId.asObservable().subscribe((newStudent:any)=>this.updateStudent(newStudent));
    this.dataService.StudentType.asObservable().subscribe((newStudent:any)=>this.updateStudent(this.dataService.CurrentStudentId));
  }
  student: { imie: string, nazwisko:string, typ_osoby_id:number, klasa:string, uczeszcza:boolean} = {imie:'', nazwisko:'', typ_osoby_id: 0, klasa:'', uczeszcza:false}
  editedStudent: { imie: string, nazwisko:string, typ_osoby_id:number, klasa:string, uczeszcza:boolean} = {imie:'', nazwisko:'', typ_osoby_id: 0, klasa:'', uczeszcza:false}
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
    console.log(this.student, change, this.dataService.StudentListInternat.value, this.dataService.StudentListZsti.value, this.typ);
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
    this.editedStudent = JSON.parse(JSON.stringify(this.student));

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
  }

  logChanges() {
    console.log('Edited student:', this.editedStudent, ", Normal Student: ", this.student );
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
