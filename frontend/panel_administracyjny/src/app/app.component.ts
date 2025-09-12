import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CNotification, NotificationsService } from '@services/notifications.service';
import { NotificationComponent } from './notification/notification.component';
import { InfoService } from '@services/info.service';
import { faEllipsis, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
  selector : 'app-root',
  imports : [RouterOutlet, NotificationComponent, FaIconComponent],
  templateUrl : './app.component.html',
  styleUrl : './app.component.scss'
})
export class AppComponent {
  protected notifications : CNotification[] = [];
  protected notificationsQueueLength = 0;

  protected readonly faEllipsis = faEllipsis;
  protected readonly faTrash = faTrash;

  constructor(private notificationsS : NotificationsService, private infoS : InfoService) {
    this.infoS.getHealth.subscribe(health => {
      if (health !== 'OK')
        this.notificationsS.createErrorNotification('Błąd połączenia z serwerem. Większość funkcji może być niedostępna.', Infinity, 'Nie udało się nawiązać połączenie z serwerem. Większość funkcji może być niedostępna. Sprawdź połączenie z internetem lub skontaktuj się z administratorem.');
      else
        this.notificationsS.createSuccessNotification('Pomyślnie połączono z serwerem.', 3);
    });

    this.notificationsS.getVisibleNotifications.subscribe(notifications => {
      this.notifications = notifications;
    });

    this.notificationsS.getQueueNotifications.subscribe(notifications => {
      this.notificationsQueueLength = notifications.length;
    });
  }

  protected dismissNotification(id : string) {
    this.notificationsS.dismissNotification(id);
  }

  protected clearNotifications() {
    this.notificationsS.clearNotifications();
  }
}
