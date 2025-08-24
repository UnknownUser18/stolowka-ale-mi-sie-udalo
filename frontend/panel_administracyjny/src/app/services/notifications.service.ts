import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

type NotificationType = 'success' | 'error' | 'info' | 'warning';


export class CNotification { // CNotification to avoid name conflict with HTML Notification
  public id : string;
  public message : string;
  public type : NotificationType;
  public duration : number;
  public timestamp : Date;

  constructor(message : string, type : NotificationType, duration? : number) {
    this.id = uuidv4();
    this.message = message;
    this.type = type;
    this.duration = duration ?? 5000; // default duration 5 seconds
    this.timestamp = new Date();
  }
}

@Injectable({
  providedIn : 'root'
})
export class NotificationsService {

  private queue : CNotification[] = [];
  private visible : CNotification[] = [];
  private visibleSubject = new BehaviorSubject<CNotification[]>([]);
  private maxVisible = 3;

  constructor() {
  }

  private showNext() {
    while (this.visible.length < this.maxVisible && this.queue.length > 0) {
      const notification = this.queue.shift();
      if (!notification) continue;
      this.visible.push(notification);
      this.visibleSubject.next([...this.visible]);
    }
  }

  private createNotification(message : string, type : NotificationType, duration? : number) : void {
    const notification = new CNotification(message, type, duration);
    this.queue.push(notification);
    this.showNext();
  }

  public createInfoNotification(message : string, duration? : number) : void {
    this.createNotification(message, 'info', duration);
  }

  public createSuccessNotification(message : string, duration? : number) : void {
    this.createNotification(message, 'success', duration);
  }

  public createErrorNotification(message : string, duration? : number) : void {
    this.createNotification(message, 'error', duration);
  }

  public createWarningNotification(message : string, duration? : number) : void {
    this.createNotification(message, 'warning', duration);
  }

  public getNotifications() : Observable<CNotification[]> {
    return this.visibleSubject.asObservable();
  }

  public dismissNotification(id : string) : void {
    this.visible = this.visible.filter(n => n.id !== id);
    this.visibleSubject.next([...this.visible]);
    this.showNext();
  }
}
