import { Component, ChangeDetectorRef, ElementRef } from '@angular/core';
import { DataService, Student } from '../data.service';
import { Router } from '@angular/router';
import { GlobalInfoService } from '../global-info.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-zsti',
  imports: [
    FormsModule,
  ],
  templateUrl: './zsti.component.html',
  styleUrl: './zsti.component.scss'
})
export class ZstiComponent {
  protected searchTerm : string | undefined;
  protected persons_zsti : Student[] | undefined;
  protected result : Student[] | undefined;
  protected showFilter : boolean = false;
  protected filter = {
    imie : '',
    nazwisko : '',
    klasa : '',
    miasto : 'wszyscy',
    typ_osoby : '1',
    uczeszcza : 'wszyscy',
  }
  constructor(private globalInfoService: GlobalInfoService, private database: DataService, protected cdr: ChangeDetectorRef, private el: ElementRef, private router : Router) {
    this.globalInfoService.setTitle('ZSTI - Osoby');
    this.database.request('zsti.student.get', {}, 'studentList');
    setTimeout(() : void => {
      this.persons_zsti = this.database.get('studentList');
      this.result = this.persons_zsti!;
    }, 1000); // please make this function async 😭😭😭😭😭
  }
  private applyAnimation(type : string) : void {
    const filterBackground : HTMLElement = this.el.nativeElement.querySelector('section');
    const filterMain : HTMLElement = this.el.nativeElement.querySelector('section > div');
    switch (type) {
      case 'open':
        filterBackground.classList.add('done');
        filterMain.classList.add('done');
        break;
      case 'close':
        filterBackground.classList.remove('done');
        filterMain.classList.remove('done');
        break;
    }
  }
  protected getPersonIndex(id : number) : number {
    return this.result?.findIndex((item : Student) : boolean => item.id === id)! + 1 ?? -1;
  }
  protected filterPersons(event : Event) : void {
    if(event instanceof KeyboardEvent && event.key !== 'Enter') return;
    if (this.searchTerm === undefined) return;
    const searchTerm : string = this.searchTerm.toLowerCase();
    this.result = this.persons_zsti!.filter((person : Student) : boolean => {
      return person.imie.toLowerCase().includes(searchTerm) || person.nazwisko.toLowerCase().includes(searchTerm);
    });
  }
  protected openFilterMenu() : void {
    this.showFilter = true;
    setTimeout(() : void => {
      this.applyAnimation('open');
    }, 10)
    const searchTerm : string = this.searchTerm ?? '';
    if (searchTerm.includes(' ') && searchTerm.length > 0) {
      this.filter.imie = searchTerm.charAt(0).toUpperCase() + searchTerm.split(' ')[0].slice(1);
      this.filter.nazwisko = searchTerm.split(' ')[1].charAt(0).toUpperCase() + searchTerm.split(' ')[1].slice(1);
    } else {
      this.filter.imie = searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1);
    }
  }
  protected applyFilter() : void {
    this.applyAnimation('close');
    setTimeout(() : void => {
      this.showFilter = false;
    }, 800);
    this.result = this.persons_zsti!.filter((person : Student) : boolean => {
      const { imie, nazwisko, klasa, miasto, typ_osoby_id, uczeszcza } = person;
      return (
        imie.toLowerCase().includes(this.filter.imie.toLowerCase()) &&
        nazwisko.toLowerCase().includes(this.filter.nazwisko.toLowerCase()) &&
        klasa.toLowerCase().includes(this.filter.klasa.toLowerCase()) &&
        (this.filter.miasto === 'wszyscy' ? true : this.filter.miasto === 'true' ? miasto : !miasto) &&
        (this.filter.typ_osoby === '1' ? true : this.filter.typ_osoby === '2' ? typ_osoby_id === 1 : typ_osoby_id === 2) &&
        (this.filter.uczeszcza === 'wszyscy' ? true : this.filter.uczeszcza === 'true' ? uczeszcza : !uczeszcza)
      );
    });
    this.searchTerm = (this.filter.imie + ' ' + this.filter.nazwisko).trim();
  }
  protected closeFilterMenu() : void {
    this.applyAnimation('close');
    setTimeout(() : void => {
      this.showFilter = false;
    }, 800);
  }
  protected selectPerson(id : number) : void {
    this.router.navigate(['osoba/zsti', id, 'kalendarz']).then((r : boolean) : void => {
      this.globalInfoService.setActiveUser(id);
    });
  }
}
