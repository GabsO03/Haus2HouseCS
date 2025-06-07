import { Injectable } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ActivatedRouteSnapshot, CanActivate, CanMatch, GuardResult, MaybeAsync, Route, Router, RouterStateSnapshot, UrlSegment } from '@angular/router';
import { map, Observable, tap } from 'rxjs';

@Injectable({providedIn: 'root'})
export class AlreadyLoggedService {
    constructor(
        private authService: AuthService,
        private router:Router
    ) { }
    
    private checkAuthStatus(): boolean | Observable<boolean>{
        return this.authService.checkAuthenticacion()
        .pipe(
            tap( isAuthenticated => {
                if (isAuthenticated ){
                    this.router.navigate(['/services'])
                }
            }),
            map( isAuthenticated => !isAuthenticated )
        )
    }

    canMatch(route: Route, segments: UrlSegment[]): MaybeAsync<GuardResult> {
        return this.checkAuthStatus();    
    }
        
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<GuardResult> {
        return this.checkAuthStatus();    
    }
    
}