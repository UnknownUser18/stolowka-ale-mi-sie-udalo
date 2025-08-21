import { Component, signal, WritableSignal } from '@angular/core';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { NgOptimizedImage } from "@angular/common";
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from "@angular/router";
import { faArrowLeft, faWarning } from '@fortawesome/free-solid-svg-icons';
import { filter, map } from 'rxjs';
import { HomeNavComponent } from '../nav-sidebar/home-nav/home-nav.component';
import { OsobyNavComponent } from '../nav-sidebar/osoby-nav/osoby-nav.component';

type SidebarData = 'home-nav' | 'osoby-nav' | '';

@Component({
  selector : 'app-sidebar',
  imports : [
    FaIconComponent,
    NgOptimizedImage,
    RouterLink,
    HomeNavComponent,
    OsobyNavComponent
  ],
  templateUrl : './sidebar.component.html',
  styleUrl : './sidebar.component.scss',
  host : {
    role : 'navigation',
    '[attr.aria-label]' : 'nav_label()',
  }
})
export class SidebarComponent {
  private currentUrl : string | null = null;

  protected readonly nav_label = signal('Nawigacja');
  protected readonly imageError = signal(false);
  protected readonly isNotInRoot = signal(false);
  protected readonly sidebarLoaded : WritableSignal<SidebarData> = signal('')
  protected readonly previousUrl = signal<string | null>(null);

  protected readonly faWarning = faWarning;
  protected readonly faArrowLeft = faArrowLeft;


  constructor(private router : Router, private activatedRoute : ActivatedRoute) {
    const mapRoutes = new Map([
      ['osoby', 'Osób'],
      ['osoby/zsti', 'Osób ZSTI'],
    ]);
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map((event => (event as NavigationEnd).urlAfterRedirects.split('/').filter(Boolean))),
    ).subscribe((urlSegments) => {
      let route = this.activatedRoute;
      while (route.firstChild)
        route = route.firstChild;
      const sidebarData = route.snapshot.data["sidebar"] as SidebarData;
      if (sidebarData)
        this.sidebarLoaded.set(sidebarData);
      if (!urlSegments[0]) {
        this.isNotInRoot.set(false);
        this.nav_label.set('Nawigacja');
        return;
      }
      this.isNotInRoot.set(true);
      this.nav_label.set(`Nawigacja - ${ mapRoutes.get(urlSegments[0]) }` || 'Nawigacja');
    });

    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event) => {
      this.previousUrl.set(this.currentUrl);
      this.currentUrl = event.urlAfterRedirects;
    });
  }
}
