import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Student, WebSocketStatus, DataService } from './data.service';

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
  constructor(private database : DataService) {
    this.webSocketStatus.subscribe((status) => {
      if (status !== WebSocketStatus.OPEN) return;

      const lastUser = localStorage.getItem('activeUser');
      if (!lastUser) return;
      this.database.request('zsti.student.getById', { id : parseInt(lastUser) }, 'studentList').then((payload) : void => {
        if (!payload || payload.length === 0) return;
        this.setActiveUser(payload[0]);
      });
    });
  }

  private numberOfNotifications : number = 0;


  public title : BehaviorSubject<string> = new BehaviorSubject<string>('Strona Główna');
  public webSocketStatus : BehaviorSubject<WebSocketStatus> = new BehaviorSubject<WebSocketStatus>(WebSocketStatus.CLOSED);
  public activeUser : BehaviorSubject<Student | undefined> = new BehaviorSubject<Student | undefined>(undefined);
  public activeTab : BehaviorSubject<TabTypeKey | undefined> = new BehaviorSubject<TabTypeKey | undefined>(undefined);
  public activeMonth : BehaviorSubject<Date | undefined> = new BehaviorSubject<Date | undefined>(undefined);
  public selectedDays = {
    added : [] as Date[],
    removed : [] as Date[]
  }

  public generateNotification(type : NotificationType, message : string) : void {
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
    if (this.numberOfNotifications >= 5) {
      const notifications = document.querySelectorAll('.notification');
      notifications[0].remove();
      this.numberOfNotifications--;
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
      notification.addEventListener('transitionend', () : void => {
        notification.remove();
      });
    }, 5000);
  }

  public setTitle(title : string) : void {
    this.title.next(title);
  }

  public setActiveUser(student : Student) : void {
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
