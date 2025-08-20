import { Component, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { NgOptimizedImage } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faWarning } from '@fortawesome/free-solid-svg-icons';
import { NavComponent } from '../nav/nav.component';
@Component({
  selector : 'app-layout',
  imports : [
    RouterOutlet,
    NgOptimizedImage,
    FaIconComponent,
    NavComponent
  ],
  templateUrl : './layout.component.html',
  styleUrl : './layout.component.scss'
})
export class LayoutComponent {
  protected nav_label = signal('Nawigacja');
  protected imageError = signal(false);
  protected isNotInRoot = signal(false);

  protected readonly faWarning = faWarning;
  protected readonly faArrowLeft = faArrowLeft;

  constructor(private router : Router) {
    const mapRoutes = new Map([
      ['osoby', 'Osób'],
      ['osoby/zsti', 'Osób ZSTI'],
    ]);
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map((event => (event as NavigationEnd).urlAfterRedirects.split('/').filter(Boolean))),
    ).subscribe((urlSegments) => {
      if (!urlSegments[0]) {
        this.nav_label.set('Nawigacja');
        return;
      }
      this.isNotInRoot.set(true);
      this.nav_label.set(`Nawigacja - ${ mapRoutes.get(urlSegments[0]) }` || 'Nawigacja');
    });
  }
}
