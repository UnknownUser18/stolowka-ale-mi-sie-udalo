import { Component, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { PersonsService } from '@database/persons.service';
import { DialogComponent } from "@tooltips/dialog/dialog.component";
import { DialogTriggerDirective } from "@tooltips/dialog-trigger.directive";
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";

@Component({
  selector : 'app-nav',
  imports : [
    RouterLink,
    RouterLinkActive,
    DialogComponent,
    DialogTriggerDirective,
    FaIconComponent,
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

  protected readonly faCircleInfo = faCircleInfo;
}
