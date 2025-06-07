import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, tap, catchError, delay } from 'rxjs/operators';
import { AuthService } from '../../auth/services/auth.service'; // Ajusta la ruta

@Injectable({ providedIn: 'root' })
export class ClientGuard implements CanActivate {
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
      tap(isAuthenticated => console.log('ClientGuard: isAuthenticated =', isAuthenticated)),
      map(isAuthenticated => {
        if (!isAuthenticated) {
          this.router.navigate(['/auth/login']);
          return false;
        }
        const user = this.authService.currentUser;
        const role = user?.rol || this.authService.decrypt(localStorage.getItem('r') || '');
        console.log('ClientGuard: role =', role);
        const isClient = role === 'client';
        if (!isClient) {
          this.router.navigate(['/services']);
          return false;
        }
        return true;
      }),
      catchError(() => {
        this.router.navigate(['/auth/login']);
        return of(false);
      })
    );
  }
}