import { Component, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { Persons } from '@database/persons/persons';

@Component({
  selector : 'app-nav',
  imports : [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl : './nav.html',
  styleUrl    : './nav.scss',
  host : {
    '[class.person-selected]' : '!!personS.personZ()'
  }
})
export class Nav {
  protected readonly title = signal<string | null>(null);

  constructor(
    private router : Router,
    private activatedRoute : ActivatedRoute,
    protected personS : Persons
  ) {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      let route = this.activatedRoute;
      while(route.firstChild) {
        route = route.firstChild;
      }
      const title = route.snapshot.data['title'] as string | null;
      if (title)
        this.title.set(title);
    });
  }

}
