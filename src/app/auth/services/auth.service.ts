import { Injectable } from '@angular/core';
import { User } from '../interfaces/user.interface';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import * as CryptoJS from 'crypto-js';
import { environment } from '../../environments/environment.prod';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { Inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl: string = environment.baseURL!;
  private secretKey = environment.cryptoServiceKey!;
  private user?: User;

  constructor(
    private httpClient: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // if (isPlatformBrowser(this.platformId)) {
    //   this.checkAuthenticacion().subscribe();
    // }
  }

  signIn( user: User ): Observable<User> {
    return this.httpClient.post<any>(`${this.baseUrl}/register`, user)
    .pipe(
      map(resultado => resultado.data)
    );
  }
  changePassword(passwordData: any): Observable<any> {
    const userId = isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
    if (!userId) {
      return throwError(() => new Error('No user ID available'));
    }
    return this.httpClient.post(`${this.baseUrl}/users/${userId}/change-password-authorization`, passwordData);
  }

  get currentUser() : User|undefined {
    if ( !this.user ) return undefined;
    return structuredClone( this.user );
  }

  checkAuthenticacion(): Observable<boolean>{
    if (!isPlatformBrowser(this.platformId)) {
      return of(false); // Retorna false en el servidor
    }

    if (!localStorage.getItem('token')) return of(false);

    const token = localStorage.getItem('token');
    const url = `${this.baseUrl}/users/${token}`;

    return this.httpClient.get<any>(url).pipe(
      tap(user => this.user = user.data),
      map(user => !!user.data),
      catchError(err => of(false))
    );
  }

  login (email: string, password: string):Observable<User | false> {
    const body = { email, password };
    return this.httpClient.post<any>(`${this.baseUrl}/login`, body)
    .pipe(
      catchError((err) => of(false)),
      map( (respuesta) => {
        if (respuesta) {
          const user = respuesta.data.user;
          this.user = user;
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('token', user.id.toString());
            localStorage.setItem('r', this.encrypt(user.rol));
          }
          return user;
        }
      })
    );
  }

  logout () {
    this.user = undefined;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
    }
  }


  encrypt(text: string): string {
    if (isPlatformBrowser(this.platformId)) {
      return CryptoJS.AES.encrypt(text, this.secretKey).toString();
    }
    return '';
  }

  decrypt(encryptedText: string): string {
    if (isPlatformBrowser(this.platformId)) {
      const bytes = CryptoJS.AES.decrypt(encryptedText, this.secretKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    }
    return '';
  }
}
