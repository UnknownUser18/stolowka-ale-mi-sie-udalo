import { Component, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PersonsService, ZPerson } from '../../services/database/persons.service';
import { FormCreatorService } from '../../services/form-creator.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faArrowsRotate, faArrowUpWideShort, faCircle, faFilter, faMagnifyingGlass, faPlus, faWarning } from '@fortawesome/free-solid-svg-icons';
import { NotificationsService } from '../../services/notifications.service';


@Component({
  selector : 'app-zsti',
  imports : [
    FormsModule,
    ReactiveFormsModule,
    FaIconComponent,
  ],
  templateUrl : './zsti.component.html',
  styleUrl : './zsti.component.scss'
})
export class ZstiComponent {

  protected readonly isRefreshing = signal(false);

  protected readonly faMagnifyingGlass = faMagnifyingGlass;
  protected readonly faFilter = faFilter;
  protected readonly faPlus = faPlus;
  protected readonly faArrowUpWideShort = faArrowUpWideShort;
  protected readonly faArrowsRotate = faArrowsRotate;
  protected readonly faCircle = faCircle;
  protected readonly faWarning = faWarning;

  protected search = '';
  protected shownZPersons : ZPerson[] | null | undefined;
  private ZPersons : ZPerson[] | null = [];

  protected formGroup : FormGroup = new FormGroup({});


  constructor(
    private personS : PersonsService,
    private formS : FormCreatorService,
    private notificatiosnS : NotificationsService) {
    this.requestPersons();

    this.formGroup = new FormGroup({
    });
  }


  protected isTeacher(person : ZPerson) : boolean {
    return this.personS.isTeacher(person);
  }

  protected requestPersons() {
    this.shownZPersons = undefined;
    this.isRefreshing.set(true);

    this.personS.getZPersons().subscribe((persons : ZPerson[] | null) => {
      this.ZPersons = persons;
      this.shownZPersons = this.ZPersons;

      this.isRefreshing.set(false);

      if (!persons)
        this.notificatiosnS.createErrorNotification('Nie udało się pobrać listy osób.', 10);
      else if (persons.length === 0)
        this.notificatiosnS.createWarningNotification('Brak osób w bazie danych.', 10);
      else
        this.notificatiosnS.createSuccessNotification('Pobrano listę osób z serwera.', 2);
    });
  }

  protected osobString(number : number) : string {
    if (number === 0) return 'osób.';
    else if (number === 1) return 'osoba.';
    else if (number > 1 && number < 5) return 'osoby.';
    else return 'osób.';
  }

  protected filterZPersons() : void {
    if (!this.ZPersons) return;

    if (this.search === '') {
      this.shownZPersons = this.ZPersons;
      return;
    }

    const search = this.search;
    let imie, nazwisko;
    const split = search.split(' ');

    if (split.length > 1) {
      nazwisko = split[0]
      imie = split[1];
    } else {
      imie = search;
      nazwisko = search;
    }
    this.shownZPersons = this.ZPersons.filter(person => {
      const { imie : imieP, nazwisko : nazwiskoP } = person;
      return (imieP.toLowerCase().includes(imie.toLowerCase()) || nazwiskoP.toLowerCase().includes(nazwisko.toLowerCase()));
    })
  }

}
