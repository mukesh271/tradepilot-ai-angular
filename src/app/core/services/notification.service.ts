import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private nextId = 1;

  readonly notifications$: Observable<Notification[]> = this.notificationsSubject.asObservable();

  show(type: NotificationType, message: string): void {
    const item: Notification = { id: this.nextId++, type, message };
    const current = this.notificationsSubject.value;
    this.notificationsSubject.next([...current, item]);
    setTimeout(() => this.remove(item.id), 4000);
  }

  success(message: string): void { this.show('success', message); }
  error(message: string): void { this.show('error', message); }
  warning(message: string): void { this.show('warning', message); }
  info(message: string): void { this.show('info', message); }

  remove(id: number): void {
    const next = this.notificationsSubject.value.filter((notification) => notification.id !== id);
    this.notificationsSubject.next(next);
  }
}
