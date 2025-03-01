import {Component, Output, EventEmitter, ViewChild, AfterViewInit} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, map, startWith } from 'rxjs';
import { NgFor, AsyncPipe} from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import {DataBaseService} from '../data-base.service';

interface User {
  firstName: string;
  lastName: string;
  cardId: number;
}

@Component({
  selector: 'app-auto-complete',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgFor,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatOptionModule,
    AsyncPipe
  ],
  templateUrl: './auto-complete.component.html',
  styleUrls: ['./auto-complete.component.css']
})
export class AutoCompleteComponent implements AfterViewInit  {
  @Output() cardSelected = new EventEmitter<number>();
  @ViewChild('cardInput') cardInput: any;

  constructor(private dataService: DataBaseService) {
    this.dataService.ScanningInfoZsti.asObservable().subscribe(() => this.updateInfo())
    this.onBlur()
    this.dataService.CurrentStudent.subscribe(() => this.onBlur())

  }

  searchControl = new FormControl('');
  users: User[] = [];

  filteredUsers: Observable<User[]> = this.searchControl.valueChanges.pipe(
    startWith(''),
    // @ts-ignore
    map(value => (typeof value === 'string' ? value : this.displayFn(value))),
    map(name => (name ? this.filterUsers(name) : []))
  );



  updateInfo()
  {
    this.users = [];
    if(!this.dataService.ScanningInfoZsti.value) return;
    this.dataService.ScanningInfoZsti.value.forEach((distinctStudent: any) => {
      this.users.push({firstName: distinctStudent.imie, lastName: distinctStudent.nazwisko, cardId: distinctStudent.key_card});
    })

  }

  filterUsers(term: string): User[] {
    const lowerTerm = term.toLowerCase();
    return this.users
      .filter(user =>
        (`${user.firstName} ${user.lastName}`.toLowerCase().includes(lowerTerm) ||
          user.cardId.toString().includes(lowerTerm))
      )
      .sort((a, b) => {
        const aMatch = `${a.firstName} ${a.lastName}`.toLowerCase().includes(lowerTerm);
        const bMatch = `${b.firstName} ${b.lastName}`.toLowerCase().includes(lowerTerm);
        return aMatch === bMatch ? 0 : aMatch ? -1 : 1;
      });
  }

  selectUser(user: User) {
    this.searchControl.setValue(user.cardId.toString());
    this.cardSelected.emit(user.cardId);
    this.searchControl.setValue('');
  }

  displayFn(user: User): string {
    return user ? `${user.firstName} ${user.lastName}` : '';
  }

  onBlur()
  {
    setTimeout(() => this.focusInput(), 100)
  }

  focusInput() {
    this.cardInput.nativeElement.focus();
  }

  ngAfterViewInit() {
    this.focusInput();
  }

}

