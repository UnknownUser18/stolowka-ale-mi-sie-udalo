import { Component, signal } from '@angular/core';
import { NavigationCancel, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { CNotification, Notifications } from '@services/notifications';
import { Notification } from '@utils/notification/notification';
import { Info } from '@services/info';
import { faEllipsis, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { Persons } from "@database/persons/persons";
import { filter } from "rxjs";

@Component({
  selector : 'app-root',
  imports     : [RouterOutlet, Notification, FaIconComponent],
  templateUrl : './app.html',
  styleUrl    : './app.scss'
})
export class App {
  protected readonly notifications = signal<CNotification[]>([]);
  protected notificationsQueueLength = 0;

  protected readonly faEllipsis = faEllipsis;
  protected readonly faTrash = faTrash;

  constructor(
    private notificationsS : Notifications,
    private infoS : Info,
    private personS : Persons,
    private router : Router
  ) {
    this.infoS.getHealth.subscribe(health => {
      if (health !== 'OK')
        this.notificationsS.createErrorNotification('Błąd połączenia z serwerem. Większość funkcji może być niedostępna.', Infinity, 'Nie udało się nawiązać połączenie z serwerem. Większość funkcji może być niedostępna. Sprawdź połączenie z internetem lub skontaktuj się z administratorem.');
      else
        this.notificationsS.createSuccessNotification('Pomyślnie połączono z serwerem.', 3);
    });

    this.notificationsS.getVisibleNotifications.subscribe(notifications => {
      this.notifications.set(notifications);
    });

    this.notificationsS.getQueueNotifications.subscribe(notifications => {
      this.notificationsQueueLength = notifications.length;
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd || event instanceof NavigationCancel)
    ).subscribe(() => {
      if (this.router.url.startsWith('/osob')) return;

      this.personS.deselectPerson();
    });
  }

  protected dismissNotification(id : string) {
    this.notificationsS.dismissNotification(id);
  }

  protected clearNotifications() {
    this.notificationsS.clearNotifications();
  }
}
