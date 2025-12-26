import { Component, input, OnInit, signal } from '@angular/core';
import { CNotification, Notifications } from '@services/notifications';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCheck, faInfinity, faInfo, faWarning, faXmark } from '@fortawesome/free-solid-svg-icons';
import { DatePipe } from '@angular/common';
import { Tooltip } from '@utils/tooltip/tooltip';
import { TooltipTriggerDirective } from '@directives/tooltip/tooltip-trigger.directive';
import { TooltipDelayTriggerDirective } from "@directives/delayTooltip/tooltip-delay-trigger.directive";

@Component({
  selector : 'app-notification',
  imports : [
    FaIconComponent,
    DatePipe,
    Tooltip,
    TooltipTriggerDirective,
    TooltipDelayTriggerDirective
  ],
  templateUrl : './notification.html',
  styleUrl : './notification.scss',
  host : {
    "[attr.role]" : "'alert'",
    "[class.info]" : "notification()?.type === 'info'",
    "[class.success]" : "notification()?.type === 'success'",
    "[class.error]" : "notification()?.type === 'error'",
    "[class.warning]" : "notification()?.type === 'warning'",
  }
})
export class Notification implements OnInit {
  protected timeLeft = signal(0);

  protected readonly icons = {
    faInfo,
    faCheck,
    faWarning,
    faXmark,
    faInfinity
  };
  protected readonly Infinity = Infinity;

  public notification = input<CNotification>();


  constructor(private notificationS : Notifications) {
  }

  protected formatDate(date : number) {
    if (date < 0) return "0.0s"
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
    setInterval(() => {
      this.timeLeft.set(this.notification()?.duration! - (Date.now() - this.notification()?.timestamp!.getTime()!));
    }, 100)

    if (this.notification()?.duration === Infinity)
      return;

    setTimeout(() => {
      this.dismiss();
    }, this.notification()?.duration)
  }

  protected dismiss() {
    this.notificationS.dismissNotification(this.notification()?.id!);
  }
}
