import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Student } from './data.service';

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
export class GlobalInfoService {
  constructor() { }
  public title : BehaviorSubject<string> = new BehaviorSubject<string>('Strona Główna');
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
}
