import { Component, Inject, PLATFORM_ID, signal } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faGraduationCap, faRefresh, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Router, RouterLink } from '@angular/router';
import { PersonsService, TypOsoby, ZPerson } from '../../services/database/persons.service';
import { isPlatformBrowser } from '@angular/common';

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
    private router : Router) {

    if (isPlatformBrowser(this.platform)) {
      const sessionPersons = sessionStorage.getItem('persons');
      if (sessionPersons) {
        this.personsZ = JSON.parse(sessionPersons) as ZPerson[];
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
    this.userS.getZPersons().subscribe((persons : ZPerson[] | null) => {
      this.loadingPersonsZ.set(false);
      this.personsZ = persons;
      if (isPlatformBrowser(this.platform) && persons)
        sessionStorage.setItem('persons', JSON.stringify(persons));
    });
  }

  protected isTeacher(person : ZPerson) : boolean {
    return person.typ_osoby_id === TypOsoby.NAUCZYCIEL;
  }

  protected deselectPerson() {
    this.userS.deselectPerson();
    this.selectedZPerson.set(null);
    if (this.router.url !== '/osoby')
      this.router.navigate(['/osoby']).then();
  }
}
