import { Component, OnInit } from '@angular/core';
import { Service } from '../../../servicio/interfaces/service.interface';
import { ServicioService } from '../../../servicio/services/servicio.service';
import { Router } from '@angular/router';


interface CalendarDay {
  day: number;
  services: Service[];
  isCurrentMonth: boolean;
}

interface CalendarMonth {
  year: number;
  month: string;
  weeks: CalendarDay[][];
}

@Component({
  selector: 'worker-calendar-page',
  standalone: false,
  templateUrl: './calendar-page.component.html',
  styles: `
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }`
})
export class CalendarPageComponent implements OnInit {
  public schedule: any | null = null;
  public serviceTypes: any[] = [];
  public currentMonth: CalendarMonth | null = null;
  public currentMonthNumber!: number;
  public isLoading = true;
  public canGoBack: boolean = true; // Nueva variable para el botón de retroceder
  public canGoForward: boolean = true; // Nueva variable para el botón de avanzar
  public weekDays = [
    { completo: 'Domingo', short: 'Dom'},
    { completo: 'Lunes', short: 'Lun'},
    { completo: 'Martes', short: 'Mar'},
    { completo: 'Miercoles', short: 'Mier'},
    { completo: 'Jueves', short: 'Jue'},
    { completo: 'Viernes', short: 'Vie'},
    { completo: 'Sábado', short: 'Sáb'}
  ];

  constructor(
    private servicioService: ServicioService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.loadData();
    }
  }

  private loadData(): void {
    this.isLoading = true;
    this.servicioService.pendingServices().subscribe({
      next: (schedule) => {
        this.schedule = schedule;
        this.servicioService.servicesTypes.subscribe({
          next: (types) => {
            this.serviceTypes = types;
            this.generateCalendar();
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
          }
        });
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  private generateCalendar(): void {
    const today = new Date();
    this.currentMonthNumber = today.getMonth();
    this.currentMonth = this.generateMonthCalendar(today.getFullYear(), this.currentMonthNumber);
    this.updateNavigationButtons(); // Actualiza los botones al generar el calendario
  }

  private generateMonthCalendar(year: number, month: number): CalendarMonth {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();

    const weeks: CalendarDay[][] = [];
    let currentWeek: CalendarDay[] = [];
    let dayCounter = 1;

    // Fill initial empty days
    for (let i = 0; i < startDay; i++) {
      currentWeek.push({ day: 0, services: [], isCurrentMonth: false });
    }

    // Fill days of the month
    while (dayCounter <= daysInMonth) {
      const servicesOnDay = this.schedule?.filter((service: Service) => {
        const serviceDate = new Date(service.start_time);
        return (
          serviceDate.getDate() === dayCounter &&
          serviceDate.getMonth() === month &&
          serviceDate.getFullYear() === year
        );
      }) || [];
      currentWeek.push({ day: dayCounter, services: servicesOnDay, isCurrentMonth: true });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      dayCounter++;
    }

    // Fill remaining days
    while (currentWeek.length < 7 && currentWeek.length > 0) {
      currentWeek.push({ day: 0, services: [], isCurrentMonth: false });
    }
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return {
      year,
      month: firstDay.toLocaleString('default', { month: 'long' }),
      weeks
    };
  }

  getServiceTypeName(serviceTypeId: number): string {
    return this.serviceTypes.find((type: any) => type.id === serviceTypeId)?.name || 'Unknown';
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private updateNavigationButtons(): void {
    const today = new Date();
    const minDate = new Date(today.getFullYear(), today.getMonth() - 6, 1);
    const maxDate = new Date(today.getFullYear(), today.getMonth() + 6, 1);
    const currentDate = new Date(this.currentMonth!.year, this.currentMonthNumber, 1);

    this.canGoBack = currentDate > minDate;
    this.canGoForward = currentDate < maxDate;
  }

  changeMonth(offset: number): void {
    if (!this.currentMonth) return;

    // Calcula el nuevo mes sumando el offset al mes actual
    this.currentMonthNumber += offset;

    // Normaliza el mes y el año si es necesario
    const newDate = new Date(this.currentMonth.year, this.currentMonthNumber, 1);

    // Validación: No permitir navegar más de 6 meses hacia atrás o adelante
    const today = new Date();
    const minDate = new Date(today.getFullYear(), today.getMonth() - 6, 1);
    const maxDate = new Date(today.getFullYear(), today.getMonth() + 6, 1);

    if (newDate < minDate || newDate > maxDate) {
      this.currentMonthNumber -= offset; // Revertir el cambio
      return; // No permitir la navegación fuera del rango
    }

    // Actualiza el calendario con el nuevo año y mes
    this.currentMonth = this.generateMonthCalendar(newDate.getFullYear(), newDate.getMonth());

    // Actualiza currentMonthNumber para que coincida con el mes actual
    this.currentMonthNumber = newDate.getMonth();

    // Actualiza el estado de los botones
    this.updateNavigationButtons();
  }

  goToServiceDetail(serviceId: string) {
    this.router.navigate(['/services/' + serviceId]);
  }
}
