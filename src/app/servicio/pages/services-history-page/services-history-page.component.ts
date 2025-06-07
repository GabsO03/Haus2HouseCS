import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { ServicioService } from '../../../servicio/services/servicio.service';
import { Service } from '../../../servicio/interfaces/service.interface';

@Component({
  selector: 'services-history-page',
  standalone: false,
  templateUrl: './services-history-page.component.html',
})
export class ServicesHistoryPageComponent implements OnInit {
  public services: Service[] = [];
  public isLoading = true;
  public userRole?: string;

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

    this.servicioService.serviceHistory().subscribe({
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