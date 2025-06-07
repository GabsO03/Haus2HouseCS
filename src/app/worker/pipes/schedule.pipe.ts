import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'scheduleFormat',
  standalone: false
})
export class SchedulePipe implements PipeTransform {

  transform(horas: ( string | null )[]): unknown {
    if (horas[0] && horas[1]) {
      return `${horas[0]}, ${horas[1]}`;
    }
    else if(horas[0] || horas[1]) {
      return `${horas[0] ? horas[0] : ''} ${horas[1] ? horas[1] : ''}`;
    }
    return 'Día libre';
  }

}
