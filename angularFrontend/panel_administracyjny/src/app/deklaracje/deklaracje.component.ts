import {Component, ElementRef, Input, OnChanges, SimpleChanges} from '@angular/core';
import {DataBaseService} from '../data-base.service';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgForOf, NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-deklaracje',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgForOf,
    NgOptimizedImage
  ],
  templateUrl: './deklaracje.component.html',
  styleUrl: './deklaracje.component.css'
})
export class DeklaracjeComponent implements OnChanges {
  @Input() typ: string | undefined;
  DOMelement : any | undefined;
  Declarations: any[] = [];
  CurrentDeclaration = {
    id: -1,
    opis: '',
    data_rozpoczecia: '',
    data_zakonczenia: '',
    dni_tygodnia: [],
    wersja_posilku: ''
  };

  constructor(private el: ElementRef, private dataService: DataBaseService) {
    this.dataService.AllStudentDeclarations.subscribe((change:any) => this.updateDeclarations(change));
    this.DOMelement = this.el.nativeElement;
  }
  updateDeclarations(declarations: any) : void {
    if (Array.isArray(declarations)) {
      this.Declarations = declarations.filter((d: any) => d.id_ucznia === this.dataService.CurrentStudentId.value);
    } else {
      console.error('Expected declarations   to be an array, but got:', declarations);
    }
  }

  sendDeclaration() {
    const declaration = {
      opis: this.DOMelement.querySelector('input[name="declaration-description"]').value,
      begin_date: this.DOMelement.querySelector('input[name="begin-date-edit"]').value,
      end_date: this.DOMelement.querySelector('input[name="end-date-edit"]').value,
      dni_tygodnia: Array.from(
        this.DOMelement.querySelectorAll('input[name="days"]:checked')
      ).map((checkbox: any) => checkbox.value),
      wersja_posilku: this.DOMelement.querySelector('select[name="meal-version"]').value
    };

    if (declaration.begin_date && declaration.end_date && declaration.wersja_posilku) {
      this.dataService.sendDeclaration(declaration);
      this.closeDeklaracje();
    }
  }

  closeDeklaracje() {
    this.DOMelement.querySelector('#dodaj_deklaracje').style.display = 'none';
  }

  dodajDeklaracje() {
    this.DOMelement.querySelector('#dodaj_deklaracje').style.display = 'flex';
  }

  deleteDeclaration() {
    this.dataService.deleteDeclaration(this.CurrentDeclaration.id);
  }

  updateDeclaration(event: any) {
    this.CurrentDeclaration = this.Declarations[event.target.value];
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
    this.updateDeclarations([]);
  }
}
