import { Component, signal } from '@angular/core';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { NgOptimizedImage } from "@angular/common";
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from "@angular/router";
import { faArrowLeft, faArrowRotateRight, faWarning } from '@fortawesome/free-solid-svg-icons';
import { filter, map } from 'rxjs';
import { HomeNavComponent } from '../nav-sidebar/home-nav/home-nav.component';
import { OsobyNavComponent } from '../nav-sidebar/osoby-nav/osoby-nav.component';
import { InfoService } from '@services/info.service';
import { NotificationsService } from '@services/notifications.service';

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

  protected readonly isLoading = signal(false);
  protected readonly nav_label = signal('Nawigacja');
  protected readonly imageError = signal(false);
  protected readonly isNotInRoot = signal(false);
  protected readonly sidebarLoaded = signal<SidebarData>('')
  protected readonly previousUrl = signal<string | null>(null);

  protected readonly faArrowRotateRight = faArrowRotateRight;
  protected readonly faWarning = faWarning;
  protected readonly faArrowLeft = faArrowLeft;


  constructor(private router : Router,
              private activatedRoute : ActivatedRoute,
              private notificationsS : NotificationsService,
              protected infoS : InfoService) {
    const mapRoutes = new Map<RegExp, string>([
      [/^osoby(\/.*)?$/, 'Osoby'],
      [/^osoba(\/.*)?$/, 'Osoby'],
      [/^$/, 'Strona główna']
    ]);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map((event => event.urlAfterRedirects.split('/').filter(Boolean))),
    ).subscribe((urlSegments) => {
      let route = this.activatedRoute;
      let sidebarData : SidebarData = '';
      while (route.firstChild) {
        route = route.firstChild;
        if (route.snapshot.data["sidebar"] !== undefined) {
          sidebarData = route.snapshot.data["sidebar"] as SidebarData;
        }
      }
      this.sidebarLoaded.set(sidebarData);
      if (urlSegments.length === 0) {
        this.previousUrl.set('/');
        this.isNotInRoot.set(false);
        this.nav_label.set('Nawigacja');
        return;
      }
      let previousPath = urlSegments.length > 1
        ? '/' + urlSegments.slice(0, -1).join('/')
        : '/';


      if (!isNaN(parseInt(previousPath[previousPath.length - 1]))) { // if last segment is a number (usually an ID from user)
        previousPath = '/osoby';
      }

      this.previousUrl.set(previousPath);
      this.isNotInRoot.set(true);
      const matchedRoute = Array.from(mapRoutes.entries()).find(([regex]) => regex.test(urlSegments[0]));
      const routeSelect = matchedRoute ? matchedRoute[1] : urlSegments[0];
      this.nav_label.set(`Nawigacja - ${ routeSelect }` || 'Nawigacja');
    });
  }


  protected getHealth() {
    this.isLoading.set(true);
    this.infoS.getHealth.subscribe(health => {
      this.isLoading.set(false);
      if (health !== 'OK')
        this.notificationsS.createErrorNotification('Błąd połączenia z serwerem. Większość funkcji może być niedostępna.', Infinity);
      else
        this.notificationsS.createSuccessNotification('Pomyślnie połączono z serwerem.', 3);
    });
  }

}
