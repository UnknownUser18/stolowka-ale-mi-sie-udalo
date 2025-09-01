import { Component, Inject, PLATFORM_ID, signal } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faGraduationCap, faRefresh, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Router, RouterLink } from '@angular/router';
import { PersonsService, ZPerson } from '../../services/database/persons.service';
import { isPlatformBrowser } from '@angular/common';
import { NotificationsService } from '../../services/notifications.service';

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
  protected readonly selectedZPerson = signal<ZPerson | null>(null);
  protected readonly loadingPersonsZ = signal(false);
  protected readonly ZheaderFocused = signal(false);

  protected readonly faGraduationCap = faGraduationCap;
  protected readonly faTimes = faTimes;
  protected readonly faRefresh = faRefresh;

  constructor(
    private userS : PersonsService,
    @Inject(PLATFORM_ID) private platform : object,
    private notificationsS : NotificationsService,
    private router : Router) {

    if (isPlatformBrowser(this.platform)) {
      const sessionPersons = sessionStorage.getItem('persons');
      if (sessionPersons) {
        this.personsZ = JSON.parse(sessionPersons) as ZPerson[];
        this.notificationsS.createInfoNotification('Pobrano listę osób z pamięci podręcznej.', 3);
        return;
      }
    }
    this.requestPersonsZ();
  }

  protected selectPerson(id : number) : void {
    try {
      this.userS.selectPerson(id);
    } catch (error) {
      console.error(error);
      return;
    }
    this.selectedZPerson.set(this.personsZ?.find(p => p.id === id) ?? null);
    // this.router.navigate(['/osoby', id]).then();
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
    this.userS.deselectPerson();
    this.selectedZPerson.set(null);
    if (this.router.url !== '/osoby')
      this.router.navigate(['/osoby']).then();
  }
}
