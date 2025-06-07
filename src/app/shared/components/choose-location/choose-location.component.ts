import { Component, EventEmitter, Inject, Input, OnInit, Output, PLATFORM_ID, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { GeocodeService } from '../../../services/geocode.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'shared-choose-location',
  standalone: false,
  templateUrl: './choose-location.component.html',
})

export class ChooseLocationComponent implements OnInit, OnDestroy {
  @Input() initialAddress: string = '';
  @Input() initialLat: number | null = null;
  @Input() initialLng: number | null = null;
  @Output() locationSelected = new EventEmitter<{ address: string, lat: number, lng: number }>();

  @ViewChild('mapContainer') mapContainerRef!: ElementRef;

  public locationForm: FormGroup;
  public isBrowser: boolean;
  private map: any | null = null;
  private marker: any | null = null;
  private searchSubject = new Subject<string>();
  private L: any;
  private defaultLocation = { lat: -12.0464, lng: -77.0428 };
  private searchSubscription: Subscription | null = null;

  constructor(
    private fb: FormBuilder,
    private geocodeService: GeocodeService,
    private alertService: AlertService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.locationForm = this.fb.group({
      address: [''],
    });
  }

  async ngOnInit(): Promise<void> {
    if (this.isBrowser) {
      this.L = await import('leaflet');
      this.locationForm.patchValue({ address: this.initialAddress });
      this.searchSubscription = this.searchSubject
        .pipe(debounceTime(500), distinctUntilChanged())
        .subscribe(query => this.searchAddress(query));
      if (this.initialLat && this.initialLng) {
        this.defaultLocation = { lat: this.initialLat, lng: this.initialLng };
        this.reverseGeocode(this.initialLat, this.initialLng);
      } else {
        this.getUserLocation();
      }
      setTimeout(() => this.initMap(), 100);
    }
  }

  ngOnDestroy(): void {
    if (this.isBrowser && this.map) {
      this.map.remove();
      this.map = null;
      this.marker = null;
    }
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
    this.searchSubject.complete();
  }

  initMap(): void {
    if (!this.isBrowser || !this.L || !this.mapContainerRef) return;

    this.map = this.L.map(this.mapContainerRef.nativeElement).setView(
      [this.defaultLocation.lat, this.defaultLocation.lng],
      12
    );

    this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.marker = this.L.marker(
      [this.defaultLocation.lat, this.defaultLocation.lng],
      { draggable: true }
    ).addTo(this.map);

    this.marker.on('dragend', () => {
      const position = this.marker.getLatLng();
      this.reverseGeocode(position.lat, position.lng);
    });

    this.map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      this.marker.setLatLng([lat, lng]);
      this.reverseGeocode(lat, lng);
    });

    setTimeout(() => this.map.invalidateSize(), 100);
  }

  getUserLocation(): void {
    if (!this.isBrowser || !navigator.geolocation) {
      this.alertService.error('La geolocalización no está soportada en este navegador');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        this.defaultLocation = { lat: latitude, lng: longitude };
        if (this.map && this.marker) {
          this.map.setView([latitude, longitude], 15);
          this.marker.setLatLng([latitude, longitude]);
        }
        this.reverseGeocode(latitude, longitude);
      },
      (error) => {
        console.error('Error obteniendo la ubicación:', error);
        let errorMessage = 'Error al obtener la ubicación';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permiso de geolocalización denegado';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Ubicación no disponible';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tiempo de espera agotado para obtener la ubicación';
            break;
        }
        this.alertService.error(errorMessage);

        if (this.map && this.marker) {
          this.map.setView([this.defaultLocation.lat, this.defaultLocation.lng], 12);
          this.marker.setLatLng([this.defaultLocation.lat, this.defaultLocation.lng]);
        }
      },
      { timeout: 10000, enableHighAccuracy: true } // Options: 10s timeout
    );
  }

  onSearchInput(): void {
    if (!this.isBrowser) return;
    const query = this.locationForm.get('address')?.value;
    this.searchSubject.next(query);
  }

  searchAddress(query: string): void {
    if (query.length < 3) return;

    this.geocodeService.geocode(query).subscribe({
      next: (response: any) => {
        console.log(response);
        if (response && response.length > 0) {
          const result = response[0];
          const lat = parseFloat(result.lat);
          const lng = parseFloat(result.lon);
          const address = result.display_name;

          if (this.isBrowser && this.map && this.marker) {
            this.map.setView([lat, lng], 15);
            this.marker.setLatLng([lat, lng]);
          }
          this.locationForm.patchValue({ address });
        } else {
          this.alertService.error('No se encontraron resultados para esa dirección');
        }
      },
      error: (error) => {
        console.error('Error en la búsqueda:', error);
        this.alertService.error('Error al buscar la dirección: ' + error);
      }
    });
  }

  reverseGeocode(lat: number, lng: number): void {
    this.geocodeService.reverseGeocode(lat, lng).subscribe({
      next: (response: any) => {
        if (response && response.display_name) {
          this.locationForm.patchValue({ address: response.display_name });
        } else {
          this.alertService.error('No se pudo obtener la dirección para las coordenadas');
        }
      },
      error: (error) => {
        console.error('Error en geocodificación inversa:', error);
        this.alertService.error('Error al obtener la dirección: ' + error);
      }
    });
  }

  saveLocation(): void {
    if (!this.marker) return;
    const position = this.marker.getLatLng();
    const address = this.locationForm.get('address')?.value || '';
    this.locationSelected.emit({
      address,
      lat: position.lat,
      lng: position.lng
    });
    this.closeModal();
  }

  closeModal(): void {
    const modal = document.getElementById('chooseLocationModal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }
}