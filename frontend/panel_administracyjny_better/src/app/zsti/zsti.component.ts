import { Component } from '@angular/core';
import { DataService, Student } from '../data.service';
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
    miasto : 'false',
    typ_osoby : 1,
    uczeszcza : 'true',
  }
  constructor(private globalInfoService: GlobalInfoService, private database: DataService) {
    this.globalInfoService.setTitle('ZSTI - Osoby');
    this.database.request('zsti.student.get', {}, 'studentList');
    setTimeout(() : void => {
      this.persons_zsti = this.database.get('studentList');
      this.result = this.persons_zsti!;
    }, 1000); // please make this function async 😭😭😭😭😭
  }
  protected getPersonIndex(id : number) : number {
    return this.result?.findIndex(item => item.id === id) ?? -1;
  }
  protected filterPersons(event : Event) : void {
    if(event instanceof KeyboardEvent && event.key !== 'Enter') return;
    if (!this.searchTerm) return;
    const searchTerm : string = this.searchTerm.toLowerCase();
    this.result = this.persons_zsti!.filter((person : Student) : boolean => {
      return person.imie.toLowerCase().includes(searchTerm) || person.nazwisko.toLowerCase().includes(searchTerm);
    });
  }
  protected selectPerson(id : number) : void {}

  protected openFilterMenu() : void {
    this.showFilter = true;
    const searchTerm : string = this.searchTerm ?? '';
    if (searchTerm.includes(' ') && searchTerm.length > 0) {
      this.filter.imie = searchTerm.charAt(0).toUpperCase() + searchTerm.split(' ')[0].slice(1);
      this.filter.nazwisko = searchTerm.split(' ')[1].charAt(0).toUpperCase() + searchTerm.split(' ')[1].slice(1);
    } else {
      this.filter.imie = searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1);
    }
  }

  protected applyFilter() : void {
    this.showFilter = false;
    this.result = this.persons_zsti!.filter((person: Student): boolean => {
      const imie : string = person.imie.toLowerCase();
      const nazwisko : string = person.nazwisko.toLowerCase();
      const klasa : string = person.klasa.toLowerCase();
      const miasto : boolean = person.miasto;
      return (
        imie.includes(this.filter.imie.toLowerCase()) &&
        nazwisko.includes(this.filter.nazwisko.toLowerCase()) &&
        klasa.includes(this.filter.klasa.toLowerCase()) &&
        (this.filter.miasto === 'true' ? miasto : !miasto) &&
        (this.filter.typ_osoby === 1 ? person.typ_osoby_id === 1 : person.typ_osoby_id !== 1) &&
        (this.filter.uczeszcza === 'true' ? person.uczeszcza : !person.uczeszcza)
      );
    });
    if(this.filter.imie !== '' || this.filter.nazwisko !== '')
      this.searchTerm = (this.filter.imie + ' ' + this.filter.nazwisko).trim();
  }
}
