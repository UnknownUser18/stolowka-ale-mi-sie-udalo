import { Component, effect, inject, PLATFORM_ID, signal } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faGraduationCap, faRefresh, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Router, RouterLink } from '@angular/router';
import { Persons, ZPerson } from '@database/persons/persons';
import { isPlatformBrowser } from '@angular/common';
import { Notifications } from '@services/notifications';

@Component({
  selector : 'app-osoby-nav',
  imports  : [
    FaIconComponent,
    RouterLink
  ],
  templateUrl : './osoby-nav.html',
  styleUrl    : './osoby-nav.scss',
  host     : {
    'aria-label' : 'Nawigacja - Osoby',
    'role' : 'navigation',
  }
})
export class OsobyNav {
  protected readonly icons = {
    faGraduationCap,
    faTimes,
    faRefresh
  };

  protected personsZ : ZPerson[] | null | undefined;
  protected readonly loadingPersonsZ = signal(false);
  protected readonly ZheaderFocused = signal(false);
  private platformId = inject(PLATFORM_ID);

  constructor(
    private notificationsS : Notifications,
    private router : Router,
    protected userS : Persons) {
    effect(() => {
      if (this.userS.personZ()) {
        const isInList = this.personsZ?.some((p) => p.id === this.userS.personZ()!.id);
        if (isInList)
          this.requestPersonsZ();
      }
    });

    if (!isPlatformBrowser(this.platformId)) {
      this.requestPersonsZ();
      return;
    }

    const sessionPersons = sessionStorage.getItem('persons');
    if (!sessionPersons) {
      this.requestPersonsZ();
      return;
    }

    this.personsZ = JSON.parse(sessionPersons) as ZPerson[];
    this.notificationsS.createInfoNotification('Pobrano listę osób z pamięci podręcznej.', 3);
  }

  protected selectPerson(person : ZPerson) : void {
    this.userS.selectZPerson(person);
    this.router.navigate(['/osoba/zsti', person.id]).then();
  }


  protected requestPersonsZ() {
    this.loadingPersonsZ.set(true);

    this.userS.getZPersonsLimit(10).subscribe((persons : ZPerson[] | null) => {
      this.loadingPersonsZ.set(false);
      this.personsZ = persons;

      if (!persons)
        this.notificationsS.createErrorNotification('Nie udało się pobrać listy osób z serwera.', 10);
      else if (persons.length === 0)
        this.notificationsS.createWarningNotification('Brak osób w bazie danych.', 10);
      else
        this.notificationsS.createSuccessNotification('Pobrano listę osób z serwera.', 2);

      if (isPlatformBrowser(this.platformId) && persons)
        sessionStorage.setItem('persons', JSON.stringify(persons));
    });
  }

  protected isTeacher(person : ZPerson) : boolean {
    return this.userS.isTeacher(person);
  }


  protected deselectPerson() {
    this.router.navigate(['/osoby']).then(() => {
      this.userS.deselectPerson();
    });
  }
}
