import { Component, Inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, delay, map, switchMap } from 'rxjs';
import { ServicesTypes } from '../../../servicio/interfaces/servicesTypes.interface';
import { ServicioService } from '../../../servicio/services/servicio.service';
import { WorkerService } from '../../services/worker.service';
import { Worker } from '../../interfaces/worker.interface';
import { AlertService } from '../../../shared/services/alert.service';
import { FileUploadService } from '../../../services/file-upload.service';
import { WorkerTemplate } from '../../interfaces/workertemplate.interface';
import { GeocodeService } from '../../../services/geocode.service';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'worker-edit-worker-page',
  standalone: false,
  templateUrl: './edit-worker-page.component.html',
  styles: ``,
})
export class EditWorkerPageComponent implements OnInit {
  @ViewChild('mapContainer') mapContainerRef!: ElementRef;

  public workerForm: FormGroup;
  public newService: FormControl = new FormControl('');
  public existingServices: ServicesTypes[] = [];
  public showServiceInput: boolean = false;
  public serviceSearchActive: boolean = false;
  public worker?: Worker;
  public isLoading: boolean = true;
  public selectedFile: File | null = null;
  public profilePhotoUrl: string | null = null;
  public isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
  @ViewChild('serviceInput') serviceInputRef!: ElementRef;
@ViewChild('changePasswordModal') changePasswordModalRef!: ElementRef;
  constructor(
    private fb: FormBuilder,
    private servicioService: ServicioService,
    private workerService: WorkerService,
    private alertService: AlertService,
    private router: Router,
    private fileUploadService: FileUploadService,
    private geocodeService: GeocodeService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.workerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.maxLength(20)]],
      direccion: ['', [Validators.maxLength(255)]],
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}[A-Z]$/)]],
      services_id: this.fb.array([], Validators.required),
      bio: ['', Validators.required],
      active: [0, Validators.required],
      lat: [null],
      lng: [null],
    });
  }

  ngOnInit(): void {
    this.rellenarServicesSelect();
    this.loadWorkerData();

    this.newService.valueChanges
      .pipe(
        debounceTime(500),
        switchMap((value) =>
          this.servicioService.servicesTypes.pipe(
            map(services =>
              value
                ? services.filter((s) => s.name.toLowerCase().includes(value.toLowerCase()))
                : services
            )
          )
        )
      )
      .subscribe({
        next: (services) => {
          this.existingServices = services;
        },
        error: (err) => {
          console.error('Error al buscar servicios:', err);
          this.existingServices = [];
        }
      });
  }

  parsePostgresArray(services_id: string): number[] {
    if (!services_id || services_id === '{}') return [];
    if (!/^\{\d+(,\d+)*\}$/.test(services_id)) {
      console.error('Formato de array de PostgreSQL inválido:', services_id);
      return [];
    }
    return services_id
      .slice(1, -1)
      .split(',')
      .map(id => parseInt(id.trim(), 10))
      .filter(id => !isNaN(id));
  }

  loadWorkerData(): void {
    const userId = localStorage.getItem('token');
    if (!userId) {
      this.router.navigate(['/helper']);
      return;
    }
    this.workerService.getWorkerById(userId).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (!response.worker) {
          this.router.navigate(['/helper']);
          return;
        }
        const worker = response.worker;
        this.worker = worker;
        this.workerForm.patchValue({
          nombre: worker.user.nombre || '',
          email: worker.user.email || '',
          telefono: worker.user.telefono || '',
          direccion: worker.user.direccion || '',
          dni: worker.dni || '',
          bio: worker.bio || '',
          active: worker.active,
          lat: worker.user.latitude || null,
          lng: worker.user.longitude || null,
        });
        this.profilePhotoUrl = worker.user.profile_photo || null;

        const services = this.parsePostgresArray(worker.services_id);
        services.forEach((serviceId: number) => {
          (this.workerForm.get('services_id') as FormArray).push(this.fb.control(serviceId));
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.alertService.error('Error al cargar los datos del trabajador: ' + (err.error?.message || 'Error desconocido'));
        this.router.navigate(['/helper']);
      }
    });
  }

  rellenarServicesSelect() {
    this.servicioService.servicesTypes.subscribe((services) => {
      this.existingServices = services;
    });
  }

  get services(): FormArray {
    return this.workerForm.get('services_id') as FormArray;
  }

  getServiceName(serviceId: number): string {
    const service = this.existingServices.find((s) => s.id === serviceId);
    return service ? service.name : 'Cargando...';
  }

  toggleServiceInput(): void {
    this.showServiceInput = !this.showServiceInput;
    this.serviceSearchActive = this.showServiceInput;
    if (this.showServiceInput && this.serviceInputRef) {
      setTimeout(() => this.serviceInputRef.nativeElement.focus(), 0);
    }
  }

  onAddService(service?: ServicesTypes): void {
    if (!service && !this.newService.value) return;

    const serviceValue = service
      ? service
      : this.existingServices.find((s) => s.name.toLowerCase() === this.newService.value.toLowerCase());

    if (serviceValue) {
      const exists = this.services.controls.some((control) => control.value === serviceValue.id);
      if (!exists) {
        this.services.push(this.fb.control(serviceValue.id));
      }
    }

    this.newService.reset();
    this.rellenarServicesSelect();
    this.showServiceInput = false;
    this.serviceSearchActive = false;
  }

  onRemoveService(index: number): void {
    this.services.removeAt(index);
  }

  openChangePasswordModal(): void {
    if (!this.isBrowser) return;

    const modal = document.getElementById('changePasswordModal');
    if (modal) {
      modal.classList.remove('hidden');
    }
  }

  openChooseLocationModal(): void {
    if (!this.isBrowser) return;

    const modal = document.getElementById('chooseLocationModal');
    if (modal) {
      modal.classList.remove('hidden');
    }
  }

  handleLocationSelected(location: { address: string; lat: number; lng: number }): void {
    this.workerForm.patchValue({
      direccion: location.address,
      lat: location.lat,
      lng: location.lng,
    });
  }

  onFileSelected(event: Event): void {
    if (!this.isBrowser) return;

    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onSubmit(): void {
    if (this.workerForm.invalid) {
      this.workerForm.markAllAsTouched();
      return;
    }

    if (this.selectedFile) {
      this.fileUploadService.uploadFile(this.selectedFile).subscribe({
        next: (url) => {
          this.profilePhotoUrl = url;
          this.sendWorkerData(url);
        },
        error: (err) => {
          this.alertService.error('Error al subir la foto: ' + (err.message || 'Error desconocido'));
        },
      });
    } else {
      this.sendWorkerData(this.profilePhotoUrl ?? null);
    }
  }

  private sendWorkerData(profilePhotoUrl: string | null): void {
    const workerData: WorkerTemplate = {
      nombre: this.workerForm.value.nombre ?? '',
      email: this.workerForm.value.email ?? '',
      telefono: this.workerForm.value.telefono ?? null,
      direccion: this.workerForm.value.direccion ?? null,
      dni: this.workerForm.value.dni ?? '',
      services_id: this.workerForm.value.services_id ?? [],
      bio: this.workerForm.value.bio ?? '',
      active: this.workerForm.value.active,
      profile_photo: profilePhotoUrl,
      lat: this.workerForm.value.lat ?? null,
      lng: this.workerForm.value.lng ?? null,
    };

    this.workerService.updateWorkerProfile(workerData).subscribe({
      next: (worker) => {
        this.alertService.success(`${worker.user.nombre} actualizado!`);
        this.router.navigate(['/helper/profile']);
      },
      error: (err) => {
        this.alertService.error(err.error.message || 'Error desconocido');
      },
    });
  }

  isValidField(field: string): boolean {
    const control = this.workerForm.get(field);
    return !!control?.errors && control.touched;
  }

  getFieldError(field: string): string | null {
    const control = this.workerForm.get(field);
    if (!control?.errors) return null;

    const errors = control.errors;
    for (const key of Object.keys(errors)) {
      switch (key) {
        case 'required':
          return 'Este campo es requerido';
        case 'minlength':
          return `Mínimo ${errors[key].requiredLength} caracteres`;
        case 'maxlength':
          return `Máximo ${errors[key].requiredLength} caracteres`;
        case 'email':
          return 'Correo electrónico inválido';
        case 'pattern':
          return field === 'dni' ? 'DNI debe tener 8 dígitos y una letra' : 'Formato inválido';
      }
    }
    return null;
  }
}