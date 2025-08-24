import { Component, input, OnInit, output, signal } from '@angular/core';
import { CNotification } from '../services/notifications.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCheck, faInfinity, faInfo, faWarning, faXmark } from '@fortawesome/free-solid-svg-icons';
import { DatePipe } from '@angular/common';

@Component({
  selector : 'app-notification',
  imports : [
    FaIconComponent,
    DatePipe
  ],
  templateUrl : './notification.component.html',
  styleUrl : './notification.component.scss',
  host : {
    "[attr.role]" : "'alert'",
    "[class.info]" : "notification()?.type === 'info'",
    "[class.success]" : "notification()?.type === 'success'",
    "[class.error]" : "notification()?.type === 'error'",
    "[class.warning]" : "notification()?.type === 'warning'",
    "[class.fade-out]" : "isClosing()",
    "[class.fade-in]" : "isOpening()"
  }
})
export class NotificationComponent implements OnInit {


  protected isOpening = signal(false);
  protected isClosing = signal(false);
  protected timeLeft = signal(0);

  protected readonly Infinity = Infinity;
  protected readonly faInfo = faInfo;
  protected readonly faCheck = faCheck;
  protected readonly faWarning = faWarning;
  protected readonly faXmark = faXmark
  protected readonly faInfinity = faInfinity;


  public notification = input<CNotification>();
  public dismiss = output();


  constructor() {
  }

  protected formatDate(date : number) {
    if (date > 3600000)
      return "> 1h";
    else if (date > 60000) {
      const minutes = Math.floor((date / 1000 / 60) % 60);
      const seconds = Math.floor((date / 1000) % 60);
      return `${ minutes }m ${ seconds }s`;
    }

    const seconds = Math.floor((date / 1000) % 60);
    const miliseconds = Math.floor((date % 1000) / 100);
    return `${ seconds }.${ miliseconds }s`;
  }

  public ngOnInit() {
    this.isOpening.set(true);

    setInterval(() => {
      this.timeLeft.set(this.notification()?.duration! - (Date.now() - this.notification()?.timestamp.getTime()!));
    }, 100)

    if (this.notification()?.duration === Infinity)
      return;

    setTimeout(() => {
      this.isClosing.set(true);
    }, this.notification()?.duration)
  }

}
