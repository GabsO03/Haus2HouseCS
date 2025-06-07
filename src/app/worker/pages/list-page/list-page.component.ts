import { Component, OnInit } from '@angular/core';
import { WorkerService } from '../../services/worker.service';
import { ServicioService } from '../../../servicio/services/servicio.service';
import { Worker } from '../../interfaces/worker.interface';
import { ServicesTypes } from '../../../servicio/interfaces/servicesTypes.interface';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'worker-list-page',
  standalone: false,
  templateUrl: './list-page.component.html',
  styles: [`
    .rating-star {
      color: #FFD700;
    }
  `]
})
export class ListPageComponent implements OnInit {
  public workers: Worker[] = [];
  public filteredWorkers: Worker[] = [];
  public services: ServicesTypes[] = [];
  public searchControl = new FormControl('');
  public selectedWorkers = new Set<string>();
  public serviceSearchControl = new FormControl('');
  public showServiceDropdown = false;
  public isServiceInputFocused = false;
  public filteredServices: ServicesTypes[] = [];
  public existingServices: ServicesTypes[] = [];
  public selectedServiceId: string = '';
  public loading: boolean = false;

  constructor(
    private workerService: WorkerService,
    private servicioService: ServicioService,
  ) {}

  ngOnInit(): void {
    this.loading = true;
    // Cargar servicios
    this.servicioService.servicesTypes.subscribe(services => {
      this.services = services;
      this.existingServices = services;
      this.filteredServices = services;
    });

    // Cargar trabajadores iniciales
    this.workerService.getWorkers().subscribe(workers => {
      this.workers = workers;
      this.filteredWorkers = workers;
      this.loading = false;
    });

    // Búsqueda por nombre o email
    this.searchControl.valueChanges.pipe(debounceTime(300)).subscribe(() => {
      this.applyFilters();
    });

    // Búsqueda por servicio
    this.serviceSearchControl.valueChanges.pipe(debounceTime(300)).subscribe(searchTerm => {
      const term = searchTerm?.toLowerCase() || '';
      this.filteredServices = term
        ? this.existingServices.filter(s => s.name.toLowerCase().includes(term))
        : this.existingServices;
      this.showServiceDropdown = !!term || this.isServiceInputFocused;
    });

    
  }

  applyFilters(): void {
    const nameOrEmail = this.searchControl.value?.trim() || '';
    const selectedService = this.selectedServiceId || '';

    // Si ambos están vacíos, mostrar todos los trabajadores
    if (!nameOrEmail && !selectedService) {
      this.workerService.getWorkers().subscribe(workers => {
        this.filteredWorkers = workers;
      });
      return;
    }

    // Combinar nameOrEmail y selectedService en una sola cadena con coma
    const query = [nameOrEmail, selectedService].filter(Boolean).join(',');

    this.workerService.filterWorkers(query).subscribe(workers => {
      this.filteredWorkers = workers;
    });
  }

  resetFilters(): void {
    this.searchControl.setValue('');
    this.selectedServiceId = '';
    this.serviceSearchControl.setValue('');
    this.workerService.getWorkers().subscribe(workers => {
      this.filteredWorkers = workers;
    });
  }

  onServiceSelect(event: Event): void {
    const serviceId = (event.target as HTMLSelectElement).value;
    this.selectedServiceId = serviceId; // Guardar servicio seleccionado
    this.applyFilters(); // Aplicar filtros combinados
    this.showServiceDropdown = false;
    this.isServiceInputFocused = false;
    this.serviceSearchControl.reset();
    this.filteredServices = this.existingServices;
  }

  onServiceInputFocus(): void {
    this.isServiceInputFocused = true;
    this.showServiceDropdown = true;
  }

  onServiceInputBlur(): void {
    setTimeout(() => {
      this.isServiceInputFocused = false;
      this.showServiceDropdown = false;
    }, 200);
  }

  getServiceNames(services_id: string): string {
    try {
      const ids = services_id.slice(1, -1).split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id));
      return ids
        .map(id => this.services.find(s => s.id === id)?.name || 'Desconocido')
        .join(', ');
    } catch {
      return 'Sin habilidades';
    }
  }

  getRatingStars(rating: string): number {
    return parseFloat(rating) || 0;
  }

  filterWorkers(searchTerm: string): void {
    if (!searchTerm) {
      this.workerService.getWorkers().subscribe(workers => {
        this.filteredWorkers = workers;
      });
      return;
    }
    this.workerService.filterWorkers(searchTerm).subscribe(workers => {
      this.filteredWorkers = workers;
    });
  }

  toggleWorkerActivo(worker_id: string, activo: boolean): void {
    Swal.fire({
      title: `¿${activo ? 'Desactivar' : 'Activar'} trabajador?`,
      text: `¿Estás seguro de que quieres ${activo ? 'desactivar' : 'activar'} a este trabajador?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#6A64F1',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, ¡hazlo!',
      cancelButtonText: 'No, cancelar',
      buttonsStyling: true,
      customClass: {
        confirmButton: 'swal2-confirm btn my-bg-teal text-white font-semibold py-2 px-4 rounded-md',
        cancelButton: 'swal2-cancel btn bg-red-500 text-white font-semibold py-2 px-4 rounded-md'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.workerService.toggleWorkerActivo(worker_id).subscribe({
          next: (response) => {
            Swal.fire({
              title: '¡Hecho!',
              text: `Trabajador ${activo ? 'desactivado' : 'activado'} correctamente`,
              icon: 'success',
              confirmButtonColor: '#6A64F1',
              customClass: {
                confirmButton: 'swal2-confirm btn my-bg-teal text-white font-semibold py-2 px-4 rounded-md'
              }
            });
            setTimeout(() => {
              location.reload();
            }, 1000);
          },
          error: (err) => {
            Swal.fire({
              title: '¡Error!',
              text: err.error.message || 'Error al cambiar el estado del trabajador',
              icon: 'error',
              confirmButtonColor: '#6A64F1',
              customClass: {
                confirmButton: 'swal2-confirm btn my-bg-teal text-white font-semibold py-2 px-4 rounded-md'
              }
            });
            setTimeout(() => {
              location.reload();
            }, 1000);
          }
        });
      }
    });
  }
}