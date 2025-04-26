import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalInfoService {
  constructor() { }
  public title : BehaviorSubject<string> = new BehaviorSubject<string>('Strona Główna');
  public activeUser : BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public activeTab : BehaviorSubject<string | undefined> = new BehaviorSubject<string | undefined>(undefined);
  public activeMonth : BehaviorSubject<Date> = new BehaviorSubject<Date>(new Date());
  public setTitle(title : string) : void {
    this.title.next(title);
  }
  public setActiveUser(id : number) : void {
    this.activeUser.next(id);
  }
  public setActiveTab(type : string) : void {
    this.activeTab.next(type);
  }
  public setActiveMonth(date : Date) : void {
    this.activeMonth.next(date);
  }
}
