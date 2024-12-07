import {Component, ElementRef, Input, OnChanges, Renderer2} from '@angular/core';
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
  Declarations: any[] = [];
  CurrentDeclaration = {
    id: -1,
    opis: '',
    data_rozpoczecia: '',
    data_zakonczenia: '',
    dni_tygodnia: [],
    wersja_posilku: ''
  };

  constructor(private renderer: Renderer2, private el: ElementRef, private dataService: DataBaseService) {
    this.dataService.AllStudentDeclarations.subscribe((change:any) => this.updateDeclarations(change));
  }

  updateDeclarations(declarations: any) {
    this.Declarations = declarations.filter((d: any) => d.id_ucznia === this.dataService.CurrentStudentId.value);
  }

  sendDeclaration() {
    const declaration = {
      opis: this.el.nativeElement.querySelector('input[name="declaration-description"]').value,
      begin_date: this.el.nativeElement.querySelector('input[name="begin-date-edit"]').value,
      end_date: this.el.nativeElement.querySelector('input[name="end-date-edit"]').value,
      dni_tygodnia: Array.from(
        this.el.nativeElement.querySelectorAll('input[name="days"]:checked')
      ).map((checkbox: any) => checkbox.value),
      wersja_posilku: this.el.nativeElement.querySelector('select[name="meal-version"]').value
    };

    if (declaration.begin_date && declaration.end_date && declaration.wersja_posilku) {
      this.dataService.sendDeclaration(declaration);
      this.closeDeklaracje();
    }
  }

  closeDeklaracje() {
    this.el.nativeElement.querySelector('#dodaj_deklaracje').style.display = 'none';
  }

  dodajDeklaracje() {
    this.el.nativeElement.querySelector('#dodaj_deklaracje').style.display = 'flex';
  }

  deleteDeclaration() {
    this.dataService.deleteDeclaration(this.CurrentDeclaration.id);
  }

  updateDeclaration(event: any) {
    this.CurrentDeclaration = this.Declarations[event.target.value];
  }

  ngOnChanges() {
    this.updateDeclarations([]);
  }
}
