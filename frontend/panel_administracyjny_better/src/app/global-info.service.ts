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
export type TabTypeKey = keyof typeof TabType;
@Injectable({
  providedIn: 'root'
})
export class GlobalInfoServices {
  constructor(private database : DataService) {
    this.webSocketStatus.subscribe((status) => {
      if (status !== WebSocketStatus.OPEN) return;
      const lastUser = localStorage.getItem('activeUser');
      console.log(lastUser);
      if (!lastUser) return;
      this.database.request('zsti.student.getById', { id: parseInt(lastUser) }, 'studentList').then((payload): void => {
        if (!payload || payload.length === 0) return;
        this.setActiveUser(payload[0]);
      });
    });
  }
  public title : BehaviorSubject<string> = new BehaviorSubject<string>('Strona Główna');
  public webSocketStatus : BehaviorSubject<WebSocketStatus> = new BehaviorSubject<WebSocketStatus>(WebSocketStatus.CLOSED);
  public activeUser : BehaviorSubject<Student | undefined> = new BehaviorSubject<Student | undefined>(undefined);
  public activeTab : BehaviorSubject<TabTypeKey | undefined> = new BehaviorSubject<TabTypeKey | undefined>(undefined);
  public activeMonth : BehaviorSubject<Date | undefined> = new BehaviorSubject<Date | undefined>(undefined);
  public selectedDays = {
    added: [] as Date[],
    removed: [] as Date[]
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
