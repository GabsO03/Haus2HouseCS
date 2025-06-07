import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, switchMap } from 'rxjs';
import { ServicesTypes } from '../../../servicio/interfaces/servicesTypes.interface';
import { ServicioService } from '../../../servicio/services/servicio.service';
import { AuthService } from '../../../auth/services/auth.service';
import { AlertService } from '../../../shared/services/alert.service';
import { ServiceTemplate } from '../../interfaces/service-template';
import { ClientService } from '../../../client/services/client.service';

@Component({
  selector: 'service-request-page',
  standalone: false,
  templateUrl: './service-request-page.component.html',
  styles: ``
})
export class ServiceRequestPageComponent implements OnInit {
  public serviceForm: FormGroup;
  public newService: FormControl = new FormControl('');
  public existingServices: ServicesTypes[] = [];
  public showServiceInput: boolean = false;
  public serviceSearchActive: boolean = false;
  public totalAmount: number = 0;
  public direccionDefault?:string;
  public today: string;
  public oneMonthFromToday: string;
  public cardAvailable: boolean = false;
  public isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private servicioService: ServicioService,
    private authService: AuthService,
    private clientService: ClientService,
    private alertService: AlertService,
    private router: Router
  ) {
    this.today = new Date().toISOString().split('T')[0];

    const oneMonthLater = new Date();
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
    this.oneMonthFromToday = oneMonthLater.toISOString().split('T')[0];

    // Validador personalizado para comparar start_time y end_time
    const timeValidator = (control: AbstractControl): ValidationErrors | null => {
      const date = control.get('date')?.value;
      const startTime = control.get('start_time')?.value;
      const endTime = control.get('end_time')?.value;

      if (!date || !startTime || !endTime) {
        return null; // Dejamos que Validators.required maneje los campos vacíos
      }

      const startDateTime = new Date(`${date}T${startTime}:00`);
      const endDateTime = new Date(`${date}T${endTime}:00`);

      if (endDateTime <= startDateTime) {
        return { endTimeBeforeStart: true };
      }
      return null;
    };

    // Nuevo validador para asegurar que la fecha no sea anterior a hoy
    const dateValidator = (control: AbstractControl): ValidationErrors | null => {
      const date = control.get('date')?.value;
      if (!date) {
        return null; // Dejamos que Validators.required maneje el campo vacío
      }

      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normaliza a medianoche para comparar solo la fecha

      if (selectedDate < today) {
        return { dateBeforeToday: true };
      }
      return null;
    };

    this.serviceForm = this.fb.group({
      service_type_id: [null, Validators.required],
      description: ['', [Validators.required, Validators.minLength(5)]],
      specifications: ['', [Validators.maxLength(255)]],
      date: ['', Validators.required],
      start_time: ['', Validators.required],
      end_time: ['', Validators.required],
      client_location: [this.direccionDefault, [Validators.required, Validators.minLength(5)]],
      payment_method: [null, Validators.required]
    }, { validators: [timeValidator, dateValidator] });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.direccionDefault = this.authService.currentUser!.direccion!;
      this.clientService.getClienteById(localStorage.getItem('token')!)
      .subscribe((clientResponse) => {
        const client = clientResponse.client;
        this.cardAvailable = !!client.stripe_customer_id;
        this.serviceForm.patchValue({
          client_location: this.direccionDefault,
          payment_method: this.cardAvailable ? 'card' : 'cash' // Establece dinámicamente
        });
      });
      this.serviceForm.patchValue({
        client_location: this.direccionDefault,
      });
    }, 500);
    this.rellenarServicesSelect();

    this.newService.valueChanges
      .pipe(
        debounceTime(500),
        switchMap(value => {
          if (!value) {
            this.rellenarServicesSelect();
            return [];
          }
          return this.servicioService.servicesTypes;
        })
      )
      .subscribe(services => {
        this.existingServices = services.filter(s => s.name.toLowerCase().includes(this.newService.value.toLowerCase())) || [];
      });

    // Calcular total_amount cuando cambien el tipo de servicio o las fechas
    this.serviceForm.get('service_type_id')?.valueChanges.subscribe(() => this.calculateTotalAmount());
    this.serviceForm.get('start_time')?.valueChanges.subscribe(() => this.calculateTotalAmount());
    this.serviceForm.get('end_time')?.valueChanges.subscribe(() => this.calculateTotalAmount());
    this.serviceForm.get('date')?.valueChanges.subscribe(() => this.calculateTotalAmount());
  }

  rellenarServicesSelect() {
    this.servicioService.servicesTypes.subscribe(services => {
      this.existingServices = services;
    });
  }

  getServiceName(serviceId: number): string {
    const service = this.existingServices.find(s => s.id === serviceId);
    return service ? service.name : 'Cargando...';
  }

  toggleServiceInput(): void {
    this.showServiceInput = !this.showServiceInput;
    this.serviceSearchActive = this.showServiceInput;
    if (this.showServiceInput) {
      setTimeout(() => document.getElementById('serviceInput')?.focus(), 0);
    }
  }

  onAddService(service?: ServicesTypes): void {
    if (!service && !this.newService.value) return;

    const serviceValue = service ? service : this.existingServices.find(s => s.name.toLowerCase() === this.newService.value.toLowerCase());

    if (serviceValue) {
      this.serviceForm.patchValue({ service_type_id: serviceValue.id });
    }

    this.newService.reset();
    this.rellenarServicesSelect();
    this.showServiceInput = false;
    this.serviceSearchActive = false;
  }

  calculateTotalAmount(): void {
    // Obtener los valores del formulario
    const date = this.serviceForm.get('date')?.value;
    const startTime = this.serviceForm.get('start_time')?.value;
    const endTime = this.serviceForm.get('end_time')?.value;
    const serviceTypeId = this.serviceForm.get('service_type_id')?.value;

    // Validar que todos los campos necesarios existan
    if (!date || !startTime || !endTime || !serviceTypeId) {
      this.totalAmount = 0;
      console.warn('Faltan campos requeridos para calcular el monto total');
      return;
    }

    // Buscar el tipo de servicio
    const serviceType = this.existingServices.find((s) => s.id === serviceTypeId);
    if (!serviceType) {
      this.totalAmount = 0;
      console.warn('Tipo de servicio no encontrado');
      return;
    }

    // Validar la tarifa base
    const baseRatePerHour = parseFloat(serviceType.base_rate_per_hour);
    if (isNaN(baseRatePerHour)) {
      this.totalAmount = 0;
      console.warn('La tarifa base no es un número válido');
      return;
    }

    try {
      // Combinar fecha y hora para crear objetos Date
      const startDateTime = new Date(`${date}T${startTime}:00`);
      const endDateTime = new Date(`${date}T${endTime}:00`);

      // Validar que las fechas sean válidas
      if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
        this.totalAmount = 0;
        console.warn('Fechas u horas inválidas');
        return;
      }

      // Validar que la hora de fin sea posterior a la hora de inicio
      if (endDateTime <= startDateTime) {
        this.totalAmount = 0;
        console.warn('La hora de fin debe ser posterior a la hora de inicio');
        return;
      }

      // Calcular la diferencia en horas
      const hours = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60);

      // Calcular el monto total
      this.totalAmount = baseRatePerHour * hours;
    } catch (error) {
      this.totalAmount = 0;
      console.error('Error al calcular el monto total:', error);
    }
  }

  get currentService(): ServiceTemplate {
    const clientId = localStorage.getItem('token');
    
    if (!clientId) {
      throw new Error('Client ID not available');
    }


    const date = this.serviceForm.value.date;
    const startTime = this.serviceForm.value.start_time;
    const endTime = this.serviceForm.value.end_time;

    // Combinar fecha con hora para crear start_time y end_time completos
    const startDateTime = new Date(`${date}T${startTime}:00Z`);
    const endDateTime = new Date(`${date}T${endTime}:00Z`);
    const requestTime = new Date();

    return {
      client_id: clientId,
      service_type_id: this.serviceForm.value.service_type_id,
      description: this.serviceForm.value.description,
      specifications: this.serviceForm.value.specifications || '',
      request_time: requestTime.toISOString(),
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      client_location: this.serviceForm.value.client_location,
      total_amount: this.totalAmount,
      payment_method: this.serviceForm.value.payment_method
    };
  }

  onSubmit(): void {
    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;

    console.log(this.currentService);

    this.servicioService.requestService(this.currentService).subscribe({
      next: (service) => {
        this.alertService.success('Servicio solicitado con éxito');
        this.router.navigate(['/services/list']);
        this.serviceForm.reset();
      },
      error: (err) => {
        this.alertService.error('Error al crear el servicio');
        // this.alertService.error(err.error.message);
        this.isLoading = false;
      }
    });
  }

  isValidField(field: string): boolean {
    const control = this.serviceForm.get(field);
    return !!control?.errors && control.touched;
  }

  getFieldError(field: string): string | null {
    const control = this.serviceForm.get(field);
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
        case 'endTimeBeforeStart':
          return `La hora de fin debe ser posterior a la hora de inicio`;
        case 'dateBeforeToday':
          return `La fecha no puede ser anterior a hoy`;
      }
    }
    return null;
  }

  hasTimeError(): boolean {
    return !!this.serviceForm.errors?.['endTimeBeforeStart'] && this.serviceForm.touched;
  }
}