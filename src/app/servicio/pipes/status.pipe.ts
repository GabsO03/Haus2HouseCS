import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'estado',
  standalone: false
})
export class StatusPipe implements PipeTransform {
  transform(value: string): string {
    switch (value) {
      case 'assigned':
        return 'Asignado';
      case 'accepted':
        return 'Aceptado';
      case 'in_progress':
        return 'En Progreso';
      case 'completed':
        return 'Completado';
      case 'cancelled':
        return 'Cancelado';
      case 'rejected':
        return 'Rechazado';
      default:
        return 'Desconocido';
    }
  }
}
