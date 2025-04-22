import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalInfoService {
  constructor() { }
  public title : BehaviorSubject<string> = new BehaviorSubject<string>('Strona główna');
  public setTitle(title: string) : void {
    this.title.next(title);
  }
}
