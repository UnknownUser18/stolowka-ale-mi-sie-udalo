import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Student, WebSocketStatus, Opiekun } from './data.service';
import { VariablesService } from './variables.service';
import { Router } from '@angular/router';

export enum TabType {
  KALENDARZ = 'kalendarz',
  DANE = 'dane',
  DEKLARACJE = 'deklaracje',
  PLATNOSCI = 'platnosci',
  KARTA = 'karta',
  RAPORT = 'raport',
}

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
}

export type TabTypeKey = keyof typeof TabType;

@Injectable({
  providedIn : 'root'
})
export class GlobalInfoService {
  constructor(private variables : VariablesService, private router : Router) {
    this.variables.waitForWebSocket(this.webSocketStatus).then(() => {

      const lastUser = localStorage.getItem('activeUser');
      if (!lastUser) return;

      this.variables.mapStudentsToOpiekun().then((persons : (Student & Opiekun)[]) => {
        const user = persons.find((p) => p.id === parseInt(lastUser));
        if (!user) return;
        this.setActiveUser(user);
        const url = this.router.url;
        this.router.navigate([url]).then();
      });
    });
  }

  private numberOfNotifications : number = 0;
  private maxNotifications : number = 5; // User can set this to limit the number of notifications displayed at once

  private pendingNotifications : Array<{ type : NotificationType, message : string }> = [];
  public title : BehaviorSubject<string> = new BehaviorSubject<string>('Strona Główna');
  public webSocketStatus : BehaviorSubject<WebSocketStatus> = new BehaviorSubject<WebSocketStatus>(WebSocketStatus.CLOSED);
  public activeUser : BehaviorSubject<(Student & Opiekun) | undefined> = new BehaviorSubject<(Student & Opiekun) | undefined>(undefined);
  public activeTab : BehaviorSubject<TabTypeKey | undefined> = new BehaviorSubject<TabTypeKey | undefined>(undefined);
  public activeMonth : BehaviorSubject<Date | undefined> = new BehaviorSubject<Date | undefined>(undefined);
  public selectedDays = {
    added : [] as Date[],
    removed : [] as Date[]
  }

  public generateNotification(type : NotificationType, message : string) : void {
    if (this.numberOfNotifications >= this.maxNotifications) {
      this.pendingNotifications.push({ type, message });
      return;
    }
    const notification = document.createElement('div')
    notification.classList.add('notification', type);
    const h2 = document.createElement('h2');
    switch (type) {
      case NotificationType.INFO:
        h2.textContent = 'Informacja';
        break;
      case NotificationType.SUCCESS:
        h2.textContent = 'Sukces';
        break;
      case NotificationType.ERROR:
        h2.textContent = 'Błąd';
        break;
      case NotificationType.WARNING:
        h2.textContent = 'Ostrzeżenie';
        break;
      default:
        throw new Error('Nieznany typ powiadomienia');
    }

    const p = document.createElement('p');
    p.textContent = message;
    notification.appendChild(h2);
    notification.appendChild(p);
    document.body.appendChild(notification);
    this.numberOfNotifications++;
    const notifications = Array.from(document.querySelectorAll('.notification'));
    notifications.reverse();
    notifications.forEach((notification, idx) => {
      if (idx === 0) {
        (notification as HTMLElement).style.bottom = '';
      } else {
        const first = notifications[0] as HTMLElement;
        const firstBottom = parseFloat(getComputedStyle(first).bottom);
        (notification as HTMLElement).style.bottom = `${ firstBottom + 120 * idx }px`;
      }
    });
    setTimeout(() : void => {
      notification.classList.add('done');
    }, 100);
    setTimeout(() : void => {
      notification.classList.remove('done');
      this.numberOfNotifications--;
      if (this.pendingNotifications.length > 0) {
        const next = this.pendingNotifications.shift();
        if (!next) return;
        this.generateNotification(next.type, next.message);
      }
    }, 5000);
  }

  public setTitle(title : string) : void {
    this.title.next(title);
  }

  public setActiveUser(student : Student & Opiekun | undefined) : void {
    if (student)
      localStorage.setItem('activeUser', student.id.toString());
    this.activeUser.next(student);
  }

  public setActiveTab(type : TabTypeKey) : void {
    this.activeTab.next(type);
  }

  public setActiveMonth(date : Date) : void {
    this.activeMonth.next(date);
  }

  public setWebSocketStatus(status : WebSocketStatus) : void {
    this.webSocketStatus.next(status);
  }

}
