import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

type NotificationType = 'success' | 'error' | 'info' | 'warning';


export class CNotification { // CNotification to avoid name conflict with HTML Notification
  public id : string;
  public message : string;
  public detailedMessage : string;
  public type : NotificationType;
  public duration : number;
  public timestamp : Date | null;

  constructor(message : string, type : NotificationType, detailedMessage? : string, duration? : number) {
    this.id = uuidv4();
    this.message = message;
    this.type = type;
    this.detailedMessage = detailedMessage ?? message;
    this.duration = duration ?? 5000; // default duration 5 seconds
    this.timestamp = null;
  }
}

@Injectable({
  providedIn : 'root'
})
export class NotificationsService {

  private queue : CNotification[] = [];
  private queueSubject = new BehaviorSubject<CNotification[]>([]);
  private visible : CNotification[] = [];
  private visibleSubject = new BehaviorSubject<CNotification[]>([]);
  private maxVisible = 3;

  constructor() {
  }

  private showNext() {
    while (this.visible.length < this.maxVisible && this.queue.length > 0) {
      const notification = this.queue.shift();
      if (!notification) continue;
      notification.timestamp = new Date();
      this.visible.push(notification);
      this.visibleSubject.next([...this.visible]);
      this.queueSubject.next([...this.queue]);
    }
  }

  private createNotification(message : string, type : NotificationType, detailedMessage? : string, duration? : number) : void {
    const notification = new CNotification(message, type, detailedMessage, duration !== undefined ? duration * 1000 : undefined);
    this.queue.push(notification);
    this.queueSubject.next([...this.queue]);
    this.showNext();
  }

  public createInfoNotification(message : string, duration? : number, detailedMessage? : string) : void {
    this.createNotification(message, 'info', detailedMessage, duration);
  }

  public createSuccessNotification(message : string, duration? : number, detailedMessage? : string) : void {
    this.createNotification(message, 'success', detailedMessage, duration);
  }

  public createErrorNotification(message : string, duration? : number, detailedMessage? : string) : void {
    this.createNotification(message, 'error', detailedMessage, duration);
  }

  public createWarningNotification(message : string, duration? : number, detailedMessage? : string) : void {
    this.createNotification(message, 'warning', detailedMessage, duration);
  }

  get getVisibleNotifications() : Observable<CNotification[]> {
    return this.visibleSubject.asObservable();
  }

  get getQueueNotifications() : Observable<CNotification[]> {
    return this.queueSubject.asObservable();
  }

  public dismissNotification(id : string) : void {
    this.visible = this.visible.filter(n => n.id !== id);
    this.visibleSubject.next([...this.visible]);
    this.showNext();
  }

  public clearNotifications() {
    this.queue = [];
    this.queueSubject.next([...this.queue]);
    this.visible = [];
    this.visibleSubject.next([...this.visible]);
  }
}
