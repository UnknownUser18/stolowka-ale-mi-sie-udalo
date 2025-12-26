import { Component, effect, signal } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faGraduationCap, faRefresh, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Router, RouterLink } from '@angular/router';
import { Persons, ZPerson } from '@database/persons/persons';
import { LastPersons } from "@services/last-persons";
import { Notifications } from "@services/notifications";

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

  protected personsZ : ZPerson[] = [];
  protected readonly ZheaderFocused = signal(false);

  constructor(
    private notificationsS : Notifications,
    private router : Router,
    private lastPersonsS : LastPersons,
    protected userS : Persons) {
    effect(() => {
      const cashedZPersons = this.lastPersonsS.ZPersonsIDs();
      if (cashedZPersons.length === 0) {
        this.personsZ = [];
        return;
      }

      this.userS.getZPersonsData(...cashedZPersons).subscribe((persons : ZPerson[] | null) => {
        if (!(persons && persons.length > 0)) {
          this.personsZ = [];
          return;
        }

        this.personsZ = persons.sort((a, b) => {
          return cashedZPersons.indexOf(a.id) - cashedZPersons.indexOf(b.id);
        });
      });
    });


    const localStorageZPersons = this.lastPersonsS.getLastZPersonsList;
    if (localStorageZPersons.length === 0)
      return;

    this.userS.getZPersonsData(...localStorageZPersons).subscribe((persons : ZPerson[] | null) => {
      if (!(persons && persons.length > 0)) return;

      this.personsZ = persons;
      this.notificationsS.createInfoNotification('Pobrano listę osób z pamięci podręcznej.', 3);
    });
  }

  protected selectPerson(person : ZPerson) : void {
    this.lastPersonsS.pushZPerson(person.id);
    this.userS.selectZPerson(person);
    this.router.navigate(['/osoba/zsti', person.id]).then();
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
