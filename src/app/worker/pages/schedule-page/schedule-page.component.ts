import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';
import { WorkerService } from '../../services/worker.service';
import { Availability } from '../../interfaces/worker.interface';
import { ActivatedRoute } from '@angular/router';
import { delay, switchMap } from 'rxjs';


@Component({
  selector: 'worker-schedule-page',
  standalone: false,
  templateUrl: './schedule-page.component.html'
})
export class SchedulePageComponent implements OnInit {
  public weeklySchedule: Availability[] = [];
  public selfProfile: boolean = false;
  public isLoading = true;
  public daysOfWeek = [
    { name: 'Lunes', index: 0, color: 'bg-blue-500' },
    { name: 'Martes', index: 1, color: 'bg-green-500' },
    { name: 'Miércoles', index: 2, color: 'bg-yellow-500' },
    { name: 'Jueves', index: 3, color: 'bg-purple-500' },
    { name: 'Viernes', index: 4, color: 'bg-pink-500' },
    { name: 'Sábado', index: 5, color: 'bg-teal-500' },
    { name: 'Domingo', index: 6, color: 'bg-red-500' }
  ];
  public day_hours = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5];

  constructor(
    private workerService: WorkerService,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {

    this.activatedRoute.params
      .pipe(
        delay(800),
        switchMap(({ id }) => {
          // Determinamos si es el perfil propio (selfProfile)
          const token = localStorage.getItem('token');
          let idBuscar = id;
          if (!id || (id == token)) {
            this.selfProfile = true;
            idBuscar = token;
          }
  
          return this.workerService.getWorkerHorario(idBuscar);
        })
      ).subscribe({
        next: (weeklySchedule) => {
          this.weeklySchedule = weeklySchedule;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error al cargar el horario:', err);
          this.isLoading = false;
        }
      });
  }

  isHourAvailable(dayIndex: number, hourNum: number): boolean {
    if (!this.weeklySchedule || this.weeklySchedule.length == 0) return false;
    const daySchedule = this.weeklySchedule.find(schedule_day => schedule_day.dia === dayIndex);
    if (!daySchedule || !daySchedule.horas) return false;

    // Chequeamos ambos turnos (horas[0] y horas[1])
    return daySchedule.horas.some(range => {
      if (!range) return false; // Ignoramos null
      const [start, end] = range.split('-').map(time => parseInt(time.split(':')[0]));
      return hourNum >= start && hourNum < end;
    });
  }
  

}