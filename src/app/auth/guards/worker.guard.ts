import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, tap, catchError, delay } from 'rxjs/operators';
import { AuthService } from '../../auth/services/auth.service'; // Ajusta la ruta

@Injectable({ providedIn: 'root' })
export class WorkerGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.checkAuthenticacion().pipe(
      delay(500),
      tap(isAuthenticated => console.log('WorkerGuard: isAuthenticated =', isAuthenticated)),
      map(isAuthenticated => {
        if (!isAuthenticated) {
          this.router.navigate(['/auth/login']);
          return false;
        }
        const user = this.authService.currentUser;
        const role = user?.rol || this.authService.decrypt(localStorage.getItem('r') || '');
        console.log('WorkerGuard: role =', role);
        const isWorker = role === 'worker';
        if (!isWorker) {
          this.router.navigate(['/services/list']);
          return false;
        }
        return true; // Asumimos que el componente maneja la lógica de "propio perfil"
      }),
      catchError(() => {
        this.router.navigate(['/auth/login']);
        return of(false);
      })
    );
  }
}