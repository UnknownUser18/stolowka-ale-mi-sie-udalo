import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CNotification, NotificationsService } from './services/notifications.service';
import { NotificationComponent } from './notification/notification.component';
import { InfoService } from './services/info.service';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
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

  constructor(private notificationsS : NotificationsService, private infoS : InfoService) {
    this.infoS.getHealth().subscribe(health => {
      if (health !== 'OK')
        this.notificationsS.createErrorNotification('Błąd połączenia z serwerem. Większość funkcji może być niedostępna.', Infinity);
      else
        this.notificationsS.createSuccessNotification('Pomyślnie połączono z serwerem.', 3);
    });

    this.notificationsS.getVisibleNotifications.subscribe(notifications => {
      this.notifications = notifications;
    });

    this.notificationsS.getQueueNotifications.subscribe(notifications => {
      console.log(notifications);
      this.notificationsQueueLength = notifications.length;
    });
  }

  protected dismissNotification(id : string) {
    this.notificationsS.dismissNotification(id);
  }


}
