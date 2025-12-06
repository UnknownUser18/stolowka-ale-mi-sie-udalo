import { Component } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCalendar, faGear, faLock, faMoneyBills, faTableColumns, faUser } from '@fortawesome/free-solid-svg-icons';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-nav',
  imports : [
    FaIconComponent,
    RouterLink
  ],
  templateUrl : './home-nav.html',
  styleUrl: '../nav.scss',
})
export class HomeNav {

  protected readonly faUser = faUser;
  protected readonly faTableColumns = faTableColumns;
  protected readonly faMoneyBills = faMoneyBills;
  protected readonly faCalendar = faCalendar;
  protected readonly faLock = faLock;
  protected readonly faGear = faGear;
}
