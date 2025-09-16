import { Component } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCalendar, faCircleInfo, faGear, faLock, faMoneyBills, faTableColumns, faUser } from '@fortawesome/free-solid-svg-icons';
import { RouterLink } from '@angular/router';
import { DialogComponent } from '@tooltips/dialog/dialog.component';
import { DialogTriggerDirective } from '@tooltips/dialog-trigger.directive';

@Component({
  selector: 'app-home-nav',
  imports : [
    FaIconComponent,
    RouterLink,
    DialogComponent,
    DialogTriggerDirective
  ],
  templateUrl: './home-nav.component.html',
  styleUrls: ['../nav.scss', 'home-nav.component.scss'],
})
export class HomeNavComponent {

  protected readonly faUser = faUser;
  protected readonly faTableColumns = faTableColumns;
  protected readonly faMoneyBills = faMoneyBills;
  protected readonly faCalendar = faCalendar;
  protected readonly faLock = faLock;
  protected readonly faGear = faGear;
  protected readonly faCircleInfo = faCircleInfo;
}
