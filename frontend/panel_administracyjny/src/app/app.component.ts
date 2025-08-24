import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CNotification, NotificationsService } from './services/notifications.service';
import { NotificationComponent } from './notification/notification.component';

@Component({
  selector : 'app-root',
  imports : [RouterOutlet, NotificationComponent],
  templateUrl : './app.component.html',
  styleUrl : './app.component.scss'
})
export class AppComponent {

  protected notifications : CNotification[] = [];

  constructor(private notificationsS : NotificationsService) {
    this.notificationsS.createInfoNotification('blah', Infinity);
    this.notificationsS.createSuccessNotification('blah', 90000000);
    this.notificationsS.createErrorNotification('blah', 90000000);
    this.notificationsS.createWarningNotification('blah', 90000000);
    this.notificationsS.getNotifications().subscribe(notifications => {
      this.notifications = notifications;
    })
  }

  protected dismissNotification(id : string) {
    this.notificationsS.dismissNotification(id);
  }

  protected notificationAnimationEnd(event : AnimationEvent, id : string) {
    console.log(event.animationName)
    if (event.animationName.endsWith('out'))
      this.notificationsS.dismissNotification(id);
    else if (event.animationName.endsWith('in'))
      (event.target as HTMLElement).classList.remove('fade-in');
  }
}
