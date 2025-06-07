import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AlertMessage {
  type: 'success' | 'error' | 'info';
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alertSubject = new BehaviorSubject<AlertMessage | null>(null);
  alert$: Observable<AlertMessage | null> = this.alertSubject.asObservable();

  success(message: string): void {
    this.alertSubject.next({ type: 'success', message });
    this.clearAfterDelay();
  }

  error(message: string): void {
    this.alertSubject.next({ type: 'error', message });
    this.clearAfterDelay();
  }

  info(message: string): void {
    this.alertSubject.next({ type: 'info', message });
    this.clearAfterDelay();
  }

  private clearAfterDelay(): void {
    setTimeout(() => this.alertSubject.next(null), 3000);
  }
}