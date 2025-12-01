import { Component, effect, Inject, PLATFORM_ID, signal } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faGraduationCap, faRefresh, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Router, RouterLink } from '@angular/router';
import { PersonsService, ZPerson } from '@database/persons.service';
import { isPlatformBrowser } from '@angular/common';
import { NotificationsService } from '@services/notifications.service';

@Component({
  selector : 'app-osoby-nav',
  imports : [
    FaIconComponent,
    RouterLink
  ],
  templateUrl : './osoby-nav.component.html',
  styleUrl : './osoby-nav.component.scss',
  host : {
    'aria-label' : 'Nawigacja - Osoby',
    'role' : 'navigation',
  }
})
export class OsobyNavComponent {
  protected personsZ : ZPerson[] | null | undefined;
  protected readonly loadingPersonsZ = signal(false);
  protected readonly ZheaderFocused = signal(false);

  protected readonly faGraduationCap = faGraduationCap;
  protected readonly faTimes = faTimes;
  protected readonly faRefresh = faRefresh;

  constructor(
    @Inject(PLATFORM_ID) private platform : object,
    private notificationsS : NotificationsService,
    private router : Router,
    protected userS : PersonsService) {

    if (isPlatformBrowser(this.platform)) {
      const sessionPersons = sessionStorage.getItem('persons');
      if (sessionPersons) {
        this.personsZ = JSON.parse(sessionPersons) as ZPerson[];
        this.notificationsS.createInfoNotification('Pobrano listę osób z pamięci podręcznej.', 3);
        return;
      }
    }
    this.requestPersonsZ();

    effect(() => {
      if (this.userS.personZ()) {
        const isInList = this.personsZ?.some((p) => p.id === this.userS.personZ()!.id);
        if (isInList)
          this.requestPersonsZ();
      }
    })
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

      if (isPlatformBrowser(this.platform) && persons)
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
