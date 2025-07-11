import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, GuardResult, MaybeAsync, Route, Router, RouterStateSnapshot, UrlSegment } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { delay, Observable, tap } from 'rxjs';

@Injectable({providedIn: 'root'})
export class AuthGuard {
    constructor(
        private authService: AuthService,
        private router:Router
    ) { }
    
    
    private checkAuthStatus(): boolean | Observable<boolean>{
        return this.authService.checkAuthenticacion()
        .pipe(
            tap( isAuthenticated => {
                if (isAuthenticated) {
                    return true;
                }
                return this.router.createUrlTree(['auth/login']);
            })
        )  
    }

    
    canMatch(route: Route, segments: UrlSegment[]): MaybeAsync<GuardResult> {
        return this.checkAuthStatus(); 
    }
     
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<GuardResult> {
        return this.checkAuthStatus();
    }
    
}