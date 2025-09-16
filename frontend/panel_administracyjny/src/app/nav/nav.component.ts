import { Component, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { PersonsService } from '@database/persons.service';
import { DialogComponent } from '@tooltips/dialog/dialog.component';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCircleInfo, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { DialogTriggerDirective } from '@tooltips/dialog-trigger.directive';

@Component({
  selector : 'app-nav',
  imports : [
    RouterLink,
    RouterLinkActive,
    DialogComponent,
    FaIconComponent,
    DialogTriggerDirective
  ],
  templateUrl : './nav.component.html',
  styleUrl : './nav.component.scss',
  host : {
    '[class.person-selected]' : '!!personS.personZ()'
  }
})
export class NavComponent {
  protected readonly title = signal<string | null>(null);

  constructor(
    private router : Router,
    private activatedRoute : ActivatedRoute,
    protected personS : PersonsService
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

  protected readonly faInfoCircle = faInfoCircle;
  protected readonly faCircleInfo = faCircleInfo;
}
