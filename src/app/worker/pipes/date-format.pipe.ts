import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat',
  standalone: false
})
export class DateFormatPipe implements PipeTransform {

  transform(value: string | Date, format: 'toDate' | 'toTime'): string {
    const date = typeof value === 'string' ? new Date(value) : value;

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
