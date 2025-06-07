import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { delay, switchMap } from 'rxjs';
import { AuthService } from '../../../auth/services/auth.service';
import { WorkerService } from '../../../worker/services/worker.service';
import { ClientComment, Worker } from '../../../worker/interfaces/worker.interface';
import { User } from '../../../auth/interfaces/user.interface';
import { ServicioService } from '../../../servicio/services/servicio.service';
import { ServicesTypes } from '../../../servicio/interfaces/servicesTypes.interface';

@Component({
  selector: 'worker-profile-page',
  standalone: false,
  templateUrl: './profile-page.component.html',
})
export class ProfilePageComponent {
  public worker?: Worker;
  // Esto es para ver si entran al perfil ajeno o su mismo perfil
  public selfProfile: boolean = false;
  public services: ServicesTypes[] = [];
  public comments: ClientComment[] = [];

  constructor(
    private workerService: WorkerService,
    private servicioService: ServicioService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.servicioService.servicesTypes.subscribe(services => {
      this.services = services;
    });

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

        return this.workerService.getWorkerById(idBuscar);
      })
    ).subscribe({
        next: (response) => {
          this.worker = response.worker;
          this.comments = response.comments;
        },
        error: (err) => {
          this.router.navigate(['/']);
          console.error('Error:', err);
        }
    });
  }

  getServiceNames(servicesId: string): string[] {
    try {
      const ids = servicesId.slice(1, -1).split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id));
      return ids
        .map(id => this.services.find(s => s.id === id)?.name || 'Desconocido')
        .filter(name => name !== 'Desconocido');
    } catch {
      return [];
    }
  }

  goAway(): void {
    this.router.navigateByUrl('/helper');
  }
}
