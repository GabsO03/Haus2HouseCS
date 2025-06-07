import { Component } from '@angular/core';
import { AlertService, AlertMessage } from '../../services/alert.service';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'shared-alert',
  templateUrl: './alert.component.html',
  standalone: false,
  styles: [`
    .alert {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      max-width: 400px;
    }
  `],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('2000ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('2000ms ease-in', style({ opacity: 0, transform: 'translateY(-20px)' }))
      ])
    ])
  ]
})
export class AlertComponent {
  alert: AlertMessage | null = null;

  constructor(private alertService: AlertService) {
    this.alertService.alert$.subscribe(alert => {
      this.alert = alert;
    });
  }

  get alertClasses(): string {
    if (!this.alert) return '';
    switch (this.alert.type) {
      case 'success':
        return 'bg-green-100 border-green-500 text-green-700';
      case 'error':
        return 'bg-red-100 border-red-500 text-red-700';
      case 'info':
        return 'bg-blue-100 border-blue-500 text-blue-700';
      default:
        return '';
    }
  }
}