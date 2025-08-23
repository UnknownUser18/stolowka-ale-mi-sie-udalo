import { Component, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector : 'app-nav',
  imports : [
  ],
  templateUrl : './nav.component.html',
  styleUrl : './nav.component.scss',
})
export class NavComponent {
  protected title : WritableSignal<string | null> = signal(null);

  constructor(
    private router : Router,
    private activatedRoute : ActivatedRoute
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
