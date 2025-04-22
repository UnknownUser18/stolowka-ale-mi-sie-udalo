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
  constructor(private globalInfoService: GlobalInfoService, private database: DataService) {
    this.globalInfoService.setTitle('ZSTI - Osoby');
    this.database.request('zsti.student.get', {}, 'studentList');
    setTimeout(() : void => {
      this.persons_zsti = this.database.get('studentList');
    }, 1000); // please make this function async 😭😭😭😭😭
  }
  protected getPersonIndex(id : number) : number {
    return this.persons_zsti?.findIndex(item => item.id === id) ?? -1;
  }
  protected filterPersons(event : Event) : void {
    if(event instanceof KeyboardEvent && event.key !== 'Enter') return;
    if (!this.searchTerm) return;
    const searchTerm : string = this.searchTerm.toLowerCase();
    this.persons_zsti = undefined;
    console.log(this.persons_zsti);
    // add filtering to persons_zsti in backend.

  }
  protected selectPerson(id : number) : void {}
}
