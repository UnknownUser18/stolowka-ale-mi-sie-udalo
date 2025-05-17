import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export enum TabType {
  KALENDARZ = 'kalendarz',
  DANE = 'dane',
  DEKLARACJE = 'deklaracje',
  PLATNOSCI = 'platnosci',
}
export type TabTypeKey = keyof typeof TabType;
@Injectable({
  providedIn: 'root'
})
export class GlobalInfoService {
  constructor() { }
  public title : BehaviorSubject<string> = new BehaviorSubject<string>('Strona Główna');
  public activeUser : BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public activeTab : BehaviorSubject<TabTypeKey | undefined> = new BehaviorSubject<TabTypeKey | undefined>(undefined);
  public activeMonth : BehaviorSubject<Date | undefined> = new BehaviorSubject<Date | undefined>(undefined);
  public previousMonth : Date | undefined;
  public selectedDays = {
    added: [] as Date[],
    removed: [] as Date[]
  }
  public setTitle(title : string) : void {
    this.title.next(title);
  }
  public setActiveUser(id : number) : void {
    localStorage.setItem('activeUser', id.toString());
    this.activeUser.next(id);
  }
  public setActiveTab(type : TabTypeKey) : void {
    this.activeTab.next(type);
  }
  public setActiveMonth(date : Date) : void {
    this.previousMonth = this.activeMonth.getValue();
    this.activeMonth.next(date);
  }
}
