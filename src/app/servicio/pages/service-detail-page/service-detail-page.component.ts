import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { delay, interval, Subscription, switchMap, takeWhile } from 'rxjs';
import { AuthService } from '../../../auth/services/auth.service';
import { ServicioService } from '../../../servicio/services/servicio.service';
import { Service } from '../../../servicio/interfaces/service.interface';
import { AlertService } from '../../../shared/services/alert.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'service-detail-page',
  standalone: false,
  templateUrl: './service-detail-page.component.html',
})
export class ServiceDetailPageComponent implements OnInit {
  public service?: Service;
  public isLoading = true;
  public userRole!:string;
  public currentTime: Date = new Date();
  private pollingSubscription?: Subscription;

  constructor(
    private servicioService: ServicioService,
    private activatedRoute: ActivatedRoute,
    private alertService: AlertService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.decrypt(localStorage.getItem('r')!);
    this.activatedRoute.params
      .pipe(
        switchMap(({ id }) => {
          if (!id) {
            this.router.navigate(['/']);
            return [];
          }
          return this.servicioService.getService(id);
        })
      )
      .subscribe((service) => {
        this.isLoading = false;

        if (!service) {
          this.router.navigate(['/']);
          return;
        }

        // Verificar si el usuario actual es el cliente o el trabajador del servicio
        const currentUser = this.authService.currentUser;
        if (!currentUser) {
          this.router.navigate(['/']);
          return;
        }

        const isClient = service!.client?.user?.id === currentUser.id;
        const isWorker = service!.worker?.user?.id === currentUser.id;
        const isAdmin = this.authService.currentUser?.rol === 'admin';

        if (!isClient && !isWorker && !isAdmin) {
          this.router.navigate(['/']);
          return;
        }

        this.service = service!;
        this.startServicePolling(service.id);
      });
  }

  ngOnDestroy(): void {
    this.pollingSubscription?.unsubscribe();
  }

  startServicePolling(serviceId: string): void {
    this.pollingSubscription = interval(5000)
      .pipe(
        switchMap(() => this.servicioService.getService(serviceId)),
        takeWhile(
          () => !this.service || !['completed', 'cancelled'].includes(this.service.status),
          true
        )
      )
      .subscribe((updatedService) => {
        if (updatedService) {
          this.service = updatedService;
        }
      });
  }

  goBack(): void {
    const estadosParaHistorial = ['completed', 'cancelled'];
    const ruta = estadosParaHistorial.includes(this.service!.status) ? 'history' : 'list';
    this.router.navigateByUrl('/services/' + ruta);
  }

  changeServiceStatus(status: string): void {
    this.isLoading = true;
    console.log('Cambiando a ', status);

    if (this.service) {
      this.servicioService.updateServiceStatus(this.service.id, status).subscribe({
        next: (updatedService) => {
          this.service = updatedService;
          this.alertService.success(`Servicio actualizado a ${status}`);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error al cambiar el estado del servicio:', err);
          this.alertService.error('Error al actualizar el estado del servicio');
          this.isLoading = false;
        }
      });
    }
  }

  acceptService(): void {
    Swal.fire({
      title: '¿Aceptar servicio?',
      text: '¿Estás seguro de que quieres aceptar este servicio?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#6A64F1',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, aceptar!',
      cancelButtonText: 'No, mantener',
      buttonsStyling: true,
      customClass: {
        confirmButton: 'swal2-confirm btn my-bg-teal button-hover-teal text-white font-semibold py-2 px-4 rounded-md',
        cancelButton: 'swal2-cancel btn bg-red-500 text-white font-semibold py-2 px-4 rounded-md'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.changeServiceStatus('accepted');
        Swal.fire({
          title: '¡Aceptado!',
          text: 'El servicio ha sido aceptado correctamente',
          icon: 'success',
          confirmButtonColor: '#6A64F1',
          customClass: {
            confirmButton: 'swal2-confirm btn my-bg-teal button-hover-teal text-white font-semibold py-2 px-4 rounded-md'
          }
        });
      }
    });
  }

  rejectService(): void {
    Swal.fire({
      title: '¿Rechazar servicio?',
      text: '¿Estás seguro de que quieres rechazar este servicio?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#6A64F1',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, rechazar!',
      cancelButtonText: 'No, mantener',
      buttonsStyling: true,
      customClass: {
        confirmButton: 'swal2-confirm btn my-bg-teal button-hover-teal text-white font-semibold py-2 px-4 rounded-md',
        cancelButton: 'swal2-cancel btn bg-red-500 text-white font-semibold py-2 px-4 rounded-md'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.changeServiceStatus('rejected');
        Swal.fire({
          title: '¡Cancelado!',
          text: 'El servicio ha sido rechazado correctamente',
          icon: 'success',
          confirmButtonColor: '#6A64F1',
          customClass: {
            confirmButton: 'swal2-confirm btn my-bg-teal button-hover-teal text-white font-semibold py-2 px-4 rounded-md'
          }
        });
        this.goBack();
      }
    });
  }

  cancelService(): void {
    const estadoAnterior = this.service?.status;
    Swal.fire({
      title: '¿Cancelar servicio?',
      text: '¿Estás seguro de que quieres cancelar este servicio?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#6A64F1',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, ¡cancelar!',
      cancelButtonText: 'No, mantener',
      buttonsStyling: true,
      customClass: {
        confirmButton: 'swal2-confirm btn my-bg-teal button-hover-teal text-white font-semibold py-2 px-4 rounded-md',
        cancelButton: 'swal2-cancel btn bg-red-500 text-white font-semibold py-2 px-4 rounded-md'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.changeServiceStatus('cancelled');
        if (estadoAnterior == 'accepted') {
          this.openRatingModal();
        }
        Swal.fire({
          title: '¡Cancelado!',
          text: 'El servicio ha sido cancelado correctamente',
          icon: 'success',
          confirmButtonColor: '#6A64F1',
          customClass: {
            confirmButton: 'swal2-confirm btn my-bg-teal button-hover-teal text-white font-semibold py-2 px-4 rounded-md'
          }
        });
      }
    });
  }

  startService(): void {
    this.changeServiceStatus('in_progress');
  }

  completeService(): void {
    this.changeServiceStatus('completed');
    this.openRatingModal();
  }

  confirmCashPayment(): void {
    if (this.service) {
      this.servicioService.confirmCashPayment(this.service.id, this.userRole).subscribe({
        next: (updatedService) => {
          this.service = updatedService;
          this.alertService.success('Pago en efectivo confirmado');
        },
        error: (err) => {
          this.alertService.error('Error al confirmar el pago');
        }
      });
    }
  }

  openRatingModal(): void {
    const modal = document.getElementById('valorarServicioModal');
    if (modal) {
      modal.classList.remove('hidden');
    }
  }

  calculateHours(startTime: string | Date, endTime: string | Date): number {
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 0;
    }
    const diffMs = end.getTime() - start.getTime();
    return Math.round(diffMs / (1000 * 60 * 60)); // Convertir a horas
  }

  canStartService(): boolean {
    if (!this.service?.start_time) return false;
    let startTime = new Date(this.service.start_time);
    const offsetMinutes = startTime.getTimezoneOffset();
    startTime = new Date(startTime.getTime() + offsetMinutes * 60 * 1000);
    return this.currentTime >= startTime;
  }

  canCompleteServiceOrConfirmPayment(): boolean {
    if (!this.service?.end_time) return false;
    let endTime = new Date(this.service.end_time);
    const offsetMinutes = endTime.getTimezoneOffset();
    endTime = new Date(endTime.getTime() + offsetMinutes * 60 * 1000);
    return this.currentTime >= endTime;
  }
}