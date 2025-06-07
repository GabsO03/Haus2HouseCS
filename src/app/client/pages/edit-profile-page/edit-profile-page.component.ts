import { Component, Inject, OnInit, PLATFORM_ID, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, delay, distinctUntilChanged, Subject } from 'rxjs';
import { AlertService } from '../../../shared/services/alert.service';
import { FileUploadService } from '../../../services/file-upload.service';
import { Client } from '../../interfaces/client.interface';
import { ClientService } from '../../services/client.service';
import { ClientTemplate } from '../../interfaces/clientTemplate.interface';
import { GeocodeService } from '../../../services/geocode.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'customer-edit-profile-page',
  standalone: false,
  templateUrl: './edit-profile-page.component.html',
})
export class EditProfilePageComponent implements OnInit {
  @ViewChild('mapContainer') mapContainerRef!: ElementRef;

  public clientForm: FormGroup;
  public client?: Client;
  public isLoading: boolean = true;
  public selectedFile: File | null = null;
  public profilePhotoUrl: string | null = null;

  // This is new
  public isBrowser: boolean;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private alertService: AlertService,
    private router: Router,
    private fileUploadService: FileUploadService,

    // This is new
    @Inject(PLATFORM_ID) private platformId: Object

  ) {

    // This is new
    this.isBrowser = isPlatformBrowser(platformId);

    this.clientForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(255)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.maxLength(20)]],
      direccion: ['', [Validators.maxLength(255)]],

      // This is new
      lat: [null],
      lng: [null],

    });
  }

  
  ngOnInit(): void {
    this.loadClientData();
  }

  loadClientData(): void {
    const userId = localStorage.getItem('token');
    if (!userId) {
      this.router.navigate(['/customer']);
      return;
    }
    this.clientService
      .getClienteById(userId)
      .pipe(delay(800))
      .subscribe((response) => {
        this.isLoading = false;
        if (!response.client) {
          this.router.navigate(['/customer']);
          return;
        }
        const client = response.client;
        this.client = client;
        this.clientForm.patchValue({
          nombre: client.user.nombre || '',
          email: client.user.email || '',
          telefono: client.user.telefono || '',
          direccion: client.user.direccion || '',
          lat: client.user.latitude || null,
          lng: client.user.longitude || null,
        });
        this.profilePhotoUrl = client.user.profile_photo || null;
      });
  }
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const validTypes = ['image/jpeg', 'image/png'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (!validTypes.includes(file.type)) {
        this.alertService.error('Solo se permiten imágenes JPEG o PNG');
        return;
      }
      if (file.size > maxSize) {
        this.alertService.error('El archivo no puede exceder los 5MB');
        return;
      }
      this.selectedFile = file;
    }
  }


  onSubmit(): void {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;

    if (this.selectedFile) {
      this.fileUploadService.uploadFile(this.selectedFile).subscribe({
        next: (url) => {
          this.profilePhotoUrl = url;
          this.sendClientData(url);
        },
        error: (err) => {
          this.alertService.error('Error al subir la foto');
          this.isLoading = false;
        },
      });
    } else {
      this.sendClientData(this.profilePhotoUrl);
    }
  }

  private sendClientData(profilePhotoUrl: string | null): void {
    const clientData: ClientTemplate = {
      nombre: this.clientForm.value.nombre ?? '',
      email: this.clientForm.value.email ?? '',
      telefono: this.clientForm.value.telefono ?? null,
      direccion: this.clientForm.value.direccion ?? null,
      profile_photo: profilePhotoUrl,
      lat: this.clientForm.value.lat ?? null,
      lng: this.clientForm.value.lng ?? null,
    };

    if (!this.client?.id) {
      this.alertService.error('No se pudo identificar al cliente');
      return;
    }

    this.clientService.updateCliente(clientData).subscribe({
      next: (client) => {
        this.alertService.success(`${client.user.nombre} actualizado!`);
        setTimeout(() => {
          location.reload();
        }, 1500);
        this.isLoading = false;
      },
      error: (err) => {
        this.alertService.error(err.error.message || 'Error desconocido');
        this.isLoading = false;
      },
    });
  }

  
  openChooseLocationModal(): void {
    if (!this.isBrowser) return;

    const modal = document.getElementById('chooseLocationModal');
    if (modal) {
      modal.classList.remove('hidden');
    }
  }

  handleLocationSelected(location: { address: string, lat: number, lng: number }): void {
    this.clientForm.patchValue({
      direccion: location.address,
      lat: location.lat,
      lng: location.lng
    });
  }

  openChangePasswordModal(): void {
    // This is new
    if (!this.isBrowser) return;

    const modal = document.getElementById('changePasswordModal');
    if (modal) {
      modal.classList.remove('hidden');
    }
  }

  isValidField(field: string): boolean {
    const control = this.clientForm.get(field);
    return !!control?.errors && control.touched;
  }

  getFieldError(field: string): string | null {
    const control = this.clientForm.get(field);
    if (!control?.errors) return null;

    const errors = control.errors;
    for (const key of Object.keys(errors)) {
      switch (key) {
        case 'required':
          return 'Este campo es requerido';
        case 'maxlength':
          return `Máximo ${errors[key].requiredLength} caracteres`;
        case 'email':
          return 'Correo electrónico inválido';
      }
    }
    return null;
  }
}
