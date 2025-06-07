import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormatService',
  standalone: false
})
export class DateFormatPipe implements PipeTransform {
  transform(value: Date, format: 'toDate' | 'toTime'): string {
    let date = new Date(value);
    const offsetMinutes = date.getTimezoneOffset(); // e.g., -120 for CEST
    date = new Date(date.getTime() + offsetMinutes * 60 * 1000);

    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }

    switch (format) {
      case 'toDate':
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
      case 'toTime':
        return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      default:
        return date.toString();
    }
  }
}
