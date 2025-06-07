import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { ServicioService } from '../../../servicio/services/servicio.service';
import { Service } from '../../../servicio/interfaces/service.interface';

@Component({
  selector: 'services-list-page',
  standalone: false,
  templateUrl: './services-list-page.component.html',
})
export class ServicesListPageComponent implements OnInit {
  public services: Service[] = [];
  public isLoading = true;
  public userRole?: string;
  public title?: string;

  constructor(
    private servicioService: ServicioService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.decrypt(localStorage.getItem('r')!);
    if (!this.userRole) {
      this.router.navigate(['/']);
      return;
    }

    switch (this.userRole) {
      case 'admin':
        this.title = 'Servicios vigentes';
        break;
      case 'worker':
        this.title = 'Servicios Pendientes';
        break;
      case 'client':
        this.title = 'Servicios Solicitados';
        break;
      default:
        break;
    }

    this.servicioService.pendingServices().subscribe({
      next: (services) => {
        this.services = services;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar servicios:', err);
        this.isLoading = false;
      }
    });
  }
}