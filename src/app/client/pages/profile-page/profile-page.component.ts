import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { delay, switchMap } from 'rxjs';
import { AuthService } from '../../../auth/services/auth.service';
import { ClientService } from '../../../client/services/client.service';
import { Client, WorkerComment } from '../../../client/interfaces/client.interface';


@Component({
  selector: 'client-profile-page',
  standalone: false,
  templateUrl: './profile-page.component.html',
})
export class ProfilePageComponent implements OnInit {
  public client?: Client;
  public selfProfile: boolean = false;
  public paymentMethods: any[] = [];
  public comments: WorkerComment[] = [];

  constructor(
    private clientService: ClientService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.activatedRoute.params
      .pipe(
        delay(800),
        switchMap(({ id }) => {
          const token = localStorage.getItem('token');
          let idBuscar = id;
          if (!id || (id == token)) {
            this.selfProfile = true;
            idBuscar = token;
          }

          return this.clientService.getClienteById(idBuscar);
        })
      ).subscribe({
        next: (response) => {
          this.client = response.client;
          this.comments = response.comments;
        },
        error: (err) => {
          this.router.navigate(['/']);
          console.error('Error:', err);
        }
      });
  }

  leave(): void {
    this.router.navigateByUrl('/');
  }
}